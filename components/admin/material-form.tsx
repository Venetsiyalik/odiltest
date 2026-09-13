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
import type { DarsMateriali, MaterialQiymatlari } from "@/lib/actions/materiallar";

const TURI_ITEMS = { nazariya: "Nazariya", misol: "Misol", video: "Video" };

export function MaterialForma({
  mavzuId,
  mavjudMaterial,
  saqlash,
  yopish,
}: {
  mavzuId: number;
  mavjudMaterial?: DarsMateriali;
  saqlash: (qiymatlar: MaterialQiymatlari) => Promise<{ xato?: string }>;
  yopish: () => void;
}) {
  const [turi, setTuri] = useState<"nazariya" | "misol" | "video">(
    mavjudMaterial?.turi ?? "nazariya",
  );
  const [sarlavha, setSarlavha] = useState(mavjudMaterial?.sarlavha ?? "");
  const [kontent, setKontent] = useState(mavjudMaterial?.kontent ?? "");
  const [mediaUrl, setMediaUrl] = useState(mavjudMaterial?.media_url ?? "");
  const [tartib, setTartib] = useState(String(mavjudMaterial?.tartib ?? 0));
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  async function submit() {
    setSaqlanmoqda(true);
    try {
      const natija = await saqlash({
        mavzuId,
        turi,
        sarlavha,
        kontent: kontent || null,
        mediaUrl: mediaUrl || null,
        tartib: Number(tartib) || 0,
      });
      if (natija.xato) {
        toast.error(natija.xato);
        return;
      }
      toast.success(mavjudMaterial ? "Material yangilandi" : "Material qo'shildi");
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
          <Select
            value={turi}
            onValueChange={(v) => setTuri((v ?? "nazariya") as typeof turi)}
            items={TURI_ITEMS}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nazariya">Nazariya</SelectItem>
              <SelectItem value="misol">Misol</SelectItem>
              <SelectItem value="video">Video</SelectItem>
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

      {turi === "video" ? (
        <div className="flex flex-col gap-1">
          <Label>Video havolasi (YouTube)</Label>
          <Input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <Label>Rasm havolasi (ixtiyoriy)</Label>
          <Input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label>Matn (Markdown)</Label>
          <Textarea
            rows={10}
            value={kontent}
            onChange={(e) => setKontent(e.target.value)}
            placeholder={
              "**Qalin matn**, - ro'yxat, `kod`, $x^2$ formula, ![rasm](https://...) kabi yozish mumkin"
            }
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Ko&apos;rinishi</Label>
          <div className="min-h-56 rounded-md border p-3">
            <KontentKorinish matn={kontent || "_(bo'sh)_"} />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={submit} disabled={saqlanmoqda || !sarlavha.trim()}>
          {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </DialogFooter>
    </div>
  );
}
