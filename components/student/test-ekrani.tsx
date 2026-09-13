"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { uz } from "@/lib/i18n/uz";
import type { UrinishDetali } from "@/lib/talaba/urinish-detali";
import type { Variant } from "@/lib/talaba/aralashtirish";
import { navbatgaQoshish, navbatniJonatish } from "@/lib/talaba/offline-navob";
import { TabriklashModali } from "@/components/redizayn/tabriklash-modali";
import { nishonMalumotiniOl } from "@/lib/redizayn/nishonlar-royxati";
import { theme } from "@/lib/theme";
import { Karta } from "@/components/redizayn/karta";
import { Tugma } from "@/components/redizayn/tugma";
import { ProgressChizigi } from "@/components/redizayn/progress-chizigi";
import { VariantTugmalari } from "@/components/redizayn/variant-tugmalari";

/**
 * Rasmiy test ekrani (REDIZAYN.md 5.6-band — "⛔ Rasmiy testda
 * gamifikatsiya YO'Q"): Kahoot rangli variant tugmalari saqlanadi
 * (o'qish/tanib olishni osonlashtiradi), LEKIN personaj, animatsiya,
 * tovush, XP va konfetti — bittasi ham ko'rsatilmaydi. Sokin, jiddiy,
 * oq-ko'k interfeys — baholashning ishonchliligi shu talab qiladi.
 * Tabrik modali (daraja/nishon) faqat YAKUNLANGANDAN keyin, natija
 * ekraniga o'tishdan oldin bir martalik ko'rinishda chiqadi.
 */

