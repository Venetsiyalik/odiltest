import { redirect } from "next/navigation";
import Link from "next/link";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { TalabaChiqishTugmasi } from "@/components/student/talaba-chiqish-tugmasi";
import { SinfRejimiTugmasi } from "@/components/student/sinf-rejimi-tugmasi";
import { TilTugmasi } from "@/components/student/til-tugmasi";
import { Logo } from "@/components/ui/Logo";
import { joriyMatnlarniOlish } from "@/lib/i18n/joriy-til";

export default async function MenyuPage() {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) redirect("/kirish");

  const matnlar = await joriyMatnlarniOlish();
  const KARTALAR = [
    { href: "/organish", nomi: matnlar.talaba.menyu.organish, emoji: "📚" },
    { href: "/mashq", nomi: matnlar.talaba.menyu.mashq, emoji: "✏️" },
    { href: "/test", nomi: matnlar.talaba.menyu.testTopshirish, emoji: "📝" },
  ] as const;

  return (
    <main className="flex min-h-screen flex-col gap-10 p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Logo size="sm" withText priority />
        <p className="text-2xl font-semibold">
          {matnlar.talaba.menyu.foydalanuvchi(oquvchi.ismFamiliya, oquvchi.sinfNomi)}
        </p>
        <div className="flex items-center gap-3">
          <TilTugmasi />
          <TalabaChiqishTugmasi />
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-3">
        {KARTALAR.map((karta) => (
          <Link
            key={karta.href}
            href={karta.href}
            className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-border text-center transition-colors active:bg-muted"
          >
            <span className="text-5xl">{karta.emoji}</span>
            <span className="text-2xl font-semibold sm:text-3xl">{karta.nomi}</span>
          </Link>
        ))}
      </div>

      <div className="mx-auto flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/natijalar"
          className="min-h-16 rounded-xl border-2 border-border px-8 py-4 text-xl font-medium active:bg-muted"
        >
          {matnlar.talaba.menyu.natijalarim}
        </Link>
        <Link
          href="/nishonlar"
          className="min-h-16 rounded-xl border-2 border-border px-8 py-4 text-xl font-medium active:bg-muted"
        >
          {matnlar.talaba.menyu.nishonlarim}
        </Link>
        <SinfRejimiTugmasi />
      </div>
    </main>
  );
}
