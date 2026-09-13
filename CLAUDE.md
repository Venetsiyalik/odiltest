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
