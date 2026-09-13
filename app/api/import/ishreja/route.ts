import { NextResponse } from "next/server";
import { z } from "zod";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { sinfDarajasi } from "@/lib/redizayn/daraja";
import type { IshrejaFaylNatijasi, IshrejaImportNatijasi, IshrejaImportSorovi } from "@/lib/ishreja/types";

// ishreja-import.md 7-bo'lim: faqat admin roli.
const qatorSxemasi = z.object({
  tartib: z.number().int(),
  nomi: z.string().min(1),
  turi: z.enum(["mavzu", "baholash", "takrorlash", "amaliy"]),
  ball: z.number().int().nullable(),
  uygaVazifa: z.string().nullable(),
});

const faylSxemasi = z.object({
  faylNomi: z.string().min(1),
  daraja: z.number().int().min(1).max(11),
  fanId: z.number().int().positive().nullable(),
  yangiFanNomi: z.string().nullable(),
  chorak: z.number().int().min(1).max(4).nullable(),
  oquvYili: z.string().nullable(),
  amal: z.enum(["yozish", "almashtirish", "otkazib-yuborish"]),
  qatorlar: z.array(qatorSxemasi),
});

const sorovSxemasi = z.object({
  fayllar: z.array(faylSxemasi).min(1).max(100),
});

/** Bir xil (chorak, oquv_yili, nomi) kalitini solishtirish uchun. */
function qatorKaliti(chorak: number | null, oquvYili: string | null, nomi: string): string {
  return `${chorak ?? ""}|${oquvYili ?? ""}|${nomi.trim().toLowerCase()}`;
}

