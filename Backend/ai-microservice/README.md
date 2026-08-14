# AI Microservice

Microservicio de inteligencia artificial para clustering, recomendaciones, evaluación de riesgo y detección de anomalías.

## Requisitos

- Python 3.10+
- pip

## Instalación

```bash
cd ai-microservice
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

## Ejecución

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/ai/clustering` | KMeans sobre edad, somatotipo y restricciones |
| POST | `/ai/recommendations` | Similitud coseno usuario vs catálogo |
| POST | `/ai/assess-routine-risk` | RandomForest: Segura / Precaución / No Recomendada |
| POST | `/ai/detect-anomalies` | IsolationForest sobre catálogo de ejercicios |
| GET | `/health` | Health check |

## Integración con Node.js

El API Express (puerto 3000) actúa como proxy hacia `http://localhost:8000` en las rutas `/api/ai/*`.
