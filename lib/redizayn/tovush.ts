/**
 * Ovoz effektlari menejeri (REDIZAYN.md 7-bo'lim). Fayllar hozircha
 * `/public/tovush/*.mp3`da mavjud emas — shu sabab `tovushChal` xato
 * bersa jim o'tkazib yuboradi (konsolga xato tashlamaydi). Fayllar
 * qo'shilgach, hech qanday kod o'zgarishisiz ishga tushadi.
 */

const YOQILGAN_KALITI = "odil_tovush_yoqilgan";

export type TovushNomi = "togri" | "xato" | "daraja" | "nishon" | "bosish" | "taymer";

export function tovushYoqilganmi(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(YOQILGAN_KALITI) === "1";
  } catch {
    return false;
  }
}

export function tovushniAlmashtirish(): boolean {
  const yangiHolat = !tovushYoqilganmi();
  try {
    window.localStorage.setItem(YOQILGAN_KALITI, yangiHolat ? "1" : "0");
  } catch {
    // xususiy rejim va h.k. — e'tiborsiz qoldiriladi
  }
  return yangiHolat;
}

export function tovushChal(nomi: TovushNomi): void {
  if (!tovushYoqilganmi()) return;
  try {
    const audio = new Audio(`/tovush/${nomi}.mp3`);
    void audio.play().catch(() => {
      // fayl hali yo'q yoki brauzer avtoijro siyosati bloklagan
    });
  } catch {
    // e'tiborsiz qoldiriladi
  }
}
