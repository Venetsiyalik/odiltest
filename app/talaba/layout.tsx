import { IdleGuard } from "@/components/student/idle-guard";

export default function TalabaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <IdleGuard />
      {children}
    </div>
  );
}
