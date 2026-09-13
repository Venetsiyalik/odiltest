/**
 * Barcha interfeys matnlari shu yerda markazlashgan (10-band). Hech qachon
 * komponent ichida qattiq kodlangan o'zbekcha matn yozilmasin — shu yerga
 * qo'shib, shu yerdan import qilinsin. Kelajakda rus tili qo'shilganda
 * faqat shu faylga o'xshash `ru.ts` yetarli bo'ladi.
 */
export const uz = {
  umumiy: {
    saytNomi: "Odil School",
    yuklanmoqda: "Yuklanmoqda...",
    xatoYuzBerdi: "Xatolik yuz berdi. Qaytadan urinib ko'ring.",
    davomEtish: "Davom etish",
    orqaga: "Orqaga",
    keyingi: "Keyingi",
    yakunlash: "Yakunlash",
    chiqish: "Chiqish",
  },
  admin: {
    kirish: {
      sarlavha: "Admin panelga kirish",
      email: "Elektron pochta",
      parol: "Parol",
      tugma: "Kirish",
      xatoXabari: "Email yoki parol noto'g'ri",
    },
  },
  talaba: {
    kirish: {
      sarlavha: "Kirish kodini kiriting",
      kodNotogri: "Bunday kod topilmadi. Kodni qayta tekshiring",
      judaKopUrinish: "Juda ko'p noto'g'ri urinish. 10 daqiqadan so'ng qayta urinib ko'ring",
      salom: (ismFamiliya: string, sinf: string) => `Salom, ${ismFamiliya} · ${sinf} sinf`,
      buMenEmasman: "Bu men emasman",
    },
    menyu: {
      organish: "O'rganish",
      mashq: "Mashq qilish",
      testTopshirish: "Test topshirish",
      natijalarim: "Mening natijalarim",
    },
    test: {
      royxatSarlavha: "Test topshirish",
      testYoq: "Sizning sinfingiz uchun hozircha faol test yo'q",
      boshlash: "Boshlash",
      savolSoni: (soni: number) => `${soni} ta savol`,
      vaqt: (daqiqa: number) => `${daqiqa} daqiqa`,
      urinishQoldi: (soni: number) => `${soni} ta urinish qoldi`,
      urinishTugadi: "Urinishlar soni tugadi",
      davomEttirish: "Davom ettirish",
      yakunlashTasdiq: "Testni yakunlaysizmi? Yakunlagandan so'ng javoblarni o'zgartirib bo'lmaydi.",
      vaqtTugadi: "Vaqt tugadi — test avtomatik yakunlandi",
      natijaQabulQilindi: "Test qabul qilindi. Natijani o'qituvchingiz e'lon qiladi.",
      menyugaQaytish: "Menyuga qaytish",
      belgilash: "Keyin qaytaman",
      yakunlash: "Yakunlash",
      savolRaqami: (joriy: number, jami: number) => `Savol ${joriy}/${jami}`,
    },
    organish: {
      nazariya: "Nazariya",
      misol: "Misol",
      oziniTekshirish: "O'z-o'zini tekshirish",
      yakun: "Yakun",
      togri: "To'g'ri!",
      notogri: "Noto'g'ri",
      togriJavobEdi: (harf: string) => `To'g'ri javob: ${harf}`,
      mavzuOrganildi: "Mavzu o'rganildi deb belgilandi!",
      materialYoq: "Bu bosqich uchun material hali qo'shilmagan",
    },
    mashq: {
      sarlavha: "Mashq qilish",
      fanTanlash: "Fan tanlang",
      mavzuTanlash: "Mavzu (ixtiyoriy — bo'sh qoldirsangiz barcha mavzulardan)",
      aralash: "Barcha mavzulardan aralash",
      boshlash: "Boshlash",
      hisob: (togri: number, jami: number) => `To'g'ri: ${togri}/${jami}`,
      keyingiSavol: "Keyingi savol",
      toxtatish: "To'xtatish",
      xatolarniQaytarish: "Xato qilgan savollarni qayta ishlash",
      savolYoq: "Bu tanlov uchun savol topilmadi",
      sessiyaYakunlandi: "Mashq yakunlandi",
    },
  },
} as const;
