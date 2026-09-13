import { redirect } from "next/navigation";
import Link from "next/link";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { mavjudTestlarniOl, oquvchiUrinishlarSoni, faolUrinishniTopish } from "@/lib/talaba/testlar";
import { uz } from "@/lib/i18n/uz";
import { theme } from "@/lib/theme";
import { Karta } from "@/components/redizayn/karta";
import { Belgi } from "@/components/redizayn/belgi";

export default async function TalabaTestRoyxatiPage() {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) redirect("/kirish");

  const testlar = await mavjudTestlarniOl(oquvchi.sinfId);

  const testlarBilanHolat = await Promise.all(
    testlar.map(async (test) => {
      const [urinishSoni, faolUrinishId] = await Promise.all([
        oquvchiUrinishlarSoni(oquvchi.id, test.id),
        faolUrinishniTopish(oquvchi.id, test.id),
      ]);
      return { test, urinishSoni, faolUrinishId };
    }),
  );

  return (
    <main
      className="min-h-screen"
      style={{
        background: theme.colors.bg,
        backgroundImage: "url(/naqsh.svg)",
        backgroundRepeat: "repeat",
        color: theme.colors.text,
        fontFamily: "var(--font-nunito), sans-serif",
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[32px] font-extrabold sm:text-[36px]" style={{ color: theme.colors.primary }}>
            {uz.talaba.test.royxatSarlavha}
          </h1>
          <Link href="/menyu" className="text-[18px] underline" style={{ color: theme.colors.muted }}>
            {uz.umumiy.orqaga}
          </Link>
        </div>

        {testlarBilanHolat.length === 0 && (
          <Karta className="py-8 text-center" style={{ color: theme.colors.muted }}>
            {uz.talaba.test.testYoq}
          </Karta>
        )}

        <div className="flex flex-col gap-4">
          {testlarBilanHolat.map(({ test, urinishSoni, faolUrinishId }) => {
            const qoldi = test.urinishlar_soni - urinishSoni;
            const tugagan = qoldi <= 0 && !faolUrinishId;

            return (
              <Link key={test.id} href={`/test/${test.id}`}>
                <Karta bosiladigan rangChizigi={theme.colors.primary} className="flex flex-col gap-2">
                  <span className="text-[22px] font-bold">{test.nomi}</span>
                  <span className="text-[16px]" style={{ color: theme.colors.muted }}>
                    {test.fanlar?.nomi} · {uz.talaba.test.savolSoni(test.savol_soni)} ·{" "}
                    {uz.talaba.test.vaqt(test.vaqt_daqiqa)}
                  </span>
                  <div>
                    <Belgi rang={faolUrinishId ? theme.colors.accent : tugagan ? theme.colors.muted : theme.colors.primary}>
                      {faolUrinishId
                        ? uz.talaba.test.davomEttirish
                        : tugagan
                          ? uz.talaba.test.urinishTugadi
                          : uz.talaba.test.urinishQoldi(qoldi)}
                    </Belgi>
                  </div>
                </Karta>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
