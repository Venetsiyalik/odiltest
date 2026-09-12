export function TezOrada({ boUlim }: { boUlim: string }) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-2 p-8">
      <h1 className="text-2xl font-semibold">{boUlim}</h1>
      <p className="text-muted-foreground">
        Bu bo&apos;lim keyingi bosqichlarda tayyor bo&apos;ladi.
      </p>
    </main>
  );
}
