"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { MaterialForma } from "@/components/admin/material-form";
import { royxatdanItemlar } from "@/lib/utils/select-items";
import {
  materiallarniOl,
  materialQoshish,
  materialTahrirlash,
  materialOchirish,
  type DarsMateriali,
} from "@/lib/actions/materiallar";
import type { Mavzu } from "@/lib/actions/spravochniklar";

interface Nomlangan {
  id: number;
  nomi: string;
}

const TURI_YORLIQ: Record<DarsMateriali["turi"], string> = {
  nazariya: "Nazariya",
  misol: "Misol",
  video: "Video",
};

export function MateriallarClient({
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
  const [materiallar, setMateriallar] = useState<DarsMateriali[]>([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [formaOchiq, setFormaOchiq] = useState(false);
  const [tahrirlanayotgan, setTahrirlanayotgan] = useState<DarsMateriali | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const filtrlanganMavzular = useMemo(
    () => mavzular.filter((m) => String(m.fan_id) === fanId && String(m.sinf_id) === sinfId),
    [mavzular, fanId, sinfId],
  );

  useEffect(() => {
    if (!mavzuId) {
      setMateriallar([]);
      return;
    }
    setYuklanmoqda(true);
    materiallarniOl(Number(mavzuId))
      .then(setMateriallar)
      .finally(() => setYuklanmoqda(false));
  }, [mavzuId]);

  function qaytaYuklash() {
    if (!mavzuId) return;
    materiallarniOl(Number(mavzuId)).then(setMateriallar);
  }

  function ochirish(id: number) {
    startTransition(async () => {
      const natija = await materialOchirish(id);
      if (natija.xato) toast.error(natija.xato);
      else {
        toast.success("O'chirildi");
        qaytaYuklash();
      }
    });
  }

  function formaniYopish() {
    setFormaOchiq(false);
    setTahrirlanayotgan(undefined);
    qaytaYuklash();
  }

  return (
    <div className="flex flex-col gap-4">
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

        <Select
          value={mavzuId}
          onValueChange={(v) => setMavzuId(v ?? "")}
          items={royxatdanItemlar(filtrlanganMavzular)}
        >
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
      ) : yuklanmoqda ? (
        <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Tartib</TableHead>
              <TableHead className="w-28">Turi</TableHead>
              <TableHead>Sarlavha</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materiallar.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Bu mavzu uchun hali material yo&apos;q
                </TableCell>
              </TableRow>
            )}
            {materiallar.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.tartib}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{TURI_YORLIQ[m.turi]}</Badge>
                </TableCell>
                <TableCell>{m.sarlavha}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTahrirlanayotgan(m);
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
                            &quot;{m.sarlavha}&quot; o&apos;chiriladi.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                          <AlertDialogAction disabled={isPending} onClick={() => ochirish(m.id)}>
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

      <Dialog open={formaOchiq} onOpenChange={(v) => (v ? setFormaOchiq(true) : formaniYopish())}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tahrirlanayotgan ? "Materialni tahrirlash" : "Yangi material"}</DialogTitle>
          </DialogHeader>
          {mavzuId && (
            <MaterialForma
              mavzuId={Number(mavzuId)}
              mavjudMaterial={tahrirlanayotgan}
              saqlash={(qiymatlar) =>
                tahrirlanayotgan
                  ? materialTahrirlash(tahrirlanayotgan.id, qiymatlar)
                  : materialQoshish(qiymatlar)
              }
              yopish={formaniYopish}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
