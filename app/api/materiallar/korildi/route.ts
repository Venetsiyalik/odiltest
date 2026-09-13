import { NextResponse } from "next/server";
import { z } from "zod";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { createServiceRoleClient } from "@/lib/supabase/server";

const tanaSxemasi = z.object({
  materialId: z.number().int().positive(),
});

/**
 * Material ko'rilganini qayd etadi (REDIZAYN.md 8-bo'lim: material_korildi).
 * Faqat kirish kodi bilan kirgan o'quvchi uchun; mehmon uchun hech narsa
 * yozilmaydi (401 emas — bu kutilgan holat, xato emas).
 */
export async function POST(so_rov: Request) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) return NextResponse.json({ yozildi: false });

  const tana = await so_rov.json().catch(() => null);
  const tekshiruv = tanaSxemasi.safeParse(tana);
  if (!tekshiruv.success) return NextResponse.json({ xato: "Noto'g'ri so'rov" }, { status: 400 });

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("material_korildi")
    .upsert(
      { oquvchi_id: oquvchi.id, material_id: tekshiruv.data.materialId, korildi: new Date().toISOString() },
      { onConflict: "oquvchi_id,material_id" },
    );

  if (error) return NextResponse.json({ xato: error.message }, { status: 500 });
  return NextResponse.json({ yozildi: true });
}
