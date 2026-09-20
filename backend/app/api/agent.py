from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.learning_plan import LearningPlan
from app.models.skill_gap import SkillGap
from app.schemas.agent import AgentChatRequest, AgentChatResponse, AgentRunResponse
from app.models.agent_run import AgentRun
from app.services.llm_service import llm_service

router = APIRouter(prefix="/agent", tags=["Agent Consultation"])

@router.post("/chat", response_model=AgentChatResponse)
def chat_with_advisor(
    chat_in: AgentChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    plan = db.query(LearningPlan).filter(LearningPlan.user_id == current_user.id, LearningPlan.status == "active").first()
    gaps = db.query(SkillGap).filter(SkillGap.user_id == current_user.id).all()

    target_role = profile.target_role.title if (profile and profile.target_role) else "Data Analyst"
    active_focus = "None"
    if plan and plan.objectives:
        for o in plan.objectives:
            if o.status == "in-progress":
                active_focus = o.title
                break

    gaps_summary = [f"{g.skill.name if g.skill else 'Skill'} ({g.status})" for g in gaps]

    context_dict = {
        "learner_name": current_user.full_name,
        "target_role": target_role,
        "active_focus": active_focus,
        "progress_percent": plan.progress_percent if plan else 0.0,
        "skill_gaps": gaps_summary,
    }

    system_instruction = f"""You are the EduPath Learning Advisor for {current_user.full_name}.
Current Context:
- Target Role: {target_role}
- Active Learning Focus: {active_focus}
- Plan Progress: {context_dict['progress_percent']}%
- Key Skill Gaps: {', '.join(gaps_summary)}

Answer the learner's questions directly using their real curriculum context.
Be practical, concise, and pedagogical. Avoid excessive enthusiasm or vague motivation.
Answer questions about why specific topics are sequenced, how to prepare for interviews, or how practice tasks relate to their target role."""

    reply = ""
    if llm_service.is_configured():
        try:
            reply = llm_service.generate_text(
                prompt=chat_in.message,
                system_instruction=system_instruction,
            )
        except Exception as e:
            reply = ""

    if not reply:
        # Grounded contextual response when offline / fallback
        user_q = chat_in.message.lower()
        if "why" in user_q:
            reply = f"In your path toward {target_role}, {active_focus} is sequenced at this exact stage because it bridges one of your most critical evaluated skill gaps ({', '.join(gaps_summary[:2])}). Completing it unlocks subsequent analytical milestones."
        elif "interview" in user_q:
            reply = f"For {target_role} screenings, technical interviewers evaluate your proficiency in {active_focus} by presenting real-world datasets and asking for structured aggregations and multi-table queries."
        elif "skip" in user_q:
            reply = "You can mark any objective as complete directly from the Learning Path page if you have prior practical experience. The roadmap will automatically adapt."
        else:
            reply = f"Based on your profile for {target_role}, your current focus is '{active_focus}'. Finishing the corresponding practice exercise will close your remaining gap and update your readiness metrics."

    return AgentChatResponse(
        reply=reply,
        context_used=context_dict,
    )

@router.get("/runs", response_model=List[AgentRunResponse])
def list_agent_runs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(AgentRun)
        .filter(AgentRun.user_id == current_user.id)
        .order_by(AgentRun.started_at.desc())
        .limit(20)
        .all()
    )
