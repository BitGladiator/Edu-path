from datetime import datetime, timezone
import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.profile import Profile
from app.models.role import TargetRole, RoleSkill
from app.models.skill import Skill, UserSkill
from app.models.resume import Resume
from app.models.skill_gap import SkillGap
from app.models.learning_plan import LearningPlan
from app.models.learning_objective import LearningObjective
from app.models.practice_task import PracticeTask
from app.models.resource import LearningResource
from app.models.agent_run import AgentRun

from app.agents.profile_agent import profile_agent
from app.agents.skill_gap_agent import skill_gap_agent
from app.agents.learning_planner_agent import learning_planner_agent
from app.services.resource_service import resource_service

logger = logging.getLogger("edupath.orchestrator")

class AgentOrchestrator:
    def log_agent_run(
        self,
        db: Session,
        user_id: int,
        agent_name: str,
        status: str = "running",
        error: str = None,
        meta_info: Dict[str, Any] = None,
    ) -> AgentRun:
        run = AgentRun(
            user_id=user_id,
            agent_name=agent_name,
            status=status,
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc) if status in ["completed", "failed"] else None,
            error=error,
            meta_info=meta_info or {},
        )
        db.add(run)
        db.commit()
        return run

    def run_assessment_pipeline(self, db: Session, user: User) -> Dict[str, Any]:
        """
        End-to-End Orchestrated Pipeline:
        1. Profile Analysis Agent
        2. Skill Gap Agent
        3. Learning Planner Agent
        4. Storing to PostgreSQL
        """
        logger.info(f"Starting assessment pipeline for user {user.id} ({user.email})")
        pipeline_run = self.log_agent_run(db, user.id, "orchestrator", status="running")

        try:
            # 1. Load User Profile
            profile = db.query(Profile).filter(Profile.user_id == user.id).first()
            if not profile:
                profile = Profile(user_id=user.id, experience_level="1–3 Years", raw_skills_text="")
                db.add(profile)
                db.commit()
                db.refresh(profile)

            # Target Role
            target_role = None
            if profile.target_role_id:
                target_role = db.query(TargetRole).filter(TargetRole.id == profile.target_role_id).first()
            if not target_role:
                # Default to Data Analyst or first available role
                target_role = db.query(TargetRole).filter(TargetRole.title.ilike("%Data Analyst%")).first()
                if not target_role:
                    target_role = db.query(TargetRole).first()
                if target_role:
                    profile.target_role_id = target_role.id
                    db.commit()

            target_role_title = target_role.title if target_role else "Data Analyst"

            # 2. Check for Resume Text
            resume = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.created_at.desc()).first()
            resume_text = resume.raw_text if resume else None

            # Split raw skills
            declared_skills = [
                s.strip() for s in (profile.raw_skills_text or "").split(",") if s.strip()
            ]

            # ----------------------------------------------------
            # STEP 1: Profile Analysis Agent
            # ----------------------------------------------------
            prof_run = self.log_agent_run(db, user.id, "profile_agent", status="running")
            profile_output = profile_agent.analyze_profile(
                full_name=user.full_name,
                experience_level=profile.experience_level,
                raw_skills=declared_skills,
                career_goal=profile.career_goal,
                resume_text=resume_text,
            )

            # Store extracted skills in user_skills table
            for ext_skill in profile_output.skills:
                skill_obj = db.query(Skill).filter(Skill.name.ilike(ext_skill.name)).first()
                if not skill_obj:
                    skill_obj = Skill(name=ext_skill.name, category="Technical", description=f"Skill: {ext_skill.name}")
                    db.add(skill_obj)
                    db.commit()
                    db.refresh(skill_obj)

                user_skill = (
                    db.query(UserSkill)
                    .filter(UserSkill.user_id == user.id, UserSkill.skill_id == skill_obj.id)
                    .first()
                )
                if not user_skill:
                    user_skill = UserSkill(
                        user_id=user.id,
                        skill_id=skill_obj.id,
                        current_level=ext_skill.level,
                        confidence=ext_skill.confidence,
                        verified=False,
                    )
                    db.add(user_skill)
                else:
                    user_skill.current_level = ext_skill.level
                    user_skill.confidence = ext_skill.confidence

            profile.parsed_profile_data = profile_output.model_dump()
            db.commit()

            prof_run.status = "completed"
            prof_run.completed_at = datetime.now(timezone.utc)
            db.commit()

            # ----------------------------------------------------
            # STEP 2: Skill Gap Agent
            # ----------------------------------------------------
            gap_run = self.log_agent_run(db, user.id, "skill_gap_agent", status="running")

            # Load target role requirements from DB
            role_requirements: List[Dict[str, Any]] = []
            if target_role:
                for rs in target_role.role_skills:
                    role_requirements.append(
                        {
                            "name": rs.skill.name,
                            "required_level": rs.required_level,
                            "importance": rs.importance,
                            "category": rs.skill.category,
                        }
                    )

            current_skills_input = [
                {"name": s.name, "level": s.level} for s in profile_output.skills
            ]

            gap_output = skill_gap_agent.evaluate_gaps(
                target_role_title=target_role_title,
                role_requirements=role_requirements,
                learner_skills=current_skills_input,
                experience_summary=profile_output.experience_summary,
            )

            # Store skill gaps in database
            # Clear older gaps for clean reload
            db.query(SkillGap).filter(SkillGap.user_id == user.id).delete()

            for eg in gap_output.gaps:
                skill_obj = db.query(Skill).filter(Skill.name.ilike(eg.skill)).first()
                if not skill_obj:
                    skill_obj = Skill(name=eg.skill, category="Core", description=f"{eg.skill} competency")
                    db.add(skill_obj)
                    db.commit()
                    db.refresh(skill_obj)

                sg = SkillGap(
                    user_id=user.id,
                    skill_id=skill_obj.id,
                    current_level=eg.current_level,
                    required_level=eg.required_level,
                    status=eg.status,
                    priority=eg.priority,
                    reason=eg.reason,
                    ai_note=eg.ai_note,
                )
                db.add(sg)
            db.commit()

            gap_run.status = "completed"
            gap_run.completed_at = datetime.now(timezone.utc)
            db.commit()

            # ----------------------------------------------------
            # STEP 3: Learning Planner Agent
            # ----------------------------------------------------
            planner_run = self.log_agent_run(db, user.id, "learning_planner_agent", status="running")

            planner_output = learning_planner_agent.generate_plan(
                learner_name=user.full_name,
                target_role=target_role_title,
                skill_gaps=[g.model_dump() for g in gap_output.gaps],
                learning_pace=profile.learning_pace,
            )

            # Archive or replace previous active learning plans
            old_plans = db.query(LearningPlan).filter(LearningPlan.user_id == user.id, LearningPlan.status == "active").all()
            for op in old_plans:
                op.status = "archived"

            new_plan = LearningPlan(
                user_id=user.id,
                target_role_id=target_role.id if target_role else 1,
                title=planner_output.plan_title,
                status="active",
                progress_percent=0.0,
            )
            db.add(new_plan)
            db.commit()
            db.refresh(new_plan)

            # Insert stages, practice tasks, and curated resources
            for idx, stage in enumerate(planner_output.stages):
                obj = LearningObjective(
                    plan_id=new_plan.id,
                    stage_order=idx + 1,
                    phase=stage.phase,
                    title=stage.title,
                    status=stage.status,
                    estimated_time=stage.estimated_time,
                    difficulty=stage.difficulty,
                    why_learn=stage.why_learn,
                    objectives_json=stage.objectives,
                )
                db.add(obj)
                db.commit()
                db.refresh(obj)

                # Attach practice task
                if stage.practice_task:
                    pt = PracticeTask(
                        objective_id=obj.id,
                        title=stage.practice_task.title,
                        topic=stage.practice_task.topic,
                        estimated_time=stage.practice_task.estimated_time,
                        difficulty=stage.practice_task.difficulty,
                        prompt=stage.practice_task.prompt,
                        schema_hint=stage.practice_task.schema_hint,
                        starter_query=stage.practice_task.starter_query,
                        solution_note=stage.practice_task.solution_note,
                        completed=(stage.status == "completed"),
                    )
                    db.add(pt)

                # Attach resources from resource service
                resources = resource_service.get_resources_for_skill(stage.title)
                for res in resources:
                    lr = LearningResource(
                        objective_id=obj.id,
                        title=res["title"],
                        provider=res["provider"],
                        url=res.get("url"),
                        skill=stage.title,
                        difficulty=res.get("difficulty", "Intermediate"),
                        resource_type=res.get("type", "Guide"),
                        estimated_time=res.get("time", "30 min"),
                        description=res.get("description"),
                    )
                    db.add(lr)

            db.commit()

            # Update initial progress percentage
            completed_count = sum(1 for s in planner_output.stages if s.status == "completed")
            new_plan.progress_percent = round((completed_count / len(planner_output.stages)) * 100, 1)
            db.commit()

            planner_run.status = "completed"
            planner_run.completed_at = datetime.now(timezone.utc)

            pipeline_run.status = "completed"
            pipeline_run.completed_at = datetime.now(timezone.utc)
            db.commit()

            return {
                "status": "success",
                "message": "Personalized learning path generated successfully.",
                "plan_id": new_plan.id,
                "gaps_detected": len(gap_output.gaps),
                "stages_generated": len(planner_output.stages),
            }

        except Exception as e:
            logger.error(f"Assessment pipeline encountered an error: {e}")
            pipeline_run.status = "failed"
            pipeline_run.error = str(e)
            pipeline_run.completed_at = datetime.now(timezone.utc)
            db.commit()
            raise e

orchestrator = AgentOrchestrator()
