-- Inventario de folios oficiales de Aval Académico para la Constancia de
-- Participación de ASISTENTES/CONGRESISTAS únicamente. Exclusivo de esta
-- categoría a propósito: ponentes, talleristas y carteles científicos
-- tienen archivos de sello independientes y, si algún día se digitalizan,
-- tendrían su propia tabla — nunca se mezclan en folios_aval_academico.
--
-- Datos verificados directamente sobre el PDF oficial antes de escribir
-- esta migración: 222 páginas, 222 folios únicos y consecutivos
-- (202609A12A159 a 202609A12A380), 35 horas avaladas en todas, mapeo 1:1
-- página=folio en el mismo orden del archivo.
create table if not exists public.folios_aval_academico (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique,
  pagina_pdf_origen integer not null unique,
  estado text not null default 'disponible' check (estado in ('disponible', 'asignado')),
  registro_id uuid references public.registros(id) on delete set null,
  asignado_en timestamptz,
  created_at timestamptz not null default now(),
  -- Candado real: un registro jamás puede terminar con dos folios. NULL no
  -- cuenta como colisión (muchos folios sin asignar pueden coexistir), pero
  -- ningún registro_id no nulo puede repetirse.
  constraint folios_aval_registro_unq unique (registro_id)
);

create index if not exists folios_aval_disponibles_idx
  on public.folios_aval_academico (pagina_pdf_origen)
  where estado = 'disponible';

alter table public.folios_aval_academico enable row level security;

drop policy if exists "admins_gestionan_folios_aval" on public.folios_aval_academico;
create policy "admins_gestionan_folios_aval"
  on public.folios_aval_academico for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- NOTA sobre permisos de tabla (no se agrega ningún grant explícito aquí a
-- propósito): la migración 0004_fix_permisos_esquema_public.sql ya dejó
-- configurado, vía `alter default privileges in schema public`, que toda
-- tabla NUEVA reciba automáticamente GRANT de Postgres (select/insert/
-- update/delete a `authenticated` y `service_role`, solo select a `anon`)
-- — el mismo patrón exacto que ya usan checkins/asistencia_conferencias,
-- que tampoco tienen grants explícitos en su propia migración. Ese GRANT
-- de tabla por sí solo NO expone ninguna fila: con RLS habilitado y una
-- única política que exige is_admin(), ninguna fila es visible/editable
-- para nadie que no sea administrador, sin importar qué diga el GRANT de
-- tabla (ver el comentario de 0004 para el porqué de este modelo de dos
-- capas: GRANT decide quién puede *intentar*, RLS decide qué *filas*).

