/**
 * REDIZAYN.md yangi navigatsiyasi "daraja" (5–11-sinf) bo'yicha ishlaydi,
 * mavjud `sinflar` jadvali esa aniq sinf-guruhini ifodalaydi (masalan
 * "5-B" — harf bilan, texnik topshiriq 8-bo'lim). Bu ikki tushuncha bir xil
 * emas: bitta darajada bir nechta sinf-guruh bo'lishi mumkin (5-A, 5-B...).
 * Jadval o'zgartirilmagani uchun (REDIZAYN.md 1-bo'lim) "daraja" shu yerda
 * `sinflar.nomi`dan hisoblab olinadi, alohida ustun qo'shilmaydi.
 */

export const DARAJALAR = [5, 6, 7, 8, 9, 10, 11] as const;
export type Daraja = (typeof DARAJALAR)[number];

export function sinfDarajasi(nomi: string): number | null {
  const moslik = nomi.match(/^(\d{1,2})/);
  if (!moslik) return null;
  const raqam = Number(moslik[1]);
  return Number.isInteger(raqam) ? raqam : null;
}

export function darajaHaqiqiymi(qiymat: number): qiymat is Daraja {
  return (DARAJALAR as readonly number[]).includes(qiymat);
}
