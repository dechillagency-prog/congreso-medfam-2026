-- ============================================================
-- XXV Congreso Regional Noreste de Medicina Familiar 2026
-- Migración inicial: tablas, storage, RLS
-- Ejecutar en el SQL Editor de Supabase o vía `supabase db push`
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
do $$ begin
  create type tipo_inscripcion as enum ('federado', 'no_federado', 'residente');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estatus_pago as enum ('pendiente', 'confirmado', 'rechazado');
exception when duplicate_object then null; end $$;

-- ---------- FOLIO SECUENCIAL ----------
create sequence if not exists folio_seq start 1;

create or replace function generar_folio()
returns text language plpgsql as $$
begin
  return 'CMF26-' || lpad(nextval('folio_seq')::text, 5, '0');
end;
$$;

-- ---------- TABLA: registros ----------
create table if not exists public.registros (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique default generar_folio(),
  nombre text not null,
  correo text not null,
  celular text not null,
  estado text not null,
  especialidad text not null,
  tipo_inscripcion tipo_inscripcion not null,
  comprobante_url text,
  estatus_pago estatus_pago not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists registros_correo_idx on public.registros (correo);
create index if not exists registros_estatus_pago_idx on public.registros (estatus_pago);
create index if not exists registros_created_at_idx on public.registros (created_at desc);

-- updated_at automático
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_registros_updated_at on public.registros;
create trigger trg_registros_updated_at
  before update on public.registros
  for each row execute function set_updated_at();

-- ---------- TABLA: ponentes ----------
create table if not exists public.ponentes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  especialidad text not null,
  estado text not null,
  foto_url text,
  bio text,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- TABLA: conferencias (programa) ----------
create table if not exists public.conferencias (
  id uuid primary key default gen_random_uuid(),
  dia text not null check (dia in ('miercoles', 'jueves', 'viernes', 'sabado')),
  hora_inicio time not null,
  hora_fin time not null,
  titulo text not null,
  ponente_id uuid references public.ponentes(id) on delete set null,
  sala text,
  created_at timestamptz not null default now()
);

-- ---------- TABLA: patrocinadores ----------
create table if not exists public.patrocinadores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text not null check (categoria in ('platinum', 'gold', 'silver', 'partner')),
  logo_url text not null,
  url text,
  orden int not null default 0
);

-- ============================================================
-- STORAGE: bucket "comprobantes"
-- ============================================================
insert into storage.buckets (id, name, public)
values ('comprobantes', 'comprobantes', false)
on conflict (id) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.registros enable row level security;
alter table public.ponentes enable row level security;
alter table public.conferencias enable row level security;
alter table public.patrocinadores enable row level security;

-- Cualquiera puede INSERTAR un registro (formulario público de inscripción)
drop policy if exists "cualquiera_puede_registrarse" on public.registros;
create policy "cualquiera_puede_registrarse"
  on public.registros for insert
  to anon, authenticated
  with check (true);

-- Solo usuarios autenticados (admins) pueden leer/editar registros
drop policy if exists "admins_leen_registros" on public.registros;
create policy "admins_leen_registros"
  on public.registros for select
  to authenticated
  using (true);

drop policy if exists "admins_actualizan_registros" on public.registros;
create policy "admins_actualizan_registros"
  on public.registros for update
  to authenticated
  using (true);

-- Contenido público de solo lectura (ponentes, programa, patrocinadores)
drop policy if exists "lectura_publica_ponentes" on public.ponentes;
create policy "lectura_publica_ponentes" on public.ponentes for select to anon, authenticated using (true);

drop policy if exists "lectura_publica_conferencias" on public.conferencias;
create policy "lectura_publica_conferencias" on public.conferencias for select to anon, authenticated using (true);

drop policy if exists "lectura_publica_patrocinadores" on public.patrocinadores;
create policy "lectura_publica_patrocinadores" on public.patrocinadores for select to anon, authenticated using (true);

-- Solo admins autenticados pueden escribir contenido
drop policy if exists "admins_escriben_ponentes" on public.ponentes;
create policy "admins_escriben_ponentes" on public.ponentes for all to authenticated using (true) with check (true);

drop policy if exists "admins_escriben_conferencias" on public.conferencias;
create policy "admins_escriben_conferencias" on public.conferencias for all to authenticated using (true) with check (true);

drop policy if exists "admins_escriben_patrocinadores" on public.patrocinadores;
create policy "admins_escriben_patrocinadores" on public.patrocinadores for all to authenticated using (true) with check (true);

-- Storage: cualquiera puede subir su comprobante; solo admins lo leen
drop policy if exists "subir_comprobante" on storage.objects;
create policy "subir_comprobante"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'comprobantes');

drop policy if exists "admins_leen_comprobantes" on storage.objects;
create policy "admins_leen_comprobantes"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'comprobantes');
