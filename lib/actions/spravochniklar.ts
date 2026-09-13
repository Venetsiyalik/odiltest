"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface ActionNatija {
  xato?: string;
}

// ----------------------------------------------------------------------------
// FANLAR
// ----------------------------------------------------------------------------

export async function fanlarniOl() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("fanlar").select("id, nomi").order("nomi");
  if (error) throw new Error(error.message);
  return data;
}

const nomiSxemasi = z.string().trim().min(2, "Kamida 2 ta belgi").max(100);

export async function fanQoshish(nomi: string): Promise<ActionNatija> {
  const tekshiruv = nomiSxemasi.safeParse(nomi);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("fanlar").insert({ nomi: tekshiruv.data });
  if (error) return { xato: error.code === "23505" ? "Bu fan allaqachon mavjud" : error.message };

  revalidatePath("/admin/spravochniklar");
  return {};
}

export async function fanTahrirlash(id: number, nomi: string): Promise<ActionNatija> {
  const tekshiruv = nomiSxemasi.safeParse(nomi);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("fanlar").update({ nomi: tekshiruv.data }).eq("id", id);
  if (error) return { xato: error.code === "23505" ? "Bu fan allaqachon mavjud" : error.message };

  revalidatePath("/admin/spravochniklar");
  return {};
}

export async function fanOchirish(id: number): Promise<ActionNatija> {
  const supabase = await createClient();
  const { error } = await supabase.from("fanlar").delete().eq("id", id);
  if (error) {
    return {
      xato:
        error.code === "23503"
          ? "Bu fanga bog'liq mavzu/savol/test bor — avval ularni o'chiring"
          : error.message,
    };
  }
  revalidatePath("/admin/spravochniklar");
  return {};
}

// ----------------------------------------------------------------------------
// SINFLAR
// ----------------------------------------------------------------------------

export async function sinflarniOl() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("sinflar").select("id, nomi").order("nomi");
  if (error) throw new Error(error.message);
  return data;
}

export async function sinfQoshish(nomi: string): Promise<ActionNatija> {
  const tekshiruv = nomiSxemasi.safeParse(nomi);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("sinflar").insert({ nomi: tekshiruv.data });
  if (error) return { xato: error.code === "23505" ? "Bu sinf allaqachon mavjud" : error.message };

  revalidatePath("/admin/spravochniklar");
  revalidatePath("/admin/oquvchilar");
  return {};
}

export async function sinfTahrirlash(id: number, nomi: string): Promise<ActionNatija> {
  const tekshiruv = nomiSxemasi.safeParse(nomi);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("sinflar").update({ nomi: tekshiruv.data }).eq("id", id);
  if (error) return { xato: error.code === "23505" ? "Bu sinf allaqachon mavjud" : error.message };

  revalidatePath("/admin/spravochniklar");
  revalidatePath("/admin/oquvchilar");
  return {};
}

export async function sinfOchirish(id: number): Promise<ActionNatija> {
  const supabase = await createClient();
  const { error } = await supabase.from("sinflar").delete().eq("id", id);
  if (error) {
    return {
      xato:
        error.code === "23503"
          ? "Bu sinfga bog'liq o'quvchi/mavzu/savol/test bor — avval ularni o'chiring"
          : error.message,
    };
  }
  revalidatePath("/admin/spravochniklar");
  revalidatePath("/admin/oquvchilar");
  return {};
}

// ----------------------------------------------------------------------------
// MAVZULAR
// ----------------------------------------------------------------------------

export interface Mavzu {
  id: number;
  nomi: string;
  tartib: number;
  fan_id: number;
  sinf_id: number;
  // REDIZAYN.md 3-bosqich: yangi, ixtiyoriy ustunlar (0005-migratsiya).
  bolim: string | null;
  tavsif: string | null;
  // ishreja-import.md: 0007-migratsiya — importdan kelgan mavzular turi.
  // "baholash" (BSB/ChSB/nazorat ishi) darslar emas, shuning uchun material/
  // test biriktirish tanlovlarida ko'rsatilmaydi (mavzular.ts§ishreja-import.md 3-bo'lim).
  turi: "mavzu" | "baholash" | "takrorlash" | "amaliy";
  fanlar: { nomi: string } | null;
  sinflar: { nomi: string } | null;
}

export async function mavzularniOl(): Promise<Mavzu[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mavzular")
    .select("id, nomi, tartib, fan_id, sinf_id, bolim, tavsif, turi, fanlar(nomi), sinflar(nomi)")
    .order("tartib");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Mavzu[];
}

const mavzuSxemasi = z.object({
  nomi: nomiSxemasi,
  fanId: z.number().int().positive(),
  sinfId: z.number().int().positive(),
  tartib: z.number().int().min(0).default(0),
});

export async function mavzuQoshish(qiymatlar: {
  nomi: string;
  fanId: number;
  sinfId: number;
  tartib?: number;
}): Promise<ActionNatija> {
  const tekshiruv = mavzuSxemasi.safeParse(qiymatlar);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("mavzular").insert({
    nomi: tekshiruv.data.nomi,
    fan_id: tekshiruv.data.fanId,
    sinf_id: tekshiruv.data.sinfId,
    tartib: tekshiruv.data.tartib,
  });
  if (error) {
    return {
      xato: error.code === "23505" ? "Bu fan+sinf uchun shu nomli mavzu bor" : error.message,
    };
  }

  revalidatePath("/admin/spravochniklar");
  return {};
}

export async function mavzuOchirish(id: number): Promise<ActionNatija> {
  const supabase = await createClient();
  const { error } = await supabase.from("mavzular").delete().eq("id", id);
  if (error) return { xato: error.message };
  revalidatePath("/admin/spravochniklar");
  return {};
}
