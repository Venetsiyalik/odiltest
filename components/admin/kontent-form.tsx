"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { KontentKorinish } from "@/components/kontent-korinish";
import { createClient } from "@/lib/supabase/client";
import type { Kontent, KontentQiymatlari } from "@/lib/actions/kontent";

const TURI_ITEMS = {
  maruza: "Ma'ruza (matn)",
  prezentatsiya: "Prezentatsiya (PDF)",
  video: "Video",
  fayl: "Fayl (PDF/Word)",
};

const FAYL_TALAB_QILINGAN_TURLAR = ["prezentatsiya", "fayl"] as const;

export function KontentForma({
  mavzuId,
  mavjudKontent,
  saqlash,
  yopish,
}: {
  mavzuId: number;
  mavjudKontent?: Kontent;
  saqlash: (qiymatlar: KontentQiymatlari) => Promise<{ xato?: string }>;
  yopish: () => void;
}) {
  const [turi, setTuri] = useState<Kontent["turi"]>(mavjudKontent?.turi ?? "maruza");
  const [sarlavha, setSarlavha] = useState(mavjudKontent?.sarlavha ?? "");
  const [tavsif, setTavsif] = useState(mavjudKontent?.tavsif ?? "");
  const [kontent, setKontent] = useState(mavjudKontent?.kontent ?? "");
  const [tashqiUrl, setTashqiUrl] = useState(mavjudKontent?.tashqi_url ?? "");
  const [tartib, setTartib] = useState(String(mavjudKontent?.tartib ?? 0));
  const [fayl, setFayl] = useState<File | null>(null);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  const faylTalabQilinadi = (FAYL_TALAB_QILINGAN_TURLAR as readonly string[]).includes(turi);

  async function submit() {
    setSaqlanmoqda(true);
    try {
      let faylUrl = mavjudKontent?.fayl_url ?? null;

      if (fayl) {
        const supabase = createClient();
        const kengaytma = fayl.name.split(".").pop();
        const yol = `materiallar/${Date.now()}-${Math.random().toString(36).slice(2)}.${kengaytma}`;
        const { error: yuklashXatosi } = await supabase.storage.from("oquv-materiallari").upload(yol, fayl);

        if (yuklashXatosi) {
          toast.error(`Fayl yuklashda xato: ${yuklashXatosi.message}`);
          return;
        }
        faylUrl = supabase.storage.from("oquv-materiallari").getPublicUrl(yol).data.publicUrl;
      }

      if (faylTalabQilinadi && !faylUrl) {
        toast.error("Fayl yuklang");
        return;
      }

      const natija = await saqlash({
        mavzuId,
        turi,
        sarlavha,
        tavsif: tavsif || null,
        kontent: kontent || null,
        faylUrl,
        tashqiUrl: tashqiUrl || null,
        tartib: Number(tartib) || 0,
      });
      if (natija.xato) {
        toast.error(natija.xato);
        return;
      }
      toast.success(mavjudKontent ? "Material yangilandi" : "Material qo'shildi");
      yopish();
    } finally {
      setSaqlanmoqda(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label>Turi</Label>
          <Select value={turi} onValueChange={(v) => setTuri((v ?? "maruza") as Kontent["turi"])} items={TURI_ITEMS}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TURI_ITEMS).map(([qiymat, matn]) => (
                <SelectItem key={qiymat} value={qiymat}>
                  {matn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Tartib</Label>
          <Input type="number" min={0} value={tartib} onChange={(e) => setTartib(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label>Sarlavha</Label>
        <Input value={sarlavha} onChange={(e) => setSarlavha(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Qisqa tavsif (ixtiyoriy)</Label>
        <Input value={tavsif} onChange={(e) => setTavsif(e.target.value)} placeholder="Mavzu kartasida ko'rinadi" />
      </div>

      {turi === "video" && (
        <div className="flex flex-col gap-1">
          <Label>Video havolasi (YouTube)</Label>
          <Input
            value={tashqiUrl}
            onChange={(e) => setTashqiUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
      )}

      {(turi === "prezentatsiya" || turi === "fayl") && (
        <div className="flex flex-col gap-1">
          <Label>{turi === "prezentatsiya" ? "PDF fayl" : "Fayl (PDF/Word)"}</Label>
          <Input
            type="file"
            accept={turi === "prezentatsiya" ? "application/pdf" : ".pdf,.doc,.docx"}
            onChange={(e) => setFayl(e.target.files?.[0] ?? null)}
          />
          {mavjudKontent?.fayl_url && !fayl && (
            <p className="text-xs text-muted-foreground">Mavjud fayl saqlanadi (yangisini tanlamasangiz)</p>
          )}
          {turi === "prezentatsiya" && (
            <p className="text-xs text-muted-foreground">
              To&apos;liq ekran slayd ko&apos;ruvchi keyingi bosqichda qo&apos;shiladi — hozircha PDF
              to&apos;g&apos;ridan-to&apos;g&apos;ri ochiladi.
            </p>
          )}
        </div>
      )}

      {turi === "maruza" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label>Matn (Markdown)</Label>
            <Textarea
              rows={10}
              value={kontent}
              onChange={(e) => setKontent(e.target.value)}
              placeholder={"**Qalin matn**, - ro'yxat, `kod`, $x^2$ formula, ![rasm](https://...) kabi yozish mumkin"}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Ko&apos;rinishi</Label>
            <div className="min-h-56 rounded-md border p-3">
              <KontentKorinish matn={kontent || "_(bo'sh)_"} />
            </div>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button onClick={submit} disabled={saqlanmoqda || !sarlavha.trim()}>
          {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </DialogFooter>
    </div>
  );
}
