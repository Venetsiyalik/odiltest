"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  importniTasdiqlash,
  type ImportQatori,
  type ImportTasdiqlashNatijasi,
  type ImportXatosi,
} from "@/lib/actions/import";

const HOLATI_YORLIQ: Record<ImportQatori["holati"], { matn: string; variant: "default" | "secondary" | "destructive" }> = {
  tayyor: { matn: "Tayyor", variant: "default" },
  ogohlantirish: { matn: "Ogohlantirish", variant: "secondary" },
  xato: { matn: "Xato", variant: "destructive" },
};

export function ImportNatijaJadvali({
  turi,
  faylNomi,
  qatorlar,
  yangiFaylTanlash,
}: {
  turi: "excel" | "word" | "pdf";
  faylNomi: string;
  qatorlar: ImportQatori[];
  yangiFaylTanlash: () => void;
}) {
  const [tanlanganlar, setTanlanganlar] = useState<Set<number>>(
    () => new Set(qatorlar.filter((q) => q.holati !== "xato").map((q) => q.tartib)),
  );
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [natija, setNatija] = useState<ImportTasdiqlashNatijasi | null>(null);

  const hisob = useMemo(() => {
    const tayyor = qatorlar.filter((q) => q.holati === "tayyor").length;
    const ogohlantirish = qatorlar.filter((q) => q.holati === "ogohlantirish").length;
    const xato = qatorlar.filter((q) => q.holati === "xato").length;
    const izohsiz = qatorlar.filter((q) => !q.izoh).length;
    return { tayyor, ogohlantirish, xato, izohsiz };
  }, [qatorlar]);

  function belgilash(tartib: number, holat: boolean) {
    setTanlanganlar((oldin) => {
      const yangi = new Set(oldin);
      if (holat) yangi.add(tartib);
      else yangi.delete(tartib);
      return yangi;
    });
  }

  async function saqlash() {
    setSaqlanmoqda(true);
    try {
      const tasdiqlangan = qatorlar.filter((q) => tanlanganlar.has(q.tartib));
      const chetlashtirilgan: ImportXatosi[] = qatorlar
        .filter((q) => !tanlanganlar.has(q.tartib))
        .map((q) => ({
          tartib: q.tartib,
          xabar: q.xabar ?? "admin tomonidan tashlab qo'yildi",
        }));

      const yakuniyNatija = await importniTasdiqlash(
        turi,
        faylNomi,
        qatorlar.length,
        tasdiqlangan,
        chetlashtirilgan,
      );
      setNatija(yakuniyNatija);
      toast.success("Import yakunlandi");
    } finally {
      setSaqlanmoqda(false);
    }
  }

  function xatolarniYuklabOlish() {
    if (!natija || natija.xatolar.length === 0) return;
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(
      natija.xatolar.map((x) => ({ "№": x.tartib, Xato: x.xabar })),
    );
    XLSX.utils.book_append_sheet(workbook, sheet, "Xatolar");
    XLSX.writeFile(workbook, "import-xatolari.xlsx");
  }

  if (natija) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border p-4">
        <h3 className="text-lg font-semibold">Import natijasi</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <span>Jami: {natija.jami} savol topildi</span>
          <span className="text-green-700">✅ Qabul qilindi: {natija.qabulQilindi}</span>
          <span className="text-destructive">⚠️ Xato: {natija.xatoSoni}</span>
        </div>
        {natija.xatolar.length > 0 && (
          <div className="flex flex-col gap-2">
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              {natija.xatolar.slice(0, 20).map((x, i) => (
                <li key={i}>
                  {x.tartib}-savol: {x.xabar}
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="w-fit" onClick={xatolarniYuklabOlish}>
              Xatolar ro&apos;yxatini Excel qilib yuklab olish
            </Button>
          </div>
        )}
        <Button onClick={yangiFaylTanlash} className="w-fit">
          Yana fayl yuklash
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span>Jami: {qatorlar.length} savol topildi</span>
        <span>✅ Tayyor: {hisob.tayyor}</span>
        <span>⚠️ Ogohlantirish: {hisob.ogohlantirish}</span>
        <span className="text-destructive">❌ Xato: {hisob.xato}</span>
      </div>
      {hisob.izohsiz > 0 && (
        <p className="text-sm text-muted-foreground">
          ⚠️ {hisob.izohsiz} ta savolda izoh yo&apos;q — ular Smart Testda tushuntirishsiz chiqadi
        </p>
      )}

      <div className="max-h-[50vh] overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="w-12">№</TableHead>
              <TableHead>Savol</TableHead>
              <TableHead>Fan / Sinf / Mavzu</TableHead>
              <TableHead>To&apos;g&apos;ri</TableHead>
              <TableHead>Izoh</TableHead>
              <TableHead>Holati</TableHead>
              <TableHead>Xabar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {qatorlar.map((q) => (
              <TableRow key={q.tartib}>
                <TableCell>
                  <Checkbox
                    checked={tanlanganlar.has(q.tartib)}
                    disabled={q.holati === "xato"}
                    onCheckedChange={(v) => belgilash(q.tartib, Boolean(v))}
                  />
                </TableCell>
                <TableCell>{q.tartib}</TableCell>
                <TableCell className="max-w-xs truncate" title={q.matn}>
                  {q.matn}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {q.fanNomi} / {q.sinfNomi}
                  {q.mavzuNomi ? ` / ${q.mavzuNomi}` : ""}
                </TableCell>
                <TableCell>{q.togriJavob}</TableCell>
                <TableCell className="text-sm">
                  {q.izoh ? `✓ ${q.izoh.length} belgi` : "⚠️ izoh yo'q"}
                </TableCell>
                <TableCell>
                  <Badge variant={HOLATI_YORLIQ[q.holati].variant}>
                    {HOLATI_YORLIQ[q.holati].matn}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground" title={q.xabar}>
                  {q.xabar ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-2">
        <Button onClick={saqlash} disabled={saqlanmoqda || tanlanganlar.size === 0}>
          {saqlanmoqda
            ? "Saqlanmoqda..."
            : `Tanlanganlarni saqlash (${tanlanganlar.size})`}
        </Button>
        <Button variant="outline" onClick={yangiFaylTanlash}>
          Bekor qilish
        </Button>
      </div>
    </div>
  );
}
