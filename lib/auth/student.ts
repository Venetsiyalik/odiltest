import { cookies } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const SESSIYA_COOKIE = "talaba_sessiya";
export const SESSIYA_MUDDATI_SONIYA = 4 * 60 * 60; // 4 soat (7-band)

export interface JoriyOquvchi {
  id: number;
  ismFamiliya: string;
  sinfId: number;
  sinfNomi: string;
}

interface OquvchiQatori {
  id: number;
  ism_familiya: string;
  sinf_id: number;
  faol: boolean;
  sinflar: { nomi: string } | null;
}

/**
 * `talaba_sessiya` cookie'si orqali joriy o'quvchini aniqlaydi. Bu
 * Supabase Auth emas — kirish kodi asosidagi o'ziga xos sessiya
 * (9.4-band), shuning uchun har doim `service_role` klienti bilan
 * ishlaydi (RLS'ni chetlab o'tadi, chunki o'quvchida Supabase Auth
 * foydalanuvchisi yo'q).
 */
export async function joriyOquvchiniOl(): Promise<JoriyOquvchi | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSIYA_COOKIE)?.value;
  if (!token) return null;

  const supabase = createServiceRoleClient();

  const { data: sessiya } = await supabase
    .from("sessiyalar")
    .select("oquvchi_id, amal_qiladi")
    .eq("token", token)
    .maybeSingle();

  if (!sessiya || new Date(sessiya.amal_qiladi).getTime() < Date.now()) {
    return null;
  }

  const { data: oquvchi } = await supabase
    .from("oquvchilar")
    .select("id, ism_familiya, sinf_id, faol, sinflar(nomi)")
    .eq("id", sessiya.oquvchi_id)
    .single<OquvchiQatori>();

  if (!oquvchi || !oquvchi.faol) return null;

  return {
    id: oquvchi.id,
    ismFamiliya: oquvchi.ism_familiya,
    sinfId: oquvchi.sinf_id,
    sinfNomi: oquvchi.sinflar?.nomi ?? "",
  };
}

/** Joriy sessiya tokenini o'chiradi (bazadan ham, cookie'dan ham). */
export async function sessiyaniTugatish(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSIYA_COOKIE)?.value;

  if (token) {
    const supabase = createServiceRoleClient();
    await supabase.from("sessiyalar").delete().eq("token", token);
  }

  cookieStore.delete(SESSIYA_COOKIE);
}
