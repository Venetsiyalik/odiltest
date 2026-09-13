import { headers } from "next/headers";
import type { MetadataRoute } from "next";
import { saytUrliniOl } from "@/lib/utils/site-url";

const ADMIN_HOST_PREFIX = "admin.";

/**
 * `middleware.ts`dagi kabi ikkala domen ham shu bitta faylga tushadi
 * (`/robots.txt` kengaytmali bo'lgani uchun rewrite'dan istisno) — shuning
 * uchun qaysi qoida qaytarilishi `Host` sarlavhasiga qarab hal qilinadi.
 * Admin panel hech qachon indekslanmasin (login sahifasi ham qidiruvda
 * chiqmasligi kerak) — talaba tomonida esa faqat kodsiz, hammaga ochiq
 * sahifalar (`/`, `/sinf/...`) qidiruv tizimlariga ochiq, kirish talab
 * qiladigan yo'llar yo'q.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") ?? "";

  if (host.startsWith(ADMIN_HOST_PREFIX)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/kirish",
        "/menyu",
        "/mashq",
        "/organish",
        "/test",
        "/natijalar",
        "/urinish",
        "/nishonlar",
        "/dizayn",
        "/offline",
        "/api",
      ],
    },
    sitemap: `${saytUrliniOl()}/sitemap.xml`,
  };
}
