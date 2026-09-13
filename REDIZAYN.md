# CLAUDE CODE UCHUN TO'LIQ PROMPT
## Odil School platformasi — redizayn, gamifikatsiya va o'quv materiallari moduli

> Bu faylni repo ildiziga `REDIZAYN.md` nomi bilan tashlang va Claude Code'da shunday deng:
> **"REDIZAYN.md ni to'liq o'qi. Savollaring bo'lsa avval so'ra. Keyin 1-BOSQICHdan boshla, boshqa bosqichlarga o'tma."**

---

## 0. KONTEKST

Platforma allaqachon yozilgan va ishlayapti: baza, admin panel, savol importi, test topshirish, PDF hisobotlar — hammasi joyida. Endi **ikkita ish** qilinadi:

1. **Ko'rinishni butunlay yangilash** — hozirgisi zerikarli, bolalar uchun mo'ljallanmagan
2. **Yangi modul qo'shish** — sinf → fan → mavzu → ma'ruza va prezentatsiyalar, smart ekranda ko'rsatish uchun

---

## 1. BUZILMAYDIGAN QOIDALAR ⛔

Bu qismga **tegilmaydi**:

- Mavjud API route'lar (`/api/urinish/*`, `/api/import/*`, `/api/hisobot/*`) — imzolari o'zgarmaydi
- Test topshirish mantiqi, taymer, javob tekshiruvi, ball hisoblash
- Mavjud baza jadvallari — **faqat yangi jadval va yangi ustun qo'shiladi**, mavjudi o'chirilmaydi va nomi o'zgartirilmaydi
- Savol importi va PDF generatsiyasi
- Xavfsizlik qoidalari (to'g'ri javob klientga yuborilmaydi, taymer serverda, RLS)

Har bir bosqich alohida branch'da bajariladi va **oldingi funksionallik ishlayotgani tekshirilgandan keyin** merge qilinadi. Agar biror o'zgarish mavjud kodni buzishi mumkin bo'lsa — avval to'xta va menga ayt.

---

## 2. DIZAYN TIZIMI

### 2.1 Falsafa

Duolingo va Blooket uslubi: **yorqin, yumaloq, qo'lga bosiladigan, quvnoq**. Korporativ kulrang interfeys emas. Har bir bosish o'zini "bosilgandek" his qilsin.

### 2.2 `/lib/theme.ts` — hamma narsa bitta joyda

Quyidagi tokenlarni yarating va **butun loyihada faqat shundan foydalaning**. Hech qayerda `#hex` yoki `text-blue-500` to'g'ridan-to'g'ri yozilmasin.

```ts
// Asosiy ranglar
primary:    '#1B3A6B'  // maktab ko'ki — sarlavha, navigatsiya
accent:     '#F5B942'  // oltin — XP, yulduz, asosiy tugma
success:    '#3FBF6F'  // to'g'ri javob
danger:     '#F45B5B'  // xato (yumshoq qizil, qon rang emas)
warning:    '#FFA23A'
surface:    '#FFFFFF'
bg:         '#FFF9EF'  // iliq krem fon — oq emas, ko'z charchatmaydi
text:       '#2A2A35'
muted:      '#7C7C8A'

// Fan ranglari (har bir fan o'z rangi bilan tanilsin)
matematika:   '#4A7BF7'  // ko'k
informatika:  '#9B5DE5'  // binafsha
biologiya:    '#3FBF6F'  // yashil
kimyo:        '#FF6B9D'  // pushti
fizika:       '#FF8C42'  // to'q sariq
adabiyot:     '#E8543F'  // g'ishtrang
ingliz:       '#00B4D8'  // moviy
tarix:        '#C9992E'  // oltin-jigar
geografiya:   '#2EC4B6'  // firuza

// Shakl
radius:  { sm: 12, md: 20, lg: 28, full: 999 }
shadow:  { card: '0 4px 0 rgba(0,0,0,0.10)', pressed: '0 2px 0 rgba(0,0,0,0.10)' }
```

