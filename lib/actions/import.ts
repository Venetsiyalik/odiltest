"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { excelFayliniParseQilish, excelShablonYarat } from "@/lib/parsers/excel";
import { wordFayliniParseQilish } from "@/lib/parsers/word";

const MAX_FAYL_HAJMI = 10 * 1024 * 1024; // 10 MB (9-band)
const RUXSAT_ETILGAN_EXCEL_KENGAYTMALARI = [".xlsx", ".xls", ".csv"];
const RUXSAT_ETILGAN_WORD_KENGAYTMALARI = [".docx"];

export type ImportHolati = "tayyor" | "ogohlantirish" | "xato";

export interface ImportQatori {
  tartib: number;
  holati: ImportHolati;
  xabar?: string;
  matn: string;
  variantA: string;
  variantB: string;
  variantC: string;
  variantD: string;
  togriJavob: "A" | "B" | "C" | "D" | "";
  fanNomi: string;
  sinfNomi: string;
  mavzuNomi: string;
  qiyinlik: number;
  izoh: string;
}

export interface ImportTahliliNatijasi {
  xato?: string;
  qatorlar?: ImportQatori[];
}

export interface ImportXatosi {
  tartib: number;
  xabar: string;
}

export interface ImportTasdiqlashNatijasi {
  xato?: string;
  jami: number;
  qabulQilindi: number;
  xatoSoni: number;
  xatolar: ImportXatosi[];
}

function kengaytmaTogrimi(faylNomi: string, ruxsatEtilganlar: string[]): boolean {
  const nomi = faylNomi.toLowerCase();
  return ruxsatEtilganlar.some((k) => nomi.endsWith(k));
}

function normalizatsiya(matn: string): string {
  return matn.trim().toLowerCase().replace(/\s+/g, " ");
}

/** `.xlsx` shablon faylini ishlab chiqarib, base64 ko'rinishida qaytaradi (to'g'ridan-to'g'ri yuklab olish uchun). */
export async function shablonYuklabOlish(): Promise<{ base64: string; faylNomi: string }> {
  const buffer = excelShablonYarat();
  return { base64: buffer.toString("base64"), faylNomi: "savollar-shabloni.xlsx" };
}

/**
 * Bazadagi mavjud savol matnlari bilan solishtirish uchun normalizatsiya
 * qilingan matnlar ro'yxatini qaytaradi (faqat berilgan matnlar orasidan
 * mos kelganlarini).
 */
async function mavjudTakrorlarniTopish(
  matnlar: string[],
): Promise<Set<string>> {
  if (matnlar.length === 0) return new Set();
  const supabase = await createClient();
  const normallashganlar = matnlar.map(normalizatsiya);
  const { data, error } = await supabase
    .from("savollar")
    .select("matn_normallashgan")
    .in("matn_normallashgan", normallashganlar);
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((q) => q.matn_normallashgan as string));
}

// ----------------------------------------------------------------------------
// EXCEL / CSV
// ----------------------------------------------------------------------------

