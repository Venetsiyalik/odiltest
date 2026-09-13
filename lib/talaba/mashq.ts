import { createServiceRoleClient } from "@/lib/supabase/server";

export interface MashqFani {
  id: number;
  nomi: string;
}

export interface MashqMavzusi {
  id: number;
  nomi: string;
  fanId: number;
}

export async function mashqFanlariniOl(sinfId: number): Promise<MashqFani[]> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("savollar")
    .select("fan_id, fanlar(id, nomi)")
    .eq("sinf_id", sinfId)
    .eq("faol", true)
    .returns<{ fan_id: number; fanlar: { id: number; nomi: string } | null }[]>();

  const xarita = new Map<number, MashqFani>();
  for (const q of data ?? []) {
    if (q.fanlar) xarita.set(q.fan_id, { id: q.fanlar.id, nomi: q.fanlar.nomi });
  }
  return Array.from(xarita.values()).sort((a, b) => a.nomi.localeCompare(b.nomi));
}

export async function mashqBarchaMavzulariniOl(sinfId: number): Promise<MashqMavzusi[]> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("savollar")
    .select("fan_id, mavzu_id, mavzular(id, nomi)")
    .eq("sinf_id", sinfId)
    .eq("faol", true)
    .not("mavzu_id", "is", null)
    .returns<{ fan_id: number; mavzu_id: number; mavzular: { id: number; nomi: string } | null }[]>();

  const xarita = new Map<number, MashqMavzusi>();
  for (const q of data ?? []) {
    if (q.mavzular) xarita.set(q.mavzu_id, { id: q.mavzular.id, nomi: q.mavzular.nomi, fanId: q.fan_id });
  }
  return Array.from(xarita.values()).sort((a, b) => a.nomi.localeCompare(b.nomi));
}
