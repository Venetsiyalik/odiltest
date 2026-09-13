import { NextResponse } from "next/server";
import { z } from "zod";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { royxatniAralashtirish } from "@/lib/talaba/aralashtirish";

const tanaSxemasi = z.object({
  fanId: z.number().int().positive(),
  mavzuId: z.number().int().positive().nullable(),
  korilganSavolIdlar: z.array(z.number().int().positive()),
  faqatIdlar: z.array(z.number().int().positive()).optional(),
});

export async function POST(so_rov: Request) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) return NextResponse.json({ xato: "Sessiya topilmadi" }, { status: 401 });

  const tana = await so_rov.json().catch(() => null);
  const tekshiruv = tanaSxemasi.safeParse(tana);
  if (!tekshiruv.success) return NextResponse.json({ xato: "Noto'g'ri so'rov" }, { status: 400 });

  const { fanId, mavzuId, korilganSavolIdlar, faqatIdlar } = tekshiruv.data;
  const supabase = createServiceRoleClient();

  let so_rov_db = supabase
    .from("savollar")
    .select("id, matn, rasm_url, variant_a, variant_b, variant_c, variant_d")
    .eq("fan_id", fanId)
    .eq("sinf_id", oquvchi.sinfId)
    .eq("faol", true);

  if (mavzuId) so_rov_db = so_rov_db.eq("mavzu_id", mavzuId);
  // "Xato qilingan savollarni qayta ishlash" rejimi — havzani faqat shu
  // ro'yxatdagi savollar bilan cheklaydi.
  if (faqatIdlar && faqatIdlar.length > 0) so_rov_db = so_rov_db.in("id", faqatIdlar);
  if (korilganSavolIdlar.length > 0) so_rov_db = so_rov_db.not("id", "in", `(${korilganSavolIdlar.join(",")})`);

  const { data } = await so_rov_db;

  if (!data || data.length === 0) {
    return NextResponse.json({ tugadi: true });
  }

  const savol = royxatniAralashtirish(data)[0];

  return NextResponse.json({
    savolId: savol.id,
    matn: savol.matn,
    rasmUrl: savol.rasm_url,
    variantlar: {
      A: savol.variant_a,
      B: savol.variant_b,
      C: savol.variant_c,
      D: savol.variant_d,
    },
  });
}
