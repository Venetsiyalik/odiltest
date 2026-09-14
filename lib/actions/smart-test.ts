"use server";

import { createClient } from "@/lib/supabase/server";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { sinfDarajasi } from "@/lib/redizayn/daraja";

export type SmartTestVariant = "A" | "B" | "C" | "D";

export interface SmartTestSavoli {
  id: number;
  matn: string;
  rasmUrl: string | null;
  variantA: string;
  variantB: string;
  variantC: string;
  variantD: string;
  togriJavob: SmartTestVariant;
  izoh: string;
  izohQisqa: string | null;
  izohRasmUrl: string | null;
  mavzuId: number | null;
}

export interface SmartTestSavollarNatijasi {
  xato?: string;
  savollar?: SmartTestSavoli[];
}

/**
 * smart-test.md 10-bo'lim: bu funksiya to'g'ri javobni ("togriJavob") ham
 * qaytaradi — Rasmiy test API'si buni ISHLATMAYDI (xavfsizlik qoidasi #1
 * o'sha yerda buzilmasdan qoladi). Shu sababli faqat login qilgan admin/
 * o'qituvchiga ochiq (talaba tomonining kodsiz Dashboard'idan emas,
 * `/admin` panelidan chaqiriladi) va mavjud `savollar` RLS siyosati
 * (biriktirilgan fan+sinf) orqali tabiiy ravishda cheklanadi.
 */
export async function smartTestSavollariniOl(
  fanId: number,
  daraja: number,
  mavzuIdlar: number[],
): Promise<SmartTestSavollarNatijasi> {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) return { xato: "Ruxsat yo'q" };

  const supabase = await createClient();
  const { data: sinflar } = await supabase.from("sinflar").select("id, nomi");
  const sinfIdlari = (sinflar ?? [])
    .filter((s) => sinfDarajasi(s.nomi) === daraja)
    .map((s) => s.id);
  if (sinfIdlari.length === 0) {
    return { xato: `${daraja}-sinf uchun sinf-guruh topilmadi` };
  }

  let so_rov = supabase
    .from("savollar")
    .select(
      "id, matn, rasm_url, variant_a, variant_b, variant_c, variant_d, togri_javob, izoh, izoh_qisqa, izoh_rasm_url, mavzu_id",
    )
    .eq("fan_id", fanId)
    .in("sinf_id", sinfIdlari)
    .eq("faol", true)
    .not("izoh", "is", null);

  if (mavzuIdlar.length > 0) {
    so_rov = so_rov.in("mavzu_id", mavzuIdlar);
  }

  const { data, error } = await so_rov;
  if (error) return { xato: error.message };

  const savollar: SmartTestSavoli[] = (data ?? [])
    .filter((s) => s.izoh && s.izoh.trim().length > 0)
    .map((s) => ({
      id: s.id,
      matn: s.matn,
      rasmUrl: s.rasm_url,
      variantA: s.variant_a,
      variantB: s.variant_b,
      variantC: s.variant_c,
      variantD: s.variant_d,
      togriJavob: s.togri_javob as SmartTestVariant,
      izoh: s.izoh as string,
      izohQisqa: s.izoh_qisqa,
      izohRasmUrl: s.izoh_rasm_url,
      mavzuId: s.mavzu_id,
    }));

  return { savollar };
}

/**
 * Sessiya yakunlanganda bir martalik yozuv — baholash emas, faqat
 * "qaysi mavzu o'tildi" statistikasi (8-bo'lim). O'quvchi ma'lumoti
 * umuman yozilmaydi.
 */
export async function smartTestSessiyasiniYozish(
  fanId: number,
  daraja: number,
  mavzuIdlar: number[],
  savolSoni: number,
  vaqtRejimi: boolean,
  boshlandiIso: string,
): Promise<void> {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) return;

  const supabase = await createClient();
  await supabase.from("smart_sessiyalar").insert({
    oqituvchi_id: foydalanuvchi.id,
    fan_id: fanId,
    daraja,
    mavzular: mavzuIdlar.length > 0 ? mavzuIdlar : null,
    savol_soni: savolSoni,
    vaqt_rejimi: vaqtRejimi,
    boshlandi: boshlandiIso,
    tugadi: new Date().toISOString(),
  });
}
