import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { fanlarniOl, sinflarniOl, mavzularniOl } from "@/lib/actions/spravochniklar";
import { savollarniOl, savolStatistikalariniOl } from "@/lib/actions/savollar";
import { SavollarClient } from "@/components/admin/savollar-client";

export default async function SavollarPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [fanlar, sinflar, mavzular, savollar] = await Promise.all([
    fanlarniOl(),
    sinflarniOl(),
    mavzularniOl(),
    savollarniOl(),
  ]);

  const statistika = await savolStatistikalariniOl(savollar.map((s) => s.id));

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Savollar bazasi</h1>
      <SavollarClient
        boshlangichSavollar={savollar}
        boshlangichStatistika={statistika}
        fanlar={fanlar}
        sinflar={sinflar}
        mavzular={mavzular}
      />
    </main>
  );
}
