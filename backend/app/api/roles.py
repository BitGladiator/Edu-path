from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.role import TargetRole, RoleSkill
from app.schemas.role import TargetRoleResponse, RoleSkillResponse

router = APIRouter(prefix="/roles", tags=["Target Roles"])

@router.get("", response_model=List[TargetRoleResponse])
def list_target_roles(db: Session = Depends(get_db)):
    roles = db.query(TargetRole).all()
    result = []
    for r in roles:
        skills = [
            RoleSkillResponse(
                skill_id=rs.skill_id,
                skill_name=rs.skill.name if rs.skill else "Unknown",
                category=rs.skill.category if rs.skill else "General",
                required_level=rs.required_level,
                importance=rs.importance,
            )
            for rs in r.role_skills
        ]
        result.append(
            TargetRoleResponse(
                id=r.id,
                title=r.title,
                category=r.category,
                description=r.description,
                skills=skills,
            )
        )
    return result

@router.get("/{role_id}", response_model=TargetRoleResponse)
def get_target_role(role_id: int, db: Session = Depends(get_db)):
    role = db.query(TargetRole).filter(TargetRole.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Target role not found.")

    skills = [
        RoleSkillResponse(
            skill_id=rs.skill_id,
            skill_name=rs.skill.name if rs.skill else "Unknown",
            category=rs.skill.category if rs.skill else "General",
            required_level=rs.required_level,
            importance=rs.importance,
        )
        for rs in role.role_skills
    ]
    return TargetRoleResponse(
        id=role.id,
        title=role.title,
        category=role.category,
        description=role.description,
        skills=skills,
    )
