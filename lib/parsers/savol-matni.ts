/**
 * Word (.docx) va PDF fayllardan savol matnini ajratib olish uchun umumiy
 * qator-tahlilchi (smart-test.md 7.2-bo'lim). `word.ts` mammoth, `pdf.ts`
 * pdf.js orqali xom matnni qatorlarga bo'lib, ikkalasi ham shu bir xil
 * mantiqqa topshiradi — format bir xil, faqat matn ajratib olish usuli
 * boshqacha.
 */

export type Variant = "A" | "B" | "C" | "D";

export interface SavolMatni {
  tartib: number;
  matn: string;
  variantA?: string;
  variantB?: string;
  variantC?: string;
  variantD?: string;
  togriJavob?: Variant;
  izoh?: string;
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
const JAVOB_QATORI = /^(?:to'g'ri\s+)?javob(?:i)?\s*:\s*(.*)$|^ответ\s*:\s*(.*)$/i;
const IZOH_QATORI = /^(?:izoh|tushuntirish|sabab|nega|пояснение)\s*:\s*(.*)$/i;

function variantHarfiniAniqlash(xomHarf: string): Variant | undefined {
  return VARIANT_HARFLAR[xomHarf.toUpperCase()];
}

/** Apostrof shakllarini bittaga keltiradi (7.2-bo'lim: `'` `ʻ` `’` → `'`). */
function apostrofNormallashtirish(matn: string): string {
  return matn.replace(/[ʻʼ`’]/g, "'");
}

/**
 * `qatorlar` — faylning har bir qatori (bo'sh qatorlar allaqachon olib
 * tashlangan bo'lishi kerak). `agarJavobYoqBolsaA` true bo'lsa, "Javob:"
 * qatori topilmagan savolda A varianti to'g'ri deb hisoblanadi (7.3-bo'lim).
 */
export function qatorlarniTahlilQilish(
  qatorlar: string[],
  agarJavobYoqBolsaA: boolean,
): SavolMatni[] {
  const savollar: SavolMatni[] = [];
  let joriy: SavolMatni | null = null;
  let izohBoshlandimi = false;

  function joriyniYakunlash() {
    if (!joriy) return;
    savollar.push(joriy);
    joriy = null;
    izohBoshlandimi = false;
  }

  for (const xomQator of qatorlar) {
    const qator = apostrofNormallashtirish(xomQator);

    const savolMos = qator.match(SAVOL_BOSHI);
    if (savolMos) {
      joriyniYakunlash();
      joriy = { tartib: Number(savolMos[1]), matn: savolMos[2].trim() };
      continue;
    }

    if (!joriy) continue; // "1." bilan boshlanmagan matn — e'tiborsiz qoldiriladi

    if (izohBoshlandimi) {
      joriy.izoh = `${joriy.izoh ?? ""} ${qator}`.trim();
      continue;
    }

    const izohMos = qator.match(IZOH_QATORI);
    if (izohMos) {
      joriy.izoh = izohMos[1].trim();
      izohBoshlandimi = true;
      continue;
    }

    const javobMos = qator.match(JAVOB_QATORI);
    if (javobMos) {
      const harf = (javobMos[1] ?? javobMos[2] ?? "").trim().charAt(0);
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
      if (agarJavobYoqBolsaA) {
        s.togriJavob = "A";
      } else {
        s.xato = "to'g'ri javob ko'rsatilmagan";
      }
    }
  }

  return savollar;
}
