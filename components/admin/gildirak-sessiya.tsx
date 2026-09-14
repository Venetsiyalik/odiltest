"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { theme } from "@/lib/theme";
import { tovushChal } from "@/lib/redizayn/tovush";
import type { Variant } from "@/lib/talaba/aralashtirish";
import {
  gildirakNatijasiniYozish,
  gildirakYordamTopshirigiYaratish,
  gildirakYakuniniOl,
  gildirakBahoniOzgartirish,
  gildirakSessiyaniYakunlash,
  gildirakSessiyaniBekorYopish,
  type GildirakSavoli,
  type GildirakYakunSatri,
} from "@/lib/actions/gildirak";
import { GildirakWheel, type GildirakOquvchisi } from "@/components/admin/gildirak-wheel";
import { GildirakRaqamlar } from "@/components/admin/gildirak-raqamlar";
import { GildirakVariantPanjarasi } from "@/components/admin/gildirak-variant-panjarasi";
import { Sherbek } from "@/components/ui/Sherbek";
import { Tugma } from "@/components/redizayn/tugma";
import { TovushTugmasi } from "@/components/redizayn/tovush-tugmasi";
import { Konfetti } from "@/components/redizayn/konfetti";
import { Input } from "@/components/ui/input";
import {
  GILDIRAK_SESSIYA_KALITI,
  type GildirakRaqamMalumoti,
  type GildirakSessiyaMalumoti,
} from "@/components/admin/gildirak-sozlash";

type Bosqich = "gildirak" | "raqamlar" | "savol" | "omadli" | "togri" | "xato" | "yakun";

function variantniAralashtir(savol: GildirakSavoli): {
  variantlar: { A: string; B: string; C: string; D: string };
  xarita: Record<Variant, Variant>;
  korsatilganTogriJavob: Variant;
} {
  const asl: Variant[] = ["A", "B", "C", "D"];
  const aralash = [...asl];
  for (let i = aralash.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [aralash[i], aralash[j]] = [aralash[j], aralash[i]];
  }
  const xarita = {} as Record<Variant, Variant>;
  asl.forEach((korsatilgan, indeks) => {
    xarita[korsatilgan] = aralash[indeks];
  });
  const matn: Record<Variant, string> = {
    A: savol.variantA,
    B: savol.variantB,
    C: savol.variantC,
    D: savol.variantD,
  };
  // `xarita` ko'rsatilgan->asl yo'nalishida — to'g'ri javob QAYSI
  // ko'rsatilgan pozitsiyada turganini topish uchun teskari qidiruv kerak,
  // aks holda asl harfni ko'rsatilgan harf sifatida noto'g'ri talqin qilib
  // qo'yish mumkin edi (xuddi tanlangan javobni tekshirishdagi bug kabi).
  const korsatilganTogriJavob = asl.find((k) => xarita[k] === savol.togriJavob)!;
  return {
    variantlar: { A: matn[xarita.A], B: matn[xarita.B], C: matn[xarita.C], D: matn[xarita.D] },
    xarita,
    korsatilganTogriJavob,
  };
}

function yordamMatniniTuzish(savol: GildirakSavoli): string {
  if (savol.uygaVazifa) return savol.uygaVazifa;
  const mavzu = savol.mavzuNomi ? `"${savol.mavzuNomi}" mavzusini` : "shu mavzuni";
  return `${mavzu} darslik orqali qayta ko'rib chiqing va platformada mashq qiling.`;
}