-- Único punto de entrada para reservar un folio. Todo el "elegir uno
-- disponible + marcarlo como asignado" ocurre en una sola transacción
-- (la función completa), nunca como dos operaciones separadas desde la
-- aplicación.
--
-- security definer para poder llamarse desde el flujo público de
-- constancias (que corre sin sesión de admin, vía service_role) sin tener
-- que abrir una política de escritura pública sobre esta tabla.
--
-- search_path = '' (vacío) a propósito, no 'public': es el hardening
-- recomendado para funciones SECURITY DEFINER (evita cualquier ambigüedad
-- de resolución de nombres). Funciona sin problema porque CADA referencia
-- a tabla/función dentro de este cuerpo ya está calificada explícitamente
-- con "public." — nunca se depende del search_path para encontrar nada.
-- (En este proyecto en particular ni siquiera anon/authenticated tienen
-- CREATE sobre el esquema public — solo USAGE, ver 0004 línea 28 — así
-- que el vector clásico de "search_path hijacking" ya estaba cerrado de
-- por sí; esto es una capa adicional, no un parche a un hueco real.)
create or replace function public.asignar_folio_aval(p_registro_id uuid)
returns table (folio text, pagina_pdf_origen integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_registro record;
  v_folio record;
begin
  if p_registro_id is null then
    raise exception 'REGISTRO_ID_REQUERIDO';
  end if;

  -- 1) Bloquear PRIMERO la fila del congresista en `registros` (FOR UPDATE,
  --    bloqueante, sin SKIP LOCKED): esto serializa cualquier par de
  --    llamadas concurrentes para el MISMO registro_id — p. ej. doble clic,
  --    dos pestañas abiertas, o un reintento automático mientras el primer
  --    intento todavía no termina. La segunda llamada queda esperando
  --    aquí hasta que la primera haga commit (ya con el folio asignado),
  --    en vez de que ambas corran en paralelo, lean "no tiene folio
  --    todavía" al mismo tiempo, y choquen después contra
  --    UNIQUE(registro_id) con un error feo en vez de una respuesta
  --    limpia. De paso, esta misma fila es la que se usa para revalidar
  --    estatus_pago, así que una sola lectura cubre ambas cosas.
  select id, estatus_pago into v_registro
  from public.registros
  where id = p_registro_id
  for update;

  if not found then
    raise exception 'REGISTRO_NO_ENCONTRADO';
  end if;

  -- 2) Elegibilidad SIEMPRE se revalida aquí, tanto si se va a devolver un
  --    folio ya existente como si se va a asignar uno nuevo — nunca se
  --    confía en que quien llama ya lo validó, y nunca se le regresa (ni
  --    se le asigna) un folio a un registro que ahora mismo no está
  --    confirmado, aunque lo haya estado antes.
  if v_registro.estatus_pago <> 'confirmado' then
    raise exception 'REGISTRO_NO_CONFIRMADO';
  end if;

  -- 3) Ya con el registro bloqueado y la elegibilidad confirmada: si ya
  --    tiene folio, se regresa el mismo — nunca uno nuevo.
  select f.folio, f.pagina_pdf_origen into v_folio
  from public.folios_aval_academico f
  where f.registro_id = p_registro_id;

  if found then
    return query select v_folio.folio, v_folio.pagina_pdf_origen;
    return;
  end if;

  -- 4) Tomar un folio disponible con bloqueo de fila. SKIP LOCKED aquí sí
  --    (a diferencia del paso 1): esto es tomar UNO cualquiera de un fondo
  --    común compartido por TODOS los congresistas, así que dos personas
  --    distintas pidiendo folio al mismo tiempo deben poder avanzar cada
  --    una con una fila distinta sin esperarse entre sí.
  select f.id, f.folio, f.pagina_pdf_origen into v_folio
  from public.folios_aval_academico f
  where f.estado = 'disponible'
  order by f.pagina_pdf_origen
  for update skip locked
  limit 1;

  if not found then
    raise exception 'SIN_FOLIOS_DISPONIBLES';
  end if;

  update public.folios_aval_academico
  set estado = 'asignado', registro_id = p_registro_id, asignado_en = now()
  where id = v_folio.id;

  return query select v_folio.folio, v_folio.pagina_pdf_origen;
end;
$$;

-- Se revoca de "public" Y de los roles con nombre explícito: la migración
-- 0004 configuró `alter default privileges ... grant execute on functions
-- to anon, authenticated, service_role` para TODAS las funciones nuevas
-- del esquema — eso significa que, sin este revoke explícito nombrando a
-- "anon, authenticated", esta función habría quedado ejecutable por esos
-- roles automáticamente al crearse, sin que ningún "revoke ... from
-- public" lo evitara (ese revoke solo afecta al pseudo-rol PUBLIC, no a
-- los grants ya otorgados a roles con nombre). Resultado final: SOLO
-- service_role puede ejecutar asignar_folio_aval — ni siquiera un admin
-- con sesión (authenticated) puede invocarla directamente desde el
-- navegador; la asignación real ocurre exclusivamente server-side, DESPUÉS
-- de que el servidor ya verificó identidad y elegibilidad.
revoke execute on function public.asignar_folio_aval(uuid) from public, anon, authenticated;
grant execute on function public.asignar_folio_aval(uuid) to service_role;

