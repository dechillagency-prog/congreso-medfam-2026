import { createAdminClient } from "@/lib/supabase/server";

const EXPIRACION_SEGUNDOS = 300;

/**
 * Genera una URL firmada temporal para un comprobante
 * almacenado en el bucket privado "comprobantes".
 *
 * Esta función corre únicamente del lado del servidor y usa
 * el cliente administrativo para evitar bloqueos por RLS.
 */
export async function getComprobanteSignedUrl(
  storagePath: string
): Promise<string | null> {
  if (!storagePath) {
    return null;
  }

  const supabase = await createAdminClient();

  const { data, error } = await supabase.storage
    .from("comprobantes")
    .createSignedUrl(storagePath, EXPIRACION_SEGUNDOS);

  if (error) {
    console.error(
      "No se pudo generar la URL firmada del comprobante:",
      error
    );

    return null;
  }

  return data?.signedUrl ?? null;
}