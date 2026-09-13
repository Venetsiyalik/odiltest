import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { mavzularProgressBilanOl } from "@/lib/talaba/organish";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { fanRangi } from "@/lib/redizayn/fan-rangi";
import { theme } from "@/lib/theme";
import { Karta } from "@/components/redizayn/karta";

export default async function FanMavzulariPage({
  params,
}: {
  params: Promise<{ fanId: string }>;
}) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) redirect("/kirish");

  const { fanId } = await params;
  const fanIdRaqami = Number(fanId);
  if (!Number.isInteger(fanIdRaqami)) notFound();

  const supabase = createServiceRoleClient();
  const { data: fan } = await supabase.from("fanlar").select("nomi").eq("id", fanIdRaqami).maybeSingle();
  if (!fan) notFound();

  const mavzular = await mavzularProgressBilanOl(fanIdRaqami, oquvchi.sinfId, oquvchi.id);
  const rang = fanRangi(fan.nomi);

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
          <h1 className="text-[36px] font-extrabold" style={{ color: rang }}>
            {fan.nomi}
          </h1>
          <Link href="/organish" className="text-[18px] underline" style={{ color: theme.colors.muted }}>
            Orqaga
          </Link>
        </div>

        {mavzular.length === 0 && (
          <Karta className="py-8 text-center" style={{ color: theme.colors.muted }}>
            Bu fan uchun hali mavzu yo&apos;q
          </Karta>
        )}

        <div className="flex flex-col gap-3">
          {mavzular.map((mavzu, indeks) => (
            <Link key={mavzu.mavzuId} href={`/organish/${fanIdRaqami}/${mavzu.mavzuId}`}>
              <Karta bosiladigan className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: rang }}
                  >
                    {indeks + 1}
                  </span>
                  <span className="text-[20px] font-semibold">{mavzu.nomi}</span>
                </div>
                {mavzu.organildimi && (
                  <span className="text-2xl" style={{ color: theme.colors.success }} aria-label="O'rganilgan">
                    ✓
                  </span>
                )}
              </Karta>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
