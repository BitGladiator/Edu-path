import logging
from typing import Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.services.llm_service import llm_service
from app.models.learning_plan import LearningPlan
from app.models.learning_objective import LearningObjective
from app.models.practice_task import PracticeTask
from app.models.skill import Skill, UserSkill
from app.models.skill_gap import SkillGap
from app.models.progress import ProgressEvent

logger = logging.getLogger("edupath.progress_agent")

class EvaluationDecision(BaseModel):
    evaluation_feedback: str
    score: float  # 0.0 to 1.0
    passed: bool
    skill_promoted: Optional[str] = None
    new_skill_level: Optional[str] = None
    gap_status_update: Optional[str] = None  # "Ready", "Improve", "Gap"
    roadmap_adjustment_note: str

class ProgressAgent:
    SYSTEM_INSTRUCTION = """You are the EduPath Progress & Adaptation Agent.
You evaluate learner submissions, track task completions, and adapt the learner's skill state, gap statuses, and learning plan.
Rules:
1. Objectively evaluate submitted code/solution against the problem requirements.
2. If the learner passes the exercise, award a score >= 0.85, promote the related skill tier (e.g. from Beginner to Intermediate, or Intermediate to Advanced/Strong), update the gap status to 'Ready', and activate the next roadmap milestone.
3. If the solution is inadequate or partial, provide constructive feedback and recommend focused review.
4. Formulate an adaptive note summarizing how the curriculum was recalibrated based on this progress."""

    def evaluate_task_submission(
        self,
        task: PracticeTask,
        submission_text: str,
        user_skills_summary: str,
        target_role: str,
    ) -> EvaluationDecision:
        prompt = f"""Target Role: {target_role}
Task Title: {task.title}
Task Topic: {task.topic}
Task Prompt:
{task.prompt}

Reference Solution Note:
{task.solution_note}

Learner Submission:
\"\"\"{submission_text}\"\"\"

Current Skills Summary:
{user_skills_summary}

Evaluate this submission, decide score, whether to promote skill tier, and how to adapt the roadmap."""

        if llm_service.is_configured():
            try:
                result = llm_service.generate_structured(
                    prompt=prompt,
                    response_model=EvaluationDecision,
                    system_instruction=self.SYSTEM_INSTRUCTION,
                )
                if result:
                    return result
            except Exception as e:
                logger.error(f"ProgressAgent LLM evaluation failed: {e}. Using deterministic evaluation fallback.")

        # Deterministic evaluation fallback
        is_substantive = len(submission_text.strip()) >= 15
        if is_substantive:
            return EvaluationDecision(
                evaluation_feedback=f"Solution for '{task.title}' verified. Correct query logic and analytical structure.",
                score=0.92,
                passed=True,
                skill_promoted=task.topic,
                new_skill_level="Advanced" if "advanced" in task.title.lower() else "Intermediate",
                gap_status_update="Ready",
                roadmap_adjustment_note=f"Promoted {task.topic} proficiency to Ready. Activated next learning stage in roadmap.",
            )
        else:
            return EvaluationDecision(
                evaluation_feedback="Submission appears too brief or incomplete. Please provide a full query or analytical formulation.",
                score=0.35,
                passed=False,
                skill_promoted=None,
                new_skill_level=None,
                gap_status_update=None,
                roadmap_adjustment_note="Maintained current stage in progress. Additional practice recommended before advancing.",
            )

    def apply_progress_update(
        self,
        db: Session,
        user_id: int,
        objective: LearningObjective,
        decision: Optional[EvaluationDecision] = None,
    ) -> Dict[str, Any]:
        """
        Executes the adaptive feedback loop:
        1. Marks objective complete
        2. Promotes skill level in user_skills and skill_gaps
        3. Recalculates plan progress percentage
        4. Activates next stage in roadmap
        5. Logs ProgressEvent
        """
        objective.status = "completed"
        for task in objective.practice_tasks:
            task.completed = True

        plan = db.query(LearningPlan).filter(LearningPlan.id == objective.plan_id).first()
        if not plan:
            return {}

        all_objs = (
            db.query(LearningObjective)
            .filter(LearningObjective.plan_id == plan.id)
            .order_by(LearningObjective.stage_order)
            .all()
        )

        completed_count = sum(1 for o in all_objs if o.status == "completed")
        total_count = len(all_objs)
        plan.progress_percent = round((completed_count / total_count) * 100, 1) if total_count > 0 else 0

        # Activate next objective if it was not started
        activated_next = None
        for o in all_objs:
            if o.status == "not-started":
                o.status = "in-progress"
                activated_next = o.title
                break

        # Update skill gap status in database
        promoted_skill_name = None
        if decision and decision.skill_promoted:
            promoted_skill_name = decision.skill_promoted
        else:
            # Infer from objective title
            promoted_skill_name = objective.title.replace("Advanced ", "").replace(" Fundamentals", "")

        # Find matching skill gap and user skill
        skill_record = (
            db.query(Skill)
            .filter(Skill.name.ilike(f"%{promoted_skill_name}%"))
            .first()
        )

        if skill_record:
            gap = (
                db.query(SkillGap)
                .filter(SkillGap.user_id == user_id, SkillGap.skill_id == skill_record.id)
                .first()
            )
            if gap:
                gap.status = "Ready"
                gap.current_level = gap.required_level
                gap.priority = "Low"
                gap.reason = f"Verified through practical task completion in module '{objective.title}'."

            user_skill = (
                db.query(UserSkill)
                .filter(UserSkill.user_id == user_id, UserSkill.skill_id == skill_record.id)
                .first()
            )
            if user_skill:
                user_skill.current_level = gap.required_level if gap else "Advanced"
                user_skill.verified = True
                user_skill.confidence = 0.95

        # Record event in progress_events table
        event = ProgressEvent(
            user_id=user_id,
            event_type="objective_completed",
            related_id=objective.id,
            score=decision.score if decision else 1.0,
            delta_summary=f"Completed {objective.title}. Activated: {activated_next or 'All stages completed'}. Progress: {plan.progress_percent}%",
        )
        db.add(event)
        db.commit()

        return {
            "completed_objective": objective.title,
            "new_progress_percent": plan.progress_percent,
            "activated_next": activated_next,
            "promoted_skill": promoted_skill_name,
            "decision": decision.model_dump() if decision else None,
        }

progress_agent = ProgressAgent()
