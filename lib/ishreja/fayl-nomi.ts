/**
 * Ish-reja Excel fayl nomidan metama'lumot o'qish (ishreja-import.md,
 * 2-bo'lim). Bu modulning asosiy g'oyasi: admin hech narsa tanlamaydi,
 * hammasi fayl nomidan olinadi. Sof funksiya — brauzer va serverda bir xil
 * ishlaydi, hech qanday tashqi bog'liqlik yo'q.
 */

export interface FaylMetamalumoti {
  daraja: number | null;
  fanNomi: string | null;
  chorak: number | null;
  oquvYili: string | null;
  bsbBormi: boolean;
}

/** `_` va ketma-ket bo'sh joylarni bitta `-`ga aylantiradi (2-bo'lim). */
function ajratuvchilarniNormallashtirish(nomi: string): string {
  return nomi.replace(/[_\s]+/g, "-");
}

export function faylNomidanMetamalumotOlish(faylNomiKengaytmaBilan: string): FaylMetamalumoti {
  const kengaytmasiz = faylNomiKengaytmaBilan.replace(/\.[^.]+$/, "");
  const normal = ajratuvchilarniNormallashtirish(kengaytmasiz);
  const kichik = normal.toLowerCase();

  const sinfMos = kichik.match(/(\d{1,2})-?sinf/);
  const daraja = sinfMos ? Number(sinfMos[1]) : null;

  const chorakMos = kichik.match(/(\d)-?chorak/);
  const chorak = chorakMos ? Number(chorakMos[1]) : null;

  const yilMos = kichik.match(/(20\d{2})-?(20\d{2})/);
  const oquvYili = yilMos ? `${yilMos[1]}-${yilMos[2]}` : null;

  const bsbBormi = /\bbsb\b|\bchsb\b/.test(kichik);

  let fanNomi: string | null = null;
  if (sinfMos) {
    const sinfOxiri = sinfMos.index! + sinfMos[0].length;
    const ajratuvchiIndeksi = normal.indexOf("-", sinfOxiri);
    const fanBoshi = ajratuvchiIndeksi === -1 ? sinfOxiri : ajratuvchiIndeksi + 1;
    // Fan nomi "chorak"gacha, u bo'lmasa "yil"gacha, u ham bo'lmasa oxirigacha.
    const fanOxiri = chorakMos?.index ?? yilMos?.index ?? normal.length;

    const parcha = normal
      .slice(fanBoshi, Math.max(fanBoshi, fanOxiri))
      .replace(/^-+|-+$/g, "")
      .replace(/-/g, " ")
      .trim();
    fanNomi = parcha || null;
  }

  return { daraja, fanNomi, chorak, oquvYili, bsbBormi };
}
