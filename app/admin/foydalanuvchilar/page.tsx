import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { TezOrada } from "@/components/admin/tez-orada";

export default async function FoydalanuvchilarPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");
  if (foydalanuvchi.rol !== "admin") redirect("/dashboard");
  return <TezOrada boUlim="Foydalanuvchilar" />;
}
