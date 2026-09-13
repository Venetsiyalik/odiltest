import { Logo } from "@/components/ui/Logo";
import { theme } from "@/lib/theme";

export function Footer() {
  return (
    <footer
      className="mt-auto flex items-center justify-center p-6"
      style={{ background: theme.colors.primary }}
    >
      <Logo size="sm" variant="oq" withText />
    </footer>
  );
}
