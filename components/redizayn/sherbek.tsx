import { theme } from "@/lib/theme";

/**
 * Sherbek maskoti — HOZIRCHA PLACEHOLDER (emoji + rangli doira).
 * Haqiqiy illyustratsiyalar (`/public/personajlar/sherbek/sherbek-{holat}.png`)
 * tayyor bo'lgach, shu komponent ichini `next/image`ga almashtirish kifoya —
 * uni chaqirgan boshqa hech bir joy o'zgarmaydi (bir xil `holat`/`size` API).
 */
export type SherbekHolati =
  | "salom"
  | "oddiy"
  | "tugri"
  | "xato"
  | "yigi"
  | "maslahat"
  | "kubok"
  | "kitob"
  | "uyqu"
  | "zor";

const HOLAT_EMOJI: Record<SherbekHolati, string> = {
  salom: "👋",
  oddiy: "🙂",
  tugri: "🎉",
  xato: "😅",
  yigi: "😢",
  maslahat: "💡",
  kubok: "🏆",
  kitob: "📖",
  uyqu: "😴",
  zor: "🤩",
};

const HOLAT_FONI: Record<SherbekHolati, string> = {
  salom: theme.colors.accent,
  oddiy: theme.colors.accent,
  tugri: theme.colors.success,
  xato: theme.colors.warning,
  yigi: theme.colors.muted,
  maslahat: theme.colors.accent,
  kubok: theme.colors.accent,
  kitob: theme.colors.primary,
  uyqu: theme.colors.muted,
  zor: theme.colors.success,
};

const OLCHAM_PIKSEL: Record<"sm" | "md" | "lg", number> = { sm: 48, md: 72, lg: 112 };

export function Sherbek({
  holat = "oddiy",
  size = "md",
}: {
  holat?: SherbekHolati;
  size?: "sm" | "md" | "lg";
}) {
  const piksel = OLCHAM_PIKSEL[size];
  return (
    <div
      role="img"
      aria-label={`Sherbek — ${holat}`}
      className="flex shrink-0 items-center justify-center"
      style={{
        width: piksel,
        height: piksel,
        borderRadius: theme.radius.full,
        background: `${HOLAT_FONI[holat]}22`,
        fontSize: piksel * 0.55,
        lineHeight: 1,
      }}
    >
      {HOLAT_EMOJI[holat]}
    </div>
  );
}
