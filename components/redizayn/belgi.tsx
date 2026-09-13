import type { ReactNode } from "react";
import { theme } from "@/lib/theme";

export function Belgi({ rang = theme.colors.accent, children }: { rang?: string; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-bold text-white"
      style={{ background: rang, borderRadius: theme.radius.full }}
    >
      {children}
    </span>
  );
}
