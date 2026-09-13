import Link from "next/link";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { darajalarStatistikasiniOl, qidiruvIndeksiniOl } from "@/lib/redizayn/dashboard";
import { theme } from "@/lib/theme";
import { Karta } from "@/components/redizayn/karta";
import { Sherbek } from "@/components/redizayn/sherbek";
import { Qidiruv } from "@/components/redizayn/qidiruv";
import { HavolaTugma } from "@/components/redizayn/tugma";
import { TovushTugmasi } from "@/components/redizayn/tovush-tugmasi";

export default async function DashboardSahifasi() {
  const [oquvchi, darajalar, qidiruvIndeksi] = await Promise.all([
    joriyOquvchiniOl(),
    darajalarStatistikasiniOl(),
    qidiruvIndeksiniOl(),
  ]);

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
      <div className="mx-auto flex max-w-5xl flex-col gap-10 p-6 pb-16 sm:p-8">
        {oquvchi && (
          <div
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
            style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.card }}
          >
            <div className="flex items-center gap-3">
              <Sherbek holat="oddiy" size="sm" />
              <div>
                <p className="text-[18px] font-bold">{oquvchi.ismFamiliya}</p>
                <p className="text-sm" style={{ color: theme.colors.muted }}>
                  {oquvchi.sinfNomi} sinf
                </p>
              </div>
            </div>
            <HavolaTugma href="/menyu" rang="primary" hajm="kichik">
              Shaxsiy kabinet
            </HavolaTugma>
          </div>
        )}

        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Sherbek holat="salom" size="lg" />
            <div>
              <h1 className="text-[36px] font-extrabold sm:text-[48px]" style={{ color: theme.colors.primary }}>
                Odil School bilim platformasi
              </h1>
              <p className="text-[18px] sm:text-[20px]" style={{ color: theme.colors.muted }}>
                Barcha fan va mavzular — hammaga ochiq, kodsiz
              </p>
            </div>
          </div>
          <TovushTugmasi />
        </header>

        <Qidiruv indeks={qidiruvIndeksi} />

        <section className="flex flex-col gap-4">
          <h2 className="text-[28px] font-extrabold" style={{ color: theme.colors.primary }}>
            Sinflar
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {darajalar.map((d) => (
              <Link key={d.daraja} href={`/sinf/${d.daraja}`}>
                <Karta bosiladigan className="flex flex-col items-center gap-1 text-center">
                  <p className="text-[36px] font-extrabold" style={{ color: theme.colors.primary }}>
                    {d.daraja}
                  </p>
                  <p className="text-sm" style={{ color: theme.colors.muted }}>
                    {d.mavjudmi ? `${d.fanSoni} fan · ${d.mavzuSoni} mavzu` : "Tez orada"}
                  </p>
                </Karta>
              </Link>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-[28px] font-extrabold" style={{ color: theme.colors.primary }}>
            Tez havolalar
          </h2>
          <div className="flex flex-wrap gap-4">
            <HavolaTugma href="/mashq" rang="accent">
              ✏️ Mashq qilish
            </HavolaTugma>
            <HavolaTugma href="/kirish" rang="primary">
              📝 Test topshirish (kod bilan)
            </HavolaTugma>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold">Sinflar reytingi</h2>
            <Karta className="flex flex-col items-center gap-2 py-8 text-center">
              <Sherbek holat="maslahat" />
              <p style={{ color: theme.colors.muted }}>
                Tez orada — gamifikatsiya moduli qo&apos;shilgach shu yerda ko&apos;rinadi
              </p>
            </Karta>
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold">Oxirgi qo&apos;shilgan materiallar</h2>
            <Karta className="flex flex-col items-center gap-2 py-8 text-center">
              <Sherbek holat="kitob" />
              <p style={{ color: theme.colors.muted }}>
                Tez orada — o&apos;quv materiallari moduli qo&apos;shilgach shu yerda ko&apos;rinadi
              </p>
            </Karta>
          </section>
        </div>
      </div>
    </main>
  );
}
