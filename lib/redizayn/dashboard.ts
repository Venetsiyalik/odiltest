import { createServiceRoleClient } from "@/lib/supabase/server";
import { DARAJALAR, sinfDarajasi } from "@/lib/redizayn/daraja";

/**
 * Yangi ochiq (kodsiz) navigatsiya uchun ma'lumot o'qish funksiyalari
 * (REDIZAYN.md 3-bo'lim). Bu sahifalar hech qanday sessiyani talab
 * qilmaydi, shuning uchun boshqa talaba-tomon funksiyalari singari
 * `service_role` klienti orqali o'qiydi (RLS'ni chetlab o'tadi — bu
 * yerda o'qilayotgan narsa shaxsiy ma'lumot emas, faqat fan/mavzu nomlari).
 */

interface SinfQatori {
  id: number;
  nomi: string;
}

interface MavzuQatori {
  id: number;
  nomi: string;
  fan_id: number;
  sinf_id: number;
  tartib: number;
}

async function barchaSinflarVaMavzularniOl() {
  const supabase = createServiceRoleClient();
  const [{ data: sinflar }, { data: mavzular }] = await Promise.all([
    supabase.from("sinflar").select("id, nomi").returns<SinfQatori[]>(),
    supabase.from("mavzular").select("id, nomi, fan_id, sinf_id, tartib").returns<MavzuQatori[]>(),
  ]);
  return { sinflar: sinflar ?? [], mavzular: mavzular ?? [] };
}

function darajaSinfIdlari(sinflar: SinfQatori[], daraja: number): Set<number> {
  return new Set(sinflar.filter((s) => sinfDarajasi(s.nomi) === daraja).map((s) => s.id));
}

export interface DarajaStatistika {
  daraja: number;
  fanSoni: number;
  mavzuSoni: number;
  mavjudmi: boolean;
}

export async function darajalarStatistikasiniOl(): Promise<DarajaStatistika[]> {
  const { sinflar, mavzular } = await barchaSinflarVaMavzularniOl();

  return DARAJALAR.map((daraja) => {
    const sinfIdlari = darajaSinfIdlari(sinflar, daraja);
    const shuDarajaMavzulari = mavzular.filter((m) => sinfIdlari.has(m.sinf_id));
    const fanIdlari = new Set(shuDarajaMavzulari.map((m) => m.fan_id));
    return {
      daraja,
      fanSoni: fanIdlari.size,
      mavzuSoni: shuDarajaMavzulari.length,
      mavjudmi: sinfIdlari.size > 0,
    };
  });
}

export interface DarajaFani {
  fanId: number;
  nomi: string;
  mavzuSoni: number;
}

export async function darajaFanlariniOl(daraja: number): Promise<DarajaFani[]> {
  const supabase = createServiceRoleClient();
  const { sinflar, mavzular } = await barchaSinflarVaMavzularniOl();
  const sinfIdlari = darajaSinfIdlari(sinflar, daraja);
  const shuDarajaMavzulari = mavzular.filter((m) => sinfIdlari.has(m.sinf_id));

  const mavzuSoniXaritasi = new Map<number, number>();
  for (const m of shuDarajaMavzulari) {
    mavzuSoniXaritasi.set(m.fan_id, (mavzuSoniXaritasi.get(m.fan_id) ?? 0) + 1);
  }

  const { data: fanlar } = await supabase.from("fanlar").select("id, nomi").order("nomi");

  return (fanlar ?? []).map((f) => ({
    fanId: f.id,
    nomi: f.nomi,
    mavzuSoni: mavzuSoniXaritasi.get(f.id) ?? 0,
  }));
}

export interface FanMavzusi {
  mavzuId: number;
  nomi: string;
  tartib: number;
  organildimi: boolean;
}

export async function fanSahifasiniOl(
  daraja: number,
  fanId: number,
  oquvchiId?: number,
): Promise<{ fanNomi: string | null; mavzular: FanMavzusi[] }> {
  const supabase = createServiceRoleClient();
  const { sinflar, mavzular } = await barchaSinflarVaMavzularniOl();
  const sinfIdlari = darajaSinfIdlari(sinflar, daraja);

  const shuFanMavzulari = mavzular
    .filter((m) => sinfIdlari.has(m.sinf_id) && m.fan_id === fanId)
    .sort((a, b) => a.tartib - b.tartib);

  const { data: fan } = await supabase.from("fanlar").select("nomi").eq("id", fanId).maybeSingle();

  let organilganIdlar = new Set<number>();
  if (oquvchiId && shuFanMavzulari.length > 0) {
    const { data: progressQatorlari } = await supabase
      .from("progress")
      .select("mavzu_id, organildi")
      .eq("oquvchi_id", oquvchiId)
      .in(
        "mavzu_id",
        shuFanMavzulari.map((m) => m.id),
      );
    organilganIdlar = new Set((progressQatorlari ?? []).filter((p) => p.organildi).map((p) => p.mavzu_id));
  }

  return {
    fanNomi: fan?.nomi ?? null,
    mavzular: shuFanMavzulari.map((m) => ({
      mavzuId: m.id,
      nomi: m.nomi,
      tartib: m.tartib,
      organildimi: organilganIdlar.has(m.id),
    })),
  };
}

export interface QidiruvElementi {
  turi: "fan" | "mavzu";
  nomi: string;
  daraja: number;
  fanId: number;
  mavzuId?: number;
}

/** Dashboarddagi qidiruv qatori uchun — barcha daraja/fan/mavzu birikmalarini tekis ro'yxat qilib beradi. */
export async function qidiruvIndeksiniOl(): Promise<QidiruvElementi[]> {
  const supabase = createServiceRoleClient();
  const { sinflar, mavzular } = await barchaSinflarVaMavzularniOl();
  const { data: fanlar } = await supabase.from("fanlar").select("id, nomi");
  const fanXaritasi = new Map((fanlar ?? []).map((f) => [f.id, f.nomi]));

  const natija: QidiruvElementi[] = [];
  const fanDarajaJufti = new Set<string>();

  for (const m of mavzular) {
    const daraja = sinfDarajasi(sinflar.find((s) => s.id === m.sinf_id)?.nomi ?? "");
    if (daraja === null) continue;
    const fanNomi = fanXaritasi.get(m.fan_id);
    if (!fanNomi) continue;

    const juftKalit = `${daraja}-${m.fan_id}`;
    if (!fanDarajaJufti.has(juftKalit)) {
      fanDarajaJufti.add(juftKalit);
      natija.push({ turi: "fan", nomi: fanNomi, daraja, fanId: m.fan_id });
    }
    natija.push({ turi: "mavzu", nomi: m.nomi, daraja, fanId: m.fan_id, mavzuId: m.id });
  }

  return natija;
}
