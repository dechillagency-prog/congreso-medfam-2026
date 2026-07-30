# XXV Congreso Regional Noreste de Medicina Familiar 2026

Plataforma oficial del congreso — Next.js 15 + React 19 + TypeScript + Tailwind + Supabase.
Arquitectura pensada para reutilizarse en las próximas ediciones del congreso.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion ·
Lucide Icons · Supabase (Postgres + Auth + Storage + RLS) · React Hook Form + Zod ·
Server Actions

---

## Despliegue paso a paso

> ¿Primera vez usando Supabase? Sigue **[INSTALL.md](./INSTALL.md)** — es una guía
> extremadamente detallada, pensada para alguien que nunca lo ha usado, con cada
> clic explicado, verificaciones en cada paso y una tabla de errores comunes. Lo de
> abajo es la versión resumida para quien ya tiene experiencia.

### 1. Crear el proyecto en Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) (región recomendada: la
   más cercana a México, p. ej. `us-east-1`).
2. En **Project Settings → API**, copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (secreta, nunca va al cliente)

### 2. Ejecutar las migraciones (en orden, en el SQL Editor de Supabase)

```
supabase/migrations/0001_init.sql              -- tablas base, storage, RLS inicial
supabase/migrations/0002_admin_approval_flow.sql -- admins, comprobantes, configuraciones, aprobación
supabase/migrations/0003_produccion.sql        -- folio MF2026-0001, categorías reales, check-in, encuestas, roles
```

Cada archivo es idempotente (usa `if not exists` / `on conflict`), así que si algo
falla a medio camino puedes corregir y volver a correr el mismo archivo sin duplicar
nada.

### 3. Cargar datos de ejemplo (opcional pero recomendado para probar)

```
supabase/seed.sql
```

Crea 4 ponentes, 6 conferencias, 3 patrocinadores, 1 encuesta y 1 registro de prueba —
todo con datos ficticios que se reemplazan después desde el dashboard.

### 4. Crear tu usuario administrador

1. **Authentication → Users → Add user** — correo + contraseña.
2. Copia el UUID del usuario recién creado.
3. En el SQL Editor:
   ```sql
   insert into public.admins (id, nombre, rol)
   values ('<uuid-del-usuario>', 'Tu nombre', 'super_admin');
   ```
   Sin este paso el usuario puede iniciar sesión pero **no verá nada** en `/admin` —
   la fila en `admins` es lo que otorga el rol, no el login en sí (así lo exige RLS).

### 5. Variables de entorno

```bash
cp .env.local.example .env.local
```

Y llena las 3 variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 6. Instalar y correr

```bash
npm install
npm run dev
```

### 7. (Recomendado) Regenerar los tipos desde el proyecto real

`types/supabase.ts` se escribió a mano para que el proyecto compile con tipado
completo desde el día uno. En cuanto tengas el proyecto conectado, sustitúyelo por el
tipado real generado por Supabase, para que quede sincronizado byte a byte con
cualquier ajuste futuro al esquema:

```bash
npx supabase login
npx supabase gen types typescript --project-id <tu-project-id> > types/supabase.ts
```

### 8. Desplegar en Vercel

