"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { theme } from "@/lib/theme";
import { tovushChal } from "@/lib/redizayn/tovush";
import { variantTartibiniYaratish, type Variant } from "@/lib/talaba/aralashtirish";
import { smartTestSessiyasiniYozish, type SmartTestSavoli, type SmartTestVariant } from "@/lib/actions/smart-test";
import { SmartTestVariantlari } from "@/components/admin/smart-test-variantlar";
import { Sherbek } from "@/components/ui/Sherbek";
import { Tugma } from "@/components/redizayn/tugma";
import { TovushTugmasi } from "@/components/redizayn/tovush-tugmasi";
import type { SmartTestSessiyaMalumoti } from "@/components/admin/smart-test-sozlash";
import { SMART_TEST_SESSIYA_KALITI } from "@/components/admin/smart-test-sozlash";

type Bosqich = "savol" | "ochilgan" | "tushuntirish";

interface KorsatilganSavol extends SmartTestSavoli {
  korsatilganVariantlar: { A: string; B: string; C: string; D: string };
  korsatilganTogriJavob: SmartTestVariant;
}

function variantMatni(s: SmartTestSavoli, harf: SmartTestVariant): string {
  return { A: s.variantA, B: s.variantB, C: s.variantC, D: s.variantD }[harf];
}

function vaqtFormat(soniya: number): string {
  const daqiqa = Math.floor(soniya / 60);
  const qoldiq = soniya % 60;
  return `${String(daqiqa).padStart(2, "0")}:${String(qoldiq).padStart(2, "0")}`;
}

