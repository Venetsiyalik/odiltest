"use client";

import { useEffect } from "react";

/**
 * PWA: smart ekranga "ilova" sifatida o'rnatilganda (texnik topshiriq
 * 3.4-band) internet uzilib qolgan holatlarda ham bo'sh oq ekran o'rniga
 * do'stona xabar chiqsin, deb minimal service worker ro'yxatdan
 * o'tkaziladi (faqat navigatsiya so'rovlarini oflayn sahifaga
 * yo'naltiradi — to'liq oflayn ilova emas).
 */
export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // service worker ro'yxatdan o'tmasa ham ilova oddiy rejimda ishlayveradi
      });
    }
  }, []);

  return null;
}
