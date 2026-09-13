import { NextResponse, after } from "next/server";
import { z } from "zod";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { xpBerish, qatiyatliNishoniniBerish } from "@/lib/redizayn/gamifikatsiya";

const tanaSxemasi = z.object({
  savolId: z.number().int().positive(),
  tanlanganJavob: z.enum(["A", "B", "C", "D"]),
  mashqSessiyaId: z.number().int().positive().optional(),
  // REDIZAYN.md 5.3-band ("Qat'iyatli" nishoni) — klient "xato qilingan
  // savollarni qayta ishlash" rejimida ekanini bildiradi.
  qaytaUrinish: z.boolean().optional(),
});

/**
 * Mashq va o'z-o'zini tekshirish rejimlari uchun umumiy javob tekshiruvi.
 * Bu — real test emas (ball qo'yilmaydi, 4.1-4.2-bandlar), shuning uchun
 * bu yerda to'g'ri javob va izoh o'quvchiga darhol qaytariladi (o'rganish
 * uchun zarur) — testdagi qat'iy maxfiylik qoidasi (9.1-band) faqat
 * /api/urinish/javob'ga tegishli.
 */
export async function POST(so_rov: Request) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) return NextResponse.json({ xato: "Sessiya topilmadi" }, { status: 401 });

  const tana = await so_rov.json().catch(() => null);
  const tekshiruv = tanaSxemasi.safeParse(tana);
  if (!tekshiruv.success) return NextResponse.json({ xato: "Noto'g'ri so'rov" }, { status: 400 });

  const { savolId, tanlanganJavob, mashqSessiyaId, qaytaUrinish } = tekshiruv.data;
  const supabase = createServiceRoleClient();

  const { data: savol } = await supabase
    .from("savollar")
    .select("togri_javob, izoh")
    .eq("id", savolId)
    .maybeSingle();

  if (!savol) return NextResponse.json({ xato: "Savol topilmadi" }, { status: 404 });

  const togriMi = savol.togri_javob === tanlanganJavob;

  if (mashqSessiyaId) {
    const { data: sessiya } = await supabase
      .from("mashq_sessiyalar")
      .select("oquvchi_id, savol_soni, togri_soni")
      .eq("id", mashqSessiyaId)
      .maybeSingle();

    if (sessiya && sessiya.oquvchi_id === oquvchi.id) {
      await supabase
        .from("mashq_sessiyalar")
        .update({
          savol_soni: sessiya.savol_soni + 1,
          togri_soni: sessiya.togri_soni + (togriMi ? 1 : 0),
        })
        .eq("id", mashqSessiyaId);

      // REDIZAYN.md 5.1-band: "Mashqda to'g'ri javob +2". Faqat haqiqiy
      // mashq uchun (organish o'z-o'zini tekshirishi shu yo'lni
      // ulashadi, lekin mashqSessiyaId'siz chaqiriladi). `after()` orqali —
      // javobni sekinlashtirmasin, lekin serverless funksiya to'liq
      // bajarilgunicha ishlab tursin (oddiy "fire-and-forget" bunga
      // kafolat bermaydi).
      if (togriMi) {
        after(async () => {
          await xpBerish(oquvchi.id, 2, "mashq_togri");
          if (qaytaUrinish) await qatiyatliNishoniniBerish(oquvchi.id);
        });
      }
    }
  }

  return NextResponse.json({
    togriMi,
    togriJavob: savol.togri_javob,
    izoh: savol.izoh,
  });
}
