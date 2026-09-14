"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Bilim g'ildiragi o'yinida xato javobdan keyin beriladigan "yordam
 * topshirig'i" (bilim-gildiragi.md 6.4-bo'lim). O'quvchida Supabase Auth
 * yo'q (kirish kodi bilan kirgan), shuning uchun boshqa talaba-tomon
 * o'qishlari kabi `service_role` orqali o'qiladi.
 */
export interface YordamTopshirigi {
  id: number;
  matn: string;
  mavzuNomi: string | null;
  berilgan: string;
}

export async function oquvchiningTopshiriqlariniOl(
  oquvchiId: number,
): Promise<YordamTopshirigi[]> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("yordam_topshiriqlari")
    .select("id, matn, berilgan, mavzular(nomi)")
    .eq("oquvchi_id", oquvchiId)
    .eq("bajarildi", false)
    .order("berilgan", { ascending: false });

  return ((data ?? []) as unknown as Array<{
    id: number;
    matn: string;
    berilgan: string;
    mavzular: { nomi: string } | null;
  }>).map((t) => ({
    id: t.id,
    matn: t.matn,
    mavzuNomi: t.mavzular?.nomi ?? null,
    berilgan: t.berilgan,
  }));
}

export async function topshiriqBajarildiBelgilash(topshiriqId: number): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase.from("yordam_topshiriqlari").update({ bajarildi: true }).eq("id", topshiriqId);
}
