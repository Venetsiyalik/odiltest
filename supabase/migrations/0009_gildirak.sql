-- ============================================================================
-- 0009_gildirak.sql — Bilim g'ildiragi moduli (bilim-gildiragi.md)
--
-- Smart Test bilan bir oilada (bir xil savollar jadvali, bir xil admin-gated
-- arxitektura), lekin alohida ishlaydi — mavjud rasmiy test tizimiga,
-- `savollar`/`oquvchilar` jadvallariga (faqat qo'shimcha) va xavfsizlik
-- qoidalariga tegilmaydi (1-bo'lim).
--
-- ESLATMA: hujjatning 8-bo'limidagi SQL namunasi `profillar(id)`ga ishora
-- qiladi — bu loyihada bunday jadval yo'q, haqiqiy jadval nomi
-- `foydalanuvchilar` (0001_init.sql). Quyida shunga moslashtirildi.
-- ============================================================================

create table gildirak_sessiyalar (
  id bigserial primary key,
  oqituvchi_id uuid references foydalanuvchilar(id) on delete set null,
  sinf_id bigint references sinflar(id) on delete set null,
  fan_id bigint references fanlar(id) on delete set null,
  boshlandi timestamptz not null default now(),
  tugadi timestamptz,
  jurnalga_yozildi boolean not null default false
);

create table gildirak_natijalar (
  id bigserial primary key,
  sessiya_id bigint not null references gildirak_sessiyalar(id) on delete cascade,
  oquvchi_id bigint not null references oquvchilar(id) on delete cascade,
  savol_id bigint references savollar(id) on delete set null,
  raqam smallint,
  togri boolean,
  baho smallint,
  tasdiqlandi boolean not null default false,
  vaqt timestamptz not null default now()
);

create index gildirak_natijalar_sessiya_idx on gildirak_natijalar(sessiya_id);

-- O'quvchining shaxsiy kabinetida ko'rinadigan "yordam topshirig'i"
-- (6.4-bo'lim) — talaba tomoni bu jadvalni `service_role` orqali o'qiydi
-- (kirish kodi bilan kirgan o'quvchida Supabase Auth yo'q, xuddi
-- `progress`/`mashq_sessiyalar` kabi).
create table yordam_topshiriqlari (
  id bigserial primary key,
  oquvchi_id bigint not null references oquvchilar(id) on delete cascade,
  mavzu_id bigint references mavzular(id) on delete set null,
  matn text not null,
  manba text not null default 'gildirak',
  bajarildi boolean not null default false,
  berilgan timestamptz not null default now()
);

create index yordam_topshiriqlari_oquvchi_idx on yordam_topshiriqlari(oquvchi_id);

alter table gildirak_sessiyalar enable row level security;
alter table gildirak_natijalar enable row level security;
alter table yordam_topshiriqlari enable row level security;

create policy "gildirak_sessiyalar: admin va oqituvchi ko'radi" on gildirak_sessiyalar
  for select to authenticated using (is_admin() or oqituvchi_id = auth.uid());
create policy "gildirak_sessiyalar: admin va oqituvchi yozadi" on gildirak_sessiyalar
  for insert to authenticated with check (is_admin() or oqituvchi_id = auth.uid());
create policy "gildirak_sessiyalar: admin va oqituvchi yangilaydi" on gildirak_sessiyalar
  for update to authenticated using (is_admin() or oqituvchi_id = auth.uid())
  with check (is_admin() or oqituvchi_id = auth.uid());

create policy "gildirak_natijalar: admin va biriktirilgan o'qituvchi ko'radi" on gildirak_natijalar
  for select to authenticated using (
    is_admin() or exists (
      select 1 from gildirak_sessiyalar s where s.id = gildirak_natijalar.sessiya_id and s.oqituvchi_id = auth.uid()
    )
  );
create policy "gildirak_natijalar: admin va biriktirilgan o'qituvchi yozadi" on gildirak_natijalar
  for insert to authenticated with check (
    is_admin() or exists (
      select 1 from gildirak_sessiyalar s where s.id = gildirak_natijalar.sessiya_id and s.oqituvchi_id = auth.uid()
    )
  );
create policy "gildirak_natijalar: admin va biriktirilgan o'qituvchi yangilaydi" on gildirak_natijalar
  for update to authenticated using (
    is_admin() or exists (
      select 1 from gildirak_sessiyalar s where s.id = gildirak_natijalar.sessiya_id and s.oqituvchi_id = auth.uid()
    )
  ) with check (
    is_admin() or exists (
      select 1 from gildirak_sessiyalar s where s.id = gildirak_natijalar.sessiya_id and s.oqituvchi_id = auth.uid()
    )
  );

-- yordam_topshiriqlari: admin/o'qituvchi (biriktirilgan sinf orqali) ko'radi
-- va boshqaradi; o'quvchi tomoni service_role orqali o'qiydi (RLS'ni
-- chetlab o'tadi, boshqa talaba-tomon jadvallari kabi).
create policy "yordam_topshiriqlari: admin va biriktirilgan o'qituvchi ko'radi" on yordam_topshiriqlari
  for select to authenticated using (
    is_admin() or exists (
      select 1 from oquvchilar o
      join biriktirish b on b.sinf_id = o.sinf_id
      where o.id = yordam_topshiriqlari.oquvchi_id and b.foydalanuvchi_id = auth.uid()
    )
  );
create policy "yordam_topshiriqlari: admin va biriktirilgan o'qituvchi yozadi" on yordam_topshiriqlari
  for insert to authenticated with check (
    is_admin() or exists (
      select 1 from oquvchilar o
      join biriktirish b on b.sinf_id = o.sinf_id
      where o.id = yordam_topshiriqlari.oquvchi_id and b.foydalanuvchi_id = auth.uid()
    )
  );
create policy "yordam_topshiriqlari: admin va biriktirilgan o'qituvchi yangilaydi" on yordam_topshiriqlari
  for update to authenticated using (
    is_admin() or exists (
      select 1 from oquvchilar o
      join biriktirish b on b.sinf_id = o.sinf_id
      where o.id = yordam_topshiriqlari.oquvchi_id and b.foydalanuvchi_id = auth.uid()
    )
  ) with check (
    is_admin() or exists (
      select 1 from oquvchilar o
      join biriktirish b on b.sinf_id = o.sinf_id
      where o.id = yordam_topshiriqlari.oquvchi_id and b.foydalanuvchi_id = auth.uid()
    )
  );
