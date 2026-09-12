"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface ActionNatija {
  xato?: string;
}

export interface Test {
  id: number;
  nomi: string;
  fan_id: number;
  sinf_id: number;
  savol_soni: number;
  vaqt_daqiqa: number;
  ochilish_vaqti: string;
  yopilish_vaqti: string;
  urinishlar_soni: number;
  tanlov_turi: "avtomatik" | "qolda";
  aralashtirish: boolean;
  natija_korsat: boolean;
  xatolarni_korsat: boolean;
  holati: "qoralama" | "faol" | "yopiq";
  fanlar: { nomi: string } | null;
  sinflar: { nomi: string } | null;
}

export async function testlarniOl(): Promise<Test[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testlar")
    .select(
      "id, nomi, fan_id, sinf_id, savol_soni, vaqt_daqiqa, ochilish_vaqti, yopilish_vaqti, urinishlar_soni, tanlov_turi, aralashtirish, natija_korsat, xatolarni_korsat, holati, fanlar(nomi), sinflar(nomi)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Test[];
}

export async function testMavzuIdlariniOl(testId: number): Promise<number[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("test_mavzular")
    .select("mavzu_id")
    .eq("test_id", testId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((q) => q.mavzu_id);
}

export async function testSavolIdlariniOl(testId: number): Promise<number[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("test_savollar")
    .select("savol_id")
    .eq("test_id", testId)
    .order("tartib");
  if (error) throw new Error(error.message);
  return (data ?? []).map((q) => q.savol_id);
}

const testSxemasi = z
  .object({
    nomi: z.string().trim().min(3, "Test nomini kiriting").max(200),
    fanId: z.number().int().positive(),
    sinfId: z.number().int().positive(),
    savolSoni: z.number().int().min(1).max(200),
    vaqtDaqiqa: z.number().int().min(1).max(300),
    ochilishVaqti: z.string().min(1, "Ochilish vaqtini kiriting"),
    yopilishVaqti: z.string().min(1, "Yopilish vaqtini kiriting"),
    urinishlarSoni: z.number().int().min(1).max(10),
    tanlovTuri: z.enum(["avtomatik", "qolda"]),
    aralashtirish: z.boolean(),
    natijaKorsat: z.boolean(),
    xatolarniKorsat: z.boolean(),
    mavzuIdlar: z.array(z.number().int().positive()),
    savolIdlar: z.array(z.number().int().positive()),
  })
  .refine((q) => new Date(q.yopilishVaqti) > new Date(q.ochilishVaqti), {
    message: "Yopilish vaqti ochilish vaqtidan keyin bo'lishi kerak",
    path: ["yopilishVaqti"],
  })
  .refine((q) => q.tanlovTuri !== "avtomatik" || q.mavzuIdlar.length > 0, {
    message: "Avtomatik tanlash uchun kamida bitta mavzu tanlang",
    path: ["mavzuIdlar"],
  })
  .refine((q) => q.tanlovTuri !== "qolda" || q.savolIdlar.length > 0, {
    message: "Qo'lda tanlash uchun kamida bitta savol tanlang",
    path: ["savolIdlar"],
  });

export type TestQiymatlari = z.infer<typeof testSxemasi>;

async function mavzuVaSavolBoglanishlariniYozish(
  supabase: Awaited<ReturnType<typeof createClient>>,
  testId: number,
  qiymatlar: TestQiymatlari,
): Promise<string | null> {
  await supabase.from("test_mavzular").delete().eq("test_id", testId);
  await supabase.from("test_savollar").delete().eq("test_id", testId);

  if (qiymatlar.tanlovTuri === "avtomatik" && qiymatlar.mavzuIdlar.length > 0) {
    const { error } = await supabase
      .from("test_mavzular")
      .insert(qiymatlar.mavzuIdlar.map((mavzuId) => ({ test_id: testId, mavzu_id: mavzuId })));
    if (error) return error.message;
  }

  if (qiymatlar.tanlovTuri === "qolda" && qiymatlar.savolIdlar.length > 0) {
    const { error } = await supabase.from("test_savollar").insert(
      qiymatlar.savolIdlar.map((savolId, indeks) => ({
        test_id: testId,
        savol_id: savolId,
        tartib: indeks,
      })),
    );
    if (error) return error.message;
  }

  return null;
}

export async function testQoshish(qiymatlar: TestQiymatlari): Promise<ActionNatija> {
  const tekshiruv = testSxemasi.safeParse(qiymatlar);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: yangiTest, error } = await supabase
    .from("testlar")
    .insert({
      nomi: tekshiruv.data.nomi,
      fan_id: tekshiruv.data.fanId,
      sinf_id: tekshiruv.data.sinfId,
      savol_soni: tekshiruv.data.savolSoni,
      vaqt_daqiqa: tekshiruv.data.vaqtDaqiqa,
      ochilish_vaqti: tekshiruv.data.ochilishVaqti,
      yopilish_vaqti: tekshiruv.data.yopilishVaqti,
      urinishlar_soni: tekshiruv.data.urinishlarSoni,
      tanlov_turi: tekshiruv.data.tanlovTuri,
      aralashtirish: tekshiruv.data.aralashtirish,
      natija_korsat: tekshiruv.data.natijaKorsat,
      xatolarni_korsat: tekshiruv.data.xatolarniKorsat,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) return { xato: error.message };

  const boglanishXatosi = await mavzuVaSavolBoglanishlariniYozish(supabase, yangiTest.id, tekshiruv.data);
  if (boglanishXatosi) return { xato: boglanishXatosi };

  revalidatePath("/admin/testlar");
  return {};
}

export async function testTahrirlash(id: number, qiymatlar: TestQiymatlari): Promise<ActionNatija> {
  const tekshiruv = testSxemasi.safeParse(qiymatlar);
  if (!tekshiruv.success) return { xato: tekshiruv.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("testlar")
    .update({
      nomi: tekshiruv.data.nomi,
      fan_id: tekshiruv.data.fanId,
      sinf_id: tekshiruv.data.sinfId,
      savol_soni: tekshiruv.data.savolSoni,
      vaqt_daqiqa: tekshiruv.data.vaqtDaqiqa,
      ochilish_vaqti: tekshiruv.data.ochilishVaqti,
      yopilish_vaqti: tekshiruv.data.yopilishVaqti,
      urinishlar_soni: tekshiruv.data.urinishlarSoni,
      tanlov_turi: tekshiruv.data.tanlovTuri,
      aralashtirish: tekshiruv.data.aralashtirish,
      natija_korsat: tekshiruv.data.natijaKorsat,
      xatolarni_korsat: tekshiruv.data.xatolarniKorsat,
    })
    .eq("id", id);

  if (error) return { xato: error.message };

  const boglanishXatosi = await mavzuVaSavolBoglanishlariniYozish(supabase, id, tekshiruv.data);
  if (boglanishXatosi) return { xato: boglanishXatosi };

  revalidatePath("/admin/testlar");
  return {};
}

export async function testHolatiniOzgartirish(
  id: number,
  holati: "qoralama" | "faol" | "yopiq",
): Promise<ActionNatija> {
  const supabase = await createClient();
  const { error } = await supabase.from("testlar").update({ holati }).eq("id", id);
  if (error) return { xato: error.message };
  revalidatePath("/admin/testlar");
  return {};
}

export async function testOchirish(id: number): Promise<ActionNatija> {
  const supabase = await createClient();
  const { error } = await supabase.from("testlar").delete().eq("id", id);
  if (error) {
    return {
      xato:
        error.code === "23503"
          ? "Bu testda o'quvchi urinishlari bor — o'chirish o'rniga uni yoping"
          : error.message,
    };
  }
  revalidatePath("/admin/testlar");
  return {};
}
