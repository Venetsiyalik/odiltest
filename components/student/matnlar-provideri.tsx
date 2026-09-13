"use client";

import { createContext, useContext, useMemo } from "react";
import { uz } from "@/lib/i18n/uz";
import { ru } from "@/lib/i18n/ru";
import type { Matnlar } from "@/lib/i18n/uz";
import type { Til } from "@/lib/i18n/joriy-til";

interface MatnlarKontekstQiymati {
  til: Til;
  matnlar: Matnlar;
}

const MatnlarKontekst = createContext<MatnlarKontekstQiymati | null>(null);

/**
 * `app/talaba/layout.tsx` (server komponent) cookie'dan o'qigan tilni shu
 * provayder orqali klient komponentlarga uzatadi. Diqqat: bu yerga faqat
 * `til` (oddiy "uz"/"ru" satr) uzatiladi, LUG'ATNING O'ZI EMAS — `Matnlar`
 * ichida funksiyalar bor (masalan `daraja: (n) => ...`), server
 * komponentdan klient komponentga esa faqat serializatsiya qilinadigan
 * qiymatlar (satr, son, oddiy obyekt) o'tkazilishi mumkin, funksiyalar
 * emas. Shu sabab `uz`/`ru` lug'atlarining o'zi shu yerda, KLIENT
 * tomonda import qilinadi (ikkalasi ham server-only kod import
 * qilmaydi, shuning uchun klient bandle'iga qo'shilishi xavfsiz).
 */
export function MatnlarProvideri({ til, children }: { til: Til; children: React.ReactNode }) {
  const qiymat = useMemo<MatnlarKontekstQiymati>(() => ({ til, matnlar: til === "ru" ? ru : uz }), [til]);
  return <MatnlarKontekst.Provider value={qiymat}>{children}</MatnlarKontekst.Provider>;
}

export function useMatnlar(): MatnlarKontekstQiymati {
  const qiymat = useContext(MatnlarKontekst);
  if (!qiymat) {
    throw new Error("useMatnlar() faqat <MatnlarProvideri> ichida ishlatilishi kerak");
  }
  return qiymat;
}
