/**
 * Barcha interfeys matnlari shu yerda markazlashgan (10-band). Hech qachon
 * komponent ichida qattiq kodlangan o'zbekcha matn yozilmasin — shu yerga
 * qo'shib, shu yerdan import qilinsin. `ru.ts` — xuddi shu `Matnlar` turiga
 * mos ruscha tarjima; ikkalasi ham `lib/i18n/joriy-til.ts` orqali til
 * cookie'siga qarab tanlanadi (faqat talaba tomonida — admin panel
 * hamon shu faylni to'g'ridan-to'g'ri ishlatadi).
 *
 * Diqqat: bu yerda FAQAT interfeys matnlari (tugma/sarlavha/xabar) turadi.
 * Bazadagi haqiqiy kontent (savol matni, mavzu/fan nomi, ma'ruza matni)
 * bu yerga kirmaydi va tarjima qilinmaydi — ular admin/o'qituvchi tomonidan
 * kiritilgan haqiqiy o'quv materiali.
 *
 * Turi ataylab `as const`dan emas, aniq `Matnlar` interfeysidan olinadi —
 * aks holda `ru.ts` uz.ts bilan bir xil so'z qiymatlariga majburlanib
 * qolar edi (`as const` matnni ham literal tur qilib qo'yadi).
 */
export interface Matnlar {
  umumiy: {
    saytNomi: string;
    yuklanmoqda: string;
    xatoYuzBerdi: string;
    davomEtish: string;
    orqaga: string;
    keyingi: string;
    yakunlash: string;
    chiqish: string;
    tezOrada: string;
    boshSahifa: string;
  };
  admin: {
    kirish: {
      sarlavha: string;
      email: string;
      parol: string;
      tugma: string;
      xatoXabari: string;
    };
  };
  talaba: {
    kirish: {
      sarlavha: string;
      kodNotogri: string;
      judaKopUrinish: string;
      salom: (ismFamiliya: string, sinf: string) => string;
      buMenEmasman: string;
    };
    menyu: {
      organish: string;
      mashq: string;
      testTopshirish: string;
      natijalarim: string;
      nishonlarim: string;
      sinfRejimiYoqish: string;
      sinfRejimiOchirish: string;
      foydalanuvchi: (ismFamiliya: string, sinf: string) => string;
      sinfLabel: (sinf: string) => string;
      topshiriqBor: (soni: number) => string;
      topshiriqBajarildi: string;
    };
    dashboard: {
      shaxsiyKabinet: string;
      daraja: (n: number) => string;
      kunSoni: (n: number) => string;
      bugungiMaqsad: (joriy: number, maqsad: number) => string;
      tagline: string;
      sinflar: string;
      fanVaMavzu: (fan: number, mavzu: number) => string;
      tezHavolalar: string;
      testTopshirishKodBilan: string;
      sinflarReytingi: string;
      xpYoq: string;
      oxirgiMateriallar: string;
      materiallarTezOrada: string;
    };
    sinf: {
      darajaSarlavha: (n: number) => string;
      mavzuSoni: (n: number) => string;
      mavzuOrganilgan: (organilgan: number, jami: number) => string;
      mavzuYoq: string;
      materialYoq: string;
      maruza: string;
      prezentatsiyaTuri: string;
      video: string;
      fayl: string;
      slaydSoni: (n: number) => string;
      korilgan: string;
      organilganBelgi: string;
      mavzuBoyichaMashq: string;
      oldingiMavzu: string;
      keyingiMavzu: string;
      mavzugaQaytish: string;
      videoTopilmadi: string;
      faylTopilmadi: string;
      faylniYuklab: string;
      fanYoq: string;
      fanMavjudEmas: string;
    };
    nishonlar: {
      sarlavha: string;
      avatar: string;
      soni: (olingan: number, jami: number) => string;
    };
    offline: {
      sarlavha: string;
      matn: string;
    };
    tezOrada: {
      matn: string;
    };
    qidiruv: {
      placeholder: string;
      mavzuBelgisi: string;
    };
    prezentatsiya: {
      yuklabBolmadi: string;
      doska: string;
      barchaSlaydlar: string;
      boshlash: string;
    };
    tabriklash: {
      darajaOshdi: string;
      darajaLabel: (n: number) => string;
      zor: string;
    };
    test: {
      royxatSarlavha: string;
      testYoq: string;
      boshlash: string;
      savolSoni: (soni: number) => string;
      vaqt: (daqiqa: number) => string;
      urinishQoldi: (soni: number) => string;
      urinishTugadi: string;
      davomEttirish: string;
      yakunlashTasdiq: string;
      vaqtTugadi: string;
      natijaQabulQilindi: string;
      menyugaQaytish: string;
      belgilash: string;
      yakunlash: string;
      savolRaqami: (joriy: number, jami: number) => string;
      oflaynXabari: string;
      bahoLabel: (baho: number) => string;
    };
    organish: {
      nazariya: string;
      misol: string;
      oziniTekshirish: string;
      yakun: string;
      togri: string;
      notogri: string;
      togriJavobEdi: (harf: string) => string;
      mavzuOrganildi: string;
      materialYoq: string;
    };
    mashq: {
      sarlavha: string;
      fanTanlash: string;
      mavzuTanlash: string;
      aralash: string;
      boshlash: string;
      hisob: (togri: number, jami: number) => string;
      keyingiSavol: string;
      toxtatish: string;
      xatolarniQaytarish: string;
      savolYoq: string;
      sessiyaYakunlandi: string;
    };
  };
}

