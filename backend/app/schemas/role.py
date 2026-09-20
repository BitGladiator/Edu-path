from pydantic import BaseModel
from typing import Optional, List

class RoleSkillResponse(BaseModel):
    skill_id: int
    skill_name: str
    category: str
    required_level: str
    importance: str

    class Config:
        from_attributes = True

class TargetRoleResponse(BaseModel):
    id: int
    title: str
    category: Optional[str] = None
    description: Optional[str] = None
    skills: List[RoleSkillResponse] = []

    class Config:
        from_attributes = True