export function SmartTestSessiya() {
  const router = useRouter();
  const konteynerRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const [sessiya, setSessiya] = useState<SmartTestSessiyaMalumoti | null>(null);
  const [yuklanmadi, setYuklanmadi] = useState(false);
  const [joriyIndeks, setJoriyIndeks] = useState(0);
  const [bosqichlar, setBosqichlar] = useState<Record<number, Bosqich>>({});
  const [sinfTanlovlari, setSinfTanlovlari] = useState<Record<number, SmartTestVariant | null>>({});
  const [vaqtQoldi, setVaqtQoldi] = useState<number | null>(null);
  const [pauzada, setPauzada] = useState(false);
  const [chiqishTasdiqKerak, setChiqishTasdiqKerak] = useState(false);
  const [tugadi, setTugadi] = useState(false);
  const yozildiRef = useRef(false);

  useEffect(() => {
    try {
      const xom = window.sessionStorage.getItem(SMART_TEST_SESSIYA_KALITI);
      if (!xom) {
        setYuklanmadi(true);
        return;
      }
      setSessiya(JSON.parse(xom) as SmartTestSessiyaMalumoti);
    } catch {
      setYuklanmadi(true);
    }
  }, []);

  useEffect(() => {
    if (yuklanmadi) router.replace("/smart-test");
  }, [yuklanmadi, router]);

  // Variant ko'rsatilish tartibi sessiya yuklanganda bir marta hisoblanadi
  // (smart-test.md 4.1-bo'lim) — har xil sessiyada boshqa tartibda chiqadi,
  // lekin bitta sessiya ichida barqaror qoladi.
  const savollar = useMemo<KorsatilganSavol[]>(() => {
    if (!sessiya) return [];
    return sessiya.savollar.map((s) => {
      const xarita = variantTartibiniYaratish(true);
      const korsatilganVariantlar = {
        A: variantMatni(s, xarita.A as SmartTestVariant),
        B: variantMatni(s, xarita.B as SmartTestVariant),
        C: variantMatni(s, xarita.C as SmartTestVariant),
        D: variantMatni(s, xarita.D as SmartTestVariant),
      };
      const korsatilganTogriJavob = (Object.keys(xarita) as Variant[]).find(
        (korsatilgan) => xarita[korsatilgan] === s.togriJavob,
      ) as SmartTestVariant;
      return { ...s, korsatilganVariantlar, korsatilganTogriJavob };
    });
  }, [sessiya]);

  const joriy = savollar[joriyIndeks] as KorsatilganSavol | undefined;
  const bosqich: Bosqich = bosqichlar[joriyIndeks] ?? "savol";

  const sessiyaniYozish = useCallback(() => {
    if (!sessiya || yozildiRef.current) return;
    yozildiRef.current = true;
    void smartTestSessiyasiniYozish(
      sessiya.fanId,
      sessiya.daraja,
      sessiya.mavzuIdlar,
      sessiya.savollar.length,
      sessiya.vaqtRejimi,
      sessiya.boshlandiIso,
    ).catch(() => {
      // faqat statistika — xato bo'lsa ham sessiyani to'xtatmaydi
    });
  }, [sessiya]);

  const yakunlash = useCallback(() => {
    sessiyaniYozish();
    setTugadi(true);
    try {
      window.sessionStorage.removeItem(SMART_TEST_SESSIYA_KALITI);
    } catch {
      // e'tiborsiz qoldiriladi
    }
  }, [sessiyaniYozish]);

  const keyingiSavol = useCallback(() => {
    if (joriyIndeks + 1 >= savollar.length) {
      yakunlash();
    } else {
      setJoriyIndeks((indeks) => indeks + 1);
    }
  }, [joriyIndeks, savollar.length, yakunlash]);

  const oldingiSavol = useCallback(() => {
    setJoriyIndeks((indeks) => Math.max(0, indeks - 1));
  }, []);

  const keyingiBosqich = useCallback(() => {
    if (!joriy) return;
    if (bosqich === "savol") {
      setBosqichlar((oldin) => ({ ...oldin, [joriyIndeks]: "ochilgan" }));
      tovushChal("togri");
      return;
    }
    if (bosqich === "ochilgan") {
      if (joriy.izoh) {
        setBosqichlar((oldin) => ({ ...oldin, [joriyIndeks]: "tushuntirish" }));
      } else {
        keyingiSavol();
      }
      return;
    }
    keyingiSavol();
  }, [bosqich, joriy, joriyIndeks, keyingiSavol]);

  const sinfTanlovBelgilash = useCallback(
    (harf: SmartTestVariant) => {
      if (bosqich !== "savol") return;
      setSinfTanlovlari((oldin) => ({ ...oldin, [joriyIndeks]: harf }));
    },
    [bosqich, joriyIndeks],
  );

  // Vaqt rejimi: har yangi savolda taymer qayta boshlanadi (4.2-bo'lim).
  useEffect(() => {
    if (!sessiya?.vaqtRejimi) {
      setVaqtQoldi(null);
      return;
    }
    setVaqtQoldi(sessiya.vaqtSoniya);
    setPauzada(false);
  }, [joriyIndeks, sessiya]);

  useEffect(() => {
    if (vaqtQoldi === null || pauzada || bosqich !== "savol" || vaqtQoldi <= 0) return;
    const vaqt = setTimeout(() => {
      setVaqtQoldi((oldin) => {
        const yangi = (oldin ?? 1) - 1;
        if (yangi > 0 && yangi <= 5) tovushChal("taymer");
        return yangi;
      });
    }, 1000);
    return () => clearTimeout(vaqt);
  }, [vaqtQoldi, pauzada, bosqich]);

  // Klaviatura boshqaruvi (6-bo'lim).
  useEffect(() => {
    function bosildi(hodisa: KeyboardEvent) {
      if (tugadi) return;
      if (chiqishTasdiqKerak) {
        if (hodisa.key === "Escape") setChiqishTasdiqKerak(false);
        return;
      }
      if (hodisa.key === " " || hodisa.key === "Enter") {
        hodisa.preventDefault();
        keyingiBosqich();
      } else if (hodisa.key === "ArrowRight") {
        keyingiSavol();
      } else if (hodisa.key === "ArrowLeft") {
        oldingiSavol();
      } else if (hodisa.key === "p" || hodisa.key === "P") {
        setPauzada((p) => !p);
      } else if (hodisa.key === "Escape") {
        setChiqishTasdiqKerak(true);
      } else if (["1", "2", "3", "4"].includes(hodisa.key)) {
        const harflar: SmartTestVariant[] = ["A", "B", "C", "D"];
        sinfTanlovBelgilash(harflar[Number(hodisa.key) - 1]);
      }
    }
    window.addEventListener("keydown", bosildi);
    return () => window.removeEventListener("keydown", bosildi);
  }, [tugadi, chiqishTasdiqKerak, keyingiBosqich, keyingiSavol, oldingiSavol, sinfTanlovBelgilash]);

  // Wake Lock — ekran uxlamasin (10-bo'lim).
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;
    async function yoqish() {
      try {
        sentinel = await navigator.wakeLock?.request("screen");
        wakeLockRef.current = sentinel;
      } catch {
        // qo'llab-quvvatlanmasa yoki ruxsat berilmasa — jim o'tkaziladi
      }
    }
    void yoqish();

    function qaytaYoqish() {
      if (document.visibilityState === "visible" && !wakeLockRef.current) void yoqish();
    }
    document.addEventListener("visibilitychange", qaytaYoqish);

    return () => {
      document.removeEventListener("visibilitychange", qaytaYoqish);
      sentinel?.release().catch(() => {});
    };
  }, []);

  // To'liq ekran — sahifa ochilganda darhol (3-bo'lim).
  useEffect(() => {
    void konteynerRef.current?.requestFullscreen?.().catch(() => {});
    return () => {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    };
  }, []);

  if (yuklanmadi) return null;

  if (!sessiya || !joriy) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: theme.smartTest.bg, color: "white" }}
      >
        Yuklanmoqda...
      </div>
    );
  }

  if (tugadi) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center"
        style={{ background: theme.smartTest.bg, color: "white" }}
      >
        <Sherbek holat="zor" size="xl" />
        <h1 className="text-[32px] font-extrabold">Sessiya yakunlandi</h1>
        <p className="text-xl opacity-80">
          {savollar.length} savol ko&apos;rib chiqildi · {sessiya.fanNomi} · {sessiya.daraja}-sinf
        </p>
        <div className="flex gap-4">
          <Tugma rang="accent" onClick={() => router.push("/smart-test")}>
            Yangi sessiya
          </Tugma>
          <Tugma rang="outline" onClick={() => router.push("/dashboard")}>
            Dashboardga
          </Tugma>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={konteynerRef}
      className="flex min-h-screen flex-col"
      style={{ background: theme.smartTest.bg, color: "white", fontFamily: "var(--font-nunito), sans-serif" }}
    >
      <header className="flex items-center justify-between gap-4 px-8 py-4">
        <div className="flex items-center gap-3 text-lg font-semibold opacity-90">
          <span>
            {sessiya.fanNomi} · {sessiya.daraja}-sinf
          </span>
          <TovushTugmasi />
        </div>
        <div className="flex items-center gap-4">
          {vaqtQoldi !== null && (
            <button
              type="button"
              onClick={() => setPauzada((p) => !p)}
              className="rounded-lg px-3 py-1 text-xl font-bold"
              style={{
                background: vaqtQoldi <= 5 ? theme.colors.danger : "rgba(255,255,255,0.12)",
              }}
              title="Pauza (P)"
            >
              {pauzada ? "⏸" : "⏱"} {vaqtFormat(Math.max(0, vaqtQoldi))}
            </button>
          )}
          <span className="text-lg font-semibold">
            {joriyIndeks + 1} / {savollar.length}
          </span>
          <button
            type="button"
            onClick={() => setChiqishTasdiqKerak(true)}
            className="rounded-lg px-3 py-2 text-xl active:bg-white/20"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="h-2 w-full bg-white/10">
        <div
          className="h-full transition-all"
          style={{
            width: `${((joriyIndeks + 1) / savollar.length) * 100}%`,
            background: theme.colors.accent,
          }}
        />
      </div>

      {bosqich === "tushuntirish" ? (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 p-8">
          <h2 className="text-[32px] font-extrabold sm:text-[36px]">
            💡 Nega &quot;{joriy.korsatilganVariantlar[joriy.korsatilganTogriJavob]}&quot; to&apos;g&apos;ri?
          </h2>
          <p className="max-w-[60ch] whitespace-pre-line text-[24px] leading-relaxed sm:text-[28px]">
            {joriy.izoh}
          </p>
          {joriy.izohRasmUrl && (
            <Image
              src={joriy.izohRasmUrl}
              alt=""
              width={480}
              height={320}
              unoptimized
              className="max-h-64 w-auto rounded-2xl object-contain"
            />
          )}
          {joriy.izohQisqa && (
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
              <Sherbek holat="maslahat" size="md" />
              <p className="text-xl">
                <strong>Eslab qoling:</strong> {joriy.izohQisqa}
              </p>
            </div>
          )}
          <div className="flex justify-between pt-4">
            <Tugma
              rang="outline"
              onClick={() =>
                setBosqichlar((oldin) => ({ ...oldin, [joriyIndeks]: "ochilgan" }))
              }
            >
              ← Savolga qaytish
            </Tugma>
            <Tugma rang="success" onClick={keyingiSavol}>
              Keyingi savol →
            </Tugma>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-8 p-8">
          <h2 className="text-center text-[40px] font-extrabold leading-tight sm:text-[56px]">
            {joriy.matn}
          </h2>
          {joriy.rasmUrl && (
            <Image
              src={joriy.rasmUrl}
              alt=""
              width={480}
              height={320}
              unoptimized
              className="mx-auto max-h-64 w-auto rounded-2xl object-contain"
            />
          )}
          <SmartTestVariantlari
            variantlar={joriy.korsatilganVariantlar}
            togriJavob={joriy.korsatilganTogriJavob}
            ochilganmi={bosqich === "ochilgan"}
            sinfTanlovi={sinfTanlovlari[joriyIndeks] ?? null}
            onSinfTanlovi={bosqich === "savol" ? sinfTanlovBelgilash : undefined}
          />
          <div className="flex justify-center pt-2">
            {bosqich === "savol" ? (
              <Tugma rang="accent" hajm="katta" onClick={keyingiBosqich}>
                ✓ TO&apos;G&apos;RI JAVOBNI KO&apos;RSATISH
              </Tugma>
            ) : joriy.izoh ? (
              <Tugma rang="accent" hajm="katta" onClick={keyingiBosqich}>
                💡 NEGA SHUNDAY?
              </Tugma>
            ) : (
              <Tugma rang="success" hajm="katta" onClick={keyingiSavol}>
                Keyingi savol →
              </Tugma>
            )}
          </div>
        </div>
      )}

      {chiqishTasdiqKerak && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8">
          <div
            className="flex max-w-sm flex-col gap-4 rounded-2xl p-6 text-center"
            style={{ background: theme.colors.surface, color: theme.colors.text }}
          >
            <p className="text-xl font-semibold">Sessiyani tugatamizmi?</p>
            <div className="flex justify-center gap-3">
              <Tugma rang="outline" onClick={() => setChiqishTasdiqKerak(false)}>
                Davom etish
              </Tugma>
              <Tugma rang="danger" onClick={yakunlash}>
                Tugatish
              </Tugma>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
