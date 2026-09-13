-- ============================================================================
-- 0005_redizayn_materiallar.sql
--
-- REDIZAYN.md 3-bosqich: yangi, kodsiz ("hammaga ochiq") o'quv materiallari
-- tizimi uchun. Mavjud `dars_materiallari` va `progress` jadvallariga
-- (eski, kirish-kodi bilan ishlaydigan O'rganish moduli, 6-bosqich)
-- HECH TEGILMAYDI — bu butunlay parallel, yangi tizim (REDIZAYN.md
-- 1-bo'lim: "mavjud baza jadvallariga faqat qo'shiladi").
-- ============================================================================

alter table mavzular add column if not exists bolim text;
alter table mavzular add column if not exists tavsif text;

create table materiallar (
  id bigserial primary key,
  mavzu_id bigint not null references mavzular(id) on delete cascade,
  turi text not null check (turi in ('maruza', 'prezentatsiya', 'video', 'fayl')),
  sarlavha text not null,
  tavsif text,
  kontent text, -- ma'ruza uchun Markdown (mavjud KontentKorinish orqali render qilinadi)
  fayl_url text, -- Storage'ga yuklangan fayl (prezentatsiya PDF, fayl, video)
  tashqi_url text, -- YouTube / Google Slides havolasi
  slayd_soni smallint, -- 4-bosqichda prezentatsiya slaydlarga ajratilganda to'ldiriladi
  thumbnail_url text,
  holat text not null default 'tayyor'
    check (holat in ('yuklanmoqda', 'ishlanmoqda', 'tayyor', 'xato')),
  tartib smallint not null default 0,
  yuklagan_id uuid references foydalanuvchilar(id) on delete set null,
  created_at timestamptz not null default now()
);

create index materiallar_mavzu_tartib_idx on materiallar(mavzu_id, tartib);

-- Material ko'rilganini qayd etish (yangi tizimning progress izi — eski
-- `progress.organildi`dan alohida, chunki bu kodsiz mehmonlarga ham
-- ochiq bo'lgani uchun mavzuning "o'rganildi" belgisini bermaydi).
create table material_korildi (
  oquvchi_id bigint not null references oquvchilar(id) on delete cascade,
  material_id bigint not null references materiallar(id) on delete cascade,
  korildi timestamptz not null default now(),
  primary key (oquvchi_id, material_id)
);

alter table materiallar enable row level security;
alter table material_korildi enable row level security;

-- materiallar: HAMMA (hatto anon) o'qiy oladi — "bilim hamma uchun ochiq"
-- tamoyili (REDIZAYN.md 3.1-band). Yozish faqat admin yoki shu mavzuning
-- fan/sinfiga biriktirilgan o'qituvchiga ruxsat (mavjud savollar/testlar
-- bilan bir xil naqsh).
create policy "materiallar: hamma o'qiydi" on materiallar
  for select using (true);

create policy "materiallar: biriktirilgan yoki admin yozadi" on materiallar
  for all to authenticated using (
    is_admin() or exists (
      select 1 from mavzular m where m.id = materiallar.mavzu_id
        and is_oqituvchi_biriktirilgan(m.fan_id, m.sinf_id)
    )
  ) with check (
    is_admin() or exists (
      select 1 from mavzular m where m.id = materiallar.mavzu_id
        and is_oqituvchi_biriktirilgan(m.fan_id, m.sinf_id)
    )
  );

-- material_korildi: yozish har doim service_role orqali (o'quvchi
-- tomonidan, xuddi `progress` kabi), admin/biriktirilgan o'qituvchi
-- faqat kuzatuv uchun o'qiydi.
create policy "material_korildi: admin va biriktirilgan o'qituvchi ko'radi" on material_korildi
  for select to authenticated using (
    is_admin() or exists (
      select 1 from materiallar mt
      join mavzular m on m.id = mt.mavzu_id
      where mt.id = material_korildi.material_id
        and is_oqituvchi_biriktirilgan(m.fan_id, m.sinf_id)
    )
  );

-- ----------------------------------------------------------------------------
-- Storage: yangi o'quv materiallari fayllari (prezentatsiya PDF, biriktirilgan
-- fayl, thumbnail). Mavjud "savol-rasmlari" bucket'idan alohida — 9-band'dagi
-- 10 MB chegarasi PDF/prezentatsiya uchun yetarli emas, shuning uchun bu
-- bucket uchun kattaroq limit belgilanadi.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'oquv-materiallari',
  'oquv-materiallari',
  true,
  52428800, -- 50 MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png', 'image/jpeg', 'image/webp'
  ]
)
on conflict (id) do nothing;

create policy "oquv-materiallari: hammaga o'qish"
  on storage.objects for select
  using (bucket_id = 'oquv-materiallari');

create policy "oquv-materiallari: kirgan foydalanuvchi yuklaydi"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'oquv-materiallari');

create policy "oquv-materiallari: kirgan foydalanuvchi yangilaydi"
  on storage.objects for update to authenticated
  using (bucket_id = 'oquv-materiallari')
  with check (bucket_id = 'oquv-materiallari');

create policy "oquv-materiallari: kirgan foydalanuvchi o'chiradi"
  on storage.objects for delete to authenticated
  using (bucket_id = 'oquv-materiallari');
