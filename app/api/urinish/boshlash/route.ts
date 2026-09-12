import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { royxatniAralashtirish, variantTartibiniYaratish } from "@/lib/talaba/aralashtirish";

const tanaSxemasi = z.object({ testId: z.number().int().positive() });

interface SavolQatori {
  id: number;
  faol: boolean;
}

export async function POST(so_rov: Request) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) return NextResponse.json({ xato: "Sessiya topilmadi" }, { status: 401 });

  const tana = await so_rov.json().catch(() => null);
  const tekshiruv = tanaSxemasi.safeParse(tana);
  if (!tekshiruv.success) return NextResponse.json({ xato: "Noto'g'ri so'rov" }, { status: 400 });

  const supabase = createServiceRoleClient();
  const { testId } = tekshiruv.data;

  const { data: test } = await supabase
    .from("testlar")
    .select(
      "id, sinf_id, savol_soni, urinishlar_soni, tanlov_turi, aralashtirish, holati, ochilish_vaqti, yopilish_vaqti, fan_id",
    )
    .eq("id", testId)
    .maybeSingle();

  if (!test || test.sinf_id !== oquvchi.sinfId) {
    return NextResponse.json({ xato: "Test topilmadi" }, { status: 404 });
  }

  const hozir = new Date();
  if (
    test.holati !== "faol" ||
    hozir < new Date(test.ochilish_vaqti) ||
    hozir > new Date(test.yopilish_vaqti)
  ) {
    return NextResponse.json({ xato: "Bu test hozir ochiq emas" }, { status: 403 });
  }

  // Tugallanmagan urinish bo'lsa — davom ettiramiz (qayta boshlamaymiz, 3.3-band)
  const { data: faolUrinish } = await supabase
    .from("urinishlar")
    .select("id")
    .eq("oquvchi_id", oquvchi.id)
    .eq("test_id", testId)
    .eq("holati", "boshlangan")
    .maybeSingle();

  if (faolUrinish) {
    return NextResponse.json({ urinishId: faolUrinish.id });
  }

  const { count: yakunlanganSoni } = await supabase
    .from("urinishlar")
    .select("id", { count: "exact", head: true })
    .eq("oquvchi_id", oquvchi.id)
    .eq("test_id", testId);

  if ((yakunlanganSoni ?? 0) >= test.urinishlar_soni) {
    return NextResponse.json({ xato: "Urinishlar soni tugagan" }, { status: 403 });
  }

  // Savollar havzasini aniqlash
  let havza: SavolQatori[] = [];
  if (test.tanlov_turi === "qolda") {
    const { data } = await supabase
      .from("test_savollar")
      .select("savol_id, savollar(id, faol)")
      .eq("test_id", testId)
      .order("tartib");
    havza = (data ?? [])
      .map((q) => q.savollar as unknown as SavolQatori)
      .filter((s) => s?.faol);
  } else {
    const { data: mavzuIdlar } = await supabase
      .from("test_mavzular")
      .select("mavzu_id")
      .eq("test_id", testId);

    const { data } = await supabase
      .from("savollar")
      .select("id, faol")
      .eq("fan_id", test.fan_id)
      .eq("sinf_id", test.sinf_id)
      .eq("faol", true)
      .in("mavzu_id", (mavzuIdlar ?? []).map((m) => m.mavzu_id));
    havza = data ?? [];
  }

  if (havza.length === 0) {
    return NextResponse.json({ xato: "Bu test uchun savollar topilmadi" }, { status: 500 });
  }

  const soni = Math.min(test.savol_soni, havza.length);
  const tanlanganlar = test.aralashtirish
    ? royxatniAralashtirish(havza).slice(0, soni)
    : havza.slice(0, soni);

  const { data: yangiUrinish, error: urinishXatosi } = await supabase
    .from("urinishlar")
    .insert({
      oquvchi_id: oquvchi.id,
      test_id: testId,
      holati: "boshlangan",
      jami_savol: soni,
      qurilma: (await headers()).get("user-agent") ?? null,
    })
    .select("id")
    .single();

  if (urinishXatosi || !yangiUrinish) {
    return NextResponse.json({ xato: "Urinish yaratib bo'lmadi" }, { status: 500 });
  }

  const urinishSavollari = tanlanganlar.map((savol, indeks) => ({
    urinish_id: yangiUrinish.id,
    savol_id: savol.id,
    tartib: indeks,
    variant_tartibi: variantTartibiniYaratish(test.aralashtirish),
  }));

  const { error: qatorlarXatosi } = await supabase
    .from("urinish_savollari")
    .insert(urinishSavollari);

  if (qatorlarXatosi) {
    await supabase.from("urinishlar").delete().eq("id", yangiUrinish.id);
    return NextResponse.json({ xato: "Savollarni saqlab bo'lmadi" }, { status: 500 });
  }

  return NextResponse.json({ urinishId: yangiUrinish.id });
}
