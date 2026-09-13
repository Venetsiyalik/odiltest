import path from "node:path";
import { Font } from "@react-pdf/renderer";

let royxatdanOtkazilgan = false;

/**
 * Standart PDF shriftlari (Helvetica va h.k.) o'zbekcha `o'`, `g'` kabi
 * belgilarni to'g'ri chizmaydi (6-band). Shu sababli DejaVu Sans (ochiq
 * litsenziyali, to'liq Unicode qamrovli) shrifti ro'yxatdan o'tkaziladi.
 * Bu funksiya har bir PDF hujjatidan oldin chaqiriladi, lekin faqat bir
 * marta amalda oshadi.
 */
export function dejaVuShriftiniRoyxatdanOtkazish() {
  if (royxatdanOtkazilgan) return;

  const shriftlarYoli = path.join(process.cwd(), "public", "fonts");

  Font.register({
    family: "DejaVu Sans",
    fonts: [
      { src: path.join(shriftlarYoli, "DejaVuSans.ttf"), fontWeight: "normal" },
      { src: path.join(shriftlarYoli, "DejaVuSans-Bold.ttf"), fontWeight: "bold" },
    ],
  });

  royxatdanOtkazilgan = true;
}
