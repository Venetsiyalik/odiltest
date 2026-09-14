import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { fanlarniOl, mavzularniOl } from "@/lib/actions/spravochniklar";
import { SmartTestSozlash } from "@/components/admin/smart-test-sozlash";

export default async function SmartTestSahifasi() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [fanlar, mavzular] = await Promise.all([fanlarniOl(), mavzularniOl()]);

  return <SmartTestSozlash fanlar={fanlar ?? []} mavzular={mavzular} />;
}
