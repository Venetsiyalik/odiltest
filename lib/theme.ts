/**
 * Redizayn dizayn tizimining yagona manbai (REDIZAYN.md, 2-bo'lim).
 * Butun loyihada rang/radius/soya shu yerdan olinadi — komponent ichida
 * qo'lda `#hex` yoki Tailwind rang utilitasi (masalan `text-blue-500`)
 * yozilmasin.
 */
export const theme = {
  colors: {
    primary: "#1B3A6B",
    accent: "#F5B942",
    success: "#3FBF6F",
    danger: "#F45B5B",
    warning: "#FFA23A",
    surface: "#FFFFFF",
    bg: "#FFF9EF",
    text: "#2A2A35",
    muted: "#7C7C8A",
  },
  fanRanglari: {
    matematika: "#4A7BF7",
    informatika: "#9B5DE5",
    biologiya: "#3FBF6F",
    kimyo: "#FF6B9D",
    fizika: "#FF8C42",
    adabiyot: "#E8543F",
    ingliz: "#00B4D8",
    tarix: "#C9992E",
    geografiya: "#2EC4B6",
  },
  radius: { sm: 12, md: 20, lg: 28, full: 999 },
  shadow: {
    card: "0 4px 0 rgba(0,0,0,0.10)",
    pressed: "0 2px 0 rgba(0,0,0,0.10)",
  },
} as const;

export type FanNomi = keyof typeof theme.fanRanglari;

/**
 * Berilgan hex rangni `foiz` (0–1) miqdorida to'qlashtiradi — 3D tugma
 * pastidagi "qattiq soya" rangini asosiy rangdan hisoblab chiqarish uchun
 * (REDIZAYN.md 2.3-band: "rangning 20% to'q varianti").
 */
export function toqlashtirish(hex: string, foiz: number): string {
  const raqam = parseInt(hex.replace("#", ""), 16);
  const kanal = (siljish: number) => Math.max(0, Math.round(((raqam >> siljish) & 0xff) * (1 - foiz)));
  return `#${[kanal(16), kanal(8), kanal(0)].map((qiymat) => qiymat.toString(16).padStart(2, "0")).join("")}`;
}
