/**
 * Sherbek maskoti — haqiqiy illyustratsiyalar bilan (`/public/personajlar/
 * sherbek/sherbek-{holat}.{png,webp}`). Hozircha faqat uchta holat uchun
 * asl fayl bor ('oddiy', 'zor', 'shoshilish') — qolganlari kelajakda
 * qo'shilishi mumkin bo'lgan holatlar sifatida turga kiritilgan, lekin
 * fayli topilmasa ilova qulab tushmasin deb 'oddiy'ga tushadi (konsolga
 * bir marta ogohlantirish bilan).
 */
export type SherbekHolati =
  | "oddiy"
  | "zor"
  | "shoshilish"
  | "salom"
  | "tugri"
  | "xato"
  | "yigi"
  | "maslahat"
  | "kubok"
  | "kitob"
  | "uyqu";

const MAVJUD_FAYLLAR: ReadonlySet<SherbekHolati> = new Set(["oddiy", "zor", "shoshilish"]);
const ogohlantirilganHolatlar = new Set<string>();

const OLCHAM_PIKSEL = { sm: 48, md: 72, lg: 112, xl: 160 } as const;
export type SherbekOlchami = keyof typeof OLCHAM_PIKSEL;

export type SherbekAnimatsiyasi = "yoq" | "nafas" | "sakrash";

const ANIMATSIYA_KLASSI: Record<SherbekAnimatsiyasi, string> = {
  yoq: "",
  nafas: "logo-nafas",
  sakrash: "sherbek-sakrash",
};

export function Sherbek({
  holat = "oddiy",
  size = "md",
  animatsiya = "yoq",
  priority = false,
  className,
}: {
  holat?: SherbekHolati;
  size?: SherbekOlchami;
  animatsiya?: SherbekAnimatsiyasi;
  priority?: boolean;
  className?: string;
}) {
  let haqiqiyHolat = holat;
  if (!MAVJUD_FAYLLAR.has(holat)) {
    if (!ogohlantirilganHolatlar.has(holat)) {
      ogohlantirilganHolatlar.add(holat);
      console.warn(
        `Sherbek: "${holat}" holati uchun rasm hali yo'q, "oddiy" ko'rsatilmoqda.`,
      );
    }
    haqiqiyHolat = "oddiy";
  }

  const piksel = OLCHAM_PIKSEL[size];
  const yol = `/personajlar/sherbek/sherbek-${haqiqiyHolat}`;

  return (
    <span
      role="img"
      aria-label={`Sherbek — ${holat}`}
      className={`relative inline-block shrink-0 ${ANIMATSIYA_KLASSI[animatsiya]} ${className ?? ""}`}
      style={{ width: piksel, height: piksel, aspectRatio: "1 / 1" }}
    >
      {/* Bu yerda next/image emas, oddiy <picture> ishlatiladi — webp/png
          formatlararo tanlov brauzerning o'ziga (<source>) topshiriladi,
          next/image esa <picture>ning <source>lari bilan mos kelmaydi. */}
      <picture>
        <source srcSet={`${yol}.webp`} type="image/webp" />
        <img
          src={`${yol}.png`}
          alt=""
          width={piksel}
          height={piksel}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </picture>
    </span>
  );
}
