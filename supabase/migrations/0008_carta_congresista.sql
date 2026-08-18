-- ============================================================
-- XXV Congreso Regional Noreste de Medicina Familiar 2026
-- Migración 8: Carta de Congresista
--
-- La carta se genera bajo demanda (la primera vez que el admin usa
-- "Enviar confirmación WhatsApp" sobre un registro confirmado), NO al
-- aprobar el registro. Esta migración solo prepara el terreno: columnas
-- nuevas + bucket privado + policies. No genera ni almacena nada por sí
-- misma.
--
-- Columnas nuevas en `registros` (todas nullable, no rompen filas
-- existentes):
--   - carta_generada_en: cuándo se generó la carta (no solo si existe).
--   - carta_token: identificador aleatorio e independiente para compartir
--     la carta por WhatsApp. A propósito NO reutiliza `codigo_qr` (ese es
--     para check-in, un propósito distinto) ni se deriva de `folio`/`id`.
--     Se genera en la aplicación con crypto.randomUUID() — esta columna
--     se deja sin default para que quede en null hasta la primera
--     generación real.
--   - whatsapp_confirmacion_iniciada_en: cuándo el admin usó el flujo de
--     WhatsApp por última vez. Se llama "iniciada", no "enviada", porque
--     sin la API oficial de WhatsApp Business solo podemos saber que el
--     admin abrió el flujo — nunca que el mensaje se entregó.
--
-- `constancia_url` (ya existente desde 0002_admin_approval_flow.sql, sin
-- uso hasta ahora) se reutiliza para la ruta del PDF en Storage — no se
-- agrega una columna nueva para eso.
--
-- Ejecutar DESPUÉS de 0001-0007.
-- ============================================================

alter table public.registros
  add column if not exists carta_generada_en timestamptz,
  add column if not exists carta_token text unique,
  add column if not exists whatsapp_confirmacion_iniciada_en timestamptz;

-- ============================================================
-- STORAGE: bucket privado "cartas-congresista"
--
-- Mismo patrón que "comprobantes" y "cartas-federadas": privado, solo
-- admins autenticados pueden subir/leer directamente. El acceso público
-- real pasa por la ruta /carta/[token] de la aplicación, que valida el
-- token y el estatus_pago del registro, y genera internamente una signed
-- URL de corta duración usando el cliente admin (service_role) — igual
-- que getComprobanteSignedUrl / getCartaFederadaSignedUrl en
-- lib/supabase/storage.ts. El bucket en sí nunca queda público.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('cartas-congresista', 'cartas-congresista', false)
on conflict (id) do nothing;

-- Todo el tráfico a este bucket es admin-a-admin (nunca hay subida pública
-- como en "comprobantes"), así que una sola policy "for all" basta —
-- mismo patrón que ponentes/patrocinadores/conferencias.
drop policy if exists "admins_gestionan_cartas_congresista" on storage.objects;
create policy "admins_gestionan_cartas_congresista"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'cartas-congresista' and public.is_admin())
  with check (bucket_id = 'cartas-congresista' and public.is_admin());
