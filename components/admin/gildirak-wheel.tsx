"use client";

import { useMemo, useRef, useState } from "react";
import { theme } from "@/lib/theme";
import { tovushChal } from "@/lib/redizayn/tovush";

export interface GildirakOquvchisi {
  id: number;
  ismFamiliya: string;
}

const SEKTOR_RANGLARI = [
  theme.colors.danger,
  theme.fanRanglari.matematika,
  theme.colors.accent,
  theme.colors.success,
  theme.fanRanglari.informatika,
  theme.fanRanglari.fizika,
];

/** 20 tadan ko'p bo'lsa ismlar sig'maydi — "slot" rejimiga o'tiladi (4.2-bo'lim). */
const KLASSIK_CHEGARA = 20;
const AYLANISH_MS = 4000;

function tasodifiyIndeks(chegaragacha: number): number {
  const massiv = new Uint32Array(1);
  crypto.getRandomValues(massiv);
  return massiv[0] % chegaragacha;
}

function SvgGildirak({
  qatnashuvchilar,
  burchak,
  aylanmoqda,
}: {
  qatnashuvchilar: GildirakOquvchisi[];
  burchak: number;
  aylanmoqda: boolean;
}) {
  const markaz = 150;
  const radius = 145;
  const sektorBurchagi = 360 / qatnashuvchilar.length;

  const yoylar = qatnashuvchilar.map((oquvchi, indeks) => {
    const boshBurchak = (indeks * sektorBurchagi - 90) * (Math.PI / 180);
    const oxirBurchak = ((indeks + 1) * sektorBurchagi - 90) * (Math.PI / 180);
    const x1 = markaz + radius * Math.cos(boshBurchak);
    const y1 = markaz + radius * Math.sin(boshBurchak);
    const x2 = markaz + radius * Math.cos(oxirBurchak);
    const y2 = markaz + radius * Math.sin(oxirBurchak);
    const kattaYoy = sektorBurchagi > 180 ? 1 : 0;
    const yol = `M ${markaz} ${markaz} L ${x1} ${y1} A ${radius} ${radius} 0 ${kattaYoy} 1 ${x2} ${y2} Z`;
    const matnBurchagi = indeks * sektorBurchagi + sektorBurchagi / 2 - 90;

    return (
      <g key={oquvchi.id}>
        <path d={yol} fill={SEKTOR_RANGLARI[indeks % SEKTOR_RANGLARI.length]} stroke="white" strokeWidth={1.5} />
        <text
          x={markaz}
          y={markaz}
          fill="white"
          fontSize={qatnashuvchilar.length > 10 ? 9 : 12}
          fontWeight={700}
          textAnchor="end"
          transform={`rotate(${matnBurchagi} ${markaz} ${markaz}) translate(${radius - 12} 4)`}
        >
          {oquvchi.ismFamiliya.split(" ")[0]}
        </text>
      </g>
    );
  });

  return (
    <div className="relative mx-auto" style={{ width: 300, height: 300 }}>
      <div
        className="absolute left-1/2 top-0 z-10 -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: "14px solid transparent",
          borderRight: "14px solid transparent",
          borderTop: `22px solid ${theme.colors.primary}`,
        }}
      />
      <svg
        viewBox="0 0 300 300"
        width={300}
        height={300}
        style={{
          transform: `rotate(${burchak}deg)`,
          transition: aylanmoqda
            ? `transform ${AYLANISH_MS}ms cubic-bezier(0.15, 0.9, 0.25, 1)`
            : "none",
          willChange: "transform",
        }}
      >
        <circle cx={markaz} cy={markaz} r={radius + 3} fill="white" />
        {yoylar}
      </svg>
    </div>
  );
}

