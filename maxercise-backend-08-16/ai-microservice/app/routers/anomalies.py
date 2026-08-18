from fastapi import APIRouter

from app.schemas.anomalies import AnomaliesRequest, AnomaliesResponse
from app.services.anomalies_service import run_detect_anomalies

router = APIRouter(prefix="/ai", tags=["anomalies"])


@router.post("/detect-anomalies", response_model=AnomaliesResponse)
def detect_anomalies(request: AnomaliesRequest) -> AnomaliesResponse:
    return run_detect_anomalies(request)
