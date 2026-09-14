import { redirect } from "next/navigation";
import Link from "next/link";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { theme } from "@/lib/theme";

export default async function DashboardPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) {
    redirect("/kirish");
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Xush kelibsiz, {foydalanuvchi.ismFamiliya}</h1>
        <p className="text-sm text-muted-foreground">
          Dashboard ko&apos;rsatkichlari (bugungi testlar, faol testlar, sinflar bo&apos;yicha
          o&apos;rtacha) 5-bosqichdan boshlab qo&apos;shiladi.
        </p>
      </div>

      <Link
        href="/smart-test"
        className="flex items-center justify-between gap-4 rounded-[28px] p-6 text-white shadow-md transition-transform hover:scale-[1.01]"
        style={{
          background: `linear-gradient(to right, ${theme.smartTest.gradientBoshi}, ${theme.smartTest.gradientOxiri})`,
        }}
      >
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-extrabold">⚡ Smart Test</span>
          <span className="text-lg opacity-90">
            Sinf bilan birga yechamiz va har bir javobni tushunamiz
          </span>
        </div>
        <span className="rounded-xl bg-white/20 px-5 py-3 text-lg font-bold">Boshlash →</span>
      </Link>
    </main>
  );
}
