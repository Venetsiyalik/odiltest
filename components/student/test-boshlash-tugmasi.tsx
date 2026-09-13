"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMatnlar } from "@/components/student/matnlar-provideri";
import { theme } from "@/lib/theme";
import { Tugma } from "@/components/redizayn/tugma";

export function TestBoshlashTugmasi({ testId }: { testId: number }) {
  const router = useRouter();
  const { matnlar } = useMatnlar();
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
        setXato(natija.xato ?? matnlar.umumiy.xatoYuzBerdi);
        setYuklanmoqda(false);
        return;
      }
      router.push(`/urinish/${natija.urinishId}`);
    } catch {
      setXato(matnlar.umumiy.xatoYuzBerdi);
      setYuklanmoqda(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {xato && (
        <p className="text-[18px] font-semibold" style={{ color: theme.colors.danger }}>
          {xato}
        </p>
      )}
      <Tugma onClick={boshlash} disabled={yuklanmoqda} rang="primary" className="w-full">
        {yuklanmoqda ? matnlar.umumiy.yuklanmoqda : matnlar.talaba.test.boshlash}
      </Tugma>
    </div>
  );
}
