"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface ActionNatija {
  xato?: string;
}

export interface Savol {
  id: number;
  matn: string;
  rasm_url: string | null;
  variant_a: string;
  variant_b: string;
  variant_c: string;
  variant_d: string;
  togri_javob: "A" | "B" | "C" | "D";
  qiyinlik: number;
  izoh: string | null;
  faol: boolean;
  fan_id: number;
  sinf_id: number;
  mavzu_id: number | null;
  fanlar: { nomi: string } | null;
  sinflar: { nomi: string } | null;
  mavzular: { nomi: string } | null;
}

export interface SavollarFiltri {
  fanId?: number;
  sinfId?: number;
  mavzuId?: number;
  qiyinlik?: number;
  matn?: string;
}

export async function savollarniOl(filtr: SavollarFiltri = {}): Promise<Savol[]> {
  const supabase = await createClient();
  let so_rov = supabase
    .from("savollar")
    .select(
      "id, matn, rasm_url, variant_a, variant_b, variant_c, variant_d, togri_javob, qiyinlik, izoh, faol, fan_id, sinf_id, mavzu_id, fanlar(nomi), sinflar(nomi), mavzular(nomi)",
    )
    .order("created_at", { ascending: false })
    .limit(300);

  if (filtr.fanId) so_rov = so_rov.eq("fan_id", filtr.fanId);
  if (filtr.sinfId) so_rov = so_rov.eq("sinf_id", filtr.sinfId);
  if (filtr.mavzuId) so_rov = so_rov.eq("mavzu_id", filtr.mavzuId);
  if (filtr.qiyinlik) so_rov = so_rov.eq("qiyinlik", filtr.qiyinlik);
  if (filtr.matn && filtr.matn.trim()) {
    so_rov = so_rov.ilike("matn", `%${filtr.matn.trim()}%`);
  }

  const { data, error } = await so_rov;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Savol[];
}

export interface SavolStatistika {
  savolId: number;
  jamiUrinish: number;
  togriUrinish: number;
}

/** Berilgan savollar bo'yicha "shu savolda N% to'g'ri javob" statistikasi. */
export async function savolStatistikalariniOl(savolIdlar: number[]): Promise<SavolStatistika[]> {
  if (savolIdlar.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("urinish_savollari")
    .select("savol_id, togri_mi")
    .in("savol_id", savolIdlar)
    .not("togri_mi", "is", null);

  if (error) throw new Error(error.message);

  const xarita = new Map<number, { jami: number; togri: number }>();
  for (const qator of data ?? []) {
    const joriy = xarita.get(qator.savol_id) ?? { jami: 0, togri: 0 };
    joriy.jami += 1;
    if (qator.togri_mi) joriy.togri += 1;
    xarita.set(qator.savol_id, joriy);
  }

  return Array.from(xarita.entries()).map(([savolId, { jami, togri }]) => ({
    savolId,
    jamiUrinish: jami,
    togriUrinish: togri,
  }));
}

const savolSxemasi = z.object({
  fanId: z.number().int().positive(),
  sinfId: z.number().int().positive(),
  mavzuId: z.number().int().positive().nullable(),
  matn: z.string().trim().min(5, "Savol matnini to'liq kiriting"),
  variantA: z.string().trim().min(1, "A variantini kiriting"),
  variantB: z.string().trim().min(1, "B variantini kiriting"),
  variantC: z.string().trim().min(1, "C variantini kiriting"),
  variantD: z.string().trim().min(1, "D variantini kiriting"),
  togriJavob: z.enum(["A", "B", "C", "D"]),
  qiyinlik: z.number().int().min(1).max(5),
  izoh: z.string().trim().max(1000).nullable().optional(),
  rasmUrl: z.string().trim().url().nullable().optional(),
});

export type SavolQiymatlari = z.infer<typeof savolSxemasi>;

export async function savolQoshish(qiymatlar: SavolQiymatlari): Promise<ActionNatija> {
  const tekshiruv = savolSxemasi.safeParse(qiymatlar);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("savollar").insert({
    fan_id: tekshiruv.data.fanId,
    sinf_id: tekshiruv.data.sinfId,
    mavzu_id: tekshiruv.data.mavzuId,
    matn: tekshiruv.data.matn,
    variant_a: tekshiruv.data.variantA,
    variant_b: tekshiruv.data.variantB,
    variant_c: tekshiruv.data.variantC,
    variant_d: tekshiruv.data.variantD,
    togri_javob: tekshiruv.data.togriJavob,
    qiyinlik: tekshiruv.data.qiyinlik,
    izoh: tekshiruv.data.izoh || null,
    rasm_url: tekshiruv.data.rasmUrl || null,
    created_by: user?.id ?? null,
  });

  if (error) return { xato: error.message };

  revalidatePath("/admin/savollar");
  return {};
}

export async function savolTahrirlash(id: number, qiymatlar: SavolQiymatlari): Promise<ActionNatija> {
  const tekshiruv = savolSxemasi.safeParse(qiymatlar);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("savollar")
    .update({
      fan_id: tekshiruv.data.fanId,
      sinf_id: tekshiruv.data.sinfId,
      mavzu_id: tekshiruv.data.mavzuId,
      matn: tekshiruv.data.matn,
      variant_a: tekshiruv.data.variantA,
      variant_b: tekshiruv.data.variantB,
      variant_c: tekshiruv.data.variantC,
      variant_d: tekshiruv.data.variantD,
      togri_javob: tekshiruv.data.togriJavob,
      qiyinlik: tekshiruv.data.qiyinlik,
      izoh: tekshiruv.data.izoh || null,
      rasm_url: tekshiruv.data.rasmUrl || null,
    })
    .eq("id", id);

  if (error) return { xato: error.message };

  revalidatePath("/admin/savollar");
  return {};
}

export async function savolOchirish(id: number): Promise<ActionNatija> {
  const supabase = await createClient();
  const { error } = await supabase.from("savollar").delete().eq("id", id);
  if (error) {
    return {
      xato:
        error.code === "23503"
          ? "Bu savol testda ishlatilgan — avval testdan olib tashlang"
          : error.message,
    };
  }
  revalidatePath("/admin/savollar");
  return {};
}

export async function savollarniOmmaviyOchirish(idlar: number[]): Promise<ActionNatija> {
  if (idlar.length === 0) return {};
  const supabase = await createClient();
  const { error } = await supabase.from("savollar").delete().in("id", idlar);
  if (error) {
    return {
      xato:
        error.code === "23503"
          ? "Tanlangan savollardan biri testda ishlatilgan — avval testdan olib tashlang"
          : error.message,
    };
  }
  revalidatePath("/admin/savollar");
  return {};
}

export async function savollarniOmmaviyMavzuOzgartirish(
  idlar: number[],
  mavzuId: number | null,
): Promise<ActionNatija> {
  if (idlar.length === 0) return {};
  const supabase = await createClient();
  const { error } = await supabase.from("savollar").update({ mavzu_id: mavzuId }).in("id", idlar);
  if (error) return { xato: error.message };
  revalidatePath("/admin/savollar");
  return {};
}

export async function savollarniOmmaviyFaolsizlantirish(
  idlar: number[],
  faol: boolean,
): Promise<ActionNatija> {
  if (idlar.length === 0) return {};
  const supabase = await createClient();
  const { error } = await supabase.from("savollar").update({ faol }).in("id", idlar);
  if (error) return { xato: error.message };
  revalidatePath("/admin/savollar");
  return {};
}
