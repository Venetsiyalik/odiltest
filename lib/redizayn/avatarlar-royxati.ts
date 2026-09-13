/**
 * Avatar katalogi (REDIZAYN.md 5.4-band). Alohida, server-only kod
 * (Supabase service_role) import qilmaydigan faylda — chunki bu klient
 * komponentlarida (avatar tanlagich) ham ishlatiladi.
 *
 * Haqiqiy Sherbek kiyimlari rasmlari hali yo'q (1-bosqichdagi qaror) —
 * hozircha emoji bilan ifodalanadi, keyin rasm bilan almashtirish oson.
 */
export interface Avatar {
  kod: string;
  nomi: string;
  emoji: string;
  ochilishXp: number;
}

export const AVATARLAR: Avatar[] = [
  { kod: "oddiy", nomi: "Oddiy", emoji: "🙂", ochilishXp: 0 },
  { kod: "kosmonavt", nomi: "Kosmonavt", emoji: "🧑‍🚀", ochilishXp: 0 },
  { kod: "sportchi", nomi: "Sportchi", emoji: "🤸", ochilishXp: 0 },
  { kod: "shifokor", nomi: "Shifokor", emoji: "🧑‍⚕️", ochilishXp: 200 },
  { kod: "olim", nomi: "Olim", emoji: "🧑‍🔬", ochilishXp: 500 },
  { kod: "sayohatchi", nomi: "Sayohatchi", emoji: "🧳", ochilishXp: 1000 },
];
