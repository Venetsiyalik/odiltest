/**
 * 12 ta nishonning odam o'qiy oladigan ma'lumotlari (REDIZAYN.md 5.3-band).
 * Klient komponentlarda ishlatish uchun — server-only kod (Supabase
 * service_role) import qilmaydi. Qiymatlar `supabase/migrations/
 * 0006_redizayn_gamifikatsiya.sql`dagi urug' (seed) ma'lumotlari bilan
 * mos bo'lishi SHART (u yerda saqlanadi, bu yerda faqat ko'rsatish uchun
 * nusxasi turadi).
 */
export interface NishonMalumoti {
  kod: string;
  nomi: string;
  tavsif: string;
  ikonka: string;
}

export const NISHONLAR_ROYXATI: NishonMalumoti[] = [
  { kod: "birinchi_qadam", nomi: "Birinchi qadam", tavsif: "Birinchi rasmiy testni topshirdi", ikonka: "🥾" },
  { kod: "yuzlik", nomi: "Yuzlik", tavsif: "100 ta mashq savolini yechdi", ikonka: "💯" },
  { kod: "haftalik_alangali", nomi: "Haftalik alangali", tavsif: "7 kunlik seriyaga yetdi", ikonka: "🔥" },
  { kod: "oylik", nomi: "Oylik", tavsif: "30 kunlik seriyaga yetdi", ikonka: "🏅" },
  { kod: "mavzu_ustasi", nomi: "Mavzu ustasi", tavsif: "Bir fanning barcha mavzusini o'rgandi", ikonka: "📚" },
  { kod: "benuqson", nomi: "Benuqson", tavsif: "Testda 100% natija ko'rsatdi", ikonka: "💎" },
  { kod: "tong_qushi", nomi: "Tong qushi", tavsif: "Soat 08:00 gacha mashq qildi", ikonka: "🌅" },
  { kod: "qatiyatli", nomi: "Qat'iyatli", tavsif: "Xato qilgan savolni qayta yechib, to'g'ri topdi", ikonka: "💪" },
  { kod: "kashfiyotchi", nomi: "Kashfiyotchi", tavsif: "5 xil fanda mashq qildi", ikonka: "🧭" },
  { kod: "sinf_faxri", nomi: "Sinf faxri", tavsif: "Sinfda eng ko'p XP to'pladi", ikonka: "👑" },
  { kod: "kitobxon", nomi: "Kitobxon", tavsif: "20 ta ma'ruzani o'qidi", ikonka: "📖" },
  { kod: "marafonchi", nomi: "Marafonchi", tavsif: "Bir kunda 100 ta savol yechdi", ikonka: "🏃" },
];

export function nishonMalumotiniOl(kod: string): NishonMalumoti {
  return (
    NISHONLAR_ROYXATI.find((n) => n.kod === kod) ?? {
      kod,
      nomi: kod,
      tavsif: "",
      ikonka: "🏆",
    }
  );
}
