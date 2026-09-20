from pydantic import BaseModel
from typing import Optional

class SkillCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = None

class SkillResponse(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class UserSkillUpdate(BaseModel):
    current_level: str

class UserSkillResponse(BaseModel):
    id: int
    skill_id: int
    name: str
    category: str
    current_level: str
    confidence: float
    verified: bool

    class Config:
        from_attributes = True

class SkillGapResponse(BaseModel):
    id: int
    skill_id: int
    skill: str
    category: str
    current_level: str
    required_level: str
    status: str # Ready, Improve, Gap
    priority: str # Critical, High, Medium, Low
    reason: Optional[str] = None
    ai_note: Optional[str] = None

    class Config:
        from_attributes = True
