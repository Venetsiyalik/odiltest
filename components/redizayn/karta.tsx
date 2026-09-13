import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";

interface KartaProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  rangChizigi?: string;
  /** Faqat vizual "bosiladigan" uslub uchun (haqiqiy onClick shart emas) — masalan Server Component demo sahifalarida. */
  bosiladigan?: boolean;
  children: ReactNode;
  className?: string;
}

export function Karta({ rangChizigi, bosiladigan, children, className, onClick, ...qolgan }: KartaProps) {
  const stil: CSSProperties = {
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadow.card,
    background: theme.colors.surface,
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "redizayn-karta relative overflow-hidden p-5",
        (onClick || bosiladigan) && "redizayn-karta--bosiladigan cursor-pointer",
        className,
      )}
      style={stil}
      {...qolgan}
    >
      {rangChizigi && (
        <div className="absolute inset-x-0 top-0 h-2" style={{ background: rangChizigi }} aria-hidden="true" />
      )}
      {children}
    </div>
  );
}
