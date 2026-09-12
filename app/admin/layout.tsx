import { Toaster } from "@/components/ui/sonner";
import { AdminNav } from "@/components/admin/admin-nav";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";

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
