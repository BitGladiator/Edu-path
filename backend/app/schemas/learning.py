from pydantic import BaseModel
from typing import Optional, List, Any

class LearningResourceResponse(BaseModel):
    id: int
    title: str
    provider: str
    url: Optional[str] = None
    skill: Optional[str] = None
    difficulty: str
    type: str
    time: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class PracticeTaskResponse(BaseModel):
    id: int
    title: str
    topic: str
    estimated_time: str
    difficulty: str
    prompt: str
    schema_hint: Optional[str] = None
    starter_query: Optional[str] = None
    solution_note: Optional[str] = None
    completed: bool
    evaluation_feedback: Optional[str] = None
    evaluation_score: Optional[float] = None

    class Config:
        from_attributes = True

class PracticeSubmitRequest(BaseModel):
    submission_text: str

class LearningObjectiveResponse(BaseModel):
    id: int
    stage_order: int
    phase: str
    title: str
    status: str
    estimated_time: str
    difficulty: str
    why_learn: Optional[str] = None
    objectives: List[str] = []
    resources: List[LearningResourceResponse] = []
    practice_task: Optional[PracticeTaskResponse] = None

    class Config:
        from_attributes = True

class LearningPlanResponse(BaseModel):
    id: int
    title: str
    target_role: str
    status: str
    progress_percent: float
    stages: List[LearningObjectiveResponse] = []

    class Config:
        from_attributes = True

class ReorderRequest(BaseModel):
    objective_id: int
    direction: str # "up" or "down"
