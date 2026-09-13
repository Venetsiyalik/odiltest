import { Logo } from "@/components/ui/Logo";

/**
 * Bo'sh holat / yuklanish ekrani — logotip 20% shaffoflik va sekin
 * "nafas olish" animatsiyasi bilan (`.logo-nafas`, `app/globals.css`).
 * `app/talaba/loading.tsx` va `app/admin/loading.tsx` (Next.js marshrut
 * segmenti yuklanish konvensiyasi) orqali ishlatiladi.
 */
export function YuklanmoqdaEkrani() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="logo-nafas" style={{ opacity: 0.2 }}>
        <Logo size="lg" />
      </div>
    </main>
  );
}
