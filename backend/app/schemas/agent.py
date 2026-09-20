from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class AgentChatRequest(BaseModel):
    message: str

class AgentChatResponse(BaseModel):
    reply: str
    context_used: Dict[str, Any] = {}

class AssessmentStartResponse(BaseModel):
    status: str
    message: str
    plan_id: Optional[int] = None
    gaps_detected: int
    stages_generated: int

class AgentRunResponse(BaseModel):
    id: int
    agent_name: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    error: Optional[str] = None

    class Config:
        from_attributes = True
