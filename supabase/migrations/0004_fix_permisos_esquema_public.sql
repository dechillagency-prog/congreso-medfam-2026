-- ============================================================
-- XXV Congreso Regional Noreste de Medicina Familiar 2026
-- Migración 4: corrige permisos base del esquema `public`
--
-- SÍNTOMA: "permission denied for table conferencias" (y afecta también
-- a otras tablas, confirmado con admins) incluso usando la service_role key.
--
-- CAUSA RAÍZ: las tablas de este proyecto nunca recibieron el GRANT de
-- Postgres para los roles anon/authenticated/service_role. Esto es
-- independiente de Row Level Security: Postgres evalúa el GRANT de tabla
-- ANTES de evaluar las políticas RLS. Sin el GRANT, el acceso se deniega
-- de inmediato sin importar qué digan las políticas — por eso el error es
-- "permission denied" (privilegios) y no "new row violates row-level
-- security policy" (RLS), y por eso hasta service_role (que tiene
-- BYPASSRLS) también fallaba.
--
-- ESTA MIGRACIÓN NO TOCA NINGUNA POLÍTICA RLS. Todas las tablas de este
-- proyecto ya tienen RLS habilitado (`enable row level security`) con
-- políticas que exigen `is_admin()` para escribir. Ese sigue siendo el
-- único mecanismo real de autorización por fila. El GRANT de aquí solo le
-- da a los roles permiso para *intentar* la operación; RLS decide qué
-- filas puede tocar cada quien — exactamente el mismo modelo que usa
-- cualquier proyecto Supabase nuevo por defecto.
--
-- Ejecutar DESPUÉS de 0001, 0002 y 0003.
-- ============================================================

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to authenticated, service_role;

grant execute on all functions in schema public to anon, authenticated, service_role;

-- Para que las tablas/funciones/secuencias que se creen en migraciones
-- futuras hereden estos mismos privilegios automáticamente, sin depender
-- de que alguien recuerde otorgarlos a mano cada vez.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to anon, authenticated, service_role;
