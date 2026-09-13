import { Logo } from "@/components/ui/Logo";

/**
 * Bu sahifa amalda hech qachon ko'rinmaydi: middleware.ts har bir so'rovni
 * host'iga qarab /admin yoki /talaba ostiga rewrite qiladi. Faqat middleware
 * ishlamay qolgan holat uchun fallback.
 */
export default function RootFallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8 text-center">
      <Logo size="lg" withText priority />
    </main>
  );
}
