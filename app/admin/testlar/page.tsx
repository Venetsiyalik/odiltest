import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { TezOrada } from "@/components/admin/tez-orada";

export default async function TestlarPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");
  return <TezOrada boUlim="Testlar" />;
}
