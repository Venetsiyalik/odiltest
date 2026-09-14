"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";
import { DARAJALAR } from "@/lib/redizayn/daraja";
import { sinfDarajasi } from "@/lib/redizayn/daraja";
import { royxatniAralashtirish } from "@/lib/talaba/aralashtirish";
import { smartTestSavollariniOl, type SmartTestSavoli } from "@/lib/actions/smart-test";
import { Karta } from "@/components/redizayn/karta";
import { Tugma } from "@/components/redizayn/tugma";
import { Sherbek } from "@/components/ui/Sherbek";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Mavzu } from "@/lib/actions/spravochniklar";

interface Nomlangan {
  id: number;
  nomi: string;
}

const SOZLAMALAR_KALITI = "smart-test-sozlamalar";
export const SMART_TEST_SESSIYA_KALITI = "smart-test-sessiya";

type SavolSoniTanlovi = "10" | "15" | "20" | "hammasi";

interface Sozlamalar {
  fanId: string;
  daraja: string;
  mavzuIdlar: number[];
  savolSoni: SavolSoniTanlovi;
  vaqtRejimi: boolean;
  vaqtSoniya: string;
  tartib: "aralash" | "ketma-ket";
}

const BOSH_SOZLAMALAR: Sozlamalar = {
  fanId: "",
  daraja: "",
  mavzuIdlar: [],
  savolSoni: "10",
  vaqtRejimi: false,
  vaqtSoniya: "30",
  tartib: "aralash",
};

export interface SmartTestSessiyaMalumoti {
  fanNomi: string;
  daraja: number;
  fanId: number;
  mavzuIdlar: number[];
  vaqtRejimi: boolean;
  vaqtSoniya: number;
  savollar: SmartTestSavoli[];
  boshlandiIso: string;
}

