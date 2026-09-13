"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { royxatdanItemlar } from "@/lib/utils/select-items";
import type { Test, TestQiymatlari } from "@/lib/actions/testlar";
import type { Mavzu } from "@/lib/actions/spravochniklar";
import type { Savol } from "@/lib/actions/savollar";

interface Nomlangan {
  id: number;
  nomi: string;
}

function ISOdanDatetimeLocalga(iso: string): string {
  const sana = new Date(iso);
  const ofset = sana.getTimezoneOffset();
  return new Date(sana.getTime() - ofset * 60 * 1000).toISOString().slice(0, 16);
}

const BOSH_QIYMAT = {
  nomi: "",
  fanId: "",
  sinfId: "",
  savolSoni: "20",
  vaqtDaqiqa: "30",
  ochilishVaqti: "",
  yopilishVaqti: "",
  urinishlarSoni: "1",
  tanlovTuri: "avtomatik" as "avtomatik" | "qolda",
  aralashtirish: true,
  natijaKorsat: true,
  xatolarniKorsat: false,
};

export function TestForma({
  mavjudTest,
  boshMavzuIdlar,
  boshSavolIdlar,
  fanlar,
  sinflar,
  mavzular,
  savollar,
  saqlash,
  yopish,
}: {
  mavjudTest?: Test;
  boshMavzuIdlar: number[];
  boshSavolIdlar: number[];
  fanlar: Nomlangan[];
  sinflar: Nomlangan[];
  mavzular: Mavzu[];
  savollar: Savol[];
  saqlash: (qiymatlar: TestQiymatlari) => Promise<{ xato?: string }>;
  yopish: () => void;
}) {
  const [forma, setForma] = useState(
    mavjudTest
      ? {
          nomi: mavjudTest.nomi,
          fanId: String(mavjudTest.fan_id),
          sinfId: String(mavjudTest.sinf_id),
          savolSoni: String(mavjudTest.savol_soni),
          vaqtDaqiqa: String(mavjudTest.vaqt_daqiqa),
          ochilishVaqti: ISOdanDatetimeLocalga(mavjudTest.ochilish_vaqti),
          yopilishVaqti: ISOdanDatetimeLocalga(mavjudTest.yopilish_vaqti),
          urinishlarSoni: String(mavjudTest.urinishlar_soni),
          tanlovTuri: mavjudTest.tanlov_turi,
          aralashtirish: mavjudTest.aralashtirish,
          natijaKorsat: mavjudTest.natija_korsat,
          xatolarniKorsat: mavjudTest.xatolarni_korsat,
        }
      : BOSH_QIYMAT,
  );
  const [mavzuIdlar, setMavzuIdlar] = useState<Set<number>>(new Set(boshMavzuIdlar));
  const [savolIdlar, setSavolIdlar] = useState<Set<number>>(new Set(boshSavolIdlar));
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  const filtrlanganMavzular = useMemo(
    // "baholash" turidagi mavzularda (BSB/ChSB) savol bo'lmaydi, shuning
    // uchun avtomatik savol tanlash ro'yxatida ko'rsatilmaydi
    // (ishreja-import.md 3-bo'lim).
    () =>
      mavzular.filter(
        (m) => String(m.fan_id) === forma.fanId && String(m.sinf_id) === forma.sinfId && m.turi !== "baholash",
      ),
    [mavzular, forma.fanId, forma.sinfId],
  );
  const filtrlanganSavollar = useMemo(
    () => savollar.filter((s) => String(s.fan_id) === forma.fanId && String(s.sinf_id) === forma.sinfId),
    [savollar, forma.fanId, forma.sinfId],
  );

  function maydonYangilash<K extends keyof typeof forma>(kalit: K, qiymat: (typeof forma)[K]) {
    setForma((oldin) => ({ ...oldin, [kalit]: qiymat }));
  }

  function mavzuBelgilash(id: number, holat: boolean) {
    setMavzuIdlar((oldin) => {
      const yangi = new Set(oldin);
      if (holat) yangi.add(id);
      else yangi.delete(id);
      return yangi;
    });
  }

  function savolBelgilash(id: number, holat: boolean) {
    setSavolIdlar((oldin) => {
      const yangi = new Set(oldin);
      if (holat) yangi.add(id);
      else yangi.delete(id);
      return yangi;
    });
  }

  async function submit() {
    if (!forma.fanId || !forma.sinfId) {
      toast.error("Fan va sinfni tanlang");
      return;
    }

    setSaqlanmoqda(true);
    try {
      const natija = await saqlash({
        nomi: forma.nomi,
        fanId: Number(forma.fanId),
        sinfId: Number(forma.sinfId),
        savolSoni: Number(forma.savolSoni),
        vaqtDaqiqa: Number(forma.vaqtDaqiqa),
        ochilishVaqti: forma.ochilishVaqti ? new Date(forma.ochilishVaqti).toISOString() : "",
        yopilishVaqti: forma.yopilishVaqti ? new Date(forma.yopilishVaqti).toISOString() : "",
        urinishlarSoni: Number(forma.urinishlarSoni),
        tanlovTuri: forma.tanlovTuri,
        aralashtirish: forma.aralashtirish,
        natijaKorsat: forma.natijaKorsat,
        xatolarniKorsat: forma.xatolarniKorsat,
        mavzuIdlar: Array.from(mavzuIdlar),
        savolIdlar: Array.from(savolIdlar),
      });

      if (natija.xato) {
        toast.error(natija.xato);
        return;
      }

      toast.success(mavjudTest ? "Test yangilandi" : "Test qo'shildi");
      yopish();
    } finally {
      setSaqlanmoqda(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label>Test nomi</Label>
        <Input value={forma.nomi} onChange={(e) => maydonYangilash("nomi", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label>Fan</Label>
          <Select
            value={forma.fanId}
            onValueChange={(v) => maydonYangilash("fanId", v ?? "")}
            items={royxatdanItemlar(fanlar)}
          >
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

        <div className="flex flex-col gap-1">
          <Label>Sinf</Label>
          <Select
            value={forma.sinfId}
            onValueChange={(v) => maydonYangilash("sinfId", v ?? "")}
            items={royxatdanItemlar(sinflar)}
          >
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
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <Label>Savollar soni</Label>
          <Input
            type="number"
            min={1}
            value={forma.savolSoni}
            onChange={(e) => maydonYangilash("savolSoni", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Vaqt (daqiqa)</Label>
          <Input
            type="number"
            min={1}
            value={forma.vaqtDaqiqa}
            onChange={(e) => maydonYangilash("vaqtDaqiqa", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Urinishlar soni</Label>
          <Input
            type="number"
            min={1}
            value={forma.urinishlarSoni}
            onChange={(e) => maydonYangilash("urinishlarSoni", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label>Ochilish vaqti</Label>
          <Input
            type="datetime-local"
            value={forma.ochilishVaqti}
            onChange={(e) => maydonYangilash("ochilishVaqti", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Yopilish vaqti</Label>
          <Input
            type="datetime-local"
            value={forma.yopilishVaqti}
            onChange={(e) => maydonYangilash("yopilishVaqti", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label>Savol tanlash usuli</Label>
        <Select
          value={forma.tanlovTuri}
          onValueChange={(v) => maydonYangilash("tanlovTuri", (v ?? "avtomatik") as "avtomatik" | "qolda")}
          items={{ avtomatik: "Avtomatik (mavzu bo'yicha)", qolda: "Qo'lda tanlash" }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="avtomatik">Avtomatik (mavzu bo&apos;yicha)</SelectItem>
            <SelectItem value="qolda">Qo&apos;lda tanlash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {forma.tanlovTuri === "avtomatik" ? (
        <div className="flex flex-col gap-1">
          <Label>Mavzular (savol havzasi)</Label>
          {!forma.fanId || !forma.sinfId ? (
            <p className="text-sm text-muted-foreground">Avval fan va sinfni tanlang</p>
          ) : (
            <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-md border p-2">
              {filtrlanganMavzular.length === 0 && (
                <p className="text-sm text-muted-foreground">Bu fan/sinf uchun mavzu yo&apos;q</p>
              )}
              {filtrlanganMavzular.map((m) => (
                <label key={m.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={mavzuIdlar.has(m.id)}
                    onCheckedChange={(v) => mavzuBelgilash(m.id, Boolean(v))}
                  />
                  {m.nomi}
                </label>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <Label>Savollar ({savolIdlar.size} tanlandi)</Label>
          {!forma.fanId || !forma.sinfId ? (
            <p className="text-sm text-muted-foreground">Avval fan va sinfni tanlang</p>
          ) : (
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-md border p-2">
              {filtrlanganSavollar.length === 0 && (
                <p className="text-sm text-muted-foreground">Bu fan/sinf uchun savol yo&apos;q</p>
              )}
              {filtrlanganSavollar.map((s) => (
                <label key={s.id} className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={savolIdlar.has(s.id)}
                    onCheckedChange={(v) => savolBelgilash(s.id, Boolean(v))}
                  />
                  <span className="line-clamp-1">{s.matn}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={forma.aralashtirish}
            onCheckedChange={(v) => maydonYangilash("aralashtirish", Boolean(v))}
          />
          Savol va variantlar tartibini har o&apos;quvchi uchun aralashtirish
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={forma.natijaKorsat}
            onCheckedChange={(v) => maydonYangilash("natijaKorsat", Boolean(v))}
          />
          Yakunda natijani o&apos;quvchiga ko&apos;rsatish
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={forma.xatolarniKorsat}
            onCheckedChange={(v) => maydonYangilash("xatolarniKorsat", Boolean(v))}
          />
          Xatolar ustida ishlash ekranini ruxsat berish
        </label>
      </div>

      <DialogFooter>
        <Button onClick={submit} disabled={saqlanmoqda}>
          {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </DialogFooter>
    </div>
  );
}
