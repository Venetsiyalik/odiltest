"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface ActionNatija {
  xato?: string;
}

/**
 * REDIZAYN.md 3-bosqich: yangi, kodsiz ("hammaga ochiq") o'quv materiallari
 * tizimi uchun server action'lar. Mavjud `lib/actions/materiallar.ts`
 * (dars_materiallari — eski, kirish-kodi bilan ishlaydigan O'rganish
 * moduli) ga TEGILMAYDI, butunlay parallel yangi jadval (`materiallar`)
 * bilan ishlaydi.
 */

export interface Kontent {
  id: number;
  mavzu_id: number;
  turi: "maruza" | "prezentatsiya" | "video" | "fayl";
  sarlavha: string;
  tavsif: string | null;
  kontent: string | null;
  fayl_url: string | null;
  tashqi_url: string | null;
  slayd_soni: number | null;
  thumbnail_url: string | null;
  holat: "yuklanmoqda" | "ishlanmoqda" | "tayyor" | "xato";
  tartib: number;
}

export async function kontentlarniOl(mavzuId: number): Promise<Kontent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materiallar")
    .select(
      "id, mavzu_id, turi, sarlavha, tavsif, kontent, fayl_url, tashqi_url, slayd_soni, thumbnail_url, holat, tartib",
    )
    .eq("mavzu_id", mavzuId)
    .order("tartib");
  if (error) throw new Error(error.message);
  return (data ?? []) as Kontent[];
}

const kontentSxemasi = z.object({
  mavzuId: z.number().int().positive(),
  turi: z.enum(["maruza", "prezentatsiya", "video", "fayl"]),
  sarlavha: z.string().trim().min(2, "Sarlavhani kiriting").max(200),
  tavsif: z.string().trim().max(500).nullable().optional(),
  kontent: z.string().trim().max(20000).nullable().optional(),
  faylUrl: z.string().trim().url().nullable().optional(),
  tashqiUrl: z.string().trim().url().nullable().optional(),
  tartib: z.number().int().min(0).default(0),
});

export type KontentQiymatlari = z.infer<typeof kontentSxemasi>;

export async function kontentQoshish(qiymatlar: KontentQiymatlari): Promise<ActionNatija> {
  const tekshiruv = kontentSxemasi.safeParse(qiymatlar);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("materiallar").insert({
    mavzu_id: tekshiruv.data.mavzuId,
    turi: tekshiruv.data.turi,
    sarlavha: tekshiruv.data.sarlavha,
    tavsif: tekshiruv.data.tavsif || null,
    kontent: tekshiruv.data.kontent || null,
    fayl_url: tekshiruv.data.faylUrl || null,
    tashqi_url: tekshiruv.data.tashqiUrl || null,
    tartib: tekshiruv.data.tartib,
    yuklagan_id: user?.id ?? null,
  });

  if (error) return { xato: error.message };
  revalidatePath("/admin/kontent");
  return {};
}

export async function kontentTahrirlash(id: number, qiymatlar: KontentQiymatlari): Promise<ActionNatija> {
  const tekshiruv = kontentSxemasi.safeParse(qiymatlar);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("materiallar")
    .update({
      turi: tekshiruv.data.turi,
      sarlavha: tekshiruv.data.sarlavha,
      tavsif: tekshiruv.data.tavsif || null,
      kontent: tekshiruv.data.kontent || null,
      fayl_url: tekshiruv.data.faylUrl || null,
      tashqi_url: tekshiruv.data.tashqiUrl || null,
      tartib: tekshiruv.data.tartib,
    })
    .eq("id", id);

  if (error) return { xato: error.message };
  revalidatePath("/admin/kontent");
  return {};
}

export async function kontentOchirish(id: number): Promise<ActionNatija> {
  const supabase = await createClient();
  const { error } = await supabase.from("materiallar").delete().eq("id", id);
  if (error) return { xato: error.message };
  revalidatePath("/admin/kontent");
  return {};
}

const mavzuTavsifSxemasi = z.object({
  bolim: z.string().trim().max(100).nullable(),
  tavsif: z.string().trim().max(1000).nullable(),
});

export async function mavzuBolimTavsifYangilash(
  mavzuId: number,
  qiymatlar: { bolim: string | null; tavsif: string | null },
): Promise<ActionNatija> {
  const tekshiruv = mavzuTavsifSxemasi.safeParse(qiymatlar);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("mavzular")
    .update({ bolim: tekshiruv.data.bolim || null, tavsif: tekshiruv.data.tavsif || null })
    .eq("id", mavzuId);

  if (error) return { xato: error.message };
  revalidatePath("/admin/kontent");
  return {};
}