interface XpJavobi {
  darajaOshdimi?: boolean;
  yangiDaraja?: number;
  yangiNishonlar?: string[];
}

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
  const [tabriklash, setTabriklash] = useState<XpJavobi | null>(null);
  const yakunlanganRef = useRef(false);

  const tugashVaqti = useMemo(
    () => new Date(detali.boshlandi).getTime() + detali.vaqtDaqiqa * 60 * 1000,
    [detali.boshlandi, detali.vaqtDaqiqa],
  );
  const [qolganSoniya, setQolganSoniya] = useState(() =>
    Math.max(0, Math.round((tugashVaqti - Date.now()) / 1000)),
  );

  const joriySavol = savollar[joriyIndeks];

  function tabriklashniKorsatishYokiYangilash(xpMalumot: XpJavobi | undefined) {
    if (xpMalumot && (xpMalumot.darajaOshdimi || (xpMalumot.yangiNishonlar?.length ?? 0) > 0)) {
      setTabriklash(xpMalumot);
    } else {
      router.refresh();
    }
  }

  const yakunlashniBajarish = useMemo(
    () => async () => {
      if (yakunlanganRef.current) return;
      yakunlanganRef.current = true;
      setYakunlanmoqda(true);
      try {
        const natija: XpJavobi = await fetch("/api/urinish/yakunlash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urinishId: detali.id }),
        }).then((r) => r.json());
        tabriklashniKorsatishYokiYangilash(natija);
      } catch {
        router.refresh();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        tabriklashniKorsatishYokiYangilash(javob.natija as XpJavobi | undefined);
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
    <main
      className="min-h-screen"
      style={{ background: theme.colors.surface, color: theme.colors.text, fontFamily: "var(--font-nunito), sans-serif" }}
    >
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-4 sm:p-6">
        <header className="flex flex-col gap-2">
          {oflaynMi && (
            <div
              className="p-3 text-center text-[18px] font-semibold"
              style={{ background: `${theme.colors.warning}22`, color: theme.colors.warning, borderRadius: theme.radius.md }}
            >
              {uz.talaba.test.oflaynXabari}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[20px] font-bold sm:text-[24px]" style={{ color: theme.colors.primary }}>
              {uz.talaba.test.savolRaqami(joriyIndeks + 1, savollar.length)}
            </span>
            <span
              className="text-[24px] font-extrabold tabular-nums sm:text-[28px]"
              style={{ color: vaqtOzQoldi ? theme.colors.danger : theme.colors.primary }}
            >
              {vaqtniFormatlash(qolganSoniya)}
            </span>
          </div>
          <ProgressChizigi foiz={((joriyIndeks + 1) / savollar.length) * 100} rang={theme.colors.primary} />
        </header>

        <div className="flex flex-wrap gap-2">
          {savollar.map((s, indeks) => {
            const faolmi = indeks === joriyIndeks;
            const rang = s.belgilangan ? theme.colors.warning : s.tanlanganJavob ? theme.colors.primary : theme.colors.muted;
            return (
              <button
                key={s.savolId}
                type="button"
                onClick={() => setJoriyIndeks(indeks)}
                className="flex size-10 items-center justify-center text-sm font-bold sm:size-11"
                style={{
                  borderRadius: theme.radius.sm,
                  border: `2px solid ${faolmi ? theme.colors.primary : `${rang}55`}`,
                  background: s.belgilangan ? `${theme.colors.warning}22` : s.tanlanganJavob ? `${theme.colors.primary}15` : "transparent",
                  color: s.belgilangan ? theme.colors.warning : theme.colors.text,
                }}
              >
                {indeks + 1}
              </button>
            );
          })}
        </div>

        <section className="flex flex-1 flex-col gap-6 py-4">
          <p className="text-[24px] font-semibold sm:text-[28px]">{joriySavol.matn}</p>

          {joriySavol.rasmUrl && (
            <Image
              src={joriySavol.rasmUrl}
              alt=""
              width={500}
              height={300}
              className="max-h-64 w-auto object-contain"
              style={{ borderRadius: theme.radius.md, border: `1px solid ${theme.colors.muted}33` }}
            />
          )}

          <VariantTugmalari
            variantlar={joriySavol.variantlar}
            tanlanganJavob={joriySavol.tanlanganJavob}
            togriJavob={null}
            onTanlash={harfTanlash}
            ochilganmi={false}
          />
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: `${theme.colors.muted}33` }}>
          <div className="flex gap-2">
            <Tugma
              rang="outline"
              hajm="kichik"
              onClick={() => setJoriyIndeks((i) => Math.max(0, i - 1))}
              disabled={joriyIndeks === 0}
            >
              {uz.umumiy.orqaga}
            </Tugma>
            <button
              type="button"
              onClick={belgilashniAlmashtirish}
              className="min-h-[48px] px-4 text-[16px] font-bold"
              style={{
                borderRadius: theme.radius.lg,
                border: `2px solid ${joriySavol.belgilangan ? theme.colors.warning : `${theme.colors.muted}44`}`,
                background: joriySavol.belgilangan ? `${theme.colors.warning}22` : "transparent",
                color: joriySavol.belgilangan ? theme.colors.warning : theme.colors.text,
              }}
            >
              ◆ {uz.talaba.test.belgilash}
            </button>
            <Tugma
              rang="outline"
              hajm="kichik"
              onClick={() => setJoriyIndeks((i) => Math.min(savollar.length - 1, i + 1))}
              disabled={joriyIndeks === savollar.length - 1}
            >
              {uz.umumiy.keyingi}
            </Tugma>
          </div>

          <Tugma rang="primary" onClick={() => setYakunlashOchiq(true)}>
            {uz.talaba.test.yakunlash} ({javobBerilganSoni}/{savollar.length})
          </Tugma>
        </footer>

        {yakunlashOchiq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
            <Karta className="flex max-w-md flex-col gap-6 text-center">
              <p className="text-[20px] font-semibold">{uz.talaba.test.yakunlashTasdiq}</p>
              <div className="flex flex-col gap-3">
                <Tugma rang="primary" onClick={() => void yakunlashniBajarish()} disabled={yakunlanmoqda}>
                  {yakunlanmoqda ? uz.umumiy.yuklanmoqda : uz.talaba.test.yakunlash}
                </Tugma>
                <Tugma rang="outline" onClick={() => setYakunlashOchiq(false)} disabled={yakunlanmoqda}>
                  {uz.umumiy.orqaga}
                </Tugma>
              </div>
            </Karta>
          </div>
        )}

        {tabriklash && (
          <TabriklashModali
            malumot={{
              darajaOshdimi: tabriklash.darajaOshdimi,
              yangiDaraja: tabriklash.yangiDaraja,
              yangiNishonlar: (tabriklash.yangiNishonlar ?? []).map((kod) => nishonMalumotiniOl(kod)),
            }}
            yopish={() => router.refresh()}
          />
        )}
      </div>
    </main>
  );
}
