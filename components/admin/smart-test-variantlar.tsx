"use client";

import { cn } from "@/lib/utils";
import { theme, toqlashtirish } from "@/lib/theme";
import type { SmartTestVariant } from "@/lib/actions/smart-test";

const VARIANT_STIL: Record<SmartTestVariant, { shakl: string; rang: string }> = {
  A: { shakl: "▲", rang: theme.colors.danger },
  B: { shakl: "◆", rang: "#4A7BF7" },
  C: { shakl: "●", rang: theme.colors.accent },
  D: { shakl: "■", rang: theme.colors.success },
};

/**
 * Smart Test'ning katta ekran 2×2 variant to'ri (4-bo'lim). O'quvchilar
 * bosmaydi — javob og'zaki aytiladi. O'qituvchi ixtiyoriy ravishda
 * `onSinfTanlovi` orqali "sinf shuni tanladi" belgisini qo'yishi mumkin
 * (4.4-bo'lim, ixtiyoriy — hech qachon bosilmasa ham hammasi ishlaydi).
 */
export function SmartTestVariantlari({
  variantlar,
  togriJavob,
  ochilganmi,
  sinfTanlovi,
  onSinfTanlovi,
}: {
  variantlar: { A: string; B: string; C: string; D: string };
  togriJavob: SmartTestVariant;
  ochilganmi: boolean;
  sinfTanlovi: SmartTestVariant | null;
  onSinfTanlovi?: (harf: SmartTestVariant) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(Object.keys(VARIANT_STIL) as SmartTestVariant[]).map((harf) => {
        const { shakl, rang } = VARIANT_STIL[harf];
        const buTogri = ochilganmi && togriJavob === harf;
        const xiralashgan = ochilganmi && !buTogri;
        const tanlanganmi = sinfTanlovi === harf;

        return (
          <button
            key={harf}
            type="button"
            onClick={() => onSinfTanlovi?.(harf)}
            disabled={!onSinfTanlovi}
            className={cn(
              "redizayn-tugma flex min-h-40 items-center gap-5 rounded-[28px] px-8 text-left text-white transition-[opacity,transform] duration-500",
              xiralashgan && "opacity-35",
              buTogri && "scale-[1.06]",
            )}
            style={{
              background: rang,
              ["--rd-soya" as string]: toqlashtirish(rang, 0.2),
              outline: buTogri ? "6px solid white" : tanlanganmi ? "4px dashed white" : undefined,
              outlineOffset: buTogri || tanlanganmi ? "-4px" : undefined,
            }}
          >
            <span className="text-4xl sm:text-5xl">{shakl}</span>
            <span className="flex-1 text-2xl font-bold sm:text-4xl">{variantlar[harf]}</span>
            {buTogri && <span className="text-4xl sm:text-5xl">✓</span>}
            {!ochilganmi && tanlanganmi && <span className="text-2xl">👥</span>}
          </button>
        );
      })}
    </div>
  );
}