export function GildirakSessiya() {
  const router = useRouter();
  const konteynerRef = useRef<HTMLDivElement>(null);

  const [sessiya, setSessiya] = useState<GildirakSessiyaMalumoti | null>(null);
  const [yuklanmadi, setYuklanmadi] = useState(false);
  const [bosqich, setBosqich] = useState<Bosqich>("gildirak");

  const [chiqqanIdlar, setChiqqanIdlar] = useState<Set<number>>(new Set());
  const [olinganRaqamlar, setOlinganRaqamlar] = useState<Set<number>>(new Set());
  const [joriyOquvchi, setJoriyOquvchi] = useState<GildirakOquvchisi | null>(null);
  const [gildirakOverlay, setGildirakOverlay] = useState(false);
  const [joriyRaqam, setJoriyRaqam] = useState<GildirakRaqamMalumoti | null>(null);
  const [tanlanganJavob, setTanlanganJavob] = useState<Variant | null>(null);
  const [ochilganmi, setOchilganmi] = useState(false);
  const [topshiriqId, setTopshiriqId] = useState<number | null>(null);
  const [chiqishTasdiqKerak, setChiqishTasdiqKerak] = useState(false);
  const [natijalarSoni, setNatijalarSoni] = useState({ jami: 0, togri: 0, yordam: 0 });

  const [yakunMalumoti, setYakunMalumoti] = useState<GildirakYakunSatri[] | null>(null);
  const [yakunlanmoqda, setYakunlanmoqda] = useState(false);

  const variantHolati = useRef<{
    variantlar: { A: string; B: string; C: string; D: string };
    xarita: Record<Variant, Variant>;
    korsatilganTogriJavob: Variant;
  } | null>(null);

  useEffect(() => {
    try {
      const xom = window.sessionStorage.getItem(GILDIRAK_SESSIYA_KALITI);
      if (!xom) {
        setYuklanmadi(true);
        return;
      }
      setSessiya(JSON.parse(xom) as GildirakSessiyaMalumoti);
    } catch {
      setYuklanmadi(true);
    }
  }, []);

  useEffect(() => {
    if (yuklanmadi) router.replace("/gildirak");
  }, [yuklanmadi, router]);

  useEffect(() => {
    void konteynerRef.current?.requestFullscreen?.().catch(() => {});
    return () => {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    };
  }, []);

  const qatnashuvchilar = useMemo<GildirakOquvchisi[]>(
    () => sessiya?.qatnashuvchilar ?? [],
    [sessiya],
  );

  function wheelTanlandi(oquvchi: GildirakOquvchisi) {
    setChiqqanIdlar((oldin) => new Set(oldin).add(oquvchi.id));
    setJoriyOquvchi(oquvchi);
    setGildirakOverlay(true);
  }

  function qaytaAylantirish() {
    if (joriyOquvchi) {
      setChiqqanIdlar((oldin) => {
        const yangi = new Set(oldin);
        yangi.delete(joriyOquvchi.id);
        return yangi;
      });
    }
    setJoriyOquvchi(null);
    setGildirakOverlay(false);
  }

  function doskagaChiqish() {
    setGildirakOverlay(false);
    setBosqich("raqamlar");
  }

  function raqamTanlandi(raqam: number) {
    const malumot = sessiya?.raqamlar.find((r) => r.raqam === raqam) ?? null;
    setOlinganRaqamlar((oldin) => new Set(oldin).add(raqam));
    setJoriyRaqam(malumot);
    if (!malumot || malumot.omadlimi || !malumot.savol) {
      setBosqich("omadli");
      return;
    }
    variantHolati.current = variantniAralashtir(malumot.savol);
    setTanlanganJavob(null);
    setOchilganmi(false);
    setBosqich("savol");
  }

  const yakunFunksiyasi = useCallback(async () => {
    if (!sessiya) return;
    setYakunlanmoqda(true);
    try {
      if (sessiya.bahoRejimi === "tasdiqlash") {
        const natija = await gildirakYakuniniOl(sessiya.sessiyaId);
        setYakunMalumoti(natija.baholar);
      } else {
        await gildirakSessiyaniBekorYopish(sessiya.sessiyaId);
      }
    } finally {
      setYakunlanmoqda(false);
      try {
        window.sessionStorage.removeItem(GILDIRAK_SESSIYA_KALITI);
      } catch {
        // e'tiborsiz qoldiriladi
      }
      setBosqich("yakun");
    }
  }, [sessiya]);

  async function natijaniYozish(togri: boolean) {
    if (!sessiya || !joriyOquvchi) return;
    setNatijalarSoni((oldin) => ({
      jami: oldin.jami + 1,
      togri: oldin.togri + (togri ? 1 : 0),
      yordam: oldin.yordam + (togri ? 0 : 1),
    }));
    await gildirakNatijasiniYozish(
      sessiya.sessiyaId,
      joriyOquvchi.id,
      joriyRaqam?.savol?.id ?? null,
      joriyRaqam?.raqam ?? 0,
      togri,
    ).catch(() => {});
  }

  async function variantTanlandi(harf: Variant) {
    if (ochilganmi || !joriyRaqam?.savol || !variantHolati.current) return;
    setTanlanganJavob(harf);
    setOchilganmi(true);
    // `harf` — bosilgan KO'RSATILGAN pozitsiya, `togriJavob` esa ASL harf
    // (aralashtirishdan oldingi) — solishtirishdan oldin `xarita` orqali
    // asl harfga o'girish shart, aks holda aralashtirilgan savollarda
    // to'g'ri javob xato deb hisoblanib qolishi mumkin edi.
    const asliHarf = variantHolati.current.xarita[harf];
    const togri = asliHarf === joriyRaqam.savol.togriJavob;
    tovushChal(togri ? "togri" : "xato");

    setTimeout(async () => {
      await natijaniYozish(togri);
      if (togri) {
        setBosqich("togri");
      } else {
        const matn = yordamMatniniTuzish(joriyRaqam.savol!);
        const natija = await gildirakYordamTopshirigiYaratish(
          joriyOquvchi!.id,
          joriyRaqam.savol!.mavzuId,
          matn,
        );
        setTopshiriqId(natija.topshiriqId ?? null);
        setBosqich("xato");
      }
    }, 1200);
  }

  function omadliDavomEttirish() {
    void natijaniYozish(true);
    setBosqich("togri");
  }

  function savolniOtkazibYuborish() {
    setJoriyOquvchi(null);
    setJoriyRaqam(null);
    setTanlanganJavob(null);
    setOchilganmi(false);
    setBosqich("gildirak");
  }

  function keyingiRaundgaOtish() {
    setJoriyOquvchi(null);
    setJoriyRaqam(null);
    setTanlanganJavob(null);
    setOchilganmi(false);
    setTopshiriqId(null);
    setBosqich("gildirak");
  }

  useEffect(() => {
    function bosildi(hodisa: KeyboardEvent) {
      if (chiqishTasdiqKerak || bosqich === "yakun") return;
      if (hodisa.key === "Escape") {
        setChiqishTasdiqKerak(true);
        return;
      }
      if (hodisa.key === " " || hodisa.key === "Enter") {
        hodisa.preventDefault();
        if (bosqich === "togri" || bosqich === "xato") keyingiRaundgaOtish();
        else if (bosqich === "gildirak" && gildirakOverlay) doskagaChiqish();
      } else if ((hodisa.key === "r" || hodisa.key === "R") && bosqich === "gildirak" && gildirakOverlay) {
        qaytaAylantirish();
      } else if ((hodisa.key === "s" || hodisa.key === "S") && bosqich === "savol") {
        savolniOtkazibYuborish();
      }
    }
    window.addEventListener("keydown", bosildi);
    return () => window.removeEventListener("keydown", bosildi);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bosqich, gildirakOverlay, chiqishTasdiqKerak, joriyOquvchi]);

  if (yuklanmadi) return null;
  if (!sessiya) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: theme.smartTest.bg, color: "white" }}>
        Yuklanmoqda...
      </div>
    );
  }

  if (bosqich === "yakun") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center" style={{ background: theme.smartTest.bg, color: "white" }}>
        <Sherbek holat="zor" size="xl" />
        <h1 className="text-[32px] font-extrabold">Sessiya yakunlandi</h1>
        <p className="text-xl opacity-80">
          {natijalarSoni.jami} o&apos;quvchi javob berdi · {natijalarSoni.togri} to&apos;g&apos;ri ·{" "}
          {natijalarSoni.yordam} yordam topshirig&apos;i
        </p>

        {yakunMalumoti && yakunMalumoti.length > 0 && (
          <div className="flex w-full max-w-md flex-col gap-2 rounded-2xl bg-white/10 p-4 text-left">
            {yakunMalumoti.map((s) => (
              <div key={s.natijaId} className="flex items-center justify-between gap-2">
                <span>{s.oquvchiIsmi}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={2}
                    max={5}
                    defaultValue={s.baho ?? ""}
                    className="h-9 w-16 text-black"
                    onBlur={(e) => {
                      const qiymat = e.target.value ? Number(e.target.value) : null;
                      void gildirakBahoniOzgartirish(s.natijaId, qiymat);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4">
          {sessiya.bahoRejimi === "tasdiqlash" && yakunMalumoti && (
            <Tugma
              rang="success"
              onClick={async () => {
                await gildirakSessiyaniYakunlash(sessiya.sessiyaId);
                router.push("/dashboard");
              }}
            >
              Jurnalga yozish
            </Tugma>
          )}
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
      style={{
        background: bosqich === "xato" ? theme.smartTest.bg : theme.smartTest.bg,
        color: "white",
        fontFamily: "var(--font-nunito), sans-serif",
      }}
    >
      <header className="flex items-center justify-between gap-4 px-8 py-4">
        <div className="flex items-center gap-3 text-lg font-semibold opacity-90">
          <span>
            {sessiya.sinfNomi} · {sessiya.fanNomi}
          </span>
          <TovushTugmasi />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-70">
            Bugun chiqqanlar: {chiqqanIdlar.size}/{qatnashuvchilar.length}
          </span>
          <button type="button" onClick={() => setChiqishTasdiqKerak(true)} className="rounded-lg px-3 py-2 text-xl active:bg-white/20">
            ✕
          </button>
        </div>
      </header>

      {bosqich === "gildirak" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
          {qatnashuvchilar.length - chiqqanIdlar.size === 0 && !gildirakOverlay ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <Sherbek holat="zor" size="xl" />
              <p className="text-2xl font-bold">Hamma chiqdi! Yangi doira boshlaymizmi?</p>
              <Tugma rang="accent" onClick={() => setChiqqanIdlar(new Set())}>
                Yangi doira boshlash
              </Tugma>
            </div>
          ) : gildirakOverlay && joriyOquvchi ? (
            <div className="flex flex-col items-center gap-6 text-center">
              <Konfetti />
              <p className="text-[72px] font-extrabold leading-none">{joriyOquvchi.ismFamiliya}</p>
              <div className="flex gap-4">
                <Tugma rang="outline" onClick={qaytaAylantirish}>
                  Qayta aylantirish
                </Tugma>
                <Tugma rang="success" onClick={doskagaChiqish}>
                  Doskaga chiq!
                </Tugma>
              </div>
            </div>
          ) : (
            <GildirakWheel
              oquvchilar={qatnashuvchilar}
              chiqqanIdlar={chiqqanIdlar}
              onTanlandi={wheelTanlandi}
            />
          )}
        </div>
      )}

      {bosqich === "raqamlar" && joriyOquvchi && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
          <h2 className="text-[32px] font-extrabold">{joriyOquvchi.ismFamiliya}, raqam tanla!</h2>
          <GildirakRaqamlar
            jami={sessiya.raqamlar.length}
            olinganlar={olinganRaqamlar}
            onTanlash={raqamTanlandi}
          />
        </div>
      )}

      {bosqich === "savol" && joriyRaqam?.savol && variantHolati.current && (
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-8 p-8">
          <h2 className="text-center text-[36px] font-extrabold leading-tight sm:text-[48px]">
            {joriyRaqam.savol.matn}
          </h2>
          {joriyRaqam.savol.rasmUrl && (
            <Image
              src={joriyRaqam.savol.rasmUrl}
              alt=""
              width={480}
              height={320}
              unoptimized
              className="mx-auto max-h-64 w-auto rounded-2xl object-contain"
            />
          )}
          <GildirakVariantPanjarasi
            variantlar={variantHolati.current.variantlar}
            togriJavob={ochilganmi ? variantHolati.current.korsatilganTogriJavob : null}
            tanlanganJavob={tanlanganJavob}
            ochilganmi={ochilganmi}
            onTanlash={variantTanlandi}
          />
          {!ochilganmi && (
            <div className="flex justify-center">
              <button type="button" onClick={savolniOtkazibYuborish} className="text-sm underline opacity-70">
                O&apos;tkazib yuborish
              </button>
            </div>
          )}
        </div>
      )}

      {bosqich === "omadli" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
          <Konfetti />
          <Sherbek holat="zor" size="xl" />
          <h2 className="text-[40px] font-extrabold">🎁 Omading keldi!</h2>
          <p className="text-2xl">5 baho tayyor</p>
          <Tugma rang="success" hajm="katta" onClick={omadliDavomEttirish}>
            Davom etish
          </Tugma>
        </div>
      )}

      {bosqich === "togri" && joriyOquvchi && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center" style={{ background: `linear-gradient(180deg, ${theme.colors.success}33, transparent)` }}>
          <Konfetti />
          <h2 className="text-[40px] font-extrabold">🎉 BARAKALLA, {joriyOquvchi.ismFamiliya.toUpperCase()}! 🎉</h2>
          <Sherbek holat="kubok" animatsiya="sakrash" size="xl" />
          <p className="text-[56px] font-extrabold" style={{ color: theme.colors.accent }}>
            ⭐ 5 ⭐
          </p>
          {joriyRaqam?.savol?.izoh && (
            <p className="max-w-xl text-xl opacity-90">
              Javobing to&apos;g&apos;ri — {joriyRaqam.savol.izoh}
            </p>
          )}
          <Tugma rang="accent" hajm="katta" onClick={keyingiRaundgaOtish}>
            G&apos;ildirakka qaytish
          </Tugma>
        </div>
      )}

      {bosqich === "xato" && joriyOquvchi && joriyRaqam?.savol && (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 p-8 text-center">
          <h2 className="text-[32px] font-extrabold">Yaqin edi, {joriyOquvchi.ismFamiliya}!</h2>
          <p className="text-xl">
            To&apos;g&apos;ri javob:{" "}
            <strong>
              {
                { A: joriyRaqam.savol.variantA, B: joriyRaqam.savol.variantB, C: joriyRaqam.savol.variantC, D: joriyRaqam.savol.variantD }[
                  joriyRaqam.savol.togriJavob
                ]
              }
            </strong>
          </p>
          {joriyRaqam.savol.izoh && <p className="opacity-90">{joriyRaqam.savol.izoh}</p>}
          <div className="flex items-center justify-center gap-3">
            <Sherbek holat="maslahat" size="md" />
            <p>Bu mavzuni uyda birga mustahkamlaymiz</p>
          </div>
          <div className="mx-auto flex w-full flex-col gap-2 rounded-2xl bg-white/10 p-4 text-left">
            <p className="font-bold">YORDAM TOPSHIRIG&apos;I</p>
            <p className="text-sm opacity-80">Mavzu: {joriyRaqam.savol.mavzuNomi ?? "—"}</p>
            <p>{yordamMatniniTuzish(joriyRaqam.savol)}</p>
            {topshiriqId && (
              <a
                href={`/api/hisobot/pdf/uyga-vazifa?topshiriqId=${topshiriqId}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline"
              >
                Topshiriqni chop etish
              </a>
            )}
          </div>
          <Tugma rang="accent" hajm="katta" onClick={keyingiRaundgaOtish}>
            G&apos;ildirakka qaytish
          </Tugma>
        </div>
      )}

      {chiqishTasdiqKerak && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8">
          <div className="flex max-w-sm flex-col gap-4 rounded-2xl p-6 text-center" style={{ background: theme.colors.surface, color: theme.colors.text }}>
            <p className="text-xl font-semibold">Sessiyani tugatamizmi?</p>
            <div className="flex justify-center gap-3">
              <Tugma rang="outline" onClick={() => setChiqishTasdiqKerak(false)}>
                Davom etish
              </Tugma>
              <Tugma rang="danger" disabled={yakunlanmoqda} onClick={() => { setChiqishTasdiqKerak(false); void yakunFunksiyasi(); }}>
                Tugatish
              </Tugma>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
