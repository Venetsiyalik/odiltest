import { redirect } from "next/navigation";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { KirishKlaviaturasi } from "@/components/student/kirish-klaviatura";

export default async function TalabaKirishPage() {
  const oquvchi = await joriyOquvchiniOl();
  if (oquvchi) redirect("/menyu");

  return <KirishKlaviaturasi />;
}
