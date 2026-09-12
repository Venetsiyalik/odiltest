import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Server komponent/route handler ichida ishlatiladigan Supabase klienti
 * (anon key, RLS ostida — o'qituvchi/admin sessiyasi cookie orqali).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server komponent ichidan chaqirilganda cookie yozib bo'lmaydi —
            // bu middleware orqali sessiya yangilanganda muammo emas.
          }
        },
      },
    },
  );
}

/**
 * `service_role` kaliti bilan ishlaydigan klient — RLS'ni chetlab o'tadi.
 * FAQAT server tomonidagi ishonchli amallar uchun (masalan o'quvchi urinishini
 * yozish). Hech qachon klient komponentga yoki javobga chiqarilmasin.
 */
export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
