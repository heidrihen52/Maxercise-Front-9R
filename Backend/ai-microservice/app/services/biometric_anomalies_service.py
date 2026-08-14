import numpy as np
from sklearn.ensemble import IsolationForest
from app.schemas.biometrics import BiometricAnomaliesRequest, BiometricAnomaliesResponse, BiometricAnomalyItem


def run_biometric_anomalies(request: BiometricAnomaliesRequest) -> BiometricAnomaliesResponse:
    if not request.readings:
        return BiometricAnomaliesResponse(anomalies=[], total_analyzed=0, anomaly_count=0)

    # Features: [heart_rate, calories_per_minute, duration_minutes]
    features = np.array([
        [r.heart_rate, r.calories / max(r.duration_minutes, 1), r.duration_minutes]
        for r in request.readings
    ])

    n_samples = len(request.readings)
    if n_samples < 4:
        # Poca muestra para entrenamiento dinámico: evaluación por reglas físicas
        anomalies = []
        for r in request.readings:
            is_anomaly = r.heart_rate > 220 or r.heart_rate < 35 or r.calories > 3000
            if is_anomaly:
                anomalies.append(
                    BiometricAnomalyItem(
                        reading_id=r.id,
                        user_id=r.user_id,
                        anomaly_score=-0.99,
                        reason="Lectura fuera de rangos fisiológicos seguros",
                    )
                )
        return BiometricAnomaliesResponse(
            anomalies=anomalies, total_analyzed=n_samples, anomaly_count=len(anomalies)
        )

    contamination = min(0.15, max(0.02, 2.0 / n_samples))
    iso = IsolationForest(contamination=contamination, random_state=42)
    preds = iso.fit_predict(features)
    scores = iso.decision_function(features)

    anomalies = []
    for idx, (r, pred, score) in enumerate(zip(request.readings, preds, scores)):
        if pred == -1:
            reasons = []
            cals_per_min = r.calories / max(r.duration_minutes, 1)
            if r.heart_rate > 200:
                reasons.append("Frecuencia cardíaca anómalamente alta")
            if cals_per_min > 25:
                reasons.append("Tasa de quema calórica fuera de proporción")
            if not reasons:
                reasons.append("Desviación estadística atípica en la lectura del sensor")

            anomalies.append(
                BiometricAnomalyItem(
                    reading_id=r.id,
                    user_id=r.user_id,
                    anomaly_score=round(float(score), 4),
                    reason=" | ".join(reasons),
                )
            )

    return BiometricAnomaliesResponse(
        anomalies=anomalies,
        total_analyzed=n_samples,
        anomaly_count=len(anomalies),
    )
