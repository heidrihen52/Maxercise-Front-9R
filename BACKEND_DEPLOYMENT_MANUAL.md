# 🚀 Guía de Despliegue de la API (Backend) - Opciones Gratuitas

Este manual detalla paso a paso cómo desplegar el servidor backend (Node.js + Express + Prisma + Socket.IO) de **Maxercise** utilizando servicios en la nube con capas gratuitas.

---

## ⚠️ ¿Por qué Vercel NO es recomendado para este Backend?
Aunque Vercel es fantástico para el Frontend (React/Vite), **no es adecuado para este Backend** debido a las siguientes limitaciones:
1. **WebSockets (Socket.IO):** El backend utiliza `Socket.IO` para la comunicación en tiempo real. Las funciones Serverless de Vercel no permiten conexiones de red persistentes (TCP/WebSockets).
2. **Limitaciones de Tiempo de Ejecución:** Las funciones en la capa gratuita de Vercel tienen un tiempo de ejecución máximo de 10 a 15 segundos.
3. **Conexiones a la Base de Datos:** Cada petición en Vercel puede levantar una instancia de función diferente, abriendo nuevas conexiones y saturando rápidamente el límite de conexiones de tu base de datos MySQL.

Por ello, la opción recomendada para mantener el backend activo, con soporte completo de WebSockets y sin costo, es **Render.com**.

---

