import { Resend } from "resend";

/**
 * Cliente único de Resend — server-only, nunca se importa desde un
 * componente cliente. La API key vive solo en variables de entorno
 * (RESEND_API_KEY), igual que SUPABASE_SERVICE_ROLE_KEY.
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/** Solo para desarrollo local — Resend únicamente permite enviar con este remitente a la cuenta registrada, nunca a destinatarios reales. */
const REMITENTE_PRUEBAS_RESEND =
  "XXV Congreso Regional Noreste de Medicina Familiar <onboarding@resend.dev>";

/**
 * Remitente real, configurado vía RESEND_FROM_EMAIL una vez que el
 * dominio está verificado en Resend (ej.
 * "... <confirmaciones@congresomedicinafamiliar.com>").
 *
 * Fuera de producción, si la variable no está configurada, cae al
 * remitente de pruebas de Resend — cómodo para desarrollo local, sin
 * riesgo (ese remitente no puede enviar a destinatarios reales de todas
 * formas). En producción NO hay ese fallback a propósito: si
 * RESEND_FROM_EMAIL falta, queda `undefined` y enviar-confirmacion-email.ts
 * rechaza el envío con un error explícito, en vez de arriesgarse a que un
 * correo real le llegue a un congresista desde el dominio compartido de
 * pruebas de Resend.
 */
export const RESEND_FROM_EMAIL: string | undefined =
  process.env.RESEND_FROM_EMAIL ||
  (process.env.NODE_ENV === "production" ? undefined : REMITENTE_PRUEBAS_RESEND);
