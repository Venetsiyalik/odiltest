import mammoth from "mammoth";
import { qatorlarniTahlilQilish, type SavolMatni, type Variant } from "@/lib/parsers/savol-matni";

export type { Variant };
export type WordSavoli = SavolMatni;

export async function wordFayliniParseQilish(
  buffer: Buffer,
  agarJavobYoqBolsaA = false,
): Promise<WordSavoli[]> {
  const { value: matn } = await mammoth.extractRawText({ buffer });

  const qatorlar = matn
    .split("\n")
    .map((q) => q.trim())
    .filter((q) => q.length > 0);

  return qatorlarniTahlilQilish(qatorlar, agarJavobYoqBolsaA);
}