export const uz: Matnlar = {
  umumiy: {
    saytNomi: "Odil School",
    yuklanmoqda: "Yuklanmoqda...",
    xatoYuzBerdi: "Xatolik yuz berdi. Qaytadan urinib ko'ring.",
    davomEtish: "Davom etish",
    orqaga: "Orqaga",
    keyingi: "Keyingi",
    yakunlash: "Yakunlash",
    chiqish: "Chiqish",
    tezOrada: "Tez orada",
    boshSahifa: "Bosh sahifa",
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
      salom: (ismFamiliya, sinf) => `Salom, ${ismFamiliya} · ${sinf} sinf`,
      buMenEmasman: "Bu men emasman",
    },
    menyu: {
      organish: "O'rganish",
      mashq: "Mashq qilish",
      testTopshirish: "Test topshirish",
      natijalarim: "Mening natijalarim",
      nishonlarim: "🏆 Nishonlarim",
      sinfRejimiYoqish: "🔍 Sinf rejimi",
      sinfRejimiOchirish: "🔍 Sinf rejimi (yoqilgan)",
      foydalanuvchi: (ismFamiliya, sinf) => `${ismFamiliya} · ${sinf} sinf`,
      sinfLabel: (sinf) => `${sinf} sinf`,
      topshiriqBor: (soni) => `📋 Sizga ${soni} ta yordam topshirig'i bor`,
      topshiriqBajarildi: "Bajarildi deb belgilash",
    },
    dashboard: {
      shaxsiyKabinet: "Shaxsiy kabinet",
      daraja: (n) => `Daraja ${n}`,
      kunSoni: (n) => `${n} kun`,
      bugungiMaqsad: (joriy, maqsad) => `Bugungi maqsad: ${joriy}/${maqsad} mashq savoli`,
      tagline: "Barcha fan va mavzular — hammaga ochiq, kodsiz",
      sinflar: "Sinflar",
      fanVaMavzu: (fan, mavzu) => `${fan} fan · ${mavzu} mavzu`,
      tezHavolalar: "Tez havolalar",
      testTopshirishKodBilan: "Test topshirish (kod bilan)",
      sinflarReytingi: "Sinflar reytingi (shu hafta)",
      xpYoq: "Bu hafta hali XP to'plangani yo'q",
      oxirgiMateriallar: "Oxirgi qo'shilgan materiallar",
      materiallarTezOrada: "Tez orada — o'quv materiallari moduli qo'shilgach shu yerda ko'rinadi",
    },
    sinf: {
      darajaSarlavha: (n) => `${n}-sinf`,
      mavzuSoni: (n) => `${n} mavzu`,
      mavzuOrganilgan: (organilgan, jami) => `${jami} mavzudan ${organilgan} tasi o'rganilgan`,
      mavzuYoq: "Bu fan uchun hali mavzu qo'shilmagan",
      materialYoq: "Bu mavzu uchun hali material qo'shilmagan",
      maruza: "Ma'ruza",
      prezentatsiyaTuri: "Prezentatsiya",
      video: "Video",
      fayl: "Fayl",
      slaydSoni: (n) => `${n} slayd`,
      korilgan: "Ko'rilgan",
      organilganBelgi: "O'rganilgan",
      mavzuBoyichaMashq: "Shu mavzu bo'yicha mashq qilish",
      oldingiMavzu: "Oldingi mavzu",
      keyingiMavzu: "Keyingi mavzu",
      mavzugaQaytish: "Mavzuga qaytish",
      videoTopilmadi: "Video havolasi topilmadi",
      faylTopilmadi: "Fayl topilmadi",
      faylniYuklab: "Faylni yuklab olish",
      fanYoq: "Bu fan uchun hali mavzu yo'q",
      fanMavjudEmas: "Hozircha fan mavjud emas",
    },
    nishonlar: {
      sarlavha: "Nishonlarim",
      avatar: "Avatar",
      soni: (olingan, jami) => `Nishonlar (${olingan}/${jami})`,
    },
    offline: {
      sarlavha: "Internet ulanishi yo'q",
      matn: "Ulanish tiklangach, sahifa avtomatik ishlay boshlaydi. Agar test yechayotgan bo'lsangiz, javoblaringiz saqlanib qoladi.",
    },
    tezOrada: {
      matn: "Bu bo'lim keyingi bosqichlarda tayyor bo'ladi.",
    },
    qidiruv: {
      placeholder: "Mavzu yoki fan qidiring…",
      mavzuBelgisi: " · mavzu",
    },
    prezentatsiya: {
      yuklabBolmadi: "Prezentatsiyani yuklab bo'lmadi",
      doska: "Doska",
      barchaSlaydlar: "Barcha slaydlar",
      boshlash: "Prezentatsiyani boshlash",
    },
    tabriklash: {
      darajaOshdi: "Daraja oshdi!",
      darajaLabel: (n) => `${n}-daraja`,
      zor: "Zo'r!",
    },
    test: {
      royxatSarlavha: "Test topshirish",
      testYoq: "Sizning sinfingiz uchun hozircha faol test yo'q",
      boshlash: "Boshlash",
      savolSoni: (soni) => `${soni} ta savol`,
      vaqt: (daqiqa) => `${daqiqa} daqiqa`,
      urinishQoldi: (soni) => `${soni} ta urinish qoldi`,
      urinishTugadi: "Urinishlar soni tugadi",
      davomEttirish: "Davom ettirish",
      yakunlashTasdiq: "Testni yakunlaysizmi? Yakunlagandan so'ng javoblarni o'zgartirib bo'lmaydi.",
      vaqtTugadi: "Vaqt tugadi — test avtomatik yakunlandi",
      natijaQabulQilindi: "Test qabul qilindi. Natijani o'qituvchingiz e'lon qiladi.",
      menyugaQaytish: "Menyuga qaytish",
      belgilash: "Keyin qaytaman",
      yakunlash: "Yakunlash",
      savolRaqami: (joriy, jami) => `Savol ${joriy}/${jami}`,
      oflaynXabari: "Internet yo'q — javoblaringiz saqlanmoqda, ulanish tiklanganda yuboriladi",
      bahoLabel: (baho) => `baho ${baho}`,
    },
    organish: {
      nazariya: "Nazariya",
      misol: "Misol",
      oziniTekshirish: "O'z-o'zini tekshirish",
      yakun: "Yakun",
      togri: "To'g'ri!",
      notogri: "Noto'g'ri",
      togriJavobEdi: (harf) => `To'g'ri javob: ${harf}`,
      mavzuOrganildi: "Mavzu o'rganildi deb belgilandi!",
      materialYoq: "Bu bosqich uchun material hali qo'shilmagan",
    },
    mashq: {
      sarlavha: "Mashq qilish",
      fanTanlash: "Fan tanlang",
      mavzuTanlash: "Mavzu (ixtiyoriy — bo'sh qoldirsangiz barcha mavzulardan)",
      aralash: "Barcha mavzulardan aralash",
      boshlash: "Boshlash",
      hisob: (togri, jami) => `To'g'ri: ${togri}/${jami}`,
      keyingiSavol: "Keyingi savol",
      toxtatish: "To'xtatish",
      xatolarniQaytarish: "Xato qilgan savollarni qayta ishlash",
      savolYoq: "Bu tanlov uchun savol topilmadi",
      sessiyaYakunlandi: "Mashq yakunlandi",
    },
  },
};
