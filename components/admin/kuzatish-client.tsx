"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sanaVaVaqtFormat } from "@/lib/utils/sana";
import { jonliKuzatishniOl, type JonliOquvchiHolati } from "@/lib/actions/kuzatish";

const YANGILANISH_ORALIGI_MS = 4000;

const HOLATI_YORLIQ: Record<
  JonliOquvchiHolati["holati"],
  { matn: string; variant: "default" | "secondary" | "destructive" }
> = {
  boshlamagan: { matn: "Boshlamagan", variant: "secondary" },
  jarayonda: { matn: "Jarayonda", variant: "default" },
  tugallangan: { matn: "Tugatgan", variant: "secondary" },
  vaqt_tugadi: { matn: "Vaqt tugadi", variant: "destructive" },
};

export function KuzatishClient({
  testId,
  boshlangich,
}: {
  testId: number;
  boshlangich: JonliOquvchiHolati[];
}) {
  const [royxat, setRoyxat] = useState(boshlangich);
  const [oxirgiYangilanish, setOxirgiYangilanish] = useState(() => new Date());

  useEffect(() => {
    let toxtatildi = false;

    const oraliq = setInterval(async () => {
      try {
        const yangi = await jonliKuzatishniOl(testId);
        if (!toxtatildi) {
          setRoyxat(yangi);
          setOxirgiYangilanish(new Date());
        }
      } catch {
        // vaqtinchalik tarmoq xatosi — keyingi urinishda yangilanadi
      }
    }, YANGILANISH_ORALIGI_MS);

    return () => {
      toxtatildi = true;
      clearInterval(oraliq);
    };
  }, [testId]);

  const jamiSoni = royxat.length;
  const jarayondaSoni = royxat.filter((o) => o.holati === "jarayonda").length;
  const tugatganSoni = royxat.filter((o) => o.holati === "tugallangan" || o.holati === "vaqt_tugadi").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4 rounded-md border bg-muted/50 p-3 text-sm">
        <span>Jami o&apos;quvchi: {jamiSoni}</span>
        <span>Jarayonda: {jarayondaSoni}</span>
        <span>Tugatgan: {tugatganSoni}</span>
        <span className="text-muted-foreground">
          Yangilandi: {sanaVaVaqtFormat(oxirgiYangilanish.toISOString())}
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>O&apos;quvchi</TableHead>
            <TableHead>Holati</TableHead>
            <TableHead>Javob berilgan</TableHead>
            <TableHead>Natija</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {royxat.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Bu sinfda faol o&apos;quvchi topilmadi
              </TableCell>
            </TableRow>
          )}
          {royxat.map((o) => (
            <TableRow key={o.oquvchiId}>
              <TableCell>{o.ismFamiliya}</TableCell>
              <TableCell>
                <Badge variant={HOLATI_YORLIQ[o.holati].variant}>{HOLATI_YORLIQ[o.holati].matn}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {o.holati === "boshlamagan" ? "—" : `${o.javobBerilganSoni}/${o.jamiSavol}`}
              </TableCell>
              <TableCell>{o.ballFoiz !== null ? `${Math.round(o.ballFoiz)}% · ${o.baho}` : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
