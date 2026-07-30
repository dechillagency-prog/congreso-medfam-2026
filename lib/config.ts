import { createClient } from "@/lib/supabase/server";

/**
 * Lee un valor de la tabla `configuraciones` (lectura pública vía RLS).
 * Uso: const cupo = await getConfiguracion<number>("cupo_maximo", 300);
 */
export async function getConfiguracion<T = unknown>(clave: string, fallback: T): Promise<T> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("configuraciones")
    .select("valor")
    .eq("clave", clave)
    .maybeSingle();

  return (data?.valor as T) ?? fallback;
}
