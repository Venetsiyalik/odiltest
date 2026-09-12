"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const IDLE_MUDDATI_MS = 3 * 60 * 1000; // 3 daqiqa (3.3-band)

/**
 * Umumiy qurilma (kiosk) rejimi: 3 daqiqa harakatsizlikdan keyin avtomatik
 * chiqadi. Test jarayonida (/urinish) bu qoidadan mustasno — o'quvchi
 * savol ustida uzoq o'ylashi mumkin.
 */
export function IdleGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const taymerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/urinish") || pathname === "/kirish") {
      if (taymerRef.current) clearTimeout(taymerRef.current);
      return;
    }

    function qaytaBoshlash() {
      if (taymerRef.current) clearTimeout(taymerRef.current);
      taymerRef.current = setTimeout(() => {
        fetch("/api/auth/chiqish", { method: "POST" }).finally(() => {
          router.push("/kirish");
        });
      }, IDLE_MUDDATI_MS);
    }

    const hodisalar = ["click", "keydown", "touchstart", "mousemove", "scroll"] as const;
    for (const hodisa of hodisalar) window.addEventListener(hodisa, qaytaBoshlash);
    qaytaBoshlash();

    return () => {
      for (const hodisa of hodisalar) window.removeEventListener(hodisa, qaytaBoshlash);
      if (taymerRef.current) clearTimeout(taymerRef.current);
    };
  }, [pathname, router]);

  return null;
}
