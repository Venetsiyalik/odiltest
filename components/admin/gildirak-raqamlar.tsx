"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { theme, toqlashtirish } from "@/lib/theme";

const RAQAM_RANGLARI = [
  theme.colors.danger,
  theme.fanRanglari.matematika,
  theme.colors.accent,
  theme.colors.success,
  theme.fanRanglari.informatika,
  theme.fanRanglari.fizika,
];

export function GildirakRaqamlar({
  jami,
  olinganlar,
  onTanlash,
}: {
  jami: number;
  olinganlar: Set<number>;
  onTanlash: (raqam: number) => void;
}) {
  const [aylanmoqda, setAylanmoqda] = useState<number | null>(null);

  function bosildi(raqam: number) {
    if (olinganlar.has(raqam) || aylanmoqda !== null) return;
    setAylanmoqda(raqam);
    setTimeout(() => {
      onTanlash(raqam);
      setAylanmoqda(null);
    }, 400);
  }

  return (
    <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
      {Array.from({ length: jami }, (_, i) => i + 1).map((raqam) => {
        const olingan = olinganlar.has(raqam);
        const rang = RAQAM_RANGLARI[(raqam - 1) % RAQAM_RANGLARI.length];
        return (
          <button
            key={raqam}
            type="button"
            onClick={() => bosildi(raqam)}
            disabled={olingan}
            className={cn(
              "redizayn-tugma flex min-h-[100px] min-w-[100px] items-center justify-center rounded-2xl text-4xl font-extrabold text-white transition-transform duration-500",
              olingan && "pointer-events-none opacity-30",
            )}
            style={{
              background: olingan ? theme.colors.muted : rang,
              ["--rd-soya" as string]: toqlashtirish(olingan ? theme.colors.muted : rang, 0.2),
              transform: aylanmoqda === raqam ? "rotateY(180deg)" : undefined,
            }}
          >
            {olingan ? "▒" : raqam}
          </button>
        );
      })}
    </div>
  );
}
