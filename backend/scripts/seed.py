import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.connection import SessionLocal, init_db
from app.models.user import User
from app.models.profile import Profile
from app.models.role import TargetRole, RoleSkill
from app.models.skill import Skill
from app.core.security import get_password_hash
from app.agents.orchestrator import orchestrator

def seed_database():
    print("Initializing tables...")
    init_db()
    db = SessionLocal()

    try:
        print("Seeding Target Roles & authoritative skills...")
        # 1. Target Roles & Skills Mapping
        roles_catalog = [
            {
                "title": "Data Analyst",
                "category": "Data & Analytics",
                "description": "Examines raw datasets to identify trends, extract business intelligence, build reports, and present actionable findings to executive leadership.",
                "skills": [
                    {"name": "Excel", "category": "Data Wrangling", "level": "Strong", "importance": "High"},
                    {"name": "SQL", "category": "Data Querying", "level": "Advanced", "importance": "Critical"},
                    {"name": "Statistics", "category": "Analytical Reasoning", "level": "Intermediate", "importance": "High"},
                    {"name": "Power BI", "category": "Business Intelligence", "level": "Intermediate", "importance": "High"},
                    {"name": "Data Storytelling", "category": "Communication", "level": "Intermediate", "importance": "Medium"},
                ],
            },
            {
                "title": "Frontend Developer",
                "category": "Software Engineering",
                "description": "Architects responsive, high-performance web user interfaces using modern reactive UI libraries, state management, and web standards.",
                "skills": [
                    {"name": "HTML & CSS", "category": "Web Fundamentals", "level": "Strong", "importance": "Critical"},
                    {"name": "JavaScript", "category": "Core Programming", "level": "Advanced", "importance": "Critical"},
                    {"name": "React", "category": "UI Engineering", "level": "Advanced", "importance": "Critical"},
                    {"name": "TypeScript", "category": "Type Systems", "level": "Intermediate", "importance": "High"},
                    {"name": "Frontend System Design", "category": "Architecture", "level": "Intermediate", "importance": "Medium"},
                ],
            },
            {
                "title": "Full Stack Developer",
                "category": "Software Engineering",
                "description": "Builds end-to-end applications spanning client interfaces, server endpoints, business logic, and database schemas.",
                "skills": [
                    {"name": "React", "category": "UI Engineering", "level": "Advanced", "importance": "High"},
                    {"name": "Node.js", "category": "Backend Engineering", "level": "Advanced", "importance": "Critical"},
                    {"name": "SQL", "category": "Data Storage", "level": "Intermediate", "importance": "High"},
                    {"name": "REST APIs", "category": "API Design", "level": "Advanced", "importance": "High"},
                    {"name": "System Design", "category": "Architecture", "level": "Intermediate", "importance": "High"},
                ],
            },
            {
                "title": "Machine Learning Engineer",
                "category": "Artificial Intelligence",
                "description": "Develops, trains, evaluates, and deploys predictive statistical models and neural networks into production pipelines.",
                "skills": [
                    {"name": "Python", "category": "Programming", "level": "Advanced", "importance": "Critical"},
                    {"name": "Linear Algebra", "category": "Mathematics", "level": "Intermediate", "importance": "High"},
                    {"name": "Machine Learning", "category": "Algorithms", "level": "Advanced", "importance": "Critical"},
                    {"name": "PyTorch", "category": "Deep Learning", "level": "Intermediate", "importance": "High"},
                    {"name": "MLOps", "category": "Model Deployment", "level": "Intermediate", "importance": "High"},
                ],
            },
        ]

        for r_data in roles_catalog:
            role = db.query(TargetRole).filter(TargetRole.title == r_data["title"]).first()
            if not role:
                role = TargetRole(
                    title=r_data["title"],
                    category=r_data["category"],
                    description=r_data["description"],
                )
                db.add(role)
                db.commit()
                db.refresh(role)

            for s_info in r_data["skills"]:
                skill = db.query(Skill).filter(Skill.name == s_info["name"]).first()
                if not skill:
                    skill = Skill(
                        name=s_info["name"],
                        category=s_info["category"],
                        description=f"{s_info['name']} competency",
                    )
                    db.add(skill)
                    db.commit()
                    db.refresh(skill)

                role_skill = (
                    db.query(RoleSkill)
                    .filter(RoleSkill.role_id == role.id, RoleSkill.skill_id == skill.id)
                    .first()
                )
                if not role_skill:
                    role_skill = RoleSkill(
                        role_id=role.id,
                        skill_id=skill.id,
                        required_level=s_info["level"],
                        importance=s_info["importance"],
                    )
                    db.add(role_skill)

        db.commit()

        print("Creating default seed user (alex@edupath.ai)...")
        user = db.query(User).filter(User.email == "alex@edupath.ai").first()
        if not user:
            user = User(
                email="alex@edupath.ai",
                hashed_password=get_password_hash("edupath123"),
                full_name="Alex Chen",
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        da_role = db.query(TargetRole).filter(TargetRole.title == "Data Analyst").first()

        profile = db.query(Profile).filter(Profile.user_id == user.id).first()
        if not profile:
            profile = Profile(
                user_id=user.id,
                target_role_id=da_role.id if da_role else None,
                experience_level="1–3 Years",
                career_goal="Transition into a dedicated Data Analyst role within high-growth tech or product analytics.",
                raw_skills_text="Excel, SQL, Python",
            )
            db.add(profile)
            db.commit()

        print("Running initial orchestrator assessment for default user...")
        orchestrator.run_assessment_pipeline(db, user)

        print("Seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
