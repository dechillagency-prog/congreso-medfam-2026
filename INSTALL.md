# INSTALL.md — Guía paso a paso desde cero

Esta guía asume que **nunca has usado Supabase** y que quieres dejar el sitio del
XXV Congreso Regional Noreste de Medicina Familiar funcionando de principio a fin:
base de datos, panel de administración y el sitio publicado en internet.

No te saltes pasos aunque te parezcan obvios — cada uno existe porque en algún punto
del desarrollo de este proyecto fue necesario para que algo funcionara.

Tiempo estimado: 45–60 minutos la primera vez.

---

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Descargar el proyecto](#2-descargar-el-proyecto)
3. [Crear tu cuenta y proyecto en Supabase](#3-crear-tu-cuenta-y-proyecto-en-supabase)
4. [Obtener tus credenciales de Supabase](#4-obtener-tus-credenciales-de-supabase)
5. [Ejecutar las migraciones SQL (en orden)](#5-ejecutar-las-migraciones-sql-en-orden)
6. [Verificar el bucket de Storage](#6-verificar-el-bucket-de-storage)
7. [Cargar datos de ejemplo (seed) — opcional](#7-cargar-datos-de-ejemplo-seed--opcional)
8. [Crear tu usuario administrador](#8-crear-tu-usuario-administrador)
9. [Configurar las variables de entorno](#9-configurar-las-variables-de-entorno)
10. [Instalar y correr el proyecto en tu computadora](#10-instalar-y-correr-el-proyecto-en-tu-computadora)
11. [Probar que todo funciona](#11-probar-que-todo-funciona)
12. [Desplegar en Vercel (publicar en internet)](#12-desplegar-en-vercel-publicar-en-internet)
13. [Regenerar los tipos de TypeScript (recomendado)](#13-regenerar-los-tipos-de-typescript-recomendado)
14. [Errores comunes y cómo solucionarlos](#14-errores-comunes-y-cómo-solucionarlos)
15. [Checklist final](#15-checklist-final)

---

## 1. Requisitos previos

Instala esto en tu computadora **antes** de empezar. Si ya lo tienes, puedes saltarte
el punto.

### 1.1 Node.js (versión 20 o superior)

1. Ve a [nodejs.org](https://nodejs.org).
2. Descarga la versión **LTS** (la que dice "Recommended for most users").
3. Instálalo como cualquier programa (Siguiente → Siguiente → Instalar).
4. Verifica que quedó instalado abriendo una terminal (en Windows: `cmd` o
   `PowerShell`; en Mac: `Terminal`) y escribiendo:
   ```bash
   node --version
   ```
   Debe mostrarte algo como `v20.x.x` o superior. Si te dice "comando no
   encontrado", reinicia tu computadora e inténtalo de nuevo — a veces Node no
   queda disponible hasta reiniciar.
5. Verifica también `npm` (viene incluido con Node):
   ```bash
   npm --version
   ```

### 1.2 Un editor de código

Si no tienes uno, instala [Visual Studio Code](https://code.visualstudio.com) — es
gratis y es el más común.

### 1.3 Una cuenta de GitHub (necesaria para el paso 12, Vercel)

Crea una cuenta gratis en [github.com](https://github.com) si no tienes una. La
necesitarás para publicar el sitio.

### 1.4 Una cuenta de Supabase

Ve a [supabase.com](https://supabase.com) y crea una cuenta gratis (puedes usar tu
cuenta de GitHub para entrar más rápido, con el botón "Continue with GitHub").

### 1.5 Una cuenta de Vercel (para publicar el sitio al final)

Ve a [vercel.com](https://vercel.com) y crea una cuenta gratis, también puedes usar
"Continue with GitHub".

---

## 2. Descargar el proyecto

1. Descomprime el archivo `.zip` del proyecto en una carpeta de tu computadora, por
   ejemplo `Documentos/congreso-medfam`.
2. Abre esa carpeta con Visual Studio Code: `Archivo → Abrir carpeta`.
3. Abre una terminal dentro de VS Code: menú `Terminal → Nueva terminal` (o el atajo
   `` Ctrl+` ``). Todos los comandos de esta guía se ejecutan ahí, dentro de la
   carpeta del proyecto.

---

## 3. Crear tu cuenta y proyecto en Supabase

Supabase es el servicio que va a alojar la base de datos, el login de
administradores, y el almacenamiento de los comprobantes de pago. Es gratis para
este tipo de proyecto (plan "Free").

1. Entra a [supabase.com](https://supabase.com) y haz clic en **Start your project**
   o **Sign in** si ya creaste tu cuenta en el paso 1.4.
2. Una vez dentro, haz clic en el botón verde **New project**.
3. Si es tu primera vez, te pedirá crear una **Organization** primero:
   - Nombre: puede ser el de tu agencia o tu nombre, por ejemplo `DeChill` o
     `Congreso Medicina Familiar`.
   - Tipo de plan: elige **Free**.
   - Clic en **Create organization**.
4. Ahora crea el proyecto (**New project**):
   - **Name**: `congreso-medfam-2026` (o el nombre que prefieras — es solo una
     etiqueta interna, no afecta nada del sitio).
   - **Database Password**: haz clic en **Generate a password** y **guarda esa
     contraseña en un lugar seguro** (un gestor de contraseñas, o una nota — la vas a
     necesitar solo si algún día te conectas directo a la base de datos con otra
     herramienta; no es la misma que las llaves que copiaremos más adelante).
   - **Region**: elige la más cercana a México. La opción recomendada suele ser
     `East US (North Virginia)` — Supabase no tiene una región en México todavía,
     así que la más cercana geográficamente es la mejor opción para velocidad.
   - **Pricing Plan**: **Free**.
5. Haz clic en **Create new project**.
6. Espera 1–2 minutos mientras Supabase prepara tu base de datos. Verás una pantalla
   de progreso ("Setting up project..."). No cierres la pestaña.
7. Cuando termine, llegarás automáticamente al **Dashboard** de tu proyecto.

✅ En este punto ya tienes tu proyecto de Supabase creado y vacío (sin tablas
todavía).

---

## 4. Obtener tus credenciales de Supabase

Necesitas 3 datos de tu proyecto. Vamos a copiarlos ahora y los vamos a pegar más
adelante en el paso 9.

1. Dentro de tu proyecto en Supabase, busca en el menú lateral izquierdo el ícono de
   engrane ⚙️ **Project Settings** (hasta abajo del todo).
2. Haz clic en **API** dentro de ese menú.
3. Vas a ver una sección llamada **Project API keys** con esta información — cópiala
   a un archivo de texto temporal, la necesitarás en el paso 9:

   | En Supabase se llama... | En nuestro proyecto se llama... |
   |---|---|
   | **Project URL** (arriba del todo) | `NEXT_PUBLIC_SUPABASE_URL` |
   | **anon** / **public** (dentro de "Project API keys") | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | **service_role** (dice "secret" al lado, con un botón para revelarla) | `SUPABASE_SERVICE_ROLE_KEY` |

⚠️ **Importante sobre la `service_role` key**: esta llave tiene permisos totales
sobre tu base de datos, sin restricciones de seguridad. Nunca la compartas, nunca la
subas a GitHub, nunca la pegues en un chat o en código que se vea desde el navegador.
En este proyecto solo vive en el archivo `.env.local` (que nunca se sube a GitHub,
como veremos en el paso 9).

---

## 5. Ejecutar las migraciones SQL (en orden)

Las "migraciones" son los archivos que crean todas las tablas, reglas de seguridad y
funciones dentro de tu base de datos. Están en la carpeta `supabase/migrations/` del
proyecto, numeradas en el orden exacto en que se deben ejecutar. **No cambies el
orden.**

### 5.1 Abrir el editor SQL de Supabase

1. En el menú lateral izquierdo de tu proyecto de Supabase, haz clic en el ícono
   `</>` **SQL Editor**.
2. Haz clic en **New query** (botón arriba a la derecha, o "+").

### 5.2 Ejecutar la migración 1

1. En tu computadora, abre el archivo `supabase/migrations/0001_init.sql` con VS
   Code.
2. Selecciona **todo** el contenido del archivo (`Ctrl+A` / `Cmd+A`) y cópialo
   (`Ctrl+C` / `Cmd+C`).
3. Regresa a la pestaña del navegador donde tienes el SQL Editor de Supabase abierto
   y pega el contenido ahí (`Ctrl+V` / `Cmd+V`).
4. Haz clic en el botón **Run** (o el atajo `Ctrl+Enter` / `Cmd+Enter`).
5. Espera unos segundos. Abajo debe aparecer **"Success. No rows returned"** en
   verde. Eso significa que funcionó.
   - Si en vez de eso aparece un mensaje en rojo que empieza con `ERROR:`, ve a la
     sección [14. Errores comunes](#14-errores-comunes-y-cómo-solucionarlos) antes de
     continuar.

### 5.3 Ejecutar la migración 2

1. Haz clic en **New query** otra vez (para tener un espacio limpio).
2. Abre `supabase/migrations/0002_admin_approval_flow.sql`, copia todo su
   contenido, pégalo en el nuevo query, y haz clic en **Run**.
3. Espera el mensaje **"Success. No rows returned"**.

### 5.4 Ejecutar la migración 3

1. Haz clic en **New query** otra vez.
2. Abre `supabase/migrations/0003_produccion.sql`, copia todo, pégalo, y **Run**.
3. Espera **"Success. No rows returned"**.

### 5.5 Verificar que las tablas se crearon

1. En el menú lateral izquierdo, haz clic en el ícono de tabla 🗄️ **Table Editor**.
2. Deberías ver, en el menú de la izquierda dentro del Table Editor, esta lista de
   tablas: `admins`, `asistencia_conferencias`, `categorias_patrocinio`, `checkins`,
   `comprobantes`, `conferencias`, `configuraciones`, `encuesta_respuestas`,
   `encuestas`, `patrocinadores`, `ponentes`, `registros`.
3. Si ves las 12 tablas, ✅ las migraciones funcionaron correctamente.
4. Haz clic en `configuraciones` — deberías ver ya 3 filas dentro
   (`cupo_maximo`, `fecha_limite_tarifa_preferencial`, `inscripciones_abiertas`).
   Eso confirma que la migración 2 se ejecutó bien.
5. Haz clic en `categorias_patrocinio` — deberías ver 4 filas (`Platinum`, `Gold`,
   `Silver`, `Partners`). Eso confirma que la migración 3 se ejecutó bien.

---

## 6. Verificar el bucket de Storage

El "bucket" es la carpeta especial de Supabase donde se guardan los comprobantes de
pago que suben los asistentes. La migración 1 ya lo crea automáticamente, pero
vamos a confirmar que quedó bien.

1. En el menú lateral izquierdo, haz clic en el ícono de carpeta 📦 **Storage**.
2. Deberías ver un bucket llamado **comprobantes** en la lista.
3. Haz clic en él — debe estar vacío por ahora (se llenará cuando alguien se
   registre desde el sitio).
4. Fíjate que tenga un candado 🔒 junto al nombre — significa que es **privado**
   (nadie puede ver los comprobantes de otras personas sin ser administrador). Esto
   es correcto y está configurado así a propósito en la migración 1.

**Si el bucket NO aparece:** significa que la migración 1 no se ejecutó
correctamente. Regresa al paso 5.2 y vuelve a correrla — es segura de repetir, no
duplica nada.

---

## 7. Cargar datos de ejemplo (seed) — opcional

Este paso es opcional pero muy recomendable la primera vez, para poder probar el
sitio con contenido real antes de tener el contenido definitivo del congreso.

1. En el SQL Editor de Supabase, haz clic en **New query**.
2. Abre `supabase/seed.sql` en tu computadora, copia todo el contenido, pégalo, y
   haz clic en **Run**.
3. Verifica en el **Table Editor** que la tabla `ponentes` ahora tiene 4 filas y
   `conferencias` tiene 6 filas.

Puedes correr este archivo las veces que quieras — está escrito para no duplicar
datos si ya existen.

---

## 8. Crear tu usuario administrador

Este es el paso que te da acceso al panel `/admin` del sitio. Tiene **dos partes** —
si haces solo la primera, podrás iniciar sesión pero no vas a poder ver ni aprobar
nada. Es importante hacer ambas.

### 8.1 Parte 1 — Crear el usuario de acceso (login)

1. En el menú lateral izquierdo de Supabase, haz clic en el ícono de persona 👤
   **Authentication**.
2. Haz clic en la pestaña **Users** (debería estar seleccionada por defecto).
3. Haz clic en el botón verde **Add user** → **Create new user**.
4. Llena el formulario:
   - **Email**: el correo con el que vas a iniciar sesión en `/admin` (por ejemplo
     `admin@congresomedfam2026.mx`).
   - **Password**: una contraseña segura. Guárdala — la vas a usar para entrar al
     panel.
   - Deja marcada la opción **Auto Confirm User** (si no la marcas, el usuario
     quedará como "no confirmado" y no podrá iniciar sesión hasta confirmar su
     correo, lo cual no funcionará porque no hemos configurado un proveedor de
     correo todavía).
5. Haz clic en **Create user**.
6. Verás al usuario en la lista. Haz clic sobre su fila para abrir su detalle.
7. **Copia el UUID** que aparece arriba (es un texto largo tipo
   `a1b2c3d4-e5f6-7890-abcd-ef1234567890`). Lo vas a necesitar en el siguiente paso.

### 8.2 Parte 2 — Darle el rol de administrador

Sin este paso, el usuario puede iniciar sesión pero el panel se verá vacío o dará
errores de permisos — es a propósito, así lo exige la seguridad de la base de datos
(RLS).

1. Regresa al **SQL Editor** → **New query**.
2. Pega esto, **reemplazando** `<uuid-del-usuario>` con el UUID que copiaste, y
   `Tu nombre` con tu nombre real:
   ```sql
   insert into public.admins (id, nombre, rol)
   values ('<uuid-del-usuario>', 'Tu nombre', 'super_admin');
   ```
3. Haz clic en **Run**. Debe decir **"Success. 1 rows returned"** (o similar).
4. Verifica en el **Table Editor** → tabla `admins` que ahora aparece tu fila con
   `rol = super_admin`.

✅ Con esto tu usuario ya puede iniciar sesión en `/admin` y tiene permisos
completos.

**¿Vas a tener más de un administrador?** Repite el paso 8.1 por cada persona (un
usuario por correo), y luego el 8.2 para cada uno — puedes ponerles `rol` de
`super_admin` (control total, incluyendo administrar a otros admins) o `organizador`
(puede aprobar registros y editar contenido, pero no gestionar otros administradores).

---

## 9. Configurar las variables de entorno

Las "variables de entorno" son la forma en que el proyecto sabe a qué proyecto de
Supabase conectarse — son los 3 datos que copiaste en el paso 4.

1. En VS Code, dentro de la carpeta del proyecto, busca el archivo
   `.env.local.example`.
2. Haz una copia de ese archivo y renómbrala a `.env.local` exactamente (con el
   punto al inicio). Puedes hacerlo:
   - Desde la terminal:
     ```bash
     cp .env.local.example .env.local
     ```
   - O manualmente: clic derecho sobre `.env.local.example` → **Copiar**, clic
     derecho en la carpeta → **Pegar**, y renombra la copia a `.env.local`.
3. Abre `.env.local` y reemplaza los valores de ejemplo con tus 3 datos reales del
   paso 4:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. Guarda el archivo (`Ctrl+S` / `Cmd+S`).

⚠️ **`.env.local` nunca se sube a GitHub** — el proyecto ya tiene configurado un
archivo `.gitignore` que lo excluye automáticamente. No lo edites para incluirlo.

---

## 10. Instalar y correr el proyecto en tu computadora

1. En la terminal de VS Code (dentro de la carpeta del proyecto), instala las
   dependencias:
   ```bash
   npm install
   ```
   Esto puede tardar 1–3 minutos la primera vez. Vas a ver muchas líneas de texto —
   es normal. Al final debe decir algo como `added XXX packages`.
2. Inicia el proyecto en modo desarrollo:
   ```bash
   npm run dev
   ```
3. Cuando veas en la terminal algo como:
   ```
   ▲ Next.js 15.5.22
   - Local:        http://localhost:3000
   ✓ Ready in Xs
   ```
   abre tu navegador y ve a **http://localhost:3000**.
4. Deberías ver el sitio del congreso funcionando, con el Hero, las estadísticas,
   etc.

Para detener el servidor en cualquier momento, regresa a la terminal y presiona
`Ctrl+C`.

---

## 11. Probar que todo funciona

Antes de publicar el sitio, prueba el flujo completo localmente:

1. **Registro público**: ve a `http://localhost:3000/registro`, llena el
   formulario con datos de prueba y sube cualquier imagen o PDF como comprobante.
   Al enviarlo deberías ver un folio tipo `MF2026-0001`.
2. **Verifica en Supabase**: ve a **Table Editor** → `registros` — debe aparecer tu
   registro de prueba con `estatus_pago = pendiente`.
3. **Login de administrador**: ve a `http://localhost:3000/admin/login` e inicia
   sesión con el correo y contraseña que creaste en el paso 8.1.
4. **Panel administrativo**: deberías llegar a `/admin/dashboard` y ver tu registro
   de prueba en la tabla, con botones **Aprobar** y **Rechazar**.
5. **Aprobar**: haz clic en **Aprobar** — el estatus debe cambiar a "Confirmado" y
   debe aparecer un código QR debajo del folio.
6. Navega por las demás secciones del panel (Ponentes, Conferencias,
   Patrocinadores, Categorías, Configuración) y prueba crear/editar/eliminar algo de
   prueba.

Si todos estos pasos funcionan, tu instalación está completa y correcta.

---

## 12. Desplegar en Vercel (publicar en internet)

Hasta ahora el sitio solo funciona en tu computadora (`localhost`). Este paso lo
publica en una URL real de internet.

### 12.1 Subir el proyecto a GitHub

1. Ve a [github.com](https://github.com) → botón verde **New** (crear repositorio).
2. Nómbralo, por ejemplo, `congreso-medfam-2026`.
3. Déjalo como **Private** (recomendado, ya que el código incluye la estructura de
   tu base de datos) o **Public**, como prefieras.
4. **No** marques "Add a README file" (el proyecto ya tiene uno).
5. Haz clic en **Create repository**.
6. GitHub te va a mostrar una serie de comandos. En tu terminal, dentro de la
   carpeta del proyecto, ejecuta (reemplazando la URL por la que te dé GitHub):
   ```bash
   git init
   git add .
   git commit -m "Primer commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/congreso-medfam-2026.git
   git push -u origin main
   ```
   Si te pide iniciar sesión, sigue las instrucciones en pantalla (usualmente abre
   el navegador para autenticarte).

### 12.2 Importar el proyecto en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new).
2. Si es tu primera vez, autoriza a Vercel a acceder a tu cuenta de GitHub.
3. Busca tu repositorio `congreso-medfam-2026` en la lista y haz clic en
   **Import**.
4. En la pantalla de configuración:
   - **Framework Preset**: debe detectar automáticamente **Next.js**. Si no,
     selecciónalo manualmente.
   - No cambies nada más de la configuración de build.

### 12.3 Agregar las variables de entorno en Vercel

Antes de hacer clic en Deploy, expande la sección **Environment Variables** en esa
misma pantalla y agrega las 3 mismas variables de tu archivo `.env.local`:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | (tu Project URL) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (tu anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | (tu service_role key) |

Agrega cada una con el botón **Add** después de escribir el nombre y el valor.

### 12.4 Desplegar

1. Haz clic en **Deploy**.
2. Espera 2–4 minutos mientras Vercel construye el sitio (verás una barra de
   progreso y logs en tiempo real).
3. Cuando termine, verás una pantalla de celebración con una captura del sitio y un
   botón para visitarlo. Tu sitio ya está en internet, en una URL parecida a
   `congreso-medfam-2026.vercel.app`.

### 12.5 (Opcional) Conectar tu propio dominio

Si tienes un dominio como `congresomedfam2026.mx`:

1. En el proyecto de Vercel, ve a **Settings → Domains**.
2. Escribe tu dominio y haz clic en **Add**.
3. Vercel te va a mostrar uno o dos registros DNS (tipo `A` o `CNAME`) que debes
   agregar en el panel de administración de tu dominio (GoDaddy, Namecheap, etc.).
   Ese paso varía según dónde compraste el dominio — si tienes dudas, el soporte de
   Vercel tiene guías específicas por proveedor.
4. La propagación puede tardar desde minutos hasta 24–48 horas.

### 12.6 Actualizar el sitio después de cambios

Cada vez que quieras publicar un cambio (por ejemplo, después de reemplazar
contenido o pedirle ajustes a Claude Code):

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

Vercel detecta el `push` automáticamente y vuelve a desplegar el sitio solo, sin que
tengas que repetir ningún paso de configuración.

---

## 13. Regenerar los tipos de TypeScript (recomendado)

El archivo `types/supabase.ts` de este proyecto se escribió a mano para que
compilara desde el primer día. Ahora que tu proyecto de Supabase ya existe, es buena
práctica reemplazarlo por el que Supabase genera automáticamente a partir de tu
base de datos real — así queda sincronizado con cualquier cambio futuro.

1. Necesitas el **Project ID** de tu proyecto — lo encuentras en **Project
   Settings → General**, campo **Reference ID** (un texto corto, no la URL
   completa).
2. En la terminal, dentro de la carpeta del proyecto:
   ```bash
   npx supabase login
   ```
   Esto abre tu navegador para autenticarte con tu cuenta de Supabase.
3. Genera el archivo:
   ```bash
   npx supabase gen types typescript --project-id <tu-project-id> > types/supabase.ts
   ```
4. Corre `npm run dev` de nuevo y confirma que el sitio sigue funcionando igual — si
   algo se rompe, seguramente es una diferencia entre el tipado a mano y el real, y
   TypeScript te va a señalar exactamente en qué archivo.

Este paso es opcional para que el sitio funcione, pero muy recomendable para que el
proyecto sea sólido a largo plazo, sobre todo si vas a seguir agregando funciones.

---

## 14. Errores comunes y cómo solucionarlos

| Error / síntoma | Causa más probable | Solución |
|---|---|---|
| En el SQL Editor: `ERROR: relation "public.registros" does not exist` | Ejecutaste una migración fuera de orden (por ejemplo, la 0002 antes que la 0001) | Corre las migraciones en orden estricto: 0001 → 0002 → 0003 |
| En el SQL Editor: `ERROR: type "tipo_inscripcion" already exists` | Ya habías corrido esa parte del script antes | No es un problema real — todos los scripts están escritos para poder repetirse sin romper nada. Puedes ignorar este error puntual y seguir |
| Inicias sesión en `/admin/login` pero `/admin/dashboard` se ve vacío o da error | Falta el paso 8.2 — creaste el usuario pero no le diste el rol de admin en la tabla `admins` | Repite el paso 8.2 con el UUID correcto de tu usuario |
| Al registrarte desde `/registro`, error "No se pudo subir el comprobante" | El bucket `comprobantes` no se creó (falló la migración 0001) o tu conexión a internet se cortó a media subida | Verifica el paso 6. Si el bucket no aparece, vuelve a correr `0001_init.sql` |
| El sitio en `localhost:3000` no carga nada, o da error de conexión a Supabase | Falta el archivo `.env.local`, tiene un typo, o no reiniciaste el servidor después de crearlo | Verifica que el archivo se llame exactamente `.env.local` (con el punto), que no tenga comillas alrededor de los valores, y detén (`Ctrl+C`) y vuelve a correr `npm run dev` — **las variables de entorno solo se leen al iniciar el servidor** |
| Error `Invalid API key` en el navegador o en la terminal | Copiaste mal una de las llaves (espacios de más, falta un carácter) o mezclaste la `anon` key con la `service_role` key en el lugar equivocado | Vuelve al paso 4, copia las llaves de nuevo con cuidado, sin espacios extra al inicio o final |
| Al hacer `npm install`, error de `ERESOLVE unable to resolve dependency tree` | Puede pasar si mezclaste versiones de paquetes manualmente | Corre `npm install --legacy-peer-deps` como alternativa, o borra `node_modules` y `package-lock.json` y vuelve a intentar `npm install` |
| El build de Vercel falla con un error sobre variables de entorno | No agregaste las 3 variables en el paso 12.3, o les falta una | Ve a **Vercel → tu proyecto → Settings → Environment Variables**, confirma que las 3 estén escritas exactamente igual que en tu `.env.local`, y vuelve a desplegar (**Deployments → ⋯ → Redeploy**) |
| El build de Vercel falla por no poder descargar las fuentes de Google (Inter/Manrope) | Muy raro en Vercel (sí tiene salida a internet), pero puede pasar por un problema temporal de red | Ve a **Deployments → ⋯ → Redeploy** para reintentar. Si persiste, revisa el estado de servicios de Vercel en [vercel-status.com](https://www.vercel-status.com) |
| Puedes ver el sitio público pero no puedes aprobar/rechazar registros ni editar contenido desde `/admin` aunque sí iniciaste sesión como admin | Tu usuario tiene rol pero quizás lo escribiste distinto a `super_admin` u `organizador` (con mayúsculas, espacios, etc.) | En el Table Editor, revisa la fila en `admins` y confirma que la columna `rol` diga exactamente `super_admin` u `organizador`, en minúsculas |
| Al correr una migración aparece `ERROR: permission denied for schema storage` | Muy raro, pero puede pasar en proyectos con configuraciones especiales de Supabase | Verifica que estés usando el SQL Editor de **tu propio proyecto** (revisa la URL del navegador) y no un proyecto compartido con permisos limitados |
| Olvidaste la contraseña del usuario administrador | — | En Supabase, ve a **Authentication → Users**, haz clic en el usuario, y usa la opción para enviar un enlace de restablecimiento o (más simple mientras no haya proveedor de correo conectado) bórralo y créalo de nuevo repitiendo el paso 8 completo |
| Necesitas agregar un segundo administrador más adelante | — | Repite el paso 8 completo (8.1 y 8.2) con el correo de la nueva persona |
| Después de un tiempo sin usarlo, el proyecto de Supabase gratuito se "pausó" | Los proyectos gratuitos de Supabase se pausan automáticamente tras un periodo largo de inactividad | Entra al dashboard de Supabase — te va a mostrar un botón para reactivar el proyecto ("Restore project"). Tarda uno o dos minutos |

---

## 15. Checklist final

Marca cada punto antes de considerar la instalación completa:

- [ ] Node.js instalado (`node --version` funciona)
- [ ] Proyecto de Supabase creado
- [ ] Las 3 credenciales copiadas (`URL`, `anon key`, `service_role key`)
- [ ] Migración `0001_init.sql` ejecutada sin errores
- [ ] Migración `0002_admin_approval_flow.sql` ejecutada sin errores
- [ ] Migración `0003_produccion.sql` ejecutada sin errores
- [ ] Las 12 tablas visibles en el Table Editor
- [ ] Bucket `comprobantes` visible en Storage
- [ ] (Opcional) `seed.sql` ejecutado
- [ ] Usuario administrador creado en Authentication → Users
- [ ] Fila correspondiente insertada en la tabla `admins` con el UUID correcto
- [ ] Archivo `.env.local` creado con las 3 variables correctas
- [ ] `npm install` corrido sin errores
- [ ] `npm run dev` corre y el sitio carga en `localhost:3000`
- [ ] Registro de prueba completado desde `/registro`
- [ ] Login exitoso en `/admin/login`
- [ ] Registro de prueba aprobado desde `/admin/dashboard`
- [ ] Proyecto subido a GitHub
- [ ] Proyecto importado y desplegado en Vercel con las 3 variables de entorno
- [ ] Sitio funcionando en la URL pública de Vercel

Si todos los puntos están marcados, la instalación quedó completa y el sistema está
listo para que reemplaces el contenido de ejemplo por el contenido real del
congreso.
