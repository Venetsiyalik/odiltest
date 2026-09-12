"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Element {
  id: number;
  nomi: string;
}

interface ActionNatija {
  xato?: string;
}

export function NomliRoyxat({
  sarlavha,
  qoshishYorligi,
  royxat,
  qoshish,
  tahrirlash,
  ochirish,
}: {
  sarlavha: string;
  qoshishYorligi: string;
  royxat: Element[];
  qoshish: (nomi: string) => Promise<ActionNatija>;
  tahrirlash: (id: number, nomi: string) => Promise<ActionNatija>;
  ochirish: (id: number) => Promise<ActionNatija>;
}) {
  const router = useRouter();
  const [yangiNomi, setYangiNomi] = useState("");
  const [tahrirlanayotgan, setTahrirlanayotgan] = useState<Element | null>(null);
  const [tahrirNomi, setTahrirNomi] = useState("");
  const [isPending, startTransition] = useTransition();

  function qoshishBosildi() {
    if (!yangiNomi.trim()) return;
    startTransition(async () => {
      const natija = await qoshish(yangiNomi);
      if (natija.xato) {
        toast.error(natija.xato);
      } else {
        setYangiNomi("");
        toast.success("Qo'shildi");
        router.refresh();
      }
    });
  }

  function tahrirlashniSaqlash() {
    if (!tahrirlanayotgan) return;
    startTransition(async () => {
      const natija = await tahrirlash(tahrirlanayotgan.id, tahrirNomi);
      if (natija.xato) {
        toast.error(natija.xato);
      } else {
        setTahrirlanayotgan(null);
        toast.success("Saqlandi");
        router.refresh();
      }
    });
  }

  function ochirishBosildi(id: number) {
    startTransition(async () => {
      const natija = await ochirish(id);
      if (natija.xato) {
        toast.error(natija.xato);
      } else {
        toast.success("O'chirildi");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          placeholder={qoshishYorligi}
          value={yangiNomi}
          onChange={(e) => setYangiNomi(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") qoshishBosildi();
          }}
        />
        <Button onClick={qoshishBosildi} disabled={isPending || !yangiNomi.trim()}>
          Qo&apos;shish
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{sarlavha}</TableHead>
            <TableHead className="w-32 text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {royxat.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground">
                Hali hech narsa qo&apos;shilmagan
              </TableCell>
            </TableRow>
          )}
          {royxat.map((element) => (
            <TableRow key={element.id}>
              <TableCell>{element.nomi}</TableCell>
              <TableCell className="flex justify-end gap-2">
                <Dialog
                  open={tahrirlanayotgan?.id === element.id}
                  onOpenChange={(ochiq) => {
                    if (ochiq) {
                      setTahrirlanayotgan(element);
                      setTahrirNomi(element.nomi);
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
                      <DialogTitle>Tahrirlash</DialogTitle>
                    </DialogHeader>
                    <Input
                      value={tahrirNomi}
                      onChange={(e) => setTahrirNomi(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") tahrirlashniSaqlash();
                      }}
                    />
                    <DialogFooter>
                      <Button onClick={tahrirlashniSaqlash} disabled={isPending}>
                        Saqlash
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
                    O&apos;chirish
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Rostdan o&apos;chirilsinmi?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &quot;{element.nomi}&quot; o&apos;chiriladi. Agar bunga bog&apos;liq
                        ma&apos;lumot (mavzu, savol, test, o&apos;quvchi) bo&apos;lsa, o&apos;chirish
                        rad etiladi.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                      <AlertDialogAction onClick={() => ochirishBosildi(element.id)}>
                        O&apos;chirish
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
