import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";

export default async function DashboardPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) {
    redirect("/kirish");
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-2 p-8">
      <h1 className="text-2xl font-semibold">Xush kelibsiz, {foydalanuvchi.ismFamiliya}</h1>
      <p className="text-sm text-muted-foreground">
        Dashboard ko&apos;rsatkichlari (bugungi testlar, faol testlar, sinflar bo&apos;yicha
        o&apos;rtacha) 5-bosqichdan boshlab qo&apos;shiladi.
      </p>
    </main>
  );
}
