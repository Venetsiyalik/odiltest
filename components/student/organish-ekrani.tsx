"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { uz } from "@/lib/i18n/uz";
import { youtubeEmbedUrl } from "@/lib/utils/youtube";
import { KontentKorinish } from "@/components/kontent-korinish";
import type { MavzuDetali } from "@/lib/talaba/organish";
import type { Variant } from "@/lib/talaba/aralashtirish";
import { TabriklashModali } from "@/components/redizayn/tabriklash-modali";
import { nishonMalumotiniOl } from "@/lib/redizayn/nishonlar-royxati";

const VARIANT_HARFLAR: Variant[] = ["A", "B", "C", "D"];

interface XpJavobi {
  darajaOshdimi?: boolean;
  yangiDaraja?: number;
  yangiNishonlar?: string[];
}

type Bosqich = "nazariya" | "misol" | "tekshirish" | "yakun";

export function OrganishEkrani({ mavzuId, detali }: { mavzuId: number; detali: MavzuDetali }) {
  const router = useRouter();
  const nazariyaMateriallari = useMemo(
    () => detali.materiallar.filter((m) => m.turi === "nazariya"),
    [detali.materiallar],
  );
  const misolMateriallari = useMemo(
    () => detali.materiallar.filter((m) => m.turi === "misol"),
    [detali.materiallar],
  );

  const bosqichlar: Bosqich[] = useMemo(() => {
    const roy: Bosqich[] = [];
    if (nazariyaMateriallari.length > 0) roy.push("nazariya");
    if (misolMateriallari.length > 0) roy.push("misol");
    if (detali.ozOziniTekshirishSavollari.length > 0) roy.push("tekshirish");
    roy.push("yakun");
    return roy;
  }, [nazariyaMateriallari, misolMateriallari, detali.ozOziniTekshirishSavollari]);

  const [bosqichIndeksi, setBosqichIndeksi] = useState(0);
  const [savolIndeksi, setSavolIndeksi] = useState(0);
  const [tanlanganJavob, setTanlanganJavob] = useState<Variant | null>(null);
  const [natija, setNatija] = useState<{ togriMi: boolean; togriJavob: Variant; izoh: string | null } | null>(
    null,
  );
  const [togriSoni, setTogriSoni] = useState(0);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [yakunlanmoqda, setYakunlanmoqda] = useState(false);
  const [tabriklash, setTabriklash] = useState<XpJavobi | null>(null);

  const joriyBosqich = bosqichlar[bosqichIndeksi];
  const joriySavol = detali.ozOziniTekshirishSavollari[savolIndeksi];

  async function javobTanlash(harf: Variant) {
    if (natija || yuklanmoqda) return;
    setTanlanganJavob(harf);
    setYuklanmoqda(true);
    try {
      const javob = await fetch("/api/mashq/javob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savolId: joriySavol.savolId, tanlanganJavob: harf }),
      }).then((r) => r.json());

      setNatija(javob);
      if (javob.togriMi) setTogriSoni((son) => son + 1);
    } finally {
      setYuklanmoqda(false);
    }
  }

  function keyingiSavolgaOtish() {
    setTanlanganJavob(null);
    setNatija(null);
    if (savolIndeksi + 1 < detali.ozOziniTekshirishSavollari.length) {
      setSavolIndeksi((i) => i + 1);
    } else {
      setBosqichIndeksi((i) => i + 1);
    }
  }

  function organishdanChiqish() {
    router.push("/organish");
    router.refresh();
  }

  async function yakunlashniBajarish() {
    setYakunlanmoqda(true);
    try {
      const foiz =
        detali.ozOziniTekshirishSavollari.length > 0
          ? Math.round((togriSoni / detali.ozOziniTekshirishSavollari.length) * 100)
          : 100;
      const natija: XpJavobi = await fetch("/api/organish/yakunlash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mavzuId, oziniTekshirishFoiz: foiz }),
      }).then((r) => r.json());

      if (natija.darajaOshdimi || (natija.yangiNishonlar?.length ?? 0) > 0) {
        setTabriklash(natija);
      } else {
        organishdanChiqish();
      }
    } finally {
      setYakunlanmoqda(false);
    }
  }

  function keyingiBosqichgaOtish() {
    setBosqichIndeksi((i) => i + 1);
  }

  return (
    <main className="flex min-h-screen flex-col gap-6 p-6 sm:p-8">
      <header className="flex flex-col gap-2">
        <p className="text-lg text-muted-foreground">
          {detali.fanNomi} · {detali.nomi}
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((bosqichIndeksi + 1) / bosqichlar.length) * 100}%` }}
          />
        </div>
      </header>

      <section className="flex flex-1 flex-col gap-6">
        {joriyBosqich === "nazariya" && (
          <>
            <h1 className="text-2xl font-semibold sm:text-3xl">{uz.talaba.organish.nazariya}</h1>
            <div className="flex flex-col gap-8">
              {nazariyaMateriallari.map((material) => (
                <MaterialBlogi key={material.id} material={material} />
              ))}
            </div>
          </>
        )}

        {joriyBosqich === "misol" && (
          <>
            <h1 className="text-2xl font-semibold sm:text-3xl">{uz.talaba.organish.misol}</h1>
            <div className="flex flex-col gap-8">
              {misolMateriallari.map((material) => (
                <MaterialBlogi key={material.id} material={material} />
              ))}
            </div>
          </>
        )}

        {joriyBosqich === "tekshirish" && joriySavol && (
          <>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              {uz.talaba.organish.oziniTekshirish} ({savolIndeksi + 1}/
              {detali.ozOziniTekshirishSavollari.length})
            </h1>
            <p className="text-xl font-medium sm:text-2xl">{joriySavol.matn}</p>
            <div className="flex flex-col gap-3">
              {VARIANT_HARFLAR.map((harf) => {
                const tanlangan = tanlanganJavob === harf;
                const buTogriJavob = natija && natija.togriJavob === harf;
                return (
                  <button
                    key={harf}
                    type="button"
                    onClick={() => javobTanlash(harf)}
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
                    {joriySavol.variantlar[harf]}
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
                  onClick={keyingiSavolgaOtish}
                  className="mt-2 min-h-16 w-fit rounded-xl bg-primary px-8 text-xl font-semibold text-primary-foreground active:opacity-80"
                >
                  {uz.umumiy.keyingi}
                </button>
              </div>
            )}
          </>
        )}

        {joriyBosqich === "yakun" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <p className="text-3xl font-semibold">{uz.talaba.organish.mavzuOrganildi}</p>
            {detali.ozOziniTekshirishSavollari.length > 0 && (
              <p className="text-xl text-muted-foreground">
                {uz.talaba.mashq.hisob(togriSoni, detali.ozOziniTekshirishSavollari.length)}
              </p>
            )}
            <button
              type="button"
              onClick={yakunlashniBajarish}
              disabled={yakunlanmoqda}
              className="min-h-20 rounded-2xl bg-primary px-10 py-5 text-2xl font-semibold text-primary-foreground active:opacity-80 disabled:opacity-50"
            >
              {yakunlanmoqda ? uz.umumiy.yuklanmoqda : uz.umumiy.davomEtish}
            </button>
          </div>
        )}
      </section>

      {(joriyBosqich === "nazariya" || joriyBosqich === "misol") && (
        <footer className="border-t pt-4">
          <button
            type="button"
            onClick={keyingiBosqichgaOtish}
            className="min-h-20 w-full rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground active:opacity-80 sm:w-auto sm:px-10"
          >
            {uz.umumiy.keyingi}
          </button>
        </footer>
      )}

      {tabriklash && (
        <TabriklashModali
          malumot={{
            darajaOshdimi: tabriklash.darajaOshdimi,
            yangiDaraja: tabriklash.yangiDaraja,
            yangiNishonlar: (tabriklash.yangiNishonlar ?? []).map((kod) => nishonMalumotiniOl(kod)),
          }}
          yopish={organishdanChiqish}
        />
      )}
    </main>
  );
}

function MaterialBlogi({
  material,
}: {
  material: MavzuDetali["materiallar"][number];
}) {
  const embedUrl = material.turi === "video" && material.mediaUrl ? youtubeEmbedUrl(material.mediaUrl) : null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{material.sarlavha}</h2>
      {embedUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-xl border">
          <iframe
            src={embedUrl}
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      {material.mediaUrl && material.turi !== "video" && (
        <Image
          src={material.mediaUrl}
          alt={material.sarlavha}
          width={600}
          height={400}
          unoptimized
          className="max-h-96 w-auto rounded-xl border object-contain"
        />
      )}
      {material.kontent && <KontentKorinish matn={material.kontent} />}
    </div>
  );
}
