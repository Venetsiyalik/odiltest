"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SavolForma } from "@/components/admin/savol-form";
import {
  savollarniOl,
  savolStatistikalariniOl,
  savolQoshish,
  savolTahrirlash,
  savolOchirish,
  savollarniOmmaviyOchirish,
  savollarniOmmaviyMavzuOzgartirish,
  savollarniOmmaviyFaolsizlantirish,
  type Savol,
  type SavolStatistika,
  type SavollarFiltri,
} from "@/lib/actions/savollar";
import type { Mavzu } from "@/lib/actions/spravochniklar";
import { royxatdanItemlar } from "@/lib/utils/select-items";

interface Nomlangan {
  id: number;
  nomi: string;
}

const HAMMASI = "hammasi";

export function SavollarClient({
  boshlangichSavollar,
  boshlangichStatistika,
  fanlar,
  sinflar,
  mavzular,
}: {
  boshlangichSavollar: Savol[];
  boshlangichStatistika: SavolStatistika[];
  fanlar: Nomlangan[];
  sinflar: Nomlangan[];
  mavzular: Mavzu[];
}) {
  const [savollar, setSavollar] = useState(boshlangichSavollar);
  const [statistika, setStatistika] = useState(boshlangichStatistika);
  const [fanId, setFanId] = useState(HAMMASI);
  const [sinfId, setSinfId] = useState(HAMMASI);
  const [mavzuId, setMavzuId] = useState(HAMMASI);
  const [qiyinlik, setQiyinlik] = useState(HAMMASI);
  const [matn, setMatn] = useState("");
  const [tanlanganlar, setTanlanganlar] = useState<Set<number>>(new Set());
  const [formaOchiq, setFormaOchiq] = useState(false);
  const [tahrirlanayotgan, setTahrirlanayotgan] = useState<Savol | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const statistikaXaritasi = useMemo(() => {
    const xarita = new Map<number, SavolStatistika>();
    for (const s of statistika) xarita.set(s.savolId, s);
    return xarita;
  }, [statistika]);

  const mavzuYorliqlari = useMemo(
    () =>
      Object.fromEntries(
        mavzular.map((m) => [String(m.id), `${m.fanlar?.nomi} / ${m.sinflar?.nomi} — ${m.nomi}`]),
      ),
    [mavzular],
  );

  function qidirish() {
    const filtr: SavollarFiltri = {
      fanId: fanId !== HAMMASI ? Number(fanId) : undefined,
      sinfId: sinfId !== HAMMASI ? Number(sinfId) : undefined,
      mavzuId: mavzuId !== HAMMASI ? Number(mavzuId) : undefined,
      qiyinlik: qiyinlik !== HAMMASI ? Number(qiyinlik) : undefined,
      matn: matn || undefined,
    };
    startTransition(async () => {
      const natija = await savollarniOl(filtr);
      setSavollar(natija);
      setTanlanganlar(new Set());
      setStatistika(await savolStatistikalariniOl(natija.map((s) => s.id)));
    });
  }

  function qatorniBelgilash(id: number, belgilangan: boolean) {
    setTanlanganlar((oldin) => {
      const yangi = new Set(oldin);
      if (belgilangan) yangi.add(id);
      else yangi.delete(id);
      return yangi;
    });
  }

  function hammasiniBelgilash(belgilangan: boolean) {
    setTanlanganlar(belgilangan ? new Set(savollar.map((s) => s.id)) : new Set());
  }

  function ommaviyOchirish() {
    startTransition(async () => {
      const natija = await savollarniOmmaviyOchirish(Array.from(tanlanganlar));
      if (natija.xato) {
        toast.error(natija.xato);
      } else {
        setSavollar((oldin) => oldin.filter((s) => !tanlanganlar.has(s.id)));
        setTanlanganlar(new Set());
        toast.success("O'chirildi");
      }
    });
  }

  function ommaviyFaolsizlantirish(faol: boolean) {
    startTransition(async () => {
      const natija = await savollarniOmmaviyFaolsizlantirish(Array.from(tanlanganlar), faol);
      if (natija.xato) {
        toast.error(natija.xato);
      } else {
        setSavollar((oldin) =>
          oldin.map((s) => (tanlanganlar.has(s.id) ? { ...s, faol } : s)),
        );
        toast.success("Yangilandi");
      }
    });
  }

  function ommaviyMavzuOzgartirish(mavzuIdQiymati: string | null) {
    const yangiMavzuId =
      !mavzuIdQiymati || mavzuIdQiymati === "yoq" ? null : Number(mavzuIdQiymati);
    startTransition(async () => {
      const natija = await savollarniOmmaviyMavzuOzgartirish(
        Array.from(tanlanganlar),
        yangiMavzuId,
      );
      if (natija.xato) {
        toast.error(natija.xato);
      } else {
        toast.success("Mavzu yangilandi");
        qidirish();
      }
    });
  }

  function ochirish(id: number) {
    startTransition(async () => {
      const natija = await savolOchirish(id);
      if (natija.xato) {
        toast.error(natija.xato);
      } else {
        setSavollar((oldin) => oldin.filter((s) => s.id !== id));
        toast.success("O'chirildi");
      }
    });
  }

  function formaniYopish() {
    setFormaOchiq(false);
    setTahrirlanayotgan(undefined);
    qidirish();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2">
        <Select
          value={fanId}
          onValueChange={(v) => setFanId(v ?? HAMMASI)}
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
          onValueChange={(v) => setSinfId(v ?? HAMMASI)}
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
          value={mavzuId}
          onValueChange={(v) => setMavzuId(v ?? HAMMASI)}
          items={{ [HAMMASI]: "Barcha mavzular", ...mavzuYorliqlari }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Mavzu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={HAMMASI}>Barcha mavzular</SelectItem>
            {mavzular.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                {m.fanlar?.nomi} / {m.sinflar?.nomi} — {m.nomi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={qiyinlik}
          onValueChange={(v) => setQiyinlik(v ?? HAMMASI)}
          items={{ [HAMMASI]: "Har qanday", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5" }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Qiyinlik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={HAMMASI}>Har qanday</SelectItem>
            {[1, 2, 3, 4, 5].map((q) => (
              <SelectItem key={q} value={String(q)}>
                {q}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          className="w-56"
          placeholder="Matn bo'yicha qidirish"
          value={matn}
          onChange={(e) => setMatn(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") qidirish();
          }}
        />

        <Button variant="outline" onClick={qidirish} disabled={isPending}>
          Qidirish
        </Button>

        <div className="grow" />

        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/savollar/import" />}
        >
          Import qilish
        </Button>
        <Button
          onClick={() => {
            setTahrirlanayotgan(undefined);
            setFormaOchiq(true);
          }}
        >
          Yangi savol
        </Button>
      </div>

      {tanlanganlar.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/50 p-3">
          <span className="text-sm">{tanlanganlar.size} ta savol tanlandi</span>
          <Select
            onValueChange={ommaviyMavzuOzgartirish}
            items={{ yoq: "— Mavzusiz —", ...mavzuYorliqlari }}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Mavzuni o'zgartirish" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yoq">— Mavzusiz —</SelectItem>
              {mavzular.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.fanlar?.nomi} / {m.sinflar?.nomi} — {m.nomi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => ommaviyFaolsizlantirish(false)}>
            Nofaol qilish
          </Button>
          <Button variant="outline" size="sm" onClick={() => ommaviyFaolsizlantirish(true)}>
            Faollashtirish
          </Button>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
              O&apos;chirish
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Rostdan o&apos;chirilsinmi?</AlertDialogTitle>
                <AlertDialogDescription>
                  {tanlanganlar.size} ta savol butunlay o&apos;chib ketadi.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                <AlertDialogAction onClick={ommaviyOchirish}>O&apos;chirish</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={tanlanganlar.size > 0 && tanlanganlar.size === savollar.length}
                onCheckedChange={(v) => hammasiniBelgilash(Boolean(v))}
              />
            </TableHead>
            <TableHead>Savol</TableHead>
            <TableHead>Fan / Sinf / Mavzu</TableHead>
            <TableHead>Qiyinlik</TableHead>
            <TableHead>Statistika</TableHead>
            <TableHead>Holati</TableHead>
            <TableHead className="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {savollar.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Savol topilmadi
              </TableCell>
            </TableRow>
          )}
          {savollar.map((s) => {
            const stat = statistikaXaritasi.get(s.id);
            return (
              <TableRow key={s.id}>
                <TableCell>
                  <Checkbox
                    checked={tanlanganlar.has(s.id)}
                    onCheckedChange={(v) => qatorniBelgilash(s.id, Boolean(v))}
                  />
                </TableCell>
                <TableCell className="max-w-xs truncate" title={s.matn}>
                  {s.matn}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {s.fanlar?.nomi} / {s.sinflar?.nomi}
                  {s.mavzular ? ` / ${s.mavzular.nomi}` : ""}
                </TableCell>
                <TableCell>{s.qiyinlik}</TableCell>
                <TableCell className="text-sm">
                  {stat
                    ? `${Math.round((stat.togriUrinish / stat.jamiUrinish) * 100)}% (${stat.jamiUrinish} urinish)`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={s.faol ? "default" : "secondary"}>
                    {s.faol ? "Faol" : "Nofaol"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTahrirlanayotgan(s);
                        setFormaOchiq(true);
                      }}
                    >
                      Tahrirlash
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
                        O&apos;chirish
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Rostdan o&apos;chirilsinmi?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                          <AlertDialogAction onClick={() => ochirish(s.id)}>
                            O&apos;chirish
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog
        open={formaOchiq}
        onOpenChange={(ochiq) => {
          setFormaOchiq(ochiq);
          if (!ochiq) setTahrirlanayotgan(undefined);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tahrirlanayotgan ? "Savolni tahrirlash" : "Yangi savol"}</DialogTitle>
          </DialogHeader>
          <SavolForma
            mavjudSavol={tahrirlanayotgan}
            fanlar={fanlar}
            sinflar={sinflar}
            mavzular={mavzular}
            saqlash={(qiymatlar) =>
              tahrirlanayotgan
                ? savolTahrirlash(tahrirlanayotgan.id, qiymatlar)
                : savolQoshish(qiymatlar)
            }
            yopish={formaniYopish}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
