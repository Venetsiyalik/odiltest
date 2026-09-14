import { createClient } from "@/lib/supabase/server";

export type FoydalanuvchiRoli = "admin" | "oqituvchi";

export interface JoriyFoydalanuvchi {
  id: string;
  ismFamiliya: string;
  rol: FoydalanuvchiRoli;
}

/**
 * Admin panelga kirgan Supabase Auth foydalanuvchisini va uning
 * `foydalanuvchilar` jadvalidagi profilini qaytaradi. Sessiya yo'q yoki
 * profil topilmasa/nofaol bo'lsa — null.
 */
export async function joriyFoydalanuvchiniOl(): Promise<JoriyFoydalanuvchi | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profil } = await supabase
    .from("foydalanuvchilar")
    .select("id, ism_familiya, rol, faol")
    .eq("id", user.id)
    .single();

  if (!profil || !profil.faol) {
    return null;
  }

  return {
    id: profil.id,
    ismFamiliya: profil.ism_familiya,
    rol: profil.rol,
  };
}

export interface KirishDoirasi {
  /** false — admin, cheklanmagan (quyidagi ro'yxatlar e'tiborsiz qoldiriladi). */
  cheklanganmi: boolean;
  fanlar: number[];
  sinflar: number[];
  juftliklar: { fanId: number; sinfId: number }[];
}

/**
 * Joriy foydalanuvchi qaysi fan+sinf birikmalariga biriktirilganini
 * qaytaradi — admin/savollar/testlar/oquvchilar formalaridagi fan/sinf
 * ro'yxatlarini o'qituvchi uchun cheklash uchun (o'qituvchi-paneli).
 * Admin uchun har doim `cheklanganmi: false` — sahifalar buni "hammasi
 * ko'rinadi" deb talqin qilishi kerak, bo'sh ro'yxat bilan ADASHTIRILMASIN
 * (o'qituvchining haqiqatan ham nol biriktirishi bo'lishi mumkin).
 */
export async function joriyKirishDoirasiniOl(): Promise<KirishDoirasi> {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi || foydalanuvchi.rol === "admin") {
    return { cheklanganmi: false, fanlar: [], sinflar: [], juftliklar: [] };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("biriktirish")
    .select("fan_id, sinf_id")
    .eq("foydalanuvchi_id", foydalanuvchi.id);

  const juftliklar = (data ?? []).map((b) => ({ fanId: b.fan_id, sinfId: b.sinf_id }));
  return {
    cheklanganmi: true,
    fanlar: Array.from(new Set(juftliklar.map((j) => j.fanId))),
    sinflar: Array.from(new Set(juftliklar.map((j) => j.sinfId))),
    juftliklar,
  };
}