function SlotGildirak({
  qatnashuvchilar,
  joriyIndeks,
  aylanmoqda,
}: {
  qatnashuvchilar: GildirakOquvchisi[];
  joriyIndeks: number;
  aylanmoqda: boolean;
}) {
  // Uzun, takrorlangan ro'yxat hosil qilinadi, so'ng shu ro'yxat ichidan
  // oxirgi nusxadagi tanlangan ismga qadar tarjima qilinadi — natijada
  // "tez o'tib, sekinlashib to'xtaydigan" hissiyot beriladi (4.2-bo'lim).
  const TAKRORLAR = 6;
  const royxat = useMemo(
    () => Array.from({ length: TAKRORLAR }, () => qatnashuvchilar).flat(),
    [qatnashuvchilar],
  );
  const balandlik = 56;
  const oxirgiBlokBoshi = (TAKRORLAR - 1) * qatnashuvchilar.length;
  const maqsadIndeks = oxirgiBlokBoshi + joriyIndeks;
  const siljish = -(maqsadIndeks * balandlik) + balandlik * 2;

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-2xl border-4"
      style={{ width: 280, height: balandlik * 5, borderColor: theme.colors.primary }}
    >
      <div
        className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 border-y-2"
        style={{ height: balandlik, borderColor: theme.colors.accent }}
      />
      <div
        style={{
          transform: `translateY(${siljish}px)`,
          transition: aylanmoqda
            ? `transform ${AYLANISH_MS}ms cubic-bezier(0.15, 0.9, 0.25, 1)`
            : "none",
          willChange: "transform",
        }}
      >
        {royxat.map((oquvchi, indeks) => (
          <div
            key={`${oquvchi.id}-${indeks}`}
            className="flex items-center justify-center text-xl font-bold"
            style={{ height: balandlik, color: theme.colors.text }}
          >
            {oquvchi.ismFamiliya}
          </div>
        ))}
      </div>
    </div>
  );
}

export function GildirakWheel({
  oquvchilar,
  chiqqanIdlar,
  onTanlandi,
}: {
  oquvchilar: GildirakOquvchisi[];
  chiqqanIdlar: Set<number>;
  onTanlandi: (oquvchi: GildirakOquvchisi) => void;
}) {
  const [burchak, setBurchak] = useState(0);
  const [aylanmoqda, setAylanmoqda] = useState(false);
  const [joriyIndeks, setJoriyIndeks] = useState(0);
  const vaqtRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const qatnashuvchilar = useMemo(
    () => oquvchilar.filter((o) => !chiqqanIdlar.has(o.id)),
    [oquvchilar, chiqqanIdlar],
  );

  function aylantirish() {
    if (aylanmoqda || qatnashuvchilar.length === 0) return;

    const indeks = tasodifiyIndeks(qatnashuvchilar.length);
    const tanlangan = qatnashuvchilar[indeks];
    setJoriyIndeks(indeks);
    setAylanmoqda(true);
    tovushChal("gildirak_aylanish");

    if (qatnashuvchilar.length <= KLASSIK_CHEGARA) {
      const sektorBurchagi = 360 / qatnashuvchilar.length;
      const maqsad = 360 * 5 + (360 - (indeks * sektorBurchagi + sektorBurchagi / 2));
      setBurchak((oldin) => oldin + maqsad);
    }

    vaqtRef.current = setTimeout(() => {
      setAylanmoqda(false);
      tovushChal("gildirak_toxtash");
      onTanlandi(tanlangan);
    }, AYLANISH_MS);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {qatnashuvchilar.length <= KLASSIK_CHEGARA ? (
        <SvgGildirak qatnashuvchilar={qatnashuvchilar} burchak={burchak} aylanmoqda={aylanmoqda} />
      ) : (
        <SlotGildirak
          qatnashuvchilar={qatnashuvchilar}
          joriyIndeks={joriyIndeks}
          aylanmoqda={aylanmoqda}
        />
      )}
      <button
        type="button"
        onClick={aylantirish}
        disabled={aylanmoqda || qatnashuvchilar.length === 0}
        className="redizayn-tugma min-h-[72px] rounded-2xl px-8 text-xl font-extrabold text-white disabled:opacity-50"
        style={{
          background: theme.colors.accent,
          ["--rd-soya" as string]: theme.colors.warning,
        }}
      >
        🎡 G&apos;ILDIRAKNI AYLANTIRISH
      </button>
    </div>
  );
}
