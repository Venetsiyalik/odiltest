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
      juda_kop_urinish: "Juda ko'p noto'g'ri urinish. 10 daqiqadan so'ng qayta urinib ko'ring",
      salom: (ismFamiliya: string, sinf: string) => `Salom, ${ismFamiliya} · ${sinf} sinf`,
      buMenEmasman: "Bu men emasman",
    },
    menyu: {
      organish: "O'rganish",
      mashq: "Mashq qilish",
      testTopshirish: "Test topshirish",
      natijalarim: "Mening natijalarim",
    },
  },
} as const;
