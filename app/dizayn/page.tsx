import { theme } from "@/lib/theme";
import { Tugma, HavolaTugma } from "@/components/redizayn/tugma";
import { Karta } from "@/components/redizayn/karta";
import { Belgi } from "@/components/redizayn/belgi";
import { ProgressChizigi } from "@/components/redizayn/progress-chizigi";
import { Sherbek, type SherbekHolati } from "@/components/redizayn/sherbek";
import { TovushTugmasi } from "@/components/redizayn/tovush-tugmasi";

const SHERBEK_HOLATLARI: SherbekHolati[] = [
  "salom",
  "oddiy",
  "tugri",
  "xato",
  "yigi",
  "maslahat",
  "kubok",
  "kitob",
  "uyqu",
  "zor",
];

function Bolim({ sarlavha, children }: { sarlavha: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[28px] font-extrabold" style={{ color: theme.colors.primary }}>
        {sarlavha}
      </h2>
      {children}
    </section>
  );
}

export default function DizaynSahifasi() {
  return (
    <main
      className="min-h-screen"
      style={{
        background: theme.colors.bg,
        backgroundImage: "url(/naqsh.svg)",
        backgroundRepeat: "repeat",
        color: theme.colors.text,
        fontFamily: "var(--font-nunito), sans-serif",
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-14 p-8 pb-24">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-[48px] font-extrabold" style={{ color: theme.colors.primary }}>
              Dizayn tizimi
            </h1>
            <p className="text-[20px]" style={{ color: theme.colors.muted }}>
              REDIZAYN.md — 1-bosqich demo sahifasi. Faqat shu yerda ko&apos;rinadi,
              hech bir mavjud sahifa hali o&apos;zgartirilmagan.
            </p>
          </div>
          <TovushTugmasi />
        </header>

        <Bolim sarlavha="Tipografiya">
          <div className="flex flex-col gap-2">
            <p className="text-[48px] font-extrabold">h1 — 48px</p>
            <p className="text-[36px] font-extrabold">h2 — 36px</p>
            <p className="text-[28px] font-bold">h3 — 28px</p>
            <p className="text-[20px]">body — 20px, oddiy matn shu o&apos;lchamda</p>
            <p className="text-[16px]" style={{ color: theme.colors.muted }}>
              small — 16px, ikkinchi darajali matn
            </p>
          </div>
        </Bolim>

        <Bolim sarlavha="Asosiy ranglar">
          <div className="flex flex-wrap gap-3">
            {Object.entries(theme.colors).map(([nomi, hex]) => (
              <div key={nomi} className="flex w-28 flex-col items-center gap-2">
                <div
                  className="h-16 w-full"
                  style={{ background: hex, borderRadius: theme.radius.md, boxShadow: theme.shadow.card }}
                />
                <span className="text-sm font-semibold">{nomi}</span>
                <span className="text-xs" style={{ color: theme.colors.muted }}>
                  {hex}
                </span>
              </div>
            ))}
          </div>
        </Bolim>

        <Bolim sarlavha="Fan ranglari">
          <div className="flex flex-wrap gap-3">
            {Object.entries(theme.fanRanglari).map(([nomi, hex]) => (
              <div key={nomi} className="flex w-28 flex-col items-center gap-2">
                <div
                  className="h-16 w-full"
                  style={{ background: hex, borderRadius: theme.radius.md, boxShadow: theme.shadow.card }}
                />
                <span className="text-sm font-semibold capitalize">{nomi}</span>
              </div>
            ))}
          </div>
        </Bolim>

        <Bolim sarlavha="Tugmalar (3D, bosilganda pastga suriladi)">
          <div className="flex flex-wrap gap-4">
            <Tugma rang="primary">Primary</Tugma>
            <Tugma rang="accent">Accent</Tugma>
            <Tugma rang="success">Success</Tugma>
            <Tugma rang="danger">Danger</Tugma>
            <Tugma rang="outline">Outline</Tugma>
            <Tugma rang="accent" disabled>
              O&apos;chirilgan
            </Tugma>
            <HavolaTugma rang="primary" href="/">
              Havola tugma
            </HavolaTugma>
          </div>
        </Bolim>

        <Bolim sarlavha="Kahoot uslubidagi variant tugmalari">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(
              [
                { harf: "A", shakl: "▲", rang: theme.colors.danger },
                { harf: "B", shakl: "◆", rang: "#4A7BF7" },
                { harf: "C", shakl: "●", rang: theme.colors.accent },
                { harf: "D", shakl: "■", rang: theme.colors.success },
              ] as const
            ).map((variant) => (
              <div
                key={variant.harf}
                className="redizayn-tugma flex min-h-[96px] items-center gap-3 px-5 text-[20px] font-bold text-white"
                style={{
                  background: variant.rang,
                  borderRadius: theme.radius.lg,
                  ["--rd-soya" as string]: "rgba(0,0,0,0.2)",
                }}
              >
                <span className="text-2xl">{variant.shakl}</span>
                {variant.harf}
              </div>
            ))}
          </div>
        </Bolim>

        <Bolim sarlavha="Kartalar">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Karta rangChizigi={theme.fanRanglari.matematika}>
              <p className="text-[20px] font-bold">Matematika</p>
              <p className="text-sm" style={{ color: theme.colors.muted }}>
                18 mavzu · 42 material
              </p>
            </Karta>
            <Karta rangChizigi={theme.fanRanglari.informatika} bosiladigan>
              <p className="text-[20px] font-bold">Informatika (bosiladigan)</p>
              <p className="text-sm" style={{ color: theme.colors.muted }}>
                12 mavzu · 30 material
              </p>
            </Karta>
            <Karta>
              <p className="text-[20px] font-bold">Chiziqsiz karta</p>
              <p className="text-sm" style={{ color: theme.colors.muted }}>
                rangChizigi ixtiyoriy
              </p>
            </Karta>
          </div>
        </Bolim>

        <Bolim sarlavha="Belgilar va progress chizig'i">
          <div className="flex flex-wrap items-center gap-3">
            <Belgi>+20 XP</Belgi>
            <Belgi rang={theme.colors.success}>Daraja 4</Belgi>
            <Belgi rang={theme.colors.primary}>🔥 7 kun</Belgi>
          </div>
          <div className="flex max-w-sm flex-col gap-2">
            <ProgressChizigi foiz={70} />
            <ProgressChizigi foiz={35} rang={theme.colors.success} />
          </div>
        </Bolim>

        <Bolim sarlavha="Sherbek (hozircha placeholder — haqiqiy rasm keyin almashadi)">
          <div className="flex flex-wrap gap-6">
            {SHERBEK_HOLATLARI.map((holat) => (
              <div key={holat} className="flex flex-col items-center gap-2">
                <Sherbek holat={holat} size="lg" />
                <span className="text-sm font-semibold">{holat}</span>
              </div>
            ))}
          </div>
        </Bolim>
      </div>
    </main>
  );
}
