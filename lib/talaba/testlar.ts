import { createServiceRoleClient } from "@/lib/supabase/server";

export interface TalabaTesti {
  id: number;
  nomi: string;
  savol_soni: number;
  vaqt_daqiqa: number;
  urinishlar_soni: number;
  natija_korsat: boolean;
  fanlar: { nomi: string } | null;
}

export async function mavjudTestlarniOl(sinfId: number): Promise<TalabaTesti[]> {
  const supabase = createServiceRoleClient();
  const hozir = new Date().toISOString();

  const { data, error } = await supabase
    .from("testlar")
    .select("id, nomi, savol_soni, vaqt_daqiqa, urinishlar_soni, natija_korsat, fanlar(nomi)")
    .eq("sinf_id", sinfId)
    .eq("holati", "faol")
    .lte("ochilish_vaqti", hozir)
    .gte("yopilish_vaqti", hozir)
    .order("yopilish_vaqti");

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as TalabaTesti[];
}

export async function oquvchiUrinishlarSoni(oquvchiId: number, testId: number): Promise<number> {
  const supabase = createServiceRoleClient();
  const { count } = await supabase
    .from("urinishlar")
    .select("id", { count: "exact", head: true })
    .eq("oquvchi_id", oquvchiId)
    .eq("test_id", testId);
  return count ?? 0;
}

export async function faolUrinishniTopish(
  oquvchiId: number,
  testId: number,
): Promise<number | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("urinishlar")
    .select("id")
    .eq("oquvchi_id", oquvchiId)
    .eq("test_id", testId)
    .eq("holati", "boshlangan")
    .maybeSingle();
  return data?.id ?? null;
}
