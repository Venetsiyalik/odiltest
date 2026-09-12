import { createServiceRoleClient } from "@/lib/supabase/server";
import { bahoniHisoblash } from "@/lib/talaba/baholash";

export interface YakunlashNatijasi {
  natijaKorsat: boolean;
  togriSoni: number;
  jamiSavol: number;
  ballFoiz: number;
  baho: number;
}

/**
 * Urinishni "tugallangan" yoki "vaqt_tugadi" holatiga o'tkazadi va ballni
 * hisoblaydi. Ham `/api/urinish/yakunlash` (o'quvchi bosgan), ham
 * `/api/urinish/javob` (vaqt tugagani serverda aniqlanganda) shu funksiyani
 * ishlatadi — hisoblash mantig'i bitta joyda.
 */
export async function urinishniYakunlash(
  urinishId: number,
  holati: "tugallangan" | "vaqt_tugadi",
): Promise<YakunlashNatijasi | null> {
  const supabase = createServiceRoleClient();

  const { data: urinish } = await supabase
    .from("urinishlar")
    .select("jami_savol, testlar(natija_korsat)")
    .eq("id", urinishId)
    .maybeSingle<{ jami_savol: number; testlar: { natija_korsat: boolean } | null }>();

  if (!urinish) return null;

  const { data: javoblar } = await supabase
    .from("urinish_savollari")
    .select("togri_mi")
    .eq("urinish_id", urinishId);

  const togriSoni = (javoblar ?? []).filter((j) => j.togri_mi).length;
  const ballFoiz = urinish.jami_savol > 0 ? (togriSoni / urinish.jami_savol) * 100 : 0;
  const baho = bahoniHisoblash(ballFoiz);

  await supabase
    .from("urinishlar")
    .update({
      holati,
      tugadi: new Date().toISOString(),
      togri_soni: togriSoni,
      ball_foiz: ballFoiz,
      baho,
    })
    .eq("id", urinishId);

  return {
    natijaKorsat: urinish.testlar?.natija_korsat ?? true,
    togriSoni,
    jamiSavol: urinish.jami_savol,
    ballFoiz: Math.round(ballFoiz),
    baho,
  };
}
