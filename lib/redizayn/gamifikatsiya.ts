import { createServiceRoleClient } from "@/lib/supabase/server";
import { AVATARLAR } from "@/lib/redizayn/avatarlar-royxati";

/**
 * Gamifikatsiya (REDIZAYN.md 5-bo'lim). XP hisoblash faqat serverda —
 * klient hech qachon "menga X XP ber" deb so'rayolmaydi, bu yerdagi
 * funksiyalar mavjud talaba-tomon oqimlarga (mashq/organish/test) qo'shimcha
 * side-effect sifatida chaqiriladi, ularning o'z javob shaklini o'zgartirmaydi.
 */

const TASHKENT_OFSET_MS = 5 * 60 * 60 * 1000; // Uzbekiston UTC+5, DST yo'q

function mahalliyVaqt(sana: Date): Date {
  return new Date(sana.getTime() + TASHKENT_OFSET_MS);
}

function mahalliySana(sana: Date = new Date()): string {
  return mahalliyVaqt(sana).toISOString().slice(0, 10);
}

function kunOraligi(sana: string): { boshlanish: string; tugash: string } {
  return {
    boshlanish: new Date(`${sana}T00:00:00+05:00`).toISOString(),
    tugash: new Date(`${sana}T23:59:59.999+05:00`).toISOString(),
  };
}

export function darajaniHisoblash(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
}

async function xpQoshish(
  oquvchiId: number,
  miqdor: number,
  sabab: string,
): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase.from("xp_jurnal").insert({ oquvchi_id: oquvchiId, miqdor, sabab });

  const { data: mavjud } = await supabase
    .from("oquvchi_holati")
    .select("jami_xp")
    .eq("oquvchi_id", oquvchiId)
    .maybeSingle();

  const yangiJamiXp = (mavjud?.jami_xp ?? 0) + miqdor;
  const yangiDaraja = darajaniHisoblash(yangiJamiXp);

  await supabase
    .from("oquvchi_holati")
    .upsert({ oquvchi_id: oquvchiId, jami_xp: yangiJamiXp, daraja: yangiDaraja }, { onConflict: "oquvchi_id" });
}

async function bugungiFaollikniOlish(
  oquvchiId: number,
): Promise<{ mashqSoni: number; mavzuOrganildimi: boolean }> {
  const supabase = createServiceRoleClient();
  const { boshlanish, tugash } = kunOraligi(mahalliySana());

  const { data: mashqlar } = await supabase
    .from("mashq_sessiyalar")
    .select("savol_soni")
    .eq("oquvchi_id", oquvchiId)
    .gte("boshlandi", boshlanish)
    .lte("boshlandi", tugash);
  const mashqSoni = (mashqlar ?? []).reduce((yigindi, m) => yigindi + m.savol_soni, 0);

  const { count } = await supabase
    .from("progress")
    .select("mavzu_id", { count: "exact", head: true })
    .eq("oquvchi_id", oquvchiId)
    .eq("organildi", true)
    .gte("yangilandi", boshlanish)
    .lte("yangilandi", tugash);

  return { mashqSoni, mavzuOrganildimi: (count ?? 0) >= 1 };
}

const KUNLIK_MAQSAD_MASHQ_SONI = 10;

