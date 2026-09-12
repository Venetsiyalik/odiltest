# TEXNIK TOPSHIRIQ
## Odil School — o'quv va baholash platformasi

**Buyurtmachi:** Odil School xususiy maktabi (Toshkent, Chingiz Aytmatov ko'chasi 53)
**Ishlab chiquvchi vositasi:** Claude Code + GitHub + Vercel
**Versiya:** 1.0 · 2026-09-12

---

## 1. LOYIHA MAQSADI

Maktabning barcha fanlari bo'yicha o'quvchilarni **o'qitish** va **baholash** uchun yagona veb-platforma. Platforma har bir sinf xonasidagi **smart ekran** orqali ishlatiladi, shuningdek telefon va noutbukda ham to'liq ishlaydi.

Platforma ikkita mustaqil ishlaydigan qismdan iborat:

| Qism | Manzil | Kim ishlatadi |
|---|---|---|
| **O'quvchi ilovasi** | `odilschool.uz` | O'quvchilar (smart ekran, telefon) |
| **Admin panel** | `admin.odilschool.uz` | Direktor, o'qituvchilar |

Ikkalasi bitta Next.js monorepo ichida, lekin **alohida layout, alohida dizayn, alohida autentifikatsiya** bilan. Admin panel o'quvchi ilovasining ichidan hech qanday havola orqali ochilmaydi.

---

## 2. FOYDALANUVCHI ROLLARI

### 2.1 O'quvchi
- Ro'yxatdan o'tmaydi. Admin uni bazaga kiritadi va unga **6 xonali kirish kodi** beriladi.
- Kod bilan kiradi → ismi va sinfi ekranda tasdiqlanadi → bosh menyuga tushadi.
- Parol yo'q, email yo'q. 5-sinf bolasi ham mustaqil kira oladi.

### 2.2 O'qituvchi
- Email + parol (Supabase Auth).
- Faqat **o'ziga biriktirilgan fan va sinflar** bo'yicha ishlaydi: savol qo'shadi, test yaratadi, natija ko'radi, dars materiali joylaydi.
- Boshqa fanning savollarini ko'ra olmaydi.

### 2.3 Admin (direktor / mas'ul shaxs)
- Hamma narsaga ruxsat: fanlar, sinflar, o'quvchilar, o'qituvchilar, barcha natijalar, PDF hisobotlar, tizim sozlamalari.

---

## 3. SMART EKRAN TALABLARI ⭐ (eng muhim bo'lim)

Platforma **birinchi navbatda smart ekran uchun** loyihalanadi, telefon versiyasi — ikkilamchi. Sinfdagi ekranlar odatda 55–75 dyuym, 1920×1080, **gorizontal**, **sensorli**, sichqoncha va klaviaturasiz.

### 3.1 Majburiy UI qoidalari
- **Minimal bosiladigan element o'lchami: 72×72 px.** Variant tugmalari — butun qator kengligida, balandligi kamida 96 px.
- **Asosiy matn: 24 px dan kichik emas.** Savol matni: 32–40 px. Sarlavhalar: 48 px+.
- **`hover` effektlariga tayanmaslik.** Barcha holat o'zgarishlari `:active` va tanlangan holat orqali ko'rsatiladi.
- Tanlangan variant — qalin ramka + fon rangi + belgi (✓). Faqat rang bilan farqlanmasin (dальtonizm).
- **Gorizontal layout:** savol chapda, variantlar o'ngda yoki 2×2 katak — vertikal uzun ro'yxat qilinmasin, ekran pastiga scroll qilish sensorda noqulay.
- **Scroll minimal.** Har bir savol bitta ekranga to'liq sig'sin.
- Kontrast yuqori: sinf yorug' bo'ladi, oqish-kulrang matn o'qilmaydi. `WCAG AA` minimum.
- Animatsiyalar qisqa (150–200 ms), ko'p emas.

### 3.2 Ekran klaviaturasi
Smart ekranlarda tizim klaviaturasi chiqmasligi mumkin. Shuning uchun:
- **Kirish kodi ekranida o'z ichki raqamli klaviatura** (0–9, o'chirish) — katta tugmalar bilan, HTML `<input>` fokusiga tayanmaydi.
- Ochiq javobli savol turi v1 da **yo'q** (faqat test). Shuning uchun boshqa joyda matn kiritish talab qilinmaydi.

