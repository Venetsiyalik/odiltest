"use client";

import { useEffect } from "react";
import { SINF_REJIMI_KALITI } from "@/lib/talaba/sinf-rejimi";

/**
 * Har bir talaba sahifasi ochilganda (to'g'ridan-to'g'ri havola, yangilash
 * yoki kiosk qurilmasi qayta yoqilganda) oldin saqlangan "Sinf rejimi"
 * holatini <html> elementiga qayta tatbiq qiladi. O'zi hech narsa
 * ko'rsatmaydi — faqat effekt.
 */
export function SinfRejimiInit() {
  useEffect(() => {
    try {
      const yoqilgan = window.localStorage.getItem(SINF_REJIMI_KALITI) === "1";
      document.documentElement.classList.toggle("sinf-rejimi", yoqilgan);
    } catch {
      // localStorage mavjud emas — standart (kichraytirilmagan) holatda qoladi
    }
  }, []);

  return null;
}
