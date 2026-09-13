"use client";

import { useEffect, useState } from "react";
import { tovushYoqilganmi, tovushniAlmashtirish } from "@/lib/redizayn/tovush";

export function TovushTugmasi() {
  const [yoqilgan, setYoqilgan] = useState(false);

  useEffect(() => {
    setYoqilgan(tovushYoqilganmi());
  }, []);

  return (
    <button
      type="button"
      onClick={() => setYoqilgan(tovushniAlmashtirish())}
      aria-label={yoqilgan ? "Tovushni o'chirish" : "Tovushni yoqish"}
      className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-black/10 bg-white text-xl active:scale-95"
    >
      {yoqilgan ? "🔊" : "🔇"}
    </button>
  );
}
