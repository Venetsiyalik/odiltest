import { notFound } from "next/navigation";
import Link from "next/link";
import { darajaHaqiqiymi } from "@/lib/redizayn/daraja";
import { darajaFanlariniOl } from "@/lib/redizayn/dashboard";
import { theme } from "@/lib/theme";
import { Karta } from "@/components/redizayn/karta";
import { Belgi } from "@/components/redizayn/belgi";
import { FanIkonka } from "@/components/ui/FanIkonka";

export default async function SinfSahifasi({
  params,
}: {
  params: Promise<{ daraja: string }>;
}) {
  const { daraja } = await params;
  const darajaRaqami = Number(daraja);
  if (!Number.isInteger(darajaRaqami) || !darajaHaqiqiymi(darajaRaqami)) notFound();

  const fanlar = await darajaFanlariniOl(darajaRaqami);

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
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6 pb-16 sm:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[36px] font-extrabold sm:text-[48px]" style={{ color: theme.colors.primary }}>
            {darajaRaqami}-sinf
          </h1>
          <Link href="/" className="text-[18px] underline" style={{ color: theme.colors.muted }}>
            Bosh sahifa
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {fanlar.map((fan) => {
            const mavjud = fan.mavzuSoni > 0;
            const kontent = (
              <Karta bosiladigan={mavjud} className="flex flex-col gap-2">
                <FanIkonka fan={fan.nomi} size="md" />
                <p className="text-[20px] font-bold">{fan.nomi}</p>
                {mavjud ? (
                  <p className="text-sm" style={{ color: theme.colors.muted }}>
                    {fan.mavzuSoni} mavzu
                  </p>
                ) : (
                  <Belgi rang={theme.colors.muted}>Tez orada</Belgi>
                )}
              </Karta>
            );
            return mavjud ? (
              <Link key={fan.fanId} href={`/sinf/${darajaRaqami}/${fan.fanId}`}>
                {kontent}
              </Link>
            ) : (
              <div key={fan.fanId} aria-disabled="true">
                {kontent}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
