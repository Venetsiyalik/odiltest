"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uz } from "@/lib/i18n/uz";

export function TestBoshlashTugmasi({ testId }: { testId: number }) {
  const router = useRouter();
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [xato, setXato] = useState<string | null>(null);

  async function boshlash() {
    setYuklanmoqda(true);
    setXato(null);
    try {
      const javob = await fetch("/api/urinish/boshlash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId }),
      });
      const natija = await javob.json();
      if (!javob.ok) {
        setXato(natija.xato ?? uz.umumiy.xatoYuzBerdi);
        setYuklanmoqda(false);
        return;
      }
      router.push(`/urinish/${natija.urinishId}`);
    } catch {
      setXato(uz.umumiy.xatoYuzBerdi);
      setYuklanmoqda(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {xato && <p className="text-lg font-medium text-destructive">{xato}</p>}
      <button
        type="button"
        onClick={boshlash}
        disabled={yuklanmoqda}
        className="min-h-24 rounded-2xl bg-primary text-3xl font-semibold text-primary-foreground active:opacity-80 disabled:opacity-50"
      >
        {yuklanmoqda ? uz.umumiy.yuklanmoqda : uz.talaba.test.boshlash}
      </button>
    </div>
  );
}
