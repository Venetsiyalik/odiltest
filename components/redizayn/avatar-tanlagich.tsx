"use client";

import { useState, useTransition } from "react";
import { theme } from "@/lib/theme";
import { AVATARLAR } from "@/lib/redizayn/avatarlar-royxati";

export function AvatarTanlagich({ joriyAvatar, jamiXp }: { joriyAvatar: string; jamiXp: number }) {
  const [tanlangan, setTanlangan] = useState(joriyAvatar);
  const [xato, setXato] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function tanlash(kod: string, ochilishXp: number) {
    if (jamiXp < ochilishXp) return;
    setXato(null);
    startTransition(async () => {
      const natija = await fetch("/api/gamifikatsiya/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarKodi: kod }),
      }).then((r) => r.json());

      if (natija.xato) setXato(natija.xato);
      else setTanlangan(kod);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {AVATARLAR.map((avatar) => {
          const ochiqmi = jamiXp >= avatar.ochilishXp;
          const faolmi = tanlangan === avatar.kod;
          return (
            <button
              key={avatar.kod}
              type="button"
              disabled={!ochiqmi || isPending}
              onClick={() => tanlash(avatar.kod, avatar.ochilishXp)}
              className="flex flex-col items-center gap-1 p-3 disabled:opacity-40"
              style={{
                borderRadius: theme.radius.md,
                border: `2px solid ${faolmi ? theme.colors.accent : "transparent"}`,
                background: theme.colors.bg,
              }}
            >
              <span className="text-4xl">{ochiqmi ? avatar.emoji : "🔒"}</span>
              <span className="text-xs font-semibold">{avatar.nomi}</span>
              {!ochiqmi && (
                <span className="text-xs" style={{ color: theme.colors.muted }}>
                  {avatar.ochilishXp} XP
                </span>
              )}
            </button>
          );
        })}
      </div>
      {xato && (
        <p className="text-sm" style={{ color: theme.colors.danger }}>
          {xato}
        </p>
      )}
    </div>
  );
}
