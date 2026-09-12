import { NextResponse } from "next/server";
import { z } from "zod";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { urinishniYakunlash } from "@/lib/talaba/urinish-yakunlash";

const tanaSxemasi = z.object({ urinishId: z.number().int().positive() });

export async function POST(so_rov: Request) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) return NextResponse.json({ xato: "Sessiya topilmadi" }, { status: 401 });

  const tana = await so_rov.json().catch(() => null);
  const tekshiruv = tanaSxemasi.safeParse(tana);
  if (!tekshiruv.success) return NextResponse.json({ xato: "Noto'g'ri so'rov" }, { status: 400 });

  const { urinishId } = tekshiruv.data;
  const supabase = createServiceRoleClient();

  const { data: urinish } = await supabase
    .from("urinishlar")
    .select("id, oquvchi_id, holati")
    .eq("id", urinishId)
    .maybeSingle();

  if (!urinish || urinish.oquvchi_id !== oquvchi.id) {
    return NextResponse.json({ xato: "Urinish topilmadi" }, { status: 404 });
  }
  if (urinish.holati !== "boshlangan") {
    return NextResponse.json({ xato: "Bu urinish allaqachon yakunlangan" }, { status: 409 });
  }

  const natija = await urinishniYakunlash(urinishId, "tugallangan");
  if (!natija) return NextResponse.json({ xato: "Yakunlab bo'lmadi" }, { status: 500 });

  return NextResponse.json(natija);
}