## 🛠️ Requisitos Previos
1. Una cuenta activa en [Render.com](https://render.com).
2. El código de tu proyecto subido a un repositorio de **GitHub** (o GitLab).
3. Una base de datos **MySQL** pública. (Ver sección siguiente para obtener una base de datos gratuita).

---

## 1. 💾 Obtener una Base de Datos MySQL Gratis

Dado que Render no incluye una base de datos MySQL gratuita en su panel (solo PostgreSQL de corta duración), usaremos un proveedor externo de base de datos MySQL gratis compatible con Prisma:

### Opción A: TiDB Cloud (Recomendado - 5GB Gratis)
TiDB es una base de datos distribuida totalmente compatible con el protocolo MySQL que ofrece una capa gratuita permanente muy generosa (5 GiB de almacenamiento y 50 millones de Request Units mensuales).

Sigue estos pasos detallados para crear tu base de datos:

#### Paso 1: Registro e inicio de sesión
1. Entra a [TiDB Cloud](https://pingcap.com/tidb-cloud) y regístrate con tu correo, o inicia sesión rápidamente usando tu cuenta de Google o GitHub.
2. Una vez completado el registro, serás redirigido al panel principal de administración de TiDB Cloud.

#### Paso 2: Crear el Clúster Serverless
1. En la parte superior derecha de tu consola, haz clic en el botón azul **"Create Cluster"** (o en **"Get Started for Free"** si es tu primera vez).
2. Se te presentarán varias opciones de tipo de clúster:
   * **TiDB Serverless** (Capa gratuita de $0/mes) ➔ **Selecciona esta opción**.
   * *TiDB Dedicated* (Opción de pago).
3. Configura los detalles del clúster:
   * **Cluster Name**: Escribe un nombre identificativo para tu base de datos (por ejemplo: `maxercise-db`).
   * **Cloud Provider**: Elige **AWS** (es el proveedor por defecto para la capa gratuita).
   * **Region**: Selecciona la región que esté más cerca del servidor donde desplegarás tu backend (por ejemplo, si vas a usar la región por defecto de Render en el este de EE.UU., selecciona **AWS N. Virginia (us-east-1)** o **AWS Oregon (us-west-2)**). Esto minimiza la latencia de las consultas.
4. Haz clic en **"Create"**. La creación del clúster tardará entre 10 y 20 segundos. Verás una barra de progreso que indica que se está aprovisionando tu base de datos.

#### Paso 3: Definir la Contraseña y Obtener la URL de Conexión
1. Una vez que el estado del clúster cambie a **"Active"**, aparecerá una ventana emergente para que definas la contraseña del usuario `root` (o administrador).
2. Haz clic en **"Generate Password"** para que TiDB cree una contraseña segura aleatoria, o escribe una de tu preferencia. **Guarda muy bien esta contraseña**, ya que no se volverá a mostrar en texto plano.
3. Haz clic en **"Connect"** (si la ventana no se abrió sola, verás un botón **"Connect"** en la parte superior derecha del clúster).
4. En el panel de conexión:
   * **Connection Method**: Selecciona la pestaña **"Prisma"** (ya que tu backend utiliza Prisma ORM).
   * **Connection String**: Copia el código o URL de conexión que te genera de forma automática. El formato de la URL de base de datos para Prisma será el siguiente:
     ```text
     mysql://[USUARIO].[PREFIX]:[PASSWORD]@[HOST]:4000/[DB_NAME]?sslaccept=strict
     ```
     *(TiDB Cloud requiere conexiones cifradas SSL obligatoriamente, por lo que el parámetro `?sslaccept=strict` al final es fundamental para que Prisma no dé error de conexión).*
5. Por defecto, TiDB Cloud te crea una base de datos llamada `test`. Puedes usar esa misma base de datos reemplazando `[DB_NAME]` por `test`, o dejar el enlace tal como te lo genera la consola de TiDB.
6. **Copia esta URL**, la usaremos como tu variable de entorno `DATABASE_URL` tanto localmente para migrar como en el panel de Render.


### Opción B: Clever Cloud (20MB Gratis)
Clever Cloud es ideal para proyectos pequeños y te da una base de datos MySQL nativa de forma gratuita e ilimitada en tiempo.
1. Regístrate en [Clever Cloud](https://www.clever-cloud.com).
2. Ve a la consola y haz clic en **"Create"** ➔ **"an add-on"**.
3. Selecciona **MySQL Add-on**, elige el plan **Shared (Free)** y dale un nombre.
4. En la pestaña de información del Add-on verás las credenciales: Host, Database Name, User, Password, Port.
5. Construye tu URL de conexión con este formato:
   `mysql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE_NAME>`
6. **Copia esta URL** para configurar tu `DATABASE_URL`.

---

## 2. 🚀 Despliegue del Backend en Render.com

Render permite desplegar servicios web basados en contenedores o código de Node.js de forma gratuita.

### Paso 1: Crear un nuevo Web Service en Render
1. Ve al panel de control de **Render** y presiona **"New +"** ➔ **"Web Service"**.
2. Conecta tu cuenta de GitHub y selecciona tu repositorio (ej. `Maxercise-Front-9R`).

### Paso 2: Configurar los parámetros del despliegue
En el formulario de configuración, completa la información de la siguiente manera:

* **Name:** `maxercise-backend` (o el nombre que prefieras).
* **Region:** Selecciona la más cercana a ti (por ejemplo, *Ohio (us-east-2)* o *Oregon (us-west-2)*).
* **Branch:** `main` (o tu rama de producción).
* **Root Directory:** **`Backend`** *(Es crucial especificar esto ya que el backend está en una subcarpeta del repositorio).*
* **Runtime:** `Node`
* **Build Command:**
  ```bash
  npm install && npx prisma generate && npm run build
  ```
* **Start Command:**
  ```bash
  npm start
  ```
* **Instance Type:** Selecciona **Free** ($0/month).

### Paso 3: Configurar las Variables de Entorno (Environment Variables)
Haz clic en la pestaña **"Environment"** o en la sección **"Advanced"** de la configuración y añade las siguientes variables:

| Clave | Valor | Descripción |
|---|---|---|
| `DATABASE_URL` | *Tu URL de conexión copiada en el Paso 1* | URL de conexión MySQL |
| `JWT_SECRET` | *Genera una cadena aleatoria larga y segura* | Clave para firmar tokens JWT |
| `PORT` | `3000` | Puerto en el que escucha Express |
| `NODE_ENV` | `production` | Indica el entorno de producción |
| `SUPABASE_URL` | *Tu URL de Supabase* | Para la gestión de archivos (Storage) |
| `SUPABASE_ANON_KEY` | *Tu clave pública anónima de Supabase* | Para la gestión de archivos (Storage) |
| `MAILTRAP_HOST` | *Host del servidor de correo* | Si usas envío de correos |
| `MAILTRAP_PORT` | *Puerto del servidor de correo* | Si usas envío de correos |
| `MAILTRAP_USER` | *Usuario del servidor de correo* | Si usas envío de correos |
| `MAILTRAP_PASS` | *Contraseña del servidor de correo* | Si usas envío de correos |

### Paso 4: Iniciar el despliegue
Haz clic en **"Create Web Service"**. Render comenzará a descargar tu código, instalar las dependencias, generar el cliente de Prisma, compilar el código TypeScript a JavaScript en la carpeta `dist/` e iniciar el servidor.

Al finalizar, Render te proveerá una URL pública como:
`https://maxercise-backend.onrender.com`

---

## 3. 🗄️ Inicializar la Base de Datos en Producción (Push & Seed)

Una vez que tengas tu URL de la base de datos de producción, debes crear las tablas e inicializar los datos por defecto (como el usuario administrador y rutinas).

### Paso 1: Ejecutar la migración física (Crear tablas)
Desde la terminal de tu computadora local (dentro de la carpeta `Backend`), puedes aplicar el esquema Prisma directamente a tu base de datos de producción:
```bash
# 1. Posiciónate en la carpeta del backend
cd Backend

# 2. Ejecuta la sincronización apuntando a producción temporalmente
DATABASE_URL="mysql://[USER]:[PASS]@[HOST]:[PORT]/[DB]" npx prisma db push
```

### Paso 2: Crear el Administrador y poblar datos iniciales
Ejecuta los scripts de inicialización locales pero apuntando a la base de datos remota de producción:

* **Crear Administrador:**
  ```bash
  DATABASE_URL="mysql://[USER]:[PASS]@[HOST]:[PORT]/[DB]" npx ts-node create-admin.ts
  ```
* **Poblar catálogo (Ejercicios y Rutinas):**
  ```bash
  DATABASE_URL="mysql://[USER]:[PASS]@[HOST]:[PORT]/[DB]" npx ts-node -e "import { seedDatabase } from './src/services/seed.service'; seedDatabase().then(() => console.log('Base de datos poblada exitosamente')).catch(console.error);"
  ```

---

## ⚡ Limitaciones de la capa gratuita de Render que debes conocer
* **Modo Suspensión (Spin down):** Si el servidor no recibe visitas durante 15 minutos, Render detendrá el contenedor. La siguiente solicitud reactivará el servidor de forma automática, pero tomará unos **50 segundos** en responder por primera vez.
* **Límite mensual:** Tienes un límite de 750 horas de cómputo gratuito al mes. Si tienes un solo servicio web activo, esto cubrirá las 24 horas de todo el mes sin problemas.
