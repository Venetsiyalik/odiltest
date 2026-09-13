import { createServiceRoleClient } from "@/lib/supabase/server";

export type MaterialTuri = "maruza" | "prezentatsiya" | "video" | "fayl";

export interface MavzuMateriali {
  id: number;
  turi: MaterialTuri;
  sarlavha: string;
  tavsif: string | null;
  slaydSoni: number | null;
  korilganmi: boolean;
}

export interface MavzuSahifasi {
  mavzuId: number;
  nomi: string;
  tavsif: string | null;
  bolim: string | null;
  fanId: number;
  materiallar: MavzuMateriali[];
  oldingiMavzuId: number | null;
  keyingiMavzuId: number | null;
}

/**
 * Mavzu sahifasi uchun ma'lumot (REDIZAYN.md 3.5-band). Sessiyasiz
 * mehmon uchun ham ishlashi shart bo'lgani uchun `service_role` orqali.
 */
export async function mavzuSahifasiniOl(mavzuId: number, oquvchiId?: number): Promise<MavzuSahifasi | null> {
  const supabase = createServiceRoleClient();

  const { data: mavzu } = await supabase
    .from("mavzular")
    .select("id, nomi, tavsif, bolim, fan_id, sinf_id")
    .eq("id", mavzuId)
    .maybeSingle();
  if (!mavzu) return null;

  const { data: materiallar } = await supabase
    .from("materiallar")
    .select("id, turi, sarlavha, tavsif, slayd_soni")
    .eq("mavzu_id", mavzuId)
    .order("tartib");

  const materiallarRoyxati = materiallar ?? [];

  let korilganIdlar = new Set<number>();
  if (oquvchiId && materiallarRoyxati.length > 0) {
    const { data: korilganlar } = await supabase
      .from("material_korildi")
      .select("material_id")
      .eq("oquvchi_id", oquvchiId)
      .in(
        "material_id",
        materiallarRoyxati.map((m) => m.id),
      );
    korilganIdlar = new Set((korilganlar ?? []).map((k) => k.material_id));
  }

  const { data: qoshnilar } = await supabase
    .from("mavzular")
    .select("id, tartib")
    .eq("fan_id", mavzu.fan_id)
    .eq("sinf_id", mavzu.sinf_id)
    .order("tartib");

  const royxat = qoshnilar ?? [];
  const indeks = royxat.findIndex((m) => m.id === mavzuId);
  const oldingiMavzuId = indeks > 0 ? royxat[indeks - 1].id : null;
  const keyingiMavzuId = indeks >= 0 && indeks < royxat.length - 1 ? royxat[indeks + 1].id : null;

  return {
    mavzuId: mavzu.id,
    nomi: mavzu.nomi,
    tavsif: mavzu.tavsif,
    bolim: mavzu.bolim,
    fanId: mavzu.fan_id,
    materiallar: materiallarRoyxati.map((m) => ({
      id: m.id,
      turi: m.turi as MaterialTuri,
      sarlavha: m.sarlavha,
      tavsif: m.tavsif,
      slaydSoni: m.slayd_soni,
      korilganmi: korilganIdlar.has(m.id),
    })),
    oldingiMavzuId,
    keyingiMavzuId,
  };
}

export interface MaterialDetali {
  id: number;
  mavzuId: number;
  turi: MaterialTuri;
  sarlavha: string;
  kontent: string | null;
  faylUrl: string | null;
  tashqiUrl: string | null;
}

export async function materialDetaliniOl(materialId: number): Promise<MaterialDetali | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("materiallar")
    .select("id, mavzu_id, turi, sarlavha, kontent, fayl_url, tashqi_url")
    .eq("id", materialId)
    .maybeSingle();
  if (!data) return null;

  return {
    id: data.id,
    mavzuId: data.mavzu_id,
    turi: data.turi as MaterialTuri,
    sarlavha: data.sarlavha,
    kontent: data.kontent,
    faylUrl: data.fayl_url,
    tashqiUrl: data.tashqi_url,
  };
}
