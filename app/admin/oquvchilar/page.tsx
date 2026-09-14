import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl, joriyKirishDoirasiniOl } from "@/lib/auth/admin";
import { oquvchilarniOl } from "@/lib/actions/oquvchilar";
import { sinflarniOl } from "@/lib/actions/spravochniklar";
import { OquvchilarClient } from "@/components/admin/oquvchilar-client";
import { doiraBoyichaFiltrlash } from "@/lib/utils/select-items";

export default async function OquvchilarPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [oquvchilar, xomSinflar, doira] = await Promise.all([
    oquvchilarniOl(),
    sinflarniOl(),
    joriyKirishDoirasiniOl(),
  ]);
  const sinflar = doiraBoyichaFiltrlash(xomSinflar ?? [], doira.sinflar, doira.cheklanganmi);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">O&apos;quvchilar</h1>
      <OquvchilarClient oquvchilar={oquvchilar} sinflar={sinflar} />
    </main>
  );
}