### 2.3 3D tugma — eng muhim element

Barcha asosiy tugmalar shu uslubda:

```
- Yumaloq burchak: radius.lg (28px)
- Pastida qattiq soya: 0 6px 0 <rangning 20% to'q varianti>  (blur YO'Q)
- :active holatida: translateY(4px) + soya 2px ga qisqaradi → "bosildi" hissi
- O'tish: 80ms — sekin bo'lmasin, javob darhol sezilsin
- Balandlik: kamida 72px (smart ekran talabi)
- Matn: 20px, qalin (font-weight 700), katta harflar emas
```

Variantlar (A/B/C/D) uchun **Kahoot uslubi**: har biri o'z rangi va geometrik shakli bilan —
A = qizil ▲ · B = ko'k ◆ · C = sariq ● · D = yashil ■.
Shakl o'qishni bilmaydigan bolaga ham yordam beradi va rang ko'rmaslik muammosini hal qiladi.

### 2.4 Tipografiya

- Shrift: **Nunito** yoki **Baloo 2** (yumaloq, bolalarga mos, kirill/lotin qo'llab-quvvatlaydi). Google Fonts'dan `next/font` orqali.
- O'lchamlar: `h1: 48px · h2: 36px · h3: 28px · body: 20px · small: 16px`
- Smart ekran uchun `.sinf-rejimi` klassi barcha o'lchamni 1.25× qiladi

### 2.5 Kartalar

Oq fon, `radius.lg`, tepasida rangli chiziq yoki rangli ikonka doirasi, pastida qattiq soya, `:active` da bosiladi. Fan kartasi = fan rangi + fan personaji rasmi.

### 2.6 Fon

`bg` rangi + ustida juda och naqsh (`/public/naqsh.svg` — yulduzcha, kitob, qalam doodle'lari, shaffoflik 6%). Naqsh o'qishga xalaqit bermasin.

### 2.7 Animatsiya qoidalari

- Faqat CSS `transform` va `opacity`. `Lottie`, GIF, video fon — **taqiqlanadi** (smart ekran brauzeri sekinlashadi)
- Karta paydo bo'lishi: `scale(0.95) → 1` + `opacity 0 → 1`, 200ms, ro'yxatda 40ms kechikish bilan zanjir
- To'g'ri javob: yashil pulsatsiya + Sherbekning sakrash animatsiyasi + yulduz zarralari (CSS)
- `prefers-reduced-motion` hurmat qilinsin

---

## 3. YANGI NAVIGATSIYA — O'QUV MATERIALLARI

### 3.1 Tuzilma

```
DASHBOARD (hamma uchun ochiq, kodsiz)
   │
   ├── 5-sinf  6-sinf  7-sinf  8-sinf  9-sinf  10-sinf  11-sinf
   │        │
   │        └── FANLAR (shu sinfda o'qitiladigan barcha fanlar)
   │                │
   │                └── MAVZULAR (chorak/bo'lim bo'yicha guruhlangan)
   │                        │
   │                        └── MAVZU SAHIFASI
   │                             ├── 📄 Ma'ruza matni
   │                             ├── 📊 Prezentatsiya   → SMART EKRAN REJIMI
   │                             ├── 🎬 Video
   │                             ├── 📎 Qo'shimcha fayl (PDF, Word)
   │                             └── ✏️ Shu mavzu bo'yicha mashq qilish
   │
   └── [Kirish kodi] → shaxsiy kabinet, rasmiy testlar, XP, seriya
```

**Muhim:** dashboard, sinflar, fanlar, mavzular va materiallar — **kodsiz, hammaga ochiq**. Kod faqat rasmiy test topshirish va shaxsiy natijalar uchun so'raladi. "Bilim hamma uchun ochiq" tamoyili.

### 3.2 Dashboard (`/`)

Yuqoridan pastga:

1. **Salomlashuv bloki** — Sherbek (`sherbek-salom.png`) chapda, o'ngda "Odil School bilim platformasi" + qidiruv qatori ("Mavzu yoki fan qidiring…")
2. **Sinflar tarmog'i** — 7 ta katta karta: `5-sinf … 11-sinf`. Har birida sinf raqami katta, ostida "12 fan · 240 mavzu". Bosilganda sinf sahifasiga o'tadi.
3. **Tez havolalar** — "Mashq qilish", "Bugungi savol", "Test topshirish (kod bilan)"
4. **Sinflar reytingi** — bu hafta eng faol 5 ta sinf (shaxsiy emas, sinf bo'yicha)
5. **Oxirgi qo'shilgan materiallar** — 6 ta karta

Agar o'quvchi kod bilan kirgan bo'lsa, tepada qo'shimcha chiziq paydo bo'ladi: avatar, ismi, XP, daraja, 🔥 seriya, bugungi maqsad progress bar.

### 3.3 Sinf sahifasi (`/sinf/[daraja]`)

Sarlavha: "7-sinf". Ostida fanlar kartalari tarmog'i — har biri fan rangi, fan personaji rasmi, fan nomi, "18 mavzu · 42 material". Mavzulari umuman yo'q fan ham ko'rinadi, lekin "Tez orada" belgisi bilan va bosilmaydi.

### 3.4 Fan sahifasi (`/sinf/[daraja]/[fan]`)

- Yuqorida fan rangidagi banner: fan personaji + fan nomi + "7-sinf"
- Mavzular **bo'lim/chorak bo'yicha guruhlangan** akkordeon yoki yo'l ko'rinishida
- Har bir mavzu qatorida: tartib raqami, nomi, material turlari ikonkalari (📄 📊 🎬), o'rganilgan bo'lsa ✓
- Kod bilan kirgan o'quvchi uchun: progress bar "18 mavzudan 7 tasi"

### 3.5 Mavzu sahifasi (`/sinf/[daraja]/[fan]/[mavzu]`)

- Mavzu nomi, qisqa tavsif
- Materiallar ro'yxati kartalar ko'rinishida. Har bir kartada: tur ikonkasi, sarlavha, meta ma'lumot (prezentatsiya — "24 slayd", video — "8 daqiqa", PDF — "1.2 MB"), prezentatsiya va videoda **thumbnail**
- Pastda: "Shu mavzu bo'yicha mashq qilish" tugmasi (mavjud mashq moduliga ulanadi)
- Yon tomonda: oldingi/keyingi mavzu

---

## 4. PREZENTATSIYA KO'RUVCHI — SMART EKRAN REJIMI ⭐

Bu modulning eng muhim qismi. Prezentatsiya kartasi bosilganda **darhol to'liq ekran** rejimiga o'tiladi.

### 4.1 Ko'rish interfeysi

```
┌──────────────────────────────────────────────────────┐
│                                                       │
│                                                       │
│  ◀                  S L A Y D                     ▶  │   ← ikkala yonda
│                                                       │      katta bosish
│                                                       │      zonalari
│                                                       │      (kengligi 15%)
│                                                       │
├──────────────────────────────────────────────────────┤
│  [⊞ slaydlar]   7 / 24   [👁 doska]  [⛶]  [✕ chiqish] │
└──────────────────────────────────────────────────────┘
```

Talablar:
- Slayd butun ekranni egallaydi, nisbat saqlanadi (`object-fit: contain`), fon to'q kulrang
- **Chap/o'ng bosish zonalari** — kamida ekran kengligining 15% i, chunki smart ekranda kichik strelkaga tegish qiyin
- **Surish (swipe)** qo'llab-quvvatlanadi
- Klaviatura: `←` `→` `Space` `Esc` `F`
- Pastdagi panel 3 soniyadan keyin **avtomatik yashirinadi**, ekranga tegilganda qaytadi
- `[⊞]` — barcha slaydlar mayda ko'rinishda, bosib sakrash mumkin
- `[👁 doska]` — slayd ustiga qalam bilan chizish (qizil, ko'k, sariq + o'chirish). O'qituvchi tushuntirayotganda kerak. Chizmalar saqlanmaydi.
- `[⛶]` — brauzer to'liq ekran rejimi (`requestFullscreen`)
- Prezentatsiya rejimida **avtomatik chiqish taymeri o'chadi** (dars 40 daqiqa davom etadi)
- Ekran uxlab qolmasligi uchun **Wake Lock API** yoqiladi

### 4.2 Texnik yechim — DIQQAT, bu joyda ko'p xato qilinadi

**Muammo:** `.pptx` faylni brauzerda to'g'ridan-to'g'ri chiroyli ko'rsatib bo'lmaydi. LibreOffice orqali konvertatsiya esa Vercel serverless muhitida ishlamaydi.

**Yechim — uch bosqichli, shu tartibda:**

1. **Asosiy yo'l (v1 da shu qilinsin):** o'qituvchi prezentatsiyani **PDF holida** yuklaydi. PowerPoint'da "Saqlash → PDF" — 3 ta bosish. Admin panelda buni tushuntiruvchi eslatma turadi. PDF `pdf.js` orqali sahifama-sahifa `canvas`ga chiziladi. Ishonchli, tez, hech qanday tashqi xizmat kerak emas.

2. **Qulaylik uchun:** `.pptx` yuklashga ham ruxsat berilsin, lekin server uni **CloudConvert API** yoki shunga o'xshash xizmat orqali PDF ga aylantirsin (fon rejimida, "ishlanmoqda" statusi bilan). Agar API kaliti sozlanmagan bo'lsa — foydalanuvchiga "iltimos PDF yuklang" deb aytsin, jimgina xato bermasin.

3. **Google Slides havolasi** — o'qituvchi havola qo'ysa, `iframe` orqali `/embed` rejimida ko'rsatiladi.

**Optimizatsiya:** PDF yuklangandan keyin server har bir sahifani `WebP` rasm qilib `Supabase Storage`ga saqlasin (kengligi 1920px). Smart ekranda `pdf.js` bilan real vaqtda chizishdan ko'ra tayyor rasmni ko'rsatish ancha tez. Birinchi slayd va thumbnail darhol tayyorlanadi, qolgani fon rejimida.

**Oldindan yuklash:** joriy slayddan keyingi 2 tasi oldindan yuklansin — o'tish uzilishsiz bo'lsin.

### 4.3 Video va boshqa materiallar

- YouTube havolasi → `iframe`, to'liq ekran, `modestbranding=1`, `rel=0` (yon tomondagi tavsiyalar bolalarga tasodifiy kontent ko'rsatmasin)
- Yuklangan video → Supabase Storage, HTML5 `<video>`, katta boshqaruv tugmalari
- PDF/Word fayl → yuklab olish + PDF bo'lsa brauzerda ko'rish

### 4.4 Admin tomoni

`/admin/materiallar` bo'limi:
- Sinf → fan → mavzu tanlanadi
- Material qo'shish: tur (ma'ruza / prezentatsiya / video / fayl), sarlavha, fayl yoki havola, tartib raqami
- Ma'ruza matni uchun rich-text muharrir (rasm, ro'yxat, jadval, formula)
- Yuklangan prezentatsiya holati ko'rinadi: "Qayta ishlanmoqda… 12/24 slayd"
- Drag-and-drop bilan tartibni o'zgartirish
- O'qituvchi faqat o'ziga biriktirilgan fan/sinfga material qo'sha oladi

