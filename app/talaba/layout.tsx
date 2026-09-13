import { IdleGuard } from "@/components/student/idle-guard";
import { SwRegister } from "@/components/student/sw-register";
import { SinfRejimiInit } from "@/components/student/sinf-rejimi-init";
import { joriyOquvchiniOl } from "@/lib/auth/student";

export default async function TalabaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // REDIZAYN.md 3-bo'lim: Dashboard va mavzu ko'rish endi kodsiz mehmonga
  // ham ochiq, shuning uchun 3-daqiqalik kiosk avto-chiqish faqat haqiqiy
  // sessiya bo'lsa ishga tushishi kerak.
  const oquvchi = await joriyOquvchiniOl();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <IdleGuard faolmi={Boolean(oquvchi)} />
      <SwRegister />
      <SinfRejimiInit />
      {children}
    </div>
  );
}
