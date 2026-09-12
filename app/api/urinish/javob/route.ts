import { NextResponse } from "next/server";
import { z } from "zod";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Variant, VariantTartibi } from "@/lib/talaba/aralashtirish";
import { urinishniYakunlash } from "@/lib/talaba/urinish-yakunlash";

const tanaSxemasi = z.object({
  urinishId: z.number().int().positive(),
  savolId: z.number().int().positive(),
  tanlanganJavob: z.enum(["A", "B", "C", "D"]).nullable(),
  belgilangan: z.boolean().optional(),
});

export async function POST(so_rov: Request) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) return NextResponse.json({ xato: "Sessiya topilmadi" }, { status: 401 });

  const tana = await so_rov.json().catch(() => null);
  const tekshiruv = tanaSxemasi.safeParse(tana);
  if (!tekshiruv.success) return NextResponse.json({ xato: "Noto'g'ri so'rov" }, { status: 400 });

  const { urinishId, savolId, tanlanganJavob, belgilangan } = tekshiruv.data;
  const supabase = createServiceRoleClient();

  const { data: urinish } = await supabase
    .from("urinishlar")
    .select("id, oquvchi_id, holati, boshlandi, testlar(vaqt_daqiqa)")
    .eq("id", urinishId)
    .maybeSingle<{
      id: number;
      oquvchi_id: number;
      holati: string;
      boshlandi: string;
      testlar: { vaqt_daqiqa: number } | null;
    }>();

  if (!urinish || urinish.oquvchi_id !== oquvchi.id) {
    return NextResponse.json({ xato: "Urinish topilmadi" }, { status: 404 });
  }

  if (urinish.holati !== "boshlangan") {
    return NextResponse.json({ xato: "Bu urinish yakunlangan" }, { status: 409 });
  }

  const vaqtDaqiqa = urinish.testlar?.vaqt_daqiqa ?? 0;
  const tugashVaqti = new Date(urinish.boshlandi).getTime() + vaqtDaqiqa * 60 * 1000;
  if (Date.now() > tugashVaqti) {
    const natija = await urinishniYakunlash(urinishId, "vaqt_tugadi");
    return NextResponse.json({ vaqtTugadi: true, natija });
  }

  const { data: urinishSavoli } = await supabase
    .from("urinish_savollari")
    .select("variant_tartibi, savollar(togri_javob)")
    .eq("urinish_id", urinishId)
    .eq("savol_id", savolId)
    .maybeSingle<{ variant_tartibi: VariantTartibi; savollar: { togri_javob: Variant } | null }>();

  if (!urinishSavoli) {
    return NextResponse.json({ xato: "Savol bu urinishga tegishli emas" }, { status: 404 });
  }

  let togriMi: boolean | null = null;
  if (tanlanganJavob) {
    const aslHarf = urinishSavoli.variant_tartibi[tanlanganJavob];
    togriMi = aslHarf === urinishSavoli.savollar?.togri_javob;
  }

  const yangilanadigan: Record<string, unknown> = {
    tanlangan_javob: tanlanganJavob,
    togri_mi: togriMi,
    javob_vaqti: new Date().toISOString(),
  };
  if (belgilangan !== undefined) yangilanadigan.belgilangan = belgilangan;

  const { error } = await supabase
    .from("urinish_savollari")
    .update(yangilanadigan)
    .eq("urinish_id", urinishId)
    .eq("savol_id", savolId);

  if (error) return NextResponse.json({ xato: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
