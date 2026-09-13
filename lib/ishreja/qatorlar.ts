import * as XLSX from "xlsx";

/**
 * Ish-reja fayli qatorlarini o'qish (ishreja-import.md, 3-bo'lim). Fayllar
 * serverga yuborilmaydi — bu funksiya brauzerda, `File.arrayBuffer()`
 * natijasi ustida ishlatiladi (7-bo'lim: "Fayllar serverga yuborilmasin").
 */

export type MavzuTuri = "mavzu" | "baholash" | "takrorlash" | "amaliy";

export interface IshrejaQatori {
  tartib: number;
  nomi: string;
  turi: MavzuTuri;
  ball: number | null;
  uygaVazifa: string | null;
}

function apostrofNormallashtirish(matn: string): string {
  return matn.replace(/[ʻʼ`]/g, "'");
}

function tozalash(matn: string): string {
  return apostrofNormallashtirish(matn).trim().replace(/\s+/g, " ");
}

function qatorTuriniAniqlash(xomNomi: string): { turi: MavzuTuri; ball: number | null; tozaNomi: string } {
  const ballMos = xomNomi.match(/\[\s*(\d+)\s*ball\s*\]/i);
  const ball = ballMos ? Number(ballMos[1]) : null;
  const tozaNomi = xomNomi.replace(/\[\s*\d+\s*ball\s*\]/i, "").trim();
  const kichik = tozaNomi.toLowerCase();

  if (/\bbsb\b/.test(kichik) || /\bchsb\b/.test(kichik) || kichik.includes("nazorat ishi")) {
    return { turi: "baholash", ball, tozaNomi };
  }
  if (kichik === "takrorlash") {
    return { turi: "takrorlash", ball: null, tozaNomi };
  }
  if (kichik.includes("loyiha ishi") || kichik.includes("amaliy mashg'ulot")) {
    return { turi: "amaliy", ball: null, tozaNomi };
  }
  return { turi: "mavzu", ball: null, tozaNomi };
}

/**
 * Sarlavha qatorini "birinchi qator" deb emas, `T/R` va `Mavzu` so'zlari
 * bo'yicha topadi (3-bo'lim) — ba'zi fayllarda sarlavhadan oldin bo'sh
 * qator yoki izoh bo'lishi mumkin.
 */
function sarlavhaQatorimi(qator: unknown[]): boolean {
  const matnlar = qator.map((h) => String(h ?? "").trim().toLowerCase());
  return matnlar.includes("mavzu") && matnlar.some((m) => m === "t/r" || m.includes("t/r"));
}

export function ishrejaFayliniOqish(arrayBuffer: ArrayBuffer): IshrejaQatori[] {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const varaq = workbook.Sheets[workbook.SheetNames[0]];
  if (!varaq) return [];

  const xomQatorlar = XLSX.utils.sheet_to_json<unknown[]>(varaq, { header: 1, defval: "" });
  const sarlavhaIndeksi = xomQatorlar.findIndex(sarlavhaQatorimi);
  if (sarlavhaIndeksi === -1) return [];

  const sarlavha = xomQatorlar[sarlavhaIndeksi].map((h) => String(h ?? "").trim().toLowerCase());
  const mavzuUstuni = sarlavha.findIndex((h) => h === "mavzu");
  const uygaVazifaUstuni = sarlavha.findIndex((h) => h.includes("uyga vazifa") || h.includes("uy vazifasi"));
  if (mavzuUstuni === -1) return [];

  const natija: IshrejaQatori[] = [];
  let tartib = 1;
  for (let i = sarlavhaIndeksi + 1; i < xomQatorlar.length; i++) {
    const qator = xomQatorlar[i];
    const xomNomi = tozalash(String(qator[mavzuUstuni] ?? ""));
    if (!xomNomi) continue; // bo'sh mavzu — o'tkazib yuboriladi (3-bo'lim)

    const { turi, ball, tozaNomi } = qatorTuriniAniqlash(xomNomi);
    const uygaVazifaXom =
      uygaVazifaUstuni >= 0 ? tozalash(String(qator[uygaVazifaUstuni] ?? "")) : "";

    natija.push({
      tartib: tartib++,
      nomi: tozaNomi,
      turi,
      ball,
      uygaVazifa: uygaVazifaXom || null,
    });
  }

  return natija;
}
