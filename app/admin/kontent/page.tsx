import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { fanlarniOl, sinflarniOl, mavzularniOl } from "@/lib/actions/spravochniklar";
import { KontentClient } from "@/components/admin/kontent-client";

export default async function KontentPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [fanlar, sinflar, mavzular] = await Promise.all([fanlarniOl(), sinflarniOl(), mavzularniOl()]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Kontent (Dashboard uchun)</h1>
      <KontentClient fanlar={fanlar} sinflar={sinflar} mavzular={mavzular} />
    </main>
  );
}
