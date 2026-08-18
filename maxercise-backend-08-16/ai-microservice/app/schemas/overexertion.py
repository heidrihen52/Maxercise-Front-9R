from pydantic import BaseModel
from typing import List


class OverexertionRequest(BaseModel):
    user_id: int
    proposed_volume: float
    proposed_hr: float
    historical_avg_volume: float
    historical_avg_hr: float
    days_since_last_session: int


class OverexertionResponse(BaseModel):
    user_id: int
    overexertion_risk: str
    risk_probability: float
    volume_ratio: float
    recommendations: List[str]