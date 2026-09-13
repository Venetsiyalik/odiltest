"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { royxatdanItemlar } from "@/lib/utils/select-items";
import { faylNomidanMetamalumotOlish } from "@/lib/ishreja/fayl-nomi";
import { ishrejaFayliniOqish, type IshrejaQatori } from "@/lib/ishreja/qatorlar";
import { fanniMoslashtirish } from "@/lib/ishreja/fan-moslashtirish";
import type { IshrejaAmali, IshrejaImportFayli, IshrejaImportNatijasi } from "@/lib/ishreja/types";

const YANGI_FAN_QIYMATI = "__yangi__";

interface FaylHolati {
  id: string;
  faylNomi: string;
  daraja: number | null;
  fanNomiXom: string | null;
  fanTanlovi: string; // fan id (string) yoki YANGI_FAN_QIYMATI
  yangiFanNomi: string;
  chorak: number | null;
  oquvYili: string | null;
  bsbBormi: boolean;
  qatorlar: IshrejaQatori[];
  oqishXatosi: string | null;
  amal: IshrejaAmali;
  mavjudSoni: number;
  ochiqmi: boolean;
}

function guruhKaliti(f: Pick<FaylHolati, "daraja" | "fanNomiXom" | "chorak" | "oquvYili">): string {
  return `${f.daraja ?? ""}|${(f.fanNomiXom ?? "").trim().toLowerCase()}|${f.chorak ?? ""}|${f.oquvYili ?? ""}`;
}

