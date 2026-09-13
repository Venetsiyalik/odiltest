import { theme } from "@/lib/theme";

/**
 * Fan nomi (masalan "Informatika") -> theme.fanRanglari kaliti. Baza
 * fan nomlarini erkin matn sifatida saqlaydi (mavjud jadval, o'zgarmaydi),
 * shuning uchun moslik nomni kichik harfga o'tkazib qidiradi. Mos
 * kelmasa (masalan yangi qo'shilgan fan) — asosiy rangga tushadi.
 */
export function fanRangi(fanNomi: string): string {
  const kalit = fanNomi.trim().toLowerCase() as keyof typeof theme.fanRanglari;
  return theme.fanRanglari[kalit] ?? theme.colors.primary;
}
