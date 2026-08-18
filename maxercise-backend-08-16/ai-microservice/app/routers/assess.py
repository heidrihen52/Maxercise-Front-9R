from fastapi import APIRouter

from app.schemas.assess import AssessRoutineRequest, AssessRoutineResponse
from app.services.assess_service import run_assess_routine

router = APIRouter(prefix="/ai", tags=["assess"])


@router.post("/assess-routine-risk", response_model=AssessRoutineResponse)
def assess_routine_risk(request: AssessRoutineRequest) -> AssessRoutineResponse:
    return run_assess_routine(request)
