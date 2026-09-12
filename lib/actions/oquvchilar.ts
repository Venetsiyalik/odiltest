"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { kirishKodiYarat } from "@/lib/utils/kirish-kodi";

export interface ActionNatija {
  xato?: string;
}

export interface Oquvchi {
  id: number;
  ism_familiya: string;
  kirish_kodi: string;
  faol: boolean;
  sinf_id: number;
  sinflar: { nomi: string } | null;
}

export async function oquvchilarniOl(sinfId?: number): Promise<Oquvchi[]> {
  const supabase = await createClient();
  let so_rov = supabase
    .from("oquvchilar")
    .select("id, ism_familiya, kirish_kodi, faol, sinf_id, sinflar(nomi)")
    .order("ism_familiya");

  if (sinfId) {
    so_rov = so_rov.eq("sinf_id", sinfId);
  }

  const { data, error } = await so_rov;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Oquvchi[];
}

const oquvchiSxemasi = z.object({
  ismFamiliya: z.string().trim().min(3, "Ism-familiyani to'liq kiriting").max(150),
  sinfId: z.number().int().positive(),
});

/** Bazada band bo'lmagan 6 xonali kodni topib, o'quvchini yaratadi. */
export async function oquvchiQoshish(qiymatlar: {
  ismFamiliya: string;
  sinfId: number;
}): Promise<ActionNatija> {
  const tekshiruv = oquvchiSxemasi.safeParse(qiymatlar);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();

  for (let urinish = 0; urinish < 10; urinish++) {
    const kod = kirishKodiYarat();
    const { error } = await supabase.from("oquvchilar").insert({
      ism_familiya: tekshiruv.data.ismFamiliya,
      sinf_id: tekshiruv.data.sinfId,
      kirish_kodi: kod,
    });

    if (!error) {
      revalidatePath("/admin/oquvchilar");
      return {};
    }

    // 23505 = unique_violation — kod band ekan, boshqasini urinamiz
    if (error.code !== "23505") {
      return { xato: error.message };
    }
  }

  return { xato: "Band bo'lmagan kirish kodi topilmadi, qaytadan urinib ko'ring" };
}

export async function oquvchiTahrirlash(
  id: number,
  qiymatlar: { ismFamiliya: string; sinfId: number },
): Promise<ActionNatija> {
  const tekshiruv = oquvchiSxemasi.safeParse(qiymatlar);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("oquvchilar")
    .update({ ism_familiya: tekshiruv.data.ismFamiliya, sinf_id: tekshiruv.data.sinfId })
    .eq("id", id);
  if (error) return { xato: error.message };

  revalidatePath("/admin/oquvchilar");
  return {};
}

export async function oquvchiFaollikniOzgartirish(id: number, faol: boolean): Promise<ActionNatija> {
  const supabase = await createClient();
  const { error } = await supabase.from("oquvchilar").update({ faol }).eq("id", id);
  if (error) return { xato: error.message };

  revalidatePath("/admin/oquvchilar");
  return {};
}

export async function kodniQaytaGeneratsiyaQilish(id: number): Promise<ActionNatija> {
  const supabase = await createClient();

  for (let urinish = 0; urinish < 10; urinish++) {
    const kod = kirishKodiYarat();
    const { error } = await supabase.from("oquvchilar").update({ kirish_kodi: kod }).eq("id", id);

    if (!error) {
      revalidatePath("/admin/oquvchilar");
      return {};
    }
    if (error.code !== "23505") {
      return { xato: error.message };
    }
  }

  return { xato: "Band bo'lmagan kirish kodi topilmadi, qaytadan urinib ko'ring" };
}

export async function oquvchiOchirish(id: number): Promise<ActionNatija> {
  const supabase = await createClient();
  const { error } = await supabase.from("oquvchilar").delete().eq("id", id);
  if (error) return { xato: error.message };

  revalidatePath("/admin/oquvchilar");
  return {};
}
