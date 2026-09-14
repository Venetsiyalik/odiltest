"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { joriyFoydalanuvchiniOl, type FoydalanuvchiRoli } from "@/lib/auth/admin";

export interface ActionNatija {
  xato?: string;
}

export interface Foydalanuvchi {
  id: string;
  ismFamiliya: string;
  email: string;
  rol: FoydalanuvchiRoli;
  faol: boolean;
}

export interface Biriktirish {
  id: number;
  fanId: number;
  fanNomi: string;
  sinfId: number;
  sinfNomi: string;
}

/**
 * `auth.admin.*` chaqiruvlari service_role kaliti orqali RLS'ni butunlay
 * chetlab o'tadi — shu sababli bu yerdagi qo'lda tekshiruv YAGONA himoya
 * qatlami (RLS ekvivalenti yo'q). Har bir eksport qilingan funksiya shu
 * tekshiruvdan boshlanishi SHART.
 */
async function adminEkanliginiTekshirish() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi || foydalanuvchi.rol !== "admin") {
    throw new Error("Ruxsat yo'q");
  }
  return foydalanuvchi;
}

export async function foydalanuvchilarniOl(): Promise<Foydalanuvchi[]> {
  await adminEkanliginiTekshirish();
  const admin = createServiceRoleClient();

  const { data: profillar, error } = await admin
    .from("foydalanuvchilar")
    .select("id, ism_familiya, rol, faol")
    .order("ism_familiya");
  if (error) throw new Error(error.message);

  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailXaritasi = new Map((authData?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  return (profillar ?? []).map((p) => ({
    id: p.id,
    ismFamiliya: p.ism_familiya,
    rol: p.rol as FoydalanuvchiRoli,
    faol: p.faol,
    email: emailXaritasi.get(p.id) ?? "",
  }));
}

const oqituvchiSxemasi = z.object({
  ismFamiliya: z.string().trim().min(2, "Kamida 2 ta belgi"),
  email: z.string().trim().email("Email noto'g'ri"),
  parol: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
});

export type OqituvchiQiymatlari = z.infer<typeof oqituvchiSxemasi>;

export async function oqituvchiQoshish(qiymatlar: OqituvchiQiymatlari): Promise<ActionNatija> {
  await adminEkanliginiTekshirish();
  const tekshiruv = oqituvchiSxemasi.safeParse(qiymatlar);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const admin = createServiceRoleClient();
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: tekshiruv.data.email,
    password: tekshiruv.data.parol,
    email_confirm: true,
  });
  if (userError) return { xato: userError.message };

  const { error: profilXatosi } = await admin.from("foydalanuvchilar").insert({
    id: userData.user.id,
    ism_familiya: tekshiruv.data.ismFamiliya,
    rol: "oqituvchi",
  });
  if (profilXatosi) {
    // Auth foydalanuvchisi yaratilib, profil yozuvi muvaffaqiyatsiz bo'lsa —
    // "egasiz" hisob qolib ketmasligi uchun orqaga qaytariladi.
    await admin.auth.admin.deleteUser(userData.user.id);
    return { xato: profilXatosi.message };
  }

  revalidatePath("/admin/foydalanuvchilar");
  return {};
}

export async function foydalanuvchiFaolligniOzgartirish(
  id: string,
  faol: boolean,
): Promise<ActionNatija> {
  await adminEkanliginiTekshirish();
  const supabase = await createClient();
  const { error } = await supabase.from("foydalanuvchilar").update({ faol }).eq("id", id);
  if (error) return { xato: error.message };
  revalidatePath("/admin/foydalanuvchilar");
  return {};
}

const parolSxemasi = z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak");

export async function foydalanuvchiParoliniOzgartirish(
  id: string,
  yangiParol: string,
): Promise<ActionNatija> {
  await adminEkanliginiTekshirish();
  const tekshiruv = parolSxemasi.safeParse(yangiParol);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const admin = createServiceRoleClient();
  const { error } = await admin.auth.admin.updateUserById(id, { password: tekshiruv.data });
  if (error) return { xato: error.message };
  return {};
}

export async function biriktirishlarniOl(foydalanuvchiId: string): Promise<Biriktirish[]> {
  await adminEkanliginiTekshirish();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("biriktirish")
    .select("id, fan_id, sinf_id, fanlar(nomi), sinflar(nomi)")
    .eq("foydalanuvchi_id", foydalanuvchiId);
  if (error) throw new Error(error.message);

  return (
    (data ?? []) as unknown as Array<{
      id: number;
      fan_id: number;
      sinf_id: number;
      fanlar: { nomi: string } | null;
      sinflar: { nomi: string } | null;
    }>
  ).map((b) => ({
    id: b.id,
    fanId: b.fan_id,
    fanNomi: b.fanlar?.nomi ?? "",
    sinfId: b.sinf_id,
    sinfNomi: b.sinflar?.nomi ?? "",
  }));
}

export async function biriktirishQoshish(
  foydalanuvchiId: string,
  fanId: number,
  sinfId: number,
): Promise<ActionNatija> {
  await adminEkanliginiTekshirish();
  const supabase = await createClient();
  const { error } = await supabase
    .from("biriktirish")
    .insert({ foydalanuvchi_id: foydalanuvchiId, fan_id: fanId, sinf_id: sinfId });
  if (error) {
    return { xato: error.code === "23505" ? "Bu biriktirish allaqachon mavjud" : error.message };
  }
  revalidatePath("/admin/foydalanuvchilar");
  return {};
}

export async function biriktirishOchirish(id: number): Promise<ActionNatija> {
  await adminEkanliginiTekshirish();
  const supabase = await createClient();
  const { error } = await supabase.from("biriktirish").delete().eq("id", id);
  if (error) return { xato: error.message };
  revalidatePath("/admin/foydalanuvchilar");
  return {};
}
