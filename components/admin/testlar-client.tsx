"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { TestForma } from "@/components/admin/test-form";
import {
  testQoshish,
  testTahrirlash,
  testHolatiniOzgartirish,
  testOchirish,
  testMavzuIdlariniOl,
  testSavolIdlariniOl,
  type Test,
} from "@/lib/actions/testlar";
import type { Mavzu } from "@/lib/actions/spravochniklar";
import type { Savol } from "@/lib/actions/savollar";

interface Nomlangan {
  id: number;
  nomi: string;
}

const HOLATI_YORLIQ: Record<Test["holati"], { matn: string; variant: "default" | "secondary" | "destructive" }> = {
  qoralama: { matn: "Qoralama", variant: "secondary" },
  faol: { matn: "Faol", variant: "default" },
  yopiq: { matn: "Yopiq", variant: "destructive" },
};

function sanaFormat(iso: string): string {
  return new Date(iso).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TestlarClient({
  testlar,
  fanlar,
  sinflar,
  mavzular,
  savollar,
}: {
  testlar: Test[];
  fanlar: Nomlangan[];
  sinflar: Nomlangan[];
  mavzular: Mavzu[];
  savollar: Savol[];
}) {
  const router = useRouter();
  const [formaOchiq, setFormaOchiq] = useState(false);
  const [tahrirlanayotgan, setTahrirlanayotgan] = useState<Test | undefined>(undefined);
  const [boshMavzuIdlar, setBoshMavzuIdlar] = useState<number[]>([]);
  const [boshSavolIdlar, setBoshSavolIdlar] = useState<number[]>([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function yangiTest() {
    setTahrirlanayotgan(undefined);
    setBoshMavzuIdlar([]);
    setBoshSavolIdlar([]);
    setFormaOchiq(true);
  }

  async function tahrirlash(test: Test) {
    setYuklanmoqda(true);
    try {
      const [mavzuIdlar, savolIdlar] = await Promise.all([
        testMavzuIdlariniOl(test.id),
        testSavolIdlariniOl(test.id),
      ]);
      setTahrirlanayotgan(test);
      setBoshMavzuIdlar(mavzuIdlar);
      setBoshSavolIdlar(savolIdlar);
      setFormaOchiq(true);
    } finally {
      setYuklanmoqda(false);
    }
  }

  function formaniYopish() {
    setFormaOchiq(false);
    setTahrirlanayotgan(undefined);
    router.refresh();
  }

  function holatiniOzgartirish(id: number, holati: Test["holati"]) {
    startTransition(async () => {
      const natija = await testHolatiniOzgartirish(id, holati);
      if (natija.xato) toast.error(natija.xato);
      else {
        toast.success("Holat yangilandi");
        router.refresh();
      }
    });
  }

  function ochirish(id: number) {
    startTransition(async () => {
      const natija = await testOchirish(id);
      if (natija.xato) toast.error(natija.xato);
      else {
        toast.success("O'chirildi");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={yangiTest} disabled={yuklanmoqda}>
          Yangi test
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nomi</TableHead>
            <TableHead>Fan / Sinf</TableHead>
            <TableHead>Ochiq oraliq</TableHead>
            <TableHead>Holati</TableHead>
            <TableHead className="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testlar.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Hali test yaratilmagan
              </TableCell>
            </TableRow>
          )}
          {testlar.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.nomi}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {t.fanlar?.nomi} / {t.sinflar?.nomi}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {sanaFormat(t.ochilish_vaqti)} — {sanaFormat(t.yopilish_vaqti)}
              </TableCell>
              <TableCell>
                <Badge variant={HOLATI_YORLIQ[t.holati].variant}>{HOLATI_YORLIQ[t.holati].matn}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => tahrirlash(t)}>
                    Tahrirlash
                  </Button>
                  {t.holati === "qoralama" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => holatiniOzgartirish(t.id, "faol")}
                    >
                      Faollashtirish
                    </Button>
                  )}
                  {t.holati === "faol" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => holatiniOzgartirish(t.id, "yopiq")}
                    >
                      Yopish
                    </Button>
                  )}
                  {t.holati === "yopiq" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => holatiniOzgartirish(t.id, "faol")}
                    >
                      Qayta ochish
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
                      O&apos;chirish
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Rostdan o&apos;chirilsinmi?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Agar bu testda o&apos;quvchi urinishlari bo&apos;lsa, o&apos;chirish rad
                          etiladi — buning o&apos;rniga &quot;Yopish&quot;ni ishlating.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                        <AlertDialogAction onClick={() => ochirish(t.id)}>
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

      <Dialog open={formaOchiq} onOpenChange={(v) => (v ? setFormaOchiq(true) : formaniYopish())}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tahrirlanayotgan ? "Testni tahrirlash" : "Yangi test"}</DialogTitle>
          </DialogHeader>
          <TestForma
            mavjudTest={tahrirlanayotgan}
            boshMavzuIdlar={boshMavzuIdlar}
            boshSavolIdlar={boshSavolIdlar}
            fanlar={fanlar}
            sinflar={sinflar}
            mavzular={mavzular}
            savollar={savollar}
            saqlash={(qiymatlar) =>
              tahrirlanayotgan ? testTahrirlash(tahrirlanayotgan.id, qiymatlar) : testQoshish(qiymatlar)
            }
            yopish={formaniYopish}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
