"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { royxatdanItemlar } from "@/lib/utils/select-items";
import { sanaVaVaqtFormat } from "@/lib/utils/sana";
import {
  natijalarniOl,
  engQiyinSavollarniOl,
  type NatijaQatori,
  type NatijalarFiltri,
  type QiyinSavol,
} from "@/lib/actions/natijalar";
import type { Test } from "@/lib/actions/testlar";

interface Nomlangan {
  id: number;
  nomi: string;
}

const HAMMASI = "hammasi";

export function NatijalarClient({
  boshlangichNatijalar,
  boshlangichQiyinSavollar,
  fanlar,
  sinflar,
  testlar,
}: {
  boshlangichNatijalar: NatijaQatori[];
  boshlangichQiyinSavollar: QiyinSavol[];
  fanlar: Nomlangan[];
  sinflar: Nomlangan[];
  testlar: Test[];
}) {
  const [natijalar, setNatijalar] = useState(boshlangichNatijalar);
  const [qiyinSavollar, setQiyinSavollar] = useState(boshlangichQiyinSavollar);
  const [fanId, setFanId] = useState(HAMMASI);
  const [sinfId, setSinfId] = useState(HAMMASI);
  const [testId, setTestId] = useState(HAMMASI);
  const [oquvchiIsm, setOquvchiIsm] = useState("");
  const [sanaBoshlanish, setSanaBoshlanish] = useState("");
  const [sanaTugash, setSanaTugash] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtrlanganTestlar = useMemo(
    () =>
      testlar.filter(
        (t) => (fanId === HAMMASI || String(t.fan_id) === fanId) && (sinfId === HAMMASI || String(t.sinf_id) === sinfId),
      ),
    [testlar, fanId, sinfId],
  );

  const korsatilayotganNatijalar = useMemo(
    () =>
      oquvchiIsm.trim()
        ? natijalar.filter((n) => n.oquvchiIsmFamiliya.toLowerCase().includes(oquvchiIsm.trim().toLowerCase()))
        : natijalar,
    [natijalar, oquvchiIsm],
  );

  function qidirish() {
    const filtr: NatijalarFiltri = {
      fanId: fanId !== HAMMASI ? Number(fanId) : undefined,
      sinfId: sinfId !== HAMMASI ? Number(sinfId) : undefined,
      testId: testId !== HAMMASI ? Number(testId) : undefined,
      sanaBoshlanish: sanaBoshlanish ? new Date(sanaBoshlanish).toISOString() : undefined,
      sanaTugash: sanaTugash ? new Date(sanaTugash).toISOString() : undefined,
    };
    startTransition(async () => {
      const yangiNatijalar = await natijalarniOl(filtr);
      setNatijalar(yangiNatijalar);
      setQiyinSavollar(await engQiyinSavollarniOl(yangiNatijalar.map((n) => n.urinishId)));
    });
  }

  const ortachaFoiz =
    korsatilayotganNatijalar.length > 0
      ? Math.round(
          korsatilayotganNatijalar.reduce((y, n) => y + (n.ballFoiz ?? 0), 0) /
            korsatilayotganNatijalar.length,
        )
      : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2">
        <Select
          value={fanId}
          onValueChange={(v) => {
            setFanId(v ?? HAMMASI);
            setTestId(HAMMASI);
          }}
          items={royxatdanItemlar(fanlar, { [HAMMASI]: "Barcha fanlar" })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Fan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={HAMMASI}>Barcha fanlar</SelectItem>
            {fanlar.map((f) => (
              <SelectItem key={f.id} value={String(f.id)}>
                {f.nomi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sinfId}
          onValueChange={(v) => {
            setSinfId(v ?? HAMMASI);
            setTestId(HAMMASI);
          }}
          items={royxatdanItemlar(sinflar, { [HAMMASI]: "Barcha sinflar" })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sinf" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={HAMMASI}>Barcha sinflar</SelectItem>
            {sinflar.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.nomi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={testId}
          onValueChange={(v) => setTestId(v ?? HAMMASI)}
          items={royxatdanItemlar(filtrlanganTestlar, { [HAMMASI]: "Barcha testlar" })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={HAMMASI}>Barcha testlar</SelectItem>
            {filtrlanganTestlar.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.nomi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          className="w-40"
          type="date"
          value={sanaBoshlanish}
          onChange={(e) => setSanaBoshlanish(e.target.value)}
        />
        <Input
          className="w-40"
          type="date"
          value={sanaTugash}
          onChange={(e) => setSanaTugash(e.target.value)}
        />

        <Input
          className="w-48"
          placeholder="O'quvchi ismi"
          value={oquvchiIsm}
          onChange={(e) => setOquvchiIsm(e.target.value)}
        />

        <Button variant="outline" onClick={qidirish} disabled={isPending}>
          Qidirish
        </Button>

        {testId !== HAMMASI && (
          <Button
            nativeButton={false}
            render={<a href={`/api/hisobot/pdf/sinf?testId=${testId}`} />}
          >
            Sinf hisobotini PDF qilib yuklab olish
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-md border bg-muted/50 p-3 text-sm">
        <span>Jami natija: {korsatilayotganNatijalar.length}</span>
        <span>O&apos;rtacha: {ortachaFoiz}%</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>O&apos;quvchi</TableHead>
            <TableHead>Sinf</TableHead>
            <TableHead>Test</TableHead>
            <TableHead>Fan</TableHead>
            <TableHead>Sana</TableHead>
            <TableHead>Ball</TableHead>
            <TableHead>Foiz</TableHead>
            <TableHead>Baho</TableHead>
            <TableHead className="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {korsatilayotganNatijalar.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                Natija topilmadi
              </TableCell>
            </TableRow>
          )}
          {korsatilayotganNatijalar.map((n) => (
            <TableRow key={n.urinishId}>
              <TableCell>{n.oquvchiIsmFamiliya}</TableCell>
              <TableCell>{n.sinfNomi}</TableCell>
              <TableCell>{n.testNomi}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{n.fanNomi}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{sanaVaVaqtFormat(n.boshlandi)}</TableCell>
              <TableCell>
                {n.togriSoni ?? 0}/{n.jamiSavol}
              </TableCell>
              <TableCell>{Math.round(n.ballFoiz ?? 0)}%</TableCell>
              <TableCell>
                <Badge variant={n.baho && n.baho >= 4 ? "default" : "secondary"}>
                  {n.baho ?? "—"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<a href={`/api/hisobot/pdf/oquvchi?oquvchiId=${n.oquvchiId}`} />}
                >
                  Tabel (PDF)
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {qiyinSavollar.length > 0 && (
        <div className="flex flex-col gap-2 rounded-md border p-4">
          <h2 className="text-lg font-semibold">Eng ko&apos;p xato qilingan savollar</h2>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {qiyinSavollar.map((s) => (
              <li key={s.savolId}>
                &quot;{s.matn}&quot; — faqat {s.togriFoiz}% to&apos;g&apos;ri javob (
                {s.jamiUrinish} urinish)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
