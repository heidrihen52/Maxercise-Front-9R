from pydantic import BaseModel
from typing import List


class BiometricReading(BaseModel):
    id: int
    user_id: int
    heart_rate: float
    calories: float
    duration_minutes: float


class BiometricAnomaliesRequest(BaseModel):
    readings: List[BiometricReading]


class BiometricAnomalyItem(BaseModel):
    reading_id: int
    user_id: int
    anomaly_score: float
    reason: str


class BiometricAnomaliesResponse(BaseModel):
    anomalies: List[BiometricAnomalyItem]
    total_analyzed: int
    anomaly_count: int