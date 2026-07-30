-- ============================================================
-- XXV Congreso Regional Noreste de Medicina Familiar 2026
-- Migración 3: hacia producción
-- - Formato de folio MF2026-0001 (reutilizable año con año para
--   congresos futuros, sin resetear el consecutivo salvo que se
--   decida explícitamente).
-- - Categorías de patrocinio como tabla real (antes era un CHECK).
-- - Rol super_admin con permisos sobre la tabla admins.
-- - Tablas base para funciones futuras: check-in general, check-in
--   por conferencia, encuestas de satisfacción.
-- Ejecutar DESPUÉS de 0001_init.sql y 0002_admin_approval_flow.sql
-- ============================================================

-- ============================================================
-- FOLIO: nuevo formato MF2026-0001
-- Mantiene el mismo `folio_seq` (no reinicia el consecutivo ya usado),
-- solo cambia el formato de salida. Para congresos futuros basta con
-- decidir si se reinicia folio_seq (`alter sequence folio_seq restart with 1;`)
-- o se deja corrido.
-- ============================================================
create or replace function generar_folio()
returns text language plpgsql as $$
begin
  return 'MF' || to_char(now(), 'YYYY') || '-' || lpad(nextval('folio_seq')::text, 4, '0');
end;
$$;

-- generar_codigo_qr ya no debe asumir el prefijo viejo "CMF26-"
create or replace function public.generar_codigo_qr(p_folio text)
returns text language sql immutable as $$
  select 'QR-' || regexp_replace(p_folio, '^[A-Z]+[0-9]*-', '') || '-'
         || substr(md5(p_folio || random()::text), 1, 6);
$$;

-- ============================================================
-- ROLES: super_admin puede administrar la tabla admins
-- ============================================================
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where id = auth.uid() and rol = 'super_admin'
  );
$$;

grant execute on function public.is_super_admin() to authenticated;

drop policy if exists "super_admin_lee_todos_los_admins" on public.admins;
create policy "super_admin_lee_todos_los_admins"
  on public.admins for select
  to authenticated
  using (public.is_super_admin() or id = auth.uid());

drop policy if exists "super_admin_administra_admins" on public.admins;
create policy "super_admin_administra_admins"
  on public.admins for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ============================================================
-- CATEGORÍAS DE PATROCINIO — tabla real (antes era un check constraint
-- de texto en `patrocinadores`). Permite crear/editar/eliminar categorías
-- desde el dashboard sin tocar código.
-- ============================================================
create table if not exists public.categorias_patrocinio (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categorias_patrocinio enable row level security;

drop policy if exists "lectura_publica_categorias_patrocinio" on public.categorias_patrocinio;
create policy "lectura_publica_categorias_patrocinio"
  on public.categorias_patrocinio for select to anon, authenticated using (true);

drop policy if exists "admins_escriben_categorias_patrocinio" on public.categorias_patrocinio;
create policy "admins_escriben_categorias_patrocinio"
  on public.categorias_patrocinio for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.categorias_patrocinio (nombre, orden) values
  ('Platinum', 1), ('Gold', 2), ('Silver', 3), ('Partners', 4)
on conflict (nombre) do nothing;

-- Migrar `patrocinadores.categoria` (texto) a `categoria_id` (uuid)
alter table public.patrocinadores
  add column if not exists categoria_id uuid references public.categorias_patrocinio(id) on delete restrict;

update public.patrocinadores p
set categoria_id = c.id
from public.categorias_patrocinio c
where p.categoria_id is null
  and lower(c.nombre) = lower(
    case p.categoria
      when 'partner' then 'Partners'
      else p.categoria
    end
  );

alter table public.patrocinadores drop column if exists categoria;
alter table public.patrocinadores alter column categoria_id set not null;

-- ============================================================
-- CHECK-IN GENERAL DEL EVENTO (entrada al congreso, vía QR)
-- ============================================================
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  registro_id uuid not null references public.registros(id) on delete cascade,
  registrado_por uuid references public.admins(id) on delete set null,
  checked_in_at timestamptz not null default now()
);

create unique index if not exists checkins_registro_id_unq on public.checkins (registro_id);

alter table public.checkins enable row level security;

drop policy if exists "admins_gestionan_checkins" on public.checkins;
create policy "admins_gestionan_checkins"
  on public.checkins for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Marca asistencia_confirmada en registros automáticamente al hacer check-in
create or replace function public.marcar_asistencia_confirmada()
returns trigger language plpgsql as $$
begin
  update public.registros set asistencia_confirmada = true where id = new.registro_id;
  return new;
