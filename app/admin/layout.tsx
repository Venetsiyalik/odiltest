import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { AdminNav } from "@/components/admin/admin-nav";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";

// Admin panel hech qachon qidiruv tizimlarida ko'rinmasin (login sahifasi
// ham) — `app/robots.ts` butun `admin.` subdomenini disallow qiladi, bu
// ikkinchi qatlam sifatida qo'shiladi (agar biror sahifa baribir
// so'rovga tushib qolsa ham, `noindex` meta tegi orqali kafolatlanadi).
export const metadata: Metadata = {
  title: "Boshqaruv paneli",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();

  return (
    <div className="min-h-screen bg-muted/30">
      {foydalanuvchi && (
        <AdminNav ismFamiliya={foydalanuvchi.ismFamiliya} rol={foydalanuvchi.rol} />
      )}
      {children}
      <Toaster />
    </div>
  );
}
