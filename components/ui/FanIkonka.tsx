import Image from "next/image";
import { fanIkonkaFayli } from "@/lib/fanlar";

const OLCHAM_PIKSEL = { sm: 32, md: 48, lg: 72 } as const;
export type FanIkonkaOlchami = keyof typeof OLCHAM_PIKSEL;

/**
 * Fan personaji ikonkasi (`public/personajlar/fanlar/`). `fan` — bazadagi
 * xom fan nomi (masalan "Informatika", "Ingliz tili"); mos fayl
 * topilmasa (`lib/fanlar.ts`), neytral zaxira doira ko'rsatiladi — ilova
 * hech qachon shu sabab bilan qulab tushmaydi.
 */
export function FanIkonka({
  fan,
  size = "md",
  priority = false,
  className,
}: {
  fan: string;
  size?: FanIkonkaOlchami;
  priority?: boolean;
  className?: string;
}) {
  const piksel = OLCHAM_PIKSEL[size];
  const fayl = fanIkonkaFayli(fan);

  if (!fayl) {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-muted ${className ?? ""}`}
        style={{ width: piksel, height: piksel, aspectRatio: "1 / 1" }}
      >
        <span className="text-muted-foreground" style={{ fontSize: piksel * 0.5 }}>
          📘
        </span>
      </span>
    );
  }

  return (
    <span
      className={`relative inline-block shrink-0 ${className ?? ""}`}
      style={{ width: piksel, height: piksel, aspectRatio: "1 / 1" }}
    >
      <Image
        src={`/personajlar/fanlar/${fayl}.png`}
        alt={fan}
        fill
        priority={priority}
        sizes={`${piksel}px`}
        style={{ objectFit: "contain" }}
      />
    </span>
  );
}