---

## 5. GAMIFIKATSIYA

### 5.1 XP va daraja

| Harakat | XP |
|---|---|
| Mashqda to'g'ri javob | +2 |
| Mavzuni o'rganib tugatish | +20 |
| Rasmiy testni topshirish | +30 |
| Testda 90%+ natija | +20 qo'shimcha |
| Kunlik maqsadni bajarish | +15 |

Daraja: `daraja = floor(sqrt(XP / 50)) + 1`. Daraja oshganda ekranda Sherbek kubok bilan + konfetti + tovush.

### 5.2 Kunlik seriya (streak)

- Kun hisoblanadi, agar o'quvchi kamida **10 ta mashq savoli** yechsa yoki **1 ta mavzu** o'rgansa
- Dashboardda 🔥 belgisi va raqam
- Seriya uzilganda Sherbek yig'laydi (`sherbek-yigi.png`), lekin ohang yumshoq: "Zarari yo'q, bugun qaytadan boshlaymiz!"
- **"Muzlatish" imkoniyati:** 7 kunlik seriyaga 1 ta "muzlatgich" beriladi — bir kun o'tkazib yuborilsa seriya saqlanadi. Kasallik yoki bayram uchun.

### 5.3 Nishonlar

Kamida 12 ta: Birinchi qadam (1 test) · Yuzlik (100 savol) · Haftalik alangali (7 kun seriya) · Oylik (30 kun) · Mavzu ustasi (fanning barcha mavzusi) · Benuqson (100% natija) · Tong qushi (08:00 gacha) · Qat'iyatli (xato savolni qayta yechish) · Kashfiyotchi (5 xil fanda mashq) · Sinf faxri (sinfda eng ko'p XP) · Kitobxon (20 ma'ruza o'qilgan) · Marafonchi (bir kunda 100 savol).

