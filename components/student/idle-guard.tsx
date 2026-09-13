"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { prezentatsiyaHolatiniTinglash } from "@/lib/redizayn/prezentatsiya-holati";

const IDLE_MUDDATI_MS = 3 * 60 * 1000; // 3 daqiqa (3.3-band)

/**
 * Umumiy qurilma (kiosk) rejimi: 3 daqiqa harakatsizlikdan keyin avtomatik
 * chiqadi. Test jarayonida (/urinish) bu qoidadan mustasno — o'quvchi
 * savol ustida uzoq o'ylashi mumkin.
 *
 * `faolmi=false` (sessiya yo'q — masalan kodsiz mehmon Dashboard/mavzu
 * sahifalarini ko'rayotgan bo'lsa, REDIZAYN.md 3-bo'lim) bo'lsa, taymer
 * umuman ishga tushmaydi — hech kim tizimdan "chiqarilmaydi", chunki
 * u hali kirmagan ham.
 */
export function IdleGuard({ faolmi = true }: { faolmi?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const taymerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [prezentatsiyaOchiq, setPrezentatsiyaOchiq] = useState(false);

  useEffect(() => prezentatsiyaHolatiniTinglash(setPrezentatsiyaOchiq), []);

  useEffect(() => {
    if (!faolmi || prezentatsiyaOchiq || pathname.startsWith("/urinish") || pathname === "/kirish") {
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
  }, [pathname, router, faolmi, prezentatsiyaOchiq]);

  return null;
}
