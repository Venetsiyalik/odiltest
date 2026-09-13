import { headers } from "next/headers";
import type { MetadataRoute } from "next";
import { darajalarStatistikasiniOl, qidiruvIndeksiniOl } from "@/lib/redizayn/dashboard";
import { saytUrliniOl } from "@/lib/utils/site-url";

const ADMIN_HOST_PREFIX = "admin.";

/**
 * Faqat kodsiz, hammaga ochiq Dashboard sahifalarini ro'yxatlaydi (`/`,
 * `/sinf/[daraja]`, `/sinf/[daraja]/[fanId]`, `.../[mavzuId]`) — bular
 * REDIZAYN.md 2-3-bosqichlarida qurilgan, kirish talab qilmaydigan yagona
 * sahifalar. Admin panelda (boshqa host) bo'sh ro'yxat qaytariladi —
 * `robots.ts` ham uni butunlay disallow qiladi.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get("host") ?? "";
  if (host.startsWith(ADMIN_HOST_PREFIX)) return [];

  const bazaUrl = saytUrliniOl();
  const hozir = new Date();

  const [darajalar, qidiruvIndeksi] = await Promise.all([
    darajalarStatistikasiniOl(),
    qidiruvIndeksiniOl(),
  ]);

  const sahifalar: MetadataRoute.Sitemap = [
    { url: bazaUrl, lastModified: hozir, changeFrequency: "daily", priority: 1 },
  ];

  for (const d of darajalar) {
    if (!d.mavjudmi) continue;
    sahifalar.push({
      url: `${bazaUrl}/sinf/${d.daraja}`,
      lastModified: hozir,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const el of qidiruvIndeksi) {
    const url =
      el.turi === "fan"
        ? `${bazaUrl}/sinf/${el.daraja}/${el.fanId}`
        : `${bazaUrl}/sinf/${el.daraja}/${el.fanId}/${el.mavzuId}`;
    sahifalar.push({
      url,
      lastModified: hozir,
      changeFrequency: "weekly",
      priority: el.turi === "fan" ? 0.7 : 0.6,
    });
  }

  return sahifalar;
}
