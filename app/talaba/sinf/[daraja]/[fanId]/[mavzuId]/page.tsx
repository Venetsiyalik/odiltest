import { notFound } from "next/navigation";
import Link from "next/link";
import { darajaHaqiqiymi } from "@/lib/redizayn/daraja";
import { mavzuSahifasiniOl, type MaterialTuri } from "@/lib/redizayn/mavzu-sahifasi";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { theme } from "@/lib/theme";
import { Karta } from "@/components/redizayn/karta";
import { HavolaTugma } from "@/components/redizayn/tugma";

const TURI_IKONKASI: Record<MaterialTuri, string> = {
  maruza: "📄",
  prezentatsiya: "📊",
  video: "🎬",
  fayl: "📎",
};

const TURI_NOMI: Record<MaterialTuri, string> = {
  maruza: "Ma'ruza",
  prezentatsiya: "Prezentatsiya",
  video: "Video",
  fayl: "Fayl",
};

export default async function MavzuSahifasi({
  params,
}: {
  params: Promise<{ daraja: string; fanId: string; mavzuId: string }>;
}) {
  const { daraja, fanId, mavzuId } = await params;
  const darajaRaqami = Number(daraja);
  const fanIdRaqami = Number(fanId);
  const mavzuIdRaqami = Number(mavzuId);
  if (
    !Number.isInteger(darajaRaqami) ||
    !darajaHaqiqiymi(darajaRaqami) ||
    !Number.isInteger(fanIdRaqami) ||
    !Number.isInteger(mavzuIdRaqami)
  ) {
    notFound();
  }

  const oquvchi = await joriyOquvchiniOl();
  const mavzu = await mavzuSahifasiniOl(mavzuIdRaqami, oquvchi?.id);
  if (!mavzu || mavzu.fanId !== fanIdRaqami) notFound();

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
          <div>
            {mavzu.bolim && (
              <p className="text-sm font-semibold" style={{ color: theme.colors.accent }}>
                {mavzu.bolim}
              </p>
            )}
            <h1 className="text-[32px] font-extrabold sm:text-[40px]" style={{ color: theme.colors.primary }}>
              {mavzu.nomi}
            </h1>
            {mavzu.tavsif && (
              <p className="text-[18px]" style={{ color: theme.colors.muted }}>
                {mavzu.tavsif}
              </p>
            )}
          </div>
          <Link
            href={`/sinf/${darajaRaqami}/${fanIdRaqami}`}
            className="shrink-0 text-[16px] underline"
            style={{ color: theme.colors.muted }}
          >
            Orqaga
          </Link>
        </div>

        {mavzu.materiallar.length === 0 ? (
          <Karta className="py-8 text-center" style={{ color: theme.colors.muted }}>
            Bu mavzu uchun hali material qo&apos;shilmagan
          </Karta>
        ) : (
          <div className="flex flex-col gap-3">
            {mavzu.materiallar.map((material) => (
              <Link
                key={material.id}
                href={`/sinf/${darajaRaqami}/${fanIdRaqami}/${mavzuIdRaqami}/${material.id}`}
              >
                <Karta bosiladigan className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{TURI_IKONKASI[material.turi]}</span>
                    <div>
                      <p className="text-[18px] font-semibold">{material.sarlavha}</p>
                      <p className="text-sm" style={{ color: theme.colors.muted }}>
                        {TURI_NOMI[material.turi]}
                        {material.slaydSoni ? ` · ${material.slaydSoni} slayd` : ""}
                      </p>
                    </div>
                  </div>
                  {material.korilganmi && (
                    <span className="text-2xl" style={{ color: theme.colors.success }} aria-label="Ko'rilgan">
                      ✓
                    </span>
                  )}
                </Karta>
              </Link>
            ))}
          </div>
        )}

        <HavolaTugma href={oquvchi ? "/mashq" : "/kirish"} rang="accent" className="self-start">
          ✏️ Shu mavzu bo&apos;yicha mashq qilish
        </HavolaTugma>

        <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: `${theme.colors.muted}33` }}>
          {mavzu.oldingiMavzuId ? (
            <Link
              href={`/sinf/${darajaRaqami}/${fanIdRaqami}/${mavzu.oldingiMavzuId}`}
              className="text-[16px] underline"
              style={{ color: theme.colors.muted }}
            >
              ← Oldingi mavzu
            </Link>
          ) : (
            <span />
          )}
          {mavzu.keyingiMavzuId && (
            <Link
              href={`/sinf/${darajaRaqami}/${fanIdRaqami}/${mavzu.keyingiMavzuId}`}
              className="text-[16px] underline"
              style={{ color: theme.colors.muted }}
            >
              Keyingi mavzu →
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
