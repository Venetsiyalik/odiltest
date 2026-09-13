"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import type { QidiruvElementi } from "@/lib/redizayn/dashboard";

export function Qidiruv({ indeks }: { indeks: QidiruvElementi[] }) {
  const router = useRouter();
  const [matn, setMatn] = useState("");

  const natijalar = useMemo(() => {
    const so_rov = matn.trim().toLowerCase();
    if (so_rov.length < 2) return [];
    return indeks.filter((e) => e.nomi.toLowerCase().includes(so_rov)).slice(0, 8);
  }, [matn, indeks]);

  function tanlash(elementi: QidiruvElementi) {
    setMatn("");
    router.push(
      elementi.turi === "mavzu"
        ? `/sinf/${elementi.daraja}/${elementi.fanId}/${elementi.mavzuId}`
        : `/sinf/${elementi.daraja}/${elementi.fanId}`,
    );
  }

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={matn}
        onChange={(e) => setMatn(e.target.value)}
        placeholder="Mavzu yoki fan qidiring…"
        className="w-full border-2 px-5 py-3 text-[18px] outline-none"
        style={{
          borderRadius: theme.radius.md,
          borderColor: `${theme.colors.muted}44`,
          color: theme.colors.text,
        }}
      />
      {natijalar.length > 0 && (
        <ul
          className="absolute z-10 mt-2 w-full overflow-hidden border bg-white"
          style={{ borderRadius: theme.radius.md, boxShadow: theme.shadow.card, borderColor: `${theme.colors.muted}33` }}
        >
          {natijalar.map((elementi, indeks2) => (
            <li key={`${elementi.turi}-${elementi.fanId}-${elementi.mavzuId ?? indeks2}`}>
              <button
                type="button"
                onClick={() => tanlash(elementi)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-[16px] active:bg-black/5"
              >
                <span>{elementi.nomi}</span>
                <span style={{ color: theme.colors.muted }} className="text-sm">
                  {elementi.daraja}-sinf{elementi.turi === "mavzu" ? " · mavzu" : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
