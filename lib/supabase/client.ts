import { createBrowserClient } from "@supabase/ssr";

/**
 * Brauzer tomonida ishlatiladigan Supabase klienti (anon key bilan, RLS ostida).
 * Faqat "use client" komponentlarda chaqirilsin.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
