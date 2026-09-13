import { NextResponse } from "next/server";
import { z } from "zod";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { createServiceRoleClient } from "@/lib/supabase/server";

const tanaSxemasi = z.object({
  fanId: z.number().int().positive(),
  mavzuId: z.number().int().positive().nullable(),
});

export async function POST(so_rov: Request) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) return NextResponse.json({ xato: "Sessiya topilmadi" }, { status: 401 });

  const tana = await so_rov.json().catch(() => null);
  const tekshiruv = tanaSxemasi.safeParse(tana);
  if (!tekshiruv.success) return NextResponse.json({ xato: "Noto'g'ri so'rov" }, { status: 400 });

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("mashq_sessiyalar")
    .insert({
      oquvchi_id: oquvchi.id,
      fan_id: tekshiruv.data.fanId,
      mavzu_id: tekshiruv.data.mavzuId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ xato: "Mashqni boshlab bo'lmadi" }, { status: 500 });
  }

  return NextResponse.json({ sessiyaId: data.id });
}
