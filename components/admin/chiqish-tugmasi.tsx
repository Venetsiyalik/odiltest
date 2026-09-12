"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function ChiqishTugmasi() {
  const router = useRouter();

  async function chiqish() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/kirish");
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={chiqish}>
      Chiqish
    </Button>
  );
}
