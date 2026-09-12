import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import crypto from "node:crypto";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { SESSIYA_COOKIE, SESSIYA_MUDDATI_SONIYA } from "@/lib/auth/student";
import { uz } from "@/lib/i18n/uz";

const MAX_XATO_URINISH = 5;
const BLOK_DAQIQA = 10;

const kodSxemasi = z.object({ kirishKodi: z.string().regex(/^\d{6}$/) });

interface OquvchiQatori {
  id: number;
  ism_familiya: string;
  faol: boolean;
  sinflar: { nomi: string } | null;
}

export async function POST(so_rov: Request) {
  const tana = await so_rov.json().catch(() => null);
  const tekshiruv = kodSxemasi.safeParse(tana);
  if (!tekshiruv.success) {
    return NextResponse.json({ xato: "Kod 6 xonali raqam bo'lishi kerak" }, { status: 400 });
  }

  const sarlavhalar = await headers();
  const ip =
    sarlavhalar.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    sarlavhalar.get("x-real-ip") ||
    "noma'lum";

  const supabase = createServiceRoleClient();

  const blokChegarasi = new Date(Date.now() - BLOK_DAQIQA * 60 * 1000).toISOString();
  const { data: songiUrinishlar } = await supabase
    .from("kirish_urinishlari")
    .select("muvaffaqiyatli")
    .eq("ip_manzil", ip)
    .gte("created_at", blokChegarasi);

  const xatoSoni = (songiUrinishlar ?? []).filter((u) => !u.muvaffaqiyatli).length;
  if (xatoSoni >= MAX_XATO_URINISH) {
    return NextResponse.json({ xato: uz.talaba.kirish.judaKopUrinish }, { status: 429 });
  }

  const { data: oquvchi } = await supabase
    .from("oquvchilar")
    .select("id, ism_familiya, faol, sinflar(nomi)")
    .eq("kirish_kodi", tekshiruv.data.kirishKodi)
    .maybeSingle<OquvchiQatori>();

  await supabase.from("kirish_urinishlari").insert({
    ip_manzil: ip,
    muvaffaqiyatli: Boolean(oquvchi?.faol),
  });

  if (!oquvchi || !oquvchi.faol) {
    return NextResponse.json({ xato: uz.talaba.kirish.kodNotogri }, { status: 404 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const amalQiladi = new Date(Date.now() + SESSIYA_MUDDATI_SONIYA * 1000).toISOString();

  const { error: sessiyaXatosi } = await supabase.from("sessiyalar").insert({
    token,
    oquvchi_id: oquvchi.id,
    qurilma: sarlavhalar.get("user-agent") ?? null,
    amal_qiladi: amalQiladi,
  });

  if (sessiyaXatosi) {
    return NextResponse.json({ xato: "Kirishda xatolik yuz berdi" }, { status: 500 });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSIYA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSIYA_MUDDATI_SONIYA,
  });

  return NextResponse.json({
    ismFamiliya: oquvchi.ism_familiya,
    sinfNomi: oquvchi.sinflar?.nomi ?? "",
  });
}
