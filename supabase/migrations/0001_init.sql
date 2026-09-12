-- ============================================================================
-- 0001_init.sql — Odil School platformasi uchun boshlang'ich sxema
--
-- ESLATMA: Texnik topshiriqda "boshlang'ich sxema schema.sql faylida (avval
-- berilgan)" deb yozilgan, lekin loyiha ildizida bunday fayl topilmadi.
-- Shu sababli quyidagi sxema texnik topshiriqning barcha bo'limlarida
-- (2, 3, 4, 5, 8, 9) tilga olingan jadvallar asosida to'liq qayta tuzildi.
-- Agar alohida boshlang'ich schema.sql mavjud bo'lsa, uni ko'rib chiqib shu
-- migratsiyani moslashtirish kerak.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SPRAVOCHNIKLAR: fanlar, sinflar, mavzular
-- ----------------------------------------------------------------------------

create table fanlar (
  id bigserial primary key,
  nomi text not null unique,
  created_at timestamptz not null default now()
);

create table sinflar (
  id bigserial primary key,
  nomi text not null unique, -- masalan "5-B"
  created_at timestamptz not null default now()
);

create table mavzular (
  id bigserial primary key,
  fan_id bigint not null references fanlar(id) on delete cascade,
  sinf_id bigint not null references sinflar(id) on delete cascade,
  nomi text not null,
  tartib smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (fan_id, sinf_id, nomi)
);

create index mavzular_fan_sinf_idx on mavzular(fan_id, sinf_id);