### 3.3 Umumiy foydalanish rejimi (kiosk)
Smart ekran — **umumiy qurilma**. Buni hisobga olish shart:
- Test tugagach yoki bosh menyudan **"Chiqish"** bosilganda sessiya **butunlay** tozalanadi (cookie o'chadi, orqaga qaytish ishlamaydi).
- **3 daqiqa harakatsizlikdan** keyin avtomatik chiqadi va bosh ekranga qaytadi (test jarayonida bundan mustasno).
- Kirish kodi brauzerda **saqlanmaydi** (`autocomplete="off"`, localStorage'ga yozilmaydi).
- Test jarayonida orqaga/yangilash bosilsa — sessiya bazadan tiklanadi, savollar boshidan boshlanmaydi va vaqt qayta hisoblanmaydi.
- Bosh ekranda doimo **"Sinf rejimi"** tugmasi: o'qituvchi ekranni sinf oldida tushuntirish uchun ishlatganda interfeys yanada kattalashadi (shrift ×1.25).

### 3.4 Texnik
- Maqsadli o'lcham: `1920×1080` (asosiy), `1280×800`, `768` (planshet), `390` (telefon).
- Tailwind breakpoint'lar teskari tartibda emas: dizayn `lg`/`xl` dan boshlanadi, keyin telefonga siqiladi.
- PWA: `manifest.json` + offline fallback sahifasi. Smart ekranga "ilova" sifatida o'rnatib qo'yish mumkin bo'lsin.
- Internet uzilib qolsa: test davomida javoblar `localStorage`ga ham yoziladi va ulanish tiklanganda serverga jo'natiladi.

---

## 4. MODULLAR

### 4.1 O'QUVCHI ILOVASI

#### Kirish ekrani
```
[ODIL SCHOOL logotipi]
"Kirish kodini kiriting"
┌───┬───┬───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │   ← 6 ta katak
└───┴───┴───┴───┴───┴───┘
[ 1 ][ 2 ][ 3 ]
[ 4 ][ 5 ][ 6 ]      ← katta raqamli klaviatura
[ 7 ][ 8 ][ 9 ]
[ ⌫ ][ 0 ][ → ]
```
Kod to'g'ri bo'lsa: "Salom, **Aliyev Sardor** · 5-B sinf" → [Davom etish] / [Bu men emasman].

#### Bosh menyu (3 ta katta karta)
1. **📚 O'rganish** — mavzularni o'qish, misollar ko'rish
2. **✏️ Mashq qilish** — baholanmaydigan, cheksiz test
3. **📝 Test topshirish** — o'qituvchi tayinlagan rasmiy testlar

Pastda kichikroq: **📊 Mening natijalarim** · **Chiqish**

---

#### MODUL A — O'RGANISH (o'quv qismi)

O'quvchi: Fan → Mavzu ro'yxati → Mavzu.

Mavzu sahifasi bosqichma-bosqich (bir ekranda bitta bosqich, pastda "Keyingi"):
1. **Nazariya** — matn, rasm, video (YouTube embed yoki Supabase Storage)
2. **Misol** — yechilgan namuna
3. **O'z-o'zini tekshirish** — 3–5 savol, **ball qo'yilmaydi**, har javobdan keyin darhol "To'g'ri/Noto'g'ri" + `savollar.izoh` dan tushuntirish chiqadi
4. **Yakun** — mavzu "o'rganildi" deb belgilanadi

Progress: har bir fan bo'yicha "12 mavzudan 7 tasi o'rganildi" progress bar. Bu **baho emas**, motivatsiya uchun.

O'qituvchi admin panelda mavzu kontentini oddiy matn muharriri orqali kiritadi (rich text: qalin, ro'yxat, rasm, kod bloki, formula).

---

#### MODUL B — MASHQ

- O'quvchi fan va mavzuni tanlaydi (yoki "aralash").
- Savollar `savollar` bazasidan tasodifiy chiqadi, **soni cheklanmagan**, vaqt yo'q.
- Har bir javobdan keyin **darhol** natija va izoh ko'rsatiladi.
- Natija jurnalga yozilmaydi, bahoga ta'sir qilmaydi — lekin `mashq_statistika`ga yig'iladi (o'qituvchi "bu bola mashq qilyaptimi" ko'rishi uchun).
- "Xato qilgan savollarni qayta ishlash" tugmasi.

---

#### MODUL C — TEST TOPSHIRISH (rasmiy baholash)

- O'quvchiga **faqat o'z sinfiga va ochiq vaqt oralig'idagi** testlar ko'rinadi.
- Testni boshlashdan oldin ogohlantirish ekrani: test nomi, savollar soni, vaqt, urinishlar soni. [Boshlash].
- Test ekrani:
  - Yuqorida: **taymer** (oxirgi 2 daqiqada qizil), **savol 7/20**, progress bar
  - O'rtada: savol matni (+ rasm bo'lsa)
  - Variantlar: A, B, C, D — katta tugmalar
  - Pastda: [Orqaga] [Keyingi] · o'ngda [Yakunlash]
  - Yon panelda savollar xaritasi: javob berilgan/berilmagan/belgilangan (◆ "keyin qaytaman")
