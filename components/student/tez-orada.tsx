export function TezOrada({ boUlim }: { boUlim: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-3xl font-semibold">{boUlim}</h1>
      <p className="text-lg text-muted-foreground">
        Bu bo&apos;lim keyingi bosqichlarda tayyor bo&apos;ladi.
      </p>
    </main>
  );
}
