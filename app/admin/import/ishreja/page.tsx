import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { IshrejaImportClient } from "@/components/admin/ishreja-import-client";

export default async function IshrejaImportPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");
  if (foydalanuvchi.rol !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const [{ data: fanlar }, { data: sinflar }, { data: mavjudMavzular }] = await Promise.all([
    supabase.from("fanlar").select("id, nomi").order("nomi"),
    supabase.from("sinflar").select("id, nomi"),
    supabase.from("mavzular").select("fan_id, sinf_id, chorak, oquv_yili"),
  ]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Ish rejani ommaviy import qilish</h1>
        <p className="text-sm text-muted-foreground">
          E-baza ish reja Excel fayllarini sudrab tashlang — sinf, fan, chorak va o&apos;quv yili
          fayl nomidan avtomatik aniqlanadi.
        </p>
      </div>
      <IshrejaImportClient
        fanlar={fanlar ?? []}
        sinflar={sinflar ?? []}
        mavjudMavzular={mavjudMavzular ?? []}
      />
    </main>
  );
}
