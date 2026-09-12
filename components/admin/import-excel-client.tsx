"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImportNatijaJadvali } from "@/components/admin/import-natija-jadvali";
import { excelFayliniTahlilQilish, shablonYuklabOlish, type ImportQatori } from "@/lib/actions/import";

function base64danYuklabOlish(base64: string, faylNomi: string) {
  const ikkilikMatn = atob(base64);
  const baytlar = new Uint8Array(ikkilikMatn.length);
  for (let i = 0; i < ikkilikMatn.length; i++) baytlar[i] = ikkilikMatn.charCodeAt(i);
  const blob = new Blob([baytlar], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const havola = document.createElement("a");
  havola.href = url;
  havola.download = faylNomi;
  havola.click();
  URL.revokeObjectURL(url);
}

export function ImportExcelClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tahlilQilinmoqda, setTahlilQilinmoqda] = useState(false);
  const [faylNomi, setFaylNomi] = useState<string | null>(null);
  const [qatorlar, setQatorlar] = useState<ImportQatori[] | null>(null);

  async function shablonniOlish() {
    const { base64, faylNomi: shablonNomi } = await shablonYuklabOlish();
    base64danYuklabOlish(base64, shablonNomi);
  }

  async function faylTanlandi() {
    const fayl = inputRef.current?.files?.[0];
    if (!fayl) return;

    setTahlilQilinmoqda(true);
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const natija = await excelFayliniTahlilQilish(formData);
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
        turi="excel"
        faylNomi={faylNomi}
        qatorlar={qatorlar}
        yangiFaylTanlash={yangiFaylTanlash}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Ustunlar: <code>savol, a, b, c, d, togri, fan, sinf, mavzu, qiyinlik, izoh</code>.{" "}
        <code>togri</code> ustuniga A/B/C/D (katta yoki kichik harf) yoziladi. Agar fan yoki mavzu
        bazada bo&apos;lmasa, tasdiqlagandan so&apos;ng avtomatik yaratiladi.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={shablonniOlish}>
          Shablonni yuklab olish
        </Button>
        <Input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="max-w-xs"
          onChange={faylTanlandi}
          disabled={tahlilQilinmoqda}
        />
        {tahlilQilinmoqda && <span className="text-sm text-muted-foreground">Tahlil qilinmoqda...</span>}
      </div>
    </div>
  );
}
