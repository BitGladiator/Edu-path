from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.learning_plan import LearningPlan
from app.models.learning_objective import LearningObjective
from app.models.skill import Skill, UserSkill
from app.models.skill_gap import SkillGap
from app.models.progress import WeeklyActivity
from app.schemas.progress import ProgressSummaryResponse, DailyActivity

router = APIRouter(prefix="/progress", tags=["Progress & Analytics"])

@router.get("", response_model=ProgressSummaryResponse)
def get_progress_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = (
        db.query(LearningPlan)
        .filter(LearningPlan.user_id == current_user.id, LearningPlan.status == "active")
        .first()
    )

    completed_count = 0
    in_progress_count = 0
    remaining_count = 0
    total_stages = 0
    current_focus_title = "None"
    current_focus_time = "45 min"

    what_did_i_learn = []
    what_am_i_working_on = None
    what_is_still_missing = []
    what_should_i_do_next = None

    if plan and plan.objectives:
        total_stages = len(plan.objectives)
        for obj in plan.objectives:
            if obj.status == "completed":
                completed_count += 1
                what_did_i_learn.append(obj.title)
            elif obj.status == "in-progress":
                in_progress_count += 1
                if not what_am_i_working_on:
                    what_am_i_working_on = obj.title
                    current_focus_title = obj.title
                    current_focus_time = obj.estimated_time
                    what_should_i_do_next = f"Complete practical tasks for {obj.title} ({obj.estimated_time})."
            else:
                remaining_count += 1

    completed_percent = round((completed_count / total_stages) * 100) if total_stages > 0 else 0
    in_progress_percent = round((in_progress_count / total_stages) * 100) if total_stages > 0 else 0
    remaining_percent = 100 - completed_percent - in_progress_percent

    # Verified skills & Gaps
    verified_skills = (
        db.query(SkillGap)
        .filter(SkillGap.user_id == current_user.id, SkillGap.status == "Ready")
        .all()
    )
    missing_gaps = (
        db.query(SkillGap)
        .filter(SkillGap.user_id == current_user.id, SkillGap.status.in_(["Gap", "Improve"]))
        .all()
    )

    for g in missing_gaps:
        what_is_still_missing.append(f"{g.skill.name if g.skill else 'Skill'} (Requires {g.required_level})")

    # Weekly activity
    activities = (
        db.query(WeeklyActivity)
        .filter(WeeklyActivity.user_id == current_user.id)
        .all()
    )

    default_days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    daily_map = {a.day: a for a in activities}

    weekly_list: List[DailyActivity] = []
    default_hours = [1.5, 2.0, 0.5, 2.5, 1.8, 3.0, 1.0]

    for idx, day in enumerate(default_days):
        if day in daily_map:
            weekly_list.append(
                DailyActivity(day=day, hours=daily_map[day].hours, sessions=daily_map[day].sessions)
            )
        else:
            weekly_list.append(
                DailyActivity(day=day, hours=default_hours[idx], sessions=2)
            )

    total_hours = sum(d.hours for d in weekly_list)

    return ProgressSummaryResponse(
        completed_percent=completed_percent,
        in_progress_percent=in_progress_percent,
        remaining_percent=remaining_percent,
        completed_count=completed_count,
        in_progress_count=in_progress_count,
        remaining_count=remaining_count,
        total_stages=total_stages,
        current_focus_title=current_focus_title,
        current_focus_time=current_focus_time,
        verified_skills_count=len(verified_skills),
        gaps_count=len(missing_gaps),
        total_weekly_hours=round(total_hours, 1),
        weekly_activity=weekly_list,
        what_did_i_learn=what_did_i_learn if what_did_i_learn else ["Foundational Skills"],
        what_am_i_working_on=what_am_i_working_on or current_focus_title,
        what_is_still_missing=what_is_still_missing if what_is_still_missing else ["No pending gaps detected."],
        what_should_i_do_next=what_should_i_do_next or "Review upcoming curriculum milestone.",
    )

@router.post("/recalculate")
def recalculate_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = (
        db.query(LearningPlan)
        .filter(LearningPlan.user_id == current_user.id, LearningPlan.status == "active")
        .first()
    )
    if plan and plan.objectives:
        completed = sum(1 for o in plan.objectives if o.status == "completed")
        plan.progress_percent = round((completed / len(plan.objectives)) * 100, 1)
        db.commit()

    return {"message": "Progress metrics recalculated successfully."}
