"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMatnlar } from "@/components/student/matnlar-provideri";
import { youtubeEmbedUrl } from "@/lib/utils/youtube";
import { KontentKorinish } from "@/components/kontent-korinish";
import type { MavzuDetali } from "@/lib/talaba/organish";
import type { Variant } from "@/lib/talaba/aralashtirish";
import { theme } from "@/lib/theme";
import { TabriklashModali } from "@/components/redizayn/tabriklash-modali";
import { nishonMalumotiniOl } from "@/lib/redizayn/nishonlar-royxati";
import { Karta } from "@/components/redizayn/karta";
import { Tugma } from "@/components/redizayn/tugma";
import { ProgressChizigi } from "@/components/redizayn/progress-chizigi";
import { Sherbek } from "@/components/ui/Sherbek";
import { VariantTugmalari } from "@/components/redizayn/variant-tugmalari";
import { tovushChal } from "@/lib/redizayn/tovush";

interface XpJavobi {
  darajaOshdimi?: boolean;
  yangiDaraja?: number;
  yangiNishonlar?: string[];
}

type Bosqich = "nazariya" | "misol" | "tekshirish" | "yakun";

export function OrganishEkrani({ mavzuId, detali }: { mavzuId: number; detali: MavzuDetali }) {
  const router = useRouter();
  const { matnlar } = useMatnlar();
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

  useEffect(() => {
    if (natija) tovushChal(natija.togriMi ? "togri" : "xato");
  }, [natija]);

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
    <main
      className="min-h-screen"
      style={{
        background: theme.colors.bg,
        backgroundImage: "url(/naqsh.svg)",
        backgroundRepeat: "repeat",
        color: theme.colors.text,
        fontFamily: "var(--font-nunito), sans-serif",
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6 sm:p-8">
        <header className="flex flex-col gap-2">
          <p className="text-[18px]" style={{ color: theme.colors.muted }}>
            {detali.fanNomi} · {detali.nomi}
          </p>
          <ProgressChizigi foiz={((bosqichIndeksi + 1) / bosqichlar.length) * 100} />
        </header>

        <section className="flex flex-1 flex-col gap-6">
          {joriyBosqich === "nazariya" && (
            <>
              <h1 className="text-[28px] font-extrabold sm:text-[32px]" style={{ color: theme.colors.primary }}>
                {matnlar.talaba.organish.nazariya}
              </h1>
              <div className="flex flex-col gap-6">
                {nazariyaMateriallari.map((material) => (
                  <MaterialBlogi key={material.id} material={material} />
                ))}
              </div>
            </>
          )}

          {joriyBosqich === "misol" && (
            <>
              <h1 className="text-[28px] font-extrabold sm:text-[32px]" style={{ color: theme.colors.primary }}>
                {matnlar.talaba.organish.misol}
              </h1>
              <div className="flex flex-col gap-6">
                {misolMateriallari.map((material) => (
                  <MaterialBlogi key={material.id} material={material} />
                ))}
              </div>
            </>
          )}

          {joriyBosqich === "tekshirish" && joriySavol && (
            <>
              <h1 className="text-[28px] font-extrabold sm:text-[32px]" style={{ color: theme.colors.primary }}>
                {matnlar.talaba.organish.oziniTekshirish} ({savolIndeksi + 1}/
                {detali.ozOziniTekshirishSavollari.length})
              </h1>
              <p className="text-[22px] font-semibold sm:text-[26px]">{joriySavol.matn}</p>

              <VariantTugmalari
                variantlar={joriySavol.variantlar}
                tanlanganJavob={tanlanganJavob}
                togriJavob={natija?.togriJavob ?? null}
                onTanlash={javobTanlash}
                ochilganmi={Boolean(natija)}
              />

              {natija && (
                <Karta className="flex flex-col items-center gap-3 text-center">
                  <Sherbek holat={natija.togriMi ? "tugri" : "xato"} />
                  <p
                    className="text-[20px] font-bold"
                    style={{ color: natija.togriMi ? theme.colors.success : theme.colors.danger }}
                  >
                    {natija.togriMi ? matnlar.talaba.organish.togri : matnlar.talaba.organish.notogri}
                  </p>
                  {!natija.togriMi && (
                    <p className="text-[18px]">{matnlar.talaba.organish.togriJavobEdi(natija.togriJavob)}</p>
                  )}
                  {natija.izoh && (
                    <p className="text-[16px]" style={{ color: theme.colors.muted }}>
                      {natija.izoh}
                    </p>
                  )}
                  <Tugma onClick={keyingiSavolgaOtish} rang="primary">
                    {matnlar.umumiy.keyingi}
                  </Tugma>
                </Karta>
              )}
            </>
          )}

          {joriyBosqich === "yakun" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
              <Sherbek holat="zor" size="lg" />
              <p className="text-[28px] font-extrabold" style={{ color: theme.colors.primary }}>
                {matnlar.talaba.organish.mavzuOrganildi}
              </p>
              {detali.ozOziniTekshirishSavollari.length > 0 && (
                <p className="text-[20px]" style={{ color: theme.colors.muted }}>
                  {matnlar.talaba.mashq.hisob(togriSoni, detali.ozOziniTekshirishSavollari.length)}
                </p>
              )}
              <Tugma onClick={yakunlashniBajarish} disabled={yakunlanmoqda} rang="accent">
                {yakunlanmoqda ? matnlar.umumiy.yuklanmoqda : matnlar.umumiy.davomEtish}
              </Tugma>
            </div>
          )}
        </section>

        {(joriyBosqich === "nazariya" || joriyBosqich === "misol") && (
          <footer className="pt-4">
            <Tugma onClick={keyingiBosqichgaOtish} rang="accent" className="w-full sm:w-auto">
              {matnlar.umumiy.keyingi}
            </Tugma>
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
      </div>
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
    <Karta className="flex flex-col gap-3">
      <h2 className="text-[20px] font-bold">{material.sarlavha}</h2>
      {embedUrl && (
        <div className="aspect-video w-full overflow-hidden" style={{ borderRadius: theme.radius.md }}>
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
          className="max-h-96 w-auto object-contain"
          style={{ borderRadius: theme.radius.md }}
        />
      )}
      {material.kontent && <KontentKorinish matn={material.kontent} />}
    </Karta>
  );
}