Ochilganda modal: nishon aylanib chiqadi, tovush, "Ulashish" emas — shunchaki "Zo'r!".

### 5.4 Avatarlar (Blooket mexanikasi)

XP evaziga yangi avatar ochiladi: Sherbekning turli kiyimlari (kosmonavt, shifokor, olim, sportchi, sayohatchi…). Boshida 3 tasi ochiq, qolgani 200/500/1000 XP da. Bu bolalarni qaytib kelishga majbur qiladigan eng arzon mexanika.

### 5.5 Sinf reytingi (shaxsiy emas!)

Dashboardda: "Bu hafta: 1. 7-A — 4 820 XP · 2. 5-B — 4 110 XP…". Sinf ichida shaxsiy reyting **ko'rsatilmaydi** — sust o'quvchini kamsitadi va o'qishdan sovutadi. Shaxsiy statistikani faqat o'quvchining o'zi va o'qituvchi ko'radi.

### 5.6 ⛔ Rasmiy testda gamifikatsiya YO'Q

Nazorat ishi ekranida: personaj yo'q, animatsiya yo'q, tovush yo'q, XP ko'rsatilmaydi, konfetti yo'q. Sokin, jiddiy, oq-ko'k interfeys. XP faqat test yakunlangandan **keyin** natija ekranida beriladi. Bu baholashning ishonchliligi uchun shart.

