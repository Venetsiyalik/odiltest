import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { GildirakSessiya } from "@/components/admin/gildirak-sessiya";

export default async function GildirakSessiyaSahifasi() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  return <GildirakSessiya />;
}
