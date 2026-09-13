import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { fanlarniOl, sinflarniOl } from "@/lib/actions/spravochniklar";
import { testlarniOl } from "@/lib/actions/testlar";
import { natijalarniOl, engQiyinSavollarniOl } from "@/lib/actions/natijalar";
import { NatijalarClient } from "@/components/admin/natijalar-client";

export default async function NatijalarPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [fanlar, sinflar, testlar, natijalar] = await Promise.all([
    fanlarniOl(),
    sinflarniOl(),
    testlarniOl(),
    natijalarniOl(),
  ]);

  const qiyinSavollar = await engQiyinSavollarniOl(natijalar.map((n) => n.urinishId));

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Natijalar va hisobotlar</h1>
      <NatijalarClient
        boshlangichNatijalar={natijalar}
        boshlangichQiyinSavollar={qiyinSavollar}
        fanlar={fanlar}
        sinflar={sinflar}
        testlar={testlar}
      />
    </main>
  );
}
