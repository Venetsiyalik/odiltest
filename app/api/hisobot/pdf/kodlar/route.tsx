import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { dejaVuShriftiniRoyxatdanOtkazish } from "@/lib/pdf/shrift";
import { KirishKodlariHisoboti } from "@/lib/pdf/documents/KirishKodlari";

export async function GET(so_rov: Request) {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) return NextResponse.json({ xato: "Ruxsat yo'q" }, { status: 401 });

  const url = new URL(so_rov.url);
  const sinfId = Number(url.searchParams.get("sinfId"));
  if (!Number.isInteger(sinfId) || sinfId <= 0) {
    return NextResponse.json({ xato: "sinfId noto'g'ri" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: sinf } = await supabase.from("sinflar").select("nomi").eq("id", sinfId).maybeSingle();
  if (!sinf) return NextResponse.json({ xato: "Sinf topilmadi" }, { status: 404 });

  const { data: oquvchilar } = await supabase
    .from("oquvchilar")
    .select("ism_familiya, kirish_kodi")
    .eq("sinf_id", sinfId)
    .eq("faol", true)
    .order("ism_familiya");

  dejaVuShriftiniRoyxatdanOtkazish();

  const buffer = await renderToBuffer(
    <KirishKodlariHisoboti
      maktabNomi="Odil School"
      kartalar={(oquvchilar ?? []).map((o) => ({
        ismFamiliya: o.ism_familiya,
        sinfNomi: sinf.nomi,
        kirishKodi: o.kirish_kodi,
      }))}
    />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="kirish-kodlari-${sinf.nomi}.pdf"`,
    },
  });
}
