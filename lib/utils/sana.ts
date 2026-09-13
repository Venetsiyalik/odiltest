/**
 * `toLocaleString("uz-UZ", ...)` server (Node, kichik ICU) va brauzerda
 * har xil natija berishi mumkin — bu client komponentlarda hydration
 * xatosiga olib keladi (server "2026-09-12 22:23", client "12/09/2026,
 * 22:23" kabi chiqargan edi). Shu sababli sana har doim shu qo'lda
 * formatlovchi funksiyalar orqali chiqariladi — natija server va client
 * uchun har doim bir xil.
 */

function ikkiXonali(son: number): string {
  return String(son).padStart(2, "0");
}

export function sanaFormat(iso: string | Date): string {
  const sana = typeof iso === "string" ? new Date(iso) : iso;
  return `${ikkiXonali(sana.getDate())}.${ikkiXonali(sana.getMonth() + 1)}.${sana.getFullYear()}`;
}

export function sanaVaVaqtFormat(iso: string | Date): string {
  const sana = typeof iso === "string" ? new Date(iso) : iso;
  return `${sanaFormat(sana)} ${ikkiXonali(sana.getHours())}:${ikkiXonali(sana.getMinutes())}`;
}
