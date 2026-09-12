import { redirect, notFound } from "next/navigation";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { oquvchiUrinishlarSoni, faolUrinishniTopish } from "@/lib/talaba/testlar";
import { TestBoshlashTugmasi } from "@/components/student/test-boshlash-tugmasi";
import { uz } from "@/lib/i18n/uz";

export default async function TestOgohlantirishPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) redirect("/kirish");

  const { testId } = await params;
  const testIdRaqami = Number(testId);
  if (!Number.isInteger(testIdRaqami)) notFound();

  const supabase = createServiceRoleClient();
  const { data: test } = await supabase
    .from("testlar")
    .select("id, nomi, sinf_id, savol_soni, vaqt_daqiqa, urinishlar_soni, holati, fanlar(nomi)")
    .eq("id", testIdRaqami)
    .maybeSingle<{
      id: number;
      nomi: string;
      sinf_id: number;
      savol_soni: number;
      vaqt_daqiqa: number;
      urinishlar_soni: number;
      holati: string;
      fanlar: { nomi: string } | null;
    }>();

  if (!test || test.sinf_id !== oquvchi.sinfId || test.holati !== "faol") {
    notFound();
  }

  const [urinishSoni, faolUrinishId] = await Promise.all([
    oquvchiUrinishlarSoni(oquvchi.id, test.id),
    faolUrinishniTopish(oquvchi.id, test.id),
  ]);
  const qoldi = test.urinishlar_soni - urinishSoni;
  const tugagan = qoldi <= 0 && !faolUrinishId;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-8 p-8 text-center">
      <h1 className="text-3xl font-semibold sm:text-4xl">{test.nomi}</h1>
      <div className="flex flex-col gap-2 text-xl text-muted-foreground">
        <p>{test.fanlar?.nomi}</p>
        <p>{uz.talaba.test.savolSoni(test.savol_soni)}</p>
        <p>{uz.talaba.test.vaqt(test.vaqt_daqiqa)}</p>
        <p>
          {faolUrinishId
            ? uz.talaba.test.davomEttirish
            : tugagan
              ? uz.talaba.test.urinishTugadi
              : uz.talaba.test.urinishQoldi(qoldi)}
        </p>
      </div>

      {!tugagan && (
        <div className="w-full max-w-sm">
          <TestBoshlashTugmasi testId={test.id} />
        </div>
      )}
    </main>
  );
}
