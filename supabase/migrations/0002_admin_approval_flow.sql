-- ============================================================
-- XXV Congreso Regional Noreste de Medicina Familiar 2026
-- Migración 2: administradores, historial de comprobantes,
-- configuraciones del sitio, flujo de aprobación/rechazo,
-- y campos preparados para constancias/QR.
-- Ejecutar DESPUÉS de 0001_init.sql
-- ============================================================

-- ============================================================
-- TABLA: admins
-- Perfil de administradores. El alta en auth.users se hace manualmente
-- desde el dashboard de Supabase; esta tabla solo añade rol y nombre,
-- y es la que usan las políticas de RLS para saber quién es admin.
-- ============================================================
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol text not null default 'organizador' check (rol in ('super_admin', 'organizador')),
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admin_lee_su_propio_perfil" on public.admins;
create policy "admin_lee_su_propio_perfil"
  on public.admins for select
  to authenticated
  using (id = auth.uid());

-- Función helper: ¿el usuario autenticado actual es admin?
-- security definer para poder consultar public.admins sin recursión de RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where id = auth.uid());
$$;

-- IMPORTANTE (paso manual): después de crear un usuario en
-- Authentication > Users, inserta su fila correspondiente aquí, p. ej.:
--   insert into public.admins (id, nombre, rol)
--   values ('<uuid-del-usuario>', 'Nombre del organizador', 'super_admin');
-- Sin esa fila, el usuario puede iniciar sesión pero is_admin() será false
-- y no podrá leer/editar registros (las policies de abajo lo exigen).

-- ============================================================
-- Reemplazar policies de la migración 1 para exigir is_admin()
-- en vez de "cualquier usuario autenticado"
-- ============================================================
drop policy if exists "admins_leen_registros" on public.registros;
create policy "admins_leen_registros"
  on public.registros for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins_actualizan_registros" on public.registros;
create policy "admins_actualizan_registros"
  on public.registros for update
  to authenticated
  using (public.is_admin());

drop policy if exists "admins_escriben_ponentes" on public.ponentes;
create policy "admins_escriben_ponentes"
  on public.ponentes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins_escriben_conferencias" on public.conferencias;
create policy "admins_escriben_conferencias"
  on public.conferencias for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins_escriben_patrocinadores" on public.patrocinadores;
create policy "admins_escriben_patrocinadores"
  on public.patrocinadores for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins_leen_comprobantes" on storage.objects;
create policy "admins_leen_comprobantes"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'comprobantes' and public.is_admin());

-- ============================================================
-- TABLA: comprobantes
-- Historial de comprobantes subidos por registro (permite re-subir
-- si un pago fue rechazado, sin perder el comprobante anterior).
-- registros.comprobante_url sigue existiendo como puntero al más reciente.
-- ============================================================
create table if not exists public.comprobantes (
  id uuid primary key default gen_random_uuid(),
  registro_id uuid not null references public.registros(id) on delete cascade,
  storage_path text not null,
  url text not null,
  subido_en timestamptz not null default now()
);

create index if not exists comprobantes_registro_id_idx on public.comprobantes (registro_id);

alter table public.comprobantes enable row level security;

drop policy if exists "cualquiera_sube_comprobante_registro" on public.comprobantes;
create policy "cualquiera_sube_comprobante_registro"
  on public.comprobantes for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admins_leen_comprobantes_tabla" on public.comprobantes;
create policy "admins_leen_comprobantes_tabla"
  on public.comprobantes for select
  to authenticated
  using (public.is_admin());

-- ============================================================
-- TABLA: configuraciones
-- Pares clave/valor editables desde el dashboard sin redeploy
-- (fechas límite, cupo máximo, precios vigentes, avisos, etc.)
-- ============================================================
create table if not exists public.configuraciones (
  clave text primary key,
  valor jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.configuraciones enable row level security;

drop policy if exists "lectura_publica_configuraciones" on public.configuraciones;
create policy "lectura_publica_configuraciones"
  on public.configuraciones for select
  to anon, authenticated
  using (true);

drop policy if exists "admins_escriben_configuraciones" on public.configuraciones;
create policy "admins_escriben_configuraciones"
  on public.configuraciones for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_configuraciones_updated_at on public.configuraciones;
create trigger trg_configuraciones_updated_at
  before update on public.configuraciones
  for each row execute function set_updated_at();

-- Valores iniciales (editar cantidades reales cuando se definan)
insert into public.configuraciones (clave, valor) values
  ('cupo_maximo', '300'),
  ('fecha_limite_tarifa_preferencial', '"2026-09-15"'),
  ('inscripciones_abiertas', 'true')
on conflict (clave) do nothing;

-- ============================================================
-- FLUJO DE APROBACIÓN — columnas nuevas en registros
-- Dejan el registro listo para constancias y QR sin rediseñar nada.
-- ============================================================
alter table public.registros
  add column if not exists aprobado_por uuid references public.admins(id) on delete set null,
  add column if not exists fecha_aprobacion timestamptz,
  add column if not exists motivo_rechazo text,
  add column if not exists codigo_qr text unique,
  add column if not exists constancia_url text,
  add column if not exists asistencia_confirmada boolean not null default false;

-- Genera un código QR corto y único basado en el folio (payload real de un
-- QR se puede construir en el cliente/servidor apuntando a
-- https://congresomedfam2026.mx/verificar/<codigo_qr>)
create or replace function public.generar_codigo_qr(p_folio text)
returns text language sql immutable as $$
  select 'QR-' || replace(p_folio, 'CMF26-', '') || '-' || substr(md5(p_folio || random()::text), 1, 6);
$$;

-- ============================================================
-- FUNCIONES DE APROBACIÓN / RECHAZO
-- security definer: se ejecutan con privilegios elevados pero
-- verifican is_admin() internamente, así el service_role key
-- no tiene que exponerse en el cliente ni en Server Actions.
-- ============================================================
create or replace function public.aprobar_registro(p_registro_id uuid)
returns public.registros
language plpgsql
security definer
set search_path = public
as $$
declare
  v_registro public.registros;
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  update public.registros
  set
    estatus_pago = 'confirmado',
    aprobado_por = auth.uid(),
    fecha_aprobacion = now(),
    motivo_rechazo = null,
    codigo_qr = coalesce(codigo_qr, public.generar_codigo_qr(folio))
  where id = p_registro_id
  returning * into v_registro;

  return v_registro;
end;
$$;

create or replace function public.rechazar_registro(p_registro_id uuid, p_motivo text)
returns public.registros
language plpgsql
security definer
set search_path = public
as $$
declare
  v_registro public.registros;
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  update public.registros
  set
    estatus_pago = 'rechazado',
    aprobado_por = auth.uid(),
    fecha_aprobacion = now(),
    motivo_rechazo = p_motivo
  where id = p_registro_id
  returning * into v_registro;

  return v_registro;
end;
$$;

grant execute on function public.aprobar_registro(uuid) to authenticated;
grant execute on function public.rechazar_registro(uuid, text) to authenticated;
grant execute on function public.is_admin() to authenticated, anon;
