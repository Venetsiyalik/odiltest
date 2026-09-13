import { cookies } from "next/headers";
import { uz, type Matnlar } from "@/lib/i18n/uz";
import { ru } from "@/lib/i18n/ru";

export type Til = "uz" | "ru";

export const TIL_COOKIE = "til";

/**
 * Joriy tilni (`til` cookie'sidan) o'qiydi — faqat talaba tomonida
 * ishlatiladi (admin panel doim o'zbekcha). Server komponent va Route
 * Handler'larning ikkalasida ham ishlaydi (`cookies()` ikkalasida ham
 * o'qish uchun ochiq).
 */
export async function joriyTilniOlish(): Promise<Til> {
  const cookieStore = await cookies();
  return cookieStore.get(TIL_COOKIE)?.value === "ru" ? "ru" : "uz";
}

/** `joriyTilniOlish()` + mos lug'atni bitta chaqiruvda qaytaradi. */
export async function joriyMatnlarniOlish(): Promise<Matnlar> {
  const til = await joriyTilniOlish();
  return til === "ru" ? ru : uz;
}
