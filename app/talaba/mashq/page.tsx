import { redirect } from "next/navigation";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { mashqFanlariniOl, mashqBarchaMavzulariniOl } from "@/lib/talaba/mashq";
import { MashqTanlov } from "@/components/student/mashq-tanlov";

export default async function MashqPage() {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) redirect("/kirish");

  const [fanlar, mavzular] = await Promise.all([
    mashqFanlariniOl(oquvchi.sinfId),
    mashqBarchaMavzulariniOl(oquvchi.sinfId),
  ]);

  return <MashqTanlov fanlar={fanlar} mavzular={mavzular} />;
}
