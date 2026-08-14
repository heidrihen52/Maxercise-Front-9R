import numpy as np
from sklearn.linear_model import LogisticRegression
from app.schemas.churn import ChurnRequest, ChurnResponse, ChurnUserResult


def _build_churn_model() -> LogisticRegression:
    """Entrena un modelo base de regresión logística para Churn."""
    # Features: [dias_inactivo, caida_frecuencia_pct, metas_completadas_pct]
    X = np.array([
        [2, 0.0, 0.9],   # Retenido
        [5, 0.1, 0.8],   # Retenido
        [14, 0.5, 0.4],  # Riesgo Medio
        [30, 0.8, 0.1],  # Churn Alto
        [45, 0.9, 0.0],  # Churn Alto
        [1, 0.0, 1.0],   # Retenido
        [21, 0.7, 0.2],  # Churn Alto
    ])
    y = np.array([0, 0, 1, 1, 1, 0, 1])  # 0: Activo, 1: En Riesgo / Churn
    model = LogisticRegression()
    model.fit(X, y)
    return model


_churn_model = _build_churn_model()


def run_churn_prediction(request: ChurnRequest) -> ChurnResponse:
    if not request.users:
        return ChurnResponse(results=[], total_analyzed=0)

    results = []
    for user in request.users:
        features = np.array([[user.days_inactive, user.frequency_drop_ratio, user.goal_completion_rate]])
        prob = float(_churn_model.predict_proba(features)[0][1])

        if prob >= 0.7:
            risk_level = "Alto"
            reason = "Inactividad prolongada y caída drástica en la frecuencia de entrenamiento"
        elif prob >= 0.4:
            risk_level = "Medio"
            reason = "Reducción moderada en el cumplimiento de metas y ritmo de sesiones"
        else:
            risk_level = "Bajo"
            reason = "Usuario activo y constante con su rutina"

        results.append(
            ChurnUserResult(
                user_id=user.user_id,
                churn_probability=round(prob, 4),
                risk_level=risk_level,
                reason=reason,
            )
        )

    return ChurnResponse(results=results, total_analyzed=len(results))
