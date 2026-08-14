# 🐳 Ecosistema Docker: Guía Definitiva de Despliegue

Este documento contiene las instrucciones detalladas paso a paso para compilar, levantar y configurar los servicios del ecosistema **Maxercise** (React Frontend + Node.js Backend + MySQL Database) dentro de la carpeta `/docker`.

---

## 🌐 Mapeo de Puertos y Servicios locales
* **Frontend Web:** `http://localhost:8080` (React + Nginx)
* **Backend API / WebSocket:** `http://localhost:3000`
* **Base de Datos MySQL:** `localhost:3307` *(Mapeado a puerto 3307 en tu computadora física para evitar conflictos).*

---

## 📋 Requisitos Previos
Asegúrate de tener instalados en tu sistema:
- **Docker Engine** (v20+)
- **Docker Compose v2**

---

## 🚀 Guía de Despliegue en 4 Pasos

Abre una terminal o consola de comandos, navigate a la carpeta **`docker`** y ejecuta los siguientes comandos en orden:

### 0. Ingresar a la carpeta de Docker
```bash
cd ruta/a/Frontend/docker
```

### 1. Compilar y levantar contenedores
Descarga las imágenes necesarias, instala dependencias limpias e inicia los servicios en segundo plano:

* **Linux / macOS:**
  ```bash
  sudo docker compose up --build -d
  ```
* **Windows (PowerShell / CMD):**
  ```powershell
  docker compose up --build -d
  ```
*(Espera a que la consola te indique que los tres contenedores están activos y en ejecución).*

### 2. Sincronizar esquema de Base de Datos
Crea todas las tablas correspondientes del modelo físico de base de datos (Prisma):

* **Linux / macOS:**
  ```bash
  sudo docker compose exec backend npx prisma db push
  ```
* **Windows (PowerShell / CMD):**
  ```powershell
  docker compose exec backend npx prisma db push
  ```

### 3. Crear Perfil Administrador por defecto
Inicializa el usuario principal de tipo `SUPER` en la base de datos MySQL:

* **Linux / macOS:**
  ```bash
  sudo docker compose exec backend npx ts-node create-admin.ts
  ```
* **Windows (PowerShell / CMD):**
  ```powershell
  docker compose exec backend npx ts-node create-admin.ts
  ```

### 4. Poblar Datos del Catálogo (Ejercicios y Rutinas)
Ejecuta el script automático para rellenar la base de datos con los ejercicios guiados, grupos musculares, restricciones de salud y rutinas adaptativas iniciales:

* **Linux / macOS:**
  ```bash
  sudo docker compose exec backend npx ts-node -e "import { seedDatabase } from './src/services/seed.service'; seedDatabase().then(() => console.log('Base de datos poblada exitosamente')).catch(console.error);"
  ```
* **Windows (PowerShell / CMD):**
  ```powershell
  docker compose exec backend npx ts-node -e "import { seedDatabase } from './src/services/seed.service'; seedDatabase().then(() => console.log('Base de datos poblada exitosamente')).catch(console.error);"
  ```

---

## 🔑 Credenciales por Defecto (Seed)
* **Email de Acceso:** `admin@adaptive-exercise.local`
* **Contraseña:** `Admin123!`
* **URL de Acceso al Panel:** `http://localhost:8080/admin`

---

## 🛠️ Comandos de Administración Útiles

* **Detener los contenedores y liberar recursos de tu PC:**
  * **Linux / macOS:** `sudo docker compose down`
  * **Windows:** `docker compose down`
* **Ver registros de errores / logs del backend en tiempo real:**
  * **Linux / macOS:** `sudo docker logs -f maxercise-backend`
  * **Windows:** `docker logs -f maxercise-backend`
* **Reiniciar todos los contenedores:**
  * **Linux / macOS:** `sudo docker compose restart`
  * **Windows:** `docker compose restart`
