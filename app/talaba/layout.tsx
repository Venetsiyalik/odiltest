import { IdleGuard } from "@/components/student/idle-guard";
import { SwRegister } from "@/components/student/sw-register";
import { SinfRejimiInit } from "@/components/student/sinf-rejimi-init";
import { MatnlarProvideri } from "@/components/student/matnlar-provideri";
import { Footer } from "@/components/ui/Footer";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { joriyTilniOlish } from "@/lib/i18n/joriy-til";

export default async function TalabaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // REDIZAYN.md 3-bo'lim: Dashboard va mavzu ko'rish endi kodsiz mehmonga
  // ham ochiq, shuning uchun 3-daqiqalik kiosk avto-chiqish faqat haqiqiy
  // sessiya bo'lsa ishga tushishi kerak.
  const [oquvchi, til] = await Promise.all([joriyOquvchiniOl(), joriyTilniOlish()]);

  return (
    <MatnlarProvideri til={til}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <IdleGuard faolmi={Boolean(oquvchi)} />
        <SwRegister />
        <SinfRejimiInit />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </MatnlarProvideri>
  );
}
