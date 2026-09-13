import { IdleGuard } from "@/components/student/idle-guard";
import { SwRegister } from "@/components/student/sw-register";
import { SinfRejimiInit } from "@/components/student/sinf-rejimi-init";
import { Footer } from "@/components/ui/Footer";
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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <IdleGuard faolmi={Boolean(oquvchi)} />
      <SwRegister />
      <SinfRejimiInit />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
