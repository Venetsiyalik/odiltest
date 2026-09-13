"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { tilniOzgartirish } from "@/lib/actions/til";
import { useMatnlar } from "@/components/student/matnlar-provideri";
import { theme } from "@/lib/theme";

const TILLAR = [
  { kod: "uz", belgi: "🇺🇿", nomi: "UZ" },
  { kod: "ru", belgi: "🇷🇺", nomi: "RU" },
] as const;

/** Tepada ko'rinadigan til almashtirish tugmasi (faqat talaba tomonida). */
export function TilTugmasi() {
  const { til } = useMatnlar();
  const router = useRouter();
  const [almashmoqda, startTransition] = useTransition();

  function tanlash(yangiTil: "uz" | "ru") {
    if (yangiTil === til) return;
    startTransition(async () => {
      await tilniOzgartirish(yangiTil);
      router.refresh();
    });
  }

  return (
    <div
      className="inline-flex items-center gap-1 p-1"
      style={{ background: `${theme.colors.muted}15`, borderRadius: theme.radius.full, opacity: almashmoqda ? 0.6 : 1 }}
    >
      {TILLAR.map((t) => (
        <button
          key={t.kod}
          type="button"
          onClick={() => tanlash(t.kod)}
          disabled={almashmoqda}
          aria-pressed={til === t.kod}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold transition-colors"
          style={{
            borderRadius: theme.radius.full,
            background: til === t.kod ? theme.colors.surface : "transparent",
            color: til === t.kod ? theme.colors.primary : theme.colors.muted,
            boxShadow: til === t.kod ? theme.shadow.card : "none",
          }}
        >
          <span aria-hidden="true">{t.belgi}</span>
          {t.nomi}
        </button>
      ))}
    </div>
  );
}
