"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  oquvchiQoshish,
  oquvchiTahrirlash,
  oquvchiFaollikniOzgartirish,
  kodniQaytaGeneratsiyaQilish,
  oquvchiOchirish,
  type Oquvchi,
} from "@/lib/actions/oquvchilar";
import { royxatdanItemlar } from "@/lib/utils/select-items";

interface Sinf {
  id: number;
  nomi: string;
}

const HAMMA_SINF = "hammasi";

export function OquvchilarClient({
  oquvchilar,
  sinflar,
}: {
  oquvchilar: Oquvchi[];
  sinflar: Sinf[];
}) {
  const router = useRouter();
  const [sinfFiltri, setSinfFiltri] = useState<string>(HAMMA_SINF);
  const [qoshishOchiq, setQoshishOchiq] = useState(false);
  const [yangiIsm, setYangiIsm] = useState("");
  const [yangiSinfId, setYangiSinfId] = useState("");
  const [tahrirlanayotgan, setTahrirlanayotgan] = useState<Oquvchi | null>(null);
  const [tahrirIsm, setTahrirIsm] = useState("");
  const [tahrirSinfId, setTahrirSinfId] = useState("");
  const [isPending, startTransition] = useTransition();

  const korsatilayotgan = useMemo(
    () =>
      sinfFiltri === HAMMA_SINF
        ? oquvchilar
        : oquvchilar.filter((o) => String(o.sinf_id) === sinfFiltri),
    [oquvchilar, sinfFiltri],
  );

  function qoshishBosildi() {
    if (!yangiIsm.trim() || !yangiSinfId) {
      toast.error("Ism-familiya va sinfni kiriting");
      return;
    }
    startTransition(async () => {
      const natija = await oquvchiQoshish({ ismFamiliya: yangiIsm, sinfId: Number(yangiSinfId) });
      if (natija.xato) {
        toast.error(natija.xato);
      } else {
        setYangiIsm("");
        setYangiSinfId("");
        setQoshishOchiq(false);
        toast.success("O'quvchi qo'shildi");
        router.refresh();
      }
    });
  }

  function tahrirlashniSaqlash() {
    if (!tahrirlanayotgan) return;
    startTransition(async () => {
      const natija = await oquvchiTahrirlash(tahrirlanayotgan.id, {
        ismFamiliya: tahrirIsm,
        sinfId: Number(tahrirSinfId),
      });
      if (natija.xato) {
        toast.error(natija.xato);
      } else {
        setTahrirlanayotgan(null);
        toast.success("Saqlandi");
        router.refresh();
      }
    });
  }

  function faollikniOzgartirish(o: Oquvchi) {
    startTransition(async () => {
      const natija = await oquvchiFaollikniOzgartirish(o.id, !o.faol);
      if (natija.xato) toast.error(natija.xato);
      else router.refresh();
    });
  }

  function kodniYangilash(id: number) {
    startTransition(async () => {
      const natija = await kodniQaytaGeneratsiyaQilish(id);
      if (natija.xato) {
        toast.error(natija.xato);
      } else {
        toast.success("Yangi kod yaratildi");
        router.refresh();
      }
    });
  }

  function ochirishBosildi(id: number) {
    startTransition(async () => {
      const natija = await oquvchiOchirish(id);
      if (natija.xato) toast.error(natija.xato);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Select
          value={sinfFiltri}
          onValueChange={(v) => setSinfFiltri(v ?? HAMMA_SINF)}
          items={royxatdanItemlar(sinflar, { [HAMMA_SINF]: "Barcha sinflar" })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sinf bo'yicha filtr" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={HAMMA_SINF}>Barcha sinflar</SelectItem>
            {sinflar.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.nomi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {sinfFiltri !== HAMMA_SINF && (
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={`/api/hisobot/pdf/kodlar?sinfId=${sinfFiltri}`} />}
          >
            Kirish kodlari (PDF)
          </Button>
        )}

        <Dialog open={qoshishOchiq} onOpenChange={setQoshishOchiq}>
          <DialogTrigger render={<Button />}>Yangi o&apos;quvchi qo&apos;shish</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi o&apos;quvchi</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Ism Familiya"
                value={yangiIsm}
                onChange={(e) => setYangiIsm(e.target.value)}
              />
              <Select
                value={yangiSinfId}
                onValueChange={(v) => setYangiSinfId(v ?? "")}
                items={royxatdanItemlar(sinflar)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sinfni tanlang" />
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
            <DialogFooter>
              <Button onClick={qoshishBosildi} disabled={isPending}>
                Qo&apos;shish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ism Familiya</TableHead>
            <TableHead>Sinf</TableHead>
            <TableHead>Kirish kodi</TableHead>
            <TableHead>Holati</TableHead>
            <TableHead className="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {korsatilayotgan.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                O&apos;quvchi topilmadi
              </TableCell>
            </TableRow>
          )}
          {korsatilayotgan.map((o) => (
            <TableRow key={o.id}>
              <TableCell>{o.ism_familiya}</TableCell>
              <TableCell>{o.sinflar?.nomi}</TableCell>
              <TableCell className="font-mono">{o.kirish_kodi}</TableCell>
              <TableCell>
                <Badge variant={o.faol ? "default" : "secondary"}>
                  {o.faol ? "Faol" : "Nofaol"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Dialog
                    open={tahrirlanayotgan?.id === o.id}
                    onOpenChange={(ochiq) => {
                      if (ochiq) {
                        setTahrirlanayotgan(o);
                        setTahrirIsm(o.ism_familiya);
                        setTahrirSinfId(String(o.sinf_id));
                      } else {
                        setTahrirlanayotgan(null);
                      }
                    }}
                  >
                    <DialogTrigger render={<Button variant="outline" size="sm" />}>
                      Tahrirlash
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>O&apos;quvchini tahrirlash</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col gap-3">
                        <Input value={tahrirIsm} onChange={(e) => setTahrirIsm(e.target.value)} />
                        <Select
                          value={tahrirSinfId}
                          onValueChange={(v) => setTahrirSinfId(v ?? "")}
                          items={royxatdanItemlar(sinflar)}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                      <DialogFooter>
                        <Button onClick={tahrirlashniSaqlash} disabled={isPending}>
                          Saqlash
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" onClick={() => kodniYangilash(o.id)}>
                    Kodni yangilash
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => faollikniOzgartirish(o)}>
                    {o.faol ? "Nofaol qilish" : "Faollashtirish"}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
                      O&apos;chirish
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Rostdan o&apos;chirilsinmi?</AlertDialogTitle>
                        <AlertDialogDescription>
                          &quot;{o.ism_familiya}&quot; va uning barcha natijalari butunlay
                          o&apos;chib ketadi. Buning o&apos;rniga &quot;Nofaol qilish&quot;ni
                          ko&apos;rib chiqing.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                        <AlertDialogAction onClick={() => ochirishBosildi(o.id)}>
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
    </div>
  );
}