async function kunlikFaollikniQaytaIshlash(oquvchiId: number): Promise<void> {
  const supabase = createServiceRoleClient();
  const bugun = mahalliySana();

  const { data: holat } = await supabase
    .from("oquvchi_holati")
    .select("oxirgi_faollik, seriya, eng_uzun_seriya, muzlatgich")
    .eq("oquvchi_id", oquvchiId)
    .maybeSingle();

  if (holat?.oxirgi_faollik === bugun) return;

  const { mashqSoni, mavzuOrganildimi } = await bugungiFaollikniOlish(oquvchiId);
  if (mashqSoni < KUNLIK_MAQSAD_MASHQ_SONI && !mavzuOrganildimi) return;

  const kecha = mahalliySana(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const eskiSeriya = holat?.seriya ?? 0;
  const engUzunSeriya = holat?.eng_uzun_seriya ?? 0;
  let muzlatgich = holat?.muzlatgich ?? 0;
  let yangiSeriya: number;

  if (!holat?.oxirgi_faollik) {
    yangiSeriya = 1;
  } else if (holat.oxirgi_faollik === kecha) {
    yangiSeriya = eskiSeriya + 1;
  } else if (muzlatgich > 0) {
    yangiSeriya = eskiSeriya + 1;
    muzlatgich -= 1;
  } else {
    yangiSeriya = 1;
  }

  if (yangiSeriya % 7 === 0) muzlatgich += 1;

  await supabase
    .from("oquvchi_holati")
    .upsert(
      {
        oquvchi_id: oquvchiId,
        oxirgi_faollik: bugun,
        seriya: yangiSeriya,
        eng_uzun_seriya: Math.max(engUzunSeriya, yangiSeriya),
        muzlatgich,
      },
      { onConflict: "oquvchi_id" },
    );

  const { boshlanish, tugash } = kunOraligi(bugun);
  const { data: bugungiBonus } = await supabase
    .from("xp_jurnal")
    .select("id")
    .eq("oquvchi_id", oquvchiId)
    .eq("sabab", "kunlik_maqsad")
    .gte("created_at", boshlanish)
    .lte("created_at", tugash)
    .maybeSingle();

  if (!bugungiBonus) {
    await xpQoshish(oquvchiId, 15, "kunlik_maqsad");
  }
}

async function nishonBerish(oquvchiId: number, kod: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { data: mavjud } = await supabase
    .from("oquvchi_nishonlari")
    .select("nishon_kodi")
    .eq("oquvchi_id", oquvchiId)
    .eq("nishon_kodi", kod)
    .maybeSingle();
  if (mavjud) return false;

  const { error } = await supabase.from("oquvchi_nishonlari").insert({ oquvchi_id: oquvchiId, nishon_kodi: kod });
  return !error;
}

/** "Qat'iyatli" nishoni — xato qilingan savolni qayta yechib to'g'ri topganda (mashq-ekrani.tsx'dagi mavjud "qayta ishlash" funksiyasidan chaqiriladi). */
export async function qatiyatliNishoniniBerish(oquvchiId: number): Promise<boolean> {
  return nishonBerish(oquvchiId, "qatiyatli");
}

async function nishonlarniTekshirish(oquvchiId: number): Promise<string[]> {
  const supabase = createServiceRoleClient();

  const { data: oquvchi } = await supabase.from("oquvchilar").select("sinf_id").eq("id", oquvchiId).maybeSingle();
  if (!oquvchi) return [];

  const { data: olinganlar } = await supabase
    .from("oquvchi_nishonlari")
    .select("nishon_kodi")
    .eq("oquvchi_id", oquvchiId);
  const olinganKodlar = new Set((olinganlar ?? []).map((o) => o.nishon_kodi));

  const yangi: string[] = [];
  async function tekshir(kod: string, shart: () => Promise<boolean>) {
    if (olinganKodlar.has(kod)) return;
    if (await shart()) yangi.push(kod);
  }

  await tekshir("birinchi_qadam", async () => {
    const { count } = await supabase
      .from("urinishlar")
      .select("id", { count: "exact", head: true })
      .eq("oquvchi_id", oquvchiId)
      .in("holati", ["tugallangan", "vaqt_tugadi"]);
    return (count ?? 0) >= 1;
  });

  await tekshir("yuzlik", async () => {
    const { data } = await supabase.from("mashq_sessiyalar").select("savol_soni").eq("oquvchi_id", oquvchiId);
    return (data ?? []).reduce((y, m) => y + m.savol_soni, 0) >= 100;
  });

  await tekshir("haftalik_alangali", async () => {
    const { data } = await supabase
      .from("oquvchi_holati")
      .select("eng_uzun_seriya")
      .eq("oquvchi_id", oquvchiId)
      .maybeSingle();
    return (data?.eng_uzun_seriya ?? 0) >= 7;
  });

  await tekshir("oylik", async () => {
    const { data } = await supabase
      .from("oquvchi_holati")
      .select("eng_uzun_seriya")
      .eq("oquvchi_id", oquvchiId)
      .maybeSingle();
    return (data?.eng_uzun_seriya ?? 0) >= 30;
  });

  await tekshir("benuqson", async () => {
    const { count } = await supabase
      .from("urinishlar")
      .select("id", { count: "exact", head: true })
      .eq("oquvchi_id", oquvchiId)
      .eq("ball_foiz", 100);
    return (count ?? 0) >= 1;
  });

  await tekshir("mavzu_ustasi", async () => {
    const { data: mavzular } = await supabase.from("mavzular").select("id, fan_id").eq("sinf_id", oquvchi.sinf_id);
    if (!mavzular || mavzular.length === 0) return false;

    const fanMavzulari = new Map<number, number[]>();
    for (const m of mavzular) {
      const royxat = fanMavzulari.get(m.fan_id) ?? [];
      royxat.push(m.id);
      fanMavzulari.set(m.fan_id, royxat);
    }

    const { data: progresslar } = await supabase
      .from("progress")
      .select("mavzu_id")
      .eq("oquvchi_id", oquvchiId)
      .eq("organildi", true);
    const organilganIdlar = new Set((progresslar ?? []).map((p) => p.mavzu_id));

    for (const mavzuIdlari of fanMavzulari.values()) {
      if (mavzuIdlari.every((id) => organilganIdlar.has(id))) return true;
    }
    return false;
  });

  await tekshir("tong_qushi", async () => {
    const { data } = await supabase.from("mashq_sessiyalar").select("boshlandi").eq("oquvchi_id", oquvchiId);
    return (data ?? []).some((m) => mahalliyVaqt(new Date(m.boshlandi)).getUTCHours() < 8);
  });

  await tekshir("kashfiyotchi", async () => {
    const { data } = await supabase.from("mashq_sessiyalar").select("fan_id").eq("oquvchi_id", oquvchiId);
    const fanlar = new Set((data ?? []).map((m) => m.fan_id).filter((id): id is number => id !== null));
    return fanlar.size >= 5;
  });

  await tekshir("sinf_faxri", async () => {
    const { data: sinfdoshlar } = await supabase.from("oquvchilar").select("id").eq("sinf_id", oquvchi.sinf_id);
    const idlar = (sinfdoshlar ?? []).map((s) => s.id);
    if (idlar.length === 0) return false;

    const { data: holatlar } = await supabase
      .from("oquvchi_holati")
      .select("oquvchi_id, jami_xp")
      .in("oquvchi_id", idlar)
      .order("jami_xp", { ascending: false })
      .limit(1);

    return holatlar?.[0]?.oquvchi_id === oquvchiId && (holatlar[0].jami_xp ?? 0) > 0;
  });

  await tekshir("kitobxon", async () => {
    const { data: korilganlar } = await supabase
      .from("material_korildi")
      .select("material_id, materiallar(turi)")
      .eq("oquvchi_id", oquvchiId)
      .returns<{ material_id: number; materiallar: { turi: string } | null }[]>();
    const maruzaSoni = (korilganlar ?? []).filter((k) => k.materiallar?.turi === "maruza").length;
    return maruzaSoni >= 20;
  });

  await tekshir("marafonchi", async () => {
    const { data } = await supabase.from("mashq_sessiyalar").select("boshlandi, savol_soni").eq("oquvchi_id", oquvchiId);
    const kunlik = new Map<string, number>();
    for (const m of data ?? []) {
      const sana = mahalliySana(new Date(m.boshlandi));
      kunlik.set(sana, (kunlik.get(sana) ?? 0) + m.savol_soni);
    }
    return Array.from(kunlik.values()).some((soni) => soni >= 100);
  });

  if (yangi.length > 0) {
    await supabase.from("oquvchi_nishonlari").insert(yangi.map((kod) => ({ oquvchi_id: oquvchiId, nishon_kodi: kod })));
  }

  return yangi;
}

export interface XpNatijasi {
  darajaOshdimi: boolean;
  yangiDaraja: number;
  yangiNishonlar: string[];
}

/**
 * Asosiy kirish nuqtasi — mashq/organish/test oqimlaridan chaqiriladi.
 * XP qo'shadi, kunlik seriya/maqsadni qayta hisoblaydi va yangi
 * nishonlarni tekshiradi.
 */
export async function xpBerish(oquvchiId: number, miqdor: number, sabab: string): Promise<XpNatijasi> {
  const supabase = createServiceRoleClient();

  const { data: boshlangich } = await supabase
    .from("oquvchi_holati")
    .select("daraja")
    .eq("oquvchi_id", oquvchiId)
    .maybeSingle();
  const eskiDaraja = boshlangich?.daraja ?? 1;

  await xpQoshish(oquvchiId, miqdor, sabab);
  await kunlikFaollikniQaytaIshlash(oquvchiId);
  const yangiNishonlar = await nishonlarniTekshirish(oquvchiId);

  const { data: yakuniy } = await supabase
    .from("oquvchi_holati")
    .select("daraja")
    .eq("oquvchi_id", oquvchiId)
    .maybeSingle();
  const yangiDaraja = yakuniy?.daraja ?? eskiDaraja;

  return { darajaOshdimi: yangiDaraja > eskiDaraja, yangiDaraja, yangiNishonlar };
}

export interface OquvchiHolati {
  jamiXp: number;
  daraja: number;
  seriya: number;
  muzlatgich: number;
  avatar: string;
  nishonlarSoni: number;
  bugungiMaqsad: { joriy: number; maqsad: number; bajarildimi: boolean };
}

export async function oquvchiHolatiniOl(oquvchiId: number): Promise<OquvchiHolati> {
  const supabase = createServiceRoleClient();
  const { data: holat } = await supabase
    .from("oquvchi_holati")
    .select("jami_xp, daraja, seriya, muzlatgich, avatar")
    .eq("oquvchi_id", oquvchiId)
    .maybeSingle();

  const { count: nishonlarSoni } = await supabase
    .from("oquvchi_nishonlari")
    .select("nishon_kodi", { count: "exact", head: true })
    .eq("oquvchi_id", oquvchiId);

  const { mashqSoni, mavzuOrganildimi } = await bugungiFaollikniOlish(oquvchiId);

  return {
    jamiXp: holat?.jami_xp ?? 0,
    daraja: holat?.daraja ?? 1,
    seriya: holat?.seriya ?? 0,
    muzlatgich: holat?.muzlatgich ?? 0,
    avatar: holat?.avatar ?? "oddiy",
    nishonlarSoni: nishonlarSoni ?? 0,
    bugungiMaqsad: {
      joriy: Math.min(mashqSoni, KUNLIK_MAQSAD_MASHQ_SONI),
      maqsad: KUNLIK_MAQSAD_MASHQ_SONI,
      bajarildimi: mavzuOrganildimi || mashqSoni >= KUNLIK_MAQSAD_MASHQ_SONI,
    },
  };
}

export interface Nishon {
  kod: string;
  nomi: string;
  tavsif: string;
  ikonka: string;
  olinganmi: boolean;
}

export async function oquvchiNishonlariniOl(oquvchiId: number): Promise<Nishon[]> {
  const supabase = createServiceRoleClient();
  const [{ data: barchaNishonlar }, { data: olinganlar }] = await Promise.all([
    supabase.from("nishonlar").select("kod, nomi, tavsif, ikonka"),
    supabase.from("oquvchi_nishonlari").select("nishon_kodi").eq("oquvchi_id", oquvchiId),
  ]);
  const olinganKodlar = new Set((olinganlar ?? []).map((o) => o.nishon_kodi));

  return (barchaNishonlar ?? []).map((n) => ({ ...n, olinganmi: olinganKodlar.has(n.kod) }));
}

export interface SinfReytingi {
  sinfNomi: string;
  jamiXp: number;
}

/** Bu haftagi (dushanbadan boshlab) sinflar reytingi — shaxsiy emas (5.5-band). */
export async function sinfReytinginiOl(): Promise<SinfReytingi[]> {
  const supabase = createServiceRoleClient();
  const hozir = mahalliyVaqt(new Date());
  const haftaKuni = (hozir.getUTCDay() + 6) % 7; // 0=dushanba
  const haftaBoshi = new Date(hozir);
  haftaBoshi.setUTCDate(hozir.getUTCDate() - haftaKuni);
  haftaBoshi.setUTCHours(0, 0, 0, 0);
  const haftaBoshiUTC = new Date(haftaBoshi.getTime() - TASHKENT_OFSET_MS).toISOString();

  const { data: jurnallar } = await supabase.from("xp_jurnal").select("oquvchi_id, miqdor").gte("created_at", haftaBoshiUTC);
  if (!jurnallar || jurnallar.length === 0) return [];

  const oquvchiXpXaritasi = new Map<number, number>();
  for (const j of jurnallar) {
    oquvchiXpXaritasi.set(j.oquvchi_id, (oquvchiXpXaritasi.get(j.oquvchi_id) ?? 0) + j.miqdor);
  }

  const { data: oquvchilar } = await supabase
    .from("oquvchilar")
    .select("id, sinflar(nomi)")
    .in("id", Array.from(oquvchiXpXaritasi.keys()))
    .returns<{ id: number; sinflar: { nomi: string } | null }[]>();

  const sinfXpXaritasi = new Map<string, number>();
  for (const o of oquvchilar ?? []) {
    const nomi = o.sinflar?.nomi ?? "Noma'lum";
    sinfXpXaritasi.set(nomi, (sinfXpXaritasi.get(nomi) ?? 0) + (oquvchiXpXaritasi.get(o.id) ?? 0));
  }

  return Array.from(sinfXpXaritasi.entries())
    .map(([sinfNomi, jamiXp]) => ({ sinfNomi, jamiXp }))
    .sort((a, b) => b.jamiXp - a.jamiXp)
    .slice(0, 5);
}

export async function avatarniTanlash(oquvchiId: number, avatarKodi: string): Promise<{ xato?: string }> {
  const avatar = AVATARLAR.find((a) => a.kod === avatarKodi);
  if (!avatar) return { xato: "Noma'lum avatar" };

  const supabase = createServiceRoleClient();
  const { data: holat } = await supabase.from("oquvchi_holati").select("jami_xp").eq("oquvchi_id", oquvchiId).maybeSingle();
  const jamiXp = holat?.jami_xp ?? 0;
  if (jamiXp < avatar.ochilishXp) return { xato: "Bu avatar hali ochilmagan" };

  await supabase.from("oquvchi_holati").upsert({ oquvchi_id: oquvchiId, avatar: avatarKodi }, { onConflict: "oquvchi_id" });
  return {};
}
