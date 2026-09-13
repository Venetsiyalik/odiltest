"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { uz } from "@/lib/i18n/uz";
import type { UrinishDetali } from "@/lib/talaba/urinish-detali";
import type { Variant } from "@/lib/talaba/aralashtirish";
import { navbatgaQoshish, navbatniJonatish } from "@/lib/talaba/offline-navob";

const VARIANT_HARFLAR: Variant[] = ["A", "B", "C", "D"];

function vaqtniFormatlash(soniya: number): string {
  const daqiqa = Math.floor(soniya / 60);
  const qolganSoniya = soniya % 60;
  return `${String(daqiqa).padStart(2, "0")}:${String(qolganSoniya).padStart(2, "0")}`;
}

export function TestEkrani({ detali }: { detali: UrinishDetali }) {
  const router = useRouter();
  const [savollar, setSavollar] = useState(detali.savollar);
  const [joriyIndeks, setJoriyIndeks] = useState(0);
  const [yakunlashOchiq, setYakunlashOchiq] = useState(false);
  const [yakunlanmoqda, setYakunlanmoqda] = useState(false);
  const [oflaynMi, setOflaynMi] = useState(false);
  const yakunlanganRef = useRef(false);

  const tugashVaqti = useMemo(
    () => new Date(detali.boshlandi).getTime() + detali.vaqtDaqiqa * 60 * 1000,
    [detali.boshlandi, detali.vaqtDaqiqa],
  );
  const [qolganSoniya, setQolganSoniya] = useState(() =>
    Math.max(0, Math.round((tugashVaqti - Date.now()) / 1000)),
  );

  const joriySavol = savollar[joriyIndeks];

  const yakunlashniBajarish = useMemo(
    () => async () => {
      if (yakunlanganRef.current) return;
      yakunlanganRef.current = true;
      setYakunlanmoqda(true);
      try {
        await fetch("/api/urinish/yakunlash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urinishId: detali.id }),
        });
      } finally {
        router.refresh();
      }
    },
    [detali.id, router],
  );

  useEffect(() => {
    const oraliq = setInterval(() => {
      const qolgan = Math.max(0, Math.round((tugashVaqti - Date.now()) / 1000));
      setQolganSoniya(qolgan);
      if (qolgan <= 0) {
        clearInterval(oraliq);
        void yakunlashniBajarish();
      }
    }, 1000);
    return () => clearInterval(oraliq);
  }, [tugashVaqti, yakunlashniBajarish]);

  // Internet uzilib qolsa, javob localStorage navbatiga qo'yiladi va
  // ulanish tiklanganda jo'natiladi (texnik topshiriq 3.4-band).
  useEffect(() => {
    setOflaynMi(!navigator.onLine);
    void navbatniJonatish(detali.id);

    function ulandi() {
      setOflaynMi(false);
      void navbatniJonatish(detali.id);
    }
    function uzildi() {
      setOflaynMi(true);
    }

    window.addEventListener("online", ulandi);
    window.addEventListener("offline", uzildi);
    return () => {
      window.removeEventListener("online", ulandi);
      window.removeEventListener("offline", uzildi);
    };
  }, [detali.id]);

  async function javobSaqlash(
    savolId: number,
    harf: Variant | null | undefined,
    belgilangan?: boolean,
  ) {
    setSavollar((oldin) =>
      oldin.map((s) =>
        s.savolId === savolId
          ? {
              ...s,
              tanlanganJavob: harf !== undefined ? harf : s.tanlanganJavob,
              belgilangan: belgilangan !== undefined ? belgilangan : s.belgilangan,
            }
          : s,
      ),
    );

    const joriy = savollar.find((s) => s.savolId === savolId);
    const soralayotganJavob = {
      urinishId: detali.id,
      savolId,
      tanlanganJavob: harf !== undefined ? harf : (joriy?.tanlanganJavob ?? null),
      belgilangan: belgilangan !== undefined ? belgilangan : joriy?.belgilangan,
    };

    try {
      const javob = await fetch("/api/urinish/javob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(soralayotganJavob),
      }).then((r) => r.json());

      if (javob.vaqtTugadi) {
        router.refresh();
      }
    } catch {
      navbatgaQoshish(soralayotganJavob);
      setOflaynMi(true);
    }
  }

  function harfTanlash(harf: Variant) {
    void javobSaqlash(joriySavol.savolId, harf);
  }

  function belgilashniAlmashtirish() {
    void javobSaqlash(joriySavol.savolId, undefined, !joriySavol.belgilangan);
  }

  const javobBerilganSoni = savollar.filter((s) => s.tanlanganJavob).length;
  const vaqtOzQoldi = qolganSoniya <= 120;

  return (
    <main className="flex min-h-screen flex-col gap-4 p-4 sm:p-6">
      <header className="flex flex-col gap-2">
        {oflaynMi && (
          <div className="rounded-lg bg-amber-100 px-4 py-2 text-center text-lg font-medium text-amber-900">
            {uz.talaba.test.oflaynXabari}
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold sm:text-2xl">
            {uz.talaba.test.savolRaqami(joriyIndeks + 1, savollar.length)}
          </span>
          <span
            className={cn(
              "text-2xl font-bold tabular-nums sm:text-3xl",
              vaqtOzQoldi && "text-destructive",
            )}
          >
            {vaqtniFormatlash(qolganSoniya)}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((joriyIndeks + 1) / savollar.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {savollar.map((s, indeks) => (
          <button
            key={s.savolId}
            type="button"
            onClick={() => setJoriyIndeks(indeks)}
            className={cn(
              "flex size-10 items-center justify-center rounded-lg border-2 text-sm font-semibold sm:size-11",
              indeks === joriyIndeks && "border-primary",
              s.belgilangan && "border-amber-500 bg-amber-100 text-amber-900",
              s.tanlanganJavob && !s.belgilangan && "border-primary bg-primary/10",
              !s.tanlanganJavob && !s.belgilangan && indeks !== joriyIndeks && "border-border",
            )}
          >
            {indeks + 1}
          </button>
        ))}
      </div>

      <section className="flex flex-1 flex-col gap-6 py-4">
        <p className="text-2xl font-medium sm:text-3xl">{joriySavol.matn}</p>

        {joriySavol.rasmUrl && (
          <Image
            src={joriySavol.rasmUrl}
            alt=""
            width={500}
            height={300}
            className="max-h-64 w-auto rounded-lg border object-contain"
          />
        )}

        <div className="flex flex-col gap-3">
          {VARIANT_HARFLAR.map((harf) => {
            const tanlangan = joriySavol.tanlanganJavob === harf;
            return (
              <button
                key={harf}
                type="button"
                onClick={() => harfTanlash(harf)}
                className={cn(
                  "flex min-h-24 w-full items-center gap-4 rounded-2xl border-2 px-6 text-left text-xl font-medium transition-colors sm:text-2xl",
                  tanlangan
                    ? "border-primary bg-primary/10"
                    : "border-border active:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full border-2 text-lg font-bold",
                    tanlangan && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {tanlangan ? "✓" : harf}
                </span>
                {joriySavol.variantlar[harf]}
              </button>
            );
          })}
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setJoriyIndeks((i) => Math.max(0, i - 1))}
            disabled={joriyIndeks === 0}
            className="min-h-16 rounded-xl border-2 border-border px-6 text-xl font-medium active:bg-muted disabled:opacity-40"
          >
            {uz.umumiy.orqaga}
          </button>
          <button
            type="button"
            onClick={belgilashniAlmashtirish}
            className={cn(
              "min-h-16 rounded-xl border-2 px-6 text-xl font-medium active:bg-muted",
              joriySavol.belgilangan ? "border-amber-500 bg-amber-100 text-amber-900" : "border-border",
            )}
          >
            ◆ {uz.talaba.test.belgilash}
          </button>
          <button
            type="button"
            onClick={() => setJoriyIndeks((i) => Math.min(savollar.length - 1, i + 1))}
            disabled={joriyIndeks === savollar.length - 1}
            className="min-h-16 rounded-xl border-2 border-border px-6 text-xl font-medium active:bg-muted disabled:opacity-40"
          >
            {uz.umumiy.keyingi}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setYakunlashOchiq(true)}
          className="min-h-16 rounded-xl bg-primary px-8 text-xl font-semibold text-primary-foreground active:opacity-80"
        >
          {uz.talaba.test.yakunlash} ({javobBerilganSoni}/{savollar.length})
        </button>
      </footer>

      {yakunlashOchiq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="flex max-w-md flex-col gap-6 rounded-2xl bg-background p-8 text-center shadow-xl">
            <p className="text-xl font-medium">{uz.talaba.test.yakunlashTasdiq}</p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void yakunlashniBajarish()}
                disabled={yakunlanmoqda}
                className="min-h-16 rounded-xl bg-primary text-xl font-semibold text-primary-foreground active:opacity-80 disabled:opacity-50"
              >
                {yakunlanmoqda ? uz.umumiy.yuklanmoqda : uz.talaba.test.yakunlash}
              </button>
              <button
                type="button"
                onClick={() => setYakunlashOchiq(false)}
                disabled={yakunlanmoqda}
                className="min-h-16 rounded-xl border-2 border-border text-xl font-medium active:bg-muted"
              >
                {uz.umumiy.orqaga}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
