-- ============================================================================
-- 0008_smart_test.sql — Smart Test moduli (smart-test.md)
--
-- Mavjud rasmiy test tizimiga, `savollar` jadvaliga (faqat qo'shimcha
-- ustunlar) va xavfsizlik qoidalariga tegilmaydi (smart-test.md 1-bo'lim).
-- ============================================================================

-- Noto'g'ri variantlar nega noto'g'ri ekanini qisqa xulosalash va izohga
-- rasm qo'shish uchun — ikkalasi ham ixtiyoriy (8-bo'lim).
alter table savollar add column if not exists izoh_qisqa text;
alter table savollar add column if not exists izoh_rasm_url text;

-- Word/Excel'dan tashqari endi PDF orqali ham savol import qilinishi mumkin
-- (7.4-bo'lim) — mavjud savollar import oqimining bir qismi, alohida jadval
-- emas, shuning uchun `importlar.turi`ga qo'shimcha qiymat qo'shiladi.
alter table importlar drop constraint if exists importlar_turi_check;
alter table importlar add constraint importlar_turi_check
  check (turi in ('excel', 'word', 'ishreja', 'pdf'));

-- O'qituvchi uchun sessiya jurnali — baholash emas, faqat "qaysi mavzu
-- o'tildi" statistikasi uchun. O'quvchi ma'lumoti umuman yozilmaydi (8-bo'lim).
create table smart_sessiyalar (
  id bigserial primary key,
  oqituvchi_id uuid references foydalanuvchilar(id) on delete set null,
  fan_id bigint references fanlar(id) on delete set null,
  daraja smallint,
  mavzular bigint[],
  savol_soni smallint,
  vaqt_rejimi boolean not null default false,
  boshlandi timestamptz not null default now(),
  tugadi timestamptz
);

create index smart_sessiyalar_oqituvchi_idx on smart_sessiyalar(oqituvchi_id);

alter table smart_sessiyalar enable row level security;

-- Smart Test butunlay /admin panelida, login talab qilib ishlaydi (savollar
-- jadvalidagi to'g'ri javob shu yerdan klientga yuborilgani uchun — 10-bo'lim
-- eslatmasi, xavfsizlik qoidasi #1ga mos moslashuv). Shu sababli yozish ham
-- oddiy authenticated klient orqali, o'qituvchining o'z nomidan amalga oshadi.
create policy "smart_sessiyalar: admin va oqituvchi ko'radi" on smart_sessiyalar
  for select to authenticated using (
    is_admin() or oqituvchi_id = auth.uid()
  );
create policy "smart_sessiyalar: admin va oqituvchi yozadi" on smart_sessiyalar
  for insert to authenticated with check (
    is_admin() or oqituvchi_id = auth.uid()
  );
