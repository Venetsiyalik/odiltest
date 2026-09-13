"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { uz } from "@/lib/i18n/uz";
import { theme } from "@/lib/theme";
import { fanRangi } from "@/lib/redizayn/fan-rangi";
import { MashqEkrani } from "@/components/student/mashq-ekrani";
import { Tugma } from "@/components/redizayn/tugma";
import { Karta } from "@/components/redizayn/karta";
import type { MashqFani, MashqMavzusi } from "@/lib/talaba/mashq";

const ARALASH = "aralash";

export function MashqTanlov({
  fanlar,
  mavzular,
}: {
  fanlar: MashqFani[];
  mavzular: MashqMavzusi[];
}) {
  const [fanId, setFanId] = useState<number | null>(null);
  const [mavzuId, setMavzuId] = useState<number | typeof ARALASH>(ARALASH);
  const [sessiya, setSessiya] = useState<{ sessiyaId: number; fanId: number; mavzuId: number | null } | null>(
    null,
  );
  const [boshlanmoqda, setBoshlanmoqda] = useState(false);

  const filtrlanganMavzular = useMemo(
    () => mavzular.filter((m) => m.fanId === fanId),
    [mavzular, fanId],
  );

  async function boshlash() {
    if (!fanId) return;
    setBoshlanmoqda(true);
    try {
      const tanlanganMavzuId = mavzuId === ARALASH ? null : mavzuId;
      const javob = await fetch("/api/mashq/boshlash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fanId, mavzuId: tanlanganMavzuId }),
      }).then((r) => r.json());

      setSessiya({ sessiyaId: javob.sessiyaId, fanId, mavzuId: tanlanganMavzuId });
    } finally {
      setBoshlanmoqda(false);
    }
  }

  if (sessiya) {
    return (
      <MashqEkrani
        fanId={sessiya.fanId}
        mavzuId={sessiya.mavzuId}
        sessiyaId={sessiya.sessiyaId}
        toxtatish={() => setSessiya(null)}
      />
    );
  }

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
      <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[32px] font-extrabold sm:text-[36px]" style={{ color: theme.colors.primary }}>
            {uz.talaba.mashq.sarlavha}
          </h1>
          <Link href="/menyu" className="text-[18px] underline" style={{ color: theme.colors.muted }}>
            {uz.umumiy.orqaga}
          </Link>
        </div>

        {fanlar.length === 0 ? (
          <Karta className="py-8 text-center" style={{ color: theme.colors.muted }}>
            {uz.talaba.mashq.savolYoq}
          </Karta>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <p className="text-[18px] font-bold">{uz.talaba.mashq.fanTanlash}</p>
              <div className="flex flex-wrap gap-2">
                {fanlar.map((fan) => {
                  const rang = fanRangi(fan.nomi);
                  const faolmi = fanId === fan.id;
                  return (
                    <button
                      key={fan.id}
                      type="button"
                      onClick={() => {
                        setFanId(fan.id);
                        setMavzuId(ARALASH);
                      }}
                      className={cn("min-h-16 px-6 text-[18px] font-bold transition-colors", !faolmi && "text-inherit")}
                      style={{
                        borderRadius: theme.radius.md,
                        border: `2px solid ${faolmi ? rang : `${theme.colors.muted}44`}`,
                        background: faolmi ? `${rang}22` : theme.colors.surface,
                        color: faolmi ? rang : theme.colors.text,
                      }}
                    >
                      {fan.nomi}
                    </button>
                  );
                })}
              </div>
            </div>

            {fanId && (
              <div className="flex flex-col gap-2">
                <p className="text-[18px] font-bold">{uz.talaba.mashq.mavzuTanlash}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setMavzuId(ARALASH)}
                    className="min-h-16 px-6 text-[18px] font-bold"
                    style={{
                      borderRadius: theme.radius.md,
                      border: `2px solid ${mavzuId === ARALASH ? theme.colors.accent : `${theme.colors.muted}44`}`,
                      background: mavzuId === ARALASH ? `${theme.colors.accent}22` : theme.colors.surface,
                      color: mavzuId === ARALASH ? theme.colors.accent : theme.colors.text,
                    }}
                  >
                    {uz.talaba.mashq.aralash}
                  </button>
                  {filtrlanganMavzular.map((mavzu) => (
                    <button
                      key={mavzu.id}
                      type="button"
                      onClick={() => setMavzuId(mavzu.id)}
                      className="min-h-16 px-6 text-[18px] font-bold"
                      style={{
                        borderRadius: theme.radius.md,
                        border: `2px solid ${mavzuId === mavzu.id ? theme.colors.accent : `${theme.colors.muted}44`}`,
                        background: mavzuId === mavzu.id ? `${theme.colors.accent}22` : theme.colors.surface,
                        color: mavzuId === mavzu.id ? theme.colors.accent : theme.colors.text,
                      }}
                    >
                      {mavzu.nomi}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {fanId && (
              <Tugma onClick={boshlash} disabled={boshlanmoqda} rang="accent" className="w-full">
                {boshlanmoqda ? uz.umumiy.yuklanmoqda : uz.talaba.mashq.boshlash}
              </Tugma>
            )}
          </>
        )}
      </div>
    </main>
  );
}
