-- ============================================================
-- Seed de datos de ejemplo — XXV Congreso Regional Noreste de
-- Medicina Familiar 2026
-- Ejecutar DESPUÉS de las 3 migraciones. Seguro de correr más de una
-- vez — cada INSERT usa `where not exists` contra una columna real,
-- así que no duplica datos aunque lo corras varias veces.
-- Todo este contenido es de ejemplo: reemplázalo por el contenido
-- real del congreso antes de publicar.
--
-- NOTA TÉCNICA #1 — casts explícitos:
-- Cada literal está casteado a su tipo de columna (::time, ::uuid,
-- ::tipo_inscripcion, ::jsonb, etc.). Es necesario porque dentro de
-- un UNION ALL, Postgres resuelve el tipo de cada columna comparando
-- TODAS las ramas del SELECT antes de insertar — si una sola rama no
-- lleva un cast explícito, el literal se resuelve como "text" y el
-- INSERT falla contra columnas de tipo time/uuid/enum, aunque el
-- resto de las ramas sí llevaran el tipo correcto.
--
-- NOTA TÉCNICA #2 — idempotencia real:
-- Todos los INSERT usan `select ... where not exists (...)` contra
-- una columna con significado real (nombre, título, correo), NO
-- `on conflict do nothing` — ninguna de estas tablas tiene un índice
-- único sobre esas columnas, así que `on conflict` no tendría nada
-- contra qué comparar y terminaría insertando duplicados en cada
-- corrida. Esto se verificó corriendo el archivo dos veces seguidas
-- contra un Postgres real con el esquema de las 3 migraciones ya
-- aplicado.
-- ============================================================

-- ---------- Ponentes de ejemplo ----------
insert into public.ponentes (nombre, especialidad, estado, bio, orden)
select 'Dra. Ana Sofía Ramírez'::text, 'Medicina Familiar'::text, 'Coahuila'::text, 'Especialista en atención primaria con 15 años de experiencia clínica y docente.'::text, 1::int
where not exists (select 1 from public.ponentes where nombre = 'Dra. Ana Sofía Ramírez')
union all
select 'Dr. Carlos Eduardo Villarreal'::text, 'Medicina Interna'::text, 'Nuevo León'::text, 'Profesor titular de Medicina Interna, enfocado en enfermedades crónico-degenerativas.'::text, 2::int
where not exists (select 1 from public.ponentes where nombre = 'Dr. Carlos Eduardo Villarreal')
union all
select 'Dra. Patricia Elena Gómez'::text, 'Psiquiatría'::text, 'Coahuila'::text, 'Consultora en salud mental para el primer nivel de atención.'::text, 3::int
where not exists (select 1 from public.ponentes where nombre = 'Dra. Patricia Elena Gómez')
union all
select 'Dr. Jorge Alberto Muñoz'::text, 'Endocrinología'::text, 'Tamaulipas'::text, 'Investigador clínico en diabetes tipo 2 y síndrome metabólico.'::text, 4::int
where not exists (select 1 from public.ponentes where nombre = 'Dr. Jorge Alberto Muñoz');

-- ---------- Conferencias de ejemplo (ligadas a los ponentes de arriba) ----------
-- dia: columna TEXT con CHECK (no es un enum de Postgres), se castea igual.
-- hora_inicio / hora_fin: TIME — este era el error original, corregido con ::time.
-- ponente_id: UUID — el NULL se castea explícitamente para que el UNION ALL
-- no intente unificarlo como texto junto con las subconsultas uuid.
with p as (
  select id, nombre from public.ponentes
)
insert into public.conferencias (dia, hora_inicio, hora_fin, titulo, ponente_id, sala)
select 'miercoles'::text, '09:00'::time, '09:30'::time, 'Registro y bienvenida'::text, null::uuid, 'Vestíbulo'::text
where not exists (select 1 from public.conferencias where titulo = 'Registro y bienvenida')
union all
select 'miercoles'::text, '09:30'::time, '10:30'::time, 'Inauguración oficial'::text, null::uuid, 'Salón Principal'::text
where not exists (select 1 from public.conferencias where titulo = 'Inauguración oficial')
union all
select 'jueves'::text, '09:00'::time, '10:00'::time, 'Actualización en Diabetes Mellitus tipo 2'::text,
  (select id from p where nombre = 'Dr. Jorge Alberto Muñoz')::uuid, 'Salón A'::text
