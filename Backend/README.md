# 🏋️ Maxercise — Backend (Express + TypeScript + Prisma)

Servicio de API REST y servidor WebSockets para la gestión de ejercicios adaptativos, rutinas personalizadas, sincronización con wearables e integraciones analíticas de Inteligencia Artificial (Machine Learning).

---

## ⚙️ Stack Tecnológico

- **Núcleo:** Node.js + Express + TypeScript
- **Base de Datos:** MySQL (con soporte local SQLite en configuración de desarrollo) + Prisma ORM
- **Tiempo Real:** Socket.IO (para seguimiento de progreso de seed/carga de datos)
- **Almacenamiento:** Supabase Storage (gestión de archivos multimedia)
- **Mensajería:** Mailtrap / Nodemailer (envío de correos de registro y recuperación)
- **Seguridad:** JWT + Bcrypt + Helmet + CORS + Rate Limiting

---

## 🚀 Inicio Rápido y Despliegue

Sigue estos pasos para desplegar el servidor en tu computadora:

### 1. Copiar y configurar variables de entorno
Crea el archivo `.env` en la raíz del backend:
```bash
cp .env.example .env
```
Asegúrate de configurar las variables para `DATABASE_URL` (MySQL/SQLite), `JWT_SECRET`, las credenciales de Supabase y las de Mailtrap.

### 2. Instalar dependencias
```bash
npm install
```

### 3. Sincronizar esquema de base de datos
Genera el cliente Prisma y empuja los cambios del esquema actual (incluyendo las columnas de `duration` y `frequency` en la tabla `Routine`):
```bash
npx prisma generate
npx prisma db push
```

### 4. Ejecutar el servidor de desarrollo
Inicia el servidor en el puerto `3000`:
```bash
npm run dev
```

---

## 🧠 Motor de Fallback de Inteligencia Artificial (TypeScript Nactivo)

El backend cuenta con un **sistema de fallback tolerante a fallos** implementado en `src/services/ai.service.ts`. Si la conexión con el microservicio externo de Python (`aiServiceUrl`) no está disponible o falla:
1. **Predicción de Deserción (User Churn):** Clasificador logístico local basado en días de inactividad, tasa de cumplimiento de rutinas y tendencias de frecuencia semanal. Categoriza al usuario en riesgo *Bajo, Medio o Alto*.
2. **Detección de Sobreesfuerzo:** Modelo de fatiga basado en el ratio del volumen propuesto contra la media histórica, ritmo cardíaco proyectado y días de descanso acumulados. Genera un plan de acción con recomendaciones preventivas.
3. **Anomalías Biométricas (Wearables):** Algoritmo de Isolation Forest adaptado localmente para detectar lecturas fisiológicas atípicas o fallas físicas en wearables (ej: pulso alto sin gasto calórico, lecturas inconsistentes).
4. **Reglas de Asociación de Ejercicios (Market Basket Analysis):** Algoritmo Apriori local de coocurrencia que analiza todas las rutinas activas del catálogo de la base de datos para sugerir pares de ejercicios que suelen acompañarse.

---

## 📡 Endpoints de la API

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| **POST** | `/api/auth/register` | Registro de usuario con captcha y correo de bienvenida | Público |
| **POST** | `/api/auth/login` | Inicio de sesión, retorna token JWT y datos de perfil | Público |
| **POST** | `/api/auth/forgot-password` | Envío de correo con token de recuperación de contraseña | Público |
| **POST** | `/api/auth/reset-password` | Restablecer contraseña mediante token JWT válido | Público |
| **GET** | `/api/exercises` | Lista ejercicios filtrando automáticamente restricciones del usuario | Autenticado |
| **POST** | `/api/exercises` | Crea un ejercicio adjuntando imagen a Supabase | `SUPER` |
| **GET** | `/api/routines` | Lista las rutinas adaptadas, categorías y favoritos del cliente | Autenticado |
| **PUT** | `/api/routines/:id` | Actualiza campos de rutina (incluye `duration`, `frequency`, exercises) | `SUPER` |
| **POST** | `/api/routines/:id/favorite` | Agrega o remueve una rutina del catálogo de favoritos | Autenticado |
| **POST** | `/api/routines/:id/activate` | Activa una rutina como la principal del usuario | Autenticado |
| **GET** | `/api/ai/churn-prediction` | Predicción de abandono de todos los usuarios registrados | `SUPER` |
| **POST** | `/api/ai/overexertion-check/:userId` | Evalúa si el entrenamiento propuesto causa fatiga física | Autenticado |
| **GET** | `/api/ai/biometric-anomalies` | Bitácora de lecturas anómalas detectadas en relojes | `SUPER` |
| **GET** | `/api/ai/association-rules` | Retorna las sugerencias de coocurrencia (Apriori) | `SUPER` |
| **POST** | `/api/seed` | Genera más de 10 ejercicios/rutinas coherentes y 100 logs | `SUPER` |
| **GET** | `/api/export-csv` | Exporta base de usuarios consolidada | `SUPER` |
| **POST** | `/api/import-csv` | Importa usuarios desde archivo CSV | `SUPER` |

---

## 📊 Eventos de Real-Time (Socket.IO)

El servidor expone comunicación bidireccional. Puedes unirte al canal de seed para seguir el progreso del poblado de datos:
```javascript
socket.emit('join_seed_room', 'mi-sala');
// Escucha eventos: 'seed_progress', 'metrics_update'
```

---

## 🔑 Usuario Administrador por Defecto (Seed)

- **Email:** `admin@adaptive-exercise.local`
- **Contraseña:** `Admin123!`
- **Rol:** `SUPER`
