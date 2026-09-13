import { NextResponse } from "next/server";
import { z } from "zod";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { xpBerish } from "@/lib/redizayn/gamifikatsiya";

const tanaSxemasi = z.object({
  mavzuId: z.number().int().positive(),
  oziniTekshirishFoiz: z.number().min(0).max(100),
});

export async function POST(so_rov: Request) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) return NextResponse.json({ xato: "Sessiya topilmadi" }, { status: 401 });

  const tana = await so_rov.json().catch(() => null);
  const tekshiruv = tanaSxemasi.safeParse(tana);
  if (!tekshiruv.success) return NextResponse.json({ xato: "Noto'g'ri so'rov" }, { status: 400 });

  const supabase = createServiceRoleClient();

  // REDIZAYN.md 5.1-band: "Mavzuni o'rganib tugatish +20" — faqat
  // BIRINCHI marta organilganda (qayta tashrifda qayta berilmasin).
  const { data: mavjudProgress } = await supabase
    .from("progress")
    .select("organildi")
    .eq("oquvchi_id", oquvchi.id)
    .eq("mavzu_id", tekshiruv.data.mavzuId)
    .maybeSingle();
  const birinchiMarta = !mavjudProgress?.organildi;

  const { error } = await supabase.from("progress").upsert(
    {
      oquvchi_id: oquvchi.id,
      mavzu_id: tekshiruv.data.mavzuId,
      organildi: true,
      ozini_tekshirish_foiz: tekshiruv.data.oziniTekshirishFoiz,
      yangilandi: new Date().toISOString(),
    },
    { onConflict: "oquvchi_id,mavzu_id" },
  );

  if (error) return NextResponse.json({ xato: error.message }, { status: 500 });

  // Kamdan-kam (bir mavzuga bir marta) harakat — to'g'ridan-to'g'ri
  // kutiladi, shunda klient "daraja oshdi"/"yangi nishon"ni darhol
  // ko'rsata oladi.
  const xpNatijasi = birinchiMarta ? await xpBerish(oquvchi.id, 20, "mavzu_organildi") : null;

  return NextResponse.json({ ok: true, xpOlindi: birinchiMarta ? 20 : 0, ...xpNatijasi });
}
