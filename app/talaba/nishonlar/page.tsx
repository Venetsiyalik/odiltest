import { redirect } from "next/navigation";
import Link from "next/link";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { oquvchiHolatiniOl, oquvchiNishonlariniOl } from "@/lib/redizayn/gamifikatsiya";
import { theme } from "@/lib/theme";
import { Karta } from "@/components/redizayn/karta";
import { AvatarTanlagich } from "@/components/redizayn/avatar-tanlagich";

export default async function NishonlarSahifasi() {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) redirect("/kirish");

  const [holat, nishonlar] = await Promise.all([
    oquvchiHolatiniOl(oquvchi.id),
    oquvchiNishonlariniOl(oquvchi.id),
  ]);

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
      <div className="mx-auto flex max-w-3xl flex-col gap-8 p-6 pb-16 sm:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[36px] font-extrabold" style={{ color: theme.colors.primary }}>
            Nishonlarim
          </h1>
          <Link href="/menyu" className="text-[16px] underline" style={{ color: theme.colors.muted }}>
            Orqaga
          </Link>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px] font-bold">Avatar</h2>
          <Karta>
            <AvatarTanlagich joriyAvatar={holat.avatar} jamiXp={holat.jamiXp} />
          </Karta>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px] font-bold">
            Nishonlar ({nishonlar.filter((n) => n.olinganmi).length}/{nishonlar.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {nishonlar.map((nishon) => (
              <Karta
                key={nishon.kod}
                className="flex flex-col items-center gap-1 py-5 text-center"
                style={{ opacity: nishon.olinganmi ? 1 : 0.45 }}
              >
                <span className="text-4xl">{nishon.olinganmi ? nishon.ikonka : "🔒"}</span>
                <p className="text-sm font-bold">{nishon.nomi}</p>
                <p className="text-xs" style={{ color: theme.colors.muted }}>
                  {nishon.tavsif}
                </p>
              </Karta>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
