import { theme } from "@/lib/theme";

const RANGLAR = Object.values(theme.fanRanglari);
const BOLAKLAR = Array.from({ length: 24 }, (_, i) => i);

export function Konfetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {BOLAKLAR.map((i) => (
        <span
          key={i}
          className="redizayn-konfetti-bolagi absolute top-0 block h-3 w-2"
          style={{
            left: `${(i * 41) % 100}%`,
            background: RANGLAR[i % RANGLAR.length],
            animationDelay: `${(i % 6) * 0.08}s`,
            animationDuration: `${1.6 + (i % 5) * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}