-- ----------------------------------------------------------------------------
-- 2. FOYDALANUVCHILAR (o'qituvchi / admin) va BIRIKTIRISH
-- ----------------------------------------------------------------------------

create table foydalanuvchilar (
  id uuid primary key references auth.users(id) on delete cascade,
  ism_familiya text not null,
  rol text not null check (rol in ('admin', 'oqituvchi')),
  faol boolean not null default true,
  created_at timestamptz not null default now()
);

-- O'qituvchining qaysi fan+sinf birikmasida ishlash huquqi borligi
create table biriktirish (
  id bigserial primary key,
  foydalanuvchi_id uuid not null references foydalanuvchilar(id) on delete cascade,
  fan_id bigint not null references fanlar(id) on delete cascade,
  sinf_id bigint not null references sinflar(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (foydalanuvchi_id, fan_id, sinf_id)
);

-- ----------------------------------------------------------------------------
-- 3. O'QUVCHILAR (kirish kodi bilan, Supabase Auth'siz)
-- ----------------------------------------------------------------------------

create table oquvchilar (
  id bigserial primary key,
  ism_familiya text not null,
  sinf_id bigint not null references sinflar(id) on delete restrict,
  kirish_kodi char(6) not null unique,
  faol boolean not null default true,
  created_at timestamptz not null default now()
);

create index oquvchilar_sinf_idx on oquvchilar(sinf_id);

-- Kirish kodini topishga urinishlarni cheklash uchun (9.6-band: 5 marta xato → 10 daqiqa blok)
create table kirish_urinishlari (
  id bigserial primary key,
  ip_manzil text not null,
  muvaffaqiyatli boolean not null default false,
  created_at timestamptz not null default now()
);

create index kirish_urinishlari_ip_idx on kirish_urinishlari(ip_manzil, created_at desc);

-- ----------------------------------------------------------------------------
-- 4. SAVOLLAR
-- ----------------------------------------------------------------------------

create table savollar (
  id bigserial primary key,
  fan_id bigint not null references fanlar(id) on delete cascade,
  sinf_id bigint not null references sinflar(id) on delete cascade,
  mavzu_id bigint references mavzular(id) on delete set null,
  matn text not null,
  rasm_url text,
  variant_a text not null,
  variant_b text not null,
  variant_c text not null,
  variant_d text not null,
  togri_javob char(1) not null check (togri_javob in ('A', 'B', 'C', 'D')),
  qiyinlik smallint not null default 1 check (qiyinlik between 1 and 5),
  izoh text,
  faol boolean not null default true,
  matn_normallashgan text generated always as (lower(regexp_replace(trim(matn), '\s+', ' ', 'g'))) stored,
  created_by uuid references foydalanuvchilar(id) on delete set null,
  created_at timestamptz not null default now()
);

create index savollar_fan_sinf_mavzu_idx on savollar(fan_id, sinf_id, mavzu_id);
create index savollar_matn_normallashgan_idx on savollar(matn_normallashgan);

-- ----------------------------------------------------------------------------
-- 5. TESTLAR
-- ----------------------------------------------------------------------------

create table testlar (
  id bigserial primary key,
  nomi text not null,
  fan_id bigint not null references fanlar(id) on delete cascade,
  sinf_id bigint not null references sinflar(id) on delete cascade,
  savol_soni smallint not null check (savol_soni > 0),
  vaqt_daqiqa smallint not null check (vaqt_daqiqa > 0),
  ochilish_vaqti timestamptz not null,
  yopilish_vaqti timestamptz not null,
  urinishlar_soni smallint not null default 1 check (urinishlar_soni > 0),
  tanlov_turi text not null check (tanlov_turi in ('avtomatik', 'qolda')),
  aralashtirish boolean not null default true,
  natija_korsat boolean not null default true,
  xatolarni_korsat boolean not null default false,
  holati text not null default 'qoralama' check (holati in ('qoralama', 'faol', 'yopiq')),
  created_by uuid references foydalanuvchilar(id) on delete set null,
  created_at timestamptz not null default now(),
  check (yopilish_vaqti > ochilish_vaqti)
);

create index testlar_fan_sinf_idx on testlar(fan_id, sinf_id);
create index testlar_holati_idx on testlar(holati);

-- tanlov_turi='avtomatik' bo'lganda savol havzasini belgilaydigan mavzular
create table test_mavzular (
  test_id bigint not null references testlar(id) on delete cascade,
  mavzu_id bigint not null references mavzular(id) on delete cascade,
  primary key (test_id, mavzu_id)
);

-- tanlov_turi='qolda' bo'lganda qo'lda tanlangan savollar
create table test_savollar (
  test_id bigint not null references testlar(id) on delete cascade,
  savol_id bigint not null references savollar(id) on delete cascade,
  tartib smallint not null default 0,
  primary key (test_id, savol_id)
);

-- ----------------------------------------------------------------------------
-- 6. URINISHLAR (test topshirish jarayoni)
-- ----------------------------------------------------------------------------

create table urinishlar (
  id bigserial primary key,
  oquvchi_id bigint not null references oquvchilar(id) on delete cascade,
  test_id bigint not null references testlar(id) on delete cascade,
  holati text not null default 'boshlangan' check (holati in ('boshlangan', 'tugallangan', 'vaqt_tugadi')),
  boshlandi timestamptz not null default now(),
  tugadi timestamptz,
  togri_soni smallint,
  jami_savol smallint not null,
  ball_foiz numeric(5, 2),
  baho smallint check (baho between 2 and 5),
  qurilma text,
  created_at timestamptz not null default now()
);

create index urinishlar_oquvchi_idx on urinishlar(oquvchi_id);
create index urinishlar_test_idx on urinishlar(test_id);

-- Har bir urinish uchun aralashtirilgan savol tartibi va variant tartibi
-- (nusxa ko'chirishga qarshi — har o'quvchida boshqacha tartib) shu yerda
-- "muzlatiladi", shuning uchun test o'zgarsa ham urinish tarixi buzilmaydi.
create table urinish_savollari (
  id bigserial primary key,
  urinish_id bigint not null references urinishlar(id) on delete cascade,
  savol_id bigint not null references savollar(id) on delete restrict,
  tartib smallint not null,
  variant_tartibi jsonb not null, -- masalan {"A":"C","B":"A","C":"D","D":"B"} — ko'rsatilgan harf -> asl harf
  tanlangan_javob char(1) check (tanlangan_javob in ('A', 'B', 'C', 'D')),
  togri_mi boolean,
  belgilangan boolean not null default false, -- "keyin qaytaman"
  javob_vaqti timestamptz,
  unique (urinish_id, savol_id),
  unique (urinish_id, tartib)
);

create index urinish_savollari_urinish_idx on urinish_savollari(urinish_id);

-- Bir vaqtning o'zida ikki qurilmada faol test ochilmasligi uchun sessiya
create table sessiyalar (
  token text primary key,
  oquvchi_id bigint not null references oquvchilar(id) on delete cascade,
  qurilma text,
  yaratildi timestamptz not null default now(),
  amal_qiladi timestamptz not null
);

create index sessiyalar_oquvchi_idx on sessiyalar(oquvchi_id);

-- ----------------------------------------------------------------------------
-- 7. IMPORT JURNALI
-- ----------------------------------------------------------------------------

create table importlar (
  id bigserial primary key,
  foydalanuvchi_id uuid references foydalanuvchilar(id) on delete set null,
  fayl_nomi text not null,
  turi text not null check (turi in ('excel', 'word')),
  jami smallint not null default 0,
  qabul_qilindi smallint not null default 0,
  xato_soni smallint not null default 0,
  xatolar jsonb,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 8. O'QUV MATERIALLARI VA PROGRESS (Modul A/B)
-- ----------------------------------------------------------------------------

create table dars_materiallari (
  id bigserial primary key,
  mavzu_id bigint not null references mavzular(id) on delete cascade,
  tartib smallint not null default 0,
  turi text not null check (turi in ('nazariya', 'misol', 'video')),
  sarlavha text not null,
  kontent text, -- HTML
  media_url text,
  created_at timestamptz not null default now()
);

create index dars_materiallari_mavzu_idx on dars_materiallari(mavzu_id);

create table progress (
  oquvchi_id bigint not null references oquvchilar(id) on delete cascade,
  mavzu_id bigint not null references mavzular(id) on delete cascade,
  organildi boolean not null default false,
  ozini_tekshirish_foiz numeric(5, 2),
  yangilandi timestamptz not null default now(),
  primary key (oquvchi_id, mavzu_id)
);

create table mashq_sessiyalar (
  id bigserial primary key,
  oquvchi_id bigint not null references oquvchilar(id) on delete cascade,
  fan_id bigint references fanlar(id) on delete set null,
  mavzu_id bigint references mavzular(id) on delete set null,
  savol_soni smallint not null default 0,
  togri_soni smallint not null default 0,
  boshlandi timestamptz not null default now(),
  tugadi timestamptz
);

create index mashq_sessiyalar_oquvchi_idx on mashq_sessiyalar(oquvchi_id);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================
-- O'quvchi tomoni Supabase Auth ishlatmaydi (kirish kodi + httpOnly cookie,
-- 9-band), shuning uchun o'quvchiga tegishli barcha yozuv/o'qish faqat
-- server tomonda `service_role` klienti orqali amalga oshiriladi (u RLS'ni
-- chetlab o'tadi). Quyidagi policy'lar faqat Supabase Auth orqali kirgan
-- o'qituvchi/admin uchun.

alter table fanlar enable row level security;
alter table sinflar enable row level security;
alter table mavzular enable row level security;
alter table foydalanuvchilar enable row level security;
alter table biriktirish enable row level security;
alter table oquvchilar enable row level security;
alter table kirish_urinishlari enable row level security;
alter table savollar enable row level security;
alter table testlar enable row level security;
alter table test_mavzular enable row level security;
alter table test_savollar enable row level security;
alter table urinishlar enable row level security;
alter table urinish_savollari enable row level security;
alter table sessiyalar enable row level security;
alter table importlar enable row level security;
alter table dars_materiallari enable row level security;
alter table progress enable row level security;
alter table mashq_sessiyalar enable row level security;

-- Yordamchi funksiyalar: joriy Supabase Auth foydalanuvchisi admin/o'qituvchimi
create function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from foydalanuvchilar
    where id = auth.uid() and rol = 'admin' and faol = true
  );
$$;

create function is_oqituvchi_biriktirilgan(p_fan_id bigint, p_sinf_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from biriktirish b
    join foydalanuvchilar f on f.id = b.foydalanuvchi_id
    where b.foydalanuvchi_id = auth.uid()
      and b.fan_id = p_fan_id
      and b.sinf_id = p_sinf_id
      and f.faol = true
  );
$$;

-- Spravochniklar: har qanday tizimga kirgan foydalanuvchi o'qiy oladi,
-- faqat admin yoza oladi (2-bosqichda kerak bo'lganda kengaytiriladi).
create policy "fanlar: kirgan foydalanuvchi o'qiydi" on fanlar
  for select to authenticated using (true);
create policy "fanlar: admin yozadi" on fanlar
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "sinflar: kirgan foydalanuvchi o'qiydi" on sinflar
  for select to authenticated using (true);
create policy "sinflar: admin yozadi" on sinflar
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "mavzular: kirgan foydalanuvchi o'qiydi" on mavzular
  for select to authenticated using (true);
create policy "mavzular: admin yozadi" on mavzular
  for all to authenticated using (is_admin()) with check (is_admin());

-- foydalanuvchilar: har kim faqat o'zini ko'radi, admin hammasini
create policy "foydalanuvchilar: o'zini ko'radi" on foydalanuvchilar
  for select to authenticated using (id = auth.uid() or is_admin());
create policy "foydalanuvchilar: admin boshqaradi" on foydalanuvchilar
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "biriktirish: o'zinikini ko'radi, admin hammasini" on biriktirish
  for select to authenticated using (foydalanuvchi_id = auth.uid() or is_admin());
create policy "biriktirish: admin boshqaradi" on biriktirish
  for all to authenticated using (is_admin()) with check (is_admin());

-- oquvchilar: faqat admin va shu sinfga biriktirilgan o'qituvchi ko'radi
create policy "oquvchilar: admin hammasini ko'radi" on oquvchilar
  for select to authenticated using (
    is_admin() or exists (
      select 1 from biriktirish b where b.foydalanuvchi_id = auth.uid() and b.sinf_id = oquvchilar.sinf_id
    )
  );
create policy "oquvchilar: admin boshqaradi" on oquvchilar
  for all to authenticated using (is_admin()) with check (is_admin());

-- savollar: o'qituvchi faqat o'ziga biriktirilgan fan+sinf savollarini ko'radi/boshqaradi
create policy "savollar: biriktirilgan yoki admin ko'radi" on savollar
  for select to authenticated using (
    is_admin() or is_oqituvchi_biriktirilgan(fan_id, sinf_id)
  );
create policy "savollar: biriktirilgan yoki admin yozadi" on savollar
  for insert to authenticated with check (
    is_admin() or is_oqituvchi_biriktirilgan(fan_id, sinf_id)
  );
create policy "savollar: biriktirilgan yoki admin yangilaydi" on savollar
  for update to authenticated using (
    is_admin() or is_oqituvchi_biriktirilgan(fan_id, sinf_id)
  ) with check (
    is_admin() or is_oqituvchi_biriktirilgan(fan_id, sinf_id)
  );
create policy "savollar: biriktirilgan yoki admin o'chiradi" on savollar
  for delete to authenticated using (
    is_admin() or is_oqituvchi_biriktirilgan(fan_id, sinf_id)
  );

-- testlar: xuddi savollar kabi, fan+sinf bo'yicha biriktirishga qarab
create policy "testlar: biriktirilgan yoki admin ko'radi" on testlar
  for select to authenticated using (
    is_admin() or is_oqituvchi_biriktirilgan(fan_id, sinf_id)
  );
create policy "testlar: biriktirilgan yoki admin yozadi" on testlar
  for insert to authenticated with check (
    is_admin() or is_oqituvchi_biriktirilgan(fan_id, sinf_id)
  );
create policy "testlar: biriktirilgan yoki admin yangilaydi" on testlar
  for update to authenticated using (
    is_admin() or is_oqituvchi_biriktirilgan(fan_id, sinf_id)
  ) with check (
    is_admin() or is_oqituvchi_biriktirilgan(fan_id, sinf_id)
  );
create policy "testlar: biriktirilgan yoki admin o'chiradi" on testlar
  for delete to authenticated using (
    is_admin() or is_oqituvchi_biriktirilgan(fan_id, sinf_id)
  );

create policy "test_mavzular: testga mos huquq" on test_mavzular
  for all to authenticated using (
    is_admin() or exists (
      select 1 from testlar t where t.id = test_mavzular.test_id
        and is_oqituvchi_biriktirilgan(t.fan_id, t.sinf_id)
    )
  ) with check (
    is_admin() or exists (
      select 1 from testlar t where t.id = test_mavzular.test_id
        and is_oqituvchi_biriktirilgan(t.fan_id, t.sinf_id)
    )
  );

create policy "test_savollar: testga mos huquq" on test_savollar
  for all to authenticated using (
    is_admin() or exists (
      select 1 from testlar t where t.id = test_savollar.test_id
        and is_oqituvchi_biriktirilgan(t.fan_id, t.sinf_id)
    )
  ) with check (
    is_admin() or exists (
      select 1 from testlar t where t.id = test_savollar.test_id
        and is_oqituvchi_biriktirilgan(t.fan_id, t.sinf_id)
    )
  );

-- natijalar (urinishlar/urinish_savollari): faqat o'qish, faqat admin va
-- biriktirilgan o'qituvchi — yozish har doim service_role orqali (o'quvchi
-- tomonidan to'g'ridan-to'g'ri yozilmaydi).
create policy "urinishlar: admin va biriktirilgan o'qituvchi ko'radi" on urinishlar
  for select to authenticated using (
    is_admin() or exists (
      select 1 from testlar t where t.id = urinishlar.test_id
        and is_oqituvchi_biriktirilgan(t.fan_id, t.sinf_id)
    )
  );

create policy "urinish_savollari: admin va biriktirilgan o'qituvchi ko'radi" on urinish_savollari
  for select to authenticated using (
    is_admin() or exists (
      select 1 from urinishlar u
      join testlar t on t.id = u.test_id
      where u.id = urinish_savollari.urinish_id
        and is_oqituvchi_biriktirilgan(t.fan_id, t.sinf_id)
    )
  );

-- sessiyalar, kirish_urinishlari: faqat service_role ishlaydi, hech qanday
-- authenticated policy berilmaydi (jadval RLS yoqilgan holda policy'siz
-- qoladi — bu holatda authenticated/anon uchun hech narsa ko'rinmaydi).

-- importlar: faqat admin
create policy "importlar: admin ko'radi" on importlar
  for select to authenticated using (is_admin());
create policy "importlar: admin yozadi" on importlar
  for insert to authenticated with check (is_admin());

-- dars_materiallari: mavzu orqali biriktirilgan o'qituvchi yoki admin
create policy "dars_materiallari: biriktirilgan yoki admin ko'radi" on dars_materiallari
  for select to authenticated using (
    is_admin() or exists (
      select 1 from mavzular m where m.id = dars_materiallari.mavzu_id
        and is_oqituvchi_biriktirilgan(m.fan_id, m.sinf_id)
    )
  );
create policy "dars_materiallari: biriktirilgan yoki admin yozadi" on dars_materiallari
  for all to authenticated using (
    is_admin() or exists (
      select 1 from mavzular m where m.id = dars_materiallari.mavzu_id
        and is_oqituvchi_biriktirilgan(m.fan_id, m.sinf_id)
    )
  ) with check (
    is_admin() or exists (
      select 1 from mavzular m where m.id = dars_materiallari.mavzu_id
        and is_oqituvchi_biriktirilgan(m.fan_id, m.sinf_id)
    )
  );

-- progress, mashq_sessiyalar: o'qituvchi/admin faqat o'qiydi (kuzatuv uchun),
-- yozish har doim service_role orqali (o'quvchi tomonidan).
create policy "progress: admin va biriktirilgan o'qituvchi ko'radi" on progress
  for select to authenticated using (
    is_admin() or exists (
      select 1 from mavzular m where m.id = progress.mavzu_id
        and is_oqituvchi_biriktirilgan(m.fan_id, m.sinf_id)
    )
  );

create policy "mashq_sessiyalar: admin va biriktirilgan o'qituvchi ko'radi" on mashq_sessiyalar
  for select to authenticated using (
    is_admin() or (fan_id is not null and exists (
      select 1 from biriktirish b where b.foydalanuvchi_id = auth.uid() and b.fan_id = mashq_sessiyalar.fan_id
    ))
  );
