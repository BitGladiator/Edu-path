from pydantic import BaseModel
from typing import Optional, List, Any

class ProfileCreateOrUpdate(BaseModel):
    name: Optional[str] = None
    target_role: Optional[str] = None # e.g. "Data Analyst"
    experience: Optional[str] = "1–3 Years"
    current_skills: Optional[List[str]] = []
    career_goal: Optional[str] = None
    learning_pace: Optional[str] = "Moderate (4-6 hrs/week)"

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    target_role: Optional[str] = None
    target_role_id: Optional[int] = None
    experience_level: str
    career_goal: Optional[str] = None
    learning_pace: str
    current_skills: List[str] = []
    resume_uploaded: bool = False
    resume_filename: Optional[str] = None
    parsed_profile_data: Optional[Any] = None

    class Config:
        from_attributes = True
