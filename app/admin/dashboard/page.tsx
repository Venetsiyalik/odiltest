import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { ChiqishTugmasi } from "@/components/admin/chiqish-tugmasi";

export default async function DashboardPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) {
    redirect("/kirish");
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Xush kelibsiz, {foydalanuvchi.ismFamiliya}</h1>
          <p className="text-muted-foreground">
            Rol: {foydalanuvchi.rol === "admin" ? "Administrator" : "O'qituvchi"}
          </p>
        </div>
        <ChiqishTugmasi />
      </div>
      <p className="text-sm text-muted-foreground">
        Dashboard ko&apos;rsatkichlari (bugungi testlar, faol testlar, sinflar bo&apos;yicha
        o&apos;rtacha) 2-bosqichdan boshlab qo&apos;shiladi.
      </p>
    </main>
  );
}
