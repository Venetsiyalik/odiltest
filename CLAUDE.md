# Odil School — o'quv va baholash platformasi

Texnik topshiriq: `TEXNIK-TOPSHIRIQ.md` orqali berilgan (dastlab
`D:\Downloads\TEXNIK-TOPSHIRIQ.md`). Har qanday nomuvofiqlik yuzaga kelsa,
o'sha hujjat asosiy manba hisoblanadi. 7-bosqichdan keyin (barcha 7
bosqich yakunlangach) `REDIZAYN.md` orqali qo'shimcha topshiriq berildi —
ko'rinishni Duolingo/Blooket uslubida yangilash va yangi o'quv
materiallari/gamifikatsiya modulini qo'shish. Bu ikkinchi hujjatning
o'zi ham bosqichma-bosqich, alohida bo'lim sifatida quyida hujjatlanadi.

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
alohida istisno qo'shish shart emas. Istisno: `/icons/*` (PWA manifest
ikonkalari, `app/icons/192|512/route.tsx`) kengaytmasiz URL bilan xizmat
qiladi, shuning uchun middleware'da alohida ro'yxatga olingan.

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
    /kirish  /menyu  /organish  /mashq  /test  /natijalar  /offline
  /admin             → admin.odiltest.uz (middleware orqali)
    /kirish  /dashboard  /spravochniklar  /savollar  /savollar/import
    /testlar  /testlar/[id]/kuzatish  /oquvchilar  /materiallar
    /natijalar  /foydalanuvchilar
  /api
    /auth/oquvchi     /auth/chiqish
    /urinish/boshlash /urinish/javob /urinish/yakunlash
    /mashq/boshlash /mashq/savol /mashq/javob /mashq/yakunlash
    /organish/yakunlash
    /hisobot/pdf/{sinf,oquvchi,kodlar}
  /icons/{192,512}     ← PWA manifest ikonkalari (next/og, 7-bosqich)
  manifest.ts          ← PWA manifest (7-bosqich)
/components  /ui  /student  /admin  kontent-korinish.tsx
/lib  supabase/  parsers/  actions/  pdf/  auth/  talaba/  i18n/  utils/
/supabase/migrations
/public/fonts/DejaVuSans*.ttf   ← PDF uchun (5-bosqichda qo'shildi)
/public/sw.js                    ← oflayn fallback service worker (7-bosqich)
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
- **4-bosqich (O'quvchi kirishi + test topshirish):** yakunlangan — brauzerda
  boshidan oxirigacha real sinovdan o'tkazildi (kirish kodi → test tanlash →
  savol javoblash → yakunlash → 2/2 · 100% · baho 5 natija to'g'ri chiqdi).
  - O'quvchi sessiyasi: `talaba_sessiya` httpOnly cookie (4 soat),
    `sessiyalar` jadvali, IP bo'yicha 5 marta xato → 10 daqiqa blok
    (`lib/auth/student.ts`, `app/api/auth/oquvchi`, `app/api/auth/chiqish`).
  - 3 daqiqa harakatsizlikdan keyin avtomatik chiqish, test jarayonida
    (`/urinish/*`) bundan mustasno (`components/student/idle-guard.tsx`).
  - Bu bosqichda **admin Testlar CRUD** ham qurildi (`/testlar`) — texnik
    topshiriqda alohida bosqich sifatida ajratilmagan edi, lekin o'quvchi
    test topshirishi uchun zaruriy old shart bo'lgani uchun shu yerda
    amalga oshirildi (`lib/actions/testlar.ts`).
  - Test topshirish: `/api/urinish/boshlash` savol havzasini tanlaydi
    (avtomatik — mavzu bo'yicha, yoki qo'lda tanlangan) va har urinish
    uchun savol+variant tartibini aralashtiradi (`lib/talaba/aralashtirish.ts`),
    `urinish_savollari.variant_tartibi`ga "ko'rsatilgan harf → asl harf"
    xaritasi sifatida saqlaydi. `/api/urinish/javob` har javobni darhol
    saqlaydi va to'g'riligini serverda tekshiradi (`togri_javob` klientga
    HECH QACHON yuborilmaydi — `lib/talaba/urinish-detali.ts` buni
    kafolatlaydi). Vaqt tugashi ham serverda (`boshlandi + vaqt_daqiqa`)
    tekshiriladi, klientdagi taymer faqat ko'rsatkich.
  - Baholash shkalasi (`lib/talaba/baholash.ts`): ≥90%→5, ≥70%→4, ≥50%→3,
    aks holda 2 — texnik topshiriqda aniq foiz berilmagan, standart
    maktab shkalasi qabul qilindi.
  - Bitta o'quvchi bir testni ikki qurilmada bir vaqtda **mustaqil**
    boshlay olmaydi: tugallanmagan urinish topilsa, yangisi yaratilmaydi,
    xuddi o'shanga qaytariladi (to'liq real-time bloklash emas, lekin
    dublikat urinish yaratilmaydi).
  - Migratsiya 0004: `urinishlar.test_id` endi "restrict" — testni
    o'chirish endi o'quvchi natijalarini yo'q qilib yubormaydi (buning
    o'rniga "Yopish" ishlatiladi).
