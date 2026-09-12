import { redirect } from "next/navigation";
import Link from "next/link";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { TalabaChiqishTugmasi } from "@/components/student/talaba-chiqish-tugmasi";
import { uz } from "@/lib/i18n/uz";

const KARTALAR = [
  { href: "/organish", nomi: uz.talaba.menyu.organish, emoji: "📚" },
  { href: "/mashq", nomi: uz.talaba.menyu.mashq, emoji: "✏️" },
  { href: "/test", nomi: uz.talaba.menyu.testTopshirish, emoji: "📝" },
] as const;

export default async function MenyuPage() {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) redirect("/kirish");

  return (
    <main className="flex min-h-screen flex-col gap-10 p-8">
      <header className="flex items-center justify-between">
        <p className="text-2xl font-semibold">
          {oquvchi.ismFamiliya} · {oquvchi.sinfNomi} sinf
        </p>
        <TalabaChiqishTugmasi />
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

      <Link
        href="/natijalar"
        className="mx-auto min-h-16 rounded-xl border-2 border-border px-8 py-4 text-xl font-medium active:bg-muted"
      >
        {uz.talaba.menyu.natijalarim}
      </Link>
    </main>
  );
}
