import { notFound } from "next/navigation";
import Link from "next/link";
import { darajaHaqiqiymi } from "@/lib/redizayn/daraja";
import { fanSahifasiniOl, type FanMavzusi } from "@/lib/redizayn/dashboard";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { theme } from "@/lib/theme";
import { joriyMatnlarniOlish } from "@/lib/i18n/joriy-til";
import { Karta } from "@/components/redizayn/karta";
import { ProgressChizigi } from "@/components/redizayn/progress-chizigi";
import { FanIkonka } from "@/components/ui/FanIkonka";

const TURI_IKONKASI: Record<string, string> = {
  maruza: "📄",
  prezentatsiya: "📊",
  video: "🎬",
  fayl: "📎",
};

function bolimlarGaGuruhlash(mavzular: FanMavzusi[]): { bolim: string | null; mavzular: FanMavzusi[] }[] {
  const guruhlar: { bolim: string | null; mavzular: FanMavzusi[] }[] = [];
  for (const mavzu of mavzular) {
    const oxirgi = guruhlar[guruhlar.length - 1];
    if (oxirgi && oxirgi.bolim === mavzu.bolim) {
      oxirgi.mavzular.push(mavzu);
    } else {
      guruhlar.push({ bolim: mavzu.bolim, mavzular: [mavzu] });
    }
  }
  return guruhlar;
}

export default async function FanSahifasi({
  params,
}: {
  params: Promise<{ daraja: string; fanId: string }>;
}) {
  const { daraja, fanId } = await params;
  const darajaRaqami = Number(daraja);
  const fanIdRaqami = Number(fanId);
  if (!Number.isInteger(darajaRaqami) || !darajaHaqiqiymi(darajaRaqami) || !Number.isInteger(fanIdRaqami)) {
    notFound();
  }

  const oquvchi = await joriyOquvchiniOl();
  const [{ fanNomi, mavzular }, matnlar] = await Promise.all([
    fanSahifasiniOl(darajaRaqami, fanIdRaqami, oquvchi?.id),
    joriyMatnlarniOlish(),
  ]);
  if (!fanNomi) notFound();

  const organilganSoni = mavzular.filter((m) => m.organildimi).length;
  const guruhlar = bolimlarGaGuruhlash(mavzular);

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
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6 pb-16 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FanIkonka fan={fanNomi} size="lg" priority />
            <div>
              <p className="text-sm" style={{ color: theme.colors.muted }}>
                {matnlar.talaba.sinf.darajaSarlavha(darajaRaqami)}
              </p>
              <h1 className="text-[36px] font-extrabold sm:text-[48px]" style={{ color: theme.colors.primary }}>
                {fanNomi}
              </h1>
            </div>
          </div>
          <Link href={`/sinf/${darajaRaqami}`} className="text-[18px] underline" style={{ color: theme.colors.muted }}>
            {matnlar.umumiy.orqaga}
          </Link>
        </div>

        {oquvchi && mavzular.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm" style={{ color: theme.colors.muted }}>
              {matnlar.talaba.sinf.mavzuOrganilgan(organilganSoni, mavzular.length)}
            </p>
            <ProgressChizigi foiz={(organilganSoni / mavzular.length) * 100} />
          </div>
        )}

        {mavzular.length === 0 ? (
          <Karta className="py-8 text-center" style={{ color: theme.colors.muted }}>
            {matnlar.talaba.sinf.mavzuYoq}
          </Karta>
        ) : (
          <div className="flex flex-col gap-6">
            {guruhlar.map((guruh, guruhIndeksi) => (
              <div key={guruh.bolim ?? `guruhsiz-${guruhIndeksi}`} className="flex flex-col gap-3">
                {guruh.bolim && (
                  <h2 className="text-[20px] font-bold" style={{ color: theme.colors.primary }}>
                    {guruh.bolim}
                  </h2>
                )}
                {guruh.mavzular.map((mavzu, indeks) => (
                  <Link key={mavzu.mavzuId} href={`/sinf/${darajaRaqami}/${fanIdRaqami}/${mavzu.mavzuId}`}>
                    <Karta bosiladigan className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                          style={{ background: theme.colors.primary }}
                        >
                          {indeks + 1}
                        </span>
                        <div>
                          <p className="text-[18px] font-semibold">{mavzu.nomi}</p>
                          {mavzu.materialTurlari.length > 0 && (
                            <p className="text-sm">
                              {mavzu.materialTurlari.map((turi) => TURI_IKONKASI[turi] ?? "").join(" ")}
                            </p>
                          )}
                        </div>
                      </div>
                      {mavzu.organildimi && (
                        <span
                          className="text-2xl"
                          style={{ color: theme.colors.success }}
                          aria-label={matnlar.talaba.sinf.organilganBelgi}
                        >
                          ✓
                        </span>
                      )}
                    </Karta>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
