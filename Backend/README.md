# Adaptive Exercise API

API REST y servidor WebSockets para gestión de ejercicios adaptativos y sincronización con dispositivos wearables.

## Stack

- Node.js + Express + TypeScript
- MySQL + Prisma ORM
- Socket.IO (tiempo real)
- Supabase Storage (multimedia)
- Mailtrap / Nodemailer (correos)
- JWT + Bcrypt + Helmet + CORS + Rate Limiting

---

## Inicio rápido

```bash
# 1. Clonar variables de entorno y configurar credenciales
cp .env.example .env

# 2. Instalar dependencias
npm install

# 3. Generar cliente de Prisma y aplicar migraciones
npx prisma generate
npx prisma migrate dev --name init

# 4. Poblar datos iniciales (Admin, ejercicios, rutinas)
npm run seed

# 5. Iniciar servidor en modo desarrollo
npm run dev
```

---

## 🗄️ Seeders de Base de Datos

El backend incluye scripts y herramientas dedicadas para inicializar y poblar la base de datos con el usuario administrador, catálogo de ejercicios, grupos musculares, restricciones médicas y rutinas de entrenamiento.

### 🔑 Credenciales por Defecto del Administrador (SUPER)

* **Email:** `admin@adaptive-exercise.local`
* **Contraseña:** `Admin123!`
* **Rol:** `SUPER`

---

### 1. Seeder de Administrador (`SUPER`)

Este seeder crea o actualiza exclusivamente el usuario con rol de Super Administrador en la base de datos sin alterar el resto de las tablas.

#### Ejecución local:
```bash
npm run seed:admin
# o también:
npm run create-admin
# o directamente con ts-node:
npx ts-node create-admin.ts
```

#### Ejecución en Docker:
```bash
docker compose exec backend npm run seed:admin
```

#### Ejecución en Base de Datos Remota / Producción:
```bash
DATABASE_URL="mysql://USUARIO:PASSWORD@HOST:PUERTO/DB_NAME?sslaccept=strict" npm run seed:admin
```

---

### 2. Seeder del Catálogo (Admin, Ejercicios, Rutinas y Usuarios)

Este seeder realiza una carga completa de datos iniciales:
* **Super Admin:** Crea o valida el usuario administrador.
* **Restricciones Médicas:** Inserta restricciones clínicas comunes (lesión de rodilla, hernia discal, hipertensión, etc.).
* **Grupos Musculares y Músculos:** Registra anatomía muscular categorizada (Pecho, Espalda, Piernas, Brazos, Core).
* **50 Ejercicios:** Genera un catálogo diverso de ejercicios clasificados por dificultad (`PRINCIPIANTE`, `INTERMEDIO`, `AVANZADO`) asociados a músculos y restricciones.
* **20 Rutinas Adaptativas:** Genera rutinas estructuradas con series, repeticiones y somatotipos (`ECTOMORFO`, `MESOMORFO`, `ENDOMORFO`).
* **50 Usuarios de Prueba:** Genera perfiles de usuario con somatotipos y rutinas activas para pruebas y visualización en métricas/gráficas.

#### Ejecución local (vía npm o Prisma):
```bash
npm run seed
# o mediante el comando estándar de Prisma:
npx prisma db seed
```

#### Ejecución en Docker:
```bash
docker compose exec backend npm run seed
```

#### Ejecución en Base de Datos Remota / Producción:
```bash
DATABASE_URL="mysql://USUARIO:PASSWORD@HOST:PUERTO/DB_NAME?sslaccept=strict" npm run seed
```

---

### 3. Poblado en Tiempo Real vía API REST (`POST /api/seed`)

Puedes disparar el proceso de seed a través del endpoint HTTP enviando el token JWT de un usuario con rol `SUPER`:

* **Método:** `POST`
* **Ruta:** `/api/seed`
* **Headers:** `Authorization: Bearer <TOKEN_SUPER_ADMIN>`
* **Cuerpo de la petición (Opcional):**
```json
{
  "count": 50,
  "batchSize": 10,
  "restrictionPrevalence": 0.25,
  "roomId": "mi-sala-seed"
}
```

El servidor emitirá el progreso en tiempo real mediante **Socket.IO**:
```javascript
// Unirse a la sala para recibir notificaciones
socket.emit('join_seed_room', 'mi-sala-seed');

// Eventos emitidos por el servidor
socket.on('seed_progress', (data) => {
  console.log(`Fase: ${data.phase} - ${data.percent}%: ${data.message}`);
});

socket.on('metrics_update', (metrics) => {
  console.log('Métricas actuales:', metrics);
});
```

---

### 4. Poblado desde el Panel Web de Administración

1. Inicia sesión en el Frontend web con las credenciales del Super Administrador (`admin@adaptive-exercise.local` / `Admin123!`).
2. Accede a la vista de **Administración** (`/admin`).
3. Ve a la pestaña de **Mantenimiento / Base de Datos**.
4. Haz clic en **Poblar Base de Datos** para ejecutar el seed con seguimiento visual del progreso en tiempo real mediante WebSockets.

---

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro con email de bienvenida |
| POST | `/api/auth/login` | Login → JWT |
| POST | `/api/auth/forgot-password` | Token de recuperación por email |
| POST | `/api/auth/reset-password` | Restablece contraseña con token JWT |
| GET | `/api/exercises` | Ejercicios filtrados por restricciones del usuario |
| POST | `/api/exercises` | Crea ejercicio con media Supabase (SUPER) |
| GET | `/api/restrictions` | Catálogo de restricciones médicas |
| GET | `/api/routines` | Lista rutinas con favoritos del usuario |
| POST | `/api/routines` | Crea rutina |
| POST | `/api/routines/:id/favorite` | Toggle favorito |
| POST | `/api/routines/:id/activate` | Activa rutina del usuario |
| GET | `/api/dashboard/stats` | Estadísticas agregadas para 6 gráficas |
| GET | `/api/ai/clustering` | Proxy → Python KMeans |
| POST | `/api/ai/recommendations` | Proxy → Python cosine similarity |
| POST | `/api/ai/assess-routine` | Proxy → Python RandomForest |
| GET | `/api/ai/anomalies` | Proxy → Python IsolationForest |
| GET | `/api/wearable/sync` | Payload compacto para reloj (offline) |
| POST | `/api/wearable/complete-day` | Actualiza `last_completed_day` |
| POST | `/api/wearable/feedback` | Métricas post-entrenamiento (IA) |
| POST | `/api/seed` | Poblado con eventos Socket.IO (SUPER) |
| GET | `/api/seed/metrics` | Métricas de recuento de la base de datos (SUPER) |
| GET | `/api/export-csv` | Exporta usuarios desnormalizados (SUPER) |
| POST | `/api/import-csv` | Importa usuarios desde CSV (SUPER) |
| DELETE | `/api/clean` | Trunca todas las tablas (SUPER) |

---

## Socket.IO

Conéctate y únete a una sala para recibir progreso del seed:

```javascript
socket.emit('join_seed_room', 'mi-sala');
// Eventos: seed_progress, metrics_update
```

---

## Microservicio IA (Python)

```bash
cd ai-microservice
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Pruebas de infraestructura

Ver `deployment/README.md` para los 5 scripts de liberación (k6, stress DB, NGINX, DNS, SSL).
