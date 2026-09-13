"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { KontentForma } from "@/components/admin/kontent-form";
import { royxatdanItemlar } from "@/lib/utils/select-items";
import {
  kontentlarniOl,
  kontentQoshish,
  kontentTahrirlash,
  kontentOchirish,
  mavzuBolimTavsifYangilash,
  type Kontent,
} from "@/lib/actions/kontent";
import type { Mavzu } from "@/lib/actions/spravochniklar";

interface Nomlangan {
  id: number;
  nomi: string;
}

const TURI_YORLIQ: Record<Kontent["turi"], string> = {
  maruza: "Ma'ruza",
  prezentatsiya: "Prezentatsiya",
  video: "Video",
  fayl: "Fayl",
};

export function KontentClient({
  fanlar,
  sinflar,
  mavzular,
}: {
  fanlar: Nomlangan[];
  sinflar: Nomlangan[];
  mavzular: Mavzu[];
}) {
  const [fanId, setFanId] = useState("");
  const [sinfId, setSinfId] = useState("");
  const [mavzuId, setMavzuId] = useState("");
  const [kontentlar, setKontentlar] = useState<Kontent[]>([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [formaOchiq, setFormaOchiq] = useState(false);
  const [tahrirlanayotgan, setTahrirlanayotgan] = useState<Kontent | undefined>(undefined);
  const [bolim, setBolim] = useState("");
  const [tavsif, setTavsif] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtrlanganMavzular = useMemo(
    // "baholash" turidagi mavzularga (BSB/ChSB) material biriktirilmaydi
    // (ishreja-import.md 3-bo'lim).
    () =>
      mavzular.filter(
        (m) => String(m.fan_id) === fanId && String(m.sinf_id) === sinfId && m.turi !== "baholash",
      ),
    [mavzular, fanId, sinfId],
  );

  const joriyMavzu = useMemo(() => mavzular.find((m) => String(m.id) === mavzuId), [mavzular, mavzuId]);

  useEffect(() => {
    setBolim(joriyMavzu?.bolim ?? "");
    setTavsif(joriyMavzu?.tavsif ?? "");
  }, [joriyMavzu]);

  useEffect(() => {
    if (!mavzuId) {
      setKontentlar([]);
      return;
    }
    setYuklanmoqda(true);
    kontentlarniOl(Number(mavzuId))
      .then(setKontentlar)
      .finally(() => setYuklanmoqda(false));
  }, [mavzuId]);

  function qaytaYuklash() {
    if (!mavzuId) return;
    kontentlarniOl(Number(mavzuId)).then(setKontentlar);
  }

  function ochirish(id: number) {
    startTransition(async () => {
      const natija = await kontentOchirish(id);
      if (natija.xato) toast.error(natija.xato);
      else {
        toast.success("O'chirildi");
        qaytaYuklash();
      }
    });
  }

  function bolimTavsifSaqlash() {
    if (!mavzuId) return;
    startTransition(async () => {
      const natija = await mavzuBolimTavsifYangilash(Number(mavzuId), {
        bolim: bolim || null,
        tavsif: tavsif || null,
      });
      if (natija.xato) toast.error(natija.xato);
      else toast.success("Saqlandi");
    });
  }

  function formaniYopish() {
    setFormaOchiq(false);
    setTahrirlanayotgan(undefined);
    qaytaYuklash();
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Bu bo&apos;lim Dashboard&apos;dagi yangi, <strong>kodsiz</strong> mavzu sahifalari uchun
        material boshqaradi (mavjud &quot;Materiallar&quot; bo&apos;limi — eski O&apos;rganish
        moduli uchun, alohida qoladi).
      </p>

      <div className="flex flex-wrap items-end gap-2">
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

        <Select value={mavzuId} onValueChange={(v) => setMavzuId(v ?? "")} items={royxatdanItemlar(filtrlanganMavzular)}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Mavzu tanlang" />
          </SelectTrigger>
          <SelectContent>
            {filtrlanganMavzular.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                {m.nomi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {mavzuId && (
          <Button
            onClick={() => {
              setTahrirlanayotgan(undefined);
              setFormaOchiq(true);
            }}
          >
            Yangi material
          </Button>
        )}
      </div>

      {!mavzuId ? (
        <p className="text-sm text-muted-foreground">
          Materiallarni ko&apos;rish uchun fan, sinf va mavzuni tanlang
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-2 rounded-md border p-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Bo&apos;lim (masalan &quot;1-chorak&quot;)</Label>
              <Input className="w-48" value={bolim} onChange={(e) => setBolim(e.target.value)} />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <Label className="text-xs">Mavzu tavsifi</Label>
              <Input value={tavsif} onChange={(e) => setTavsif(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" disabled={isPending} onClick={bolimTavsifSaqlash}>
              Saqlash
            </Button>
          </div>

          {yuklanmoqda ? (
            <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Tartib</TableHead>
                  <TableHead className="w-32">Turi</TableHead>
                  <TableHead>Sarlavha</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kontentlar.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Bu mavzu uchun hali material yo&apos;q
                    </TableCell>
                  </TableRow>
                )}
                {kontentlar.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell>{k.tartib}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{TURI_YORLIQ[k.turi]}</Badge>
                    </TableCell>
                    <TableCell>{k.sarlavha}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTahrirlanayotgan(k);
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
                              <AlertDialogDescription>
                                &quot;{k.sarlavha}&quot; o&apos;chiriladi.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                              <AlertDialogAction disabled={isPending} onClick={() => ochirish(k.id)}>
                                O&apos;chirish
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}

      <Dialog open={formaOchiq} onOpenChange={(v) => (v ? setFormaOchiq(true) : formaniYopish())}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tahrirlanayotgan ? "Materialni tahrirlash" : "Yangi material"}</DialogTitle>
          </DialogHeader>
          {mavzuId && (
            <KontentForma
              mavzuId={Number(mavzuId)}
              mavjudKontent={tahrirlanayotgan}
              saqlash={(qiymatlar) =>
                tahrirlanayotgan ? kontentTahrirlash(tahrirlanayotgan.id, qiymatlar) : kontentQoshish(qiymatlar)
              }
              yopish={formaniYopish}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
