import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl, joriyKirishDoirasiniOl } from "@/lib/auth/admin";
import { testlarniOl } from "@/lib/actions/testlar";
import { fanlarniOl, sinflarniOl, mavzularniOl } from "@/lib/actions/spravochniklar";
import { savollarniOl } from "@/lib/actions/savollar";
import { TestlarClient } from "@/components/admin/testlar-client";
import { doiraBoyichaFiltrlash } from "@/lib/utils/select-items";

export default async function TestlarPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [testlar, xomFanlar, xomSinflar, mavzular, savollar, doira] = await Promise.all([
    testlarniOl(),
    fanlarniOl(),
    sinflarniOl(),
    mavzularniOl(),
    savollarniOl(),
    joriyKirishDoirasiniOl(),
  ]);
  const fanlar = doiraBoyichaFiltrlash(xomFanlar ?? [], doira.fanlar, doira.cheklanganmi);
  const sinflar = doiraBoyichaFiltrlash(xomSinflar ?? [], doira.sinflar, doira.cheklanganmi);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Testlar</h1>
      <TestlarClient testlar={testlar} fanlar={fanlar} sinflar={sinflar} mavzular={mavzular} savollar={savollar} />
    </main>
  );
}
