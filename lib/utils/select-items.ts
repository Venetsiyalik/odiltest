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
