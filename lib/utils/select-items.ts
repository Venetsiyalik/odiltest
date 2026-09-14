/**
 * Base UI'ning <Select.Value> komponenti `items` prop berilmasa, tanlangan
 * variantning matnini emas, xom `value`ni ko'rsatadi. Shu sababli har bir
 * <Select> uchun value->label xaritasi kerak — shu funksiya shuni quradi.
 */
export function royxatdanItemlar(
  royxat: ReadonlyArray<{ id: number; nomi: string }>,
  qoshimcha?: Record<string, string>,
): Record<string, string> {
  return {
    ...qoshimcha,
    ...Object.fromEntries(royxat.map((x) => [String(x.id), x.nomi])),
  };
}

/**
 * `lib/auth/admin.ts: joriyKirishDoirasiniOl()` natijasi bo'yicha ro'yxatni
 * cheklaydi — o'qituvchi-paneli: admin uchun (`cheklanganmi: false`)
 * ro'yxat o'zgarishsiz qaytadi, o'qituvchi uchun faqat ruxsat berilgan
 * id'lar qoladi.
 */
export function doiraBoyichaFiltrlash<T extends { id: number }>(
  royxat: readonly T[],
  ruxsatBerilganIdlar: readonly number[],
  cheklanganmi: boolean,
): T[] {
  if (!cheklanganmi) return [...royxat];
  const ruxsat = new Set(ruxsatBerilganIdlar);
  return royxat.filter((item) => ruxsat.has(item.id));
}
