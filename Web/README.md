# 🏋️ Maxercise — Frontend (Vite + React)

Aplicación web de fitness premium y personalizada. Genera rutinas y ejercicios basados en el perfil físico del usuario, e integra análisis avanzados de Inteligencia Artificial (Machine Learning).

---

## ⚙️ Requisitos previos

Asegúrate de tener instalado en la computadora:

- **Node.js** v18 o superior → [nodejs.org/es](https://nodejs.org/es/)
- **npm** (incluido por defecto con Node.js)
- **Backend de Maxercise** activo en `http://localhost:3000` (o configurado en la misma red)

Verifica tus versiones abriendo una terminal:
```bash
node -v
npm -v
```

---

## 🚀 Cómo ejecutar el proyecto en tu computadora

### 1. Clonar e ingresar a la carpeta
Navega a la raíz del frontend (`Web`):
```bash
cd ruta/a/Maxercise-Improved/Web
```

### 2. Instalar dependencias (solo la primera vez)
Instala las dependencias necesarias de React y Phosphor Icons:
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
Arranca el compilador ultra-rápido de Vite:
```bash
npm run dev
```

### 4. Abrir en el navegador
Una vez iniciado, abre tu navegador e ingresa a:
```
http://localhost:5173
```

---

## 🔗 Enrutamiento y Vistas Especiales

| URL | Descripción | Acceso |
|-----|-------------|--------|
| `http://localhost:5173/` | Página principal y Landing interactiva | Público |
| `http://localhost:5173/login` | Formulario de inicio de sesión | Público |
| `http://localhost:5173/register` | Formulario de registro con captcha | Público |
| `http://localhost:5173/preview` | Vista de catálogo (solo lectura) | Público |
| `http://localhost:5173/admin` | Panel de superadministrador (IA, ABM) | Rol: `SUPER` |

---

## 📋 Flujo de Usuario y Cuestionario
1. **Registro:** El usuario crea una cuenta e introduce sus restricciones médicas de forma natural.
2. **Cuestionario Inicial:** Test adaptativo y premium de 5 pasos con iconos vectoriales en donde el usuario define su género, somatotipo y objetivos.
3. **Persistencia de Perfil:** Al concluir el cuestionario, los datos del usuario se sincronizan con la base de datos central a través de la API.
4. **Dashboard:** Muestra rutinas seguras y personalizadas y ejercicios recomendados.

---

## 🧠 Integración de Inteligencia Artificial y Machine Learning
El frontend consume los servicios de la `aiAPI` conectados al backend de Node para brindar cuatro herramientas inteligentes:

1. **Predicción de Deserción de Usuarios (User Churn):**
   * *Ubicación:* Panel de Administrador (`/admin` → pestaña *Deserción (IA)*).
   * *Acción:* Muestra la probabilidad matemática de que un usuario abandone la app basándose en su frecuencia de entrenamiento reciente y cumplimiento de metas.
2. **Detección Preventiva de Sobreesfuerzo (Fatiga):**
   * *Ubicación:* En la ventana de detalle de cualquier rutina (`RoutineModal` del usuario).
   * *Acción:* Simulador interactivo en donde el usuario introduce su pulso cardíaco proyectado (BPM) y volumen de carga a entrenar para que la IA le dé un diagnóstico de riesgo (Bajo, Moderado o Alto) y sugerencias preventivas.
3. **Anomalías Biométricas (Wearables):**
   * *Ubicación:* Panel de Administrador (`/admin` → pestaña *Anomalías (IA)*).
   * *Acción:* Lista entrenamientos atípicos en donde los sensores fisiológicos registraron picos imposibles o lecturas asimétricas (calorías/ritmo cardíaco).
4. **Asistente de Asociación (Market Basket Analysis):**
   * *Ubicación:* Creador y Editor de Rutinas del Administrador.
   * *Acción:* Sugiere ejercicios complementarios idóneos basados en las combinaciones más frecuentes en el catálogo mundial (Apriori), permitiendo añadirlos con un solo clic.

---

## 📡 Conexión de API y Persistencia
- Las llamadas HTTP se realizan a través de un servicio unificado en `src/services/api.js`.
- El token JWT se inyecta de manera automática en las cabeceras `Authorization` al estar iniciada la sesión.
- En desarrollo, **Vite redirige automáticamente las peticiones de `/api/*` hacia `http://localhost:3000`** mediante el proxy configurado en `vite.config.js`. No es necesario configurar CORS o variables de entorno locales adicionales para empezar a desarrollar.
- **Persistencia de Rutinas:** Se han añadido y expuesto los campos de **duración** y **frecuencia** a nivel de base de datos MySQL en el backend. Asegúrate de correr `npx prisma db push` en la raíz del backend para habilitar su guardado permanente al editar o crear rutinas en el panel.
