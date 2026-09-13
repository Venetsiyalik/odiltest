-- Mavzularni ommaviy import qilish (ishreja-import.md).
-- Faqat qo'shimcha ustunlar — mavjud `mavzular` va `importlar` jadvallarining
-- ma'nosi o'zgartirilmaydi.

alter table mavzular add column if not exists chorak smallint check (chorak between 1 and 4);
alter table mavzular add column if not exists oquv_yili text;
alter table mavzular add column if not exists uyga_vazifa text;
alter table mavzular add column if not exists turi text not null default 'mavzu'
  check (turi in ('mavzu', 'baholash', 'takrorlash', 'amaliy'));
alter table mavzular add column if not exists ball smallint;
alter table mavzular add column if not exists manba_fayl text;

-- Diqqat: hujjat (ishreja-import.md) `daraja` ustunini nazarda tutgan edi,
-- lekin bu loyihada "daraja" hech qachon saqlanmaydi — u har doim
-- `sinflar.nomi`dan hisoblab olinadi (REDIZAYN.md 2-bosqich qarori,
-- `lib/redizayn/daraja.ts`). Shu sababli unikal kalit mavjud `sinf_id`ga
-- asoslanadi (`daraja` ustuni QO'SHILMAYDI) — bitta darajada bir nechta
-- sinf-guruh (5-A, 5-B) bo'lsa, import shu darajaga mos har bir sinf-guruhga
-- alohida-alohida yozadi (bugun amalda faqat bitta guruh bor).
alter table mavzular drop constraint if exists mavzular_fan_id_sinf_id_nomi_key;
alter table mavzular drop constraint if exists mavzular_fan_id_daraja_nomi_key;
create unique index if not exists mavzular_unikal
  on mavzular (fan_id, sinf_id, coalesce(oquv_yili, ''), coalesce(chorak, 0), nomi);

alter table importlar drop constraint if exists importlar_turi_check;
alter table importlar add constraint importlar_turi_check
  check (turi in ('excel', 'word', 'ishreja'));
