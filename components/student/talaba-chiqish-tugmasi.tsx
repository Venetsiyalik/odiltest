"use client";

import { useRouter } from "next/navigation";
import { uz } from "@/lib/i18n/uz";

export function TalabaChiqishTugmasi() {
  const router = useRouter();

  async function chiqish() {
    await fetch("/api/auth/chiqish", { method: "POST" });
    router.push("/kirish");
  }

  return (
    <button
      type="button"
      onClick={chiqish}
      className="min-h-16 rounded-xl border-2 border-border px-6 text-xl font-medium active:bg-muted"
    >
      {uz.umumiy.chiqish}
    </button>
  );
}
