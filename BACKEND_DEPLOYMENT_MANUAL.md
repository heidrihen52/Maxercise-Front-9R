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
TiDB es un motor de base de datos SQL compatible con el protocolo MySQL y ofrece una capa gratuita excelente.
1. Regístrate en [TiDB Cloud](https://pingcap.com/tidb-cloud).
2. Crea un clúster de tipo **Serverless**.
3. En la sección de conexión, selecciona **Prisma** o **MySQL Client**.
4. Te dará un enlace de conexión similar a:
   `mysql://[USUARIO]:[CONTRASEÑA]@[HOST]:4000/[DB_NAME]?sslaccept=strict`
5. **Copia esta URL**, la usaremos como tu `DATABASE_URL`.

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
