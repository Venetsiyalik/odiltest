-- ============================================================================
-- 0002_referans_va_storage.sql
--
-- 1) fanlar/sinflar o'chirilganda mavzular/savollar/testlar "cascade" bilan
--    ommaviy o'chib ketmasligi uchun bu bog'lanishlar "restrict"ga
--    o'zgartiriladi — admin fan/sinfni faqat unga tegishli ma'lumot
--    qolmagandagina o'chira oladi.
-- 2) Savol rasmlari uchun Supabase Storage bucket.
-- ============================================================================

alter table mavzular drop constraint mavzular_fan_id_fkey;
alter table mavzular add constraint mavzular_fan_id_fkey
  foreign key (fan_id) references fanlar(id) on delete restrict;

alter table mavzular drop constraint mavzular_sinf_id_fkey;
alter table mavzular add constraint mavzular_sinf_id_fkey
  foreign key (sinf_id) references sinflar(id) on delete restrict;

alter table savollar drop constraint savollar_fan_id_fkey;
alter table savollar add constraint savollar_fan_id_fkey
  foreign key (fan_id) references fanlar(id) on delete restrict;

alter table savollar drop constraint savollar_sinf_id_fkey;
alter table savollar add constraint savollar_sinf_id_fkey
  foreign key (sinf_id) references sinflar(id) on delete restrict;

alter table testlar drop constraint testlar_fan_id_fkey;
alter table testlar add constraint testlar_fan_id_fkey
  foreign key (fan_id) references fanlar(id) on delete restrict;

alter table testlar drop constraint testlar_sinf_id_fkey;
alter table testlar add constraint testlar_sinf_id_fkey
  foreign key (sinf_id) references sinflar(id) on delete restrict;

-- ----------------------------------------------------------------------------
-- Storage: savol rasmlari
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'savol-rasmlari',
  'savol-rasmlari',
  true,
  10485760, -- 10 MB (9-band)
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

create policy "savol-rasmlari: hammaga o'qish"
  on storage.objects for select
  using (bucket_id = 'savol-rasmlari');

create policy "savol-rasmlari: kirgan foydalanuvchi yuklaydi"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'savol-rasmlari');

create policy "savol-rasmlari: kirgan foydalanuvchi yangilaydi"
  on storage.objects for update to authenticated
  using (bucket_id = 'savol-rasmlari')
  with check (bucket_id = 'savol-rasmlari');

create policy "savol-rasmlari: kirgan foydalanuvchi o'chiradi"
  on storage.objects for delete to authenticated
  using (bucket_id = 'savol-rasmlari');
