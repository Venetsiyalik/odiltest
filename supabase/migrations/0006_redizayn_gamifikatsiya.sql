-- ============================================================================
-- 0006_redizayn_gamifikatsiya.sql
--
-- REDIZAYN.md 5-bo'lim va 8-bo'lim: XP, daraja, kunlik seriya, nishonlar,
-- avatarlar. Mavjud jadvallarga tegilmaydi — butunlay yangi, qo'shimcha
-- tizim. XP hisoblash faqat serverda (5-bo'lim oxiri) — shu sabab bu
-- jadvallarga yozish faqat service_role orqali (xuddi `progress` va
-- `mashq_sessiyalar` kabi, o'quvchida Supabase Auth yo'q).
-- ============================================================================

create table xp_jurnal (
  id bigserial primary key,
  oquvchi_id bigint not null references oquvchilar(id) on delete cascade,
  miqdor smallint not null,
  sabab text not null,
  created_at timestamptz not null default now()
);
create index xp_jurnal_oquvchi_idx on xp_jurnal(oquvchi_id, created_at);

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
  oquvchi_id bigint not null references oquvchilar(id) on delete cascade,
  nishon_kodi text not null references nishonlar(kod) on delete cascade,
  olingan timestamptz not null default now(),
  primary key (oquvchi_id, nishon_kodi)
);

alter table xp_jurnal enable row level security;
alter table oquvchi_holati enable row level security;
alter table nishonlar enable row level security;
alter table oquvchi_nishonlari enable row level security;

-- nishonlar — belgi katalogi, sezgir ma'lumot emas, hammaga ochiq o'qish.
create policy "nishonlar: hamma o'qiydi" on nishonlar
  for select using (true);

-- xp_jurnal, oquvchi_holati, oquvchi_nishonlari: yozish faqat service_role
-- (o'quvchi tomonidan, server API orqali), admin/o'qituvchi faqat o'z
-- sinfidagi o'quvchilarni kuzatuv uchun o'qiydi (mavjud `progress` bilan
-- bir xil naqsh).
create policy "oquvchi_holati: admin va biriktirilgan o'qituvchi ko'radi" on oquvchi_holati
  for select to authenticated using (
    is_admin() or exists (
      select 1 from oquvchilar o
      join biriktirish b on b.sinf_id = o.sinf_id
      where o.id = oquvchi_holati.oquvchi_id and b.foydalanuvchi_id = auth.uid()
    )
  );

create policy "xp_jurnal: admin va biriktirilgan o'qituvchi ko'radi" on xp_jurnal
  for select to authenticated using (
    is_admin() or exists (
      select 1 from oquvchilar o
      join biriktirish b on b.sinf_id = o.sinf_id
      where o.id = xp_jurnal.oquvchi_id and b.foydalanuvchi_id = auth.uid()
    )
  );

create policy "oquvchi_nishonlari: admin va biriktirilgan o'qituvchi ko'radi" on oquvchi_nishonlari
  for select to authenticated using (
    is_admin() or exists (
      select 1 from oquvchilar o
      join biriktirish b on b.sinf_id = o.sinf_id
      where o.id = oquvchi_nishonlari.oquvchi_id and b.foydalanuvchi_id = auth.uid()
    )
  );

-- 12 ta nishon (REDIZAYN.md 5.3-band).
insert into nishonlar (kod, nomi, tavsif, ikonka) values
  ('birinchi_qadam', 'Birinchi qadam', 'Birinchi rasmiy testni topshirdi', '🥾'),
  ('yuzlik', 'Yuzlik', '100 ta mashq savolini yechdi', '💯'),
  ('haftalik_alangali', 'Haftalik alangali', '7 kunlik seriyaga yetdi', '🔥'),
  ('oylik', 'Oylik', '30 kunlik seriyaga yetdi', '🏅'),
  ('mavzu_ustasi', 'Mavzu ustasi', 'Bir fanning barcha mavzusini o''rgandi', '📚'),
  ('benuqson', 'Benuqson', 'Testda 100% natija ko''rsatdi', '💎'),
  ('tong_qushi', 'Tong qushi', 'Soat 08:00 gacha mashq qildi', '🌅'),
  ('qatiyatli', 'Qat''iyatli', 'Xato qilgan savolni qayta yechib, to''g''ri topdi', '💪'),
  ('kashfiyotchi', 'Kashfiyotchi', '5 xil fanda mashq qildi', '🧭'),
  ('sinf_faxri', 'Sinf faxri', 'Sinfda eng ko''p XP to''pladi', '👑'),
  ('kitobxon', 'Kitobxon', '20 ta ma''ruzani o''qidi', '📖'),
  ('marafonchi', 'Marafonchi', 'Bir kunda 100 ta savol yechdi', '🏃')
on conflict (kod) do nothing;
