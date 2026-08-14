from pydantic import BaseModel
from typing import List, Optional


class RoutineExerciseInput(BaseModel):
    routine_id: int
    exercise_ids: List[int]


class AssociationRulesRequest(BaseModel):
    routines_exercises: List[RoutineExerciseInput]
    min_support: Optional[float] = 0.05
    min_confidence: Optional[float] = 0.3
    top_k: Optional[int] = 10


class AssociationRuleItem(BaseModel):
    antecedent_id: int
    consequent_id: int
    support: float
    confidence: float
    lift: float


class AssociationRulesResponse(BaseModel):
    rules: List[AssociationRuleItem]
    total_routines_analyzed: int