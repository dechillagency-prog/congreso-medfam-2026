-- ============================================================
-- XXV Congreso Regional Noreste de Medicina Familiar 2026
-- Migración 7: asegura que exista la fila de configuración
-- "whatsapp_comunidad_url" (vacía por defecto) para que el campo
-- del panel de administración tenga siempre una fila real desde
-- el primer momento, sin depender de que un admin la guarde antes.
--
-- Segura de correr más de una vez: `on conflict do nothing` no
-- pisa un valor que ya haya sido configurado.
--
-- Ejecutar DESPUÉS de 0001-0006.
-- ============================================================

insert into public.configuraciones (clave, valor)
values ('whatsapp_comunidad_url', '""'::jsonb)
on conflict (clave) do nothing;
