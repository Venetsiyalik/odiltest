import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl, joriyKirishDoirasiniOl } from "@/lib/auth/admin";
import { fanlarniOl, sinflarniOl, mavzularniOl } from "@/lib/actions/spravochniklar";
import { KontentClient } from "@/components/admin/kontent-client";
import { doiraBoyichaFiltrlash } from "@/lib/utils/select-items";

export default async function KontentPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [xomFanlar, xomSinflar, mavzular, doira] = await Promise.all([
    fanlarniOl(),
    sinflarniOl(),
    mavzularniOl(),
    joriyKirishDoirasiniOl(),
  ]);
  const fanlar = doiraBoyichaFiltrlash(xomFanlar, doira.fanlar, doira.cheklanganmi);
  const sinflar = doiraBoyichaFiltrlash(xomSinflar, doira.sinflar, doira.cheklanganmi);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Kontent (Dashboard uchun)</h1>
      <KontentClient fanlar={fanlar} sinflar={sinflar} mavzular={mavzular} />
    </main>
  );
}
