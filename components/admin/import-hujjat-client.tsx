"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImportNatijaJadvali } from "@/components/admin/import-natija-jadvali";
import {
  wordFayliniTahlilQilish,
  pdfFayliniTahlilQilish,
  type ImportQatori,
} from "@/lib/actions/import";
import { royxatdanItemlar } from "@/lib/utils/select-items";
import type { Mavzu } from "@/lib/actions/spravochniklar";

interface Nomlangan {
  id: number;
  nomi: string;
}

/**
 * Word (.docx) va PDF import ekranlari deyarli bir xil (fan/sinf/mavzu
 * tanlash, fayl yuklash, ko'rib chiqish jadvali) — faqat qabul qilingan
 * kengaytma va chaqiriladigan server action farq qiladi, shu sababli
 * ikkalasi ham shu bitta komponentdan foydalanadi (smart-test.md 7-bo'lim).
 */
export function ImportHujjatClient({
  turi,
  fanlar,
  sinflar,
  mavzular,
}: {
  turi: "word" | "pdf";
  fanlar: Nomlangan[];
  sinflar: Nomlangan[];
  mavzular: Mavzu[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fanId, setFanId] = useState("");
  const [sinfId, setSinfId] = useState("");
  const [mavzuId, setMavzuId] = useState("");
  const [agarJavobYoqBolsaA, setAgarJavobYoqBolsaA] = useState(false);
  const [tahlilQilinmoqda, setTahlilQilinmoqda] = useState(false);
  const [faylNomi, setFaylNomi] = useState<string | null>(null);
  const [qatorlar, setQatorlar] = useState<ImportQatori[] | null>(null);

  const filtrlanganMavzular = useMemo(
    () => mavzular.filter((m) => String(m.fan_id) === fanId && String(m.sinf_id) === sinfId),
    [mavzular, fanId, sinfId],
  );

  async function faylTanlandi() {
    const fayl = inputRef.current?.files?.[0];
    if (!fayl) return;
    if (!fanId || !sinfId) {
      toast.error("Avval fan va sinfni tanlang");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setTahlilQilinmoqda(true);
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const tahlilQilish = turi === "word" ? wordFayliniTahlilQilish : pdfFayliniTahlilQilish;
      const natija = await tahlilQilish(
        formData,
        Number(fanId),
        Number(sinfId),
        mavzuId ? Number(mavzuId) : null,
        agarJavobYoqBolsaA,
      );
      if (natija.xato) {
        toast.error(natija.xato);
        return;
      }
      setFaylNomi(fayl.name);
      setQatorlar(natija.qatorlar ?? []);
    } finally {
      setTahlilQilinmoqda(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function yangiFaylTanlash() {
    setQatorlar(null);
    setFaylNomi(null);
  }

  if (qatorlar && faylNomi) {
    return (
      <ImportNatijaJadvali
        turi={turi}
        faylNomi={faylNomi}
        qatorlar={qatorlar}
        yangiFaylTanlash={yangiFaylTanlash}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Format qat&apos;iy: <code>1. Savol matni</code>, keyingi qatorlarda{" "}
        <code>A) variant</code> … <code>D) variant</code>, so&apos;ngida{" "}
        <code>Javob: B</code> va ixtiyoriy <code>Izoh: ...</code> (bir necha qatorli bo&apos;lishi
        mumkin — Smart Test modulida ishlatiladi).{" "}
        {turi === "word" ? "Word" : "PDF"} faylida fan/sinf/mavzu ko&apos;rsatilmaydi — shuning
        uchun yuklashdan oldin shu yerda tanlanadi.
        {turi === "pdf" && (
          <>
            {" "}
            PDF&apos;dan matn ajratish Word&apos;ga qaraganda ancha ishonchsiz — imkon bo&apos;lsa
            Word fayl tavsiya etiladi.
          </>
        )}
      </p>

      <div className="flex items-center gap-2">
        <Checkbox
          id="agar-javob-yoq-bolsa-a"
          checked={agarJavobYoqBolsaA}
          onCheckedChange={(v) => setAgarJavobYoqBolsaA(Boolean(v))}
        />
        <Label htmlFor="agar-javob-yoq-bolsa-a" className="font-normal">
          &quot;Javob:&quot; qatori bo&apos;lmasa, A variantni to&apos;g&apos;ri deb hisobla
        </Label>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <Label>Fan</Label>
          <Select
            value={fanId}
            onValueChange={(v) => {
              setFanId(v ?? "");
              setMavzuId("");
            }}
            items={royxatdanItemlar(fanlar)}
          >
            <SelectTrigger className="w-40">
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
            value={sinfId}
            onValueChange={(v) => {
              setSinfId(v ?? "");
              setMavzuId("");
            }}
            items={royxatdanItemlar(sinflar)}
          >
            <SelectTrigger className="w-32">
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

        <div className="flex flex-col gap-1">
          <Label>Mavzu (ixtiyoriy)</Label>
          <Select
            value={mavzuId || "yoq"}
            onValueChange={(v) => setMavzuId(!v || v === "yoq" ? "" : v)}
            items={royxatdanItemlar(filtrlanganMavzular, { yoq: "— Mavzusiz —" })}
          >
            <SelectTrigger className="w-48">
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
      </div>

      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="file"
          accept={turi === "word" ? ".docx" : ".pdf"}
          className="max-w-xs"
          onChange={faylTanlandi}
          disabled={tahlilQilinmoqda}
        />
        {tahlilQilinmoqda && <span className="text-sm text-muted-foreground">Tahlil qilinmoqda...</span>}
      </div>
    </div>
  );
}