- **5-bosqich (Natijalar + PDF):** yakunlangan — qabul mezoni (sinf
  hisoboti PDF'ida `o'`, `g'` harflari to'g'ri chiqishi) alohida
  standalone skript orqali tekshirilib tasdiqlandi.
  - Admin natijalar sahifasi (`/natijalar`): fan/sinf/test/sana
    oralig'i/o'quvchi bo'yicha filtr, jadval, sinf/test o'rtachasi, "eng
    ko'p xato qilingan savollar" tahlili (`lib/actions/natijalar.ts`).
  - 3 xil PDF (`lib/pdf/documents/*.tsx`, `@react-pdf/renderer`):
    - `/api/hisobot/pdf/sinf?testId=` — sinf natijalari hisoboti
    - `/api/hisobot/pdf/oquvchi?oquvchiId=` — bitta o'quvchi tabeli
      (fan bo'yicha guruhlangan, barcha topshirilgan testlar)
    - `/api/hisobot/pdf/kodlar?sinfId=` — kirish kodi kartochkalari
      (A4, 8 tadan, qirqish uchun) — `/oquvchilar` sahifasida tugma
  - **Shrift muammosi (6-band):** standart PDF shriftlari o'zbekcha
    `o'`/`g'` belgilarini buzadi. Yechim: DejaVu Sans (ochiq litsenziyali)
    `public/fonts/DejaVuSans*.ttf`ga qo'shildi va `lib/pdf/shrift.ts`
    orqali ro'yxatdan o'tkaziladi. **Diqqat:** Windows tizim shriftlari
    (Arial, Segoe UI) Microsoft litsenziyasiga tegishli va qonuniy
    tarqatib bo'lmaydi — shu sabab ular EMAS, balki `dejavu-fonts-ttf`
    npm paketidan bir martalik ajratib olingan DejaVu Sans ishlatildi
    (paket o'zi runtime bog'liqlik sifatida qo'shilmagan, faqat fayllar
    nusxalangan). Tasdiqlash standalone Node skripti orqali (`renderToFile`
    bilan to'g'ridan-to'g'ri, brauzer/base64 oraliq bosqichisiz) qilindi —
    brauzer orqali PDF fetch qilib base64'ga o'girish katta matnlarda
    transkripsiya xatosiga olib kelishi mumkin ekan.
  - **Muhim bug tuzatildi:** `toLocaleString("uz-UZ", ...)` / `toLocaleDateString("uz-UZ")`
    server (Node, kichik ICU) va brauzerda har xil natija berib, client
    komponentlarda hydration xatosiga olib kelayotgan edi (server
    "2026-09-12 22:23", client "12/09/2026, 22:23"). Yechim:
    `lib/utils/sana.ts`dagi qo'lda formatlovchi `sanaFormat`/`sanaVaVaqtFormat`
    — bular Intl/locale'ga umuman tayanmaydi, shuning uchun server va
    client natijasi har doim bir xil. **Hech qachon `toLocaleString`/
    `toLocaleDateString`ni "uz-UZ" locale bilan client komponentda
    ishlatilmasin** — faqat shu ikki funksiyadan foydalaniladi.
- **6-bosqich (O'rganish va mashq):** yakunlangan — brauzerda to'liq sinovdan
  o'tkazildi (admin material qo'shish → talaba nazariya/misol/o'z-o'zini
  tekshirish/yakun bosqichlaridan o'tishi → progress "1/1 o'rganildi"ga
  yangilanishi; mashq rejimida aralash savol, to'g'ri/xato fikr-mulohaza,
  "xato qilingan savollarni qayta ishlash" — barchasi ishladi).
  - **Kontent formati:** to'liq HTML rich-text muharriri o'rniga **Markdown**
    tanlandi (`react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex`,
    `components/kontent-korinish.tsx`) — qalin/ro'yxat/kod blokini,
    rasmni (`![]()`) va formulani (`$...$`/`$$...$$`, KaTeX orqali) qamraydi,
    lekin `dangerouslySetInnerHTML` kerak qilmaydi — shu bilan admin/o'qituvchi
    hisobi buzilgan taqdirda ham XSS xavfi yo'q. Admin formada yon-yon
    yozish/ko'rish (split-view preview) bor (`components/admin/material-form.tsx`).
  - Modul A (O'rganish): `/organish` → fan (progress bar bilan) → mavzu →
    4 bosqich (nazariya → misol → o'z-o'zini tekshirish, ball qo'yilmaydi →
    yakun). `progress` jadvali `organildi`/`ozini_tekshirish_foiz`ni saqlaydi
    (`lib/talaba/organish.ts`, `app/api/organish/yakunlash`).
  - Modul B (Mashq): `/mashq` → fan + mavzu (yoki "aralash") → cheksiz
    tasodifiy savol, vaqtsiz, darhol to'g'ri/xato + izoh, `mashq_sessiyalar`ga
    statistika yoziladi (baholanmaydi). "Xato qilingan savollarni qayta
    ishlash" — `faqatIdlar` filtri bilan savol havzasini xato ro'yxatiga
    cheklaydi (`lib/talaba/mashq.ts`, `app/api/mashq/*`).
  - Video material uchun YouTube havolasi `embed` URL'ga o'giriladi
    (`lib/utils/youtube.ts`).
- **7-bosqich (Sayqal):** yakunlangan — brauzerda to'liq sinovdan o'tkazildi:
  admin "Jonli kuzatish" sahifasida talaba tomonida real vaqtda test
  yechish jarayoni (jarayonda → tugatgan, javob soni, natija) kuzatildi;
  test davomida `fetch` sun'iy ravishda "oflayn" holatga o'tkazilib, javob
  localStorage navbatiga tushishi va ulanish tiklanganda (`online` hodisasi)
  avtomatik serverga jo'natilishi tasdiqlandi; "Sinf rejimi" tugmasi
  shrift/interfeysni ×1.25 kattalashtirishi va sahifa yangilanganda ham
  saqlanib qolishi tekshirildi; PWA manifest, ikonkalar va oflayn fallback
  sahifasi to'g'ri xizmat qilishi tasdiqlandi.
  - **Jonli kuzatish** (`/admin/testlar/[id]/kuzatish`): tanlangan test
    sinfidagi barcha faol o'quvchilarning holati (boshlamagan/jarayonda/
    tugatgan/vaqt tugadi), javob berilgan savollar soni va yakuniy
    natijasi — 4 soniyada bir marta polling orqali yangilanadi (alohida
    real-time kanal ochilmagan, `lib/actions/kuzatish.ts`). Faol testlar
    ro'yxatida "Jonli kuzatish" tugmasi orqali ochiladi
    (`components/admin/kuzatish-client.tsx`).
  - **Statistik tahlil:** natijalar sahifasiga "Sinf sust bo'lgan
    mavzular" tahlili qo'shildi — mavzu bo'yicha to'g'ri javob foizini
    hisoblab, eng past ko'rsatkichli mavzularni chiqaradi (kamida 3 ta
    savol-javobi bo'lgan mavzular, shovqinni kamaytirish uchun) —
    "Eng ko'p xato qilingan savollar" tahlili yonida
    (`engSustMavzularniOl`, `lib/actions/natijalar.ts`).
  - **PWA:** `app/manifest.ts` (Next.js fayl konvensiyasi,
    `/manifest.webmanifest`da xizmat qiladi), ikonkalar `app/icons/192` va
    `/512` route handler'lari orqali `next/og` bilan runtime'da
    generatsiya qilinadi (alohida rasm fayli tayyorlash shart emas).
    Middleware'ga `/icons` uchun istisno qo'shildi (aks holda
    `/talaba`/`/admin`ga rewrite qilinib 404 bo'lardi).
  - **Oflayn rejim:** minimal service worker (`public/sw.js`,
    `components/student/sw-register.tsx`) faqat navigatsiya so'rovlarini
    ulanish uzilganda `/talaba/offline` sahifasiga yo'naltiradi (to'liq
    oflayn ilova emas — texnik topshiriqda so'ralgan "fallback sahifa").
    Test davomida javob yuborish muvaffaqiyatsiz bo'lsa,
    `lib/talaba/offline-navob.ts` javobni localStorage navbatiga qo'yadi;
    `online` hodisasida (yoki keyingi mount'da) navbat avtomatik
    serverga jo'natiladi — brauzerda sun'iy tarmoq xatosi orqali real
    sinovdan o'tkazilgan.
  - **Sinf rejimi:** bosh menyudagi tugma orqali `<html>`ga
    `sinf-rejimi` klassi qo'shiladi (`app/globals.css`dagi
    `font-size: 125%` qoidasi barcha rem-asoslangan o'lchamlarga ta'sir
    qiladi), holat localStorage'da saqlanadi va har sahifa ochilganda
    (`components/student/sinf-rejimi-init.tsx`) tiklanadi.
  - **Tezlik optimizatsiyasi:** `next.config.ts`ga Supabase Storage
    domeni uchun `images.remotePatterns` qo'shilib, savol rasmlarini
    ko'rsatuvchi ikkita talaba komponentida (`test-ekrani.tsx`,
    `mashq-ekrani.tsx`) `unoptimized` olib tashlandi — endi bu rasmlar
    next/image orqali optimallashtiriladi. Materiallardagi (admin
    tomonidan kiritilgan ixtiyoriy tashqi URL) rasmlar va savol
    formasidagi mahalliy (`blob:`) oldindan ko'rish rasmi domeni
    noaniq/optimallashtirib bo'lmaydigan bo'lgani uchun ataylab
    `unoptimized` holida qoldirildi.

---

## REDIZAYN — dizayn tizimi va gamifikatsiya (`REDIZAYN.md`)

Texnik topshiriqning barcha 7 bosqichi yakunlangandan keyin qo'shilgan
ikkinchi topshiriq. To'liq matn: `REDIZAYN.md`. Bu ham o'z navbatida
alohida bosqichlarga bo'lingan (`REDIZAYN.md` 9-bo'lim); har biri alohida
branch, oldingisi tasdiqlangandan keyin boshlanadi — xuddi asosiy texnik
topshiriq singari.

**Muhim cheklov (REDIZAYN.md 1-bo'lim):** mavjud API marshrutlar, test
topshirish mantig'i, baza jadvallari (faqat qo'shiladi, o'zgartirilmaydi
yoki o'chirilmaydi) va xavfsizlik qoidalariga tegilmaydi.

**Vizual assetlar haqida qaror:** Sherbek maskoti (10 xil holat), fan
personajlari va ovoz effektlari (`.mp3`) hali tayyor emas — bular rasm/
audio fayllar, men generatsiya qila olmayman. Foydalanuvchi bilan
kelishilgan qaror: hozircha **placeholder** bilan boshlanadi (Sherbek —
emoji + rangli doira, tovush — fayl yo'q bo'lsa jim o'tkaziladi), lekin
komponent API'si va fayl nomlash konvensiyasi (`sherbek-{holat}.png`,
`/tovush/{nomi}.mp3`) asl fayllar keyinroq shu joylarga qo'yilganda hech
qanday kodni o'zgartirmasdan ishlaydigan qilib qurilgan.

- **1-bosqich (Dizayn tizimi):** yakunlangan — `/dizayn` ichki demo
  sahifasida barcha komponentlar ko'rsatilgan, hech bir mavjud sahifa
  o'zgartirilmagan (brauzerda tekshirildi: talaba `/menyu` va admin
  `/dashboard` avvalgidek ishlayapti).
  - `lib/theme.ts` — yagona rang/radius/soya manbai (REDIZAYN.md 2.2-band)
    + `toqlashtirish()` — 3D tugma soyasi uchun rangni to'qlashtiruvchi
    yordamchi funksiya. **Qoida:** komponent ichida qo'lda `#hex` yozilmaydi,
    har doim `theme.ts`dan olinadi.
  - `components/redizayn/` — yangi, alohida komponent papkasi (mavjud
    `components/ui/` — shadcn/Base UI asosidagi eski komponentlarga
    tegilmagan, ular hali barcha admin/talaba sahifalarida ishlatilmoqda):
    `tugma.tsx` (3D bosiladigan tugma — `:active`da `translateY(4px)` +
    soya qisqarishi, CSS custom property `--rd-soya` orqali har bir
    instansiya o'z rangidan hisoblangan soyani oladi), `karta.tsx`,
    `belgi.tsx` (Badge), `progress-chizigi.tsx` (ProgressBar),
    `sherbek.tsx` (maskot — placeholder), `tovush-tugmasi.tsx` (🔊/🔇,
    holat localStorage'da saqlanadi).
  - `lib/redizayn/tovush.ts` — ovoz effektlari menejeri, standart o'chiq,
    fayl topilmasa xato tashlamaydi.
  - Shrift: **Nunito** (`next/font/google`, `app/layout.tsx`da
    `--font-nunito` o'zgaruvchisi) — faqat redizayn qilingan sahifalarda
    aniq belgilanadi, mavjud sahifalar hamon Geist'da qoladi.
  - Fon naqshi: `public/naqsh.svg` (yulduzcha/kitob/qalam, 6% shaffoflik,
    qo'lda chizilgan SVG pattern).
  - `app/dizayn/page.tsx` — demo sahifa; middleware'da `/dizayn` istisno
    qilingan (ikkala domenda ham to'g'ridan-to'g'ri ochiladi, `/admin`
    yoki `/talaba`ga rewrite qilinmaydi) — chunki bu ichki, auditoriyaga
    bog'liq bo'lmagan sahifa.
- **2-bosqich (Dashboard):** yakunlangan — talaba tomonining bosh sahifasi
  (`/`, ya'ni `app/talaba/page.tsx`) endi **kodsiz, hammaga ochiq**
  Dashboard'ga aylantirildi (avval to'g'ridan-to'g'ri `/kirish`ga
  redirect qilar edi). Brauzerda ham mehmon (sessiyasiz), ham kirish
  kodi bilan kirgan holatda sinovdan o'tkazildi — ikkalasida ham to'g'ri
  ishlaydi, mavjud `/kirish`, `/menyu`, admin panel avvalgidek ishlayapti
  (regressiya yo'q).
  - **"Daraja" — muhim moslashuv:** REDIZAYN.md yangi navigatsiyasi
    5–11-sinf "daraja" bo'yicha ishlaydi, lekin mavjud `sinflar` jadvali
    aniq sinf-guruhini ifodalaydi (masalan "5-B"). Jadval o'zgartirilmadi
    (qat'iy qoida) — "daraja" `sinflar.nomi`dan regex bilan hisoblab
    olinadi (`lib/redizayn/daraja.ts: sinfDarajasi()`). Agar kelajakda
    bitta darajada bir nechta sinf-guruh (5-A, 5-B...) bir xil nomli
    mavzularga ega bo'lsa, ular hozircha alohida-alohida ko'rsatiladi
    (deduplikatsiya yo'q) — amalda hozircha faqat bitta sinf-guruh bor.
  - `lib/redizayn/dashboard.ts` — barcha o'qish `service_role` orqali
    (boshqa talaba-tomon funksiyalari kabi, RLS'ni chetlab o'tadi —
    sessiyasiz mehmon uchun ham ishlashi shart).
  - Yangi sahifalar: `/sinf/[daraja]` (fanlar kartalari, mavzusi yo'q
    fan "Tez orada" belgisi bilan bosilmaydi), `/sinf/[daraja]/[fanId]`
    (mavzular ro'yxati; kirish kodi bilan kirgan bo'lsa `progress`
    jadvalidan — 6-bosqichda yaratilgan — progress-bar va ✓ belgilar).
    Mavzu sahifasining o'zi (ma'ruza/prezentatsiya) hali yo'q — bu
    **3-bosqich** ishi, chunki yangi `materiallar` migratsiyasi hali
    qo'shilmagan.
  - Qidiruv (`components/redizayn/qidiruv.tsx`) — client-side, oldindan
    yuklangan tekis indeks (`qidiruvIndeksiniOl()`) bo'yicha filtrlaydi.
  - **Muhim tuzatish:** `IdleGuard` (3 daqiqa harakatsizlikdan keyin
    avtomatik chiqish) avval HAR BIR `/talaba` sahifasida ishga tushar
    edi — bu kiosk-rejim uchun to'g'ri edi, lekin endi sessiyasiz mehmon
    ham shu yo'lda yura oladi, uni "chiqarib yuborish" ma'nosiz.
    `app/talaba/layout.tsx` endi `joriyOquvchiniOl()`ni chaqirib,
    `IdleGuard`ga `faolmi={Boolean(oquvchi)}` beradi — sessiya bo'lmasa
    taymer umuman ishga tushmaydi.
  - "Sinflar reytingi" va "Oxirgi qo'shilgan materiallar" bo'limlari
    hozircha "Tez orada" holatida — mos ravishda gamifikatsiya
    (5-bosqich) va materiallar (3-bosqich) ma'lumotiga muhtoj.
- **3-bosqich (O'quv materiallari):** yakunlangan — brauzerda to'liq
  sinovdan o'tkazildi: admin ma'ruza (Markdown) va video (YouTube)
  material qo'shdi, talaba tomonida mavzu sahifasi ikkalasini ham to'g'ri
  ko'rsatdi, ma'ruza o'qish ekranida Markdown+KaTeX (mavjud
  `KontentKorinish` orqali) va video iframe (`modestbranding=1&rel=0`
  bilan) to'g'ri render bo'ldi, "ko'rildi" belgisi (`material_korildi`)
  kirish kodi bilan kirgan o'quvchi uchun ishlashi tasdiqlandi. Sinov
  uchun qo'shilgan namuna kontent (jumladan joke YouTube havolasi)
  keyin bazadan tozalab tashlandi — ishlab chiqarish ma'lumotlari
  o'zgarishsiz qoldi.
  - **Migratsiya** (`0005_redizayn_materiallar.sql`): `mavzular`ga
    `bolim`/`tavsif` ustunlari (ixtiyoriy, mavjud qatorlarga zarar
    yetkazmaydi); yangi `materiallar` va `material_korildi` jadvallari;
    yangi `oquv-materiallari` Storage bucket (50 MB — mavjud
    `savol-rasmlari`dagi 10 MB'dan katta, chunki PDF/prezentatsiya
    kattaroq). Mavjud `dars_materiallari`/`progress` (6-bosqich, eski
    login-talab qiladigan O'rganish moduli) jadvallariga **hech
    tegilmadi** — bu ikkala tizim endi qat'iy parallel: eski tizim
    `/organish`da, yangisi `/sinf/.../mavzu`da ishlaydi.
  - **Admin:** yangi, alohida `/admin/kontent` bo'limi (mavjud
    `/admin/materiallar` — eski tizim uchun, o'zgartirilmadi va
    joyida qoladi, ataylab boshqa nom bilan chalkashlik oldi olindi).
    Fan→sinf→mavzu tanlash, mavzuning `bolim`/`tavsif`ini tahrirlash,
    4 turdagi material (ma'ruza/prezentatsiya/video/fayl) qo'shish/
    tahrirlash/o'chirish (`lib/actions/kontent.ts`,
    `components/admin/kontent-{form,client}.tsx`). Ma'ruza matni uchun
    xuddi eski tizimdagidek Markdown muharriri qayta ishlatildi (izchillik
    uchun — XSS xavfisiz, `dangerouslySetInnerHTML` yo'q).
  - **Talaba (kodsiz):** `/sinf/[daraja]/[fanId]/[mavzuId]` — mavzu
    sahifasi (bolim, tavsif, material kartalari, "shu mavzu bo'yicha
    mashq qilish" tugmasi, oldingi/keyingi mavzu navigatsiyasi);
    `/sinf/.../[materialId]` — material o'qish/ko'rish ekrani (turi
    bo'yicha: ma'ruza → KontentKorinish, video → YouTube iframe,
    prezentatsiya/fayl → hozircha oddiy fayl havolasi). Qidiruv endi
    mavzu natijasini to'g'ridan-to'g'ri mavzu sahifasiga olib boradi
    (avval faqat fan sahifasiga olib borar edi).
  - **Ataylab qoldirilgan (keyingi bosqichlar uchun):**
    "prezentatsiya" turi uchun to'liq ekran slayd ko'ruvchi (PDF→WebP,
    pdf.js) — **4-bosqich** ishi; to'g'ridan-to'g'ri video fayl yuklash
    (hozircha faqat YouTube havolasi) va drag-and-drop tartib
    o'zgartirish — ataylab soddalashtirildi, zarurat tug'ilsa keyinroq
    qo'shiladi.
  - **Arxitektura eslatmasi:** "Shu mavzu bo'yicha mashq qilish" tugmasi
    ataylab oddiy `/mashq`ga (yoki sessiyasiz bo'lsa `/kirish`ga) havola
    qiladi, aniq shu mavzuga "chuqur havola" qilinmaydi — chunki `/mashq`
    o'quvchining **o'z haqiqiy sinfi**ga bog'langan (login-talab qiladi),
    Dashboard esa istalgan darajani ko'rsatishi mumkin (masalan boshqa
    sinf o'quvchisi 7-sinf mavzusini ko'rayotgan bo'lishi mumkin) — bu
    ikki tizim orasidagi tabiiy chegara, ataylab shunday qoldirilgan.
- **4-bosqich (Prezentatsiya ko'ruvchi):** yakunlangan — brauzerda to'liq
  sinovdan o'tkazildi (5 sahifali sinov PDF orqali): sahifalar to'g'ri
  render bo'ldi, klaviatura bilan navigatsiya + oldindan yuklash ishladi,
  slaydlar to'ri (grid) barcha kichik rasmlarni ko'rsatib, bosilganda
  to'g'ri sahifaga o'tkazdi, doska chizish/tozalash ishladi, panel
  avtomatik yashirinish/qaytish ishladi, chiqish tugmasi tozalikcha
  yopdi, konsolda xato yo'q. Sinov uchun yuklangan PDF va yozuv keyin
  tozalab tashlandi.
  - **Muhim texnik qaror (REDIZAYN.md 4.2-band, "ko'p xato qilinadigan
    joy"):** PDF **faqat klient tomonda** `pdfjs-dist` bilan
    render qilinadi (`components/redizayn/prezentatsiya-korish.tsx`) —
    serverda HECH QANDAY konvertatsiya (LibreOffice, ImageMagick va h.k.)
    ishlatilmaydi, chunki bular Vercel serverless funksiyalarida
    ishlamaydi. Bu aynan hujjatning o'zi "asosiy yo'l" deb atagan yechim.
    Server tomonda PDF'ni oldindan WebP'ga aylantirish ("Optimizatsiya"
    bandi) ataylab qilinmadi — hozircha zarurat yo'q, sahifalar
    keshlanadi (`ImageBitmap`) va joriy sahifadan keyingi 2 tasi fonda
    oldindan render qilinadi, shu yetarli tezlik beradi.
  - `pdfjs-dist` yangi bog'liqlik sifatida qo'shildi; uning "worker"
    fayli (`pdf.worker.min.mjs`) `public/pdf/`ga qo'lda nusxalangan
    (statik fayl sifatida, bundler-bog'liq sozlashlardan qochish uchun).
  - Ko'ruvchi og'ir bo'lgani uchun (`pdfjs-dist`) `next/dynamic(...,
    {ssr:false})` orqali faqat "Prezentatsiyani boshlash" bosilganda
    yuklanadi (`components/redizayn/prezentatsiya-ochuvchi.tsx`) — boshqa
    material turlarini ko'rayotgan talabaning bundle hajmiga ta'sir
    qilmaydi (build natijasida material sahifasi shared JS'dan atigi
    ~2.6 kB ko'proq).
  - Interfeys: chap/o'ng bosish zonalari (15%), barmoq bilan surish
    (swipe), klaviatura (← → Space Esc F), pastki panel 3 soniyadan keyin
    avtomatik yashiradi, `[⊞]` — barcha slaydlar to'ri, `[👁]` — doska
    (qizil/ko'k/sariq qalam + tozalash, saqlanmaydi), `[⛶]` — brauzer
    to'liq ekran rejimi (`requestFullscreen`), Wake Lock API (ekran
    uxlab qolmasligi uchun).
  - **Kiosk avto-chiqish o'chirilishi:** yangi yengil hodisa mexanizmi
    (`lib/redizayn/prezentatsiya-holati.ts`) — ko'ruvchi ochilganda
    `IdleGuard`ga "faol" signalini yuboradi, taymer to'xtaydi; yopilganda
    taymer odatdagidek davom etadi. Bu `IdleGuard`ning pathname-asosli
    eski mantig'iga qo'shimcha, uni buzmaydi.
  - **Ataylab qilinmagan:** `.pptx` fayllarni CloudConvert (pullik
    xizmat) orqali PDF'ga aylantirish — hujjatning o'zi buni "qulaylik"
    (ixtiyoriy) deb belgilagan va agar API kaliti bo'lmasa foydalanuvchiga
    shunchaki PDF so'rashni tavsiya qiladi — aynan shu standart xatti-
    harakat, alohida ishlab chiqilmagan holda ham, tabiiy ravishda
    ta'minlanadi (faqat PDF/tashqi havola qo'llab-quvvatlanadi).
- **5-bosqich (Gamifikatsiya):** yakunlangan — brauzerda to'liq sinovdan
  o'tkazildi: mashqda to'g'ri javob berilganda XP+kunlik seriya to'g'ri
  hisoblandi, mavzu birinchi marta o'rganilganda +20 XP berildi (qayta
  tashrifda berilmadi), test topshirilganda +30 XP va daraja 2'ga
  o'tganda tabrik modali (Sherbek kubok + konfetti) to'g'ri chiqdi,
  4 ta nishon avtomatik aniqlanib berildi (mavjud tarixiy ma'lumotlar
  asosida — "birinchi_qadam", "benuqson", "mavzu_ustasi", "sinf_faxri"),
  avatar tanlash ishladi va Dashboard'da darhol ko'rindi, "Sinflar
  reytingi" bo'limi endi haqiqiy XP bilan ko'rsatildi. Sinov uchun
  yaratilgan test/urinish/progress/XP yozuvlari keyin tozalab tashlandi.
  - **Migratsiya** (`0006_redizayn_gamifikatsiya.sql`): `xp_jurnal`,
    `oquvchi_holati`, `nishonlar` (12 ta urug' yozuv bilan),
    `oquvchi_nishonlari` — hammasi butunlay yangi, mavjud jadvallarga
    tegilmagan.
  - `lib/redizayn/gamifikatsiya.ts` — yagona server-only modul: XP
    qo'shish, daraja hisoblash (`floor(sqrt(xp/50))+1`), kunlik seriya/
    muzlatgich mantig'i (Toshkent vaqti, UTC+5 qo'lda hisoblanadi — DST
    yo'q), 11 ta nishonni avtomatik tekshirish (12-chisi, "Qat'iyatli",
    klientdan kelgan bayroq orqali alohida beriladi — quyida), sinf
    reytingi (shu hafta), avatar tanlash.
  - **Muhim arxitektura qarori — mavjud API'larga side-effect sifatida
    qo'shildi, imzolari buzilmadi:** `/api/mashq/javob`ga +2 XP,
    `/api/organish/yakunlash`ga +20 XP (faqat birinchi marta),
    `/api/urinish/yakunlash` va `/api/urinish/javob` (vaqt tugaganda)ga
    +30(+20 bonus) XP — javob shakliga faqat YANGI, qo'shimcha
    maydonlar qo'shildi (`xpOlindi`, `darajaOshdimi`, `yangiNishonlar`),
    mavjud maydon o'zgartirilmadi/o'chirilmadi. `lib/talaba/
    urinish-yakunlash.ts` (test ballini hisoblovchi umumiy funksiya)ga
    HECH TEGILMADI — XP faqat uni chaqiruvchi route handler'larda
    qo'shildi.
  - **Tezlik/UX qarori:** mashq javobi (tez-tez, har savolda) uchun
    Next.js'ning `after()` API'si ishlatiladi — javobni sekinlashtirmaydi,
    lekin serverless funksiya to'liq bajarilgunicha ishlab turishini
    kafolatlaydi (oddiy "fire-and-forget" bunga kafolat bermaydi,
    Vercel funksiyasi javobdan keyin darhol to'xtatilishi mumkin). Test
    topshirish va mavzu tugatish esa (kamdan-kam sodir bo'ladigan
    harakatlar) to'g'ridan-to'g'ri kutiladi — shu orqali natija
    ekranida darhol "daraja oshdi"/"yangi nishon" tabrik modalini
    ko'rsatish mumkin bo'ladi.
  - `components/redizayn/tabriklash-modali.tsx` + `konfetti.tsx` —
    daraja oshganda/nishon olinganda ko'rsatiladi (faqat CSS transform/
    opacity, 2.7-band talabiga mos, `prefers-reduced-motion` hurmat
    qilinadi).
  - `AVATARLAR` va nishon ma'lumotlari (`lib/redizayn/avatarlar-royxati.ts`,
    `lib/redizayn/nishonlar-royxati.ts`) ataylab `gamifikatsiya.ts`dan
    ALOHIDA fayllarda — chunki ular klient komponentlarida (avatar
    tanlagich, tabrik modali) ham kerak, `gamifikatsiya.ts` esa
    server-only kod (`service_role`) import qiladi va klientga
    bundle qilinmasligi shart.
  - Yangi `/nishonlar` sahifasi (avatar tanlash + 12 ta nishon holati)
    `/menyu`dan havola orqali ochiladi. Dashboard tepa satriga
    avatar/daraja/XP/seriya/kunlik-maqsad progress-bar qo'shildi,
    "Sinflar reytingi" endi haqiqiy (bu haftagi) ma'lumot ko'rsatadi.
  - **"Qat'iyatli" nishoni:** serverda mustaqil aniqlab bo'lmaydigan
    holat (xato→qayta urinib to'g'ri topish, alohida urinish-tarixi
    jadvali yo'q) — shuning uchun mavjud "xato qilinganlarni qayta
    ishlash" mashq funksiyasi (`components/student/mashq-ekrani.tsx`,
    6-bosqich) `qaytaUrinish: true` bayrog'ini qo'shimcha yuboradi,
    server shunda beradi.
- **6-bosqich (redizayn-mashq):** yakunlangan — mavjud (asl texnik
  topshiriq 6-bosqichida qurilgan) `/mashq` va `/organish` modullari
  yangi dizayn tizimiga o'tkazildi. **Diqqat: bu REDIZAYN.md'ning
  o'ziga xos 6-bosqichi — asl texnik topshiriqning 6-bosqichi
  ("O'rganish va mashq modullari") bilan ADASHTIRILMASIN**, ular
  boshqa-boshqa narsa (asl 6-bosqich — funksionallik qurish; bu
  bosqich — o'sha funksionallikning ko'rinishini yangilash). Ma'lumot
  olish/yozish mantig'i, API chaqiruvlari — hech biriga tegilmadi,
  faqat JSX/uslub qayta yozildi.
  - `/organish`, `/organish/[fanId]`, `components/student/
    organish-ekrani.tsx`, `components/student/mashq-tanlov.tsx`,
    `components/student/mashq-ekrani.tsx` — barchasi Tugma/Karta/
    ProgressChizigi/Belgi + tema ranglari + Nunito shrift + fon
    naqshiga o'tkazildi.
  - **Yangi umumiy komponent** `components/redizayn/variant-tugmalari.tsx`
    — Kahoot uslubidagi A/B/C/D javob tugmalari (▲qizil/◆ko'k/●sariq/
    ■yashil, 2.3-band), mashq va o'z-o'zini tekshirish (organish)
    ikkalasida ham qayta ishlatiladi — ikki joyda alohida-alohida
    yozish o'rniga.
  - **Personaj reaksiyalari va tovush:** har ikkala modulda ham javob
    natijasida Sherbek holati (`tugri`/`xato`) va mos tovush
    (`tovushChal("togri"|"xato")`) chaqiriladi; mashq/organish
    yakunlanganda "zor"/"maslahat" holatlari.
  - `lib/redizayn/fan-rangi.ts` — fan nomini (masalan "Informatika")
    `theme.fanRanglari`dagi mos rangga bog'laydigan yangi yordamchi
    (fan kartalarida rangli chiziq/faol holat uchun, 2-3-bosqichlarda
    qurilgan `/sinf/...` sahifalarida ishlatilmagan — faqat shu
    bosqichdan boshlab; kelajakda o'sha sahifalarga ham qo'shish mumkin).
  - Brauzerda haqiqiy o'quvchi bilan to'liq tekshirildi: mashqda
    to'g'ri/xato javoblarda Kahoot tugmalari to'g'ri rangda ochilib,
    Sherbek reaksiyasi va ✓/✗ belgilari chiqdi; organishda "tekshirish"
    bosqichi va "zor" bilan tugash ekrani to'g'ri ko'rindi; gorizontal
    scroll yo'qligi tasdiqlandi. Sinov ma'lumotlari tozalandi.
- **7-bosqich (redizayn-test):** yakunlangan, `REDIZAYN.md`ning
  SO'NGGI bosqichi — bu bilan hujjatning barcha 7 bosqichi to'liq
  yakunlandi. Brauzerda haqiqiy o'quvchi bilan to'liq sinovdan
  o'tkazildi: rasmiy test boshidan oxirigacha yechildi, Kahoot rangli
  variant tugmalari to'g'ri ishladi va javob tanlanganda faqat oq
  halqa+✓ ko'rsatildi (hech qachon to'g'ri/xato ochilmadi), savol
  navigatori va "Yakunlash (N/N)" tasdiqlash oynasi ishladi, yakunlash-
  dan keyin daraja oshishi + 4 ta nishon bilan tabrik modali chiqdi va
  uni yopgandan so'ng natija ekrani (Sherbek + 100%/baho 5) to'g'ri
  ko'rsatildi. Sinov uchun yaratilgan test/urinish/XP/nishon yozuvlari
  keyin tozalab tashlandi.
  - **5.6-band — "Rasmiy testda gamifikatsiya YO'Q":**
    `components/student/test-ekrani.tsx` butunlay qayta yozildi — endi
    sokin oq-ko'k uslubda (`theme.colors.surface` foni, playful
    `naqsh.svg` YO'Q), lekin Kahoot rangli variant tugmalari saqlanib
    qolgan. Test jarayonida Sherbek, tovush yoki konfetti **hech qayerda
    chaqirilmaydi** — bular faqat yakunlangandan keyin, natija ekranida
    (`test-natijasi.tsx`, bu yerda ruxsat etilgan) ko'rsatiladi. Taymer,
    oflayn javob navbati (`navbatgaQoshish`/`navbatniJonatish`), savol
    navigatori, "keyin qaytaman" belgisi — bularning barchasining ichki
    mantig'iga tegilmadi, faqat JSX/uslub almashtirildi.
  - **`VariantTugmalari` kengaytirildi** (`components/redizayn/
    variant-tugmalari.tsx`): yangi `belgilanganmi` holati — tanlangan
    variant hali "ochilmagan" bo'lsa (`ochilganmi={false}`, rasmiy test
    holati), faqat oq halqa + ✓ ko'rsatiladi, rang o'zgarmaydi va boshqa
    variantlar xiralashtirilmaydi — shu orqali to'g'ri javob HECH QACHON
    oshkor qilinmaydi. Mashq/organishda (`ochilganmi={true}`) esa avvalgi
    xatti-harakat (to'g'risini yashil qilib ochish, xatoni ✗ bilan
    belgilash) saqlanib qoldi — bitta komponent ikkala holatga ham
    xizmat qiladi.
  - `test-boshlash-tugmasi.tsx`, `app/talaba/test/page.tsx`,
    `app/talaba/test/[testId]/page.tsx` — vizual izchillik uchun
    Tugma/Karta/Belgi/tema'ga o'tkazildi (sokin, personajsiz — 6-bosqich
    (redizayn-mashq)dagi `mashq-tanlov.tsx` bilan bir xil uslubda).
  - **Topilgan va tuzatilgan bug (`TabriklashModali`):** daraja oshishi
    va bir nechta nishon bir vaqtda berilganda (masalan o'quvchining
    birinchi rasmiy testi — 4 ta nishon + daraja birga tushishi mumkin),
    modal kontenti odatiy ekran balandligidan oshib ketardi, lekin ichki
    scroll YO'Q edi — natijada "Zo'r!" (yopish) tugmasi butunlay
    yetib bo'lmas holga tushib, o'quvchini test tugagach abadiy
    tiqilib qolishga majbur qilardi (haqiqiy kiosk qurilmada scroll
    imkoniyati yo'q). Ekranda avval o'zim sinab ko'rib topdim (avtomatik
    `scroll_to` ham modalni harakatlantira olmadi). Tuzatish:
    `components/redizayn/tabriklash-modali.tsx`dagi ichki konteynerga
    `max-h-[85vh] overflow-y-auto` qo'shildi — endi kontent balandlik
    chegarasidan oshsa, modalning o'zi ichki scrollbar bilan
    scroll qilinadi, "Zo'r!" tugmasi har doim yetib bo'ladigan.
    Tuzatilgandan keyin xuddi shu ssenariy (daraja oshishi + 4 nishon)
    qayta sinovdan o'tkazilib, tasdiqlandi.

REDIZAYN.md'ning barcha 7 bosqichi (dizayn tizimi, dashboard, o'quv
materiallari, prezentatsiya ko'ruvchi, gamifikatsiya, mashq/o'rganish
qayta dizayni, rasmiy test qayta dizayni) shu bilan to'liq yakunlandi —
asl `TEXNIK-TOPSHIRIQ.md`ning 7 bosqichi ustiga qo'shilgan holda.

---

## Ruscha til qo'shildi (til almashtirish, `feat/ruscha-til`)

REDIZAYN.md'ning 7 bosqichidan keyin, foydalanuvchi so'rovi bilan
qo'shilgan qo'shimcha funksiya — brauzerda to'liq sinovdan o'tkazildi
(admin va o'quvchi Sardor Aliyev, kirish kodi `764162` bilan): tepadagi
🇺🇿/🇷🇺 tugma bosilganda butun o'quvchi interfeysi ruschaga o'tdi va sahifa
yangilanganda ham saqlanib qoldi, so'ng orqaga o'zbekchaga qaytarildi.

**Qamrov (foydalanuvchi bilan aniq kelishilgan, 3 ta savol orqali):**
faqat interfeys matnlari (baza kontenti — fan/mavzu/savol nomi, ma'ruza
matni — TARJIMA QILINMAYDI, chunki noto'g'ri tarjima o'quvchiga haqiqiy
zarar berishi mumkin); faqat o'quvchi tomoni (admin panelga tegilmadi);
saqlash — brauzer cookie orqali (login talab qilinmaydi).

- **Arxitektura:** `lib/i18n/uz.ts` — qo'lda yozilgan `export interface
  Matnlar {...}` (barcha barg maydonlar `string` yoki `string` qaytaruvchi
  funksiya) + `export const uz: Matnlar = {...}`. **Muhim:** `as const`
  ISHLATILMAYDI — bu holda `uz`ning aniq satr QIYMATLARI turga aylanib,
  `ru.ts` boshqa (ruscha) matn yoza olmay qolar edi. `lib/i18n/ru.ts` xuddi
  shu `Matnlar` turiga qarshi to'liq ruscha tarjima bilan yozilgan.
  `lib/i18n/joriy-til.ts` — `til` cookie'sini o'qib (`joriyTilniOlish()`)
  yoki to'g'ridan-to'g'ri mos lug'atni qaytarib beradi
  (`joriyMatnlarniOlish()`, Server Component'lar uchun). `lib/actions/
  til.ts` — cookie yozuvchi Server Action (`tilniOzgartirish`, 1 yillik
  maxAge).
- **Server/Client chegarasi bo'yicha muhim bug va tuzatish:** avval
  `app/talaba/layout.tsx` (Server Component) to'liq hal qilingan `matnlar`
  obyektini (funksiya-maydonlar bilan, masalan `daraja: (n) => string`)
  to'g'ridan-to'g'ri `<MatnlarProvideri matnlar={matnlar}>` propi sifatida
  klient komponentga uzatgan edi — bu **har bir so'rovda** "Functions
  cannot be passed directly to Client Components" xatosi bilan butun
  sahifani qulatgan (`preview_logs`da o'nlab funksiya-maydon uchun alohida
  stack trace ko'rindi). **Tuzatish:** `MatnlarProvideri` endi faqat
  serializable `til: "uz"|"ru"` propini qabul qiladi va ichida
  `useMemo` bilan `uz`/`ru` modulларини o'zi tanlaydi — funksiya hech
  qachon Server→Client chegarasidan o'tmaydi. Qoida: Server komponentlarda
  `await joriyMatnlarniOlish()` to'g'ridan-to'g'ri ishlatiladi (Context
  kerak emas), klient komponentlarda `useMatnlar()` (`components/student/
  matnlar-provideri.tsx`) orqali o'qiladi — `app/talaba/layout.tsx`
  daraxtning boshida bitta marta `<MatnlarProvideri til={til}>` bilan
  o'raydi.
- `components/student/til-tugmasi.tsx` — 🇺🇿 UZ / 🇷🇺 RU tugmasi
  (`useTransition` + `tilniOzgartirish()` + `router.refresh()`), Dashboard
  va `/menyu` sarlavhasiga, shuningdek kirish kodi klaviaturasi ekraniga
  qo'shildi.
- **Ataylab TARJIMA QILINMAGAN (baza kontenti, qamrov qarori bo'yicha):**
  `nishonlar` jadvalidagi 12 ta nishon nomi/tavsifi (`lib/redizayn/
  gamifikatsiya.ts: oquvchiNishonlariniOl()` orqali `/nishonlar`
  sahifasiga to'g'ridan-to'g'ri bazadan keladi) va `lib/redizayn/
  avatarlar-royxati.ts`dagi avatar nomlari — brauzerda ruscha rejimda
  ham bular o'zbekcha qolishi tasdiqlandi.
- Barcha `app/talaba/*` (18 sahifa) va `components/student/*` +
  `components/redizayn/*` (26 komponent) qattiq kodlangan matnlar uchun
  maqsadli grep orqali auditdan o'tkazildi; ko'pchiligi allaqachon
  `uz.ts` orqali yozilgan edi (faqat import/hook almashtirildi), qolgani
  (Dashboard, `/sinf/*`, `/nishonlar`, `/offline`, qidiruv, prezentatsiya
  ko'ruvchi, tabriklash modali) uchun yangi lug'at kalitlari qo'shildi.

---

## SEO (Google qidiruv tizimida ko'rinish)

Ikkala hujjat (asl texnik topshiriq va REDIZAYN.md) tugagandan keyin,
foydalanuvchi Google Search Console'da sayt ro'yxatdan o'tkazgach, tezroq
va to'g'ri indekslanishi uchun qo'shildi (alohida bosqich emas — ikkala
rasmiy hujjatdan tashqari, operatsion so'rov).

- `lib/utils/site-url.ts` — `NEXT_PUBLIC_SITE_URL`ni o'qiydigan yagona
  yordamchi (`saytUrliniOl()`); sozlanmagan yoki `localhost` bo'lsa
  `https://odiltest.uz`ga tushadi — sitemap/robots/OG hech qachon
  `localhost` bilan generatsiya bo'lib qolmasligi uchun.
- `app/robots.ts` va `app/sitemap.ts` — ikkalasi ham `headers()` orqali
  `Host` sarlavhasini o'qib, `admin.` prefiksli domenlarda mos ravishda
  to'liq `disallow` va bo'sh sitemap qaytaradi (admin panel hech qachon
  indekslanmasin). Asosiy domenda sitemap `lib/redizayn/dashboard.ts`dagi
  `darajalarStatistikasiniOl()`/`qidiruvIndeksiniOl()` orqali **haqiqiy
  bazadan** generatsiya qilinadi (`/`, mavjud `/sinf/[daraja]`,
  `/sinf/[daraja]/[fanId]`, `.../[mavzuId]` — faqat kontenti bor
  sahifalar), robots faqat kirish talab qiladigan yo'llarni
  (`/kirish`, `/menyu`, `/mashq`, `/organish`, `/test`, `/natijalar`,
  `/urinish`, `/nishonlar`, `/dizayn`, `/offline`, `/api`) disallow qiladi.
- `app/admin/layout.tsx`ga `robots: { index: false, follow: false }`
  metadata qo'shildi — `robots.txt`dagi to'liq disallow ustiga ikkinchi
  qatlam himoya (login sahifasi ham qidiruvda chiqmasin).
- `app/layout.tsx` — `metadataBase`, to'liq Open Graph/Twitter card
  metadata (`openGraph`, `twitter`) qo'shildi; `app/opengraph-image.tsx`
  (`next/og`, `app/icons/*/route.tsx`dagi patternga o'xshash) ijtimoiy
  tarmoqlarda ulashilganda ko'rinadigan rasmni runtime'da generatsiya
  qiladi (tema ranglari — `theme.colors.primary`/`accent`).
- Bosh sahifaga (`app/talaba/page.tsx`) `EducationalOrganization`
  JSON-LD tuzilgan ma'lumoti qo'shildi (`dangerouslySetInnerHTML`
  — bu yerda xavfsiz, chunki kontent butunlay statik/serverda tuzilgan
  JSON, foydalanuvchi kiritmasi emas; loyihaning Markdown-kontent uchun
  bu usuldan qochish qoidasi bunga taalluqli emas).
- **Topilgan va tuzatilgan bug (`middleware.ts`):** `/opengraph-image`
  (Next.js fayl konvensiyasi) kengaytmasiz URL bilan xizmat qiladi —
  xuddi `/icons/*` kabi — lekin middleware buni hisobga olmagani uchun
  `/talaba/opengraph-image`ga noto'g'ri rewrite qilib 404 qaytarayotgan
  edi (OG rasmi ijtimoiy tarmoqlarda umuman ko'rinmasdi). Brauzerda sinab
  ko'rib topildi, `/opengraph-image` ham `/icons` bilan bir qatorda
  istisnolar ro'yxatiga qo'shildi.
- **Qo'lda qilinadigan qadam (men bajara olmayman — foydalanuvchining
  Search Console hisobiga kirish kerak):** agar Google Search Console
  saytni HTML meta teg orqali tasdiqlashni so'rasa (DNS yoki domen
  provayder orqali tasdiqlangan bo'lsa bu qadam kerak emas), o'sha
  tasdiqlash kodini `app/layout.tsx`dagi `metadata.verification.google`
  maydoniga qo'shish kerak — kodni bergan holda so'rasa qo'shib beriladi.
  Shundan keyin Search Console'da "Sitemaps" bo'limiga
  `https://odiltest.uz/sitemap.xml`ni qo'lda yuborish va bosh sahifani
  "URL tekshiruvi" orqali "Indekslashni so'rash" tavsiya etiladi — bular
  ham faqat Search Console interfeysida, qo'lda bajariladi.

---

## Mavzularni ommaviy import qilish (`ishreja-import.md`)

Asosiy ikki hujjatdan (texnik topshiriq, REDIZAYN.md) mustaqil, alohida
qo'shimcha modul — to'liq matn: `ishreja-import.md`. Maktabning e-baza
ish reja Excel fayllaridan (sinf+fan+chorak uchun alohida fayl) `mavzular`
jadvalini ommaviy to'ldirish uchun. Yakunlangan, `main`ga birlashtirilgan.

- **Muhim moslashuv — hujjat va haqiqiy sxema farqi:** `ishreja-import.md`
  o'zining SQL qismida `mavzular.daraja` ustunini nazarda tutgan edi, lekin
  bu ustun hech qachon mavjud bo'lmagan — bu loyihada "daraja" doim
  `sinflar.nomi`dan hisoblab olinadi (REDIZAYN.md 2-bosqich qarori,
  o'zgarmas qoida). Shu sababli import fayl nomidagi darajani mavjud
  `sinf_id`ga moslashtiradi (`sinfDarajasi()`, `lib/redizayn/daraja.ts`
  orqali) — `daraja` ustuni QO'SHILMAYDI. Agar bitta darajada kelajakda
  bir nechta sinf-guruh (5-A, 5-B) bo'lsa, import har biriga alohida-
  alohida yozadi (bugun amalda faqat bitta guruh bor, shuning uchun bu
  holat hali sinovdan o'tkazilmagan).
- **Migratsiya** (`0007_ishreja_import.sql`): `mavzular`ga `chorak`,
  `oquv_yili`, `uyga_vazifa`, `turi` (`mavzu`/`baholash`/`takrorlash`/
  `amaliy`, standart `mavzu`), `ball`, `manba_fayl` — hammasi qo'shimcha,
  eski qatorlarga ta'sir qilmaydi. Eski `unique(fan_id, sinf_id, nomi)`
  cheklovi `unique index`ga almashtirildi — endi `chorak`/`oquv_yili`ni
  ham hisobga oladi (bir xil mavzu turli chorak/yil uchun qayta
  yozilishi mumkin). `importlar.turi`ga `'ishreja'` qiymati qo'shildi.
- **Fayl nomidan metama'lumot** (`lib/ishreja/fayl-nomi.ts`, sof funksiya):
  regex orqali sinf darajasi, fan nomi, chorak, o'quv yili va BSB/ChSB
  belgisini ajratib oladi — hech narsa admin tomonidan tanlanmaydi
  (2-bo'lim). Fan nomi keyin `lib/ishreja/fan-moslashtirish.ts` orqali
  `fanlar` jadvali bilan registr/apostrofdan qat'i nazar solishtiriladi.
- **Qator o'qish** (`lib/ishreja/qatorlar.ts`): sarlavha qatorini
  "birinchi qator" deb emas, `T/R`+`Mavzu` so'zlari bo'yicha topadi;
  bo'sh qatorlarni tashlaydi; `BSB`/`ChSB`/"nazorat ishi" → `baholash`,
  aniq "Takrorlash" → `takrorlash`, "Loyiha ishi"/"Amaliy mashg'ulot" →
  `amaliy`, qolgani → `mavzu`; `[N ball]` qismini ball sifatida ajratadi.
  Fayllar serverga yuborilmaydi — bu funksiya to'g'ridan-to'g'ri brauzerda,
  `File.arrayBuffer()` ustida ishlaydi (7-bo'lim talabi).
- **Admin UI** (`/admin/import/ishreja`,
  `components/admin/ishreja-import-client.tsx`): sudrab-tashlash zonasi
  (yoki fayl tanlash), har fayl mustaqil o'qiladi va ko'rib chiqish
  jadvaliga qo'shiladi — sinf/fan/chorak/yil, mavzular soni, holat belgisi
  (✅ tayyor / ⚠️ bazada bor / ❌ xato / 🔁 variant ziddiyati). Fan
  topilmasa, admin uni tasdiqlashi yoki mavjudlaridan birini tanlashi
  mumkin (Select + "— Yangi fan —" matn maydoni). BSB/ChSB va BSB'siz
  variant global almashtirgichi (standart: BSB bilan) — bir xil
  sinf+fan+chorak uchun ikki fayl yuklansa, mos kelmagani avtomatik
  "o'tkazib yuborish"ga o'tkaziladi (4.2-band). Bazada mavjud mavzular
  soni sahifa yuklanishida bir marta (butun `mavzular` jadvalidan
  fan_id/sinf_id/chorak/oquv_yili) olib kelinadi — har fayl uchun alohida
  so'rov yubormaslik uchun.
- **API** (`POST /api/import/ishreja`, faqat admin roli): fan
  topilmasa/tasdiqlansa yaratadi, daraja bo'yicha mos sinf(lar)ni topadi,
  har (fan,sinf) juftligi uchun mavjud mavzularni o'qib, takroriylarini
  (`chorak`+`oquv_yili`+`nomi` bo'yicha) filtrlab qoldiqni yozadi.
  "Almashtirish" tanlansa, avval o'sha chorak/yil uchun eski qatorlar
  o'chiriladi. Har bir fayl mustaqil — bittasining xatosi qolganlariga
  ta'sir qilmaydi.
  - **Topilgan va tuzatilgan bug (atomiklik):** agar yangi fan
    yaratilgandan keyin o'sha faylning mavzularini yozishda xato chiqsa
    (masalan sxema nomuvofiqligi — bu aynan migratsiya qo'llanishidan
    oldin sinab ko'rishda yuz berdi), fan bazada "egasiz" qolib ketardi —
    xato ko'rsatilgan, lekin fan baribir yaratilgan bo'lardi. Endi shu
    so'rovda yangi yaratilgan va hali birorta mavzu yozilmagan fan xato
    chiqsa avtomatik o'chirib tashlanadi (ilova darajasidagi
    kompensatsion "orqaga qaytarish" — "hech qanday holatda tasdiqsiz
    bazaga yozilmasin" talabiga mos, 5-bo'lim).
  - **Ataylab qilingan qaror — to'liq SQL tranzaksiya emas:** yozish
    Postgres RPC/saqlangan protsedura orqali emas, oddiy Supabase JS
    so'rovlari ketma-ketligi bilan amalga oshiriladi (loyihaning boshqa
    import funksiyasi — `lib/actions/import.ts`dagi savol importi — ham
    shu uslubda). Har bir fayl ichida yozish (`.insert()` bitta chaqiruv)
    atomik, lekin bir nechta fayl orasida umumiy tranzaksiya yo'q —
    yuqoridagi fan-orqaga-qaytarish kompensatsiyasi bu bo'shliqning eng
    muhim qismini (egasiz fan qolishi) yopadi.
- **Mavjud kodga qo'shimcha ta'sir:** `lib/actions/spravochniklar.ts`dagi
  `Mavzu` interfeysi va `mavzularniOl()` so'rovi `turi`ni ham qaytaradi
  (qo'shimcha maydon). Material biriktirish (`components/admin/
  kontent-client.tsx`) va avtomatik test yaratishda mavzu tanlash
  (`components/admin/test-form.tsx`) endi `turi !== "baholash"` bilan
  filtrlanadi — BSB/ChSB qatorlari dars emas, ularga material yoki
  savol biriktirilmaydi (3-bo'lim).
- **Ataylab qilinmagan:** o'qituvchi uchun bitta-fayl import varianti
  (hujjatning 7-bo'limidagi parentez ichidagi eslatma) — qabul mezonlari
  faqat admin oqimini talab qiladi, shuning uchun hozircha qo'shilmadi;
  endpoint qat'iy admin-only.
- Brauzerda haqiqiy fayllar (asosiy yo'l, yangi fan yaratish, mavjud
  bo'lmagan sinf-daraja xatosi, BSB variant ziddiyati, "bazada bor"
  ogohlantirish + Almashtirish/O'tkazib yuborish) bilan to'liq sinovdan
  o'tkazildi; import qilingan mavzular `/sinf/5/1` (mavjud fan) va
  `/sinf/5/4` (yangi yaratilgan fan) sahifalarida chorak bo'yicha
  guruhlangan holda to'g'ri ko'rindi. Sinov uchun yaratilgan mavzu/fan/
  importlar yozuvlari keyin tozalab tashlandi.

---

## Logotip (`components/ui/Logo.tsx`)

`/public`ga haqiqiy logotip fayllari (`logo.svg`, `logo.png`,
`logo-teskari.png`, `logo-{512,192,180,64,32}.png`, `favicon.ico`,
`og-image.png`) qo'shilgandan keyin butun loyihaga ulandi.

- **`components/ui/Logo.tsx`** — yagona logotip komponenti (`size`:
  sm/md/lg/xl, `variant`: rangli/oq, `withText`, `priority`). `variant`
  ikkita TAYYOR faylni almashtiradi (`/logo.svg` yoki `/logo-teskari.png`)
  — SVG'ning `currentColor`i faqat inline holatda ishlaydi, `next/image`
  esa uni tashqi rasm sifatida yuklaydi (DOM'ga inline qilinmaydi), shu
  sababli ikkita alohida fayl orasida almashtirish orqali rang farqi
  ta'minlanadi. `withText`dagi "ODIL SCHOOL" matni — Montserrat SemiBold
  (`app/layout.tsx`da `--font-montserrat`), rangi `variant="oq"`da oq/och
  (aks holda to'q fonda ko'rinmay qolardi), aks holda `theme.colors.primary`.
  Bosilganda "tashqi" `/` ga o'tadi (middleware har ikkala domenda ham
  o'z bosh sahifasiga rewrite qiladi).
- **Qo'yilgan joylar:** talaba Dashboard sarlavhasi (`app/talaba/page.tsx`,
  md+matn, priority), `/menyu` sarlavhasi (sm+matn, priority), kirish
  kodi klaviaturasi (`components/student/kirish-klaviatura.tsx`, xl+matn,
  priority, sarlavha ustida), admin nav (`components/admin/admin-nav.tsx`,
  sm+matn, chap tomonda — bu loyihada "yon panel" emas, gorizontal yuqori
  panel, shuning uchun shu yerga qo'yildi), admin kirish sahifasi (lg+matn,
  kartadan tepada — ilgari shu yerda "Odil School — ..." matni bor edi,
  endi shu matn logotip bilan ustma-ust tushmasligi uchun qisqartirildi),
  ildiz fallback sahifa (`app/page.tsx`, middleware ishlamay qolgan
  holat uchun) va yangi **Footer** (`components/ui/Footer.tsx`, to'q fon,
  `variant="oq"`, `app/talaba/layout.tsx`ning oxiriga qo'shildi).
- **Bo'sh holat/yuklanish:** `components/ui/YuklanmoqdaEkrani.tsx` —
  logotip 20% shaffoflik + "nafas olish" animatsiyasi (`.logo-nafas`,
  `app/globals.css`, `prefers-reduced-motion` hurmat qilinadi) —
  `app/talaba/loading.tsx` va `app/admin/loading.tsx` (Next.js marshrut
  segmenti yuklanish konvensiyasi) orqali ulandi. Mavjud Sherbek-asosli
  "bo'sh holat" xabarlari (masalan Dashboard'dagi "Bu hafta hali XP
  to'plangani yo'q") ataylab o'zgartirilmadi — ikkita personaj/logotip bir
  joyda raqobatlashib ko'rinishni buzmasligi uchun.
- **PDF hisobotlar** (`lib/pdf/documents/SinfNatijalari.tsx`,
  `OquvchiTabeli.tsx`): sarlavhada `maktabNomi` matni yonida
  `/logo-64.png` (`lib/pdf/logo-yoli.ts` — `lib/pdf/shrift.ts`dagi bilan
  bir xil `path.join(process.cwd(), "public", ...)` pattern, chunki
  react-pdf serverda ishlaydi). `KirishKodlari.tsx`ga (kirish kodi
  kartochkalari, sahifada 8 tadan) ataylab qo'shilmadi — bu "hisobot
  sarlavhasi" emas, kesish uchun mo'ljallangan kichik kartochkalar
  to'ri, har biriga logotip qo'yish view chalkashtirar edi.
- **Metadata** (`app/layout.tsx`): `title` shabloni endi `"%s · Odil
  School"` (ilgari `"%s | Odil School"` edi — SEO ishi bilan boshlangan,
  shu bosqichda yangi nusxaga moslashtirildi), `icons.apple`, `manifest:
  "/manifest.json"`, `viewport.themeColor` (`theme.colors.primary`dan).
- **PWA manifest almashtirildi:** eski `app/manifest.ts` (dinamik,
  `/manifest.webmanifest`da, "OS" harflari bilan runtime'da generatsiya
  qilingan ikonkalar — `app/icons/192|512/route.tsx`) butunlay
  o'chirildi, ular o'rniga statik `public/manifest.json` (haqiqiy
  `logo-192.png`/`logo-512.png` bilan) ulandi. Shu bilan birga
  `app/opengraph-image.tsx` (SEO ishida runtime OG rasm generatori)
  ham o'chirildi — endi haqiqiy `/public/og-image.png` ishlatiladi.
  `middleware.ts`dagi endi keraksiz `/icons` va `/opengraph-image`
  istisnolari ham tozalab olib tashlandi.
- **Topilgan va tuzatilgan bug:** `app/favicon.ico` (loyiha birinchi
  marta yaratilganda Next.js o'zi qo'ygan standart fayl) yangi qo'shilgan
  `public/favicon.ico` bilan to'qnashib, **har qanday** `/favicon.ico`
  so'rovini 500 xato bilan qaytarayotgan edi ("conflicting public file
  and page file"). Eski `app/favicon.ico` o'chirildi.
- **Loyihaga tegishli, lekin bu ishga aloqasi yo'q topilma:** `/public/
  personajlar/` papkasida haqiqiy Sherbek, fan va nishon rasmlari
  (`.png`/`.webp`) allaqachon qo'shilgan ekan (git tomonidan kuzatilmagan
  holda) — bular hozircha ulanmagan, chunki bu so'rov faqat logotip haqida
  edi. Keyingi bosqichda (quyida) ulandi.

---

## Personajlar — Sherbek, fan va gamifikatsiya ikonkalari

`/public/personajlar/` ga haqiqiy illyustratsiyalar (`.png`+`.webp`,
shaffof fon) qo'shilgandan keyin ulandi.

- **`components/ui/Sherbek.tsx`** — eski `components/redizayn/sherbek.tsx`
  (emoji-placeholder) o'rniga **yangi joyda** butunlay qayta yozildi va
  barcha eski chaqiruvchilar (talaba Dashboard, tabriklash-modali,
  test-natijasi, mashq/organish-ekrani, /dizayn) shu yangi joyga
  ko'chirildi — eski fayl o'chirildi (ikkita Sherbek qolib
  ketmasligi uchun). `holat` turi 11 qiymatni qamraydi, lekin haqiqiy
  fayl faqat 3 tasida bor (`oddiy`/`zor`/`shoshilish`) — qolganlari
  so'ralsa, `oddiy`ga tushadi va konsolga BIR MARTA (holat boshiga)
  ogohlantirish chiqadi, ilova hech qachon qulab tushmaydi. `<picture>`
  (webp birinchi, png zaxira) ataylab oddiy HTML bilan qilingan —
  next/image ichki `<img>`i qo'lda `<picture>/<source>` bilan mos
  kelmaydi. `animatsiya="nafas"` mavjud `.logo-nafas` klassini qayta
  ishlatadi, `"sakrash"` uchun yangi `.sherbek-sakrash` qo'shildi
  (`app/globals.css`, ikkalasi ham `prefers-reduced-motion` hurmat qiladi).
  - Yangi ishlatilgan joylar: kirish kodi klaviaturasi (`oddiy`, `xl`,
    `nafas` — Logo ostida), mashqda **to'g'ri** javob (`zor`+`sakrash`,
    ilgari `tugri` edi — fayli yo'q edi), rasmiy test ekranida taymer
    2 daqiqadan kamlaganda (`shoshilish`, `sm` — 5.6-band bo'yicha
    BOSHQA hech qanday Sherbek shu ekranda yo'q, faqat shu yagona
    istisno). Bo'sh holat kartalari (Dashboard, /organish) `size="lg"`ga
    oshirildi.
- **`lib/fanlar.ts` + `components/ui/FanIkonka.tsx`** — bazadagi xom fan
  nomini (`fan.nomi`, masalan "Ingliz tili") ikonka fayliga moslaydi
  (`lib/redizayn/fan-rangi.ts` bilan bir xil 9 ta fan ro'yxati, birinchi
  so'z bo'yicha qidiradi — "Ingliz tili" -> "ingliz"). Mos kelmasa xato
  bermay neytral zaxira doira ko'rsatadi. `/sinf/[daraja]` (fan kartalari)
  va `/sinf/[daraja]/[fanId]` (banner, `priority`) ga qo'yildi.
- **`components/ui/Ikonka.tsx`** — kichik gamifikatsiya ikonkalari
  (`public/personajlar/ikonka/`). Dashboard sarlavhasidagi Daraja/XP/
  seriya belgilariga (`kubok`/`yulduz`/`olov`, ilgari 🏆/⭐/🔥 emoji edi)
  va `/nishonlar` sahifasiga (sarlavhada `medal`, qulflangan nishonlarda
  `qalqon` — ilgari 🔒 emoji edi) qo'yildi. Har bir nishonning o'zining
  alohida emoji-ikonkasi (`nishonlar-royxati.ts`dagi 12 xil) ataylab
  o'zgartirilmadi — faqat bitta umumiy nishon-ikonkasi bilan almashtirish
  ularning bir-biridan ajralib turishini yo'qotgan bo'lardi.

---

## Smart Test moduli (`smart-test.md`, `feat/smart-test`)

Asosiy ikki hujjatdan mustaqil, yangi qo'shimcha modul — o'qituvchi
boshqaradigan, butun sinf birga yechadigan, baholanmaydigan "sinf bilan
birga o'rganish" rejimi. To'liq matn: `smart-test.md`.

**Muhim arxitektura qarori — hujjatning o'zidan chetga chiqilgan joy:**
hujjat Smart Testni talaba tomonining kodsiz/ochiq Dashboard'idan
("Kod so'ralmaydi — o'qituvchi darhol boshlaydi") ishga tushirishni va
`GET /api/smart-test/savollar`ni to'g'ri javob bilan birga hech qanday
autentifikatsiyasiz qaytarishni taklif qilgan edi. Bu **CLAUDE.md
xavfsizlik qoidasi #1ga** ("savollar.togri_javob hech qachon klientga
yuborilmaydi" — "buzilmaydi" deb belgilangan) to'g'ridan-to'g'ri zid,
chunki Smart Test aynan rasmiy testlarda ham ishlatiladigan bitta umumiy
`savollar` jadvalidan o'qiydi — agar bitta savol ikkala rejimda ham
ishlatilsa, uning javobi butunlay ochilib qolar edi. Foydalanuvchi bilan
kelishilgan qaror: Smart Test **butunlay `/admin` panelida**, mavjud
admin/o'qituvchi login orqali ishlaydi (`/admin/smart-test`,
`/admin/smart-test/sessiya` — "tashqi" yo'l sifatida `/smart-test`);
`GET` Route Handler o'rniga oddiy `"use server"` Server Action
(`lib/actions/smart-test.ts: smartTestSavollariniOl()`) ishlatiladi va
u `joriyFoydalanuvchiniOl()` bilan tekshiradi + mavjud `savollar` RLS
siyosati (`is_oqituvchi_biriktirilgan`) orqali tabiiy ravishda
cheklanadi — o'qituvchi faqat o'ziga biriktirilgan fan+sinf savollarini
Smart Testda ham ko'radi. Dashboard kartasi ham talaba tomonida emas,
`/admin/dashboard`da (gradient banner) va `AdminNav`da joylashgan.

- **Migratsiya** (`0008_smart_test.sql`): `savollar`ga `izoh_qisqa`
  ("Eslab qoling" qisqa xulosa) va `izoh_rasm_url` — ikkalasi ham
  ixtiyoriy, mavjud qatorlarga ta'sir qilmaydi. Yangi `smart_sessiyalar`
  jurnal jadvali (o'quvchi ma'lumoti umuman yozilmaydi — faqat
  fan/daraja/mavzular/savol-soni/vaqt-rejimi statistikasi). `importlar`
  jadvalining `turi` CHECK cheklovi `'pdf'` qiymatini ham qabul qiladigan
  qilib kengaytirildi (quyiga qarang).
- **Word/PDF import kengaytirildi** (mavjud savollar import oqimining
  bir qismi, alohida ekran emas): `lib/parsers/savol-matni.ts` — Word
  (`word.ts`) va yangi PDF (`pdf.ts`, `pdfjs-dist/legacy/build/pdf.mjs`
  orqali server tomonda matn ajratib oladi — standalone skript bilan
  tasdiqlangan, Node worker'siz ham ishlaydi) uchun umumiy qator-tahlilchi.
  Yangi imkoniyatlar: **ko'p qatorli `Izoh:` qatorini** aniqlaydi (keyingi
  savol raqamigacha davom etadi — ilgari `word.ts` Izohni umuman
  o'qimasdi), `Javob`/`Javobi`/`To'g'ri javob`/`Ответ` va
  `Izoh`/`Tushuntirish`/`Sabab`/`Nega`/`Пояснение` prefikslarini tanib
  oladi, apostrof shakllarini (`'`/`ʻ`/`` ` ``/`'`) bittaga keltiradi.
  Admin import ekraniga (`components/admin/import-hujjat-client.tsx` —
  eski `import-word-client.tsx` o'rniga, endi Word VA PDF ikkalasiga ham
  xizmat qiladi) yangi **"Javob:" qatori bo'lmasa, A ni to'g'ri deb
  hisobla** belgisi va **PDF** tabi qo'shildi (skanerdan olingan,
  matnsiz PDF aniq xabar bilan rad etiladi — 7.4-bo'lim). Ko'rib chiqish
  jadvaliga (`import-natija-jadvali.tsx`) har bir qator uchun "✓ N
  belgi" / "⚠️ izoh yo'q" ustuni va "N ta savolda izoh yo'q" umumiy
  ogohlantirish qo'shildi. Standalone skriptlar bilan tasdiqlangan:
  ko'p qatorli Izoh to'g'ri birlashtiriladi, "Javob:" yo'q + belgi
  yoqilgan holatda A to'g'ri deb olinadi, "To'g'ri javob: C" (ikki so'zli
  prefiks) ham tanib olinadi.
- **`components/admin/savol-form.tsx`** — `izoh_qisqa` va `izoh_rasm_url`
  uchun yangi ixtiyoriy maydonlar qo'shildi (qisqa xulosa matni + mavjud
  "Rasm" maydoni bilan bir xil `savol-rasmlari` bucket'iga alohida
  `izohlar/` prefiksi bilan yuklash).
- **Sozlash ekrani** (`/admin/smart-test`,
  `components/admin/smart-test-sozlash.tsx`): fan + daraja (5–11,
  `lib/redizayn/daraja.ts`dagi mavjud abstraksiya qayta ishlatildi) +
  ko'p tanlovli mavzu (checkbox ro'yxati — Base UI'ning ko'p tanlovli
  Select'i yo'q, shuning uchun oddiy checkbox guruhi ishlatildi) +
  savollar soni (10/15/20/Hammasi) + vaqt rejimi + tartib. Tanlov
  o'zgarganda **jonli** (debounce 300ms) `smartTestSavollariniOl()`
  chaqirilib, "N ta izohli savol topildi" ko'rsatiladi (3-bo'limdagi
  "Bu mavzuda izohli savol N ta. Davom etamizmi?" talabini alohida
  tasdiqlash oynasi o'rniga oldindan ko'rsatish orqali hal qiladi —
  o'qituvchi BOSHLASH bosishdan oldin allaqachon ko'radi, natijada
  BOSHLASH bosilganda qo'shimcha so'rov kerak emas, sessiya darhol
  boshlanadi). Sozlamalar (savollar payload'isiz) `localStorage`da,
  haqiqiy savollar (izoh va to'g'ri javob bilan) `sessionStorage`da
  saqlanadi (`SMART_TEST_SESSIYA_KALITI`) — 10-bo'lim talabiga mos.
- **Sessiya ekrani** (`/admin/smart-test/sessiya`,
  `components/admin/smart-test-sessiya.tsx` + katta ekran 2×2 variant
  to'ri `smart-test-variantlar.tsx`): savol → to'g'ri javobni ko'rsatish
  → (izoh bo'lsa) tushuntirish → keyingi savol bosqichlari; `Space`/
  `Enter` shu ketma-ketlikni bitta tugma bilan boshqaradi, `←`/`→` savol
  navigatsiyasi, `P` taymer pauzasi, `1`–`4` ixtiyoriy "sinf tanlovi"
  belgisi (4.4-bo'lim), `Esc`/`✕` tasdiqlash bilan chiqish. Vaqt rejimida
  taymer tugaganda **avtomatik ochilmaydi**, shunchaki to'xtaydi
  (4.2-bo'lim talabi). Variant tartibi (A/B/C/D qaysi rangda chiqishi)
  mavjud `lib/talaba/aralashtirish.ts: variantTartibiniYaratish()` bilan
  sessiya yuklanganda bir marta hisoblanadi va sessiya davomida
  o'zgarmaydi. Wake Lock va to'liq ekran — `prezentatsiya-korish.tsx`dagi
  bilan bir xil pattern. Sessiya tugaganda (oxirgi savoldan keyin
  avtomatik yoki ✕ orqali qo'lda) `smartTestSessiyasiniYozish()` bir
  martalik statistika yozuvini yozadi va yakun ekrani ("N savol ko'rib
  chiqildi · Fan · Daraja-sinf" + [Yangi sessiya]/[Dashboardga])
  ko'rsatiladi.
  - **Topilgan va tuzatilgan bug (React "setState during render"):**
    `keyingiSavol()` oxirgi savoldan keyin `yakunlash()`ni (bir nechta
    boshqa state'ni yangilaydigan funksiya) `setJoriyIndeks`ning
    YANGILOVCHI FUNKSIYASI ICHIDA chaqirar edi — bu React'ning "Cannot
    update a component while rendering a different component" xatosiga
    olib kelardi (brauzer konsolida va Next.js dev overlay'ida "1 Issue"
    belgisi orqali sinab ko'rishda topildi, aynan sessiyaning oxirgi
    savolidan keyingi "Keyingi savol" bosilganda). Tuzatish:
    `joriyIndeks`ni to'g'ridan-to'g'ri (yopilish orqali) o'qib, oxirgi
    savolmi-yo'qmi avval tekshiriladi, keyin FAQAT bitta state
    o'zgartiruvchi chaqiriladi (`yakunlash()` YOKI `setJoriyIndeks`,
    ikkalasi birga emas). Tuzatilgandan keyin butun sessiya oqimi
    (bir nechta marta, ✕ orqali qo'lda chiqish va oxirgi savoldan keyin
    avtomatik tugash — ikkalasi ham) qayta sinovdan o'tkazilib,
    konsolda xato yo'qligi tasdiqlandi.
  - **Topilgan va tuzatilgan bug (ko'rinmas tugma):** tushuntirish
    ekranidagi "← Savolga qaytish" tugmasi `rang="outline"` +
    qo'lda qo'shilgan `className="!text-white"` bilan chaqirilgan edi —
    lekin `Tugma`ning "outline" varianti oq FON (shaffof emas) beradi,
    shuning uchun oq matn oq fonda butunlay ko'rinmas bo'lib qolgan edi.
    Ekranda sinab ko'rishda topildi. Tuzatish: ortiqcha
    `className="!text-white"` olib tashlandi — "outline"ning standart
    to'q matn rangi oq fonda tabiiy ravishda o'qiladigan.
- Brauzerda haqiqiy admin hisobi bilan to'liq sinovdan o'tkazildi: Word
  import ko'p qatorli Izoh bilan (standalone skript orqali, fayl yuklash
  UI'sini avtomatlashtirish brauzer cheklovi tufayli to'g'ridan-to'g'ri
  imkonsiz bo'lgani uchun), PDF parser wiring, sozlash ekranidagi jonli
  savol-soni hisoblagichi (2 ta izohli savol to'g'ri topildi), to'liq
  sessiya oqimi (2 savol, har biri reveal→tushuntirish→keyingi),
  taymersiz va ✕-orqali-chiqish yo'llari, `smart_sessiyalar`ga yozuv
  (`service_role` skript orqali bazadan tasdiqlangan). Sinov uchun
  yaratilgan admin hisobi va sessiya jurnali yozuvlari keyin tozalab
  tashlandi; sinovda ishlatilgan ikkita mavjud savolga qo'shilgan
  Izoh/"Eslab qoling" matni ataylab saqlab qolindi (haqiqiy kontent,
  Smart Testda foydali).

---

## Bilim g'ildiragi (`bilim-gildiragi.md`, `feat/gildirak`)

Smart Test bilan bir oilada ("bir xil ko'rinish" — 2×2 variant to'ri,
tema ranglari, admin-gated arxitektura), lekin alohida ishlaydi — o'qituvchi
boshqaradigan, o'quvchi ismini g'ildirak orqali tasodifiy tanlaydigan sinf
o'yini. To'liq matn: `bilim-gildiragi.md`. Smart Test kabi butunlay
`/admin` panelida ishlaydi (login talab qiladi) — bu yerda sabab boshqacha:
G'ildirak API'si o'quvchi ismlarini (shaxsiy bo'lmasa-da) va to'g'ri
javoblarni yuboradi, hujjatning o'zi ham buni "faqat autentifikatsiyadan
o'tgan o'qituvchi uchun" deb talab qilgan (10-bo'lim) — alohida savol-
javob talab qilinmadi, Smart Test'dan keyin allaqachon o'rnatilgan qoida.

**Sxema moslashuvi:** hujjatning 8-bo'limidagi SQL namunasi
`profillar(id)`ga ishora qiladi — bu loyihada bunday jadval yo'q (haqiqiy
jadval `foydalanuvchilar`, 0001_init.sql). Migratsiyada shunga to'g'irlab
qo'yildi.

- **Migratsiya** (`0009_gildirak.sql`): `gildirak_sessiyalar`,
  `gildirak_natijalar`, `yordam_topshiriqlari` — uchalasi ham butunlay
  yangi, mavjud jadvallarga tegilmagan. `yordam_topshiriqlari` RLS'i
  boshqacha: talaba tomoni (kirish kodi, Supabase Auth'siz) uni
  `service_role` orqali o'qiydi — xuddi `progress`/`mashq_sessiyalar`
  kabi (`lib/talaba/yordam-topshiriqlari.ts`).
- **Sozlash ekrani** (`/admin/gildirak`,
  `components/admin/gildirak-sozlash.tsx`): sinf/fan/mavzu (Smart Test
  bilan bir xil pattern) + `oquvchilarniOl(sinfId)` orqali kelgan
  davomat ro'yxati ("Bugun kim yo'q?" — belgilanganlar QATNASHMAYDI,
  standart holat — hammasi qatnashadi) + raqamlar soni (12/20/30) +
  omadli raqamlar (ixtiyoriy, 15%) + baho qo'yish rejimi. BOSHLASH
  bosilganda: `gildirakSessiyasiniBoshlash()` bilan sessiya yaratiladi,
  savollar poolidan (Smart Test'dagi kabi, lekin izoh mavjudligi shart
  emas) tasodifiy N tasi tanlanadi va raqamlarga biriktiriladi (takror
  yo'q — bir martalik `royxatniAralashtirish`+slice), natija
  `sessionStorage`ga yoziladi.
- **G'ildirak komponenti** (`components/admin/gildirak-wheel.tsx`):
  ≤20 qatnashuvchi — SVG pie-slice g'ildirak (`<path>` yoylari qo'lda
  trigonometriya bilan hisoblangan, matn `rotate()+translate()` bilan
  radial joylashtirilgan); >20 — vertikal "slot mashinasi" ro'yxati
  (uzun takrorlangan ro'yxat + `translateY` orqali tanlangan ismga
  qadar siljish). Ikkalasi ham bitta CSS `transition` bilan aylanadi
  (`cubic-bezier(0.15,0.9,0.25,1)`, 4s) — hech qanday kadr-baholik
  JavaScript hisob yo'q (4.4-bo'lim talabi). Tasodifiy tanlash
  `crypto.getRandomValues()` orqali (4.5-bo'lim, aniq talab qilingan
  API). Tanlangandan keyin ism katta bo'lib chiqadi,
  [Qayta aylantirish] (natijani bekor qiladi — "chiqqanlar"dan olib
  tashlaydi) / [Doskaga chiq!] tanlovi beriladi.
- **Raqamlar ekrani** (`components/admin/gildirak-raqamlar.tsx`):
  N ta rangli katak, bosilganda `rotateY` flip animatsiyasi (400ms)
  keyin savol yoki (omadli bo'lsa) sovg'a ekraniga o'tadi.
- **Savol ekrani**: `components/admin/gildirak-variant-panjarasi.tsx` —
  Smart Test'ning 2×2 to'ridan farqi, bu yerda **o'quvchi o'zi bosadi**
  (mashq/organishdagi `VariantTugmalari`ning click-to-answer
  semantikasi, lekin 2×2 grid ko'rinishida). Javob tanlangandan 1.2s
  keyin avtomatik to'g'ri/xato ekraniga o'tadi.
  - **Topilgan va tuzatilgan bug (ikki marta, bir xil sinf xatosi):**
    variantlar har safar aralashtiriladi (`variantniAralashtir()`,
    ko'rsatilgan pozitsiya -> asl harf xaritasi, `xarita`). (1) Javob
    to'g'riligini tekshirishda bosilgan KO'RSATILGAN harf to'g'ridan-
    to'g'ri `savol.togriJavob` (ASL harf) bilan solishtirilgan edi —
    aralashtirish asl holatini o'zgartirmagan holatlarda tasodifan
    to'g'ri natija bergani uchun bug darhol bilinmadi, lekin ekranda
    boshqa aralashtirish natijasida (masalan to'g'ri javob B dan A
    pozitsiyasiga tushganda) o'quvchi to'g'ri javobni bossa ham "xato"
    deb hisoblanardi. Tuzatish: bosilgan harfni avval `xarita` orqali
    asl harfga o'girib, keyin solishtirish. (2) Xuddi shu sabab bilan,
    to'g'ri javobni EKRANDA BELGILASH (reveal) qismida ham asl harfni
    ko'rsatilgan harf sifatida noto'g'ri talqin qilingan edi (teskari
    yo'nalishda qidiruv o'rniga to'g'ridan-to'g'ri indekslash) —
    natijada boshqa aralashtirishda ekранда butunlay boshqa (noto'g'ri)
    variant "to'g'ri" deb ko'rsatilardi, bosilgan javobdan qat'i nazar.
    Ikkalasi ham brauzerda haqiqiy sinov paytida topildi (ekranda
    ko'rinib turgan to'g'ri javob bilan bazadagi haqiqiy to'g'ri javob
    mos kelmasligi payqalib) va alohida-alohida tuzatildi; tuzatilgandan
    keyin bir nechta marta turli aralashtirish natijalari bilan qayta
    sinovdan o'tkazilib, ekrandagi ✓ belgisi va bazaga yoziladigan
    `togri` maydoni har doim bir-biriga mos kelishi tasdiqlandi.
- **To'g'ri javob ekrani**: BARAKALLA, Sherbek `kubok`+`sakrash`,
  ⭐5⭐, konfetti (mavjud `Konfetti` komponenti qayta ishlatildi — 24
  bo'lak, hujjatning "30 tadan ko'p bo'lmasin" chegarasiga mos).
- **Xato javob ekrani** ("Yaqin edi, {ism}!" — "xato"/"noto'g'ri" so'zi
  YO'Q, fon qizil EMAS, 2-bo'lim pedagogik qoidasi): to'g'ri javob va
  izoh darhol ko'rsatiladi, Sherbek `maslahat` (`yigi` EMAS), yordam
  topshirig'i darhol yaratiladi (`gildirakYordamTopshirigiYaratish()`)
  va ekranda karta + "Topshiriqni chop etish" havolasi ko'rinadi.
  - **Yordam matni manbai** (6.4-bo'lim tartibidan soddalashtirilgan):
    mavzuning `uyga_vazifa`i bo'lsa o'shani, aks holda umumiy
    "darslikni qayta ko'rib chiqing va mashq qiling" taklifini
    ishlatadi — hujjatdagi 3-bosqichli zanjirning (uyga_vazifa →
    o'quv materiallari → 5 ta qiyinlik=1 mashq savoli ro'yxati)
    ikkinchi va uchinchi bosqichlari vaqt tejash uchun amalga
    oshirilmadi, chunki 2-bo'limning asosiy talabi ("bola quruq
    qaytmasin, tushuntirish olsin") allaqachon birinchi bosqich va
    darhol ko'rsatiladigan izoh orqali qondiriladi.
  - **+5 XP har doim** (2.3-band: "xato javobdan keyin ham o'quvchi
    bir narsa yutadi"): `xpBerish(oquvchiId, 5, "gildirak_urinish")`
    ham to'g'ri, ham xato javobda chaqiriladi — mavjud gamifikatsiya
    tizimiga (`lib/redizayn/gamifikatsiya.ts`) yagona integratsiya
    nuqtasi, bu yerda ham (Smart Test'dan farqli o'laroq) haqiqiy
    o'quvchi XP'siga ta'sir qiladi, chunki G'ildirak (Smart Test'dan
    farqli) haqiqiy `oquvchilar` yozuvlariga bog'langan.
- **Yordam topshirig'i — talaba tomonida ko'rinishi**: yangi
  `components/student/topshiriq-banner.tsx` + `app/talaba/menyu/
  page.tsx`ga qo'shildi — kirish kodi bilan kirgan o'quvchi
  bajarilmagan topshiriqlarini ko'radi ("📋 Sizga N ta yordam
  topshirig'i bor"), "Bajarildi deb belgilash" tugmasi bilan
  yashiradi. Yangi matnlar (`talaba.menyu.topshiriqBor`/
  `topshiriqBajarildi`) mavjud i18n tizimiga (`uz.ts`/`ru.ts`)
  qo'shildi — kod ichida qattiq kodlangan matn yozilmadi (loyihaning
  o'zgarmas qoidasi).
- **"Topshiriqni chop etish"**: loyihada `window.print()` konvensiyasi
  yo'qligi tekshirilgandan keyin, mavjud PDF hisobot patterniga
  (`lib/pdf/documents/*.tsx` + `app/api/hisobot/pdf/*` route'lari, xuddi
  `KirishKodlari.tsx`/`kodlar/route.tsx` kabi) mos qilib yangi
  `UygaVazifaKartasi.tsx` + `/api/hisobot/pdf/uyga-vazifa` qo'shildi —
  A5 o'lchamli, bitta o'quvchi uchun bitta karta, DejaVu Sans shrifti
  bilan (kirill/lotin xavfsiz).
- **Baho qo'yish — ikki bosqichli tasdiqlash** (8-bo'lim ehtiyotkorligi:
  "avtomatik baho qo'yish xavfli"): har bir to'g'ri javobda
  `gildirak_natijalar.baho=5, tasdiqlandi=false` yoziladi — ekranda
  darhol ko'rinadi, lekin "yakuniy" hisoblanmaydi. Sessiya
  tugaganda (✕ orqali yoki hamma o'quvchi chiqib bo'lgach), agar
  "tasdiqlash" rejimi tanlangan bo'lsa, yakun ekranida har bir
  bahoni ko'rish/tahrirlash mumkin (`gildirakBahoniOzgartirish`) va
  faqat [Jurnalga yozish] bosilgandan keyin `tasdiqlandi=true` +
  `gildirak_sessiyalar.jurnalga_yozildi=true` bo'ladi
  (`gildirakSessiyaniYakunlash`). "Faqat ekranda" rejimida esa hech
  qanday tasdiqlashsiz, `gildirakSessiyaniBekorYopish` bilan sessiya
  shunchaki yopiladi. **Muhim izoh:** bu "jurnal" mavjud rasmiy
  baholash pipeline'iga (`urinishlar`/`natijalar`/PDF tabellar)
  UMUMAN ULANMAGAN — o'z-o'zicha yopiq, faqat shu modul doirasidagi
  "tasdiqlangan" belgisi (hujjat buni alohida rasmiy jurnal tizimiga
  integratsiya qilishni talab qilmagan, "alohida ishlaydi" header
  izohiga mos).
- Brauzerda haqiqiy admin hisobi, real 5-B sinfi (mavjud "Aliyev
  Sardor" + sinov uchun qo'shilgan ikkita vaqtinchalik o'quvchi) va
  Smart Test testlaridan qolgan izohli savollar bilan to'liq sinovdan
  o'tkazildi: g'ildirak aylanishi (3 va undan kam qatnashuvchida SVG
  rejimi), "bir marta tanlanmaydi" qoidasi, "Qayta aylantirish",
  raqamlar to'ri, savol ekrani (ikkala bug tuzatilgandan keyin to'g'ri
  ishlashi qayta-qayta tasdiqlangan), BARAKALLA va "Yaqin edi" ekranlari,
  yordam topshirig'i yaratilishi + PDF endpoint (200 OK), talaba
  tomonidagi bildirishnoma ("Bajarildi deb belgilash" bilan birga), va
  yakun ekranidagi baho tasdiqlash + "Jurnalga yozish" oqimi — bazadan
  tasdiqlangan (`tasdiqlandi`/`jurnalga_yozildi` to'g'ri o'rnatilgan).
  **Chuqur sinovdan o'tkazilmagan** (past xavfli, sof arifmetik/allaqachon
  ko'rib chiqilgan kod, UI avtomatlashtirish cheklovi tufayli): "omadli
  raqamlar" sovg'a yo'li va "faqat ekranda ko'rsatilsin" bahosiz-yopish
  yo'li — ikkalasi ham qo'lda ko'rib chiqildi va to'g'ri deb topildi,
  lekin brauzerda checkbox/radio bosilishi ishonchli avtomatlashtirilmadi.
  Sinov uchun yaratilgan hisob, o'quvchilar va barcha sessiya/natija/
  topshiriq yozuvlari keyin to'liq tozalab tashlandi.

---

## O'qituvchi paneli (`feat/oqituvchi-paneli`)

Foydalanuvchi so'rovi bilan qo'shildi: admin barcha imkoniyatlarini
saqlab qolib, direktor o'zi login/parol yaratib beradigan **o'qituvchi**
hisoblari ham deyarli hamma narsani (savol/test qo'shish, o'quvchi
ro'yxatini boshqarish, Smart Test/G'ildirak) qila oladigan, lekin
**"teacher biriktirish" (fan+sinf tayinlash) faqat adminda** qoladigan
qilib qurildi.

**Muhim topilma — arxitektura allaqachon tayyor edi:** asl texnik
topshiriqning birinchi migratsiyalari (`0001_init.sql`,
`0003_mavzular_oqituvchi_huquqi.sql`) `foydalanuvchilar.rol`
(`admin`/`oqituvchi`) va `biriktirish` (o'qituvchi→fan+sinf tayinlash)
jadvallarini, shuningdek `is_oqituvchi_biriktirilgan(fan_id, sinf_id)`
SQL yordamchisini va unga asoslangan to'g'ri RLS siyosatlarini
(`savollar`, `testlar`, `mavzular`, `dars_materiallari` va h.k.)
birinchi kundanoq qamrab olgan edi — biroq `oqituvchi` rolidagi bironta
haqiqiy hisob hech qachon yaratilmagani uchun bu butun infratuzilma
amalda bir marta ham ishlatilmagan edi. Shu sababli bu bosqichning asosiy
ishi yangi ruxsat tizimi loyihalash emas, balki (1) yetishmayotgan
hisob-yaratish/biriktirish UI'sini qurish, (2) auditda topilgan haqiqiy
RLS bo'shliqlarini yopish va (3) dropdownlarni o'qituvchining haqiqiy
ruxsat doirasiga oldindan filtrlash edi.

- **Migratsiya** (`0010_oqituvchi_paneli.sql`): yangi
  `is_oqituvchi_sinfga_biriktirilgan(p_sinf_id)` SQL funksiyasi (mavjud
  `is_oqituvchi_biriktirilgan(fan_id, sinf_id)`ning sinf-only varianti —
  `oquvchilar` jadvalida `fan_id` yo'q, chunki o'quvchi fanga emas, sinfga
  tegishli). Bu orqali `oquvchilar` uchun yetishmagan INSERT/UPDATE/DELETE
  RLS siyosatlari qo'shildi (avvalgi SELECT siyosati biriktirish bo'yicha
  to'g'ri cheklangan edi, lekin yozish 100% admin-only edi — endi
  biriktirilgan o'qituvchi ham o'z sinfidagi o'quvchini qo'sha/tahrirlay/
  o'chira oladi). Shuningdek `importlar` jadvaliga (ilgari 100%
  admin-only) o'qituvchining o'z yozuvlarini ko'rish/yozish siyosati
  qo'shildi.
- **`lib/actions/foydalanuvchilar.ts`** (yangi) — yagona joy, barcha
  eksport qilingan funksiya `adminEkanliginiTekshirish()` bilan boshlanadi
  (bu yerda RLS YO'Q, chunki `createServiceRoleClient()` ishlatiladi —
  shu tekshiruv yagona ruxsat qatlami). O'qituvchi qo'shish
  (`auth.admin.createUser` + `foydalanuvchilar` profil yozuvi, ikkinchisi
  muvaffaqiyatsiz bo'lsa avtomatik `auth.admin.deleteUser` bilan orqaga
  qaytariladi — mavjud import-fan-rollback patterniga mos), parol
  almashtirish, faollik o'zgartirish, biriktirish qo'shish/o'chirish.
  `foydalanuvchilar` jadvalida email ustuni yo'q (asl dizayn — email
  Supabase'ning ichki `auth.users`ida) — shuning uchun ro'yxat
  `admin.auth.admin.listUsers()` orqali email bilan qo'shimcha
  bog'lanadi.
- **`/admin/foydalanuvchilar`** (ilgari "Tez orada" placeholder edi) —
  endi to'liq UI: barcha hisoblar jadvali, "Yangi o'qituvchi qo'shish"
  dialogi, har qatorda parol almashtirish/faollik o'zgartirish/
  "Biriktirishlar" boshqaruvi (fan+sinf qo'shish/o'chirish) —
  `components/admin/foydalanuvchilar-client.tsx`. Bu bo'lim qat'iy
  admin-only bo'lib qoladi (foydalanuvchining o'zi aniq talab qilgan).
- **Doira bo'yicha filtrlash** (`lib/auth/admin.ts:
  joriyKirishDoirasiniOl()` + `lib/utils/select-items.ts:
  doiraBoyichaFiltrlash()`): admin uchun `cheklanganmi: false` (cheksiz),
  o'qituvchi uchun o'z biriktirishlaridan hisoblangan fan/sinf id
  ro'yxati. **Muhim:** `cheklanganmi: false` va bo'sh massiv ikki xil
  holat — bo'sh massivni "hech narsaga ruxsat yo'q" deb talqin qilish
  yangi yaratilgan (hali biriktirilmagan) o'qituvchi uchun xato natija
  berardi. Bu filtr `/savollar`, `/savollar/import`, `/oquvchilar`,
  `/testlar`, `/kontent`, `/materiallar`, `/natijalar`, `/gildirak`
  sahifalariga qo'shildi — dropdownlar RLS ruxsat bermaydigan fan/sinfni
  umuman ko'rsatmaydi (chalkash Postgres xatosi o'rniga). `/smart-test`
  "daraja" abstraktsiyasidan foydalangani uchun alohida moslashtirildi:
  haqiqiy `sinflar`ni (ilgari bu sahifada umuman o'qilmagan) o'qituvchi
  biriktirishlariga solishtirib, ruxsat etilgan daraja raqamlarini
  (`sinfDarajasi()` orqali) hisoblaydi.
- **Ish reja import** (`/admin/import/ishreja`) va Foydalanuvchilar
  bo'limi — foydalanuvchi bilan aniq kelishilganidek, **qat'iy admin-only**
  bo'lib qoladi; Smart Test va G'ildirak esa o'qituvchiga ochiq (mavjud
  nav — `admin-nav.tsx` — bularni allaqachon ikkala rolga ham ko'rsatib
  turgan edi, o'zgartirish shart bo'lmadi).
- **Brauzer test gotchasi (kod xatosi EMAS, faqat o'zim uchun eslatma):**
  Base UI Select'ning `items` ro'yxatida faqat BITTA element bo'lsa
  (masalan o'qituvchi bitta fan/sinfga biriktirilganda), trigger tugmasini
  bosish popup ochib, o'sha yagona variantni "tanlangandek" ko'rsatadi —
  lekin bu shunchaki hover/keyboard-highlight render, haqiqiy tanlash
  hodisasi emas. Faqat triggerga bosib screenshot olinsa, tanlov to'g'ri
  ko'rinadi, lekin qo'shni Select bosilganda avvalgi holat placeholderga
  qaytadi. To'g'ri usul: `read_page(filter:"all")` orqali ochilgan
  `listbox` ichidagi haqiqiy `option`ning ekrandagi joylashuvini (odatda
  trigger ustiga to'g'ridan-to'g'ri anchored) screenshot orqali aniqlab,
  aynan o'sha koordinataga bosish kerak — refning o'zi ko'pincha
  `(0,0)`da "viewport tashqarisida" deb xato hisoblanadi, shuning uchun
  `scroll_to`/ref-click ishlamaydi, faqat koordinata bo'yicha klik
  ishlaydi.
- Brauzerda haqiqiy o'qituvchi hisobi (Informatika + 5-B ga biriktirilgan)
  bilan to'liq sinovdan o'tkazildi: `/oquvchilar` ro'yxati faqat 5-B
  o'quvchisini ko'rsatishi (mavjud SELECT RLS), yangi INSERT siyosati
  bo'yicha o'quvchi qo'shish, yangi DELETE siyosati bo'yicha o'chirish,
  `/savollar`da savol yaratish (yangi savol `created_by` maydonida
  o'qituvchining o'z ID'si bilan to'g'ri yozilgani bazadan tasdiqlandi),
  nav'da admin-only bo'limlarning (Foydalanuvchilar, Ish reja import)
  yashirilgani, Smart Test/G'ildirak kartalarining ko'rinishda qolgani —
  barchasi tasdiqlandi. Sinov uchun yaratilgan ikkita vaqtinchalik hisob
  (admin va o'qituvchi), ularning biriktirishlari va test savoli keyin
  to'liq tozalab tashlandi — haqiqiy "Direktor" admin hisobiga tegilmadi.