end;
$$;

drop trigger if exists trg_checkin_marca_asistencia on public.checkins;
create trigger trg_checkin_marca_asistencia
  after insert on public.checkins
  for each row execute function public.marcar_asistencia_confirmada();

-- Función de conveniencia para el flujo de check-in por QR desde el dashboard
create or replace function public.registrar_checkin(p_codigo_qr text)
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

  select * into v_registro from public.registros where codigo_qr = p_codigo_qr;

  if v_registro.id is null then
    raise exception 'Código QR no encontrado';
  end if;

  if v_registro.estatus_pago <> 'confirmado' then
    raise exception 'El registro no tiene el pago confirmado';
  end if;

  insert into public.checkins (registro_id, registrado_por)
  values (v_registro.id, auth.uid())
  on conflict (registro_id) do nothing;

  select * into v_registro from public.registros where id = v_registro.id;
  return v_registro;
end;
$$;

grant execute on function public.registrar_checkin(text) to authenticated;

-- ============================================================
-- ASISTENCIA POR CONFERENCIA (control de asistencia a cada sesión)
-- ============================================================
create table if not exists public.asistencia_conferencias (
  id uuid primary key default gen_random_uuid(),
  registro_id uuid not null references public.registros(id) on delete cascade,
  conferencia_id uuid not null references public.conferencias(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  unique (registro_id, conferencia_id)
);

alter table public.asistencia_conferencias enable row level security;

drop policy if exists "admins_gestionan_asistencia_conferencias" on public.asistencia_conferencias;
create policy "admins_gestionan_asistencia_conferencias"
  on public.asistencia_conferencias for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- ENCUESTAS DE SATISFACCIÓN
-- Modelo flexible: preguntas y respuestas en jsonb para no tener que
-- migrar el esquema cada vez que cambie el cuestionario.
-- Ejemplo de `preguntas`: [{"id":"q1","texto":"...","tipo":"escala_1_5"}]
-- Ejemplo de `respuestas` en encuesta_respuestas: {"q1": 5, "q2": "Muy buena"}
-- ============================================================
create table if not exists public.encuestas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  conferencia_id uuid references public.conferencias(id) on delete set null,
  preguntas jsonb not null default '[]',
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.encuestas enable row level security;

drop policy if exists "lectura_publica_encuestas_activas" on public.encuestas;
create policy "lectura_publica_encuestas_activas"
  on public.encuestas for select to anon, authenticated using (activa = true or public.is_admin());

drop policy if exists "admins_escriben_encuestas" on public.encuestas;
create policy "admins_escriben_encuestas"
  on public.encuestas for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.encuesta_respuestas (
  id uuid primary key default gen_random_uuid(),
  encuesta_id uuid not null references public.encuestas(id) on delete cascade,
  registro_id uuid references public.registros(id) on delete set null,
  respuestas jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.encuesta_respuestas enable row level security;

drop policy if exists "cualquiera_responde_encuesta" on public.encuesta_respuestas;
create policy "cualquiera_responde_encuesta"
  on public.encuesta_respuestas for insert to anon, authenticated with check (true);

drop policy if exists "admins_leen_respuestas_encuesta" on public.encuesta_respuestas;
create policy "admins_leen_respuestas_encuesta"
  on public.encuesta_respuestas for select to authenticated using (public.is_admin());

-- ============================================================
-- ESTADÍSTICAS: vista agregada para el futuro panel de estadísticas.
-- No requiere código adicional en la app para existir; ya queda
-- disponible para consultarse desde el dashboard cuando se construya.
-- ============================================================
create or replace view public.vista_estadisticas_congreso as
select
  (select count(*) from public.registros) as total_registros,
  (select count(*) from public.registros where estatus_pago = 'confirmado') as total_confirmados,
  (select count(*) from public.registros where estatus_pago = 'pendiente') as total_pendientes,
  (select count(*) from public.registros where estatus_pago = 'rechazado') as total_rechazados,
  (select count(*) from public.checkins) as total_checkins,
  (select count(*) from public.registros where tipo_inscripcion = 'federado') as total_federados,
  (select count(*) from public.registros where tipo_inscripcion = 'no_federado') as total_no_federados,
  (select count(*) from public.registros where tipo_inscripcion = 'residente') as total_residentes;

-- Las vistas heredan RLS de sus tablas base en Postgres 15+ solo si se
-- declaran security_invoker; lo forzamos explícitamente:
alter view public.vista_estadisticas_congreso set (security_invoker = true);
