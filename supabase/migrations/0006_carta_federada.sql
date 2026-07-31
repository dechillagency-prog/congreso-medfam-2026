-- ============================================================
-- XXV Congreso Regional Noreste de Medicina Familiar 2026
-- Migración 6: Carta Federada
--
-- Los registrantes que eligen "Socios Federados" deben adjuntar su
-- Carta Federada (PDF) al inscribirse. Sigue exactamente el mismo
-- patrón ya usado para el comprobante de pago: bucket privado,
-- subida pública vía RLS (anon + authenticated), lectura restringida
-- a admins (is_admin()) con URL firmada temporal generada en el
-- servidor — nunca se expone una URL pública directa.
--
-- Ejecutar DESPUÉS de 0001-0005.
-- ============================================================

alter table public.registros
  add column if not exists carta_federada_url text;

insert into storage.buckets (id, name, public)
values ('cartas-federadas', 'cartas-federadas', false)
on conflict (id) do nothing;

drop policy if exists "cualquiera_sube_carta_federada" on storage.objects;
create policy "cualquiera_sube_carta_federada"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'cartas-federadas');

drop policy if exists "admins_leen_cartas_federadas" on storage.objects;
create policy "admins_leen_cartas_federadas"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'cartas-federadas' and public.is_admin());
