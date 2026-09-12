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