---

## 6. PERSONAJLARNI ULASH

Rasmlar `/public/personajlar/sherbek/` va `/public/personajlar/fanlar/` da tayyor turadi.

`<Sherbek holat="salom" size="lg" />` komponenti yarating. Holatlar va qayerda ishlatilishi:

| Holat | Fayl | Qayerda |
|---|---|---|
| `salom` | sherbek-salom.png | Dashboard, kirish ekrani |
| `oddiy` | sherbek-oddiy.png | Bosh menyu, bo'sh sahifalar |
| `tugri` | sherbek-tugri.png | Mashqda to'g'ri javob |
| `xato` | sherbek-xato.png | Mashqda xato javob |
| `yigi` | sherbek-yigi.png | Seriya uzilganda |
| `maslahat` | sherbek-maslahat.png | Maslahat, izoh, bo'sh holat |
| `kubok` | sherbek-kubok.png | Daraja oshdi, nishon |
| `kitob` | sherbek-kitob.png | O'rganish moduli |
| `uyqu` | sherbek-uyqu.png | 3 kun kirmagan bo'lsa |
| `zor` | sherbek-zor.png | Mavzu tugadi, yaxshi natija |

Fan personajlari fan kartalarida va fan bannerida ishlatiladi.

**Texnik:** `next/image`, `priority` faqat birinchi ekrandagisiga. Barcha rasmlarning `.webp` varianti bo'lsin. Bo'sh holat (empty state) sahifalari ham personaj bilan — "Bu yerda hali material yo'q" + Sherbek maslahat berayotgan holatda.

