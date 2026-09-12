import * as XLSX from "xlsx";

export interface ExcelSavoli {
  tartib: number;
  matn: string;
  variantA: string;
  variantB: string;
  variantC: string;
  variantD: string;
  togriJavob: string;
  fanNomi: string;
  sinfNomi: string;
  mavzuNomi: string;
  qiyinlik: string;
  izoh: string;
}

function ustunNomlariniNormallashtirish(qator: Record<string, unknown>): Record<string, string> {
  const natija: Record<string, string> = {};
  for (const [kalit, qiymat] of Object.entries(qator)) {
    const tozaKalit = kalit.trim().toLowerCase();
    natija[tozaKalit] = qiymat == null ? "" : String(qiymat).trim();
  }
  return natija;
}

export function excelShablonYarat(): Buffer {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([
    ["savol", "a", "b", "c", "d", "togri", "fan", "sinf", "mavzu", "qiyinlik", "izoh"],
    [
      "Protsessor nima vazifa bajaradi?",
      "Saqlaydi",
      "Amal bajaradi",
      "Chiqaradi",
      "Ulaydi",
      "B",
      "Informatika",
      "5-B",
      "Kompyuter tuzilishi",
      "1",
      "Protsessor — hisoblash markazi",
    ],
  ]);
  XLSX.utils.book_append_sheet(workbook, sheet, "Savollar");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

/** Excel/CSV faylni o'qiydi, bo'sh qatorlarni tashlab yuboradi (5.1-band). */
export function excelFayliniParseQilish(buffer: Buffer): ExcelSavoli[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const birinchiVaraq = workbook.Sheets[workbook.SheetNames[0]];
  const xomQatorlar = XLSX.utils.sheet_to_json<Record<string, unknown>>(birinchiVaraq, {
    defval: "",
  });

  const natija: ExcelSavoli[] = [];
  xomQatorlar.forEach((xomQator, indeks) => {
    const q = ustunNomlariniNormallashtirish(xomQator);
    const boshMatn = q.savol ?? "";
    if (!boshMatn && !q.a && !q.b && !q.c && !q.d) return; // bo'sh qator

    natija.push({
      tartib: indeks + 2, // 1-qator sarlavha, shuning uchun +2
      matn: boshMatn,
      variantA: q.a ?? "",
      variantB: q.b ?? "",
      variantC: q.c ?? "",
      variantD: q.d ?? "",
      togriJavob: (q.togri ?? "").toUpperCase(),
      fanNomi: q.fan ?? "",
      sinfNomi: q.sinf ?? "",
      mavzuNomi: q.mavzu ?? "",
      qiyinlik: q.qiyinlik ?? "",
      izoh: q.izoh ?? "",
    });
  });

  return natija;
}