export async function excelFayliniTahlilQilish(formData: FormData): Promise<ImportTahliliNatijasi> {
  const fayl = formData.get("fayl");
  if (!(fayl instanceof File)) return { xato: "Fayl topilmadi" };
  if (fayl.size > MAX_FAYL_HAJMI) return { xato: "Fayl hajmi 10 MB dan katta bo'lmasin" };
  if (!kengaytmaTogrimi(fayl.name, RUXSAT_ETILGAN_EXCEL_KENGAYTMALARI)) {
    return { xato: "Faqat .xlsx, .xls yoki .csv fayl qabul qilinadi" };
  }

  const buffer = Buffer.from(await fayl.arrayBuffer());
  let xomQatorlar;
  try {
    xomQatorlar = excelFayliniParseQilish(buffer);
  } catch {
    return { xato: "Faylni o'qib bo'lmadi — format buzilgan bo'lishi mumkin" };
  }

  if (xomQatorlar.length === 0) {
    return { xato: "Faylda hech qanday savol topilmadi" };
  }

  const supabase = await createClient();
  const { data: fanlar } = await supabase.from("fanlar").select("id, nomi");
  const { data: sinflar } = await supabase.from("sinflar").select("id, nomi");
  const { data: mavzular } = await supabase.from("mavzular").select("id, nomi, fan_id, sinf_id");

  const fanXaritasi = new Map((fanlar ?? []).map((f) => [f.nomi.toLowerCase(), f]));
  const sinfXaritasi = new Map((sinflar ?? []).map((s) => [s.nomi.toLowerCase(), s]));
  const mavzularRoyxati = mavzular ?? [];

  const takrorlar = await mavjudTakrorlarniTopish(xomQatorlar.map((q) => q.matn));
  const shuFayldagiMatnlar = new Set<string>();

  const qatorlar: ImportQatori[] = xomQatorlar.map((xom) => {
    const ogohlantirishlar: string[] = [];
    let xatoXabari: string | undefined;

    if (!xom.matn) {
      xatoXabari = "savol matni yo'q";
    } else {
      const variantSoni = [xom.variantA, xom.variantB, xom.variantC, xom.variantD].filter(
        Boolean,
      ).length;
      if (variantSoni < 4) {
        xatoXabari = `faqat ${variantSoni} ta variant`;
      } else if (!["A", "B", "C", "D"].includes(xom.togriJavob)) {
        xatoXabari = "to'g'ri javob ko'rsatilmagan yoki noto'g'ri (A/B/C/D bo'lishi kerak)";
      } else if (!xom.fanNomi) {
        xatoXabari = "fan ko'rsatilmagan";
      } else if (!xom.sinfNomi) {
        xatoXabari = "sinf ko'rsatilmagan";
      } else if (!sinfXaritasi.has(xom.sinfNomi.toLowerCase())) {
        xatoXabari = `sinf topilmadi: "${xom.sinfNomi}"`;
      }
    }

    if (!xatoXabari) {
      if (!fanXaritasi.has(xom.fanNomi.toLowerCase())) {
        ogohlantirishlar.push(`yangi fan yaratiladi: "${xom.fanNomi}"`);
      }
      if (xom.mavzuNomi) {
        const fan = fanXaritasi.get(xom.fanNomi.toLowerCase());
        const sinf = sinfXaritasi.get(xom.sinfNomi.toLowerCase());
        const mavzuBorMi =
          fan &&
          sinf &&
          mavzularRoyxati.some(
            (m) =>
              m.fan_id === fan.id &&
              m.sinf_id === sinf.id &&
              m.nomi.toLowerCase() === xom.mavzuNomi.toLowerCase(),
          );
        if (!mavzuBorMi) {
          ogohlantirishlar.push(`yangi mavzu yaratiladi: "${xom.mavzuNomi}"`);
        }
      }

      const norm = normalizatsiya(xom.matn);
      if (takrorlar.has(norm) || shuFayldagiMatnlar.has(norm)) {
        ogohlantirishlar.push("bazada yoki shu faylda shunga o'xshash savol bor");
      }
      shuFayldagiMatnlar.add(norm);
    }

    const qiyinlikRaqami = Number.parseInt(xom.qiyinlik, 10);
    const qiyinlik =
      Number.isFinite(qiyinlikRaqami) && qiyinlikRaqami >= 1 && qiyinlikRaqami <= 5
        ? qiyinlikRaqami
        : 1;

    return {
      tartib: xom.tartib,
      holati: xatoXabari ? "xato" : ogohlantirishlar.length > 0 ? "ogohlantirish" : "tayyor",
      xabar: xatoXabari ?? (ogohlantirishlar.length > 0 ? ogohlantirishlar.join("; ") : undefined),
      matn: xom.matn,
      variantA: xom.variantA,
      variantB: xom.variantB,
      variantC: xom.variantC,
      variantD: xom.variantD,
      togriJavob: (["A", "B", "C", "D"].includes(xom.togriJavob) ? xom.togriJavob : "") as
        | "A"
        | "B"
        | "C"
        | "D"
        | "",
      fanNomi: xom.fanNomi,
      sinfNomi: xom.sinfNomi,
      mavzuNomi: xom.mavzuNomi,
      qiyinlik,
      izoh: xom.izoh,
    };
  });

  return { qatorlar };
}

