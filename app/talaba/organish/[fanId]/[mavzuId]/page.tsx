import { redirect, notFound } from "next/navigation";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { mavzuDetaliniOl } from "@/lib/talaba/organish";
import { OrganishEkrani } from "@/components/student/organish-ekrani";

export default async function MavzuOrganishPage({
  params,
}: {
  params: Promise<{ fanId: string; mavzuId: string }>;
}) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) redirect("/kirish");

  const { mavzuId } = await params;
  const mavzuIdRaqami = Number(mavzuId);
  if (!Number.isInteger(mavzuIdRaqami)) notFound();

  const detali = await mavzuDetaliniOl(mavzuIdRaqami);
  if (!detali) notFound();

  return <OrganishEkrani mavzuId={mavzuIdRaqami} detali={detali} />;
}
