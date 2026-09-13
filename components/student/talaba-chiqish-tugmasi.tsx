"use client";

import { useRouter } from "next/navigation";
import { useMatnlar } from "@/components/student/matnlar-provideri";

export function TalabaChiqishTugmasi() {
  const router = useRouter();
  const { matnlar } = useMatnlar();

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
      {matnlar.umumiy.chiqish}
    </button>
  );
}
