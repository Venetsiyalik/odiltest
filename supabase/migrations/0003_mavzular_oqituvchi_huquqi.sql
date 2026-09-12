-- ============================================================================
-- 0003_mavzular_oqituvchi_huquqi.sql
--
-- 0001'da "mavzular: admin yozadi" policy'si faqat adminга yozish huquqi
-- bergan edi. Lekin texnik topshiriqning 2.2-bandiga ko'ra o'qituvchi ham
-- o'ziga biriktirilgan fan+sinf uchun savol/mavzu qo'sha olishi kerak —
-- bu ayniqsa savol import qilishda "yangi mavzu yaratiladi" holatida kerak
-- bo'ladi (5-band). Shu sababli policy savollar/testlar bilan bir xil
-- qoidaga moslashtiriladi.
-- ============================================================================

drop policy "mavzular: admin yozadi" on mavzular;

create policy "mavzular: biriktirilgan yoki admin yozadi" on mavzular
  for all to authenticated using (
    is_admin() or is_oqituvchi_biriktirilgan(fan_id, sinf_id)
  ) with check (
    is_admin() or is_oqituvchi_biriktirilgan(fan_id, sinf_id)
  );
