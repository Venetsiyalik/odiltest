import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { testlarniOl } from "@/lib/actions/testlar";
import { fanlarniOl, sinflarniOl, mavzularniOl } from "@/lib/actions/spravochniklar";
import { savollarniOl } from "@/lib/actions/savollar";
import { TestlarClient } from "@/components/admin/testlar-client";

export default async function TestlarPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [testlar, fanlar, sinflar, mavzular, savollar] = await Promise.all([
    testlarniOl(),
    fanlarniOl(),
    sinflarniOl(),
    mavzularniOl(),
    savollarniOl(),
  ]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Testlar</h1>
      <TestlarClient testlar={testlar} fanlar={fanlar} sinflar={sinflar} mavzular={mavzular} savollar={savollar} />
    </main>
  );
}