-- Seed de los 222 folios oficiales, en el mismo orden del PDF entregado
-- ("Sellos Aval Académico Asistentes..."). on conflict (folio) do nothing
-- para que esta migración se pueda volver a correr sin duplicar filas NI
-- modificar ninguna fila que ya tenga una asignación real (es un INSERT,
-- nunca un UPDATE — un conflicto simplemente omite esa fila por completo,
-- "estado"/"registro_id" quedan exactamente como estaban). Además, como
-- "folio" Y "pagina_pdf_origen" son UNIQUE por separado, un reintento con
-- datos inconsistentes (p. ej. un folio corregido a mano que ya no
-- coincide con su página) fallaría con un error de restricción violada en
-- vez de insertar silenciosamente una fila contradictoria.
insert into public.folios_aval_academico (folio, pagina_pdf_origen) values
('202609A12A159', 1),
('202609A12A160', 2),
('202609A12A161', 3),
('202609A12A162', 4),
('202609A12A163', 5),
('202609A12A164', 6),
('202609A12A165', 7),
('202609A12A166', 8),
('202609A12A167', 9),
('202609A12A168', 10),
('202609A12A169', 11),
('202609A12A170', 12),
('202609A12A171', 13),
('202609A12A172', 14),
('202609A12A173', 15),
('202609A12A174', 16),
('202609A12A175', 17),
('202609A12A176', 18),
('202609A12A177', 19),
('202609A12A178', 20),
('202609A12A179', 21),
('202609A12A180', 22),
('202609A12A181', 23),
('202609A12A182', 24),
('202609A12A183', 25),
('202609A12A184', 26),
('202609A12A185', 27),
('202609A12A186', 28),
('202609A12A187', 29),
('202609A12A188', 30),
('202609A12A189', 31),
('202609A12A190', 32),
('202609A12A191', 33),
('202609A12A192', 34),
('202609A12A193', 35),
('202609A12A194', 36),
('202609A12A195', 37),
('202609A12A196', 38),
('202609A12A197', 39),
('202609A12A198', 40),
('202609A12A199', 41),
('202609A12A200', 42),
('202609A12A201', 43),
('202609A12A202', 44),
('202609A12A203', 45),
('202609A12A204', 46),
('202609A12A205', 47),
('202609A12A206', 48),
('202609A12A207', 49),
('202609A12A208', 50),
('202609A12A209', 51),
('202609A12A210', 52),
('202609A12A211', 53),
('202609A12A212', 54),
('202609A12A213', 55),
('202609A12A214', 56),
('202609A12A215', 57),
('202609A12A216', 58),
('202609A12A217', 59),
('202609A12A218', 60),
('202609A12A219', 61),
('202609A12A220', 62),
('202609A12A221', 63),
('202609A12A222', 64),
('202609A12A223', 65),
('202609A12A224', 66),
('202609A12A225', 67),
('202609A12A226', 68),
('202609A12A227', 69),
('202609A12A228', 70),
('202609A12A229', 71),
('202609A12A230', 72),
('202609A12A231', 73),
('202609A12A232', 74),
('202609A12A233', 75),
('202609A12A234', 76),
('202609A12A235', 77),
('202609A12A236', 78),
('202609A12A237', 79),
('202609A12A238', 80),
('202609A12A239', 81),
('202609A12A240', 82),
('202609A12A241', 83),
('202609A12A242', 84),
('202609A12A243', 85),
('202609A12A244', 86),
('202609A12A245', 87),
('202609A12A246', 88),
('202609A12A247', 89),
('202609A12A248', 90),
('202609A12A249', 91),
('202609A12A250', 92),
('202609A12A251', 93),
('202609A12A252', 94),
('202609A12A253', 95),
('202609A12A254', 96),
('202609A12A255', 97),
('202609A12A256', 98),
('202609A12A257', 99),
('202609A12A258', 100),
('202609A12A259', 101),
('202609A12A260', 102),
('202609A12A261', 103),
('202609A12A262', 104),
('202609A12A263', 105),
('202609A12A264', 106),
('202609A12A265', 107),
('202609A12A266', 108),
('202609A12A267', 109),
('202609A12A268', 110),
('202609A12A269', 111),
('202609A12A270', 112),
('202609A12A271', 113),
('202609A12A272', 114),
('202609A12A273', 115),
('202609A12A274', 116),
('202609A12A275', 117),
('202609A12A276', 118),
('202609A12A277', 119),
('202609A12A278', 120),
('202609A12A279', 121),
('202609A12A280', 122),
('202609A12A281', 123),
('202609A12A282', 124),
('202609A12A283', 125),
('202609A12A284', 126),
('202609A12A285', 127),
('202609A12A286', 128),
('202609A12A287', 129),
('202609A12A288', 130),
('202609A12A289', 131),
('202609A12A290', 132),
('202609A12A291', 133),
('202609A12A292', 134),
('202609A12A293', 135),
('202609A12A294', 136),
('202609A12A295', 137),
('202609A12A296', 138),
('202609A12A297', 139),
('202609A12A298', 140),
('202609A12A299', 141),
('202609A12A300', 142),
('202609A12A301', 143),
('202609A12A302', 144),
('202609A12A303', 145),
('202609A12A304', 146),
('202609A12A305', 147),
('202609A12A306', 148),
('202609A12A307', 149),
('202609A12A308', 150),
('202609A12A309', 151),
('202609A12A310', 152),
('202609A12A311', 153),
('202609A12A312', 154),
('202609A12A313', 155),
('202609A12A314', 156),
('202609A12A315', 157),
('202609A12A316', 158),
('202609A12A317', 159),
('202609A12A318', 160),
('202609A12A319', 161),
('202609A12A320', 162),
('202609A12A321', 163),
('202609A12A322', 164),
('202609A12A323', 165),
('202609A12A324', 166),
('202609A12A325', 167),
('202609A12A326', 168),
('202609A12A327', 169),
('202609A12A328', 170),
('202609A12A329', 171),
('202609A12A330', 172),
('202609A12A331', 173),
('202609A12A332', 174),
('202609A12A333', 175),
('202609A12A334', 176),
('202609A12A335', 177),
('202609A12A336', 178),
('202609A12A337', 179),
('202609A12A338', 180),
('202609A12A339', 181),
('202609A12A340', 182),
('202609A12A341', 183),
('202609A12A342', 184),
('202609A12A343', 185),
('202609A12A344', 186),
('202609A12A345', 187),
('202609A12A346', 188),
('202609A12A347', 189),
('202609A12A348', 190),
('202609A12A349', 191),
('202609A12A350', 192),
('202609A12A351', 193),
('202609A12A352', 194),
('202609A12A353', 195),
('202609A12A354', 196),
('202609A12A355', 197),
('202609A12A356', 198),
('202609A12A357', 199),
('202609A12A358', 200),
('202609A12A359', 201),
('202609A12A360', 202),
('202609A12A361', 203),
('202609A12A362', 204),
('202609A12A363', 205),
('202609A12A364', 206),
('202609A12A365', 207),
('202609A12A366', 208),
('202609A12A367', 209),
('202609A12A368', 210),
('202609A12A369', 211),
('202609A12A370', 212),
('202609A12A371', 213),
('202609A12A372', 214),
('202609A12A373', 215),
('202609A12A374', 216),
('202609A12A375', 217),
('202609A12A376', 218),
('202609A12A377', 219),
('202609A12A378', 220),
('202609A12A379', 221),
('202609A12A380', 222)
on conflict (folio) do nothing;
