import path from "node:path";

/**
 * `lib/pdf/shrift.ts`dagi bilan bir xil pattern — react-pdf serverda
 * ishlaydi, shuning uchun logotip fayl tizimidan mutlaq yo'l orqali
 * o'qiladi (URL emas).
 */
export const PDF_LOGO_YOLI = path.join(process.cwd(), "public", "logo-64.png");
