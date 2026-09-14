"use server";

import { createClient } from "@/lib/supabase/server";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { xpBerish } from "@/lib/redizayn/gamifikatsiya";
import type { Variant } from "@/lib/talaba/aralashtirish";

export type GildirakVariant = Variant;

export interface GildirakSavoli {
  id: number;
  matn: string;
  rasmUrl: string | null;
  variantA: string;
  variantB: string;
  variantC: string;
  variantD: string;
  togriJavob: GildirakVariant;
  izoh: string | null;
  mavzuId: number | null;
  mavzuNomi: string | null;
  uygaVazifa: string | null;
}

export interface GildirakSavollarNatijasi {
  xato?: string;
  savollar?: GildirakSavoli[];
}

/**
 * smart-test.md/bilim-gildiragi.md bilan bir xil qaror: to'g'ri javob shu
 * yerdan klientga yuboriladi, shuning uchun faqat login qilgan admin/
 * o'qituvchiga ochiq va mavjud `savollar` RLS siyosati (biriktirilgan
 * fan+sinf) orqali tabiiy ravishda cheklanadi (10-bo'lim).
 */
export async function gildirakSavollariniOl(
  fanId: number,
  sinfId: number,
  mavzuIdlar: number[],
): Promise<GildirakSavollarNatijasi> {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) return { xato: "Ruxsat yo'q" };

  const supabase = await createClient();

  let so_rov = supabase
    .from("savollar")
    .select(
      "id, matn, rasm_url, variant_a, variant_b, variant_c, variant_d, togri_javob, izoh, mavzu_id",
    )
    .eq("fan_id", fanId)
    .eq("sinf_id", sinfId)
    .eq("faol", true);

  if (mavzuIdlar.length > 0) {
    so_rov = so_rov.in("mavzu_id", mavzuIdlar);
  }

  const { data, error } = await so_rov;
  if (error) return { xato: error.message };

  const mavzuIdlariTopilgan = Array.from(
    new Set((data ?? []).map((s) => s.mavzu_id).filter((id): id is number => id != null)),
  );

  const mavzuXaritasi = new Map<number, { nomi: string; uygaVazifa: string | null }>();
  if (mavzuIdlariTopilgan.length > 0) {
    const { data: mavzular } = await supabase
      .from("mavzular")
      .select("id, nomi, uyga_vazifa")
      .in("id", mavzuIdlariTopilgan);
    for (const m of mavzular ?? []) {
      mavzuXaritasi.set(m.id, { nomi: m.nomi, uygaVazifa: m.uyga_vazifa });
    }
  }

  const savollar: GildirakSavoli[] = (data ?? []).map((s) => {
    const mavzu = s.mavzu_id ? mavzuXaritasi.get(s.mavzu_id) : undefined;
    return {
      id: s.id,
      matn: s.matn,
      rasmUrl: s.rasm_url,
      variantA: s.variant_a,
      variantB: s.variant_b,
      variantC: s.variant_c,
      variantD: s.variant_d,
      togriJavob: s.togri_javob as GildirakVariant,
      izoh: s.izoh,
      mavzuId: s.mavzu_id,
      mavzuNomi: mavzu?.nomi ?? null,
      uygaVazifa: mavzu?.uygaVazifa ?? null,
    };
  });

  return { savollar };
}

export interface GildirakSessiyaBoshlashNatijasi {
  xato?: string;
  sessiyaId?: number;
}

export async function gildirakSessiyasiniBoshlash(
  sinfId: number,
  fanId: number,
): Promise<GildirakSessiyaBoshlashNatijasi> {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) return { xato: "Ruxsat yo'q" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gildirak_sessiyalar")
    .insert({ oqituvchi_id: foydalanuvchi.id, sinf_id: sinfId, fan_id: fanId })
    .select("id")
    .single();

  if (error) return { xato: error.message };
  return { sessiyaId: data.id };
}

/**
 * Har bir urinishdan keyin (to'g'ri yoki xato) chaqiriladi — 2.3-band:
 * "xato javobdan keyin ham o'quvchi bir narsa yutadi", +5 XP har doim.
 * Baho faqat to'g'ri javobda va faqat "tasdiqlash bilan yoziladi" rejimida
 * ma'noli — bu yerda `tasdiqlandi=false` bilan yoziladi, sessiya oxirida
 * o'qituvchi tasdiqlagandan keyin `gildirakSessiyaniYakunlash` orqali
 * yakunlanadi (8-bo'lim: avtomatik emas).
 */
