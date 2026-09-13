/**
 * Test davomida internet uzilib qolsa, javoblar shu yerda (localStorage)
 * navbatga qo'yiladi va ulanish tiklanganda serverga jo'natiladi
 * (texnik topshiriq 3.4-band). Urinish yakunlash/vaqt hisoblanishi doim
 * serverda bo'lgani uchun bu faqat javob matnini yo'qotmaslik uchun.
 */

const KALIT_OLDIN = "odil_oflayn_javob_";

export interface OflaynJavob {
  urinishId: number;
  savolId: number;
  tanlanganJavob: string | null;
  belgilangan?: boolean;
}

function kalit(urinishId: number): string {
  return `${KALIT_OLDIN}${urinishId}`;
}

export function navbatniOlish(urinishId: number): OflaynJavob[] {
  if (typeof window === "undefined") return [];
  try {
    const xom = window.localStorage.getItem(kalit(urinishId));
    return xom ? (JSON.parse(xom) as OflaynJavob[]) : [];
  } catch {
    return [];
  }
}

export function navbatgaQoshish(javob: OflaynJavob): void {
  if (typeof window === "undefined") return;
  try {
    const qolganlar = navbatniOlish(javob.urinishId).filter((j) => j.savolId !== javob.savolId);
    qolganlar.push(javob);
    window.localStorage.setItem(kalit(javob.urinishId), JSON.stringify(qolganlar));
  } catch {
    // localStorage mavjud emas (masalan xususiy rejim) — jim o'tkazib yuboriladi
  }
}

function navbatniTozalash(urinishId: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(kalit(urinishId));
  } catch {
    // e'tiborsiz qoldiriladi
  }
}

/**
 * Navbatdagi javoblarni serverga birma-bir jo'natishga urinadi. Birortasi
 * xato bersa (hali ham oflayn), qolganlarini navbatda qoldirib to'xtaydi —
 * keyingi chaqiriqda (masalan "online" hodisasida) yana urinib ko'riladi.
 */
export async function navbatniJonatish(urinishId: number): Promise<void> {
  const navbat = navbatniOlish(urinishId);
  if (navbat.length === 0) return;

  for (const javob of navbat) {
    try {
      await fetch("/api/urinish/javob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(javob),
      });
    } catch {
      return;
    }
  }

  navbatniTozalash(urinishId);
}
