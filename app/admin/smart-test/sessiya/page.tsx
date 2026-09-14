import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { SmartTestSessiya } from "@/components/admin/smart-test-sessiya";

export default async function SmartTestSessiyaSahifasi() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  return <SmartTestSessiya />;
}
