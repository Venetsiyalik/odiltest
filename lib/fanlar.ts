/**
 * Fan nomi -> personaj ikonkasi fayli moslamasi (`public/personajlar/
 * fanlar/`). `lib/redizayn/fan-rangi.ts` bilan bir xil 9 ta fan ro'yxati —
 * baza fan nomlarini erkin matn sifatida saqlaydi, shuning uchun moslik
 * birinchi so'z bo'yicha va kichik harfda qidiriladi ("Ingliz tili" ->
 * "ingliz").
 */
export const FAN_IKONKALARI: Record<string, string> = {
  matematika: "fan-matematika",
  informatika: "fan-informatika",
  biologiya: "fan-biologiya",
  kimyo: "fan-kimyo",
  fizika: "fan-fizika",
  adabiyot: "fan-adabiyot",
  ingliz: "fan-ingliz",
  tarix: "fan-tarix",
  geografiya: "fan-geografiya",
};

/** Mos kelmasa `null` — chaqiruvchi tomon zaxira ikonka ko'rsatishi kerak. */
export function fanIkonkaFayli(fanNomi: string): string | null {
  const birinchiSoz = fanNomi.trim().toLowerCase().split(/\s+/)[0];
  return FAN_IKONKALARI[birinchiSoz] ?? null;
}