---

## 7. TOVUSH

`/public/tovush/` : `togri.mp3`, `xato.mp3`, `daraja.mp3`, `nishon.mp3`, `bosish.mp3`, `taymer.mp3`

- Qisqa (<1 s), yumshoq, o'tkir emas
- Xato tovushi **jazolovchi bo'lmasin** — past ohang, "buzz" emas
- Dastlab **o'chiq**, foydalanuvchi yoqadi; tanlov `localStorage`da saqlanadi
- Tepada doimiy 🔊/🔇 tugmasi
- Brauzer siyosati: birinchi bosishdan keyin `AudioContext` yoqiladi
- Rasmiy testda tovush yo'q (taymer ogohlantirishidan tashqari)

---

## 8. BAZA — YANGI JADVALLAR

Mavjud jadvallarga tegilmaydi. Migratsiya fayli sifatida qo'shiladi:

```sql
-- O'quv materiallari
create table materiallar (
  id bigserial primary key,
  mavzu_id bigint not null references mavzular(id) on delete cascade,
  turi text not null check (turi in ('maruza','prezentatsiya','video','fayl')),
  sarlavha text not null,
  tavsif text,
  kontent text,                       -- ma'ruza uchun HTML
  fayl_url text,                      -- Storage havolasi
  tashqi_url text,                    -- YouTube / Google Slides
  slayd_soni smallint,
  thumbnail_url text,
  holat text not null default 'tayyor'
       check (holat in ('yuklanmoqda','ishlanmoqda','tayyor','xato')),
  tartib smallint not null default 0,
  yuklagan_id uuid references profillar(id) on delete set null,
  created_at timestamptz default now()
);
create index on materiallar (mavzu_id, tartib);

-- Prezentatsiya slaydlari (PDF dan chiqarilgan rasmlar)
create table slaydlar (
  id bigserial primary key,
  material_id bigint not null references materiallar(id) on delete cascade,
  raqam smallint not null,
  rasm_url text not null,
  unique (material_id, raqam)
);

-- Gamifikatsiya
create table xp_jurnal (
  id bigserial primary key,
  oquvchi_id bigint not null references oquvchilar(id) on delete cascade,
  miqdor smallint not null,
  sabab text not null,
  created_at timestamptz default now()
);
create index on xp_jurnal (oquvchi_id, created_at);

create table oquvchi_holati (
  oquvchi_id bigint primary key references oquvchilar(id) on delete cascade,
  jami_xp int not null default 0,
  daraja smallint not null default 1,
  seriya smallint not null default 0,
  eng_uzun_seriya smallint not null default 0,
  oxirgi_faollik date,
  muzlatgich smallint not null default 0,
  avatar text not null default 'oddiy'
);

create table nishonlar (
  kod text primary key,
  nomi text not null,
  tavsif text not null,
  ikonka text not null
);

create table oquvchi_nishonlari (
  oquvchi_id bigint references oquvchilar(id) on delete cascade,
  nishon_kodi text references nishonlar(kod) on delete cascade,
  olingan timestamptz default now(),
  primary key (oquvchi_id, nishon_kodi)
);

-- Material ko'rilganini qayd etish (progress uchun)
create table material_korildi (
  oquvchi_id bigint references oquvchilar(id) on delete cascade,
  material_id bigint references materiallar(id) on delete cascade,
  korildi timestamptz default now(),
  primary key (oquvchi_id, material_id)
);
```

