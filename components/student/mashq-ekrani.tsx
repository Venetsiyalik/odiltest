"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useMatnlar } from "@/components/student/matnlar-provideri";
import type { Variant } from "@/lib/talaba/aralashtirish";
import { theme } from "@/lib/theme";
import { Karta } from "@/components/redizayn/karta";
import { Tugma } from "@/components/redizayn/tugma";
import { Belgi } from "@/components/redizayn/belgi";
import { Sherbek } from "@/components/ui/Sherbek";
import { VariantTugmalari } from "@/components/redizayn/variant-tugmalari";
import { tovushChal } from "@/lib/redizayn/tovush";

interface MashqSavoli {
  savolId: number;
  matn: string;
  rasmUrl: string | null;
  variantlar: { A: string; B: string; C: string; D: string };
}

export function MashqEkrani({
  fanId,
  mavzuId,
  sessiyaId,
  toxtatish,
}: {
  fanId: number;
  mavzuId: number | null;
  sessiyaId: number;
  toxtatish: () => void;
}) {
  const { matnlar } = useMatnlar();
  const [savol, setSavol] = useState<MashqSavoli | null>(null);
  const [korilganlar, setKorilganlar] = useState<number[]>([]);
  const [faqatIdlar, setFaqatIdlar] = useState<number[] | null>(null);
  const [xatoQilinganlar, setXatoQilinganlar] = useState<Set<number>>(new Set());
  const [tanlanganJavob, setTanlanganJavob] = useState<Variant | null>(null);
  const [natija, setNatija] = useState<{ togriMi: boolean; togriJavob: Variant; izoh: string | null } | null>(
    null,
  );
  const [togriSoni, setTogriSoni] = useState(0);
  const [jamiSoni, setJamiSoni] = useState(0);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [tugadi, setTugadi] = useState(false);

  const keyingiSavolniOlish = useCallback(
    async (korilganlarRoyxati: number[], faqatIdlarRoyxati: number[] | null) => {
      setYuklanmoqda(true);
      setTanlanganJavob(null);
      setNatija(null);
      try {
        const javob = await fetch("/api/mashq/savol", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fanId,
            mavzuId,
            korilganSavolIdlar: korilganlarRoyxati,
            faqatIdlar: faqatIdlarRoyxati ?? undefined,
          }),
        }).then((r) => r.json());

        if (javob.tugadi) {
          setTugadi(true);
          setSavol(null);
        } else {
          setSavol(javob);
        }
      } finally {
        setYuklanmoqda(false);
      }
    },
    [fanId, mavzuId],
  );

  useEffect(() => {
    void keyingiSavolniOlish([], null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (natija) tovushChal(natija.togriMi ? "togri" : "xato");
  }, [natija]);

  async function harfTanlash(harf: Variant) {
    if (!savol || natija) return;
    setTanlanganJavob(harf);
    const javob = await fetch("/api/mashq/javob", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        savolId: savol.savolId,
        tanlanganJavob: harf,
        mashqSessiyaId: sessiyaId,
        qaytaUrinish: faqatIdlar !== null,
      }),
    }).then((r) => r.json());

    setNatija(javob);
    setJamiSoni((son) => son + 1);
    if (javob.togriMi) {
      setTogriSoni((son) => son + 1);
      setXatoQilinganlar((oldin) => {
        const yangi = new Set(oldin);
        yangi.delete(savol.savolId);
        return yangi;
      });
    } else {
      setXatoQilinganlar((oldin) => new Set(oldin).add(savol.savolId));
    }
  }

  function keyingiSavol() {
    const yangiKorilganlar = savol ? [...korilganlar, savol.savolId] : korilganlar;
    setKorilganlar(yangiKorilganlar);
    void keyingiSavolniOlish(yangiKorilganlar, faqatIdlar);
  }

  function xatolarniQaytaIshlash() {
    const royxat = Array.from(xatoQilinganlar);
    setFaqatIdlar(royxat);
    setKorilganlar([]);
    setTugadi(false);
    void keyingiSavolniOlish([], royxat);
  }

  async function sessiyaniYakunlash() {
    await fetch("/api/mashq/yakunlash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessiyaId }),
    });
    toxtatish();
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
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6 sm:p-8">
        <header className="flex items-center justify-between">
          <Belgi>{matnlar.talaba.mashq.hisob(togriSoni, jamiSoni)}</Belgi>
          <button
            type="button"
            onClick={sessiyaniYakunlash}
            className="min-h-16 px-6 text-[18px] font-bold"
            style={{ borderRadius: theme.radius.md, border: `2px solid ${theme.colors.muted}44` }}
          >
            {matnlar.talaba.mashq.toxtatish}
          </button>
        </header>

        {yuklanmoqda && (
          <p className="text-[20px]" style={{ color: theme.colors.muted }}>
            {matnlar.umumiy.yuklanmoqda}
          </p>
        )}

        {!yuklanmoqda && tugadi && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <Sherbek holat={togriSoni >= jamiSoni / 2 ? "zor" : "maslahat"} size="lg" />
            <p className="text-[28px] font-extrabold" style={{ color: theme.colors.primary }}>
              {matnlar.talaba.mashq.sessiyaYakunlandi}
            </p>
            <p className="text-[20px]" style={{ color: theme.colors.muted }}>
              {matnlar.talaba.mashq.hisob(togriSoni, jamiSoni)}
            </p>
            {xatoQilinganlar.size > 0 && (
              <Tugma onClick={xatolarniQaytaIshlash} rang="outline">
                {matnlar.talaba.mashq.xatolarniQaytarish} ({xatoQilinganlar.size})
              </Tugma>
            )}
            <Tugma onClick={sessiyaniYakunlash} rang="accent">
              {matnlar.talaba.test.menyugaQaytish}
            </Tugma>
          </div>
        )}

        {!yuklanmoqda && savol && (
          <section className="flex flex-1 flex-col gap-6">
            <p className="text-[22px] font-semibold sm:text-[26px]">{savol.matn}</p>
            {savol.rasmUrl && (
              <Image
                src={savol.rasmUrl}
                alt=""
                width={500}
                height={300}
                className="max-h-64 w-auto object-contain"
                style={{ borderRadius: theme.radius.md, border: `1px solid ${theme.colors.muted}33` }}
              />
            )}

            <VariantTugmalari
              variantlar={savol.variantlar}
              tanlanganJavob={tanlanganJavob}
              togriJavob={natija?.togriJavob ?? null}
              onTanlash={harfTanlash}
              ochilganmi={Boolean(natija)}
            />

            {natija && (
              <Karta className="flex flex-col items-center gap-3 text-center">
                <Sherbek
                  holat={natija.togriMi ? "zor" : "xato"}
                  animatsiya={natija.togriMi ? "sakrash" : "yoq"}
                />
                <p
                  className="text-[20px] font-bold"
                  style={{ color: natija.togriMi ? theme.colors.success : theme.colors.danger }}
                >
                  {natija.togriMi ? matnlar.talaba.organish.togri : matnlar.talaba.organish.notogri}
                </p>
                {!natija.togriMi && (
                  <p className="text-[18px]">{matnlar.talaba.organish.togriJavobEdi(natija.togriJavob)}</p>
                )}
                {natija.izoh && (
                  <p className="text-[16px]" style={{ color: theme.colors.muted }}>
                    {natija.izoh}
                  </p>
                )}
                <Tugma onClick={keyingiSavol} rang="primary">
                  {matnlar.talaba.mashq.keyingiSavol}
                </Tugma>
              </Karta>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
