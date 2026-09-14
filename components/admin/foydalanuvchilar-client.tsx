"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  foydalanuvchiFaolligniOzgartirish,
  foydalanuvchiParoliniOzgartirish,
  oqituvchiQoshish,
  biriktirishlarniOl,
  biriktirishQoshish,
  biriktirishOchirish,
  type Foydalanuvchi,
  type Biriktirish,
} from "@/lib/actions/foydalanuvchilar";
import { royxatdanItemlar } from "@/lib/utils/select-items";

interface Nomlangan {
  id: number;
  nomi: string;
}

const BOSH_YANGI_OQITUVCHI = { ismFamiliya: "", email: "", parol: "" };

export function FoydalanuvchilarClient({
  foydalanuvchilar,
  fanlar,
  sinflar,
}: {
  foydalanuvchilar: Foydalanuvchi[];
  fanlar: Nomlangan[];
  sinflar: Nomlangan[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [qoshishOchiq, setQoshishOchiq] = useState(false);
  const [yangiOqituvchi, setYangiOqituvchi] = useState(BOSH_YANGI_OQITUVCHI);

  const [parolOchiq, setParolOchiq] = useState<Foydalanuvchi | null>(null);
  const [yangiParol, setYangiParol] = useState("");

  const [biriktirishOchiq, setBiriktirishOchiq] = useState<Foydalanuvchi | null>(null);

  function qoshishBosildi() {
    if (!yangiOqituvchi.ismFamiliya.trim() || !yangiOqituvchi.email.trim() || !yangiOqituvchi.parol) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    startTransition(async () => {
      const natija = await oqituvchiQoshish(yangiOqituvchi);
      if (natija.xato) {
        toast.error(natija.xato);
      } else {
        setYangiOqituvchi(BOSH_YANGI_OQITUVCHI);
        setQoshishOchiq(false);
        toast.success("O'qituvchi qo'shildi");
        router.refresh();
      }
    });
  }

  function faollikniOzgartirish(f: Foydalanuvchi) {
    startTransition(async () => {
      const natija = await foydalanuvchiFaolligniOzgartirish(f.id, !f.faol);
      if (natija.xato) toast.error(natija.xato);
      else router.refresh();
    });
  }

  function parolniSaqlash() {
    if (!parolOchiq) return;
    startTransition(async () => {
      const natija = await foydalanuvchiParoliniOzgartirish(parolOchiq.id, yangiParol);
      if (natija.xato) {
        toast.error(natija.xato);
      } else {
        toast.success("Parol yangilandi");
        setParolOchiq(null);
        setYangiParol("");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Dialog open={qoshishOchiq} onOpenChange={setQoshishOchiq}>
        <DialogTrigger render={<Button className="w-fit" />}>
          Yangi o&apos;qituvchi qo&apos;shish
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi o&apos;qituvchi</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label>Ism Familiya</Label>
              <Input
                value={yangiOqituvchi.ismFamiliya}
                onChange={(e) =>
                  setYangiOqituvchi((oldin) => ({ ...oldin, ismFamiliya: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Elektron pochta</Label>
              <Input
                type="email"
                value={yangiOqituvchi.email}
                onChange={(e) => setYangiOqituvchi((oldin) => ({ ...oldin, email: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Parol</Label>
              <Input
                type="text"
                value={yangiOqituvchi.parol}
                onChange={(e) => setYangiOqituvchi((oldin) => ({ ...oldin, parol: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Kamida 6 belgi</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={qoshishBosildi} disabled={isPending}>
              Qo&apos;shish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ism Familiya</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roli</TableHead>
            <TableHead>Holati</TableHead>
            <TableHead className="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {foydalanuvchilar.map((f) => (
            <TableRow key={f.id}>
              <TableCell>{f.ismFamiliya}</TableCell>
              <TableCell className="text-muted-foreground">{f.email}</TableCell>
              <TableCell>{f.rol === "admin" ? "Admin" : "O'qituvchi"}</TableCell>
              <TableCell>
                <Badge variant={f.faol ? "default" : "secondary"}>
                  {f.faol ? "Faol" : "Nofaol"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {f.rol === "oqituvchi" && (
                    <Button variant="outline" size="sm" onClick={() => setBiriktirishOchiq(f)}>
                      Biriktirishlar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setParolOchiq(f);
                      setYangiParol("");
                    }}
                  >
                    Parolni almashtirish
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => faollikniOzgartirish(f)}>
                    {f.faol ? "Nofaol qilish" : "Faollashtirish"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={parolOchiq != null} onOpenChange={(ochiq) => !ochiq && setParolOchiq(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{parolOchiq?.ismFamiliya} — yangi parol</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            value={yangiParol}
            onChange={(e) => setYangiParol(e.target.value)}
            placeholder="Kamida 6 belgi"
          />
          <DialogFooter>
            <Button onClick={parolniSaqlash} disabled={isPending}>
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={biriktirishOchiq != null}
        onOpenChange={(ochiq) => !ochiq && setBiriktirishOchiq(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{biriktirishOchiq?.ismFamiliya} — biriktirishlar</DialogTitle>
          </DialogHeader>
          {biriktirishOchiq && (
            <BiriktirishBoshqaruvi
              foydalanuvchi={biriktirishOchiq}
              fanlar={fanlar}
              sinflar={sinflar}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BiriktirishBoshqaruvi({
  foydalanuvchi,
  fanlar,
  sinflar,
}: {
  foydalanuvchi: Foydalanuvchi;
  fanlar: Nomlangan[];
  sinflar: Nomlangan[];
}) {
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [royxat, setRoyxat] = useState<Biriktirish[]>([]);
  const [yangiFanId, setYangiFanId] = useState("");
  const [yangiSinfId, setYangiSinfId] = useState("");
  const [isPending, startTransition] = useTransition();

  function qaytaYuklash() {
    setYuklanmoqda(true);
    startTransition(async () => {
      const natija = await biriktirishlarniOl(foydalanuvchi.id);
      setRoyxat(natija);
      setYuklanmoqda(false);
    });
  }

  useEffect(() => {
    qaytaYuklash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foydalanuvchi.id]);

  function qoshishBosildi() {
    if (!yangiFanId || !yangiSinfId) {
      toast.error("Fan va sinfni tanlang");
      return;
    }
    startTransition(async () => {
      const natija = await biriktirishQoshish(foydalanuvchi.id, Number(yangiFanId), Number(yangiSinfId));
      if (natija.xato) {
        toast.error(natija.xato);
      } else {
        setYangiFanId("");
        setYangiSinfId("");
        qaytaYuklash();
      }
    });
  }

  function ochirishBosildi(id: number) {
    startTransition(async () => {
      const natija = await biriktirishOchirish(id);
      if (natija.xato) toast.error(natija.xato);
      else qaytaYuklash();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {yuklanmoqda ? (
        <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
      ) : royxat.length === 0 ? (
        <p className="text-sm text-muted-foreground">Hali hech qanday fan+sinf biriktirilmagan</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {royxat.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>
                {b.fanNomi} · {b.sinfNomi}
              </span>
              <Button variant="outline" size="sm" onClick={() => ochirishBosildi(b.id)}>
                O&apos;chirish
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <Label>Fan</Label>
          <Select value={yangiFanId} onValueChange={(v) => setYangiFanId(v ?? "")} items={royxatdanItemlar(fanlar)}>
            <SelectTrigger>
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
        <div className="flex flex-1 flex-col gap-1">
          <Label>Sinf</Label>
          <Select value={yangiSinfId} onValueChange={(v) => setYangiSinfId(v ?? "")} items={royxatdanItemlar(sinflar)}>
            <SelectTrigger>
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
        <Button onClick={qoshishBosildi} disabled={isPending}>
          Qo&apos;shish
        </Button>
      </div>
    </div>
  );
}
