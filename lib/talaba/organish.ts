import { createServiceRoleClient } from "@/lib/supabase/server";
import { royxatniAralashtirish } from "@/lib/talaba/aralashtirish";

export interface FanProgressi {
  fanId: number;
  fanNomi: string;
  jamiMavzu: number;
  organilganMavzu: number;
}

export interface MavzuProgressi {
  mavzuId: number;
  nomi: string;
  tartib: number;
  organildimi: boolean;
}

export async function fanlarProgressBilanOl(
  sinfId: number,
  oquvchiId: number,
): Promise<FanProgressi[]> {
  const supabase = createServiceRoleClient();

  const { data: mavzular } = await supabase
    .from("mavzular")
    .select("id, fan_id, fanlar(nomi)")
    .eq("sinf_id", sinfId)
    .returns<{ id: number; fan_id: number; fanlar: { nomi: string } | null }[]>();

  if (!mavzular || mavzular.length === 0) return [];

  const { data: progresslar } = await supabase
    .from("progress")
    .select("mavzu_id, organildi")
    .eq("oquvchi_id", oquvchiId)
    .eq("organildi", true);

  const organilganMavzuIdlar = new Set((progresslar ?? []).map((p) => p.mavzu_id));

  const xarita = new Map<number, FanProgressi>();
  for (const m of mavzular) {
    const joriy = xarita.get(m.fan_id) ?? {
      fanId: m.fan_id,
      fanNomi: m.fanlar?.nomi ?? "",
      jamiMavzu: 0,
      organilganMavzu: 0,
    };
    joriy.jamiMavzu += 1;
    if (organilganMavzuIdlar.has(m.id)) joriy.organilganMavzu += 1;
    xarita.set(m.fan_id, joriy);
  }

  return Array.from(xarita.values()).sort((a, b) => a.fanNomi.localeCompare(b.fanNomi));
}

export async function mavzularProgressBilanOl(
  fanId: number,
  sinfId: number,
  oquvchiId: number,
): Promise<MavzuProgressi[]> {
  const supabase = createServiceRoleClient();

  const { data: mavzular } = await supabase
    .from("mavzular")
    .select("id, nomi, tartib")
    .eq("fan_id", fanId)
    .eq("sinf_id", sinfId)
    .order("tartib");

  if (!mavzular) return [];

  const { data: progresslar } = await supabase
    .from("progress")
    .select("mavzu_id, organildi")
    .eq("oquvchi_id", oquvchiId)
    .in(
      "mavzu_id",
      mavzular.map((m) => m.id),
    );

  const organilganMavzuIdlar = new Set(
    (progresslar ?? []).filter((p) => p.organildi).map((p) => p.mavzu_id),
  );

  return mavzular.map((m) => ({
    mavzuId: m.id,
    nomi: m.nomi,
    tartib: m.tartib,
    organildimi: organilganMavzuIdlar.has(m.id),
  }));
}

export interface MavzuMateriali {
  id: number;
  turi: "nazariya" | "misol" | "video";
  sarlavha: string;
  kontent: string | null;
  mediaUrl: string | null;
}

export interface OzOziniTekshirishSavoli {
  savolId: number;
  matn: string;
  rasmUrl: string | null;
  variantlar: { A: string; B: string; C: string; D: string };
}

export interface MavzuDetali {
  nomi: string;
  fanNomi: string;
  materiallar: MavzuMateriali[];
  ozOziniTekshirishSavollari: OzOziniTekshirishSavoli[];
}

const OZ_TEKSHIRISH_SAVOL_SONI = 4;

export async function mavzuDetaliniOl(mavzuId: number): Promise<MavzuDetali | null> {
  const supabase = createServiceRoleClient();

  const { data: mavzu } = await supabase
    .from("mavzular")
    .select("nomi, fanlar(nomi)")
    .eq("id", mavzuId)
    .maybeSingle<{ nomi: string; fanlar: { nomi: string } | null }>();

  if (!mavzu) return null;

  const { data: materiallar } = await supabase
    .from("dars_materiallari")
    .select("id, turi, sarlavha, kontent, media_url")
    .eq("mavzu_id", mavzuId)
    .order("tartib");

  const { data: savollar } = await supabase
    .from("savollar")
    .select("id, matn, rasm_url, variant_a, variant_b, variant_c, variant_d")
    .eq("mavzu_id", mavzuId)
    .eq("faol", true);

  const tanlangan = royxatniAralashtirish(savollar ?? []).slice(0, OZ_TEKSHIRISH_SAVOL_SONI);

  return {
    nomi: mavzu.nomi,
    fanNomi: mavzu.fanlar?.nomi ?? "",
    materiallar: (materiallar ?? []).map((m) => ({
      id: m.id,
      turi: m.turi,
      sarlavha: m.sarlavha,
      kontent: m.kontent,
      mediaUrl: m.media_url,
    })),
    ozOziniTekshirishSavollari: tanlangan.map((s) => ({
      savolId: s.id,
      matn: s.matn,
      rasmUrl: s.rasm_url,
      variantlar: { A: s.variant_a, B: s.variant_b, C: s.variant_c, D: s.variant_d },
    })),
  };
}
