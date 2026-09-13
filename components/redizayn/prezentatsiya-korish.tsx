"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from "pdfjs-dist";
import { prezentatsiyaHolatiniElonQilish } from "@/lib/redizayn/prezentatsiya-holati";
import { useMatnlar } from "@/components/student/matnlar-provideri";
import { theme } from "@/lib/theme";

/**
 * Smart ekran prezentatsiya ko'ruvchi (REDIZAYN.md 4-bo'lim).
 *
 * Texnik qaror: PDF **klient tomonda** `pdfjs-dist` bilan render qilinadi
 * (4.2-band "asosiy yo'l"), server tomonda hech qanday konvertatsiya
 * qilinmaydi — bu Vercel serverless muhitida LibreOffice/ImageMagick kabi
 * native bog'liqliklarsiz ishonchli ishlaydigan yagona yo'l. Server
 * tomonda PDF'ni oldindan WebP'ga aylantirish ("Optimizatsiya" band) —
 * ataylab keyingi bosqichga qoldirilgan (hozircha shart emas).
 */

type QalamRangi = "qizil" | "kok" | "sariq";

const QALAM_HEX: Record<QalamRangi, string> = {
  qizil: theme.colors.danger,
  kok: "#4A7BF7",
  sariq: theme.colors.accent,
};

const PANEL_YASHIRISH_MS = 3000;
const OLDINDAN_YUKLASH_SONI = 2;
const MAKS_KENGLIK = 1920;
const KICHIK_RASM_KENGLIGI = 160;

