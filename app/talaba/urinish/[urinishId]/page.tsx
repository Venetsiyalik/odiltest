import { redirect, notFound } from "next/navigation";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { urinishDetaliniOl } from "@/lib/talaba/urinish-detali";
import { TestEkrani } from "@/components/student/test-ekrani";
import { TestNatijasi } from "@/components/student/test-natijasi";

export default async function UrinishPage({
  params,
}: {
  params: Promise<{ urinishId: string }>;
}) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) redirect("/kirish");

  const { urinishId } = await params;
  const id = Number(urinishId);
  if (!Number.isInteger(id)) notFound();

  const detali = await urinishDetaliniOl(id, oquvchi.id);
  if (!detali) notFound();

  if (detali.holati !== "boshlangan") {
    return (
      <TestNatijasi
        natijaKorsat={detali.natijaKorsat}
        togriSoni={detali.togriSoni ?? 0}
        jamiSavol={detali.jamiSavol}
        ballFoiz={Math.round(detali.ballFoiz ?? 0)}
        baho={detali.baho ?? 0}
        vaqtTugaganmi={detali.holati === "vaqt_tugadi"}
      />
    );
  }

  return <TestEkrani detali={detali} />;
}
