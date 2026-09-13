/**
 * Sayt manzili (`.env.local`dagi `NEXT_PUBLIC_SITE_URL`) — sitemap, robots
 * va OG metadata'da mutlaq URL yasash uchun yagona manba. O'zgaruvchi
 * sozlanmagan bo'lsa ham (masalan lokal muhitda unutilgan holat), ishlab
 * chiqarish domeniga ("odiltest.uz", `CLAUDE.md`da hujjatlashtirilgan) tushib
 * qoladi — sitemap/robots hech qachon `localhost` bilan generatsiya bo'lib
 * qolmasligi uchun.
 */
export function saytUrliniOl(): string {
  const qiymat = process.env.NEXT_PUBLIC_SITE_URL;
  if (qiymat?.startsWith("http") && !qiymat.includes("localhost")) {
    return qiymat.replace(/\/$/, "");
  }
  return "https://odiltest.uz";
}
