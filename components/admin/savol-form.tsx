"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import type { Savol, SavolQiymatlari } from "@/lib/actions/savollar";
import type { Mavzu } from "@/lib/actions/spravochniklar";
import { royxatdanItemlar } from "@/lib/utils/select-items";

interface Nomlangan {
  id: number;
  nomi: string;
}

const BOSH_QIYMAT = {
  fanId: "",
  sinfId: "",
  mavzuId: "",
  matn: "",
  variantA: "",
  variantB: "",
  variantC: "",
  variantD: "",
  togriJavob: "A" as "A" | "B" | "C" | "D",
  qiyinlik: "1",
  izoh: "",
  izohQisqa: "",
};

export function SavolForma({
  mavjudSavol,
  fanlar,
  sinflar,
  mavzular,
  saqlash,
  yopish,
}: {
  mavjudSavol?: Savol;
  fanlar: Nomlangan[];
  sinflar: Nomlangan[];
  mavzular: Mavzu[];
  saqlash: (qiymatlar: SavolQiymatlari) => Promise<{ xato?: string }>;
  yopish: () => void;
}) {
  const [forma, setForma] = useState(
    mavjudSavol
      ? {
          fanId: String(mavjudSavol.fan_id),
          sinfId: String(mavjudSavol.sinf_id),
          mavzuId: mavjudSavol.mavzu_id ? String(mavjudSavol.mavzu_id) : "",
          matn: mavjudSavol.matn,
          variantA: mavjudSavol.variant_a,
          variantB: mavjudSavol.variant_b,
          variantC: mavjudSavol.variant_c,
          variantD: mavjudSavol.variant_d,
          togriJavob: mavjudSavol.togri_javob,
          qiyinlik: String(mavjudSavol.qiyinlik),
          izoh: mavjudSavol.izoh ?? "",
          izohQisqa: mavjudSavol.izoh_qisqa ?? "",
        }
      : BOSH_QIYMAT,
  );
  const [rasmFayl, setRasmFayl] = useState<File | null>(null);
  const [rasmOldindanKorish, setRasmOldindanKorish] = useState<string | null>(
    mavjudSavol?.rasm_url ?? null,
  );
  const [izohRasmFayl, setIzohRasmFayl] = useState<File | null>(null);
  const [izohRasmOldindanKorish, setIzohRasmOldindanKorish] = useState<string | null>(
    mavjudSavol?.izoh_rasm_url ?? null,
  );
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  const filtrlanganMavzular = useMemo(
    () =>
      mavzular.filter(
        (m) => String(m.fan_id) === forma.fanId && String(m.sinf_id) === forma.sinfId,
      ),
    [mavzular, forma.fanId, forma.sinfId],
  );

  function maydonYangilash<K extends keyof typeof forma>(kalit: K, qiymat: (typeof forma)[K]) {
    setForma((oldin) => ({ ...oldin, [kalit]: qiymat }));
  }

  function raqamTanlandi(fayl: File | null) {
    setRasmFayl(fayl);
    if (fayl) {
      setRasmOldindanKorish(URL.createObjectURL(fayl));
    }
  }

  async function submit() {
    if (!forma.fanId || !forma.sinfId) {
      toast.error("Fan va sinfni tanlang");
      return;
    }

    setSaqlanmoqda(true);
    try {
      let rasmUrl = mavjudSavol?.rasm_url ?? null;

      if (rasmFayl) {
        const supabase = createClient();
        const kengaytma = rasmFayl.name.split(".").pop();
        const yol = `savollar/${Date.now()}-${Math.random().toString(36).slice(2)}.${kengaytma}`;
        const { error: yuklashXatosi } = await supabase.storage
          .from("savol-rasmlari")
          .upload(yol, rasmFayl);

        if (yuklashXatosi) {
          toast.error(`Rasm yuklashda xato: ${yuklashXatosi.message}`);
          setSaqlanmoqda(false);
          return;
        }

        rasmUrl = supabase.storage.from("savol-rasmlari").getPublicUrl(yol).data.publicUrl;
      }

      let izohRasmUrl = mavjudSavol?.izoh_rasm_url ?? null;

      if (izohRasmFayl) {
        const supabase = createClient();
        const kengaytma = izohRasmFayl.name.split(".").pop();
        const yol = `izohlar/${Date.now()}-${Math.random().toString(36).slice(2)}.${kengaytma}`;
        const { error: yuklashXatosi } = await supabase.storage
          .from("savol-rasmlari")
          .upload(yol, izohRasmFayl);

        if (yuklashXatosi) {
          toast.error(`Izoh rasmini yuklashda xato: ${yuklashXatosi.message}`);
          setSaqlanmoqda(false);
          return;
        }

        izohRasmUrl = supabase.storage.from("savol-rasmlari").getPublicUrl(yol).data.publicUrl;
      }

      const natija = await saqlash({
        fanId: Number(forma.fanId),
        sinfId: Number(forma.sinfId),
        mavzuId: forma.mavzuId ? Number(forma.mavzuId) : null,
        matn: forma.matn,
        variantA: forma.variantA,
        variantB: forma.variantB,
        variantC: forma.variantC,
        variantD: forma.variantD,
        togriJavob: forma.togriJavob,
        qiyinlik: Number(forma.qiyinlik),
        izoh: forma.izoh || null,
        izohQisqa: forma.izohQisqa || null,
        izohRasmUrl,
        rasmUrl,
      });

      if (natija.xato) {
        toast.error(natija.xato);
        return;
      }

      toast.success(mavjudSavol ? "Savol yangilandi" : "Savol qo'shildi");
      yopish();
    } finally {
      setSaqlanmoqda(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label>Fan</Label>
          <Select
            value={forma.fanId}
            onValueChange={(v) => maydonYangilash("fanId", v ?? "")}
            items={royxatdanItemlar(fanlar)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Fan tanlang" />
            </SelectTrigger>
            <SelectContent>
              {fanlar.map((f) => (
                <SelectItem key={f.id} value={String(f.id)}>
                  {f.nomi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label>Sinf</Label>
          <Select
            value={forma.sinfId}
            onValueChange={(v) => maydonYangilash("sinfId", v ?? "")}
            items={royxatdanItemlar(sinflar)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sinf tanlang" />
            </SelectTrigger>
            <SelectContent>
              {sinflar.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.nomi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label>Mavzu (ixtiyoriy)</Label>
        <Select
          value={forma.mavzuId || "yoq"}
          onValueChange={(v) => maydonYangilash("mavzuId", !v || v === "yoq" ? "" : v)}
          items={royxatdanItemlar(filtrlanganMavzular, { yoq: "— Mavzusiz —" })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Mavzu tanlang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yoq">— Mavzusiz —</SelectItem>
            {filtrlanganMavzular.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                {m.nomi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label>Savol matni</Label>
        <Textarea
          rows={3}
          value={forma.matn}
          onChange={(e) => maydonYangilash("matn", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Rasm (ixtiyoriy)</Label>
        <Input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => raqamTanlandi(e.target.files?.[0] ?? null)}
        />
        {rasmOldindanKorish && (
          <Image
            src={rasmOldindanKorish}
            alt="Savol rasmi"
            width={200}
            height={120}
            className="mt-2 max-h-32 w-auto rounded border object-contain"
            unoptimized
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(["A", "B", "C", "D"] as const).map((harf) => (
          <div key={harf} className="flex flex-col gap-1">
            <Label>{harf} variant</Label>
            <div className="flex items-center gap-2">
              <Input
                value={forma[`variant${harf}`]}
                onChange={(e) => maydonYangilash(`variant${harf}`, e.target.value)}
              />
              <input
                type="radio"
                name="togriJavob"
                checked={forma.togriJavob === harf}
                onChange={() => maydonYangilash("togriJavob", harf)}
                title={`${harf} — to'g'ri javob`}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Variant yonidagi radio tugma bosilgan variant — to&apos;g&apos;ri javob hisoblanadi.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label>Qiyinlik (1–5)</Label>
          <Select
            value={forma.qiyinlik}
            onValueChange={(v) => maydonYangilash("qiyinlik", v ?? "1")}
            items={{ "1": "1", "2": "2", "3": "3", "4": "4", "5": "5" }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((q) => (
                <SelectItem key={q} value={String(q)}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label>Izoh (ixtiyoriy)</Label>
        <Textarea
          rows={2}
          value={forma.izoh}
          onChange={(e) => maydonYangilash("izoh", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Eslab qoling — qisqa xulosa (ixtiyoriy, Smart Test uchun)</Label>
        <Textarea
          rows={1}
          value={forma.izohQisqa}
          onChange={(e) => maydonYangilash("izohQisqa", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Izoh rasmi (ixtiyoriy)</Label>
        <Input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const fayl = e.target.files?.[0] ?? null;
            setIzohRasmFayl(fayl);
            if (fayl) setIzohRasmOldindanKorish(URL.createObjectURL(fayl));
          }}
        />
        {izohRasmOldindanKorish && (
          <Image
            src={izohRasmOldindanKorish}
            alt="Izoh rasmi"
            width={200}
            height={120}
            className="mt-2 max-h-32 w-auto rounded border object-contain"
            unoptimized
          />
        )}
      </div>

      <DialogFooter>
        <Button onClick={submit} disabled={saqlanmoqda}>
          {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </DialogFooter>
    </div>
  );
}
