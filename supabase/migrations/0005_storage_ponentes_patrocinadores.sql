-- ============================================================
-- XXV Congreso Regional Noreste de Medicina Familiar 2026
-- Migración 5: buckets de Storage para carga directa de imágenes
-- desde el panel admin — fotos de ponentes y logos de patrocinadores.
--
-- Ambos buckets son públicos (public = true): las fotos/logos se
-- muestran en páginas públicas del sitio, así que la URL pública de
-- Storage puede guardarse directamente en `ponentes.foto_url` /
-- `patrocinadores.logo_url`, igual que las URLs externas que ya
-- existían ahí — compatible con lo que ya hay cargado.
--
-- Solo administradores autenticados (is_admin(), definida en
-- 0002_admin_approval_flow.sql) pueden subir/reemplazar/borrar.
-- Lectura pública porque el bucket es público y las imágenes se
-- muestran sin sesión en /ponentes y /patrocinadores.
--
-- Ejecutar DESPUÉS de 0001, 0002, 0003 y 0004.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('ponentes', 'ponentes', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('patrocinadores', 'patrocinadores', true)
on conflict (id) do nothing;

drop policy if exists "lectura_publica_fotos_ponentes" on storage.objects;
create policy "lectura_publica_fotos_ponentes"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'ponentes');

drop policy if exists "lectura_publica_logos_patrocinadores" on storage.objects;
create policy "lectura_publica_logos_patrocinadores"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'patrocinadores');

drop policy if exists "admins_escriben_fotos_ponentes" on storage.objects;
create policy "admins_escriben_fotos_ponentes"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'ponentes' and public.is_admin())
  with check (bucket_id = 'ponentes' and public.is_admin());

drop policy if exists "admins_escriben_logos_patrocinadores" on storage.objects;
create policy "admins_escriben_logos_patrocinadores"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'patrocinadores' and public.is_admin())
  with check (bucket_id = 'patrocinadores' and public.is_admin());
