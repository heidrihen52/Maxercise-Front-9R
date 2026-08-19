# Adaptive Exercise API

API REST y servidor WebSockets para gestión de ejercicios adaptativos y sincronización con dispositivos wearables.

## Stack

- Node.js + Express + TypeScript
- MySQL + Prisma ORM
- Socket.IO (tiempo real)
- Supabase Storage (multimedia)
- Mailtrap / Nodemailer (correos)
- JWT + Bcrypt + Helmet + CORS + Rate Limiting

## Inicio rápido

```bash
cp .env.example .env
# Editar DATABASE_URL, JWT_SECRET, Mailtrap y Supabase

npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

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
| GET | `/api/export-csv` | Exporta usuarios desnormalizados (SUPER) |
| POST | `/api/import-csv` | Importa usuarios desde CSV (SUPER) |
| DELETE | `/api/clean` | Trunca todas las tablas (SUPER) |

## Socket.IO

Conéctate y únete a una sala para recibir progreso del seed:

```javascript
socket.emit('join_seed_room', 'mi-sala');
// Eventos: seed_progress, metrics_update
```

## Usuario admin por defecto (seed)

- Email: `admin@adaptive-exercise.local`
- Password: `Admin123!`
- Role: `SUPER`

## Microservicio IA (Python)

```bash
cd ai-microservice
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Pruebas de infraestructura

Ver `deployment/README.md` para los 5 scripts de liberación (k6, stress DB, NGINX, DNS, SSL).
