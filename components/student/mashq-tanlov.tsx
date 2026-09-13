"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { uz } from "@/lib/i18n/uz";
import { MashqEkrani } from "@/components/student/mashq-ekrani";
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
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">{uz.talaba.mashq.sarlavha}</h1>
        <Link href="/menyu" className="text-lg text-muted-foreground underline">
          {uz.umumiy.orqaga}
        </Link>
      </div>

      {fanlar.length === 0 ? (
        <p className="text-xl text-muted-foreground">{uz.talaba.mashq.savolYoq}</p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-lg font-medium">{uz.talaba.mashq.fanTanlash}</p>
            <div className="flex flex-wrap gap-2">
              {fanlar.map((fan) => (
                <button
                  key={fan.id}
                  type="button"
                  onClick={() => {
                    setFanId(fan.id);
                    setMavzuId(ARALASH);
                  }}
                  className={cn(
                    "min-h-16 rounded-xl border-2 px-6 text-lg font-medium active:bg-muted",
                    fanId === fan.id ? "border-primary bg-primary/10" : "border-border",
                  )}
                >
                  {fan.nomi}
                </button>
              ))}
            </div>
          </div>

          {fanId && (
            <div className="flex flex-col gap-2">
              <p className="text-lg font-medium">{uz.talaba.mashq.mavzuTanlash}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMavzuId(ARALASH)}
                  className={cn(
                    "min-h-16 rounded-xl border-2 px-6 text-lg font-medium active:bg-muted",
                    mavzuId === ARALASH ? "border-primary bg-primary/10" : "border-border",
                  )}
                >
                  {uz.talaba.mashq.aralash}
                </button>
                {filtrlanganMavzular.map((mavzu) => (
                  <button
                    key={mavzu.id}
                    type="button"
                    onClick={() => setMavzuId(mavzu.id)}
                    className={cn(
                      "min-h-16 rounded-xl border-2 px-6 text-lg font-medium active:bg-muted",
                      mavzuId === mavzu.id ? "border-primary bg-primary/10" : "border-border",
                    )}
                  >
                    {mavzu.nomi}
                  </button>
                ))}
              </div>
            </div>
          )}

          {fanId && (
            <button
              type="button"
              onClick={boshlash}
              disabled={boshlanmoqda}
              className="min-h-20 rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground active:opacity-80 disabled:opacity-50"
            >
              {boshlanmoqda ? uz.umumiy.yuklanmoqda : uz.talaba.mashq.boshlash}
            </button>
          )}
        </>
      )}
    </main>
  );
}
