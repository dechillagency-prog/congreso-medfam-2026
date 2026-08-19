import { Resend } from "resend";

/**
 * Cliente único de Resend — server-only, nunca se importa desde un
 * componente cliente. La API key vive solo en variables de entorno
 * (RESEND_API_KEY), igual que SUPABASE_SERVICE_ROLE_KEY.
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Remitente configurable sin tocar código: mientras no exista un dominio
 * propio verificado en Resend, usa el dominio de pruebas de Resend, que
 * solo permite enviar a la cuenta con la que te registraste — suficiente
 * para las pruebas controladas de esta etapa.
 */
export const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "XXV Congreso Regional Noreste de Medicina Familiar <onboarding@resend.dev>";
