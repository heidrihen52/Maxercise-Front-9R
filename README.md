# Maxercise

Plataforma integral de gestión de ejercicios adaptativos, rutinas inteligentes y sincronización con dispositivos wearables.

## Estructura del Proyecto

* **[Backend](file:///c:/Users/ti_la/Downloads/Maxercise-Front-9R/Backend)**: API REST y servidor WebSockets (Node.js, Express, TypeScript, Prisma ORM, MySQL).
* **[Web](file:///c:/Users/ti_la/Downloads/Maxercise-Front-9R/Web)**: Aplicación Frontend SPA (React + Vite + TailwindCSS).
* **[Wearable](file:///c:/Users/ti_la/Downloads/Maxercise-Front-9R/Wearable)**: Aplicación para dispositivos Wear OS / Wearables.
* **[AndroidKt](file:///c:/Users/ti_la/Downloads/Maxercise-Front-9R/AndroidKt)**: Aplicación móvil nativa en Kotlin.
* **[docker](file:///c:/Users/ti_la/Downloads/Maxercise-Front-9R/docker)**: Configuración y scripts para orquestación con Docker Compose.

---

## 🚀 Inicialización y Seeders de Base de Datos

Para inicializar la base de datos y cargar los datos de prueba (Usuario Super Admin, restricciones médicas, grupos musculares, ejercicios y rutinas):

### 1. Desde la carpeta `Backend`

```bash
cd Backend
npm install
npx prisma generate
npx prisma migrate dev --name init

# Ejecutar seeder completo (Admin, ejercicios, rutinas y usuarios)
npm run seed

# O ejecutar únicamente el seeder del usuario administrador
npm run seed:admin
```

Para más detalles sobre los seeders vía API, WebSockets y Panel Web, consulta la [Documentación del Backend](file:///c:/Users/ti_la/Downloads/Maxercise-Front-9R/Backend/README.md).

### 2. Con Docker

```bash
cd docker
docker compose up --build -d
docker compose exec backend npm run seed
```
Consulta el [Manual de Docker](file:///c:/Users/ti_la/Downloads/Maxercise-Front-9R/docker/DOCKER_MANUAL.md) para más opciones.