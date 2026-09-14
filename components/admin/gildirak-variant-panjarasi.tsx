"use client";

import { cn } from "@/lib/utils";
import { theme, toqlashtirish } from "@/lib/theme";
import type { Variant } from "@/lib/talaba/aralashtirish";

const VARIANT_STIL: Record<Variant, { shakl: string; rang: string }> = {
  A: { shakl: "▲", rang: theme.colors.danger },
  B: { shakl: "◆", rang: theme.fanRanglari.matematika },
  C: { shakl: "●", rang: theme.colors.accent },
  D: { shakl: "■", rang: theme.colors.success },
};

/**
 * Smart Test'ning 2×2 to'ridan farqi — bu yerda o'quvchi o'zi bosadi
 * (doskada turibdi), shuning uchun `VariantTugmalari`dagi kabi
 * `onTanlash`/`ochilganmi` reveal semantikasi bilan (bilim-gildiragi.md
 * 6.1-bo'lim: "bir xil ko'rinish [Smart Test bilan], lekin bu yerda
 * o'quvchi o'zi ekranda variantni bosadi").
 */
export function GildirakVariantPanjarasi({
  variantlar,
  tanlanganJavob,
  togriJavob,
  onTanlash,
  ochilganmi,
}: {
  variantlar: { A: string; B: string; C: string; D: string };
  tanlanganJavob: Variant | null;
  togriJavob: Variant | null;
  onTanlash: (harf: Variant) => void;
  ochilganmi: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(Object.keys(VARIANT_STIL) as Variant[]).map((harf) => {
        const { shakl, rang } = VARIANT_STIL[harf];
        const tanlangan = tanlanganJavob === harf;
        const buTogri = ochilganmi && togriJavob === harf;
        const xiralashgan = ochilganmi && !tanlangan && !buTogri;

        return (
          <button
            key={harf}
            type="button"
            onClick={() => onTanlash(harf)}
            disabled={ochilganmi}
            className={cn(
              "redizayn-tugma flex min-h-40 items-center gap-5 rounded-[28px] px-8 text-left text-white",
              xiralashgan && "opacity-35",
              buTogri && "scale-[1.06]",
            )}
            style={{
              background: rang,
              ["--rd-soya" as string]: toqlashtirish(rang, 0.2),
              outline: tanlangan ? "6px solid white" : undefined,
              outlineOffset: tanlangan ? "-4px" : undefined,
            }}
          >
            <span className="text-4xl sm:text-5xl">{shakl}</span>
            <span className="flex-1 text-2xl font-bold sm:text-4xl">{variantlar[harf]}</span>
            {buTogri && <span className="text-4xl sm:text-5xl">✓</span>}
            {ochilganmi && tanlangan && !buTogri && <span className="text-4xl sm:text-5xl">✗</span>}
          </button>
        );
      })}
    </div>
  );
}
