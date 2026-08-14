# 🚀 Guía de Despliegue del Frontend en Vercel

Este manual detalla paso a paso cómo subir y alojar la aplicación web (React Frontend) en **Vercel** de manera gratuita, configurando el enrutamiento para Single Page Applications (SPA) y el proxy de redirección hacia el servidor de tu API (Backend).

---

## 📋 Requisitos Previos
1. Una cuenta activa en [Vercel](https://vercel.com).
2. Tener el código subido a un repositorio de **GitHub, GitLab o Bitbucket**.
3. **Tener el Backend desplegado previamente** en algún servicio de la nube (como Render, AWS, Railway, Koyeb, etc.) para contar con la URL pública de la API (ej: `https://mi-api-maxercise.onrender.com`).

---

## 🛠️ Configuración de Vercel (vercel.json)

El proyecto cuenta con un archivo de redirecciones llamado `vercel.json` dentro de la carpeta `Web` para resolver la comunicación CORS y redirigir las rutas del navegador a `index.html`.

1. Abre el archivo [Web/vercel.json](file:///home/adrian/Escritorio/Frontend/Web/vercel.json).
2. Reemplaza la línea del destino con la URL pública real de tu backend:
   ```json
   {
     "cleanUrls": true,
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://TU-BACKEND-DEPLOYED.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   *(Reemplaza `https://TU-BACKEND-DEPLOYED.com` por la URL de tu API, por ejemplo: `https://mi-api-maxercise.onrender.com`).*

---

## 🚀 Método A: Despliegue Automático con GitHub (Recomendado)

Esta es la forma más fácil y profesional, ya que cada vez que hagas `git push` a tu repositorio, Vercel compilará y actualizará el sitio automáticamente.

1. Ingresa a tu panel de **Vercel** y haz clic en **"Add New"** → **"Project"**.
2. Conecta tu cuenta de **GitHub** y selecciona el repositorio del proyecto.
3. En la sección **Configure Project**:
   * **Framework Preset:** Selecciona `Vite` (lo detectará automáticamente).
   * **Root Directory:** Haz clic en *Edit* y selecciona la carpeta **`Web`** (es crucial, ya que el repositorio tiene el frontend y backend juntos).
4. Haz clic en **"Deploy"**.
5. ¡Listo! Vercel compilará la aplicación y te dará una URL pública tipo `https://maxercise.vercel.app`.

---

## 💻 Método B: Despliegue Manual con Vercel CLI (Línea de Comandos)

Si prefieres desplegar directamente desde la terminal de tu computadora sin conectar tu cuenta de GitHub:

### 1. Instalar Vercel CLI globalmente
* En **Linux / macOS:**
  ```bash
  sudo npm install -g vercel
  ```
* En **Windows (PowerShell):**
  ```powershell
  npm install -g vercel
  ```

### 2. Iniciar sesión en Vercel
```bash
vercel login
```
*(Ingresa tu correo o inicia sesión con tu navegador).*

### 3. Posicionarse en la carpeta del Frontend
```bash
cd Web
```

### 4. Desplegar el sitio
Ejecuta el comando para configurar tu proyecto e iniciar la subida:
```bash
vercel
```
Vercel te hará unas preguntas rápidas en la consola:
* *Set up and deploy "~/Escritorio/Frontend/Web"?* → **yes**
* *Link to existing project?* → **no**
* *What's your project's name?* → Presiona Enter para dejar `maxercise`.
* *In which directory is your code located?* → Presiona Enter para dejar `./`.
* *Want to modify these settings? (Build command, output directory...)* → **no**

*(Al finalizar la barra de carga, te dará una URL de vista previa. Si todo se ve correcto, ejecuta `vercel --prod` para subirlo a producción definitiva).*
