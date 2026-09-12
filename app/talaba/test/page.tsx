import { redirect } from "next/navigation";
import Link from "next/link";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { mavjudTestlarniOl, oquvchiUrinishlarSoni, faolUrinishniTopish } from "@/lib/talaba/testlar";
import { uz } from "@/lib/i18n/uz";

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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">{uz.talaba.test.royxatSarlavha}</h1>
        <Link href="/menyu" className="text-lg text-muted-foreground underline">
          {uz.umumiy.orqaga}
        </Link>
      </div>

      {testlarBilanHolat.length === 0 && (
        <p className="text-xl text-muted-foreground">{uz.talaba.test.testYoq}</p>
      )}

      <div className="flex flex-col gap-4">
        {testlarBilanHolat.map(({ test, urinishSoni, faolUrinishId }) => {
          const qoldi = test.urinishlar_soni - urinishSoni;
          const tugagan = qoldi <= 0 && !faolUrinishId;

          return (
            <Link
              key={test.id}
              href={`/test/${test.id}`}
              className="flex flex-col gap-2 rounded-2xl border-2 border-border p-6 active:bg-muted"
            >
              <span className="text-2xl font-semibold">{test.nomi}</span>
              <span className="text-lg text-muted-foreground">
                {test.fanlar?.nomi} · {uz.talaba.test.savolSoni(test.savol_soni)} ·{" "}
                {uz.talaba.test.vaqt(test.vaqt_daqiqa)}
              </span>
              <span className="text-lg font-medium">
                {faolUrinishId
                  ? uz.talaba.test.davomEttirish
                  : tugagan
                    ? uz.talaba.test.urinishTugadi
                    : uz.talaba.test.urinishQoldi(qoldi)}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
