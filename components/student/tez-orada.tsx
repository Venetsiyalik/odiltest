import { joriyMatnlarniOlish } from "@/lib/i18n/joriy-til";

export async function TezOrada({ boUlim }: { boUlim: string }) {
  const matnlar = await joriyMatnlarniOlish();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-3xl font-semibold">{boUlim}</h1>
      <p className="text-lg text-muted-foreground">{matnlar.talaba.tezOrada.matn}</p>
    </main>
  );
}
