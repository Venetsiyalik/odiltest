-- ============================================================================
-- 0010_oqituvchi_paneli.sql — O'qituvchilar paneli
--
-- Texnik topshiriqning boshidanoq mavjud bo'lgan (0001_init.sql) "biriktirish"
-- konsepsiyasini birinchi marta amalda ishlatadigan bosqich: admin
-- o'qituvchiga login/parol yaratadi va uni fan+sinfga biriktiradi, o'qituvchi
-- esa shu fan+sinf doirasida deyarli barcha admin qulayliklaridan
-- foydalanadi. Mavjud savollar/testlar/mavzular RLS siyosati allaqachon
-- to'g'ri sozlangan edi (0001/0003) — bu migratsiya faqat topilgan ikkita
-- bo'shliqni yopadi: o'quvchilar ro'yxatiga yozish va importlar jurnali.
-- ============================================================================

-- O'quvchilar jadvalida faqat SELECT siyosati o'qituvchiga ochiq edi (sinf
-- bo'yicha), yozish (qo'shish/tahrirlash/o'chirish) esa faqat admin uchun
-- ("oquvchilar: admin boshqaradi", 0001-band) — bu yerda o'qituvchi uchun
-- o'z biriktirilgan sinfiga cheklangan yangi siyosat qo'shiladi. `oquvchilar`
-- jadvalida `fan_id` yo'q, shuning uchun `is_oqituvchi_biriktirilgan(fan,sinf)`
-- funksiyasi mos kelmaydi — faqat sinf bo'yicha tekshiruvchi yangi funksiya.
create function is_oqituvchi_sinfga_biriktirilgan(p_sinf_id bigint)
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
      and b.sinf_id = p_sinf_id
      and f.faol = true
  );
$$;

create policy "oquvchilar: biriktirilgan o'qituvchi yozadi" on oquvchilar
  for insert to authenticated with check (
    is_admin() or is_oqituvchi_sinfga_biriktirilgan(sinf_id)
  );
create policy "oquvchilar: biriktirilgan o'qituvchi yangilaydi" on oquvchilar
  for update to authenticated using (
    is_admin() or is_oqituvchi_sinfga_biriktirilgan(sinf_id)
  ) with check (
    is_admin() or is_oqituvchi_sinfga_biriktirilgan(sinf_id)
  );
create policy "oquvchilar: biriktirilgan o'qituvchi o'chiradi" on oquvchilar
  for delete to authenticated using (
    is_admin() or is_oqituvchi_sinfga_biriktirilgan(sinf_id)
  );

-- importlar: ilgari faqat admin ko'rar/yozar edi (savollar Excel/Word import
-- jurnali) — endi o'qituvchi ham o'z importlarini yozishi/ko'rishi mumkin
-- (savollarning o'zi allaqachon `is_oqituvchi_biriktirilgan` bilan
-- himoyalangan, bu yerda faqat jurnal yozuvi — o'ziniki bo'lsa yetarli).
create policy "importlar: oqituvchi o'zinikini ko'radi" on importlar
  for select to authenticated using (
    is_admin() or foydalanuvchi_id = auth.uid()
  );
create policy "importlar: oqituvchi o'zinikini yozadi" on importlar
  for insert to authenticated with check (
    is_admin() or foydalanuvchi_id = auth.uid()
  );
