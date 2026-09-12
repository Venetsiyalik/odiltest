/**
 * Bu sahifa amalda hech qachon ko'rinmaydi: middleware.ts har bir so'rovni
 * host'iga qarab /admin yoki /talaba ostiga rewrite qiladi. Faqat middleware
 * ishlamay qolgan holat uchun fallback.
 */
export default function RootFallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8 text-center">
      <p className="text-lg text-muted-foreground">Odil School</p>
    </main>
  );
}
