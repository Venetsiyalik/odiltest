import { qatorlarniTahlilQilish, type SavolMatni } from "@/lib/parsers/savol-matni";

export type PdfSavoli = SavolMatni;

export interface PdfTahliliNatijasi {
  savollar: PdfSavoli[];
  /** Skanerdan olingan PDF'da matn qatlami umuman bo'lmasligi mumkin (7.4-bo'lim). */
  matnTopilmadi: boolean;
}

/**
 * PDF matnini `pdf.js`ning "legacy" (Node uchun mo'ljallangan, DOM'ga
 * tayanmaydigan) build'i orqali ajratib oladi, so'ng xuddi Word importi
 * bilan bir xil qator-tahlilchiga (`savol-matni.ts`) topshiradi.
 *
 * Ogohlantirish: PDF'dan matn ajratish Word'ga qaraganda ancha ishonchsiz —
 * ustunli tuzilma va maxsus shriftlar qatorlarni buzishi mumkin (7.4-bo'lim).
 */
export async function pdfFayliniParseQilish(
  buffer: Buffer,
  agarJavobYoqBolsaA = false,
): Promise<PdfTahliliNatijasi> {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const hujjat = await getDocument({ data: new Uint8Array(buffer) }).promise;

  const qatorlar: string[] = [];
  let jamiBelgilarSoni = 0;

  for (let sahifaRaqami = 1; sahifaRaqami <= hujjat.numPages; sahifaRaqami++) {
    const sahifa = await hujjat.getPage(sahifaRaqami);
    const matnTarkibi = await sahifa.getTextContent();

    // Har bir matn bo'lagi alohida "item" sifatida keladi — vertikal
    // pozitsiyasi (transform[5]) bir xil bo'lganlarni bitta qatorga yig'amiz.
    let joriyQator = "";
    let oldingiY: number | null = null;
    for (const item of matnTarkibi.items) {
      if (!("str" in item)) continue;
      const y = item.transform[5];
      if (oldingiY !== null && Math.abs(y - oldingiY) > 2) {
        if (joriyQator.trim()) qatorlar.push(joriyQator.trim());
        joriyQator = "";
      }
      joriyQator += item.str;
      oldingiY = y;
      jamiBelgilarSoni += item.str.length;
    }
    if (joriyQator.trim()) qatorlar.push(joriyQator.trim());
  }

  if (jamiBelgilarSoni < 10) {
    return { savollar: [], matnTopilmadi: true };
  }

  return {
    savollar: qatorlarniTahlilQilish(qatorlar, agarJavobYoqBolsaA),
    matnTopilmadi: false,
  };
}
