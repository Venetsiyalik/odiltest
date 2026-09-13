import Image from "next/image";

/** `public/personajlar/ikonka/*.png` fayl nomlariga mos keladi. */
export type IkonkaNomi =
  | "yulduz"
  | "olov"
  | "kubok"
  | "medal"
  | "gavhar"
  | "yurak"
  | "sovga"
  | "kalit"
  | "qalqon"
  | "chaqmoq"
  | "belgi"
  | "nishon";

const OLCHAM_PIKSEL = { sm: 20, md: 28, lg: 40 } as const;
export type IkonkaOlchami = keyof typeof OLCHAM_PIKSEL;

/** `public/personajlar/ikonka/` ostidagi kichik gamifikatsiya ikonkalari. */
export function Ikonka({
  nom,
  size = "sm",
  priority = false,
  className,
}: {
  nom: IkonkaNomi;
  size?: IkonkaOlchami;
  priority?: boolean;
  className?: string;
}) {
  const piksel = OLCHAM_PIKSEL[size];

  return (
    <span
      className={`relative inline-block shrink-0 align-middle ${className ?? ""}`}
      style={{ width: piksel, height: piksel, aspectRatio: "1 / 1" }}
    >
      <Image
        src={`/personajlar/ikonka/${nom}.png`}
        alt=""
        fill
        priority={priority}
        sizes={`${piksel}px`}
        style={{ objectFit: "contain" }}
      />
    </span>
  );
}
