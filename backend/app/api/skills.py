from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.skill import Skill, UserSkill
from app.models.skill_gap import SkillGap
from app.schemas.skill import SkillCreate, SkillResponse, UserSkillUpdate, SkillGapResponse

router = APIRouter(tags=["Skills & Gaps"])

@router.get("/skills", response_model=List[SkillResponse])
def list_skills(db: Session = Depends(get_db)):
    return db.query(Skill).all()

@router.post("/skills", response_model=SkillResponse)
def create_skill(skill_in: SkillCreate, db: Session = Depends(get_db)):
    existing = db.query(Skill).filter(Skill.name.ilike(skill_in.name)).first()
    if existing:
        return existing
    skill = Skill(name=skill_in.name, category=skill_in.category, description=skill_in.description)
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

@router.get("/skill-gaps", response_model=List[SkillGapResponse])
def get_user_skill_gaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    gaps = (
        db.query(SkillGap)
        .filter(SkillGap.user_id == current_user.id)
        .all()
    )

    result = []
    for g in gaps:
        result.append(
            SkillGapResponse(
                id=g.id,
                skill_id=g.skill_id,
                skill=g.skill.name if g.skill else "Skill",
                category=g.skill.category if g.skill else "General",
                current_level=g.current_level,
                required_level=g.required_level,
                status=g.status,
                priority=g.priority,
                reason=g.reason,
                ai_note=g.ai_note,
            )
        )
    return result

@router.put("/skills/{skill_id}/level")
def update_user_skill_level(
    skill_id: int,
    level_in: UserSkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_skill = (
        db.query(UserSkill)
        .filter(UserSkill.user_id == current_user.id, UserSkill.skill_id == skill_id)
        .first()
    )
    if not user_skill:
        user_skill = UserSkill(
            user_id=current_user.id,
            skill_id=skill_id,
            current_level=level_in.current_level,
            verified=True,
        )
        db.add(user_skill)
    else:
        user_skill.current_level = level_in.current_level
        user_skill.verified = True

    # Update corresponding skill gap status if present
    gap = (
        db.query(SkillGap)
        .filter(SkillGap.user_id == current_user.id, SkillGap.skill_id == skill_id)
        .first()
    )
    if gap:
        gap.current_level = level_in.current_level
        levels_order = {"beginner": 1, "intermediate": 2, "strong": 3, "advanced": 4}
        c_score = levels_order.get(level_in.current_level.lower(), 1)
        r_score = levels_order.get(gap.required_level.lower(), 2)
        if c_score >= r_score:
            gap.status = "Ready"
            gap.priority = "Low"
        elif c_score == r_score - 1:
            gap.status = "Improve"
        else:
            gap.status = "Gap"

    db.commit()
    return {"message": "Skill level updated successfully.", "skill_id": skill_id, "new_level": level_in.current_level}
