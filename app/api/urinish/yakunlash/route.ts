import { NextResponse } from "next/server";
import { z } from "zod";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { urinishniYakunlash } from "@/lib/talaba/urinish-yakunlash";
import { xpBerish } from "@/lib/redizayn/gamifikatsiya";

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

  // REDIZAYN.md 5.1 va 5.6-band: "Rasmiy testni topshirish +30",
  // "90%+ natija +20 qo'shimcha" — lekin test ekranida gamifikatsiya
  // ko'rsatilmaydi, faqat natija ekranida (shu javobga qo'shimcha
  // maydonlar sifatida — mavjud maydonlar o'zgarmagan/o'chirilmagan,
  // faqat qo'shilgan). Bu — kamdan-kam sodir bo'ladigan harakat, shuning
  // uchun (mashqdan farqli) to'g'ridan-to'g'ri kutiladi — natija
  // ekranida darhol "daraja oshdi"/"yangi nishon" ko'rsatish uchun.
  const xpMiqdori = 30 + (natija.ballFoiz >= 90 ? 20 : 0);
  const xpNatijasi = await xpBerish(oquvchi.id, xpMiqdori, "test_topshirildi");

  return NextResponse.json({ ...natija, xpOlindi: xpMiqdori, ...xpNatijasi });
}
