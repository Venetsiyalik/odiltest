"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChiqishTugmasi } from "@/components/admin/chiqish-tugmasi";
import { Logo } from "@/components/ui/Logo";
import type { FoydalanuvchiRoli } from "@/lib/auth/admin";

const HAMMA_UCHUN_BOLIMLAR = [
  { href: "/dashboard", nomi: "Dashboard" },
  { href: "/spravochniklar", nomi: "Fan/Sinf/Mavzu" },
  { href: "/savollar", nomi: "Savollar" },
  { href: "/testlar", nomi: "Testlar" },
  { href: "/smart-test", nomi: "⚡ Smart Test" },
  { href: "/oquvchilar", nomi: "O'quvchilar" },
  { href: "/materiallar", nomi: "Materiallar" },
  { href: "/kontent", nomi: "Kontent (Dashboard)" },
  { href: "/natijalar", nomi: "Natijalar" },
] as const;

const FAQAT_ADMIN_BOLIMLAR = [{ href: "/import/ishreja", nomi: "Ish reja import" }] as const;

export function AdminNav({
  ismFamiliya,
  rol,
}: {
  ismFamiliya: string;
  rol: FoydalanuvchiRoli;
}) {
  const pathname = usePathname();
  const bolimlar =
    rol === "admin"
      ? [
          ...HAMMA_UCHUN_BOLIMLAR,
          { href: "/foydalanuvchilar", nomi: "Foydalanuvchilar" },
          ...FAQAT_ADMIN_BOLIMLAR,
        ]
      : HAMMA_UCHUN_BOLIMLAR;

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-3">
        <Logo size="sm" withText className="mr-2" />
        <nav className="flex flex-1 flex-wrap items-center gap-1">
          {bolimlar.map((bolim) => (
            <Link
              key={bolim.href}
              href={bolim.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === bolim.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {bolim.nomi}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{ismFamiliya}</span>
          <ChiqishTugmasi />
        </div>
      </div>
    </header>
  );
}
