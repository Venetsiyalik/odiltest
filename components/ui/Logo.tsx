import Image from "next/image";
import Link from "next/link";
import { theme } from "@/lib/theme";

/**
 * Yagona logotip komponenti — loyihada boshqa hech qanday <img>/matnli
 * logo ishlatilmaydi. `variant="rangli"` uchun `/logo.svg` (asl, brend
 * rangida chizilgan fayl), `variant="oq"` uchun to'q fonlar uchun tayyor
 * qilingan teskari variant `/logo-teskari.png` ishlatiladi — SVG'ning
 * `currentColor`i faqat inline holatda CSS orqali boshqariladi, `next/image`
 * uni tashqi rasm sifatida yuklaydi (DOM'ga inline qilmaydi), shuning uchun
 * ikkita tayyor fayl orasida almashtirish orqali rang farqi ta'minlanadi.
 */

const OLCHAM_PIKSEL = { sm: 32, md: 48, lg: 72, xl: 112 } as const;
const SARLAVHA_SHRIFT = { sm: 14, md: 18, lg: 24, xl: 32 } as const;
const TAGLINE_SHRIFT = { sm: 10, md: 12, lg: 14, xl: 18 } as const;

export type LogoOlchami = keyof typeof OLCHAM_PIKSEL;

export function Logo({
  size = "md",
  variant = "rangli",
  withText = false,
  priority = false,
  className,
}: {
  size?: LogoOlchami;
  variant?: "rangli" | "oq";
  withText?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const piksel = OLCHAM_PIKSEL[size];
  const manba = variant === "oq" ? "/logo-teskari.png" : "/logo.svg";
  // To'q fonda asosiy rang (theme.primary) ko'rinmay qoladi, shuning uchun
  // "oq" variantda matn ham oq/och rangga o'tadi.
  const sarlavhaRangi = variant === "oq" ? "#FFFFFF" : theme.colors.primary;
  const taglineRangi = variant === "oq" ? "rgba(255,255,255,0.75)" : theme.colors.muted;

  return (
    <Link
      href="/"
      aria-label="Odil School — bosh sahifa"
      className={`inline-flex shrink-0 items-center gap-3 ${className ?? ""}`}
    >
      <span
        className="relative inline-block shrink-0"
        style={{ width: piksel, height: piksel, aspectRatio: "1 / 1" }}
      >
        <Image
          src={manba}
          alt="Odil School"
          fill
          priority={priority}
          sizes={`${piksel}px`}
          style={{ objectFit: "contain" }}
        />
      </span>

      {withText && (
        <span className="flex flex-col justify-center leading-tight">
          <span
            style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: sarlavhaRangi,
              fontSize: SARLAVHA_SHRIFT[size],
            }}
          >
            ODIL SCHOOL
          </span>
          <span style={{ color: taglineRangi, fontSize: TAGLINE_SHRIFT[size] }}>
            Bilim platformasi
          </span>
        </span>
      )}
    </Link>
  );
}
