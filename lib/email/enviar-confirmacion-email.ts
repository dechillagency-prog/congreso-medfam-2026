import { createClient } from "@/lib/supabase/server";
import { resend, RESEND_FROM_EMAIL } from "@/lib/email/resend-client";
import { construirEmailConfirmacion } from "@/lib/email/plantilla-confirmacion";
import { CARTA_BUCKET, TIPO_INSCRIPCION_LABEL } from "@/lib/supabase/carta-congresista";
import { SITE_URL } from "@/lib/site-url";

export interface ResultadoEnvioEmail {
  /** true si ESTA llamada disparó un envío real (confirmado por Resend). */
  enviado: boolean;
  /** true si se omitió el envío porque ya existía uno exitoso previo (solo aplica al envío no forzado). */
  yaEstabaEnviado: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Construye la Idempotency-Key del primer envío (no forzado): estable por
 * registro, no por intento — a propósito, para que un reintento (doble
 * clic, o un reintento tras un UPDATE de Supabase fallido) reutilice la
 * MISMA clave. Resend reconoce la clave repetida dentro de su ventana de
 * idempotencia y devuelve el mismo resultado sin reenviar el correo — así
 * que no hace falta ningún candado adicional en la base de datos.
 */
function idempotencyKeyPrimerEnvio(registroId: string): string {
  return `confirmacion-inscripcion/${registroId}`;
}

/**
 * Idempotency-Key de un reenvío explícito: única por cada clic en
 * "Reenviar correo" — a propósito NO reutiliza la clave del primer envío,
 * porque un reenvío SÍ debe producir un correo nuevo.
 */
function idempotencyKeyReenvio(registroId: string): string {
  return `confirmacion-inscripcion/${registroId}/reenvio/${crypto.randomUUID()}`;
}

async function enviarCorreoInterno(
  registroId: string,
  opciones: { forzar: boolean }
): Promise<ResultadoEnvioEmail> {
  const supabase = await createClient();

  const { data: registro, error: fetchError } = await supabase
    .from("registros")
    .select("id, nombre, folio, correo, tipo_inscripcion, estatus_pago, carta_token, constancia_url, carta_email_enviado_en")
    .eq("id", registroId)
    .single();

  if (fetchError || !registro) {
    return { enviado: false, yaEstabaEnviado: false, error: "Registro no encontrado" };
  }

  if (registro.estatus_pago !== "confirmado") {
    return { enviado: false, yaEstabaEnviado: false, error: "El registro debe estar confirmado" };
  }

  // La carta debe existir de antes — esta función nunca la genera ni la
  // regenera, solo reutiliza lo que ya está en Storage.
  if (!registro.carta_token || !registro.constancia_url) {
    return { enviado: false, yaEstabaEnviado: false, error: "La carta de congresista aún no se ha generado" };
  }

  // Primer envío (no forzado): si ya existe uno exitoso, no se repite.
  // El botón "Reenviar correo" es la única vía para saltarse este check.
  if (!opciones.forzar && registro.carta_email_enviado_en) {
    return { enviado: false, yaEstabaEnviado: true };
  }

  // Descarga el PDF YA subido — nunca se regenera una segunda versión
  // solo para el correo; es exactamente el mismo archivo que sirve
  // /carta/[token].
  const { data: pdfBlob, error: downloadError } = await supabase.storage
    .from(CARTA_BUCKET)
    .download(registro.constancia_url);

  if (downloadError || !pdfBlob) {
    return {
      enviado: false,
      yaEstabaEnviado: false,
      error: `No se pudo obtener el PDF de la carta: ${downloadError?.message ?? "desconocido"}`,
    };
  }

  const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());
  const ligaCarta = `${SITE_URL}/carta/${registro.carta_token}`;
  const tipoInscripcionLabel = TIPO_INSCRIPCION_LABEL[registro.tipo_inscripcion] ?? registro.tipo_inscripcion;

  const { asunto, html, text } = construirEmailConfirmacion({
    nombreCompleto: registro.nombre,
    folio: registro.folio,
    tipoInscripcion: tipoInscripcionLabel,
    ligaCarta,
  });

  const idempotencyKey = opciones.forzar
    ? idempotencyKeyReenvio(registroId)
    : idempotencyKeyPrimerEnvio(registroId);

  const resultado = await resend.emails.send(
    {
      from: RESEND_FROM_EMAIL,
      to: [registro.correo],
      subject: asunto,
      html,
      text,
      attachments: [
        {
          filename: `Carta-de-Congresista-${registro.folio}.pdf`,
          content: pdfBuffer,
        },
      ],
    },
    { idempotencyKey }
  );

  // Nunca se escribe carta_email_enviado_en / carta_email_id antes de este
  // punto — si Resend falla, el registro queda exactamente como estaba:
  // sin token nuevo, sin PDF regenerado, sin marca falsa de "enviado".
  if (resultado.error) {
    return { enviado: false, yaEstabaEnviado: false, error: resultado.error.message };
  }

  const emailId = resultado.data?.id;

  const { error: updateError } = await supabase
    .from("registros")
    .update({
      carta_email_enviado_en: new Date().toISOString(),
      carta_email_id: emailId ?? null,
    })
    .eq("id", registroId);

  if (updateError) {
    // El correo SÍ se envió — no se pierde ese resultado por un error al
    // guardar el estado. Un reintento del envío no forzado reutiliza la
    // MISMA Idempotency-Key (ver idempotencyKeyPrimerEnvio), así que
    // Resend no lo duplica; el reintento simplemente vuelve a intentar
    // guardar el timestamp/ID.
    console.error("Correo enviado pero no se pudo actualizar el registro:", updateError);
    return {
      enviado: true,
      yaEstabaEnviado: false,
      emailId,
      error: "El correo se envió, pero no se pudo guardar el estado en el registro. Reintenta para corregirlo.",
    };
  }

  return { enviado: true, yaEstabaEnviado: false, emailId };
}

/**
 * Envío automático/idempotente: se llama desde el flujo de "Enviar
 * confirmación por WhatsApp" (registros nuevos) y también desde el botón
 * manual "Enviar correo de confirmación" (registros históricos con carta
 * ya generada pero sin correo enviado). Si ya existe un envío exitoso, no
 * hace nada.
 */
export function enviarCorreoConfirmacion(registroId: string): Promise<ResultadoEnvioEmail> {
  return enviarCorreoInterno(registroId, { forzar: false });
}

/**
 * Reenvío explícito: ignora a propósito si ya existe un envío exitoso.
 * Solo se dispara desde el botón "Reenviar correo", nunca automáticamente.
 */
export function reenviarCorreoConfirmacion(registroId: string): Promise<ResultadoEnvioEmail> {
  return enviarCorreoInterno(registroId, { forzar: true });
}
