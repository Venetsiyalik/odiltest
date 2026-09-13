import { NextResponse } from "next/server";
import { z } from "zod";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { avatarniTanlash } from "@/lib/redizayn/gamifikatsiya";

const tanaSxemasi = z.object({ avatarKodi: z.string().min(1) });

export async function POST(so_rov: Request) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) return NextResponse.json({ xato: "Sessiya topilmadi" }, { status: 401 });

  const tana = await so_rov.json().catch(() => null);
  const tekshiruv = tanaSxemasi.safeParse(tana);
  if (!tekshiruv.success) return NextResponse.json({ xato: "Noto'g'ri so'rov" }, { status: 400 });

  const natija = await avatarniTanlash(oquvchi.id, tekshiruv.data.avatarKodi);
  if (natija.xato) return NextResponse.json(natija, { status: 400 });
  return NextResponse.json({ ok: true });
}
