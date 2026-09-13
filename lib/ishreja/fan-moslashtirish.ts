/**
 * Fayl nomidan o'qilgan fan nomini `fanlar` jadvalidagi mavjud nomlar bilan
 * solishtiradi — registr va apostrof turlaridan (`'`/`'`/`ʻ`) qat'i nazar
 * (ishreja-import.md 2-bo'lim).
 */
function fanKaliti(nomi: string): string {
  return nomi
    .toLowerCase()
    .replace(/[ʻʼ'`']/g, "")
    .trim();
}

export function fanniMoslashtirish<T extends { nomi: string }>(
  fanNomi: string,
  fanlar: T[],
): T | null {
  const kalit = fanKaliti(fanNomi);
  if (!kalit) return null;
  return fanlar.find((f) => fanKaliti(f.nomi) === kalit) ?? null;
}
