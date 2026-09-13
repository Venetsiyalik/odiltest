import { joriyMatnlarniOlish } from "@/lib/i18n/joriy-til";

export default async function OflaynPage() {
  const matnlar = await joriyMatnlarniOlish();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="text-6xl">📡</span>
      <h1 className="text-3xl font-semibold">{matnlar.talaba.offline.sarlavha}</h1>
      <p className="max-w-md text-xl text-muted-foreground">{matnlar.talaba.offline.matn}</p>
    </main>
  );
}
