import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { dejaVuShriftiniRoyxatdanOtkazish } from "@/lib/pdf/shrift";
import { UygaVazifaKartasi } from "@/lib/pdf/documents/UygaVazifaKartasi";

export async function GET(so_rov: Request) {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) return NextResponse.json({ xato: "Ruxsat yo'q" }, { status: 401 });

  const url = new URL(so_rov.url);
  const topshiriqId = Number(url.searchParams.get("topshiriqId"));
  if (!Number.isInteger(topshiriqId) || topshiriqId <= 0) {
    return NextResponse.json({ xato: "topshiriqId noto'g'ri" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: topshiriq } = await supabase
    .from("yordam_topshiriqlari")
    .select("matn, oquvchilar(ism_familiya, sinflar(nomi)), mavzular(nomi)")
    .eq("id", topshiriqId)
    .maybeSingle();

  if (!topshiriq) return NextResponse.json({ xato: "Topshiriq topilmadi" }, { status: 404 });

  const malumot = topshiriq as unknown as {
    matn: string;
    oquvchilar: { ism_familiya: string; sinflar: { nomi: string } | null } | null;
    mavzular: { nomi: string } | null;
  };

  dejaVuShriftiniRoyxatdanOtkazish();

  const buffer = await renderToBuffer(
    <UygaVazifaKartasi
      maktabNomi="Odil School"
      malumot={{
        ismFamiliya: malumot.oquvchilar?.ism_familiya ?? "",
        sinfNomi: malumot.oquvchilar?.sinflar?.nomi ?? "",
        mavzuNomi: malumot.mavzular?.nomi ?? null,
        matn: malumot.matn,
      }}
    />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="yordam-topshirigi-${topshiriqId}.pdf"`,
    },
  });
}
