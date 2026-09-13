"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { theme, toqlashtirish } from "@/lib/theme";

type TugmaRangi = "primary" | "accent" | "success" | "danger" | "outline";

interface UmumiyProps {
  rang?: TugmaRangi;
  children: ReactNode;
  className?: string;
}

interface TugmaProps
  extends UmumiyProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "className" | "children"> {
  href?: undefined;
}

interface HavolaTugmaProps extends UmumiyProps {
  href: string;
  disabled?: boolean;
}

const RANG_XARITASI: Record<Exclude<TugmaRangi, "outline">, string> = {
  primary: theme.colors.primary,
  accent: theme.colors.accent,
  success: theme.colors.success,
  danger: theme.colors.danger,
};

function stilVaSinf(rang: TugmaRangi, disabled: boolean | undefined, className: string | undefined) {
  const asosiyRang = rang === "outline" ? theme.colors.surface : RANG_XARITASI[rang];
  const soyaRang = rang === "outline" ? "rgba(0,0,0,0.12)" : toqlashtirish(asosiyRang, 0.2);
  const matnRang = rang === "outline" ? theme.colors.text : "#FFFFFF";

  const stil: CSSProperties & Record<string, string | number> = {
    background: asosiyRang,
    color: matnRang,
    borderRadius: theme.radius.lg,
    border: rang === "outline" ? `2px solid ${theme.colors.muted}55` : "none",
    "--rd-soya": soyaRang,
  };

  const sinf = cn(
    "redizayn-tugma inline-flex min-h-[72px] select-none items-center justify-center gap-2 px-6 text-[20px] font-bold",
    disabled && "pointer-events-none opacity-50",
    className,
  );

  return { stil, sinf };
}

export function Tugma({ rang = "accent", children, className, disabled, ...qolgan }: TugmaProps) {
  const { stil, sinf } = stilVaSinf(rang, disabled, className);
  return (
    <button type="button" className={sinf} style={stil} disabled={disabled} {...qolgan}>
      {children}
    </button>
  );
}

export function HavolaTugma({ rang = "accent", children, className, href, disabled }: HavolaTugmaProps) {
  const { stil, sinf } = stilVaSinf(rang, disabled, className);
  if (disabled) {
    return (
      <span className={sinf} style={stil} aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={sinf} style={stil}>
      {children}
    </Link>
  );
}
