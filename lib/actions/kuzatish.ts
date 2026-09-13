"use server";

import { createClient } from "@/lib/supabase/server";

export interface JonliOquvchiHolati {
  oquvchiId: number;
  ismFamiliya: string;
  holati: "boshlamagan" | "jarayonda" | "tugallangan" | "vaqt_tugadi";
  javobBerilganSoni: number;
  jamiSavol: number;
  ballFoiz: number | null;
  baho: number | null;
  boshlandi: string | null;
  tugadi: string | null;
}

interface UrinishQatori {
  id: number;
  oquvchi_id: number;
  holati: string;
  boshlandi: string;
  tugadi: string | null;
  jami_savol: number;
  ball_foiz: number | null;
  baho: number | null;
}

/**
 * Test davom etayotganda kim kirgani, nechtasi tugatgani real vaqtda
 * ko'rinishi uchun (texnik topshiriq 4.2.3-band, "Jonli kuzatish").
 * Admin panel bu funksiyani polling orqali (bir necha soniyada bir marta)
 * chaqiradi — alohida real-time kanal ochish shart emas.
 */
export async function jonliKuzatishniOl(testId: number): Promise<JonliOquvchiHolati[]> {
  const supabase = await createClient();

  const { data: test, error: testXato } = await supabase
    .from("testlar")
    .select("id, sinf_id, savol_soni")
    .eq("id", testId)
    .maybeSingle();
  if (testXato) throw new Error(testXato.message);
  if (!test) return [];

  const { data: oquvchilar, error: oquvchilarXato } = await supabase
    .from("oquvchilar")
    .select("id, ism_familiya")
    .eq("sinf_id", test.sinf_id)
    .eq("faol", true)
    .order("ism_familiya");
  if (oquvchilarXato) throw new Error(oquvchilarXato.message);

  const { data: urinishlar, error: urinishXato } = await supabase
    .from("urinishlar")
    .select("id, oquvchi_id, holati, boshlandi, tugadi, jami_savol, ball_foiz, baho")
    .eq("test_id", testId)
    .order("boshlandi", { ascending: false })
    .returns<UrinishQatori[]>();
  if (urinishXato) throw new Error(urinishXato.message);

  // Bir o'quvchida bir nechta urinish bo'lishi mumkin (urinishlar_soni>1) —
  // eng so'nggisi (boshlandi bo'yicha) hozirgi holat sifatida olinadi.
  const oxirgiUrinish = new Map<number, UrinishQatori>();
  for (const u of urinishlar ?? []) {
    if (!oxirgiUrinish.has(u.oquvchi_id)) oxirgiUrinish.set(u.oquvchi_id, u);
  }

  const barchaUrinishIdlar = Array.from(oxirgiUrinish.values()).map((u) => u.id);

  const javobSonlari = new Map<number, number>();
  if (barchaUrinishIdlar.length > 0) {
    const { data: javoblar, error: javobXato } = await supabase
      .from("urinish_savollari")
      .select("urinish_id")
      .in("urinish_id", barchaUrinishIdlar)
      .not("tanlangan_javob", "is", null);
    if (javobXato) throw new Error(javobXato.message);
    for (const j of javoblar ?? []) {
      javobSonlari.set(j.urinish_id, (javobSonlari.get(j.urinish_id) ?? 0) + 1);
    }
  }

  return (oquvchilar ?? [])
    .map((o) => {
      const urinish = oxirgiUrinish.get(o.id);
      if (!urinish) {
        return {
          oquvchiId: o.id,
          ismFamiliya: o.ism_familiya,
          holati: "boshlamagan" as const,
          javobBerilganSoni: 0,
          jamiSavol: test.savol_soni,
          ballFoiz: null,
          baho: null,
          boshlandi: null,
          tugadi: null,
        };
      }
      return {
        oquvchiId: o.id,
        ismFamiliya: o.ism_familiya,
        holati: (urinish.holati === "boshlangan" ? "jarayonda" : urinish.holati) as JonliOquvchiHolati["holati"],
        javobBerilganSoni: javobSonlari.get(urinish.id) ?? 0,
        jamiSavol: urinish.jami_savol,
        ballFoiz: urinish.ball_foiz,
        baho: urinish.baho,
        boshlandi: urinish.boshlandi,
        tugadi: urinish.tugadi,
      };
    })
    .sort((a, b) => a.ismFamiliya.localeCompare(b.ismFamiliya));
}
