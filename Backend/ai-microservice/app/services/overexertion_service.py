import numpy as np
from sklearn.ensemble import RandomForestClassifier
from app.schemas.overexertion import OverexertionRequest, OverexertionResponse


def _build_overexertion_model() -> RandomForestClassifier:
    """features: [ratio_volumen, ratio_frecuencia_cardiaca, dias_descanso_recientes]"""
    X = np.array([
        [1.0, 1.0, 2],   # Normal (0)
        [1.1, 1.05, 1],  # Normal (0)
        [1.4, 1.25, 0],  # Sobreesfuerzo (1)
        [1.6, 1.35, 0],  # Sobreesfuerzo (1)
        [0.9, 0.95, 3],  # Normal (0)
        [1.3, 1.15, 0],  # Precaución / Sobreesfuerzo (1)
    ])
    y = np.array([0, 0, 1, 1, 0, 1])
    clf = RandomForestClassifier(n_estimators=50, random_state=42)
    clf.fit(X, y)
    return clf


_overexertion_model = _build_overexertion_model()


def run_overexertion_detection(request: OverexertionRequest) -> OverexertionResponse:
    # Cálculo de ratios comparando la sesión propuesta con la media histórica del usuario
    user_avg_vol = request.historical_avg_volume if request.historical_avg_volume > 0 else request.proposed_volume
    user_avg_hr = request.historical_avg_hr if request.historical_avg_hr > 0 else request.proposed_hr

    vol_ratio = request.proposed_volume / user_avg_vol
    hr_ratio = request.proposed_hr / user_avg_hr
    rest_days = request.days_since_last_session

    features = np.array([[vol_ratio, hr_ratio, rest_days]])
    risk_pred = int(_overexertion_model.predict(features)[0])
    prob = float(_overexertion_model.predict_proba(features)[0][risk_pred])

    recommendations = []
    if vol_ratio > 1.3:
        recommendations.append("Reducir el volumen de series/repeticiones un 15-20%")
    if hr_ratio > 1.2:
        recommendations.append("Aumentar los tiempos de descanso entre series")
    if rest_days == 0:
        recommendations.append("Considerar un día de descanso activo para evitar fatiga acumulada")

    if not recommendations:
        recommendations.append("Carga de entrenamiento óptima para el nivel actual")

    risk_label = "Alto" if risk_pred == 1 and vol_ratio > 1.3 else ("Moderado" if risk_pred == 1 else "Bajo")

    return OverexertionResponse(
        user_id=request.user_id,
        overexertion_risk=risk_label,
        risk_probability=round(prob, 4),
        volume_ratio=round(vol_ratio, 2),
        recommendations=recommendations,
    )
