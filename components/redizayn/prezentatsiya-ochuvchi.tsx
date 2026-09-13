"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Tugma } from "@/components/redizayn/tugma";
import { useMatnlar } from "@/components/student/matnlar-provideri";

// Og'ir (pdfjs-dist yuklaydigan) ko'ruvchi faqat "Boshlash" bosilganda,
// faqat brauzerda yuklanadi — boshqa material turlarini ko'rayotgan
// talabaning bundle hajmiga ta'sir qilmasin.
const PrezentatsiyaKorish = dynamic(
  () => import("@/components/redizayn/prezentatsiya-korish").then((modul) => modul.PrezentatsiyaKorish),
  { ssr: false },
);

export function PrezentatsiyaOchuvchi({ faylUrl, sarlavha }: { faylUrl: string; sarlavha: string }) {
  const { matnlar } = useMatnlar();
  const [ochiq, setOchiq] = useState(false);

  return (
    <>
      <Tugma rang="accent" onClick={() => setOchiq(true)}>
        📊 {matnlar.talaba.prezentatsiya.boshlash}
      </Tugma>
      {ochiq && <PrezentatsiyaKorish faylUrl={faylUrl} sarlavha={sarlavha} onChiqish={() => setOchiq(false)} />}
    </>
  );
}