export async function gildirakNatijasiniYozish(
  sessiyaId: number,
  oquvchiId: number,
  savolId: number | null,
  raqam: number,
  togri: boolean,
): Promise<{ xato?: string }> {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) return { xato: "Ruxsat yo'q" };

  const supabase = await createClient();
  const { error } = await supabase.from("gildirak_natijalar").insert({
    sessiya_id: sessiyaId,
    oquvchi_id: oquvchiId,
    savol_id: savolId,
    raqam,
    togri,
    baho: togri ? 5 : null,
  });
  if (error) return { xato: error.message };

  await xpBerish(oquvchiId, 5, "gildirak_urinish").catch(() => {
    // gamifikatsiya xatosi g'ildirak sessiyasini to'xtatmasin
  });

  return {};
}

/**
 * Xato javobdan keyin — 6.4-bo'lim tartibi bo'yicha yordam topshirig'i
 * matnini tuzadi (uyga_vazifa bo'lsa o'shani, aks holda umumiy taklif) va
 * o'quvchining shaxsiy kabinetiga yozadi.
 */
export async function gildirakYordamTopshirigiYaratish(
  oquvchiId: number,
  mavzuId: number | null,
  matn: string,
): Promise<{ xato?: string; topshiriqId?: number }> {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) return { xato: "Ruxsat yo'q" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("yordam_topshiriqlari")
    .insert({ oquvchi_id: oquvchiId, mavzu_id: mavzuId, matn, manba: "gildirak" })
    .select("id")
    .single();
  if (error) return { xato: error.message };
  return { topshiriqId: data.id };
}

export interface GildirakYakunSatri {
  natijaId: number;
  oquvchiId: number;
  oquvchiIsmi: string;
  baho: number | null;
}

export interface GildirakYakunNatijasi {
  xato?: string;
  javobBerganlarSoni: number;
  togriSoni: number;
  yordamSoni: number;
  baholar: GildirakYakunSatri[];
}

export async function gildirakYakuniniOl(sessiyaId: number): Promise<GildirakYakunNatijasi> {
  const bosh: GildirakYakunNatijasi = {
    javobBerganlarSoni: 0,
    togriSoni: 0,
    yordamSoni: 0,
    baholar: [],
  };

  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) return { ...bosh, xato: "Ruxsat yo'q" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gildirak_natijalar")
    .select("id, oquvchi_id, togri, baho, oquvchilar(ism_familiya)")
    .eq("sessiya_id", sessiyaId);

  if (error) return { ...bosh, xato: error.message };

  const qatorlar = (data ?? []) as unknown as Array<{
    id: number;
    oquvchi_id: number;
    togri: boolean;
    baho: number | null;
    oquvchilar: { ism_familiya: string } | null;
  }>;

  return {
    javobBerganlarSoni: qatorlar.length,
    togriSoni: qatorlar.filter((q) => q.togri).length,
    yordamSoni: qatorlar.filter((q) => !q.togri).length,
    baholar: qatorlar
      .filter((q) => q.baho != null)
      .map((q) => ({
        natijaId: q.id,
        oquvchiId: q.oquvchi_id,
        oquvchiIsmi: q.oquvchilar?.ism_familiya ?? "",
        baho: q.baho,
      })),
  };
}

export async function gildirakBahoniOzgartirish(
  natijaId: number,
  baho: number | null,
): Promise<{ xato?: string }> {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) return { xato: "Ruxsat yo'q" };

  const supabase = await createClient();
  const { error } = await supabase.from("gildirak_natijalar").update({ baho }).eq("id", natijaId);
  if (error) return { xato: error.message };
  return {};
}

/**
 * "Jurnalga yozish" — 8-bo'lim: baho faqat shu tugma bosilgandan keyin
 * yakuniy hisoblanadi (`tasdiqlandi=true`). Mavjud rasmiy baholash
 * pipeline'iga (urinishlar/natijalar) HECH TEGILMAYDI — bu o'z-o'zicha
 * yopiq statistika, faqat shu modul doirasida "tasdiqlangan" deb belgilanadi.
 */
export async function gildirakSessiyaniYakunlash(
  sessiyaId: number,
): Promise<{ xato?: string }> {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) return { xato: "Ruxsat yo'q" };

  const supabase = await createClient();
  await supabase
    .from("gildirak_natijalar")
    .update({ tasdiqlandi: true })
    .eq("sessiya_id", sessiyaId)
    .not("baho", "is", null);

  const { error } = await supabase
    .from("gildirak_sessiyalar")
    .update({ tugadi: new Date().toISOString(), jurnalga_yozildi: true })
    .eq("id", sessiyaId);

  if (error) return { xato: error.message };
  return {};
}

/** Faqat "ekranda ko'rsatiladi, yozilmaydi" rejimida — sessiyani baho
 * tasdiqlashsiz yopadi. */
export async function gildirakSessiyaniBekorYopish(sessiyaId: number): Promise<{ xato?: string }> {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) return { xato: "Ruxsat yo'q" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("gildirak_sessiyalar")
    .update({ tugadi: new Date().toISOString(), jurnalga_yozildi: false })
    .eq("id", sessiyaId);

  if (error) return { xato: error.message };
  return {};
}
