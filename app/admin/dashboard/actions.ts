"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { obtenerOCrearCartaCongresista } from "@/lib/supabase/carta-congresista";
import { construirMensajeConfirmacion, construirEnlaceWhatsApp, construirEnlaceWhatsAppWeb } from "@/lib/utils/whatsapp";
import { enviarCorreoConfirmacion, reenviarCorreoConfirmacion } from "@/lib/email/enviar-confirmacion-email";
import { getConfiguracion } from "@/lib/config";
import { SITE_URL } from "@/lib/site-url";

export interface AccionResult {
  success: boolean;
  message?: string;
}

/**
 * Aprueba un registro: cambia estatus_pago a 'confirmado', registra quién y
 * cuándo aprobó, y genera codigo_qr si aún no existe. Todo ocurre dentro de
 * la función `aprobar_registro` en Postgres (security definer), que valida
 * is_admin() internamente — no se necesita la service_role key aquí.
 */
export async function aprobarRegistro(id: string): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("aprobar_registro", { p_registro_id: id });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/dashboard/${id}`);
  return { success: true };
}

export async function rechazarRegistro(id: string, motivo: string): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("rechazar_registro", {
    p_registro_id: id,
    p_motivo: motivo || "No especificado",
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/dashboard/${id}`);
  return { success: true };
}

/** Regresa un registro a 'pendiente' — por si se aprobó/rechazó por error. */
export async function reabrirRegistro(id: string): Promise<AccionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("registros")
    .update({ estatus_pago: "pendiente", motivo_rechazo: null })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/dashboard/${id}`);
  return { success: true };
}

export interface PrepararConfirmacionWhatsAppResult {
  success: boolean;
  message?: string;
  data?: {
    /** Enlace wa.me — mejor compatibilidad en móvil. */
    enlaceWhatsApp: string;
    /** Mismo número/mensaje, apuntando a WhatsApp Web — mejor experiencia en desktop. */
    enlaceWhatsAppWeb: string;
    /** true = la carta se generó en esta llamada; false = ya existía y se reutilizó. */
    cartaFueGenerada: boolean;
    /** Liga pública /carta/[token] — la misma que ya va incluida en ambos enlaces. */
    ligaCarta: string;
    /** true = el correo de confirmación se envió en esta llamada. */
    correoEnviado: boolean;
    /** true = no se reenvió porque ya existía un envío exitoso previo. */
    correoYaEnviado: boolean;
    /** Presente solo si el correo falló — WhatsApp continúa de todas formas. */
    correoError?: string;
  };
}

/**
 * Se dispara cuando el admin usa "Enviar confirmación por WhatsApp" — es el
 * único disparador de la generación de la Carta de Congresista (nunca se
 * genera al aprobar). Idempotente: si ya existe una carta para este
 * registro, la reutiliza en vez de generar una segunda.
 *
 * No usa service_role — el cliente con sesión del admin ya tiene permisos
 * suficientes vía RLS (is_admin()) tanto sobre `registros` como sobre el
 * bucket `cartas-congresista`.
 */
export async function prepararConfirmacionWhatsApp(id: string): Promise<PrepararConfirmacionWhatsAppResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "No autorizado" };
  }

  const { data: registro, error: fetchError } = await supabase
    .from("registros")
    .select("id, nombre, folio, celular, estatus_pago, carta_token")
    .eq("id", id)
    .single();

  if (fetchError || !registro) {
    return { success: false, message: "Registro no encontrado" };
  }

  if (registro.estatus_pago !== "confirmado") {
    return { success: false, message: "El registro debe estar confirmado antes de enviar la confirmación por WhatsApp" };
  }

  const cartaFueGenerada = !registro.carta_token;

  let carta;
  try {
    carta = await obtenerOCrearCartaCongresista(id);
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "No se pudo generar la carta" };
  }

  // El correo es un canal adicional sobre un WhatsApp que ya funciona en
  // producción: si falla (incluso de forma inesperada), nunca debe impedir
  // que el admin complete la confirmación por WhatsApp — solo se reporta.
  let correoEnviado = false;
  let correoYaEnviado = false;
  let correoError: string | undefined;
  try {
    const resultadoCorreo = await enviarCorreoConfirmacion(id);
    correoEnviado = resultadoCorreo.enviado;
    correoYaEnviado = resultadoCorreo.yaEstabaEnviado;
    correoError = resultadoCorreo.error;
  } catch (err) {
    correoError = err instanceof Error ? err.message : "No se pudo enviar el correo de confirmación";
  }

  const ligaCarta = `${SITE_URL}/carta/${carta.token}`;
  const ligaComunidad = await getConfiguracion<string | null>("whatsapp_comunidad_url", null);

  const mensaje = construirMensajeConfirmacion({
    nombre: registro.nombre,
    folio: registro.folio,
    ligaComunidad,
    ligaCarta,
  });
  const enlaceWhatsApp = construirEnlaceWhatsApp(registro.celular, mensaje);
  const enlaceWhatsAppWeb = construirEnlaceWhatsAppWeb(registro.celular, mensaje);

  const { error: updateError } = await supabase
    .from("registros")
    .update({ whatsapp_confirmacion_iniciada_en: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    // No bloquea el flujo: la carta y el enlace de WhatsApp ya están listos;
    // perder este timestamp informativo no debe impedir que el admin envíe
    // el mensaje.
    console.error("No se pudo registrar whatsapp_confirmacion_iniciada_en:", updateError);
  }

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/dashboard/${id}`);

  return {
    success: true,
    data: { enlaceWhatsApp, enlaceWhatsAppWeb, cartaFueGenerada, ligaCarta, correoEnviado, correoYaEnviado, correoError },
  };
}

export interface EnviarCorreoResult {
  success: boolean;
  message?: string;
  /** true = no se envió porque ya existía un envío exitoso previo (solo en el envío no forzado). */
  yaEstabaEnviado?: boolean;
}

/**
 * Botón "Enviar correo de confirmación": para registros que YA tienen
 * carta generada (nuevos o históricos, de antes de que existiera este
 * correo) pero todavía no se les ha enviado. No toca WhatsApp, no genera
 * otro token, no regenera el PDF — reutiliza exactamente lo que ya existe.
 * Idempotente: mismo comportamiento que la llamada automática dentro de
 * prepararConfirmacionWhatsApp.
 */
export async function enviarCorreoRegistro(id: string): Promise<EnviarCorreoResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "No autorizado" };
  }

  const resultado = await enviarCorreoConfirmacion(id);

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/dashboard/${id}`);

  if (resultado.error) {
    return { success: false, message: resultado.error };
  }

  return { success: true, yaEstabaEnviado: resultado.yaEstabaEnviado };
}

/**
 * Botón "Reenviar correo": ignora a propósito si ya existe un envío
 * exitoso — es la única vía para volver a enviar el correo (nunca ocurre
 * por un doble clic accidental en los otros dos flujos).
 */
export async function reenviarCorreoRegistro(id: string): Promise<EnviarCorreoResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "No autorizado" };
  }

  const resultado = await reenviarCorreoConfirmacion(id);

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/dashboard/${id}`);

  if (resultado.error) {
    return { success: false, message: resultado.error };
  }

  return { success: true };
}
