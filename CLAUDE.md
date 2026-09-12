# Odil School — o'quv va baholash platformasi

Texnik topshiriq: `TEXNIK-TOPSHIRIQ.md` orqali berilgan (dastlab
`D:\Downloads\TEXNIK-TOPSHIRIQ.md`). Har qanday nomuvofiqlik yuzaga kelsa,
o'sha hujjat asosiy manba hisoblanadi.

## Loyiha qisqacha

Ikki mustaqil qism, bitta Next.js loyihasida:

| Qism | Domen (prod) | Papka | Kim ishlatadi |
|---|---|---|---|
| O'quvchi ilovasi | `odiltest.uz` | `/app/talaba` | O'quvchilar (smart ekran, telefon) |
| Admin panel | `admin.odiltest.uz` | `/app/admin` | Direktor, o'qituvchilar |

**Muhim arxitektura qarori:** texnik topshiriqda `/app/(student)` va
`/app/(admin)` route-group sifatida yozilgan edi, lekin ikkala tomonda ham
bir xil marshrut nomi bor (masalan `natijalar`) — Next.js route group'lari
URL'ga ta'sir qilmagani uchun bu ikkita sahifa to'qnashadi. Shu sababli
haqiqiy (route-group bo'lmagan) `/app/admin` va `/app/talaba` papkalari
ishlatiladi; [middleware.ts](middleware.ts) `Host` sarlavhasi asosida
so'rovni tegishli papkaga **rewrite** qiladi (brauzer manzili o'zgarmaydi).
Ichki link/redirect yozganda har doim "tashqi" yo'lni yozing (masalan
`/dashboard`, `/kirish`), `/admin` yoki `/talaba` prefiksini emas — middleware
buni har bir so'rovda avtomatik qo'shadi.

Lokal muhitda ikkala tomonni tekshirish uchun: `http://localhost:3000` (talaba)
va `http://admin.localhost:3000` (admin) — zamonaviy brauzerlar `*.localhost`
manzillarini hosts faylisiz `127.0.0.1`ga yo'naltiradi.

## Papka strukturasi

```
/app
  /talaba            → odiltest.uz (middleware orqali)
    /kirish  /menyu  /organish  /mashq  /test  /natijalar
  /admin             → admin.odiltest.uz (middleware orqali)
    /kirish  /dashboard  /savollar  /testlar  /oquvchilar
    /materiallar  /natijalar  /foydalanuvchilar
  /api
    /auth/oquvchi     /auth/chiqish
    /urinish/boshlash /urinish/javob /urinish/yakunlash
    /import/excel     /import/word
    /hisobot/pdf
/components  /ui  /student  /admin
/lib  supabase/  parsers/  pdf/  auth/  i18n/  utils/
/supabase/migrations
/public/fonts/DejaVuSans.ttf   ← PDF uchun (5-bosqichda qo'shiladi)
```

## Kod uslubi

- TypeScript **strict**, `any` ishlatilmaydi.
- Server komponent — standart tanlov. `"use client"` faqat interaktivlik
  (forma, state, event handler) kerak bo'lganda.
- Nomlash: papka va marshrutlar **o'zbekcha** (`savollar`, `natijalar`,
  `oquvchilar`), kod ichidagi o'zgaruvchi/funksiya nomlari ham asosan
  o'zbekcha yoziladi chunki domen atamalari (savol, urinish, biriktirish)
  ingliz tiliga to'g'ri o'girilmaydi — mavjud fayllardagi uslubga ergashing
  (`lib/auth/admin.ts`, `lib/supabase/*` ga qarang).
- Barcha foydalanuvchiga ko'rinadigan matn `lib/i18n/uz.ts` faylida;
  komponent ichida qattiq kodlangan o'zbekcha matn yozilmasin.
- Baza o'zgarishi har doim `supabase/migrations/NNNN_*.sql` fayli orqali,
  qo'lda Supabase Studio'da emas.

## Smart ekran UI qoidalari (talaba tomoni — eng ko'p unutiladigan qism)

- Minimal bosiladigan element: **72×72 px**. Variant tugmalari butun qator
  kengligida, balandligi kamida **96 px**.
