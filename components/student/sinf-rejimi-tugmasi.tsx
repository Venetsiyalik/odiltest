"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useMatnlar } from "@/components/student/matnlar-provideri";
import { SINF_REJIMI_KALITI } from "@/lib/talaba/sinf-rejimi";

/**
 * Bosh menyudagi "Sinf rejimi" tugmasi — o'qituvchi sinf oldida
 * tushuntirish uchun ishlatganda interfeysni kattalashtiradi (shrift
 * ×1.25, texnik topshiriq 3.3-band). Holat localStorage'da saqlanadi,
 * shu qurilmada har safar ochilganda [SinfRejimiInit] orqali tiklanadi.
 */
export function SinfRejimiTugmasi() {
  const { matnlar } = useMatnlar();
  const [yoqilgan, setYoqilgan] = useState(false);

  useEffect(() => {
    try {
      setYoqilgan(window.localStorage.getItem(SINF_REJIMI_KALITI) === "1");
    } catch {
      // e'tiborsiz qoldiriladi
    }
  }, []);

  function almashtirish() {
    setYoqilgan((oldin) => {
      const yangi = !oldin;
      document.documentElement.classList.toggle("sinf-rejimi", yangi);
      try {
        window.localStorage.setItem(SINF_REJIMI_KALITI, yangi ? "1" : "0");
      } catch {
        // e'tiborsiz qoldiriladi
      }
      return yangi;
    });
  }

  return (
    <button
      type="button"
      onClick={almashtirish}
      className={cn(
        "min-h-16 rounded-xl border-2 px-6 text-lg font-medium active:bg-muted",
        yoqilgan ? "border-primary bg-primary/10" : "border-border",
      )}
    >
      {yoqilgan ? matnlar.talaba.menyu.sinfRejimiOchirish : matnlar.talaba.menyu.sinfRejimiYoqish}
    </button>
  );
}
