from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.api.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.profile import Profile
from app.models.role import TargetRole
from app.models.resume import Resume
from app.models.skill import Skill, UserSkill
from app.schemas.profile import ProfileCreateOrUpdate, ProfileResponse
from app.services.resume_service import resume_service

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=ProfileResponse)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    target_role_title = profile.target_role.title if profile.target_role else "Data Analyst"

    # User skills list
    user_skills = (
        db.query(UserSkill)
        .filter(UserSkill.user_id == current_user.id)
        .all()
    )
    current_skills = [us.skill.name for us in user_skills if us.skill]
    if not current_skills and profile.raw_skills_text:
        current_skills = [s.strip() for s in profile.raw_skills_text.split(",") if s.strip()]

    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()

    return ProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        target_role=target_role_title,
        target_role_id=profile.target_role_id,
        experience_level=profile.experience_level,
        career_goal=profile.career_goal,
        learning_pace=profile.learning_pace,
        current_skills=current_skills,
        resume_uploaded=bool(resume),
        resume_filename=resume.filename if resume else None,
        parsed_profile_data=profile.parsed_profile_data,
    )

@router.put("", response_model=ProfileResponse)
def update_user_profile(
    profile_in: ProfileCreateOrUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    if profile_in.name:
        current_user.full_name = profile_in.name

    if profile_in.experience:
        profile.experience_level = profile_in.experience

    if profile_in.career_goal:
        profile.career_goal = profile_in.career_goal

    if profile_in.learning_pace:
        profile.learning_pace = profile_in.learning_pace

    if profile_in.target_role:
        role = db.query(TargetRole).filter(TargetRole.title.ilike(profile_in.target_role.strip())).first()
        if not role:
            role = TargetRole(title=profile_in.target_role.strip(), category="Technology")
            db.add(role)
            db.commit()
            db.refresh(role)
        profile.target_role_id = role.id

    if profile_in.current_skills:
        profile.raw_skills_text = ", ".join(profile_in.current_skills)
        # Update user_skills table
        for skill_name in profile_in.current_skills:
            clean = skill_name.strip()
            if not clean:
                continue
            skill_obj = db.query(Skill).filter(Skill.name.ilike(clean)).first()
            if not skill_obj:
                skill_obj = Skill(name=clean, category="Technical")
                db.add(skill_obj)
                db.commit()
                db.refresh(skill_obj)

            existing_us = (
                db.query(UserSkill)
                .filter(UserSkill.user_id == current_user.id, UserSkill.skill_id == skill_obj.id)
                .first()
            )
            if not existing_us:
                db.add(UserSkill(user_id=current_user.id, skill_id=skill_obj.id, current_level="Intermediate"))

    db.commit()
    db.refresh(profile)

    return get_user_profile(current_user=current_user, db=db)

@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_path, extracted_text, size_bytes = await resume_service.save_and_extract_resume(
        file=file,
        upload_dir=settings.UPLOAD_DIR,
    )

    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_size_bytes=size_bytes,
        raw_text=extracted_text,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "message": "Resume uploaded and processed successfully.",
        "filename": file.filename,
        "characters_extracted": len(extracted_text),
    }
