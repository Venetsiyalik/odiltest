"use server";

import { createClient } from "@/lib/supabase/server";

export interface NatijaQatori {
  urinishId: number;
  oquvchiId: number;
  oquvchiIsmFamiliya: string;
  sinfNomi: string;
  testId: number;
  testNomi: string;
  fanNomi: string;
  boshlandi: string;
  tugadi: string | null;
  togriSoni: number | null;
  jamiSavol: number;
  ballFoiz: number | null;
  baho: number | null;
  holati: string;
}

export interface NatijalarFiltri {
  fanId?: number;
  sinfId?: number;
  testId?: number;
  oquvchiId?: number;
  sanaBoshlanish?: string;
  sanaTugash?: string;
}

interface UrinishQatori {
  id: number;
  boshlandi: string;
  tugadi: string | null;
  togri_soni: number | null;
  jami_savol: number;
  ball_foiz: number | null;
  baho: number | null;
  holati: string;
  oquvchilar: { id: number; ism_familiya: string; sinflar: { nomi: string } | null } | null;
  testlar: { id: number; nomi: string; fan_id: number; sinf_id: number; fanlar: { nomi: string } | null } | null;
}

export async function natijalarniOl(filtr: NatijalarFiltri = {}): Promise<NatijaQatori[]> {
  const supabase = await createClient();

  let so_rov = supabase
    .from("urinishlar")
    .select(
      "id, boshlandi, tugadi, togri_soni, jami_savol, ball_foiz, baho, holati, oquvchi_id, test_id, oquvchilar(id, ism_familiya, sinflar(nomi)), testlar(id, nomi, fan_id, sinf_id, fanlar(nomi))",
    )
    .in("holati", ["tugallangan", "vaqt_tugadi"])
    .order("boshlandi", { ascending: false })
    .limit(500);

  if (filtr.testId) so_rov = so_rov.eq("test_id", filtr.testId);
  if (filtr.oquvchiId) so_rov = so_rov.eq("oquvchi_id", filtr.oquvchiId);
  if (filtr.sanaBoshlanish) so_rov = so_rov.gte("boshlandi", filtr.sanaBoshlanish);
  if (filtr.sanaTugash) so_rov = so_rov.lte("boshlandi", filtr.sanaTugash);

  const { data, error } = await so_rov;
  if (error) throw new Error(error.message);

  const qatorlar = (data ?? []) as unknown as UrinishQatori[];

  return qatorlar
    .filter((q) => q.testlar && q.oquvchilar)
    .filter((q) => !filtr.fanId || q.testlar!.fan_id === filtr.fanId)
    .filter((q) => !filtr.sinfId || q.testlar!.sinf_id === filtr.sinfId)
    .map((q) => ({
      urinishId: q.id,
      oquvchiId: q.oquvchilar!.id,
      oquvchiIsmFamiliya: q.oquvchilar!.ism_familiya,
      sinfNomi: q.oquvchilar!.sinflar?.nomi ?? "",
      testId: q.testlar!.id,
      testNomi: q.testlar!.nomi,
      fanNomi: q.testlar!.fanlar?.nomi ?? "",
      boshlandi: q.boshlandi,
      tugadi: q.tugadi,
      togriSoni: q.togri_soni,
      jamiSavol: q.jami_savol,
      ballFoiz: q.ball_foiz,
      baho: q.baho,
      holati: q.holati,
    }));
}

export interface QiyinSavol {
  savolId: number;
  matn: string;
  togriFoiz: number;
  jamiUrinish: number;
}

export async function engQiyinSavollarniOl(urinishIdlar: number[]): Promise<QiyinSavol[]> {
  if (urinishIdlar.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("urinish_savollari")
    .select("savol_id, togri_mi, savollar(matn)")
    .in("urinish_id", urinishIdlar)
    .not("togri_mi", "is", null)
    .returns<{ savol_id: number; togri_mi: boolean; savollar: { matn: string } | null }[]>();

  if (error) throw new Error(error.message);

  const xarita = new Map<number, { matn: string; jami: number; togri: number }>();
  for (const qator of data ?? []) {
    const joriy = xarita.get(qator.savol_id) ?? {
      matn: qator.savollar?.matn ?? "",
      jami: 0,
      togri: 0,
    };
    joriy.jami += 1;
    if (qator.togri_mi) joriy.togri += 1;
    xarita.set(qator.savol_id, joriy);
  }

  return Array.from(xarita.entries())
    .map(([savolId, q]) => ({
      savolId,
      matn: q.matn,
      togriFoiz: Math.round((q.togri / q.jami) * 100),
      jamiUrinish: q.jami,
    }))
    .sort((a, b) => a.togriFoiz - b.togriFoiz)
    .slice(0, 10);
}
