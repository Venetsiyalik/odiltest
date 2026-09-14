"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { topshiriqBajarildiBelgilash } from "@/lib/talaba/yordam-topshiriqlari";
import type { YordamTopshirigi } from "@/lib/talaba/yordam-topshiriqlari";

export function TopshiriqBanner({
  topshiriqlar,
  sarlavha,
  bajarildiMatni,
}: {
  topshiriqlar: YordamTopshirigi[];
  sarlavha: string;
  bajarildiMatni: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [yashiringan, setYashiringan] = useState<Set<number>>(new Set());

  const korinadiganlar = topshiriqlar.filter((t) => !yashiringan.has(t.id));
  if (korinadiganlar.length === 0) return null;

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-4"
      style={{ background: `${theme.colors.accent}22`, border: `2px solid ${theme.colors.accent}` }}
    >
      <p className="font-bold" style={{ color: theme.colors.primary }}>
        {sarlavha}
      </p>
      {korinadiganlar.map((t) => (
        <div key={t.id} className="flex flex-col gap-1 rounded-xl bg-white p-3">
          {t.mavzuNomi && (
            <p className="text-sm" style={{ color: theme.colors.muted }}>
              {t.mavzuNomi}
            </p>
          )}
          <p>{t.matn}</p>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setYashiringan((oldin) => new Set(oldin).add(t.id));
              startTransition(async () => {
                await topshiriqBajarildiBelgilash(t.id);
                router.refresh();
              });
            }}
            className="w-fit text-sm underline"
            style={{ color: theme.colors.primary }}
          >
            {bajarildiMatni}
          </button>
        </div>
      ))}
    </div>
  );
}
