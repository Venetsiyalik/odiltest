export type Variant = "A" | "B" | "C" | "D";
export type VariantTartibi = Record<Variant, Variant>;

const IDENTIK_TARTIB: VariantTartibi = { A: "A", B: "B", C: "C", D: "D" };

/** Fisher-Yates aralashtirish — asl massivni o'zgartirmaydi. */
export function royxatniAralashtirish<T>(royxat: T[]): T[] {
  const natija = [...royxat];
  for (let i = natija.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [natija[i], natija[j]] = [natija[j], natija[i]];
  }
  return natija;
}

/**
 * Ko'rsatiladigan harf -> asl harf xaritasini yaratadi (nusxa ko'chirishga
 * qarshi, 4-band). `aralashtirish=false` bo'lsa identik xarita qaytadi.
 */
export function variantTartibiniYaratish(aralashtirish: boolean): VariantTartibi {
  if (!aralashtirish) return IDENTIK_TARTIB;

  const aslHarflar = royxatniAralashtirish<Variant>(["A", "B", "C", "D"]);
  const korsatilganHarflar: Variant[] = ["A", "B", "C", "D"];
  const xarita = {} as VariantTartibi;
  korsatilganHarflar.forEach((korsatilgan, indeks) => {
    xarita[korsatilgan] = aslHarflar[indeks];
  });
  return xarita;
}
