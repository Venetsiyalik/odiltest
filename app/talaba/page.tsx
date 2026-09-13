import Link from "next/link";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { darajalarStatistikasiniOl, qidiruvIndeksiniOl } from "@/lib/redizayn/dashboard";
import { oquvchiHolatiniOl, sinfReytinginiOl } from "@/lib/redizayn/gamifikatsiya";
import { AVATARLAR } from "@/lib/redizayn/avatarlar-royxati";
import { theme } from "@/lib/theme";
import { saytUrliniOl } from "@/lib/utils/site-url";
import { Logo } from "@/components/ui/Logo";
import { Karta } from "@/components/redizayn/karta";
import { Sherbek } from "@/components/redizayn/sherbek";
import { Belgi } from "@/components/redizayn/belgi";
import { ProgressChizigi } from "@/components/redizayn/progress-chizigi";
import { Qidiruv } from "@/components/redizayn/qidiruv";
import { HavolaTugma } from "@/components/redizayn/tugma";
import { TovushTugmasi } from "@/components/redizayn/tovush-tugmasi";

export default async function DashboardSahifasi() {
  const [oquvchi, darajalar, qidiruvIndeksi, sinfReytingi] = await Promise.all([
    joriyOquvchiniOl(),
    darajalarStatistikasiniOl(),
    qidiruvIndeksiniOl(),
    sinfReytinginiOl(),
  ]);

  const holat = oquvchi ? await oquvchiHolatiniOl(oquvchi.id) : null;
  const avatarEmoji = holat ? (AVATARLAR.find((a) => a.kod === holat.avatar)?.emoji ?? "🙂") : "🙂";

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
      {/* Google/qidiruv tizimlari uchun tuzilgan ma'lumot (JSON-LD) — statik,
          serverda tuzilgan JSON, foydalanuvchi kiritmasi emas, shuning uchun
          dangerouslySetInnerHTML xavfsiz (loyihaning Markdown-kontent uchun
          bu usuldan qochish qoidasi bu yerga taalluqli emas). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "Odil School",
            url: saytUrliniOl(),
            description:
              "5-11-sinf o'quvchilari uchun bepul onlayn darslar, mashqlar va testlar.",
          }),
        }}
      />
      <div className="mx-auto flex max-w-5xl flex-col gap-10 p-6 pb-16 sm:p-8">
        {oquvchi && holat && (
          <div
            className="flex flex-col gap-3 px-5 py-4"
            style={{ background: theme.colors.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.card }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-full text-2xl"
                  style={{ background: `${theme.colors.accent}22` }}
                >
                  {avatarEmoji}
                </span>
                <div>
                  <p className="text-[18px] font-bold">{oquvchi.ismFamiliya}</p>
                  <p className="text-sm" style={{ color: theme.colors.muted }}>
                    {oquvchi.sinfNomi} sinf
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Belgi rang={theme.colors.primary}>Daraja {holat.daraja}</Belgi>
                <Belgi>{holat.jamiXp} XP</Belgi>
                <Belgi rang={theme.colors.success}>
                  🔥 {holat.seriya} kun{holat.muzlatgich > 0 ? ` · ❄️×${holat.muzlatgich}` : ""}
                </Belgi>
                <HavolaTugma href="/menyu" rang="primary" hajm="kichik">
                  Shaxsiy kabinet
                </HavolaTugma>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm" style={{ color: theme.colors.muted }}>
                Bugungi maqsad: {holat.bugungiMaqsad.joriy}/{holat.bugungiMaqsad.maqsad} mashq savoli
                {holat.bugungiMaqsad.bajarildimi ? " ✓" : ""}
              </p>
              <ProgressChizigi
                foiz={(holat.bugungiMaqsad.joriy / holat.bugungiMaqsad.maqsad) * 100}
                rang={holat.bugungiMaqsad.bajarildimi ? theme.colors.success : theme.colors.accent}
              />
            </div>
          </div>
        )}

        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Sherbek holat="salom" size="lg" />
            <div>
              <Logo size="md" withText priority />
              <p className="mt-1 text-[18px] sm:text-[20px]" style={{ color: theme.colors.muted }}>
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
            <h2 className="text-[20px] font-bold">Sinflar reytingi (shu hafta)</h2>
            {sinfReytingi.length === 0 ? (
              <Karta className="flex flex-col items-center gap-2 py-8 text-center">
                <Sherbek holat="maslahat" />
                <p style={{ color: theme.colors.muted }}>Bu hafta hali XP to&apos;plangani yo&apos;q</p>
              </Karta>
            ) : (
              <Karta className="flex flex-col gap-2">
                {sinfReytingi.map((s, indeks) => (
                  <div key={s.sinfNomi} className="flex items-center justify-between">
                    <span className="font-semibold">
                      {indeks + 1}. {s.sinfNomi}
                    </span>
                    <span style={{ color: theme.colors.muted }}>{s.jamiXp} XP</span>
                  </div>
                ))}
              </Karta>
            )}
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
