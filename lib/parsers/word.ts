import mammoth from "mammoth";

export type Variant = "A" | "B" | "C" | "D";

export interface WordSavoli {
  tartib: number;
  matn: string;
  variantA?: string;
  variantB?: string;
  variantC?: string;
  variantD?: string;
  togriJavob?: Variant;
  xato?: string;
}

/**
 * Variant belgisi lotin (A-D) yoki kirill (А-Г) harfi bo'lishi mumkin —
 * kirillda pozitsiyasi bo'yicha mos keladi (А=1-o'rin→A, Б=2→B, В=3→C, Г=4→D),
 * harf ma'nosi emas (5-band, 5.2-bo'lim).
 */
const VARIANT_HARFLAR: Record<string, Variant> = {
  A: "A",
  А: "A", // kirill А (U+0410)
  B: "B",
  Б: "B", // kirill Б (U+0411)
  C: "C",
  В: "C", // kirill В (U+0412) — 3-o'rin
  D: "D",
  Г: "D", // kirill Г (U+0413) — 4-o'rin
};

const SAVOL_BOSHI = /^(\d+)[.)]\s*(.+)$/;
const VARIANT_BOSHI = /^([A-DA-ZА-Яа-яA-Zа-яё])[.)]\s*(.+)$/i;
const JAVOB_QATORI = /^(javob|javobi|ответ)\s*:\s*(.+)$/i;

function variantHarfiniAniqlash(xomHarf: string): Variant | undefined {
  return VARIANT_HARFLAR[xomHarf.toUpperCase()];
}

export async function wordFayliniParseQilish(buffer: Buffer): Promise<WordSavoli[]> {
  const { value: matn } = await mammoth.extractRawText({ buffer });

  const qatorlar = matn
    .split("\n")
    .map((q) => q.trim())
    .filter((q) => q.length > 0);

  const savollar: WordSavoli[] = [];
  let joriy: WordSavoli | null = null;

  function joriyniYakunlash() {
    if (!joriy) return;
    savollar.push(joriy);
    joriy = null;
  }

  for (const qator of qatorlar) {
    const savolMos = qator.match(SAVOL_BOSHI);
    if (savolMos) {
      joriyniYakunlash();
      joriy = { tartib: Number(savolMos[1]), matn: savolMos[2].trim() };
      continue;
    }

    if (!joriy) continue; // "1." bilan boshlanmagan matn — e'tiborsiz qoldiriladi

    const javobMos = qator.match(JAVOB_QATORI);
    if (javobMos) {
      const harf = javobMos[2].trim().charAt(0);
      joriy.togriJavob = variantHarfiniAniqlash(harf);
      continue;
    }

    const variantMos = qator.match(VARIANT_BOSHI);
    if (variantMos) {
      const harf = variantHarfiniAniqlash(variantMos[1]);
      if (harf) {
        const kalit = `variant${harf}` as const;
        joriy[kalit] = variantMos[2].trim();
        continue;
      }
    }

    // Variantlar hali boshlanmagan bo'lsa — bu savol matnining davomi (ko'p qatorli savol)
    if (!joriy.variantA && !joriy.variantB && !joriy.variantC && !joriy.variantD) {
      joriy.matn = `${joriy.matn} ${qator}`.trim();
    }
  }
  joriyniYakunlash();

  for (const s of savollar) {
    const variantSoni = [s.variantA, s.variantB, s.variantC, s.variantD].filter(Boolean).length;
    if (variantSoni < 4) {
      s.xato = `faqat ${variantSoni} ta variant`;
    } else if (!s.togriJavob) {
      s.xato = "to'g'ri javob ko'rsatilmagan";
    }
  }

  return savollar;
}
