import { NextResponse, type NextRequest } from "next/server";

const ADMIN_HOST_PREFIX = "admin.";

/**
 * Ikkita mustaqil qism bitta Next.js loyihasida yashaydi:
 *  - admin.<domen>  → /app/admin/**
 *  - <domen>         → /app/talaba/**
 *
 * Route group ((admin)/(student)) ishlatilmadi, chunki ikkala tomonda ham
 * bir xil marshrut nomi bor (masalan "natijalar") — route group'lar URL'ga
 * ta'sir qilmagani uchun bu ikkita sahifa to'qnashadi. Shuning uchun haqiqiy
 * papkalar (/admin, /talaba) ishlatiladi va middleware so'rovni host'ga
 * qarab shu papkaga qayta yo'naltiradi (rewrite — brauzerdagi manzil
 * o'zgarmaydi, foydalanuvchi buni sezmaydi).
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  // API, Next.js ichki so'rovlari va /public ostidagi statik fayllarga
  // (kengaytmali oxirgi segment — masalan .ico, .xlsx, .png) tegilmaydi.
  // Aks holda masalan /favicon.ico yoki /robots.txt kabi fayllar ham
  // /admin yoki /talaba ostiga "rewrite" qilinib, 404 bo'lib qolar edi.
  // /icons va /opengraph-image — Next.js fayl konvensiyalari
  // (app/icons/*/route.tsx, app/opengraph-image.tsx), kengaytmasiz URL
  // bilan xizmat qiladi, shu sababli istisno qilinadi.
  // /dizayn — ichki dizayn tizimi demo sahifasi (REDIZAYN.md), o'quvchi
  // yoki admin tomoniga tegishli emas, shuning uchun ikkala domenda ham
  // rewrite qilinmay to'g'ridan-to'g'ri ochiladi.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/dizayn") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const isAdminHost = host.startsWith(ADMIN_HOST_PREFIX);
  const targetPrefix = isAdminHost ? "/admin" : "/talaba";

  if (pathname.startsWith(targetPrefix)) {
    return NextResponse.next();
  }

  // Boshqa tomonning marshrutiga to'g'ridan-to'g'ri kirishga urinish (masalan
  // asosiy domendan /admin/dashboard so'ralsa) — 404 uchun qayta yo'naltirilmaydi,
  // shunchaki o'z tomonining ildiziga olib boriladi.
  const otherPrefix = isAdminHost ? "/talaba" : "/admin";
  const cleanPath = pathname.startsWith(otherPrefix) ? "/" : pathname;

  const url = request.nextUrl.clone();
  url.pathname = `${targetPrefix}${cleanPath === "/" ? "" : cleanPath}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