- Asosiy matn **24 px** dan kichik emas; savol matni 32–40 px; sarlavhalar
  48 px+.
- `hover`ga tayanmang — holat `:active` va tanlangan holat (qalin ramka +
  fon rangi + ✓ belgisi) orqali ko'rsatiladi, faqat rang bilan emas.
- Gorizontal layout, minimal scroll — har bir savol bitta ekranga sig'sin.
- Yuqori kontrast (WCAG AA minimum), animatsiyalar 150–200 ms.
- Kirish kodi ekranida HTML `<input>` fokusiga tayanmaydigan o'z ichki
  raqamli klaviatura (0–9, o'chirish).
- Umumiy qurilma (kiosk) rejimi: chiqishda sessiya to'liq tozalanadi,
  3 daqiqa harakatsizlikdan keyin avtomatik chiqish (test jarayonida bundan
  mustasno), kirish kodi brauzerda saqlanmaydi.
- Maqsadli o'lchamlar: `1920×1080` (asosiy), `1280×800`, `768`, `390`.
  Dizayn `lg`/`xl`dan boshlanadi, keyin telefonga siqiladi.

## Xavfsizlik qoidalari (buzilmaydi)

1. `savollar.togri_javob` hech qachon klientga yuborilmaydi — API faqat
   matn va 4 variantni qaytaradi.
2. Javob tekshiruvi faqat serverda (`/api/urinish/javob`).
3. Taymer serverda hisoblanadi (`urinishlar.boshlandi` asosida); klientdagi
   taymer faqat ko'rsatkich.
4. O'quvchi sessiyasi `httpOnly`, `secure`, `sameSite=lax` cookie;
   `localStorage`da token saqlanmaydi.
5. RLS yoqilgan (`supabase/migrations/0001_init.sql`ga qarang). O'quvchiga
   tegishli yozuvlar faqat `service_role` orqali server tomonda yoziladi —
   `lib/supabase/server.ts`dagi `createServiceRoleClient()`.
6. Kirish kodini topishga urinish: bir IP'dan 5 marta xato → 10 daqiqa blok
   (`kirish_urinishlari` jadvali).
7. O'qituvchi `biriktirish` jadvalida yo'q fan/sinf ma'lumotini na o'qiy, na
   yoza oladi — bu **server tomonda** (RLS + API tekshiruvi) ta'minlanadi,
   faqat UI'da yashirish yetarli emas.
8. Yuklanadigan fayllar: hajmi ≤10 MB, faqat `.xlsx .csv .docx .png .jpg .webp`.
9. `.env` hech qachon commit qilinmaydi. `SUPABASE_SERVICE_ROLE_KEY` faqat
   server tomonda ishlatiladi.

## Muhit o'zgaruvchilari

`.env.example` faylida ro'yxati bor:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=
```

## Buyruqlar

```bash
npm run dev         # lokal server (Turbopack)
npm run build        # production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

Har bir PR'dan oldin `npm run typecheck && npm run lint` xatosiz o'tishi shart.

## Ish tartibi

- Har bir bosqich — alohida branch, `feat/2-savollar` ko'rinishida.
- Bir PR ichida bir bosqichdan ortiq ish qilinmasin.
- Bosqichlar ro'yxati va qabul qilish mezonlari `TEXNIK-TOPSHIRIQ.md`
  11 va 13-bo'limlarida.

## Hozirgi holat

- **1-bosqich (Poydevor):** yakunlangan — Next.js 15 + TS strict +
  Tailwind v4 + shadcn/ui, subdomen middleware, Supabase klient/server
  yordamchilari, boshlang'ich migratsiya (`0001_init.sql`), admin
  autentifikatsiya (Supabase Auth) va bo'sh admin/talaba sahifalari.
- Supabase loyihasi ulangan, `0001_init.sql` bazaga qo'llangan, birinchi
  admin foydalanuvchisi yaratilgan (`scripts/seed-admin.mjs` orqali), admin
  login/logout brauzerda real sinovdan o'tkazilgan — ishlaydi.
- Keyingi: **2-bosqich** — admin spravochniklar (fan/sinf/mavzu/o'quvchi)
  va savollar CRUD.
