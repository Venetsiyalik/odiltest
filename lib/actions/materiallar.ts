"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface ActionNatija {
  xato?: string;
}

export interface DarsMateriali {
  id: number;
  mavzu_id: number;
  tartib: number;
  turi: "nazariya" | "misol" | "video";
  sarlavha: string;
  kontent: string | null;
  media_url: string | null;
}

export async function materiallarniOl(mavzuId: number): Promise<DarsMateriali[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dars_materiallari")
    .select("id, mavzu_id, tartib, turi, sarlavha, kontent, media_url")
    .eq("mavzu_id", mavzuId)
    .order("tartib");
  if (error) throw new Error(error.message);
  return data ?? [];
}

const materialSxemasi = z.object({
  mavzuId: z.number().int().positive(),
  turi: z.enum(["nazariya", "misol", "video"]),
  sarlavha: z.string().trim().min(2, "Sarlavhani kiriting").max(200),
  kontent: z.string().trim().max(20000).nullable().optional(),
  mediaUrl: z.string().trim().url().nullable().optional(),
  tartib: z.number().int().min(0).default(0),
});

export type MaterialQiymatlari = z.infer<typeof materialSxemasi>;

export async function materialQoshish(qiymatlar: MaterialQiymatlari): Promise<ActionNatija> {
  const tekshiruv = materialSxemasi.safeParse(qiymatlar);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("dars_materiallari").insert({
    mavzu_id: tekshiruv.data.mavzuId,
    turi: tekshiruv.data.turi,
    sarlavha: tekshiruv.data.sarlavha,
    kontent: tekshiruv.data.kontent || null,
    media_url: tekshiruv.data.mediaUrl || null,
    tartib: tekshiruv.data.tartib,
  });

  if (error) return { xato: error.message };
  revalidatePath("/admin/materiallar");
  return {};
}

export async function materialTahrirlash(
  id: number,
  qiymatlar: MaterialQiymatlari,
): Promise<ActionNatija> {
  const tekshiruv = materialSxemasi.safeParse(qiymatlar);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("dars_materiallari")
    .update({
      turi: tekshiruv.data.turi,
      sarlavha: tekshiruv.data.sarlavha,
      kontent: tekshiruv.data.kontent || null,
      media_url: tekshiruv.data.mediaUrl || null,
      tartib: tekshiruv.data.tartib,
    })
    .eq("id", id);

  if (error) return { xato: error.message };
  revalidatePath("/admin/materiallar");
  return {};
}

export async function materialOchirish(id: number): Promise<ActionNatija> {
  const supabase = await createClient();
  const { error } = await supabase.from("dars_materiallari").delete().eq("id", id);
  if (error) return { xato: error.message };
  revalidatePath("/admin/materiallar");
  return {};
}
