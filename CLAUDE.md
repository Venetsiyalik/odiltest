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

**Diqqat:** middleware `/public` ostidagi statik fayllarni (masalan
`/favicon.ico`, `/robots.txt`, keyinchalik qo'shiladigan rasm/shrift/PDF
fayllari) ham avtomatik aniqlab, rewrite qilmay o'tkazib yuboradi — bu
oxirgi segmentda nuqta borligiga (`/\.[a-zA-Z0-9]+$/`) qarab aniqlanadi.
Yangi statik marshrut qo'shsangiz, bu qoida uni allaqachon qamrab oladi;
alohida istisno qo'shish shart emas.

## shadcn/ui — Base UI ekanligi (muhim eslatma)

Bu loyihada `npx shadcn@latest add ...` **Radix** emas, **Base UI**
(`@base-ui/react`) asosidagi komponentlarni o'rnatadi. Bu ikkita amaliy
farqni keltirib chiqaradi:

1. **`asChild` yo'q.** Radix'dagi `<Trigger asChild><Button/></Trigger>`
   o'rniga Base UI'da `render` prop ishlatiladi:
   `<Trigger render={<Button variant="outline" size="sm" />}>Matn</Trigger>`.
2. **`<Select.Value>` xom qiymatni ko'rsatadi, tanlangan variant matnini
   emas** — agar `Select.Root`ga `items` prop (value→label xaritasi)
   berilmasa. Shu sababli har bir `<Select>`ga
   [`royxatdanItemlar()`](lib/utils/select-items.ts) orqali `items` prop
   qo'shilishi **shart**, aks holda foydalanuvchi "Informatika" o'rniga "1"
   ko'radi (yoki value popup ochiq holatda tasodifan to'g'ri ko'rinib,
   keyingi klikda placeholderga qaytadi — juda chalg'ituvchi bug).
   `onValueChange` ham `(value: string | null, ...) => void` imzoga ega —
   `null` holatini har doim `?? ""` yoki sentinel qiymat bilan qopla.
3. **`<Button render={<Link .../>}>` — `nativeButton={false}` qo'shilishi
   kerak.** `Button` standart holatda `nativeButton=true`, ya'ni `render`
   orqali chiqarilgan element haqiqiy `<button>` bo'lishini kutadi. Uni
   `<Link>` (yoki boshqa `<a>`) bilan almashtirsangiz, konsolda ogohlantirish
   chiqadi — `nativeButton={false}` shuni bartaraf qiladi.

## Papka strukturasi

```
/app
  /talaba            → odiltest.uz (middleware orqali)
    /kirish  /menyu  /organish  /mashq  /test  /natijalar
  /admin             → admin.odiltest.uz (middleware orqali)
    /kirish  /dashboard  /spravochniklar  /savollar  /savollar/import
    /testlar  /oquvchilar  /materiallar  /natijalar  /foydalanuvchilar
  /api
    /auth/oquvchi     /auth/chiqish
    /urinish/boshlash /urinish/javob /urinish/yakunlash
    /hisobot/pdf
/components  /ui  /student  /admin
/lib  supabase/  parsers/  actions/  pdf/  auth/  i18n/  utils/
/supabase/migrations
/public/fonts/DejaVuSans.ttf   ← PDF uchun (5-bosqichda qo'shiladi)
```

**Eslatma:** texnik topshiriqda savol import `/api/import/excel` va
`/api/import/word` route handler sifatida rejalashtirilgan edi. Amalda
Next.js Server Actions (`lib/actions/import.ts`) orqali amalga oshirildi —
loyihaning boshqa barcha yozish amallari (CRUD) shu patternda, va Server
Action `FormData` ichidagi `File`ni to'g'ridan-to'g'ri qabul qila oladi,
shuning uchun alohida route handler ortiqcha bo'lardi. `/api` ostida hozircha
faqat kelajakdagi bosqichlarga tegishli (talaba autentifikatsiyasi, test
topshirish, PDF) marshrutlar qoladi — ular haqiqatan ham tashqi/maxsus HTTP
semantikasi (cookie, fayl yuklab berish) talab qiladi.

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
- **2-bosqich (Spravochniklar + savollar):** yakunlangan — Fan/Sinf/Mavzu
  CRUD (`/spravochniklar`), o'quvchilar CRUD + kirish kodi generatsiyasi
  (`/oquvchilar`), savollar CRUD (filtr, rasm yuklash, ommaviy amallar,
  statistika) (`/savollar`). `0002_referans_va_storage.sql` migratsiyasi
  qo'llangan (FK'lar restrict qilindi + `savol-rasmlari` Storage bucket).
  Barchasi brauzerda real Supabase bilan sinovdan o'tkazildi.
- **3-bosqich (Import):** yakunlangan — Excel/CSV va Word (.docx) fayllardan
  savol import qilish (`/savollar/import`), ko'rib chiqish jadvali
  (tayyor/ogohlantirish/xato holati bilan), yangi fan/mavzuni tasdiqlagandan
  keyin yaratish, takroriy savolni normalizatsiya qilingan matn bo'yicha
  aniqlash, import natijasi va xatolar Excel qilib yuklab olinadi
  (`lib/parsers/excel.ts`, `lib/parsers/word.ts`, `lib/actions/import.ts`).
  `0003_mavzular_oqituvchi_huquqi.sql` migratsiyasi qo'llangan. Shu yo'l-
  yo'lakay ikkita muhim bug topilib tuzatildi:
  - middleware `/public` ostidagi statik fayllarni (kengaytmali yo'llarni)
    ham noto'g'ri rewrite qilib, 404 qilib qo'yayotgan edi;
  - Base UI `Button`ni `render={<Link/>}` bilan ishlatganda `nativeButton`
    ogohlantirishi (yuqoridagi Base UI bo'limiga qarang).
  `xlsx` npm reestridagi zaif versiya emas, SheetJS CDN'idagi tuzatilgan
  build orqali o'rnatilgan (`package.json`dagi tarball URL'ga qarang).
- Keyingi: **4-bosqich** — o'quvchi kirishi (kirish kodi, sessiya) va test
  topshirish ekrani.
