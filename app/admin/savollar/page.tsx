import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl, joriyKirishDoirasiniOl } from "@/lib/auth/admin";
import { fanlarniOl, sinflarniOl, mavzularniOl } from "@/lib/actions/spravochniklar";
import { savollarniOl, savolStatistikalariniOl } from "@/lib/actions/savollar";
import { SavollarClient } from "@/components/admin/savollar-client";
import { doiraBoyichaFiltrlash } from "@/lib/utils/select-items";

export default async function SavollarPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [fanlar, sinflar, mavzular, savollar, doira] = await Promise.all([
    fanlarniOl(),
    sinflarniOl(),
    mavzularniOl(),
    savollarniOl(),
    joriyKirishDoirasiniOl(),
  ]);

  const statistika = await savolStatistikalariniOl(savollar.map((s) => s.id));

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Savollar bazasi</h1>
      <SavollarClient
        boshlangichSavollar={savollar}
        boshlangichStatistika={statistika}
        fanlar={doiraBoyichaFiltrlash(fanlar, doira.fanlar, doira.cheklanganmi)}
        sinflar={doiraBoyichaFiltrlash(sinflar, doira.sinflar, doira.cheklanganmi)}
        mavzular={mavzular}
      />
    </main>
  );
}