1. Sube el repo a GitHub.
2. Importa el proyecto en [vercel.com](https://vercel.com).
3. Agrega las mismas 3 variables de entorno en **Project Settings → Environment
   Variables**.
4. Deploy.

---

## Estructura

```
app/
  page.tsx                  Inicio (Hero, Stats, About)
  programa/                 Timeline por día — lee de Supabase (conferencias + ponentes)
  ponentes/                 Grid de ponentes — lee de Supabase
  costos/                   Tarjetas de precios
  hospedaje/                Hoteles oficiales
  patrocinadores/           Logos por categoría — lee de Supabase (join con categorías)
  registro/                 Formulario público + Server Action de inscripción
  contacto/
  admin/
    login/                  Login con Supabase Auth
    dashboard/
      layout.tsx             Nav compartido entre secciones del panel
      page.tsx                Registros: stats, tabla, aprobar/rechazar
      ponentes/                CRUD completo
      conferencias/            CRUD completo (con selector de ponente)
      patrocinadores/          CRUD completo (con selector de categoría)
      categorias/              CRUD de categorías de patrocinio
      configuracion/           Ajustes del evento (cupo, fechas, flags, libres)
  api/admin/export-csv/     Exportación CSV (protegida por sesión + is_admin())
components/
  layout/                   Navbar, Footer
  sections/                 Hero, Stats, About, ProgramaTabs
  ui/                       Button, Card, Badge (estilo shadcn)
  forms/                    Formulario de registro
  admin/                    Managers de cada CRUD, badges, acciones de aprobación
lib/
  supabase/                 Clientes browser/server/admin, tipados con Database
  validations/               Esquemas Zod
  config.ts                  Helper de lectura de `configuraciones`
  email/                     Estructura lista, proveedor de correo pendiente
supabase/
  migrations/                0001 → 0003, en orden
  seed.sql                   Datos de ejemplo
types/
  supabase.ts                 Database — reemplazar por el generado real (paso 7)
  index.ts                    Alias de dominio derivados de Database
```

---

## Lo que queda 100% funcional de punta a punta

- **Registro público** → sube comprobante a Storage (con historial en la tabla
  `comprobantes`) → **folio consecutivo real** generado en Postgres con el formato
  `MF2026-0001` (no un UUID cosmético, y reutilizable para congresos futuros).
- **Autenticación de administradores** con Supabase Auth + rol (`admins.rol`:
  `super_admin` / `organizador`), reforzado con RLS (`is_admin()`, `is_super_admin()`)
  y con middleware que protege `/admin/*`.
- **Aprobación de comprobantes**: Aprobar / Rechazar (con motivo) vía funciones
  `security definer` en Postgres — la regla de negocio vive en la base de datos, no
  solo en el código de la app. Al aprobar se genera el `codigo_qr` automáticamente.
- **CRUD completo** (crear, editar, eliminar, listado en vivo) para:
  Registros (aprobar/rechazar/reabrir) · Ponentes · Conferencias · Patrocinadores ·
  Categorías de patrocinio · Configuración del evento.
- **Dashboard administrativo** con conteos en vivo, desglose por especialidad/estado,
  exportación CSV, y navegación entre las 6 secciones.
- Tipado end-to-end con `Database` (formato Supabase CLI) — todas las consultas y
  Server Actions están tipadas contra el esquema real.
- SEO: metadata, Open Graph, Twitter Cards, `schema.org/MedicalConference`, robots,
  sitemap.

## Arquitectura ya preparada para (sin rediseñar el esquema):

- **Constancias PDF**: columna `registros.constancia_url` lista para apuntar al PDF
  generado; solo falta la función de generación (ideal como Edge Function o Route
  Handler con una librería como `@react-pdf/renderer`).
- **QR único por asistente**: `registros.codigo_qr` se genera automáticamente al
  aprobar el pago.
- **Check-in por QR**: tabla `checkins` + función `registrar_checkin(codigo_qr)` ya
  creadas — marca `asistencia_confirmada` automáticamente vía trigger. Solo falta la
  pantalla de escaneo (p. ej. con `html5-qrcode` en el navegador del staff).
- **Control de asistencia por conferencia**: tabla `asistencia_conferencias` lista
  para el mismo flujo de check-in aplicado a cada sesión.
- **Encuestas de satisfacción**: tablas `encuestas` (preguntas en JSON flexible) y
  `encuesta_respuestas` ya creadas, con RLS pública para responder y privada para
  leer resultados.
- **Estadísticas**: vista `vista_estadisticas_congreso` ya agregada en la base de
  datos — el futuro panel de estadísticas solo necesita un `select * from
  vista_estadisticas_congreso`.
- **Envío automático de correos**: estructura documentada en `lib/email/README.md`,
  con los 3 puntos exactos del código donde conectar el proveedor.
- **Exportación a Excel**: la exportación CSV actual (`/api/admin/export-csv`) es la
  base — cambiar a `.xlsx` es sustituir la generación del archivo, no el query.

## Pendiente para producción

- **Contenido real**: reemplazar los datos del seed (ponentes, conferencias,
  patrocinadores) desde el dashboard — ya no hace falta tocar código.
- **Fotografías reales** del congreso en `/public/images` (el PRD pide explícitamente
  no usar stock con apariencia falsa).
- **Proveedor de correo** (Resend/SendGrid) — ver `lib/email/README.md`.
- **Aviso de privacidad** — falta la página `/aviso-privacidad` enlazada desde el
  formulario de registro.
- Las 8 funciones futuras listadas arriba tienen el esquema listo pero no la interfaz
  (pantalla de escaneo QR, generación de PDF, envío de correos, panel de
  estadísticas, exportación Excel, encuestas del lado del asistente).
