"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { theme } from "@/lib/theme";
import { royxatniAralashtirish } from "@/lib/talaba/aralashtirish";
import { gildirakSavollariniOl, gildirakSessiyasiniBoshlash, type GildirakSavoli } from "@/lib/actions/gildirak";
import { Karta } from "@/components/redizayn/karta";
import { Tugma } from "@/components/redizayn/tugma";
import { Sherbek } from "@/components/ui/Sherbek";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Mavzu } from "@/lib/actions/spravochniklar";
import type { Oquvchi } from "@/lib/actions/oquvchilar";

interface Nomlangan {
  id: number;
  nomi: string;
}

const SOZLAMALAR_KALITI = "gildirak-sozlamalar";
export const GILDIRAK_SESSIYA_KALITI = "gildirak-sessiya";

type RaqamlarSoni = "12" | "20" | "30";
type BahoRejimi = "tasdiqlash" | "faqat-ekran";

interface Sozlamalar {
  sinfId: string;
  fanId: string;
  mavzuIdlar: number[];
  raqamlarSoni: RaqamlarSoni;
  bahoRejimi: BahoRejimi;
  omadliYoqilgan: boolean;
}

const BOSH_SOZLAMALAR: Sozlamalar = {
  sinfId: "",
  fanId: "",
  mavzuIdlar: [],
  raqamlarSoni: "12",
  bahoRejimi: "tasdiqlash",
  omadliYoqilgan: false,
};

export interface GildirakRaqamMalumoti {
  raqam: number;
  savol: GildirakSavoli | null;
  omadlimi: boolean;
}

export interface GildirakSessiyaMalumoti {
  sessiyaId: number;
  sinfId: number;
  sinfNomi: string;
  fanId: number;
  fanNomi: string;
  bahoRejimi: BahoRejimi;
  qatnashuvchilar: { id: number; ismFamiliya: string }[];
  raqamlar: GildirakRaqamMalumoti[];
}

const OMADLI_FOIZ = 0.15;

