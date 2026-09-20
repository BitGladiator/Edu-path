from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.agent import AssessmentStartResponse
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/assessment", tags=["Assessment & Orchestrator"])

@router.post("/start", response_model=AssessmentStartResponse)
def start_assessment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = orchestrator.run_assessment_pipeline(db=db, user=current_user)
    return AssessmentStartResponse(
        status=result["status"],
        message=result["message"],
        plan_id=result.get("plan_id"),
        gaps_detected=result.get("gaps_detected", 0),
        stages_generated=result.get("stages_generated", 0),
    )