// ----------------------------------------------------------------------------
// WORD
// ----------------------------------------------------------------------------

export async function wordFayliniTahlilQilish(
  formData: FormData,
  fanId: number,
  sinfId: number,
  mavzuId: number | null,
): Promise<ImportTahliliNatijasi> {
  const fayl = formData.get("fayl");
  if (!(fayl instanceof File)) return { xato: "Fayl topilmadi" };
  if (fayl.size > MAX_FAYL_HAJMI) return { xato: "Fayl hajmi 10 MB dan katta bo'lmasin" };
  if (!kengaytmaTogrimi(fayl.name, RUXSAT_ETILGAN_WORD_KENGAYTMALARI)) {
    return { xato: "Faqat .docx fayl qabul qilinadi" };
  }

  const supabase = await createClient();
  const [{ data: fan }, { data: sinf }, { data: mavzu }] = await Promise.all([
    supabase.from("fanlar").select("nomi").eq("id", fanId).single(),
    supabase.from("sinflar").select("nomi").eq("id", sinfId).single(),
    mavzuId
      ? supabase.from("mavzular").select("nomi").eq("id", mavzuId).single()
      : Promise.resolve({ data: null }),
  ]);

  if (!fan || !sinf) return { xato: "Fan yoki sinf topilmadi" };

  const buffer = Buffer.from(await fayl.arrayBuffer());
  let xomSavollar;
  try {
    xomSavollar = await wordFayliniParseQilish(buffer);
  } catch {
    return { xato: "Faylni o'qib bo'lmadi — .docx formatida ekanligini tekshiring" };
  }

  if (xomSavollar.length === 0) {
    return {
      xato:
        "Faylda hech qanday savol topilmadi — format \"1. Savol matni\" bilan boshlanishi kerak",
    };
  }

  const takrorlar = await mavjudTakrorlarniTopish(xomSavollar.map((q) => q.matn));
  const shuFayldagiMatnlar = new Set<string>();

  const qatorlar: ImportQatori[] = xomSavollar.map((xom) => {
    let xabar = xom.xato;

    if (!xabar) {
      const norm = normalizatsiya(xom.matn);
      if (takrorlar.has(norm) || shuFayldagiMatnlar.has(norm)) {
        xabar = "bazada yoki shu faylda shunga o'xshash savol bor";
      }
      shuFayldagiMatnlar.add(norm);
    }

    return {
      tartib: xom.tartib,
      holati: xom.xato ? "xato" : xabar ? "ogohlantirish" : "tayyor",
      xabar,
      matn: xom.matn,
      variantA: xom.variantA ?? "",
      variantB: xom.variantB ?? "",
      variantC: xom.variantC ?? "",
      variantD: xom.variantD ?? "",
      togriJavob: xom.togriJavob ?? "",
      fanNomi: fan.nomi,
      sinfNomi: sinf.nomi,
      mavzuNomi: mavzu?.nomi ?? "",
      qiyinlik: 1,
      izoh: "",
    };
  });

  return { qatorlar };
}

// ----------------------------------------------------------------------------
// TASDIQLASH (bazaga yozish)
// ----------------------------------------------------------------------------

async function fanIdIniOlish(
  supabase: Awaited<ReturnType<typeof createClient>>,
  keshi: Map<string, number>,
  nomi: string,
): Promise<number> {
  const kalit = nomi.toLowerCase();
  const keshdagi = keshi.get(kalit);
  if (keshdagi) return keshdagi;

  const { data: mavjud } = await supabase
    .from("fanlar")
    .select("id")
    .ilike("nomi", nomi)
    .maybeSingle();
  if (mavjud) {
    keshi.set(kalit, mavjud.id);
    return mavjud.id;
  }

  const { data: yangi, error } = await supabase
    .from("fanlar")
    .insert({ nomi })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  keshi.set(kalit, yangi.id);
  return yangi.id;
}

