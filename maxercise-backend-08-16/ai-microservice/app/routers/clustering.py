from fastapi import APIRouter

from app.schemas.clustering import ClusteringRequest, ClusteringResponse
from app.services.clustering_service import run_clustering

router = APIRouter(prefix="/ai", tags=["clustering"])


@router.post("/clustering", response_model=ClusteringResponse)
def clustering(request: ClusteringRequest) -> ClusteringResponse:
    return run_clustering(request)
