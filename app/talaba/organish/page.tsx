import { redirect } from "next/navigation";
import Link from "next/link";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { fanlarProgressBilanOl } from "@/lib/talaba/organish";
import { uz } from "@/lib/i18n/uz";

export default async function OrganishPage() {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) redirect("/kirish");

  const fanlar = await fanlarProgressBilanOl(oquvchi.sinfId, oquvchi.id);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">{uz.talaba.menyu.organish}</h1>
        <Link href="/menyu" className="text-lg text-muted-foreground underline">
          {uz.umumiy.orqaga}
        </Link>
      </div>

      {fanlar.length === 0 && (
        <p className="text-xl text-muted-foreground">Hozircha fan mavjud emas</p>
      )}

      <div className="flex flex-col gap-4">
        {fanlar.map((fan) => {
          const foiz = fan.jamiMavzu > 0 ? Math.round((fan.organilganMavzu / fan.jamiMavzu) * 100) : 0;
          return (
            <Link
              key={fan.fanId}
              href={`/organish/${fan.fanId}`}
              className="flex flex-col gap-3 rounded-2xl border-2 border-border p-6 active:bg-muted"
            >
              <span className="text-2xl font-semibold">{fan.fanNomi}</span>
              <span className="text-lg text-muted-foreground">
                {fan.jamiMavzu} mavzudan {fan.organilganMavzu} tasi o&apos;rganildi
              </span>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${foiz}%` }} />
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