where not exists (select 1 from public.conferencias where titulo = 'Actualización en Diabetes Mellitus tipo 2')
union all
select 'viernes'::text, '09:00'::time, '10:00'::time, 'Salud mental en el primer nivel de atención'::text,
  (select id from p where nombre = 'Dra. Patricia Elena Gómez')::uuid, 'Salón A'::text
where not exists (select 1 from public.conferencias where titulo = 'Salud mental en el primer nivel de atención')
union all
select 'sabado'::text, '09:00'::time, '10:00'::time, 'Casos clínicos interactivos'::text,
  (select id from p where nombre = 'Dra. Ana Sofía Ramírez')::uuid, 'Salón A'::text
where not exists (select 1 from public.conferencias where titulo = 'Casos clínicos interactivos')
union all
select 'sabado'::text, '12:00'::time, '13:00'::time, 'Clausura y entrega de constancias'::text, null::uuid, 'Salón Principal'::text
where not exists (select 1 from public.conferencias where titulo = 'Clausura y entrega de constancias');

-- ---------- Patrocinadores de ejemplo ----------
-- categoria_id: UUID, viene de la subconsulta a categorias_patrocinio (ya es
-- uuid de por sí), casteado igual por consistencia del patrón.
with cat as (select id, nombre from public.categorias_patrocinio)
insert into public.patrocinadores (nombre, categoria_id, logo_url, url, orden)
select 'Laboratorios Ejemplo'::text, (select id from cat where nombre = 'Platinum')::uuid,
  'https://placehold.co/240x96?text=Platinum'::text, 'https://example.com'::text, 1::int
where not exists (select 1 from public.patrocinadores where nombre = 'Laboratorios Ejemplo')
union all
select 'Farmacéutica Demo'::text, (select id from cat where nombre = 'Gold')::uuid,
  'https://placehold.co/240x96?text=Gold'::text, 'https://example.com'::text, 1::int
where not exists (select 1 from public.patrocinadores where nombre = 'Farmacéutica Demo')
union all
select 'Distribuidora Médica XYZ'::text, (select id from cat where nombre = 'Silver')::uuid,
  'https://placehold.co/240x96?text=Silver'::text, 'https://example.com'::text, 1::int
where not exists (select 1 from public.patrocinadores where nombre = 'Distribuidora Médica XYZ');

-- ---------- Encuesta de ejemplo ----------
-- preguntas: JSONB. activa: BOOLEAN — se castea explícito por consistencia.
insert into public.encuestas (titulo, preguntas, activa)
select
  'Encuesta general de satisfacción'::text,
  '[
    {"id":"q1","texto":"¿Cómo calificarías la organización general del congreso?","tipo":"escala_1_5"},
    {"id":"q2","texto":"¿Qué fue lo que más te gustó?","tipo":"texto_libre"},
    {"id":"q3","texto":"¿Qué mejorarías para la próxima edición?","tipo":"texto_libre"}
  ]'::jsonb,
  true::boolean
where not exists (select 1 from public.encuestas where titulo = 'Encuesta general de satisfacción');

-- ---------- Un registro de ejemplo, para probar el dashboard sin usar el formulario ----------
-- tipo_inscripcion / estatus_pago: ENUMS reales de Postgres (creados en
-- 0001_init.sql), casteados explícitamente en vez de confiar en la
-- resolución implícita del INSERT.
insert into public.registros (nombre, correo, celular, estado, especialidad, tipo_inscripcion, estatus_pago)
select
  'Dr. Registro de Prueba'::text,
  'prueba@ejemplo.com'::text,
  '8710000000'::text,
  'Coahuila'::text,
  'Medicina Familiar'::text,
  'no_federado'::tipo_inscripcion,
  'pendiente'::estatus_pago
where not exists (select 1 from public.registros where correo = 'prueba@ejemplo.com');

-- Nota: para probar el flujo de aprobación con comprobante real, sube uno
-- manualmente desde /registro en el sitio — el seed no sube archivos a Storage.