- Har bir javob **darhol serverga yoziladi** (avtomatik saqlash).
- Vaqt tugasa — avtomatik yakunlanadi.
- Yakuniy ekran: `18/20 · 90% · baho 5`. Agar `natija_korsat=false` bo'lsa: "Test qabul qilindi, natijani o'qituvchingiz e'lon qiladi".
- Agar test sozlamasida ruxsat berilgan bo'lsa — xatolar ustida ishlash ekrani (qaysi savolda adashgani + izoh).

**Nusxa ko'chirishga qarshi:** savollar tartibi va variantlar tartibi har bir o'quvchi uchun aralashtiriladi (`aralashtirish=true`); to'g'ri javob hech qachon klientga yuborilmaydi; bitta o'quvchi kodi bir vaqtning o'zida ikki qurilmada faol test ocholmaydi.

---

#### MODUL D — MENING NATIJALARIM
Topshirilgan testlar ro'yxati, ballar, fanlar bo'yicha o'rtacha, o'rganilgan mavzular soni. Sodda va ijobiy ohangda (past ballni qoralamaydigan formулировka).

---

### 4.2 ADMIN PANEL (`admin.odilschool.uz`)

Bu klassik desktop/noutbuk interfeysi — jadval, filtr, forma. Smart ekran talablari bu yerga tegishli emas.

**Bo'limlar:**

1. **Dashboard** — bugungi topshirilgan testlar, faol testlar, sinflar bo'yicha o'rtacha ko'rsatkich, so'nggi harakatlar.

