"use client";

import { cn } from "@/lib/utils";
import { theme, toqlashtirish } from "@/lib/theme";
import type { Variant } from "@/lib/talaba/aralashtirish";

/**
 * Kahoot uslubidagi javob tugmalari (REDIZAYN.md 2.3-band): har bir
 * variant o'z rangi va geometrik shakli bilan — o'qishni hali yaxshi
 * bilmagan yoki rang ko'rmaydigan o'quvchiga ham yordam beradi.
 * mashq-ekrani.tsx va organish-ekrani.tsx (o'z-o'zini tekshirish)
 * ikkalasida ham ishlatiladi.
 */
const VARIANT_STIL: Record<Variant, { shakl: string; rang: string }> = {
  A: { shakl: "▲", rang: theme.colors.danger },
  B: { shakl: "◆", rang: "#4A7BF7" },
  C: { shakl: "●", rang: theme.colors.accent },
  D: { shakl: "■", rang: theme.colors.success },
};

export function VariantTugmalari({
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
  /** natija ma'lum bo'lganda true — tugmalar o'chadi, to'g'ri javob belgilanadi */
  ochilganmi: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
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
              "redizayn-tugma flex min-h-24 w-full items-center gap-4 px-6 text-left text-xl font-bold text-white sm:text-2xl",
              xiralashgan && "opacity-40",
            )}
            style={{
              background: rang,
              borderRadius: theme.radius.lg,
              ["--rd-soya" as string]: toqlashtirish(rang, 0.2),
              outline: buTogri ? `4px solid ${theme.colors.success}` : undefined,
              outlineOffset: buTogri ? "2px" : undefined,
            }}
          >
            <span className="text-2xl">{shakl}</span>
            <span className="flex-1">{variantlar[harf]}</span>
            {buTogri && <span className="text-2xl">✓</span>}
            {tanlangan && !buTogri && ochilganmi && <span className="text-2xl">✗</span>}
          </button>
        );
      })}
    </div>
  );
}
