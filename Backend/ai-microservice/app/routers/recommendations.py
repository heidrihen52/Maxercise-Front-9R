from fastapi import APIRouter

from app.schemas.recommendations import RecommendationsRequest, RecommendationsResponse
from app.services.recommendations_service import run_recommendations

router = APIRouter(prefix="/ai", tags=["recommendations"])


@router.post("/recommendations", response_model=RecommendationsResponse)
def recommendations(request: RecommendationsRequest) -> RecommendationsResponse:
    return run_recommendations(request)
