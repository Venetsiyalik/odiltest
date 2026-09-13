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
  disabled,
}: {
  variantlar: { A: string; B: string; C: string; D: string };
  tanlanganJavob: Variant | null;
  togriJavob: Variant | null;
  onTanlash: (harf: Variant) => void;
  /** natija ma'lum bo'lganda true — tugmalar o'chadi, to'g'ri javob belgilanadi
   *  (mashq/organish). Rasmiy testda HAR DOIM false — to'g'ri javob hech qachon
   *  ochilmaydi (9-band xavfsizlik qoidasi), faqat tanlangan variant ✓ bilan
   *  belgilanadi. */
  ochilganmi: boolean;
  /** rasmiy testda natija ma'lum bo'lmasa ham qayta bosishni cheklash uchun (ixtiyoriy) */
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {(Object.keys(VARIANT_STIL) as Variant[]).map((harf) => {
        const { shakl, rang } = VARIANT_STIL[harf];
        const tanlangan = tanlanganJavob === harf;
        const buTogri = ochilganmi && togriJavob === harf;
        const xiralashgan = ochilganmi && !tanlangan && !buTogri;
        const belgilanganmi = buTogri || (tanlangan && !ochilganmi);
        return (
          <button
            key={harf}
            type="button"
            onClick={() => onTanlash(harf)}
            disabled={ochilganmi || disabled}
            className={cn(
              "redizayn-tugma flex min-h-24 w-full items-center gap-4 px-6 text-left text-xl font-bold text-white sm:text-2xl",
              xiralashgan && "opacity-40",
            )}
            style={{
              background: rang,
              borderRadius: theme.radius.lg,
              ["--rd-soya" as string]: toqlashtirish(rang, 0.2),
              outline: belgilanganmi ? `4px solid ${buTogri ? theme.colors.success : "white"}` : undefined,
              outlineOffset: belgilanganmi ? "2px" : undefined,
            }}
          >
            <span className="text-2xl">{shakl}</span>
            <span className="flex-1">{variantlar[harf]}</span>
            {belgilanganmi && <span className="text-2xl">✓</span>}
            {tanlangan && ochilganmi && !buTogri && <span className="text-2xl">✗</span>}
          </button>
        );
      })}
    </div>
  );
}