async function sinfIdIniTopish(
  supabase: Awaited<ReturnType<typeof createClient>>,
  keshi: Map<string, number>,
  nomi: string,
): Promise<number | null> {
  const kalit = nomi.toLowerCase();
  const keshdagi = keshi.get(kalit);
  if (keshdagi) return keshdagi;

  const { data } = await supabase.from("sinflar").select("id").ilike("nomi", nomi).maybeSingle();
  if (data) keshi.set(kalit, data.id);
  return data?.id ?? null;
}

async function mavzuIdIniOlish(
  supabase: Awaited<ReturnType<typeof createClient>>,
  keshi: Map<string, number>,
  fanId: number,
  sinfId: number,
  nomi: string,
): Promise<number> {
  const kalit = `${fanId}:${sinfId}:${nomi.toLowerCase()}`;
  const keshdagi = keshi.get(kalit);
  if (keshdagi) return keshdagi;

  const { data: mavjud } = await supabase
    .from("mavzular")
    .select("id")
    .eq("fan_id", fanId)
    .eq("sinf_id", sinfId)
    .ilike("nomi", nomi)
    .maybeSingle();
  if (mavjud) {
    keshi.set(kalit, mavjud.id);
    return mavjud.id;
  }

  const { data: yangi, error } = await supabase
    .from("mavzular")
    .insert({ fan_id: fanId, sinf_id: sinfId, nomi })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  keshi.set(kalit, yangi.id);
  return yangi.id;
}

export async function importniTasdiqlash(
  turi: "excel" | "word",
  faylNomi: string,
  jamiSavolSoni: number,
  tasdiqlanganQatorlar: ImportQatori[],
  boshqaXatolar: ImportXatosi[],
): Promise<ImportTasdiqlashNatijasi> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fanKeshi = new Map<string, number>();
  const sinfKeshi = new Map<string, number>();
  const mavzuKeshi = new Map<string, number>();

  const xatolar: ImportXatosi[] = [...boshqaXatolar];
  let qabulQilindi = 0;

  for (const qator of tasdiqlanganQatorlar) {
    try {
      const fanId = await fanIdIniOlish(supabase, fanKeshi, qator.fanNomi);
      const sinfId = await sinfIdIniTopish(supabase, sinfKeshi, qator.sinfNomi);
      if (!sinfId) {
        xatolar.push({ tartib: qator.tartib, xabar: `sinf topilmadi: "${qator.sinfNomi}"` });
        continue;
      }
      const mavzuId = qator.mavzuNomi
        ? await mavzuIdIniOlish(supabase, mavzuKeshi, fanId, sinfId, qator.mavzuNomi)
        : null;

      const { error } = await supabase.from("savollar").insert({
        fan_id: fanId,
        sinf_id: sinfId,
        mavzu_id: mavzuId,
        matn: qator.matn,
        variant_a: qator.variantA,
        variant_b: qator.variantB,
        variant_c: qator.variantC,
        variant_d: qator.variantD,
        togri_javob: qator.togriJavob,
        qiyinlik: qator.qiyinlik,
        izoh: qator.izoh || null,
        created_by: user?.id ?? null,
      });

      if (error) {
        xatolar.push({ tartib: qator.tartib, xabar: error.message });
      } else {
        qabulQilindi++;
      }
    } catch (xatoObyekti) {
      xatolar.push({
        tartib: qator.tartib,
        xabar: xatoObyekti instanceof Error ? xatoObyekti.message : "noma'lum xato",
      });
    }
  }

  await supabase.from("importlar").insert({
    foydalanuvchi_id: user?.id ?? null,
    fayl_nomi: faylNomi,
    turi,
    jami: jamiSavolSoni,
    qabul_qilindi: qabulQilindi,
    xato_soni: xatolar.length,
    xatolar: xatolar.length > 0 ? xatolar : null,
  });

  revalidatePath("/admin/savollar");

  return {
    jami: jamiSavolSoni,
    qabulQilindi,
    xatoSoni: xatolar.length,
    xatolar,
  };
}
