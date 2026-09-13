import { notFound } from "next/navigation";
import Link from "next/link";
import { darajaHaqiqiymi } from "@/lib/redizayn/daraja";
import { fanSahifasiniOl } from "@/lib/redizayn/dashboard";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { theme } from "@/lib/theme";
import { Karta } from "@/components/redizayn/karta";
import { ProgressChizigi } from "@/components/redizayn/progress-chizigi";

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
  const { fanNomi, mavzular } = await fanSahifasiniOl(darajaRaqami, fanIdRaqami, oquvchi?.id);
  if (!fanNomi) notFound();

  const organilganSoni = mavzular.filter((m) => m.organildimi).length;

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
            <p className="text-sm" style={{ color: theme.colors.muted }}>
              {darajaRaqami}-sinf
            </p>
            <h1 className="text-[36px] font-extrabold sm:text-[48px]" style={{ color: theme.colors.primary }}>
              {fanNomi}
            </h1>
          </div>
          <Link href={`/sinf/${darajaRaqami}`} className="text-[18px] underline" style={{ color: theme.colors.muted }}>
            Orqaga
          </Link>
        </div>

        {oquvchi && mavzular.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm" style={{ color: theme.colors.muted }}>
              {mavzular.length} mavzudan {organilganSoni} tasi o&apos;rganilgan
            </p>
            <ProgressChizigi foiz={(organilganSoni / mavzular.length) * 100} />
          </div>
        )}

        {mavzular.length === 0 ? (
          <Karta className="py-8 text-center" style={{ color: theme.colors.muted }}>
            Bu fan uchun hali mavzu qo&apos;shilmagan
          </Karta>
        ) : (
          <div className="flex flex-col gap-3">
            {mavzular.map((mavzu, indeks) => (
              <Karta key={mavzu.mavzuId} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: theme.colors.primary }}
                  >
                    {indeks + 1}
                  </span>
                  <p className="text-[18px] font-semibold">{mavzu.nomi}</p>
                </div>
                {mavzu.organildimi && (
                  <span className="text-2xl" style={{ color: theme.colors.success }} aria-label="O'rganilgan">
                    ✓
                  </span>
                )}
              </Karta>
            ))}
            <p className="text-sm" style={{ color: theme.colors.muted }}>
              Mavzu sahifasi (ma&apos;ruza, prezentatsiya, video) keyingi bosqichda qo&apos;shiladi.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
