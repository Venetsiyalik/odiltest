/**
 * Prezentatsiya ko'ruvchi ochiq/yopiqligini butun ilova bo'ylab e'lon
 * qilish uchun yengil hodisa (REDIZAYN.md 4.1-band: "Prezentatsiya
 * rejimida avtomatik chiqish taymeri o'chadi"). `IdleGuard`
 * (components/student/idle-guard.tsx) buni tinglab, 3 daqiqalik kiosk
 * avto-chiqish taymerini vaqtincha to'xtatadi — chunki o'qituvchi
 * darsda uzoq vaqt ekranga tegmasligi mumkin.
 */
const HODISA_NOMI = "odil:prezentatsiya-holati";

export function prezentatsiyaHolatiniElonQilish(ochiqmi: boolean): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<boolean>(HODISA_NOMI, { detail: ochiqmi }));
}

export function prezentatsiyaHolatiniTinglash(qayta_chaqiruv: (ochiqmi: boolean) => void): () => void {
  function tinglovchi(hodisa: Event) {
    qayta_chaqiruv(Boolean((hodisa as CustomEvent<boolean>).detail));
  }
  window.addEventListener(HODISA_NOMI, tinglovchi);
  return () => window.removeEventListener(HODISA_NOMI, tinglovchi);
}