`mavzular` jadvaliga ikkita ustun qo'shiladi (mavjud ma'lumotga zarar yetkazmaydi):
```sql
alter table mavzular add column if not exists bolim text;       -- '1-chorak'
alter table mavzular add column if not exists tavsif text;
```

**XP hisoblash faqat serverda.** Klient "menga 500 XP ber" deb so'rayolmasin.

---

## 9. ISH TARTIBI — BOSQICHMA-BOSQICH

Har biri alohida branch, alohida PR, alohida Vercel preview. **Keyingisini men tasdiqlamagunimcha boshlama.**

**1-bosqich · `feat/design-system`**
`theme.ts`, shrift, `Button`, `Card`, `Badge`, `ProgressBar`, `Sherbek` komponentlari, fon naqshi, tovush menejeri. Hech bir sahifa hali o'zgartirilmaydi — faqat `/dizayn` nomli ichki demo sahifa yaratiladi va unda barcha komponentlar ko'rsatiladi.

**2-bosqich · `feat/dashboard`**
Yangi dashboard, sinflar tarmog'i, sinf sahifasi, fan sahifasi. Ma'lumot bazadan keladi, bo'sh bo'lsa "Tez orada" ko'rsatiladi.

**3-bosqich · `feat/materiallar`**
Migratsiya, admin materiallar bo'limi, mavzu sahifasi, ma'ruza o'qish ekrani.

**4-bosqich · `feat/prezentatsiya`**
PDF yuklash → slaydlarga ajratish → smart ekran ko'ruvchi (to'liq ekran, bosish zonalari, slaydlar tarmog'i, doska, Wake Lock).

**5-bosqich · `feat/gamifikatsiya`**
XP, daraja, seriya, nishonlar, avatarlar, sinf reytingi.

**6-bosqich · `feat/redizayn-mashq`**
Mashq va o'rganish modullarini yangi dizaynga o'tkazish, personaj reaksiyalari, tovush.

**7-bosqich · `feat/redizayn-test`**
Rasmiy test ekranini yangilash — **sokin uslubda**, Kahoot rangli variantlari bilan, lekin animatsiya va personajsiz.

Har bir PR oldidan: `npm run typecheck && npm run lint && npm run build` xatosiz o'tsin.

---

## 10. QABUL QILISH MEZONLARI

1. O'qituvchi PDF prezentatsiyani yuklaydi → 2 daqiqada smart ekranda to'liq ekran rejimida ochiladi va barmoq bilan varaqlanadi
2. Prezentatsiya 40 daqiqa davomida ochiq tursa ham ekran uxlab qolmaydi va sessiya tugamaydi
3. Mehmon (kodsiz) foydalanuvchi 7-sinf → Biologiya → mavzu → ma'ruzani o'qiy oladi
4. Mavjud test topshirish oqimi 1-7 bosqichlardan keyin ham avvalgidek ishlaydi
5. Dashboard smart ekranda 3 soniyada ochiladi
6. Rasmiy test ekranida hech qanday animatsiya, personaj yoki tovush yo'q
7. Barcha ranglar `theme.ts` dan keladi — kodda bitta ham qo'lda yozilgan hex yo'q
8. Sinf reytingi bor, shaxsiy reyting yo'q

---

## 11. SAVOL BO'LSA

Quyidagilarni o'zing hal qilma, mendan so'ra:
- Mavjud jadval yoki API o'zgartirish zarurati tug'ilsa
- `.pptx` konvertatsiyasi uchun pullik xizmat kerak bo'lsa
- Bosqichni bajarish uchun mavjud kodning katta qismini qayta yozish kerak bo'lsa
