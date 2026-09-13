import { NextResponse } from "next/server";
import { z } from "zod";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { createServiceRoleClient } from "@/lib/supabase/server";

const tanaSxemasi = z.object({ sessiyaId: z.number().int().positive() });

export async function POST(so_rov: Request) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) return NextResponse.json({ xato: "Sessiya topilmadi" }, { status: 401 });

  const tana = await so_rov.json().catch(() => null);
  const tekshiruv = tanaSxemasi.safeParse(tana);
  if (!tekshiruv.success) return NextResponse.json({ xato: "Noto'g'ri so'rov" }, { status: 400 });

  const supabase = createServiceRoleClient();
  await supabase
    .from("mashq_sessiyalar")
    .update({ tugadi: new Date().toISOString() })
    .eq("id", tekshiruv.data.sessiyaId)
    .eq("oquvchi_id", oquvchi.id);

  return NextResponse.json({ ok: true });
}
