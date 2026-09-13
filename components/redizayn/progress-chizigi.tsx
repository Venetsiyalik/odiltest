import { theme } from "@/lib/theme";

export function ProgressChizigi({ foiz, rang = theme.colors.accent }: { foiz: number; rang?: string }) {
  const chegaralangan = Math.min(100, Math.max(0, foiz));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(chegaralangan)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-3 w-full overflow-hidden bg-black/5"
      style={{ borderRadius: theme.radius.full }}
    >
      <div
        className="h-full transition-[width] duration-300"
        style={{ width: `${chegaralangan}%`, background: rang, borderRadius: theme.radius.full }}
      />
    </div>
  );
}