2. **Savollar bazasi**
   - Jadval: fan, sinf, mavzu, qiyinlik, matn bo'yicha filtr va qidiruv
   - Bittalab qo'shish/tahrirlash formasi (rasm yuklash bilan)
   - **Import** (alohida sahifa, 5-bo'limga qarang)
   - Ommaviy amallar: o'chirish, mavzuni o'zgartirish, faolsizlantirish
   - Har bir savol yonida statistika: "shu savolda 62% to'g'ri javob"

3. **Testlar**
   - Yangi test: nomi, fan, sinf, savollar soni, vaqt, ochiq oraliq, urinishlar soni, aralashtirish, natija ko'rsatish
   - Savol tanlash: (a) mavzu bo'yicha avtomatik tasodifiy, (b) qo'lda tanlash
   - Holati: qoralama → faol → yopiq
   - **Jonli kuzatish:** test davom etayotganda kim kirgani, nechtasi tugatgani real vaqtda

4. **O'quvchilar**
   - Sinf bo'yicha ro'yxat, qo'shish/tahrirlash
   - **Excel orqali sinf ro'yxatini import qilish**
   - **Kirish kodlarini PDF qilib chop etish** (sinf bo'yicha, qirqib tarqatish uchun kartochka ko'rinishida)
   - Kodni qayta generatsiya qilish

5. **Fanlar, sinflar, mavzular** — spravochniklar boshqaruvi

6. **O'quv materiallari** — mavzu kontentini yozish (rich text muharrir + rasm/video)

7. **Natijalar va hisobotlar**
   - Filtr: fan, sinf, test, sana oralig'i, o'quvchi
   - Jadval + **PDF yuklab olish** (6-bo'limga qarang)
   - Tahlil: qaysi mavzuda sinf sust, qaysi savol eng qiyin bo'lgan

8. **Foydalanuvchilar** (faqat admin) — o'qituvchi qo'shish, fan/sinfga biriktirish

---

## 5. SAVOL IMPORT QILISH

Ikki format ham qo'llab-quvvatlanadi. Ikkalasi ham **bir xil oqim** bilan ishlaydi:

`Fayl yuklash → Parser → Ko'rib chiqish jadvali (nima o'qildi) → Admin tasdiqlaydi → Bazaga yoziladi → Natija hisoboti`

**Hech qachon tasdiqsiz bazaga yozilmaydi.**

### 5.1 Excel / CSV
Admin panelda **"Shablonni yuklab olish"** tugmasi bor. Shablon ustunlari:

| savol | a | b | c | d | togri | fan | sinf | mavzu | qiyinlik | izoh |
|---|---|---|---|---|---|---|---|---|---|---|
| Protsessor nima vazifa bajaradi? | Saqlaydi | Amal bajaradi | Chiqaradi | Ulaydi | B | Informatika | 5 | Kompyuter tuzilishi | 1 | Protsessor — hisoblash markazi |

Qoidalar:
- `togri` — A/B/C/D (katta yoki kichik harf, ikkalasi ham qabul qilinadi)
- `fan`, `mavzu` — agar bazada bo'lmasa, admin tasdiqlagandan keyin **yangi yaratiladi** (ko'rib chiqish ekranida "yangi mavzu yaratiladi" deb ogohlantiriladi)
- `qiyinlik`, `izoh` — ixtiyoriy
- Bo'sh qatorlar tashlab yuboriladi
- Kutubxona: `xlsx` (SheetJS)

### 5.2 Word (.docx)
Qat'iy format:
```
1. Protsessor qanday vazifani bajaradi?
A) Ma'lumot saqlaydi
B) Amallarni bajaradi
C) Tasvir chiqaradi
D) Tarmoqqa ulaydi
Javob: B
```
Parser qoidalari:
- Kutubxona: `mammoth` (docx → matn/HTML)
- Savol boshi: `^\d+[.)]\s`
- Variant: `^[A-DА-Г][.)]\s` — lotin va kirill harflari, `)` va `.` ikkalasi
- Javob qatori: `Javob:` / `Javob :` / `Javobi:` / `Ответ:` — registrga sezgir emas
- Faylni yuklashdan oldin admin **fan, sinf, mavzuni tanlaydi** (Word ichida bu ma'lumot yo'q)
- Xato topilsa — o'sha savol qizil bilan belgilanadi, sabab yoziladi, qolganlari qabul qilinaveradi

### 5.3 Import natijasi
```
Jami: 120 savol topildi
✅ Qabul qilindi: 114
⚠️  Xato: 6
   - 23-savol: to'g'ri javob ko'rsatilmagan
   - 47-savol: faqat 3 ta variant
   - ...
[Xatolar ro'yxatini Excel qilib yuklab olish]
```
Har bir import `importlar` jadvaliga yoziladi.

**Takrorlanish nazorati:** import paytida bir xil matnli savol bazada bormi tekshiriladi (normalizatsiya qilingan matn bo'yicha) va ogohlantiriladi.

---

## 6. PDF HISOBOTLAR

Uch xil PDF kerak:

**1. Sinf natijalari hisoboti**
```
ODIL SCHOOL
Informatika fani · 5-B sinf · "1-chorak nazorat ishi"
Sana: 12.09.2026 · O'qituvchi: Nasridinov R.

№  F.I.Sh.            Ball   Foiz   Baho   Vaqt
1  Aliyev Sardor      18/20  90%    5      14 daq
2  ...

Sinf o'rtachasi: 76%  ·  A'lo: 5  Yaxshi: 9  Qoniqarli: 6  Yomon: 2
Eng ko'p xato qilingan savollar:
  1. "..." — faqat 31% to'g'ri javob berdi
```

**2. Bitta o'quvchi bo'yicha tabel** — barcha fanlar, chorak davomidagi dinamika

**3. Kirish kodlari kartochkalari** — sinf bo'yicha, A4 da 8 ta kartochka, qirqib berish uchun

Texnik: server-side generatsiya. Kutubxona — `@react-pdf/renderer` (React bilan qulay) yoki `pdfmake`.
**⚠️ MUHIM:** standart shriftlar `oʻ`, `gʻ`, `ʼ` belgilarini buzadi. Loyihaga **DejaVu Sans** yoki **Noto Sans** `.ttf` fayli qo'shilib, PDF generatorga ro'yxatdan o'tkazilishi shart. Buni birinchi PDF yozilishidayoq tekshiring.

---

## 7. TEXNOLOGIYALAR

| Qatlam | Tanlov |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript (strict) |
| Stillar | Tailwind CSS v4 + shadcn/ui |
| Baza | Supabase (Postgres) |
| Fayl saqlash | Supabase Storage (rasm, video) |
| Auth (admin) | Supabase Auth (email + parol) |
| Auth (o'quvchi) | Kirish kodi → server tomonda `httpOnly` cookie sessiya (JWT, 4 soat) |
| PDF | `@react-pdf/renderer` + DejaVu Sans |
| Excel | `xlsx` (SheetJS) |
| Word | `mammoth` |
| Forma/validatsiya | `react-hook-form` + `zod` |
| Deploy | Vercel (GitHub `main` branch → avtomatik) |
| Git | GitHub, `main` (prod) + `dev` |

**Repo strukturasi:**
```
/app
  /(student)          → odilschool.uz
    /kirish  /menyu  /organish  /mashq  /test  /natijalar
  /(admin)            → admin.odilschool.uz (middleware orqali)
    /dashboard  /savollar  /testlar  /oquvchilar  /materiallar
    /natijalar  /foydalanuvchilar
  /api
    /auth/oquvchi     /auth/chiqish
    /urinish/boshlash /urinish/javob /urinish/yakunlash
    /import/excel     /import/word
    /hisobot/pdf
/components  /ui  /student  /admin
/lib  supabase/  parsers/  pdf/  auth/  utils/
/supabase/migrations
/public/fonts/DejaVuSans.ttf
CLAUDE.md
```

Subdomen ajratish: `middleware.ts` `host` sarlavhasini tekshiradi va `admin.` bo'lsa `(admin)` guruhiga yo'naltiradi; o'quvchi sessiyasi admin marshrutlariga kira olmaydi va aksincha.

---

## 8. BAZA

Boshlang'ich sxema `schema.sql` faylida (avval berilgan). Unga **qo'shimcha** quyidagi jadvallar kerak:

```sql
-- O'quv materiallari
create table dars_materiallari (
  id bigserial primary key,
  mavzu_id bigint not null references mavzular(id) on delete cascade,
  tartib smallint not null default 0,
  turi text not null check (turi in ('nazariya','misol','video')),
  sarlavha text not null,
  kontent text,                  -- HTML
  media_url text,
  created_at timestamptz default now()
);

-- O'quvchi progressi
create table progress (
  oquvchi_id bigint references oquvchilar(id) on delete cascade,
  mavzu_id bigint references mavzular(id) on delete cascade,
  organildi boolean default false,
  ozini_tekshirish_foiz numeric(5,2),
  yangilandi timestamptz default now(),
  primary key (oquvchi_id, mavzu_id)
);

-- Mashq statistikasi (baholanmaydi)
create table mashq_sessiyalar (
  id bigserial primary key,
  oquvchi_id bigint references oquvchilar(id) on delete cascade,
  fan_id bigint references fanlar(id),
  mavzu_id bigint references mavzular(id),
  savol_soni smallint default 0,
  togri_soni smallint default 0,
  boshlandi timestamptz default now(),
  tugadi timestamptz
);

-- O'quvchi sessiyasi (smart ekranda faol kirishlarni nazorat qilish)
create table sessiyalar (
  token text primary key,
  oquvchi_id bigint references oquvchilar(id) on delete cascade,
  qurilma text,
  yaratildi timestamptz default now(),
  amal_qiladi timestamptz not null
);
```

Migratsiyalar `/supabase/migrations` da tartib raqami bilan saqlanadi.

---

## 9. XAVFSIZLIK QOIDALARI (buzilmaydi)

1. `savollar.togri_javob` **hech qachon** klient tomonga yuborilmaydi. Savol API'dan faqat matn va 4 variant chiqadi.
2. Javob tekshiruvi **faqat serverda** (`/api/urinish/javob`).
3. Taymer serverda hisoblanadi (`urinishlar.boshlandi` asosida). Klientdagi taymer — faqat ko'rsatkich.
4. O'quvchi sessiyasi `httpOnly`, `secure`, `sameSite=lax` cookie. `localStorage`da token saqlanmaydi.
5. RLS yoqilgan. O'quvchi yozuvlari faqat `service_role` orqali server tomonda yoziladi.
6. Kirish kodini topishga urinish: bir IP dan 5 marta xato → 10 daqiqa blok.
7. O'qituvchi `biriktirish` jadvalida yo'q fan/sinf ma'lumotini na o'qiy, na yoza oladi (server tomonda tekshiriladi, faqat UI da yashirish yetarli emas).
8. Yuklanadigan fayllar: hajmi ≤10 MB, faqat `.xlsx .csv .docx .png .jpg .webp`.
9. `.env` hech qachon commit qilinmaydi. `SUPABASE_SERVICE_ROLE_KEY` faqat server tomonda.

**Muhit o'zgaruvchilari:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=
```

---

## 10. TIL VA MATNLAR

- Interfeys tili — **o'zbek (lotin)**, to'g'ri imlo bilan: `o'`, `g'`, `ʼ`. Xato: `uquvchi`, `test ishlash` ✗ → `o'quvchi`, `test topshirish` ✓.
- Barcha matnlar `/lib/i18n/uz.ts` faylida markazlashgan (keyinchalik rus tili qo'shish uchun).
- Xato xabarlari bolalarga tushunarli: "Bunday kod topilmadi. Kodni qayta tekshiring" — texnik xato kodi emas.

---

## 11. BOSQICHLAR

Har bir bosqich alohida PR, alohida Vercel preview. Keyingisi oldingisi tasdiqlangandan keyin boshlanadi.

**1-bosqich · Poydevor**
Next.js loyihasi, Tailwind + shadcn, Supabase ulanishi, migratsiyalar, subdomen middleware, admin auth, bo'sh admin layout va o'quvchi layout.
*Tayyor deb hisoblanadi:* Vercel'da ikkala subdomen ochiladi, admin login ishlaydi.

**2-bosqich · Admin: spravochniklar + savollar**
Fan, sinf, mavzu, o'quvchi CRUD. Savol CRUD. Kirish kodlarini generatsiya qilish.
*Tayyor:* qo'lda 10 ta savol kiritib, bazada ko'rish mumkin.

**3-bosqich · Import**
Excel shabloni + parser, Word parser, ko'rib chiqish ekrani, xatolar hisoboti, takrorlanish nazorati.
*Tayyor:* 100 savolli Word va Excel fayllar xatosiz yuklanadi.

**4-bosqich · O'quvchi: kirish + test**
Raqamli klaviatura, sessiya, test ekrani (smart ekran uchun optimallashtirilgan), taymer, avtosaqlash, yakuniy natija.
*Tayyor:* haqiqiy smart ekranda 20 savolli test to'liq topshiriladi.

**5-bosqich · Natijalar + PDF**
Admin natijalar jadvali, filtrlar, 3 xil PDF, kirilgacha shrift tekshiruvi.
*Tayyor:* sinf hisoboti PDF holida to'g'ri harflar bilan chiqadi.

**6-bosqich · O'rganish va mashq modullari**
Material muharriri, mavzu sahifasi, progress, mashq rejimi.

**7-bosqich · Sayqal**
Jonli kuzatish, statistik tahlil, PWA, offline rejim, sinf rejimi, tezlik optimizatsiyasi.

---

## 12. CLAUDE CODE UCHUN ISH TARTIBI

Loyiha ildizida **`CLAUDE.md`** yaratilsin va unda quyidagilar bo'lsin:
- Loyiha qisqacha tavsifi va papka strukturasi
- Kod uslubi: TypeScript strict, `any` ishlatilmaydi, server komponent — standart, `"use client"` faqat zarur bo'lganda
- Nomlash: papka va marshrutlar **o'zbekcha** (`savollar`, `natijalar`), kod ichidagi o'zgaruvchilar **inglizcha** (`questions`, `results`)
- Smart ekran UI qoidalari (3-bo'limdan ko'chirilsin) — bu eng ko'p unutiladigan qism
- Xavfsizlik qoidalari (9-bo'lim) — buzilmas ro'yxat sifatida
- `npm run dev | build | lint | typecheck` buyruqlari

**Ish qoidalari:**
- Har bir bosqich — alohida branch, `feat/2-savollar` ko'rinishida
- Har bir PR oldidan `npm run typecheck && npm run lint` xatosiz o'tsin
- Bir PR ichida 1 bosqichdan ortiq ish qilinmasin
- Baza o'zgarishi har doim migratsiya fayli orqali, qo'lda Supabase UI'da emas

---

## 13. QABUL QILISH MEZONLARI

Platforma tayyor deb hisoblanadi, agar:

1. 5-sinf o'quvchisi hech kimning yordamisiz smart ekranda kodini kiritib, test topshira olsa
2. 20 savolli test boshidan oxirigacha bir marta ham scroll qilmasdan ishlansa
3. Test o'rtasida ekran o'chib yonsa ham, javoblar va vaqt saqlanib qolsa
4. Admin 100 savolli Word faylni 2 daqiqada bazaga yuklay olsa
5. Sinf natijalari PDF'ida `o'`, `g'` harflari to'g'ri ko'rinsa
6. O'qituvchi boshqa fanning savollarini hech qanday yo'l bilan ko'ra olmasa
7. Sahifa ochilish tezligi smart ekran brauzerida 3 soniyadan kam bo'lsa
