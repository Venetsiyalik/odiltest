"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { Mavzu } from "@/lib/actions/spravochniklar";
import { royxatdanItemlar } from "@/lib/utils/select-items";

interface ActionNatija {
  xato?: string;
}

interface Nomlangan {
  id: number;
  nomi: string;
}

export function MavzularRoyxat({
  mavzular,
  fanlar,
  sinflar,
  qoshish,
  ochirish,
}: {
  mavzular: Mavzu[];
  fanlar: Nomlangan[];
  sinflar: Nomlangan[];
  qoshish: (qiymatlar: {
    nomi: string;
    fanId: number;
    sinfId: number;
    tartib?: number;
  }) => Promise<ActionNatija>;
  ochirish: (id: number) => Promise<ActionNatija>;
}) {
  const router = useRouter();
  const [nomi, setNomi] = useState("");
  const [fanId, setFanId] = useState<string>("");
  const [sinfId, setSinfId] = useState<string>("");
  const [tartib, setTartib] = useState("0");
  const [isPending, startTransition] = useTransition();

  function qoshishBosildi() {
    if (!nomi.trim() || !fanId || !sinfId) {
      toast.error("Mavzu nomi, fan va sinfni tanlang");
      return;
    }
    startTransition(async () => {
      const natija = await qoshish({
        nomi,
        fanId: Number(fanId),
        sinfId: Number(sinfId),
        tartib: Number(tartib) || 0,
      });
      if (natija.xato) {
        toast.error(natija.xato);
      } else {
        setNomi("");
        setTartib("0");
        toast.success("Qo'shildi");
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
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Fan</span>
          <Select
            value={fanId}
            onValueChange={(v) => setFanId(v ?? "")}
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
          <span className="text-xs text-muted-foreground">Sinf</span>
          <Select
            value={sinfId}
            onValueChange={(v) => setSinfId(v ?? "")}
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
          <span className="text-xs text-muted-foreground">Mavzu nomi</span>
          <Input
            className="w-56"
            value={nomi}
            onChange={(e) => setNomi(e.target.value)}
            placeholder="Masalan: Kompyuter tuzilishi"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Tartib</span>
          <Input
            className="w-20"
            type="number"
            min={0}
            value={tartib}
            onChange={(e) => setTartib(e.target.value)}
          />
        </div>

        <Button onClick={qoshishBosildi} disabled={isPending}>
          Qo&apos;shish
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mavzu</TableHead>
            <TableHead>Fan</TableHead>
            <TableHead>Sinf</TableHead>
            <TableHead>Tartib</TableHead>
            <TableHead className="w-24 text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mavzular.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Hali hech qanday mavzu qo&apos;shilmagan
              </TableCell>
            </TableRow>
          )}
          {mavzular.map((mavzu) => (
            <TableRow key={mavzu.id}>
              <TableCell>{mavzu.nomi}</TableCell>
              <TableCell>{mavzu.fanlar?.nomi}</TableCell>
              <TableCell>{mavzu.sinflar?.nomi}</TableCell>
              <TableCell>{mavzu.tartib}</TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
                    O&apos;chirish
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Rostdan o&apos;chirilsinmi?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &quot;{mavzu.nomi}&quot; mavzusi va unga bog&apos;liq barcha dars
                        materiallari o&apos;chiriladi. Bog&apos;liq savollarda esa mavzu
                        maydoni bo&apos;shatiladi.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                      <AlertDialogAction onClick={() => ochirishBosildi(mavzu.id)}>
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
