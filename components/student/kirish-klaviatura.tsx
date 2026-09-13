"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Sherbek } from "@/components/ui/Sherbek";
import { uz } from "@/lib/i18n/uz";

const KOD_UZUNLIGI = 6;

interface TasdiqlanganOquvchi {
  ismFamiliya: string;
  sinfNomi: string;
}

const KLAVIATURA_TARTIBI = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "→"] as const;

export function KirishKlaviaturasi() {
  const router = useRouter();
  const [kod, setKod] = useState("");
  const [xato, setXato] = useState<string | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [tasdiqlangan, setTasdiqlangan] = useState<TasdiqlanganOquvchi | null>(null);

  const yuborish = useCallback(async (kirishKodi: string) => {
    setYuklanmoqda(true);
    setXato(null);
    try {
      const javob = await fetch("/api/auth/oquvchi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kirishKodi }),
      });
      const natija = await javob.json();
      if (!javob.ok) {
        setXato(natija.xato ?? uz.talaba.kirish.kodNotogri);
        setKod("");
        return;
      }
      setTasdiqlangan({ ismFamiliya: natija.ismFamiliya, sinfNomi: natija.sinfNomi });
    } catch {
      setXato(uz.umumiy.xatoYuzBerdi);
      setKod("");
    } finally {
      setYuklanmoqda(false);
    }
  }, []);

  function tugmaBosildi(tugma: (typeof KLAVIATURA_TARTIBI)[number]) {
    if (yuklanmoqda) return;

    if (tugma === "⌫") {
      setKod((oldin) => oldin.slice(0, -1));
      return;
    }

    if (tugma === "→") {
      if (kod.length === KOD_UZUNLIGI) void yuborish(kod);
      return;
    }

    setXato(null);
    setKod((oldin) => {
      if (oldin.length >= KOD_UZUNLIGI) return oldin;
      const yangiKod = oldin + tugma;
      if (yangiKod.length === KOD_UZUNLIGI) void yuborish(yangiKod);
      return yangiKod;
    });
  }

  async function buMenEmasman() {
    setYuklanmoqda(true);
    try {
      await fetch("/api/auth/chiqish", { method: "POST" });
    } finally {
      setTasdiqlangan(null);
      setKod("");
      setYuklanmoqda(false);
    }
  }

  if (tasdiqlangan) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-8 text-center">
        <div className="flex flex-col gap-3">
          <p className="text-4xl font-semibold sm:text-5xl">
            {uz.talaba.kirish.salom(tasdiqlangan.ismFamiliya, tasdiqlangan.sinfNomi)}
          </p>
        </div>
        <div className="flex w-full max-w-md flex-col gap-4">
          <button
            type="button"
            onClick={() => router.push("/menyu")}
            className="min-h-24 rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground active:opacity-80"
          >
            {uz.umumiy.davomEtish}
          </button>
          <button
            type="button"
            onClick={buMenEmasman}
            disabled={yuklanmoqda}
            className="min-h-24 rounded-2xl border-2 border-border text-2xl font-medium active:bg-muted disabled:opacity-50"
          >
            {uz.talaba.kirish.buMenEmasman}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-8">
      <Logo size="xl" withText priority />
      <Sherbek holat="oddiy" size="xl" animatsiya="nafas" />
      <h1 className="text-center text-3xl font-semibold sm:text-4xl">
        {uz.talaba.kirish.sarlavha}
      </h1>

      <div className="flex gap-2 sm:gap-3">
        {Array.from({ length: KOD_UZUNLIGI }).map((_, indeks) => (
          <div
            key={indeks}
            className="flex size-14 items-center justify-center rounded-xl border-2 border-border text-3xl font-bold sm:size-16 sm:text-4xl"
          >
            {kod[indeks] ? "•" : ""}
          </div>
        ))}
      </div>

      {xato && <p className="max-w-sm text-center text-lg font-medium text-destructive">{xato}</p>}
      {yuklanmoqda && <p className="text-lg text-muted-foreground">{uz.umumiy.yuklanmoqda}</p>}

      <div className="grid w-full max-w-sm grid-cols-3 gap-3">
        {KLAVIATURA_TARTIBI.map((tugma) => (
          <button
            key={tugma}
            type="button"
            onClick={() => tugmaBosildi(tugma)}
            disabled={yuklanmoqda || (tugma === "→" && kod.length !== KOD_UZUNLIGI)}
            className="min-h-20 rounded-2xl border-2 border-border text-3xl font-semibold active:bg-muted disabled:opacity-40 sm:min-h-24 sm:text-4xl"
          >
            {tugma}
          </button>
        ))}
      </div>
    </main>
  );
}