export async function POST(so_rov: Request): Promise<NextResponse<IshrejaImportNatijasi>> {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi || foydalanuvchi.rol !== "admin") {
    return NextResponse.json({ xato: "Ruxsat yo'q", fayllar: [], jamiMavzu: 0 }, { status: 401 });
  }

  const xomTana = await so_rov.json().catch(() => null);
  const tekshiruv = sorovSxemasi.safeParse(xomTana);
  if (!tekshiruv.success) {
    return NextResponse.json(
      { xato: tekshiruv.error.issues[0].message, fayllar: [], jamiMavzu: 0 },
      { status: 400 },
    );
  }
  const { fayllar }: IshrejaImportSorovi = tekshiruv.data;

  const supabase = await createClient();
  const { data: sinflar } = await supabase.from("sinflar").select("id, nomi");
  const sinflarRoyxati = sinflar ?? [];

  const fanKeshi = new Map<string, number>(); // yangiFanNomi (kichik harf) -> id
  // Ushbu so'rov davomida yangi yaratilgan, lekin hali birorta mavzu
  // yozilmagan fanlar — agar shu faylning o'zi xato bilan tugasa, orqaga
  // qaytariladi (fan yaratilib, lekin mavzu yozilmay qolib ketmasligi
  // uchun — "hech qanday holatda tasdiqsiz bazaga yozilmasin", 5-bo'lim).
  const orqagaQaytariladiganFanlar = new Map<number, string>(); // fanId -> keshKaliti
  const faylNatijalari: IshrejaFaylNatijasi[] = [];
  let jamiMavzu = 0;

  for (const fayl of fayllar) {
    if (fayl.amal === "otkazib-yuborish") {
      faylNatijalari.push({ faylNomi: fayl.faylNomi, holati: "otkazib-yuborildi", qoshildiSoni: 0 });
      continue;
    }

    let shuFaylYaratganFanId: number | null = null;

    try {
      // 1) Fan aniqlash — mavjud yoki yangi yaratish.
      let fanId = fayl.fanId;
      if (!fanId) {
        const nomi = fayl.yangiFanNomi?.trim();
        if (!nomi) throw new Error("fan aniqlanmadi");
        const keshKaliti = nomi.toLowerCase();
        const keshdagi = fanKeshi.get(keshKaliti);
        if (keshdagi) {
          fanId = keshdagi;
        } else {
          const { data: mavjudFan } = await supabase
            .from("fanlar")
            .select("id")
            .ilike("nomi", nomi)
            .maybeSingle();
          let topilganFanId: number;
          if (mavjudFan) {
            topilganFanId = mavjudFan.id;
          } else {
            const { data: yangiFan, error: fanXatosi } = await supabase
              .from("fanlar")
              .insert({ nomi })
              .select("id")
              .single();
            if (fanXatosi) throw new Error(fanXatosi.message);
            topilganFanId = yangiFan.id;
            shuFaylYaratganFanId = topilganFanId;
            orqagaQaytariladiganFanlar.set(topilganFanId, keshKaliti);
          }
          fanId = topilganFanId;
          fanKeshi.set(keshKaliti, topilganFanId);
        }
      }

      // 2) Daraja mos sinf-guruhlarini topish.
      const mosSinflar = sinflarRoyxati.filter((s) => sinfDarajasi(s.nomi) === fayl.daraja);
      if (mosSinflar.length === 0) {
        throw new Error(`${fayl.daraja}-sinf uchun sinf-guruh topilmadi`);
      }

      let qoshildiSoni = 0;
      for (const sinf of mosSinflar) {
        if (fayl.amal === "almashtirish") {
          await supabase
            .from("mavzular")
            .delete()
            .eq("fan_id", fanId)
            .eq("sinf_id", sinf.id)
            .eq("chorak", fayl.chorak)
            .eq("oquv_yili", fayl.oquvYili ?? "");
        }

        const { data: mavjudMavzular } = await supabase
          .from("mavzular")
          .select("nomi, chorak, oquv_yili")
          .eq("fan_id", fanId)
          .eq("sinf_id", sinf.id);

        const mavjudKalitlar = new Set(
          (mavjudMavzular ?? []).map((m) => qatorKaliti(m.chorak, m.oquv_yili, m.nomi)),
        );

        const yangiQatorlar: typeof fayl.qatorlar = [];
        for (const qator of fayl.qatorlar) {
          const kalit = qatorKaliti(fayl.chorak, fayl.oquvYili, qator.nomi);
          if (mavjudKalitlar.has(kalit)) continue; // 4.3-band: takroriy mavzu o'tkazib yuboriladi
          mavjudKalitlar.add(kalit);
          yangiQatorlar.push(qator);
        }

        if (yangiQatorlar.length === 0) continue;

        const { error: yozishXatosi } = await supabase.from("mavzular").insert(
          yangiQatorlar.map((q) => ({
            fan_id: fanId,
            sinf_id: sinf.id,
            nomi: q.nomi,
            tartib: q.tartib,
            turi: q.turi,
            ball: q.ball,
            uyga_vazifa: q.uygaVazifa,
            chorak: fayl.chorak,
            oquv_yili: fayl.oquvYili,
            bolim: fayl.chorak ? `${fayl.chorak}-chorak` : null,
            manba_fayl: fayl.faylNomi,
          })),
        );
        if (yozishXatosi) throw new Error(yozishXatosi.message);
        qoshildiSoni += yangiQatorlar.length;
      }

      // Kamida bitta mavzu yozilgan bo'lsa, bu fanni endi orqaga qaytarish
      // shart emas — boshqa fayl (kelajakda xato bersa ham) uni buzmaydi.
      if (qoshildiSoni > 0 && fanId != null) {
        orqagaQaytariladiganFanlar.delete(fanId);
      }

      await supabase.from("importlar").insert({
        foydalanuvchi_id: foydalanuvchi.id,
        fayl_nomi: fayl.faylNomi,
        turi: "ishreja",
        jami: fayl.qatorlar.length,
        qabul_qilindi: qoshildiSoni,
        xato_soni: 0,
      });

      faylNatijalari.push({
        faylNomi: fayl.faylNomi,
        holati: "muvaffaqiyatli",
        qoshildiSoni,
      });
      jamiMavzu += qoshildiSoni;
    } catch (xatoObyekti) {
      const xabar = xatoObyekti instanceof Error ? xatoObyekti.message : "noma'lum xato";

      // Shu fayl yangi fan yaratgan, lekin unga birorta ham mavzu
      // yozilmagan bo'lsa — fanni orqaga qaytarish (aks holda foydalanuvchi
      // xato ko'radi-yu, bazada "egasiz" fan qolib ketadi).
      if (shuFaylYaratganFanId != null && orqagaQaytariladiganFanlar.has(shuFaylYaratganFanId)) {
        const keshKaliti = orqagaQaytariladiganFanlar.get(shuFaylYaratganFanId)!;
        await supabase.from("fanlar").delete().eq("id", shuFaylYaratganFanId);
        fanKeshi.delete(keshKaliti);
        orqagaQaytariladiganFanlar.delete(shuFaylYaratganFanId);
      }

      await supabase.from("importlar").insert({
        foydalanuvchi_id: foydalanuvchi.id,
        fayl_nomi: fayl.faylNomi,
        turi: "ishreja",
        jami: fayl.qatorlar.length,
        qabul_qilindi: 0,
        xato_soni: 1,
        xatolar: [{ xabar }],
      });
      faylNatijalari.push({ faylNomi: fayl.faylNomi, holati: "xato", qoshildiSoni: 0, xabar });
    }
  }

  return NextResponse.json({ fayllar: faylNatijalari, jamiMavzu });
}