export function SmartTestSozlash({
  fanlar,
  mavzular,
}: {
  fanlar: Nomlangan[];
  mavzular: Mavzu[];
}) {
  const router = useRouter();
  const [sozlama, setSozlama] = useState<Sozlamalar>(BOSH_SOZLAMALAR);
  const [savollarOldindanKorish, setSavollarOldindanKorish] = useState<SmartTestSavoli[] | null>(
    null,
  );
  const [qidirilmoqda, setQidirilmoqda] = useState(false);
  const [qidiruvXatosi, setQidiruvXatosi] = useState<string | null>(null);
  const [boshlanmoqda, setBoshlanmoqda] = useState(false);

  useEffect(() => {
    try {
      const xom = window.localStorage.getItem(SOZLAMALAR_KALITI);
      if (xom) setSozlama((oldin) => ({ ...oldin, ...JSON.parse(xom) }));
    } catch {
      // localStorage yo'q/bloklangan — standart sozlamalar bilan davom etiladi
    }
  }, []);

  const mosMavzular = useMemo(
    () =>
      mavzular.filter(
        (m) =>
          m.turi !== "baholash" &&
          String(m.fan_id) === sozlama.fanId &&
          String(sinfDarajasi(m.sinflar?.nomi ?? "")) === sozlama.daraja,
      ),
    [mavzular, sozlama.fanId, sozlama.daraja],
  );

  function sozlamaniYangilash<K extends keyof Sozlamalar>(kalit: K, qiymat: Sozlamalar[K]) {
    setSozlama((oldin) => ({ ...oldin, [kalit]: qiymat }));
  }

  // Fan/sinf/mavzu tanlovi o'zgarganda mavjud izohli savollarni oldindan
  // yuklab ko'radi (3-bo'lim: "Bu mavzuda izohli savol N ta" ogohlantirishi).
  useEffect(() => {
    if (!sozlama.fanId || !sozlama.daraja) {
      setSavollarOldindanKorish(null);
      setQidiruvXatosi(null);
      return;
    }

    let bekorQilindi = false;
    setQidirilmoqda(true);
    setQidiruvXatosi(null);

    const vaqtBelgisi = setTimeout(async () => {
      const natija = await smartTestSavollariniOl(
        Number(sozlama.fanId),
        Number(sozlama.daraja),
        sozlama.mavzuIdlar,
      );
      if (bekorQilindi) return;
      if (natija.xato) {
        setQidiruvXatosi(natija.xato);
        setSavollarOldindanKorish(null);
      } else {
        setSavollarOldindanKorish(natija.savollar ?? []);
      }
      setQidirilmoqda(false);
    }, 300);

    return () => {
      bekorQilindi = true;
      clearTimeout(vaqtBelgisi);
    };
  }, [sozlama.fanId, sozlama.daraja, sozlama.mavzuIdlar]);

  function mavzuBelgilash(mavzuId: number, tanlanganmi: boolean) {
    sozlamaniYangilash(
      "mavzuIdlar",
      tanlanganmi
        ? [...sozlama.mavzuIdlar, mavzuId]
        : sozlama.mavzuIdlar.filter((id) => id !== mavzuId),
    );
  }

  function boshlash() {
    if (!savollarOldindanKorish || savollarOldindanKorish.length === 0) return;

    const talabQilinganSoni =
      sozlama.savolSoni === "hammasi" ? savollarOldindanKorish.length : Number(sozlama.savolSoni);

    let tanlanganlar = [...savollarOldindanKorish];
    if (sozlama.tartib === "aralash") {
      tanlanganlar = royxatniAralashtirish(tanlanganlar);
    }
    tanlanganlar = tanlanganlar.slice(0, Math.min(talabQilinganSoni, tanlanganlar.length));

    const sessiya: SmartTestSessiyaMalumoti = {
      fanId: Number(sozlama.fanId),
      fanNomi: fanlar.find((f) => String(f.id) === sozlama.fanId)?.nomi ?? "",
      daraja: Number(sozlama.daraja),
      mavzuIdlar: sozlama.mavzuIdlar,
      vaqtRejimi: sozlama.vaqtRejimi,
      vaqtSoniya: Number(sozlama.vaqtSoniya) || 30,
      savollar: tanlanganlar,
      boshlandiIso: new Date().toISOString(),
    };

    try {
      window.sessionStorage.setItem(SMART_TEST_SESSIYA_KALITI, JSON.stringify(sessiya));
      window.localStorage.setItem(SOZLAMALAR_KALITI, JSON.stringify(sozlama));
    } catch {
      toast.error("Sessiyani saqlab bo'lmadi — brauzer xotirasi bloklangan bo'lishi mumkin");
      return;
    }

    setBoshlanmoqda(true);
    router.push("/smart-test/sessiya");
  }

  const mavjudSoni = savollarOldindanKorish?.length ?? 0;
  const talabQilinganSoni =
    sozlama.savolSoni === "hammasi" ? mavjudSoni : Number(sozlama.savolSoni);

  return (
    <main
      className="min-h-screen"
      style={{ background: theme.colors.bg, color: theme.colors.text }}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
        <div className="flex items-center gap-4">
          <Sherbek holat="oddiy" size="lg" />
          <div>
            <h1 className="text-[28px] font-extrabold" style={{ color: theme.colors.primary }}>
              ⚡ Smart Test
            </h1>
            <p style={{ color: theme.colors.muted }}>
              Sinf bilan birga yechamiz va har bir javobni tushunamiz
            </p>
          </div>
        </div>

        <Karta className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label>Fan</Label>
              <select
                className="h-11 rounded-lg border px-3"
                value={sozlama.fanId}
                onChange={(e) => {
                  sozlamaniYangilash("fanId", e.target.value);
                  sozlamaniYangilash("mavzuIdlar", []);
                }}
              >
                <option value="">— Tanlang —</option>
                {fanlar.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nomi}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Sinf</Label>
              <select
                className="h-11 rounded-lg border px-3"
                value={sozlama.daraja}
                onChange={(e) => {
                  sozlamaniYangilash("daraja", e.target.value);
                  sozlamaniYangilash("mavzuIdlar", []);
                }}
              >
                <option value="">— Tanlang —</option>
                {DARAJALAR.map((d) => (
                  <option key={d} value={d}>
                    {d}-sinf
                  </option>
                ))}
              </select>
            </div>
          </div>

          {sozlama.fanId && sozlama.daraja && (
            <div className="flex flex-col gap-2">
              <Label>Mavzu</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="barcha-mavzular"
                  checked={sozlama.mavzuIdlar.length === 0}
                  onCheckedChange={(v) => {
                    if (v) sozlamaniYangilash("mavzuIdlar", []);
                  }}
                />
                <Label htmlFor="barcha-mavzular" className="font-normal">
                  Barcha mavzular
                </Label>
              </div>
              {mosMavzular.length > 0 ? (
                <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg border p-2">
                  {mosMavzular.map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`mavzu-${m.id}`}
                        checked={sozlama.mavzuIdlar.includes(m.id)}
                        onCheckedChange={(v) => mavzuBelgilash(m.id, Boolean(v))}
                      />
                      <Label htmlFor={`mavzu-${m.id}`} className="font-normal">
                        {m.nomi}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: theme.colors.muted }}>
                  Bu fan/sinf uchun mavzu topilmadi
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Savollar soni</Label>
            <div className="flex flex-wrap gap-2">
              {(["10", "15", "20", "hammasi"] as const).map((qiymat) => (
                <button
                  key={qiymat}
                  type="button"
                  onClick={() => sozlamaniYangilash("savolSoni", qiymat)}
                  className={cn(
                    "min-h-11 rounded-lg border-2 px-4 font-semibold",
                    sozlama.savolSoni === qiymat && "text-white",
                  )}
                  style={{
                    borderColor: theme.colors.primary,
                    background: sozlama.savolSoni === qiymat ? theme.colors.primary : "transparent",
                    color: sozlama.savolSoni === qiymat ? "white" : theme.colors.primary,
                  }}
                >
                  {qiymat === "hammasi" ? "Hammasi" : qiymat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Vaqt rejimi</Label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="vaqt-rejimi"
                  checked={!sozlama.vaqtRejimi}
                  onChange={() => sozlamaniYangilash("vaqtRejimi", false)}
                />
                Vaqtsiz — men o&apos;zim boshqaraman
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="vaqt-rejimi"
                  checked={sozlama.vaqtRejimi}
                  onChange={() => sozlamaniYangilash("vaqtRejimi", true)}
                />
                Vaqt bilan — har savolga{" "}
                <Input
                  type="number"
                  min={5}
                  max={300}
                  value={sozlama.vaqtSoniya}
                  onChange={(e) => sozlamaniYangilash("vaqtSoniya", e.target.value)}
                  onClick={() => sozlamaniYangilash("vaqtRejimi", true)}
                  className="h-8 w-20"
                />{" "}
                soniya
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Tartib</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tartib"
                  checked={sozlama.tartib === "aralash"}
                  onChange={() => sozlamaniYangilash("tartib", "aralash")}
                />
                Aralash
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tartib"
                  checked={sozlama.tartib === "ketma-ket"}
                  onChange={() => sozlamaniYangilash("tartib", "ketma-ket")}
                />
                Mavzu bo&apos;yicha ketma-ket
              </label>
            </div>
          </div>

          {sozlama.fanId && sozlama.daraja && (
            <p className="text-sm" style={{ color: theme.colors.muted }}>
              {qidirilmoqda
                ? "Tekshirilmoqda..."
                : qidiruvXatosi
                  ? `⚠️ ${qidiruvXatosi}`
                  : mavjudSoni === 0
                    ? "⚠️ Bu tanlovda izohli savol topilmadi"
                    : mavjudSoni < talabQilinganSoni
                      ? `⚠️ Bu tanlovda izohli savol ${mavjudSoni} ta — so'ralgan ${talabQilinganSoni} tadan kam`
                      : `✅ ${mavjudSoni} ta izohli savol topildi`}
            </p>
          )}

          <Tugma
            rang="primary"
            hajm="katta"
            onClick={boshlash}
            disabled={qidirilmoqda || mavjudSoni === 0 || boshlanmoqda}
          >
            BOSHLASH
          </Tugma>
        </Karta>
      </div>
    </main>
  );
}