export function PrezentatsiyaKorish({
  faylUrl,
  sarlavha,
  onChiqish,
}: {
  faylUrl: string;
  sarlavha: string;
  onChiqish: () => void;
}) {
  const { matnlar } = useMatnlar();
  const konteynerRef = useRef<HTMLDivElement>(null);
  const slaydCanvasRef = useRef<HTMLCanvasElement>(null);
  const doskaCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const bitmapKeshiRef = useRef<Map<number, ImageBitmap>>(new Map());
  const kichikRasmKeshiRef = useRef<Map<number, ImageBitmap>>(new Map());
  const chizilmoqdaRef = useRef(false);
  const panelTaymeriRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const teginishBoshlanishiRef = useRef<{ x: number; y: number } | null>(null);

  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState<string | null>(null);
  const [joriySahifa, setJoriySahifa] = useState(1);
  const [jamiSahifa, setJamiSahifa] = useState(0);
  const [panelKorinadi, setPanelKorinadi] = useState(true);
  const [gridOchiq, setGridOchiq] = useState(false);
  const [doskaOchiq, setDoskaOchiq] = useState(false);
  const [doskaRangi, setDoskaRangi] = useState<QalamRangi>("qizil");

  const sahifaBitmapiniOl = useCallback(async (raqam: number): Promise<ImageBitmap | null> => {
    const keshlangan = bitmapKeshiRef.current.get(raqam);
    if (keshlangan) return keshlangan;
    const pdf = pdfRef.current;
    if (!pdf || raqam < 1 || raqam > pdf.numPages) return null;

    const sahifa = await pdf.getPage(raqam);
    const asliyViewport = sahifa.getViewport({ scale: 1 });
    const skeyl = Math.min(MAKS_KENGLIK / asliyViewport.width, 2);
    const viewport = sahifa.getViewport({ scale: skeyl });

    const vaqtinchaCanvas = document.createElement("canvas");
    vaqtinchaCanvas.width = viewport.width;
    vaqtinchaCanvas.height = viewport.height;

    await sahifa.render({ canvas: vaqtinchaCanvas, viewport }).promise;
    const bitmap = await createImageBitmap(vaqtinchaCanvas);
    bitmapKeshiRef.current.set(raqam, bitmap);
    return bitmap;
  }, []);

  const kichikRasmniOl = useCallback(async (raqam: number): Promise<ImageBitmap | null> => {
    const keshlangan = kichikRasmKeshiRef.current.get(raqam);
    if (keshlangan) return keshlangan;
    const pdf = pdfRef.current;
    if (!pdf || raqam < 1 || raqam > pdf.numPages) return null;

    const sahifa = await pdf.getPage(raqam);
    const asliyViewport = sahifa.getViewport({ scale: 1 });
    const skeyl = KICHIK_RASM_KENGLIGI / asliyViewport.width;
    const viewport = sahifa.getViewport({ scale: skeyl });

    const vaqtinchaCanvas = document.createElement("canvas");
    vaqtinchaCanvas.width = viewport.width;
    vaqtinchaCanvas.height = viewport.height;

    await sahifa.render({ canvas: vaqtinchaCanvas, viewport }).promise;
    const bitmap = await createImageBitmap(vaqtinchaCanvas);
    kichikRasmKeshiRef.current.set(raqam, bitmap);
    return bitmap;
  }, []);

  const sahifaniChizish = useCallback(
    async (raqam: number) => {
      const bitmap = await sahifaBitmapiniOl(raqam);
      const canvas = slaydCanvasRef.current;
      const konteyner = konteynerRef.current;
      if (!bitmap || !canvas || !konteyner) return;

      const kengKonteyner = konteyner.clientWidth;
      const balandKonteyner = konteyner.clientHeight;
      const nisbat = Math.min(kengKonteyner / bitmap.width, balandKonteyner / bitmap.height);

      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.style.width = `${bitmap.width * nisbat}px`;
      canvas.style.height = `${bitmap.height * nisbat}px`;

      const doska = doskaCanvasRef.current;
      if (doska) {
        doska.width = bitmap.width;
        doska.height = bitmap.height;
        doska.style.width = `${bitmap.width * nisbat}px`;
        doska.style.height = `${bitmap.height * nisbat}px`;
        doska.getContext("2d")?.clearRect(0, 0, doska.width, doska.height);
      }

      const kontekst = canvas.getContext("2d");
      kontekst?.drawImage(bitmap, 0, 0);
    },
    [sahifaBitmapiniOl],
  );

  // PDF'ni yuklash
  useEffect(() => {
    let bekorQilindi = false;
    let yuklashVazifasi: PDFDocumentLoadingTask | null = null;

    async function yuklash() {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf/pdf.worker.min.mjs";
        yuklashVazifasi = pdfjsLib.getDocument({ url: faylUrl });
        const hujjat = await yuklashVazifasi.promise;
        if (bekorQilindi) return;
        pdfRef.current = hujjat;
        setJamiSahifa(hujjat.numPages);
        setYuklanmoqda(false);
      } catch {
        if (!bekorQilindi) setXato(matnlar.talaba.prezentatsiya.yuklabBolmadi);
      }
    }

    void yuklash();
    return () => {
      bekorQilindi = true;
      void yuklashVazifasi?.destroy();
    };
  }, [faylUrl, matnlar]);

  // Joriy sahifani chizish + keyingi 2 tasini fonda oldindan yuklash
  useEffect(() => {
    if (yuklanmoqda) return;
    void sahifaniChizish(joriySahifa);
    for (let i = 1; i <= OLDINDAN_YUKLASH_SONI; i++) {
      void sahifaBitmapiniOl(joriySahifa + i);
    }
  }, [joriySahifa, yuklanmoqda, sahifaniChizish, sahifaBitmapiniOl]);

  // Konteyner o'lchami o'zgarsa qayta chizish
  useEffect(() => {
    function qaytaChizish() {
      void sahifaniChizish(joriySahifa);
    }
    window.addEventListener("resize", qaytaChizish);
    return () => window.removeEventListener("resize", qaytaChizish);
  }, [joriySahifa, sahifaniChizish]);

  // Wake Lock — ekran uxlab qolmasligi uchun (4.1-band)
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

  // Kiosk avto-chiqish taymerini to'xtatish (REDIZAYN.md 4.1-band)
  useEffect(() => {
    prezentatsiyaHolatiniElonQilish(true);
    return () => prezentatsiyaHolatiniElonQilish(false);
  }, []);

  const keyingiSahifa = useCallback(() => {
    setJoriySahifa((s) => Math.min(jamiSahifa, s + 1));
  }, [jamiSahifa]);

  const oldingiSahifa = useCallback(() => {
    setJoriySahifa((s) => Math.max(1, s - 1));
  }, []);

  // Klaviatura
  useEffect(() => {
    function bosildi(hodisa: KeyboardEvent) {
      if (hodisa.key === "ArrowRight" || hodisa.key === " ") keyingiSahifa();
      else if (hodisa.key === "ArrowLeft") oldingiSahifa();
      else if (hodisa.key === "Escape") onChiqish();
      else if (hodisa.key === "f" || hodisa.key === "F") toliqEkranAlmashtirish();
    }
    window.addEventListener("keydown", bosildi);
    return () => window.removeEventListener("keydown", bosildi);
  }, [keyingiSahifa, oldingiSahifa, onChiqish]);

  function panelniKorsatish() {
    setPanelKorinadi(true);
    if (panelTaymeriRef.current) clearTimeout(panelTaymeriRef.current);
    panelTaymeriRef.current = setTimeout(() => setPanelKorinadi(false), PANEL_YASHIRISH_MS);
  }

  useEffect(() => {
    panelniKorsatish();
    return () => {
      if (panelTaymeriRef.current) clearTimeout(panelTaymeriRef.current);
    };
  }, []);

  function toliqEkranAlmashtirish() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void konteynerRef.current?.requestFullscreen();
    }
  }

  function bosishZonasi(hodisa: React.MouseEvent) {
    if (doskaOchiq) return;
    panelniKorsatish();
    const kenglik = hodisa.currentTarget.clientWidth;
    const x = hodisa.nativeEvent.offsetX;
    if (x < kenglik * 0.15) oldingiSahifa();
    else if (x > kenglik * 0.85) keyingiSahifa();
  }

  function teginishBoshlandi(hodisa: React.TouchEvent) {
    panelniKorsatish();
    const teginish = hodisa.touches[0];
    teginishBoshlanishiRef.current = { x: teginish.clientX, y: teginish.clientY };
  }

  function teginishTugadi(hodisa: React.TouchEvent) {
    const boshlanish = teginishBoshlanishiRef.current;
    if (!boshlanish || doskaOchiq) return;
    const teginish = hodisa.changedTouches[0];
    const dx = teginish.clientX - boshlanish.x;
    const dy = teginish.clientY - boshlanish.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) keyingiSahifa();
      else oldingiSahifa();
    }
    teginishBoshlanishiRef.current = null;
  }

  // --- Doska (chizish) ---
  function doskaKoordinatasi(hodisa: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = hodisa.currentTarget;
    const chegara = canvas.getBoundingClientRect();
    const kengMasshtab = canvas.width / chegara.width;
    const balandMasshtab = canvas.height / chegara.height;
    return {
      x: (hodisa.clientX - chegara.left) * kengMasshtab,
      y: (hodisa.clientY - chegara.top) * balandMasshtab,
    };
  }

  function chizishBoshlash(hodisa: React.PointerEvent<HTMLCanvasElement>) {
    if (!doskaOchiq) return;
    chizilmoqdaRef.current = true;
    const kontekst = hodisa.currentTarget.getContext("2d");
    if (!kontekst) return;
    const { x, y } = doskaKoordinatasi(hodisa);
    kontekst.strokeStyle = QALAM_HEX[doskaRangi];
    kontekst.lineWidth = 6;
    kontekst.lineCap = "round";
    kontekst.beginPath();
    kontekst.moveTo(x, y);
  }

  function chizish(hodisa: React.PointerEvent<HTMLCanvasElement>) {
    if (!doskaOchiq || !chizilmoqdaRef.current) return;
    const kontekst = hodisa.currentTarget.getContext("2d");
    if (!kontekst) return;
    const { x, y } = doskaKoordinatasi(hodisa);
    kontekst.lineTo(x, y);
    kontekst.stroke();
  }

  function chizishTugatish() {
    chizilmoqdaRef.current = false;
  }

  function doskaniTozalash() {
    const doska = doskaCanvasRef.current;
    doska?.getContext("2d")?.clearRect(0, 0, doska.width, doska.height);
  }

  return (
    <div
      ref={konteynerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black"
      onMouseMove={panelniKorsatish}
      onClick={bosishZonasi}
      onTouchStart={teginishBoshlandi}
      onTouchEnd={teginishTugadi}
    >
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {yuklanmoqda && <p className="text-xl text-white">{matnlar.umumiy.yuklanmoqda}</p>}
        {xato && <p className="text-xl text-white">{xato}</p>}
        <canvas ref={slaydCanvasRef} className="pointer-events-none" />
        <canvas
          ref={doskaCanvasRef}
          className="pointer-events-auto absolute"
          style={{ display: doskaOchiq ? "block" : "none", touchAction: "none" }}
          onPointerDown={chizishBoshlash}
          onPointerMove={chizish}
          onPointerUp={chizishTugatish}
          onPointerLeave={chizishTugatish}
        />
      </div>

      {gridOchiq && (
        <SlaydlarPaneli
          jamiSahifa={jamiSahifa}
          joriySahifa={joriySahifa}
          kichikRasmniOl={kichikRasmniOl}
          tanlash={(raqam) => {
            setJoriySahifa(raqam);
            setGridOchiq(false);
          }}
          yopish={() => setGridOchiq(false)}
        />
      )}

      {panelKorinadi && !gridOchiq && (
        <div
          className="flex items-center justify-between gap-3 bg-black/70 px-4 py-3 text-white"
          onClick={(hodisa) => hodisa.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setGridOchiq(true)} className="rounded-lg px-3 py-2 text-xl active:bg-white/20">
              ⊞
            </button>
            <span className="text-lg font-semibold tabular-nums">
              {joriySahifa} / {jamiSahifa}
            </span>
          </div>

          <p className="hidden truncate text-sm text-white/70 sm:block">{sarlavha}</p>

          <div className="flex items-center gap-2">
            {doskaOchiq && (
              <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
                {(Object.keys(QALAM_HEX) as QalamRangi[]).map((rang) => (
                  <button
                    key={rang}
                    type="button"
                    onClick={() => setDoskaRangi(rang)}
                    className="size-8 rounded-full border-2"
                    style={{
                      background: QALAM_HEX[rang],
                      borderColor: doskaRangi === rang ? "white" : "transparent",
                    }}
                    aria-label={rang}
                  />
                ))}
                <button type="button" onClick={doskaniTozalash} className="px-2 text-sm active:opacity-70">
                  Tozalash
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setDoskaOchiq((v) => !v)}
              className="rounded-lg px-3 py-2 text-xl active:bg-white/20"
              style={{ color: doskaOchiq ? theme.colors.accent : "white" }}
              aria-label={matnlar.talaba.prezentatsiya.doska}
            >
              👁
            </button>
            <button type="button" onClick={toliqEkranAlmashtirish} className="rounded-lg px-3 py-2 text-xl active:bg-white/20">
              ⛶
            </button>
            <button type="button" onClick={onChiqish} className="rounded-lg px-3 py-2 text-xl active:bg-white/20">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SlaydlarPaneli({
  jamiSahifa,
  joriySahifa,
  kichikRasmniOl,
  tanlash,
  yopish,
}: {
  jamiSahifa: number;
  joriySahifa: number;
  kichikRasmniOl: (raqam: number) => Promise<ImageBitmap | null>;
  tanlash: (raqam: number) => void;
  yopish: () => void;
}) {
  const { matnlar } = useMatnlar();
  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-black/95 p-4" onClick={(h) => h.stopPropagation()}>
      <div className="flex items-center justify-between pb-3">
        <p className="text-lg font-semibold text-white">{matnlar.talaba.prezentatsiya.barchaSlaydlar}</p>
        <button type="button" onClick={yopish} className="rounded-lg px-3 py-2 text-xl text-white active:bg-white/20">
          ✕
        </button>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4 md:grid-cols-6">
        {Array.from({ length: jamiSahifa }, (_, i) => i + 1).map((raqam) => (
          <SlaydKichikRasmi
            key={raqam}
            raqam={raqam}
            faolmi={raqam === joriySahifa}
            olish={kichikRasmniOl}
            onClick={() => tanlash(raqam)}
          />
        ))}
      </div>
    </div>
  );
}

function SlaydKichikRasmi({
  raqam,
  faolmi,
  olish,
  onClick,
}: {
  raqam: number;
  faolmi: boolean;
  olish: (raqam: number) => Promise<ImageBitmap | null>;
  onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let bekorQilindi = false;
    void olish(raqam).then((bitmap) => {
      if (bekorQilindi || !bitmap || !canvasRef.current) return;
      canvasRef.current.width = bitmap.width;
      canvasRef.current.height = bitmap.height;
      canvasRef.current.getContext("2d")?.drawImage(bitmap, 0, 0);
    });
    return () => {
      bekorQilindi = true;
    };
  }, [raqam, olish]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-lg border-2 p-1"
      style={{ borderColor: faolmi ? theme.colors.accent : "transparent" }}
    >
      <canvas ref={canvasRef} className="w-full rounded" />
      <span className="text-sm text-white/70">{raqam}</span>
    </button>
  );
}
