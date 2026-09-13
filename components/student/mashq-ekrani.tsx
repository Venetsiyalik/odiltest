"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { uz } from "@/lib/i18n/uz";
import type { Variant } from "@/lib/talaba/aralashtirish";

interface MashqSavoli {
  savolId: number;
  matn: string;
  rasmUrl: string | null;
  variantlar: { A: string; B: string; C: string; D: string };
}

const VARIANT_HARFLAR: Variant[] = ["A", "B", "C", "D"];

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
    <main className="flex min-h-screen flex-col gap-6 p-6 sm:p-8">
      <header className="flex items-center justify-between">
        <span className="text-xl font-semibold">{uz.talaba.mashq.hisob(togriSoni, jamiSoni)}</span>
        <button
          type="button"
          onClick={sessiyaniYakunlash}
          className="min-h-16 rounded-xl border-2 border-border px-6 text-lg font-medium active:bg-muted"
        >
          {uz.talaba.mashq.toxtatish}
        </button>
      </header>

      {yuklanmoqda && <p className="text-xl text-muted-foreground">{uz.umumiy.yuklanmoqda}</p>}

      {!yuklanmoqda && tugadi && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <p className="text-2xl font-semibold">{uz.talaba.mashq.sessiyaYakunlandi}</p>
          <p className="text-xl text-muted-foreground">{uz.talaba.mashq.hisob(togriSoni, jamiSoni)}</p>
          {xatoQilinganlar.size > 0 && (
            <button
              type="button"
              onClick={xatolarniQaytaIshlash}
              className="min-h-20 rounded-2xl border-2 border-border px-8 text-xl font-semibold active:bg-muted"
            >
              {uz.talaba.mashq.xatolarniQaytarish} ({xatoQilinganlar.size})
            </button>
          )}
          <button
            type="button"
            onClick={sessiyaniYakunlash}
            className="min-h-20 rounded-2xl bg-primary px-10 text-xl font-semibold text-primary-foreground active:opacity-80"
          >
            {uz.talaba.test.menyugaQaytish}
          </button>
        </div>
      )}

      {!yuklanmoqda && savol && (
        <section className="flex flex-1 flex-col gap-6">
          <p className="text-xl font-medium sm:text-2xl">{savol.matn}</p>
          {savol.rasmUrl && (
            <Image
              src={savol.rasmUrl}
              alt=""
              width={500}
              height={300}
              className="max-h-64 w-auto rounded-lg border object-contain"
            />
          )}

          <div className="flex flex-col gap-3">
            {VARIANT_HARFLAR.map((harf) => {
              const tanlangan = tanlanganJavob === harf;
              const buTogriJavob = natija && natija.togriJavob === harf;
              return (
                <button
                  key={harf}
                  type="button"
                  onClick={() => harfTanlash(harf)}
                  disabled={Boolean(natija)}
                  className={cn(
                    "flex min-h-24 w-full items-center gap-4 rounded-2xl border-2 px-6 text-left text-xl font-medium transition-colors sm:text-2xl",
                    buTogriJavob && "border-green-600 bg-green-50",
                    tanlangan && !buTogriJavob && "border-destructive bg-destructive/10",
                    !tanlangan && !buTogriJavob && "border-border",
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 text-lg font-bold">
                    {harf}
                  </span>
                  {savol.variantlar[harf]}
                </button>
              );
            })}
          </div>

          {natija && (
            <div
              className={cn(
                "flex flex-col gap-2 rounded-2xl border-2 p-6",
                natija.togriMi ? "border-green-600 bg-green-50" : "border-destructive bg-destructive/5",
              )}
            >
              <p className="text-xl font-semibold">
                {natija.togriMi ? uz.talaba.organish.togri : uz.talaba.organish.notogri}
              </p>
              {!natija.togriMi && (
                <p className="text-lg">{uz.talaba.organish.togriJavobEdi(natija.togriJavob)}</p>
              )}
              {natija.izoh && <p className="text-lg text-muted-foreground">{natija.izoh}</p>}
              <button
                type="button"
                onClick={keyingiSavol}
                className="mt-2 min-h-16 w-fit rounded-xl bg-primary px-8 text-xl font-semibold text-primary-foreground active:opacity-80"
              >
                {uz.talaba.mashq.keyingiSavol}
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
