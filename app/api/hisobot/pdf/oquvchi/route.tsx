import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { natijalarniOl } from "@/lib/actions/natijalar";
import { sanaFormat } from "@/lib/utils/sana";
import { dejaVuShriftiniRoyxatdanOtkazish } from "@/lib/pdf/shrift";
import { OquvchiTabeliHisoboti, type OquvchiTabeliQatori } from "@/lib/pdf/documents/OquvchiTabeli";

export async function GET(so_rov: Request) {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) return NextResponse.json({ xato: "Ruxsat yo'q" }, { status: 401 });

  const url = new URL(so_rov.url);
  const oquvchiId = Number(url.searchParams.get("oquvchiId"));
  if (!Number.isInteger(oquvchiId) || oquvchiId <= 0) {
    return NextResponse.json({ xato: "oquvchiId noto'g'ri" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: oquvchi } = await supabase
    .from("oquvchilar")
    .select("ism_familiya, sinflar(nomi)")
    .eq("id", oquvchiId)
    .maybeSingle<{ ism_familiya: string; sinflar: { nomi: string } | null }>();

  if (!oquvchi) return NextResponse.json({ xato: "O'quvchi topilmadi" }, { status: 404 });

  const natijalar = await natijalarniOl({ oquvchiId });

  const qatorlarFanBoyicha: Record<string, OquvchiTabeliQatori[]> = {};
  for (const n of natijalar) {
    const fan = n.fanNomi || "Boshqa";
    if (!qatorlarFanBoyicha[fan]) qatorlarFanBoyicha[fan] = [];
    qatorlarFanBoyicha[fan].push({
      fanNomi: fan,
      testNomi: n.testNomi,
      sana: sanaFormat(n.boshlandi),
      togriSoni: n.togriSoni,
      jamiSavol: n.jamiSavol,
      ballFoiz: n.ballFoiz,
      baho: n.baho,
    });
  }

  dejaVuShriftiniRoyxatdanOtkazish();

  const buffer = await renderToBuffer(
    <OquvchiTabeliHisoboti
      maktabNomi="Odil School"
      oquvchiIsmFamiliya={oquvchi.ism_familiya}
      sinfNomi={oquvchi.sinflar?.nomi ?? ""}
      sana={sanaFormat(new Date())}
      qatorlarFanBoyicha={qatorlarFanBoyicha}
    />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="tabel-${oquvchiId}.pdf"`,
    },
  });
}
