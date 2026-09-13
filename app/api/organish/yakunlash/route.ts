import { NextResponse } from "next/server";
import { z } from "zod";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { createServiceRoleClient } from "@/lib/supabase/server";

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
  return NextResponse.json({ ok: true });
}
