import Link from "next/link";
import { uz } from "@/lib/i18n/uz";

export function TestNatijasi({
  natijaKorsat,
  togriSoni,
  jamiSavol,
  ballFoiz,
  baho,
  vaqtTugaganmi,
}: {
  natijaKorsat: boolean;
  togriSoni: number;
  jamiSavol: number;
  ballFoiz: number;
  baho: number;
  vaqtTugaganmi: boolean;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      {vaqtTugaganmi && (
        <p className="text-2xl font-medium text-destructive">{uz.talaba.test.vaqtTugadi}</p>
      )}
      {natijaKorsat ? (
        <>
          <p className="text-6xl font-bold">
            {togriSoni}/{jamiSavol}
          </p>
          <p className="text-3xl text-muted-foreground">
            {ballFoiz}% · baho {baho}
          </p>
        </>
      ) : (
        <p className="max-w-md text-2xl">{uz.talaba.test.natijaQabulQilindi}</p>
      )}
      <Link
        href="/menyu"
        className="mt-6 min-h-20 rounded-2xl bg-primary px-10 py-5 text-2xl font-semibold text-primary-foreground active:opacity-80"
      >
        {uz.talaba.test.menyugaQaytish}
      </Link>
    </main>
  );
}
