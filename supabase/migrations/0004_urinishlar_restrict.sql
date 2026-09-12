-- ============================================================================
-- 0004_urinishlar_restrict.sql
--
-- urinishlar.test_id "on delete cascade" edi — bitta testni o'chirish
-- o'quvchilarning barcha topshirgan natijalarini ham yo'q qilib yuborardi.
-- Testlar hayot davri "qoralama → faol → yopiq" (4-band), o'chirish emas —
-- shu sababli bog'lanish "restrict"ga o'zgartiriladi.
-- ============================================================================

alter table urinishlar drop constraint urinishlar_test_id_fkey;
alter table urinishlar add constraint urinishlar_test_id_fkey
  foreign key (test_id) references testlar(id) on delete restrict;
