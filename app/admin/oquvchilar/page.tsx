import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { oquvchilarniOl } from "@/lib/actions/oquvchilar";
import { sinflarniOl } from "@/lib/actions/spravochniklar";
import { OquvchilarClient } from "@/components/admin/oquvchilar-client";

export default async function OquvchilarPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [oquvchilar, sinflar] = await Promise.all([oquvchilarniOl(), sinflarniOl()]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">O&apos;quvchilar</h1>
      <OquvchilarClient oquvchilar={oquvchilar} sinflar={sinflar} />
    </main>
  );
}
