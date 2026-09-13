import { IdleGuard } from "@/components/student/idle-guard";
import { SwRegister } from "@/components/student/sw-register";
import { SinfRejimiInit } from "@/components/student/sinf-rejimi-init";

export default function TalabaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <IdleGuard />
      <SwRegister />
      <SinfRejimiInit />
      {children}
    </div>
  );
}
