-- ============================================================
-- XXV Congreso Regional Noreste de Medicina Familiar 2026
-- Migración 9: Correo de confirmación de inscripción
--
-- Guarda solo el ÚLTIMO envío exitoso (primer envío o reenvío, lo que
-- haya ocurrido más recientemente) — no se agrega tabla de historial:
-- Resend ya guarda un log completo de cada envío en su propio dashboard,
-- y nada en el panel necesita mostrar envíos anteriores al más reciente.
--
-- Columnas nuevas en `registros` (ambas nullable, no rompen filas
-- existentes — incluye registros históricos a quienes ya se les envió la
-- Carta de Congresista por WhatsApp antes de que existiera esta
-- funcionalidad: para ellos, ambas columnas simplemente quedan en null
-- hasta que un admin presione "Enviar correo de confirmación"):
--   - carta_email_enviado_en: fecha/hora del envío exitoso más reciente.
--     Se escribe ÚNICAMENTE después de que Resend confirma éxito — nunca
--     antes, para no mostrar "Correo enviado" si en realidad falló.
--   - carta_email_id: ID que devuelve Resend del envío exitoso más
--     reciente (útil para soporte/depuración cruzando con su dashboard).
--
-- No requiere cambios de Storage ni policies nuevas: el envío de correo
-- reutiliza exactamente los mismos permisos que ya existen sobre
-- `registros` (RLS de la migración 0002) y sobre el bucket
-- `cartas-congresista` (migración 0008) — descarga el PDF ya subido,
-- nunca sube ni genera nada nuevo.
--
-- Ejecutar DESPUÉS de 0001-0008.
-- ============================================================

alter table public.registros
  add column if not exists carta_email_enviado_en timestamptz,
  add column if not exists carta_email_id text;
