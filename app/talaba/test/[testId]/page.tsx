import { redirect, notFound } from "next/navigation";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { oquvchiUrinishlarSoni, faolUrinishniTopish } from "@/lib/talaba/testlar";
import { TestBoshlashTugmasi } from "@/components/student/test-boshlash-tugmasi";
import { uz } from "@/lib/i18n/uz";
import { theme } from "@/lib/theme";
import { Karta } from "@/components/redizayn/karta";
import { Belgi } from "@/components/redizayn/belgi";

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
    <main
      className="flex min-h-screen items-center justify-center p-6"
      style={{
        background: theme.colors.bg,
        backgroundImage: "url(/naqsh.svg)",
        backgroundRepeat: "repeat",
        color: theme.colors.text,
        fontFamily: "var(--font-nunito), sans-serif",
      }}
    >
      <Karta className="flex w-full max-w-xl flex-col items-center gap-6 p-10 text-center">
        <h1 className="text-[32px] font-extrabold sm:text-[40px]" style={{ color: theme.colors.primary }}>
          {test.nomi}
        </h1>
        <div className="flex flex-col gap-2 text-[20px]" style={{ color: theme.colors.muted }}>
          <p>{test.fanlar?.nomi}</p>
          <p>{uz.talaba.test.savolSoni(test.savol_soni)}</p>
          <p>{uz.talaba.test.vaqt(test.vaqt_daqiqa)}</p>
        </div>
        <Belgi rang={faolUrinishId ? theme.colors.accent : tugagan ? theme.colors.muted : theme.colors.primary}>
          {faolUrinishId
            ? uz.talaba.test.davomEttirish
            : tugagan
              ? uz.talaba.test.urinishTugadi
              : uz.talaba.test.urinishQoldi(qoldi)}
        </Belgi>

        {!tugagan && (
          <div className="w-full max-w-sm">
            <TestBoshlashTugmasi testId={test.id} />
          </div>
        )}
      </Karta>
    </main>
  );
}
