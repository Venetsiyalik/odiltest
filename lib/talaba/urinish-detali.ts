import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Variant, VariantTartibi } from "@/lib/talaba/aralashtirish";

export interface UrinishSavoli {
  savolId: number;
  tartib: number;
  matn: string;
  rasmUrl: string | null;
  variantlar: Record<Variant, string>;
  tanlanganJavob: Variant | null;
  belgilangan: boolean;
}

export interface UrinishDetali {
  id: number;
  testId: number;
  testNomi: string;
  vaqtDaqiqa: number;
  natijaKorsat: boolean;
  xatolarniKorsat: boolean;
  holati: "boshlangan" | "tugallangan" | "vaqt_tugadi";
  boshlandi: string;
  jamiSavol: number;
  togriSoni: number | null;
  ballFoiz: number | null;
  baho: number | null;
  savollar: UrinishSavoli[];
}

interface SavolQatori {
  id: number;
  matn: string;
  rasm_url: string | null;
  variant_a: string;
  variant_b: string;
  variant_c: string;
  variant_d: string;
}

interface UrinishSavoliQatori {
  savol_id: number;
  tartib: number;
  variant_tartibi: VariantTartibi;
  tanlangan_javob: Variant | null;
  belgilangan: boolean;
  savollar: SavolQatori;
}

/** Urinishga tegishli barcha ma'lumotni qaytaradi; to'g'ri javob hech qachon qo'shilmaydi. */
export async function urinishDetaliniOl(
  urinishId: number,
  oquvchiId: number,
): Promise<UrinishDetali | null> {
  const supabase = createServiceRoleClient();

  const { data: urinish } = await supabase
    .from("urinishlar")
    .select(
      "id, oquvchi_id, test_id, holati, boshlandi, jami_savol, togri_soni, ball_foiz, baho, testlar(nomi, vaqt_daqiqa, natija_korsat, xatolarni_korsat)",
    )
    .eq("id", urinishId)
    .maybeSingle<{
      id: number;
      oquvchi_id: number;
      test_id: number;
      holati: "boshlangan" | "tugallangan" | "vaqt_tugadi";
      boshlandi: string;
      jami_savol: number;
      togri_soni: number | null;
      ball_foiz: number | null;
      baho: number | null;
      testlar: {
        nomi: string;
        vaqt_daqiqa: number;
        natija_korsat: boolean;
        xatolarni_korsat: boolean;
      } | null;
    }>();

  if (!urinish || urinish.oquvchi_id !== oquvchiId || !urinish.testlar) return null;

  const { data: qatorlar } = await supabase
    .from("urinish_savollari")
    .select(
      "savol_id, tartib, variant_tartibi, tanlangan_javob, belgilangan, savollar(id, matn, rasm_url, variant_a, variant_b, variant_c, variant_d)",
    )
    .eq("urinish_id", urinishId)
    .order("tartib")
    .returns<UrinishSavoliQatori[]>();

  const savollar: UrinishSavoli[] = (qatorlar ?? []).map((q) => {
    const variantMatni = (harf: Variant) => {
      const aslHarf = q.variant_tartibi[harf];
      const kalit = `variant_${aslHarf.toLowerCase()}` as
        | "variant_a"
        | "variant_b"
        | "variant_c"
        | "variant_d";
      return q.savollar[kalit];
    };

    return {
      savolId: q.savol_id,
      tartib: q.tartib,
      matn: q.savollar.matn,
      rasmUrl: q.savollar.rasm_url,
      variantlar: { A: variantMatni("A"), B: variantMatni("B"), C: variantMatni("C"), D: variantMatni("D") },
      tanlanganJavob: q.tanlangan_javob,
      belgilangan: q.belgilangan,
    };
  });

  return {
    id: urinish.id,
    testId: urinish.test_id,
    testNomi: urinish.testlar.nomi,
    vaqtDaqiqa: urinish.testlar.vaqt_daqiqa,
    natijaKorsat: urinish.testlar.natija_korsat,
    xatolarniKorsat: urinish.testlar.xatolarni_korsat,
    holati: urinish.holati,
    boshlandi: urinish.boshlandi,
    jamiSavol: urinish.jami_savol,
    togriSoni: urinish.togri_soni,
    ballFoiz: urinish.ball_foiz,
    baho: urinish.baho,
    savollar,
  };
}
