import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

/**
 * Cliente de Supabase para usar en Server Components, Route Handlers y Server Actions.
 * Usa la sesión del usuario (cookies) — respeta Row Level Security.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // set() puede lanzar error si se llama desde un Server Component.
            // Se ignora si hay middleware refrescando la sesión.
          }
        },
      },
    }
  );
}

/**
 * Cliente con service_role — SOLO para operaciones administrativas server-side
 * que deben saltarse RLS a propósito (p. ej. export CSV masivo, tareas batch).
 * Nunca exponer al cliente. La mayoría de las acciones de admin NO necesitan
 * esto: las funciones security definer (aprobar_registro, etc.) ya cubren
 * los casos comunes usando el cliente normal + sesión del usuario.
 */
export async function createAdminClient() {
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
