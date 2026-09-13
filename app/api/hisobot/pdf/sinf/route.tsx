import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { natijalarniOl, engQiyinSavollarniOl } from "@/lib/actions/natijalar";
import { sanaFormat } from "@/lib/utils/sana";
import { dejaVuShriftiniRoyxatdanOtkazish } from "@/lib/pdf/shrift";
import { SinfNatijalariHisoboti } from "@/lib/pdf/documents/SinfNatijalari";

export async function GET(so_rov: Request) {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) return NextResponse.json({ xato: "Ruxsat yo'q" }, { status: 401 });

  const url = new URL(so_rov.url);
  const testId = Number(url.searchParams.get("testId"));
  if (!Number.isInteger(testId) || testId <= 0) {
    return NextResponse.json({ xato: "testId noto'g'ri" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: test } = await supabase
    .from("testlar")
    .select("nomi, ochilish_vaqti, fanlar(nomi), sinflar(nomi), created_by")
    .eq("id", testId)
    .maybeSingle<{
      nomi: string;
      ochilish_vaqti: string;
      fanlar: { nomi: string } | null;
      sinflar: { nomi: string } | null;
      created_by: string | null;
    }>();

  if (!test) return NextResponse.json({ xato: "Test topilmadi" }, { status: 404 });

  let oqituvchiIsmi = "—";
  if (test.created_by) {
    const { data: profil } = await supabase
      .from("foydalanuvchilar")
      .select("ism_familiya")
      .eq("id", test.created_by)
      .maybeSingle();
    if (profil) oqituvchiIsmi = profil.ism_familiya;
  }

  const natijalar = await natijalarniOl({ testId });
  const qiyinSavollar = await engQiyinSavollarniOl(natijalar.map((n) => n.urinishId));

  dejaVuShriftiniRoyxatdanOtkazish();

  const buffer = await renderToBuffer(
    <SinfNatijalariHisoboti
      maktabNomi="Odil School"
      fanNomi={test.fanlar?.nomi ?? ""}
      sinfNomi={test.sinflar?.nomi ?? ""}
      testNomi={test.nomi}
      sana={sanaFormat(test.ochilish_vaqti)}
      oqituvchiIsmi={oqituvchiIsmi}
      qatorlar={natijalar.map((n) => ({
        ismFamiliya: n.oquvchiIsmFamiliya,
        togriSoni: n.togriSoni,
        jamiSavol: n.jamiSavol,
        ballFoiz: n.ballFoiz,
        baho: n.baho,
        vaqtDaqiqa: n.tugadi
          ? Math.round((new Date(n.tugadi).getTime() - new Date(n.boshlandi).getTime()) / 60000)
          : null,
      }))}
      qiyinSavollar={qiyinSavollar.map((s) => ({ matn: s.matn, togriFoiz: s.togriFoiz }))}
    />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="sinf-natijalari-${testId}.pdf"`,
    },
  });
}
