import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { foydalanuvchilarniOl } from "@/lib/actions/foydalanuvchilar";
import { fanlarniOl, sinflarniOl } from "@/lib/actions/spravochniklar";
import { FoydalanuvchilarClient } from "@/components/admin/foydalanuvchilar-client";

export default async function FoydalanuvchilarPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");
  if (foydalanuvchi.rol !== "admin") redirect("/dashboard");

  const [foydalanuvchilar, fanlar, sinflar] = await Promise.all([
    foydalanuvchilarniOl(),
    fanlarniOl(),
    sinflarniOl(),
  ]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Foydalanuvchilar</h1>
      <FoydalanuvchilarClient
        foydalanuvchilar={foydalanuvchilar}
        fanlar={fanlar ?? []}
        sinflar={sinflar ?? []}
      />
    </main>
  );
}
