import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { fanlarniOl, sinflarniOl, mavzularniOl } from "@/lib/actions/spravochniklar";
import { MateriallarClient } from "@/components/admin/materiallar-client";

export default async function MateriallarPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [fanlar, sinflar, mavzular] = await Promise.all([
    fanlarniOl(),
    sinflarniOl(),
    mavzularniOl(),
  ]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">O&apos;quv materiallari</h1>
      <MateriallarClient fanlar={fanlar} sinflar={sinflar} mavzular={mavzular} />
    </main>
  );
}
