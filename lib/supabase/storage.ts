import { createAdminClient, createClient } from "@/lib/supabase/server";

const EXPIRACION_SEGUNDOS = 300;
const MAX_IMAGEN_BYTES = 5 * 1024 * 1024;
const TIPOS_IMAGEN_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

export type BucketImagenPublica = "ponentes" | "patrocinadores";

export type SubirImagenResult = { success: true; url: string } | { success: false; message: string };

/**
 * Sube una imagen a un bucket público de Storage (ponentes | patrocinadores)
 * usando el cliente con sesión del usuario — las policies de RLS de ese
 * bucket exigen is_admin(), así que Postgres rechaza la subida si quien
 * llama no es un admin autenticado. No usa createAdminClient(): no hace
 * falta saltarse RLS para esto.
 */
export async function subirImagenAdmin(
  bucket: BucketImagenPublica,
  file: File | null
): Promise<SubirImagenResult> {
  if (!file || file.size === 0) {
    return { success: false, message: "Selecciona una imagen." };
  }
  if (file.size > MAX_IMAGEN_BYTES) {
    return { success: false, message: "La imagen no debe exceder 5MB." };
  }
  if (!TIPOS_IMAGEN_PERMITIDOS.includes(file.type)) {
    return { success: false, message: "Formato no permitido (usa JPG, PNG o WEBP)." };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
  if (error) {
    return { success: false, message: error.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}

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

/**
 * Genera una URL firmada temporal para una Carta Federada almacenada
 * en el bucket privado "cartas-federadas". Mismo patrón que
 * `getComprobanteSignedUrl`.
 */
export async function getCartaFederadaSignedUrl(
  storagePath: string
): Promise<string | null> {
  if (!storagePath) {
    return null;
  }

  const supabase = await createAdminClient();

  const { data, error } = await supabase.storage
    .from("cartas-federadas")
    .createSignedUrl(storagePath, EXPIRACION_SEGUNDOS);

  if (error) {
    console.error(
      "No se pudo generar la URL firmada de la Carta Federada:",
      error
    );

    return null;
  }

  return data?.signedUrl ?? null;
}