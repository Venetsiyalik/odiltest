import { redirect } from "next/navigation";
import Link from "next/link";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { fanlarProgressBilanOl } from "@/lib/talaba/organish";
import { fanRangi } from "@/lib/redizayn/fan-rangi";
import { theme } from "@/lib/theme";
import { uz } from "@/lib/i18n/uz";
import { Karta } from "@/components/redizayn/karta";
import { ProgressChizigi } from "@/components/redizayn/progress-chizigi";
import { Sherbek } from "@/components/redizayn/sherbek";

export default async function OrganishPage() {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) redirect("/kirish");

  const fanlar = await fanlarProgressBilanOl(oquvchi.sinfId, oquvchi.id);

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
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[36px] font-extrabold" style={{ color: theme.colors.primary }}>
            {uz.talaba.menyu.organish}
          </h1>
          <Link href="/menyu" className="text-[18px] underline" style={{ color: theme.colors.muted }}>
            {uz.umumiy.orqaga}
          </Link>
        </div>

        {fanlar.length === 0 && (
          <Karta className="flex flex-col items-center gap-3 py-10 text-center">
            <Sherbek holat="maslahat" />
            <p style={{ color: theme.colors.muted }}>Hozircha fan mavjud emas</p>
          </Karta>
        )}

        <div className="flex flex-col gap-4">
          {fanlar.map((fan) => {
            const foiz = fan.jamiMavzu > 0 ? Math.round((fan.organilganMavzu / fan.jamiMavzu) * 100) : 0;
            const rang = fanRangi(fan.fanNomi);
            return (
              <Link key={fan.fanId} href={`/organish/${fan.fanId}`}>
                <Karta bosiladigan rangChizigi={rang} className="flex flex-col gap-3">
                  <span className="text-[24px] font-bold">{fan.fanNomi}</span>
                  <span className="text-[18px]" style={{ color: theme.colors.muted }}>
                    {fan.jamiMavzu} mavzudan {fan.organilganMavzu} tasi o&apos;rganildi
                  </span>
                  <ProgressChizigi foiz={foiz} rang={rang} />
                </Karta>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