export function IshrejaImportClient({
  fanlar,
  sinflar,
  mavjudMavzular,
}: {
  fanlar: { id: number; nomi: string }[];
  sinflar: { id: number; nomi: string }[];
  mavjudMavzular: { fan_id: number; sinf_id: number; chorak: number | null; oquv_yili: string | null }[];
}) {
  const [variant, setVariant] = useState<"bsb" | "bsbsiz">("bsb");
  const [fayllar, setFayllar] = useState<FaylHolati[]>([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [tasdiqlanmoqda, setTasdiqlanmoqda] = useState(false);
  const [natija, setNatija] = useState<IshrejaImportNatijasi | null>(null);
  const [sudrashUstida, setSudrashUstida] = useState(false);

  const darajagaSinflar = useMemo(() => {
    const xarita = new Map<number, number>();
    for (const s of sinflar) {
      const daraja = s.nomi.match(/^(\d{1,2})/)?.[1];
      if (daraja) xarita.set(Number(daraja), (xarita.get(Number(daraja)) ?? 0) + 1);
    }
    return xarita;
  }, [sinflar]);

  function mavjudSoniniHisoblash(fanId: number | null, daraja: number | null, chorak: number | null, oquvYili: string | null): number {
    if (!fanId || !daraja) return 0;
    const mosSinfIdlari = new Set(
      sinflar.filter((s) => Number(s.nomi.match(/^(\d{1,2})/)?.[1]) === daraja).map((s) => s.id),
    );
    return mavjudMavzular.filter(
      (m) =>
        m.fan_id === fanId &&
        mosSinfIdlari.has(m.sinf_id) &&
        m.chorak === chorak &&
        (m.oquv_yili ?? null) === (oquvYili ?? null),
    ).length;
  }

  const fayllarniQoshish = useCallback(
    async (royxat: FileList | File[]) => {
      setYuklanmoqda(true);
      const yangiFayllar: FaylHolati[] = [];

      for (const fayl of Array.from(royxat)) {
        if (!fayl.name.toLowerCase().endsWith(".xlsx")) continue;

        const metama = faylNomidanMetamalumotOlish(fayl.name);
        let qatorlar: IshrejaQatori[] = [];
        let oqishXatosi: string | null = null;
        try {
          const buffer = await fayl.arrayBuffer();
          qatorlar = ishrejaFayliniOqish(buffer);
          if (qatorlar.length === 0) oqishXatosi = "faylda mavzu topilmadi";
        } catch {
          oqishXatosi = "faylni o'qib bo'lmadi";
        }

        const mosFan = metama.fanNomi ? fanniMoslashtirish(metama.fanNomi, fanlar) : null;
        const mavjudSoni = mavjudSoniniHisoblash(mosFan?.id ?? null, metama.daraja, metama.chorak, metama.oquvYili);

        yangiFayllar.push({
          id: `${fayl.name}-${Math.random().toString(36).slice(2)}`,
          faylNomi: fayl.name,
          daraja: metama.daraja,
          fanNomiXom: metama.fanNomi,
          fanTanlovi: mosFan ? String(mosFan.id) : YANGI_FAN_QIYMATI,
          yangiFanNomi: metama.fanNomi ?? "",
          chorak: metama.chorak,
          oquvYili: metama.oquvYili,
          bsbBormi: metama.bsbBormi,
          qatorlar,
          oqishXatosi,
          amal: mavjudSoni > 0 ? "otkazib-yuborish" : "yozish",
          mavjudSoni,
          ochiqmi: false,
        });
      }

      setFayllar((oldin) => [...oldin, ...yangiFayllar]);
      setYuklanmoqda(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fanlar, sinflar, mavjudMavzular],
  );

  const variantZidZiddiyatlari = useMemo(() => {
    const guruhlar = new Map<string, FaylHolati[]>();
    for (const f of fayllar) {
      const kalit = guruhKaliti(f);
      const royxat = guruhlar.get(kalit) ?? [];
      royxat.push(f);
      guruhlar.set(kalit, royxat);
    }
    const bekorQilinganlar = new Set<string>();
    for (const royxat of guruhlar.values()) {
      if (royxat.length < 2) continue;
      const bsbliFayllar = royxat.filter((f) => f.bsbBormi);
      const bsbsizFayllar = royxat.filter((f) => !f.bsbBormi);
      if (bsbliFayllar.length === 0 || bsbsizFayllar.length === 0) continue; // ikkalasi ham bir xil variant — ziddiyat emas
      const bekorlar = variant === "bsb" ? bsbsizFayllar : bsbliFayllar;
      for (const f of bekorlar) bekorQilinganlar.add(f.id);
    }
    return bekorQilinganlar;
  }, [fayllar, variant]);

  function faylniYangilash(id: string, ozgarish: Partial<FaylHolati>) {
    setFayllar((oldin) => oldin.map((f) => (f.id === id ? { ...f, ...ozgarish } : f)));
  }

  function faylniOchirish(id: string) {
    setFayllar((oldin) => oldin.filter((f) => f.id !== id));
  }

  async function tasdiqlashniBajarish() {
    setTasdiqlanmoqda(true);
    setNatija(null);

    const payload: IshrejaImportFayli[] = fayllar.map((f) => {
      const amal: IshrejaAmali = variantZidZiddiyatlari.has(f.id) ? "otkazib-yuborish" : f.amal;
      const fanId = f.fanTanlovi === YANGI_FAN_QIYMATI ? null : Number(f.fanTanlovi);
      return {
        faylNomi: f.faylNomi,
        daraja: f.daraja ?? 0,
        fanId,
        yangiFanNomi: fanId ? null : f.yangiFanNomi.trim() || null,
        chorak: f.chorak,
        oquvYili: f.oquvYili,
        amal,
        qatorlar: f.qatorlar,
      };
    });

    try {
      const javob = await fetch("/api/import/ishreja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fayllar: payload }),
      });
      const data: IshrejaImportNatijasi = await javob.json();
      setNatija(data);
    } catch {
      setNatija({ xato: "Tarmoq xatosi — qayta urinib ko'ring", fayllar: [], jamiMavzu: 0 });
    } finally {
      setTasdiqlanmoqda(false);
    }
  }

  const tasdiqlashMumkinmi =
    fayllar.length > 0 &&
    !yuklanmoqda &&
    fayllar.every((f) => !f.oqishXatosi) &&
    fayllar.every((f) => f.daraja && darajagaSinflar.has(f.daraja));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 rounded-md border p-4">
        <span className="text-sm font-medium">Ish reja varianti:</span>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={variant === "bsb"}
            onChange={() => setVariant("bsb")}
          />
          BSB/ChSB bilan
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={variant === "bsbsiz"}
            onChange={() => setVariant("bsbsiz")}
          />
          BSB&apos;siz
        </label>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSudrashUstida(true);
        }}
        onDragLeave={() => setSudrashUstida(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSudrashUstida(false);
          if (e.dataTransfer.files.length > 0) void fayllarniQoshish(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-10 text-center transition-colors ${
          sudrashUstida ? "border-primary bg-primary/5" : "border-muted-foreground/30"
        }`}
      >
        <p className="text-sm text-muted-foreground">
          .xlsx fayllarni shu yerga sudrab tashlang (bir vaqtda 100 tagacha)
        </p>
        <label className="cursor-pointer text-sm font-medium text-primary underline">
          yoki fayl tanlang
          <input
            type="file"
            accept=".xlsx"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) void fayllarniQoshish(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {yuklanmoqda && <p className="text-sm text-muted-foreground">Fayllar o&apos;qilmoqda...</p>}

      {fayllar.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Ko&apos;rib chiqish ({fayllar.length} fayl)</h2>
            <Button variant="outline" size="sm" onClick={() => setFayllar([])}>
              Ro&apos;yxatni tozalash
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {fayllar.map((f) => {
              const zidmi = variantZidZiddiyatlari.has(f.id);
              const holatBelgisi = f.oqishXatosi
                ? "❌"
                : zidmi
                  ? "🔁"
                  : !f.daraja || !darajagaSinflar.has(f.daraja)
                    ? "❌"
                    : f.mavjudSoni > 0
                      ? "⚠️"
                      : "✅";

              return (
                <div key={f.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg">{holatBelgisi}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium" title={f.faylNomi}>
                      {f.faylNomi}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {f.daraja ? `${f.daraja}-sinf` : "sinf?"} · {f.chorak ? `${f.chorak}-chorak` : "chorak?"} ·{" "}
                      {f.oquvYili ?? "yil?"} · {f.qatorlar.length} qator
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => faylniYangilash(f.id, { ochiqmi: !f.ochiqmi })}>
                      {f.ochiqmi ? "Yopish" : "Ko'rish"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => faylniOchirish(f.id)}>
                      O&apos;chirish
                    </Button>
                  </div>

                  {f.oqishXatosi && (
                    <p className="mt-2 text-sm text-destructive">{f.oqishXatosi}</p>
                  )}
                  {!f.daraja && (
                    <p className="mt-2 text-sm text-destructive">
                      Sinf darajasi fayl nomidan aniqlanmadi
                    </p>
                  )}
                  {f.daraja && !darajagaSinflar.has(f.daraja) && (
                    <p className="mt-2 text-sm text-destructive">
                      {f.daraja}-sinf uchun bazada sinf-guruh topilmadi
                    </p>
                  )}
                  {zidmi && (
                    <p className="mt-2 text-sm text-amber-600">
                      Bir xil sinf+fan+chorak uchun boshqa variant (
                      {variant === "bsb" ? "BSB/ChSB bilan" : "BSB'siz"}) tanlandi — bu fayl
                      o&apos;tkazib yuboriladi.
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <Select
                      value={f.fanTanlovi}
                      onValueChange={(v) => faylniYangilash(f.id, { fanTanlovi: v ?? YANGI_FAN_QIYMATI })}
                      items={royxatdanItemlar(fanlar, { [YANGI_FAN_QIYMATI]: "— Yangi fan —" })}
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Fan tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={YANGI_FAN_QIYMATI}>— Yangi fan —</SelectItem>
                        {fanlar.map((fan) => (
                          <SelectItem key={fan.id} value={String(fan.id)}>
                            {fan.nomi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {f.fanTanlovi === YANGI_FAN_QIYMATI && (
                      <input
                        value={f.yangiFanNomi}
                        onChange={(e) => faylniYangilash(f.id, { yangiFanNomi: e.target.value })}
                        placeholder="Yangi fan nomi"
                        className="rounded-md border px-2 py-1 text-sm"
                      />
                    )}

                    {f.mavjudSoni > 0 && !zidmi && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-amber-600">Bazada allaqachon {f.mavjudSoni} ta mavzu bor.</span>
                        <Button
                          size="sm"
                          variant={f.amal === "almashtirish" ? "default" : "outline"}
                          onClick={() => faylniYangilash(f.id, { amal: "almashtirish" })}
                        >
                          Almashtirish
                        </Button>
                        <Button
                          size="sm"
                          variant={f.amal === "otkazib-yuborish" ? "default" : "outline"}
                          onClick={() => faylniYangilash(f.id, { amal: "otkazib-yuborish" })}
                        >
                          O&apos;tkazib yuborish
                        </Button>
                      </div>
                    )}
                  </div>

                  {f.ochiqmi && (
                    <ul className="mt-3 flex flex-col gap-1 border-t pt-2 text-sm">
                      {f.qatorlar.map((q, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-muted-foreground">{q.tartib}.</span>
                          <span>{q.nomi}</span>
                          {q.turi !== "mavzu" && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{q.turi}</span>
                          )}
                          {q.ball != null && (
                            <span className="text-xs text-muted-foreground">[{q.ball} ball]</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          <Button onClick={tasdiqlashniBajarish} disabled={!tasdiqlashMumkinmi || tasdiqlanmoqda}>
            {tasdiqlanmoqda ? "Yozilmoqda..." : "Tasdiqlash va bazaga yozish"}
          </Button>
        </div>
      )}

      {natija && (
        <div className="rounded-md border p-4">
          {natija.xato ? (
            <p className="text-destructive">{natija.xato}</p>
          ) : (
            <>
              <p className="font-semibold">
                Natija: {natija.fayllar.filter((f) => f.holati === "muvaffaqiyatli").length} fayl ·{" "}
                {natija.jamiMavzu} mavzu qo&apos;shildi ·{" "}
                {natija.fayllar.filter((f) => f.holati === "otkazib-yuborildi").length} fayl o&apos;tkazib
                yuborildi ·{" "}
                {natija.fayllar.filter((f) => f.holati === "xato").length} xato
              </p>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {natija.fayllar
                  .filter((f) => f.holati === "xato")
                  .map((f) => (
                    <li key={f.faylNomi} className="text-destructive">
                      {f.faylNomi}: {f.xabar}
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
