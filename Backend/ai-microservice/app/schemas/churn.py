from pydantic import BaseModel
from typing import List


class UserChurnInput(BaseModel):
    user_id: int
    days_inactive: int
    frequency_drop_ratio: float
    goal_completion_rate: float


class ChurnRequest(BaseModel):
    users: List[UserChurnInput]


class ChurnUserResult(BaseModel):
    user_id: int
    churn_probability: float
    risk_level: str
    reason: str


class ChurnResponse(BaseModel):
    results: List[ChurnUserResult]
    total_analyzed: int