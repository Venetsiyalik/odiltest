"use client";

import { useEffect } from "react";

/**
 * Material ochilganda "ko'rildi" deb belgilaydi (kirish kodi bilan
 * kirgan bo'lsagina — server bu holatni o'zi tekshiradi). Ko'rinishga
 * ta'sir qilmaydi, faqat effekt.
 */
export function KorildiBelgilash({ materialId }: { materialId: number }) {
  useEffect(() => {
    fetch("/api/materiallar/korildi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId }),
    }).catch(() => {
      // vaqtinchalik tarmoq xatosi — muhim emas, sahifa ko'rsatilaveradi
    });
  }, [materialId]);

  return null;
}