export function GildirakSozlash({
  sinflar,
  fanlar,
  mavzular,
  oquvchilarSinfBoyicha,
}: {
  sinflar: Nomlangan[];
  fanlar: Nomlangan[];
  mavzular: Mavzu[];
  oquvchilarSinfBoyicha: Record<number, Oquvchi[]>;
}) {
  const router = useRouter();
  const [sozlama, setSozlama] = useState<Sozlamalar>(BOSH_SOZLAMALAR);
  const [yoqlar, setYoqlar] = useState<Set<number>>(new Set());
  const [pool, setPool] = useState<GildirakSavoli[] | null>(null);
  const [qidirilmoqda, setQidirilmoqda] = useState(false);
  const [qidiruvXatosi, setQidiruvXatosi] = useState<string | null>(null);
  const [boshlanmoqda, setBoshlanmoqda] = useState(false);

  useEffect(() => {
    try {
      const xom = window.localStorage.getItem(SOZLAMALAR_KALITI);
      if (xom) setSozlama((oldin) => ({ ...oldin, ...JSON.parse(xom) }));
    } catch {
      // e'tiborsiz qoldiriladi
    }
  }, []);

  const oquvchilar = useMemo(
    () => (sozlama.sinfId ? (oquvchilarSinfBoyicha[Number(sozlama.sinfId)] ?? []) : []),
    [oquvchilarSinfBoyicha, sozlama.sinfId],
  );

  const mosMavzular = useMemo(
    () =>
      mavzular.filter(
        (m) =>
          m.turi !== "baholash" &&
          String(m.fan_id) === sozlama.fanId &&
          String(m.sinf_id) === sozlama.sinfId,
      ),
    [mavzular, sozlama.fanId, sozlama.sinfId],
  );

  function sozlamaniYangilash<K extends keyof Sozlamalar>(kalit: K, qiymat: Sozlamalar[K]) {
    setSozlama((oldin) => ({ ...oldin, [kalit]: qiymat }));
  }

  useEffect(() => {
    if (!sozlama.fanId || !sozlama.sinfId) {
      setPool(null);
      setQidiruvXatosi(null);
      return;
    }
    let bekorQilindi = false;
    setQidirilmoqda(true);
    setQidiruvXatosi(null);

    const vaqtBelgisi = setTimeout(async () => {
      const natija = await gildirakSavollariniOl(
        Number(sozlama.fanId),
        Number(sozlama.sinfId),
        sozlama.mavzuIdlar,
      );
      if (bekorQilindi) return;
      if (natija.xato) {
        setQidiruvXatosi(natija.xato);
        setPool(null);
      } else {
        setPool(natija.savollar ?? []);
      }
      setQidirilmoqda(false);
    }, 300);

    return () => {
      bekorQilindi = true;
      clearTimeout(vaqtBelgisi);
    };
  }, [sozlama.fanId, sozlama.sinfId, sozlama.mavzuIdlar]);

  useEffect(() => {
    // Sinf o'zgarganda avvalgi "yo'q" belgilari boshqa sinfga tegishli
    // bo'lib qolmasin — hammasi "bor" holatiga qaytariladi.
    setYoqlar(new Set());
  }, [sozlama.sinfId]);

  function mavzuBelgilash(mavzuId: number, tanlanganmi: boolean) {
    sozlamaniYangilash(
      "mavzuIdlar",
      tanlanganmi ? [...sozlama.mavzuIdlar, mavzuId] : sozlama.mavzuIdlar.filter((id) => id !== mavzuId),
    );
  }

  function yoqBelgilash(oquvchiId: number, yoqmi: boolean) {
    setYoqlar((oldin) => {
      const yangi = new Set(oldin);
      if (yoqmi) yangi.add(oquvchiId);
      else yangi.delete(oquvchiId);
      return yangi;
    });
  }

  async function boshlash() {
    if (!pool || pool.length === 0) return;
    const qatnashuvchilar = oquvchilar.filter((o) => o.faol && !yoqlar.has(o.id));
    if (qatnashuvchilar.length === 0) {
      toast.error("Kamida bitta qatnashuvchi bo'lishi kerak");
      return;
    }

    setBoshlanmoqda(true);
    try {
      const natija = await gildirakSessiyasiniBoshlash(Number(sozlama.sinfId), Number(sozlama.fanId));
      if (natija.xato || !natija.sessiyaId) {
        toast.error(natija.xato ?? "Sessiyani boshlab bo'lmadi");
        return;
      }

      const raqamlarSoni = Number(sozlama.raqamlarSoni);
      const aralashganPool = royxatniAralashtirish(pool);
      const omadliRaqamlar = new Set<number>();
      if (sozlama.omadliYoqilgan) {
        const nomzodlar = royxatniAralashtirish(Array.from({ length: raqamlarSoni }, (_, i) => i + 1));
        const omadliSoni = Math.round(raqamlarSoni * OMADLI_FOIZ);
        nomzodlar.slice(0, omadliSoni).forEach((r) => omadliRaqamlar.add(r));
      }

      const raqamlar: GildirakRaqamMalumoti[] = Array.from({ length: raqamlarSoni }, (_, i) => {
        const raqam = i + 1;
        const omadlimi = omadliRaqamlar.has(raqam);
        return { raqam, omadlimi, savol: omadlimi ? null : (aralashganPool[i % aralashganPool.length] ?? null) };
      });

      const sinfNomi = sinflar.find((s) => String(s.id) === sozlama.sinfId)?.nomi ?? "";
      const fanNomi = fanlar.find((f) => String(f.id) === sozlama.fanId)?.nomi ?? "";

      const sessiya: GildirakSessiyaMalumoti = {
        sessiyaId: natija.sessiyaId,
        sinfId: Number(sozlama.sinfId),
        sinfNomi,
        fanId: Number(sozlama.fanId),
        fanNomi,
        bahoRejimi: sozlama.bahoRejimi,
        qatnashuvchilar: qatnashuvchilar.map((o) => ({ id: o.id, ismFamiliya: o.ism_familiya })),
        raqamlar,
      };

      window.sessionStorage.setItem(GILDIRAK_SESSIYA_KALITI, JSON.stringify(sessiya));
      window.localStorage.setItem(SOZLAMALAR_KALITI, JSON.stringify(sozlama));
      router.push("/gildirak/sessiya");
    } finally {
      setBoshlanmoqda(false);
    }
  }

  const mavjudSoni = pool?.length ?? 0;

  return (
    <main className="min-h-screen" style={{ background: theme.colors.bg, color: theme.colors.text }}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
        <div className="flex items-center gap-4">
          <Sherbek holat="oddiy" size="lg" />
          <div>
            <h1 className="text-[28px] font-extrabold" style={{ color: theme.colors.primary }}>
              🎡 Bilim g&apos;ildiragi
            </h1>
            <p style={{ color: theme.colors.muted }}>
              G&apos;ildirak aylanadi, o&apos;quvchi tanlanadi, birga o&apos;rganamiz
            </p>
          </div>
        </div>

        <Karta className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label>Sinf</Label>
              <select
                className="h-11 rounded-lg border px-3"
                value={sozlama.sinfId}
                onChange={(e) => {
                  sozlamaniYangilash("sinfId", e.target.value);
                  sozlamaniYangilash("mavzuIdlar", []);
                }}
              >
                <option value="">— Tanlang —</option>
                {sinflar.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nomi}
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          {sozlama.fanId && sozlama.sinfId && (
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
              {mosMavzular.length > 0 && (
                <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-lg border p-2">
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
              )}
            </div>
          )}

          {sozlama.sinfId && (
            <div className="flex flex-col gap-2">
              <Label>Bugun kim yo&apos;q?</Label>
              {oquvchilar.length === 0 ? (
                <p className="text-sm" style={{ color: theme.colors.muted }}>
                  Bu sinfda o&apos;quvchi topilmadi
                </p>
              ) : (
                <div className="grid max-h-48 grid-cols-2 gap-1 overflow-y-auto rounded-lg border p-2">
                  {oquvchilar
                    .filter((o) => o.faol)
                    .map((o) => (
                      <div key={o.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`bor-${o.id}`}
                          checked={!yoqlar.has(o.id)}
                          onCheckedChange={(v) => yoqBelgilash(o.id, !v)}
                        />
                        <Label htmlFor={`bor-${o.id}`} className="font-normal">
                          {o.ism_familiya}
                        </Label>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Raqamlar soni</Label>
            <div className="flex gap-2">
              {(["12", "20", "30"] as const).map((qiymat) => (
                <button
                  key={qiymat}
                  type="button"
                  onClick={() => sozlamaniYangilash("raqamlarSoni", qiymat)}
                  className="min-h-11 rounded-lg border-2 px-4 font-semibold"
                  style={{
                    borderColor: theme.colors.primary,
                    background: sozlama.raqamlarSoni === qiymat ? theme.colors.primary : "transparent",
                    color: sozlama.raqamlarSoni === qiymat ? "white" : theme.colors.primary,
                  }}
                >
                  {qiymat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="omadli"
              checked={sozlama.omadliYoqilgan}
              onCheckedChange={(v) => sozlamaniYangilash("omadliYoqilgan", Boolean(v))}
            />
            <Label htmlFor="omadli" className="font-normal">
              Omadli raqamlar (15% — savol o&apos;rniga sovg&apos;a)
            </Label>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Baho qo&apos;yish</Label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="baho-rejimi"
                  checked={sozlama.bahoRejimi === "tasdiqlash"}
                  onChange={() => sozlamaniYangilash("bahoRejimi", "tasdiqlash")}
                />
                Men tasdiqlaganimdan keyin jurnalga yozilsin
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="baho-rejimi"
                  checked={sozlama.bahoRejimi === "faqat-ekran"}
                  onChange={() => sozlamaniYangilash("bahoRejimi", "faqat-ekran")}
                />
                Faqat ekranda ko&apos;rsatilsin, yozilmasin
              </label>
            </div>
          </div>

          {sozlama.fanId && sozlama.sinfId && (
            <p className="text-sm" style={{ color: theme.colors.muted }}>
              {qidirilmoqda
                ? "Tekshirilmoqda..."
                : qidiruvXatosi
                  ? `⚠️ ${qidiruvXatosi}`
                  : mavjudSoni === 0
                    ? "⚠️ Bu tanlovda savol topilmadi"
                    : `✅ ${mavjudSoni} ta savol topildi`}
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
