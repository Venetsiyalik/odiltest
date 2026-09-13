"use client";

import { useEffect } from "react";
import { theme } from "@/lib/theme";
import { Sherbek } from "@/components/ui/Sherbek";
import { Tugma } from "@/components/redizayn/tugma";
import { Konfetti } from "@/components/redizayn/konfetti";
import { tovushChal } from "@/lib/redizayn/tovush";

export interface TabriklashMalumoti {
  darajaOshdimi?: boolean;
  yangiDaraja?: number;
  yangiNishonlar?: { kod: string; nomi: string; tavsif: string; ikonka: string }[];
}

/**
 * Daraja oshganda / yangi nishon olinganda ko'rsatiladigan tabrik modali
 * (REDIZAYN.md 5.1 va 5.3-band). Ikkalasi ham bo'lsa, birma-bir emas —
 * bitta kartada birga ko'rsatiladi (sodda va tez).
 */
export function TabriklashModali({ malumot, yopish }: { malumot: TabriklashMalumoti; yopish: () => void }) {
  const { darajaOshdimi, yangiDaraja, yangiNishonlar = [] } = malumot;

  useEffect(() => {
    tovushChal(darajaOshdimi ? "daraja" : "nishon");
  }, [darajaOshdimi]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      {darajaOshdimi && <Konfetti />}
      <div
        className="redizayn-paydo-bolish flex max-h-[85vh] max-w-sm flex-col items-center gap-4 overflow-y-auto p-8 text-center"
        style={{ background: theme.colors.surface, borderRadius: theme.radius.lg, boxShadow: theme.shadow.card }}
      >
        {darajaOshdimi && (
          <>
            <Sherbek holat="kubok" size="lg" />
            <p className="text-2xl font-extrabold" style={{ color: theme.colors.primary }}>
              Daraja oshdi!
            </p>
            <p className="text-4xl font-extrabold" style={{ color: theme.colors.accent }}>
              {yangiDaraja}-daraja
            </p>
          </>
        )}

        {yangiNishonlar.map((nishon) => (
          <div key={nishon.kod} className="flex flex-col items-center gap-2">
            {!darajaOshdimi && <Sherbek holat="zor" size="md" />}
            <span className="text-6xl">{nishon.ikonka}</span>
            <p className="text-xl font-bold">{nishon.nomi}</p>
            <p className="text-sm" style={{ color: theme.colors.muted }}>
              {nishon.tavsif}
            </p>
          </div>
        ))}

        <Tugma onClick={yopish}>Zo&apos;r!</Tugma>
      </div>
    </div>
  );
}
