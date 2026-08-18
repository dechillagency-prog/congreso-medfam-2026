import { createClient } from "@/lib/supabase/server";
import { generarCartaCongresistaPdf } from "@/lib/pdf/generar-carta";
import { formatearFechaLarga } from "@/lib/utils/fecha";

const CARTA_BUCKET = "cartas-congresista";

const TIPO_INSCRIPCION_LABEL: Record<string, string> = {
  federado: "Socio Federado",
  no_federado: "No Federado",
  residente: "Residente",
};

export interface CartaCongresistaResult {
  token: string;
  storagePath: string;
}

/**
 * Devuelve el token y la ruta en Storage de la Carta de Congresista de un
 * registro, generándola solo si todavía no existe. Nunca produce un
 * segundo PDF ni un segundo token para el mismo registro — se llama desde
 * el flujo de "confirmación por WhatsApp" (todavía no conectado a esta
 * función; eso ocurre en la Etapa C.2), que puede invocarse varias veces
 * sobre el mismo registro sin duplicar nada.
 *
 * No usa createAdminClient(): la policy de RLS de `registros` y del bucket
 * `cartas-congresista` (migración 0008) ya permiten a un admin autenticado
 * leer/escribir ambos directamente — no hace falta saltarse RLS con
 * service_role para esta operación admin-a-admin.
 *
 * El llamador es responsable de verificar que el registro ya esté
 * `estatus_pago = 'confirmado'` antes de invocar esto (por ejemplo, el
 * botón de WhatsApp ya solo se muestra en ese caso); esta función lo
 * vuelve a validar como segunda barrera de seguridad.
 */
export async function obtenerOCrearCartaCongresista(registroId: string): Promise<CartaCongresistaResult> {
  const supabase = await createClient();

  const { data: registro, error: fetchError } = await supabase
    .from("registros")
    .select("id, nombre, folio, tipo_inscripcion, estatus_pago, fecha_aprobacion, carta_token, carta_generada_en, constancia_url")
    .eq("id", registroId)
    .single();

  if (fetchError || !registro) {
    throw new Error(fetchError?.message ?? "Registro no encontrado");
  }

  if (registro.estatus_pago !== "confirmado") {
    throw new Error("Solo se puede generar la carta de un registro confirmado");
  }

  // Ya existe una carta generada y con archivo: se reutiliza, nunca se
  // regenera (evita duplicados cada vez que el admin presiona el botón).
  if (registro.carta_token && registro.carta_generada_en && registro.constancia_url) {
    return { token: registro.carta_token, storagePath: registro.constancia_url };
  }

  const pdfBuffer = await generarCartaCongresistaPdf({
    nombreCompleto: registro.nombre,
    folio: registro.folio,
    tipoInscripcion: TIPO_INSCRIPCION_LABEL[registro.tipo_inscripcion] ?? registro.tipo_inscripcion,
    fecha: formatearFechaLarga(registro.fecha_aprobacion ?? new Date().toISOString()),
  });

  const token = crypto.randomUUID();
  const storagePath = `${registro.id}/carta-congresista.pdf`;

  // 1) Subir primero. Si falla, no se toca la base de datos: el registro
  //    queda exactamente como estaba, sin quedar marcado como "generada"
  //    sin que exista un archivo real. `upsert: true` porque la ruta es
  //    determinística por registro — un reintento después de una falla a
  //    mitad de proceso debe poder sobrescribir el archivo huérfano de un
  //    intento anterior en vez de fallar por "ya existe".
  const { error: uploadError } = await supabase.storage
    .from(CARTA_BUCKET)
    .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    throw new Error(`No se pudo subir la carta a Storage: ${uploadError.message}`);
  }

  // 2) Solo si la subida fue exitosa se marca como generada, en un único
  //    UPDATE atómico (las tres columnas quedan escritas juntas o ninguna).
  //    La condición `carta_token IS NULL` protege contra una carrera: si
  //    dos llamadas concurrentes (p. ej. doble clic del admin) llegan
  //    aquí casi al mismo tiempo, solo una gana la escritura; la otra no
  //    actualiza ninguna fila y en su lugar reutiliza el token que sí
  //    quedó guardado, en vez de sobreescribirlo con un segundo token.
  const { data: actualizado, error: updateError } = await supabase
    .from("registros")
    .update({
      carta_token: token,
      carta_generada_en: new Date().toISOString(),
      constancia_url: storagePath,
    })
    .eq("id", registro.id)
    .is("carta_token", null)
    .select("carta_token, constancia_url")
    .single();

  if (updateError || !actualizado) {
    const { data: ganadorConcurrente } = await supabase
      .from("registros")
      .select("carta_token, constancia_url")
      .eq("id", registro.id)
      .single();

    if (ganadorConcurrente?.carta_token && ganadorConcurrente?.constancia_url) {
      return { token: ganadorConcurrente.carta_token, storagePath: ganadorConcurrente.constancia_url };
    }

    throw new Error(
      `La carta se subió a Storage pero no se pudo actualizar el registro: ${updateError?.message ?? "fila no encontrada"}`
    );
  }

  return { token: actualizado.carta_token!, storagePath: actualizado.constancia_url! };
}
