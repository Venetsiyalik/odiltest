import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { mavzularProgressBilanOl } from "@/lib/talaba/organish";
import { createServiceRoleClient } from "@/lib/supabase/server";

export default async function FanMavzulariPage({
  params,
}: {
  params: Promise<{ fanId: string }>;
}) {
  const oquvchi = await joriyOquvchiniOl();
  if (!oquvchi) redirect("/kirish");

  const { fanId } = await params;
  const fanIdRaqami = Number(fanId);
  if (!Number.isInteger(fanIdRaqami)) notFound();

  const supabase = createServiceRoleClient();
  const { data: fan } = await supabase.from("fanlar").select("nomi").eq("id", fanIdRaqami).maybeSingle();
  if (!fan) notFound();

  const mavzular = await mavzularProgressBilanOl(fanIdRaqami, oquvchi.sinfId, oquvchi.id);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">{fan.nomi}</h1>
        <Link href="/organish" className="text-lg text-muted-foreground underline">
          Orqaga
        </Link>
      </div>

      {mavzular.length === 0 && (
        <p className="text-xl text-muted-foreground">Bu fan uchun hali mavzu yo&apos;q</p>
      )}

      <div className="flex flex-col gap-3">
        {mavzular.map((mavzu) => (
          <Link
            key={mavzu.mavzuId}
            href={`/organish/${fanIdRaqami}/${mavzu.mavzuId}`}
            className="flex items-center justify-between gap-3 rounded-2xl border-2 border-border p-6 active:bg-muted"
          >
            <span className="text-xl font-medium">{mavzu.nomi}</span>
            {mavzu.organildimi && <span className="text-2xl text-primary">✓</span>}
          </Link>
        ))}
      </div>
    </main>
  );
}
