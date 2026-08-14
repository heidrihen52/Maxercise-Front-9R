from fastapi import FastAPI

from app.schemas.churn import ChurnRequest, ChurnResponse
from app.schemas.overexertion import OverexertionRequest, OverexertionResponse
from app.schemas.biometrics import BiometricAnomaliesRequest, BiometricAnomaliesResponse
from app.schemas.association import AssociationRulesRequest, AssociationRulesResponse

from app.services.churn_service import run_churn_prediction
from app.services.overexertion_service import run_overexertion_detection
from app.services.biometric_anomalies_service import run_biometric_anomalies
from app.services.association_rules_service import run_association_rules

app = FastAPI(title="FIT-APP AI Microservice", version="2.0.0")


@app.get("/")
def health_check():
    return {"status": "ok", "service": "AI Microservice running"}


@app.post("/ai/churn-prediction", response_model=ChurnResponse)
def churn_prediction_endpoint(payload: ChurnRequest):
    return run_churn_prediction(payload)


@app.post("/ai/overexertion-check", response_model=OverexertionResponse)
def overexertion_endpoint(payload: OverexertionRequest):
    return run_overexertion_detection(payload)


@app.post("/ai/biometric-anomalies", response_model=BiometricAnomaliesResponse)
def biometric_anomalies_endpoint(payload: BiometricAnomaliesRequest):
    return run_biometric_anomalies(payload)


@app.post("/ai/routine-association-rules", response_model=AssociationRulesResponse)
def association_rules_endpoint(payload: AssociationRulesRequest):
    return run_association_rules(payload)