import { notFound } from "next/navigation";
import Link from "next/link";
import { testniOl } from "@/lib/actions/testlar";
import { jonliKuzatishniOl } from "@/lib/actions/kuzatish";
import { KuzatishClient } from "@/components/admin/kuzatish-client";

export default async function KuzatishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testId = Number(id);
  if (!Number.isInteger(testId)) notFound();

  const test = await testniOl(testId);
  if (!test) notFound();

  const boshlangich = await jonliKuzatishniOl(testId);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{test.nomi}</h1>
          <p className="text-sm text-muted-foreground">
            {test.fanlar?.nomi} · {test.sinflar?.nomi}
          </p>
        </div>
        <Link href="/testlar" className="text-sm text-muted-foreground underline">
          Orqaga
        </Link>
      </div>

      <KuzatishClient testId={testId} boshlangich={boshlangich} />
    </main>
  );
}
