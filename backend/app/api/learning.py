from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.learning_plan import LearningPlan
from app.models.learning_objective import LearningObjective
from app.models.practice_task import PracticeTask
from app.schemas.learning import (
    LearningPlanResponse,
    LearningObjectiveResponse,
    LearningResourceResponse,
    PracticeTaskResponse,
    PracticeSubmitRequest,
    ReorderRequest,
)
from app.agents.progress_agent import progress_agent
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/learning-plan", tags=["Learning Plan & Practice"])

@router.get("", response_model=Optional[LearningPlanResponse])
def get_active_learning_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = (
        db.query(LearningPlan)
        .filter(LearningPlan.user_id == current_user.id, LearningPlan.status == "active")
        .order_by(LearningPlan.created_at.desc())
        .first()
    )

    if not plan:
        # If no plan, auto-run assessment pipeline once
        orchestrator.run_assessment_pipeline(db=db, user=current_user)
        plan = (
            db.query(LearningPlan)
            .filter(LearningPlan.user_id == current_user.id, LearningPlan.status == "active")
            .order_by(LearningPlan.created_at.desc())
            .first()
        )

    if not plan:
        return None

    stages_res = []
    for obj in plan.objectives:
        res_list = [
            LearningResourceResponse(
                id=r.id,
                title=r.title,
                provider=r.provider,
                url=r.url,
                skill=r.skill,
                difficulty=r.difficulty,
                type=r.resource_type,
                time=r.estimated_time,
                description=r.description,
            )
            for r in obj.resources
        ]

        pt_res = None
        if obj.practice_tasks:
            pt = obj.practice_tasks[0]
            pt_res = PracticeTaskResponse(
                id=pt.id,
                title=pt.title,
                topic=pt.topic,
                estimated_time=pt.estimated_time,
                difficulty=pt.difficulty,
                prompt=pt.prompt,
                schema_hint=pt.schema_hint,
                starter_query=pt.starter_query,
                solution_note=pt.solution_note,
                completed=pt.completed,
                evaluation_feedback=pt.evaluation_feedback,
                evaluation_score=pt.evaluation_score,
            )

        stages_res.append(
            LearningObjectiveResponse(
                id=obj.id,
                stage_order=obj.stage_order,
                phase=obj.phase,
                title=obj.title,
                status=obj.status,
                estimated_time=obj.estimated_time,
                difficulty=obj.difficulty,
                why_learn=obj.why_learn,
                objectives=obj.objectives_json or [],
                resources=res_list,
                practice_task=pt_res,
            )
        )

    return LearningPlanResponse(
        id=plan.id,
        title=plan.title,
        target_role=plan.target_role.title if plan.target_role else "Data Analyst",
        status=plan.status,
        progress_percent=plan.progress_percent,
        stages=stages_res,
    )

@router.post("/objectives/{objective_id}/complete")
def complete_objective(
    objective_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    objective = (
        db.query(LearningObjective)
        .join(LearningPlan)
        .filter(LearningObjective.id == objective_id, LearningPlan.user_id == current_user.id)
        .first()
    )
    if not objective:
        raise HTTPException(status_code=404, detail="Objective not found or unauthorized.")

    result = progress_agent.apply_progress_update(
        db=db,
        user_id=current_user.id,
        objective=objective,
    )
    return {"message": "Objective marked complete and progress adapted.", "data": result}

@router.put("/reorder")
def reorder_stages(
    req: ReorderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = (
        db.query(LearningObjective)
        .join(LearningPlan)
        .filter(LearningObjective.id == req.objective_id, LearningPlan.user_id == current_user.id)
        .first()
    )
    if not obj:
        raise HTTPException(status_code=404, detail="Objective not found.")

    plan_objs = (
        db.query(LearningObjective)
        .filter(LearningObjective.plan_id == obj.plan_id)
        .order_by(LearningObjective.stage_order)
        .all()
    )

    idx = next((i for i, o in enumerate(plan_objs) if o.id == req.objective_id), -1)
    if idx == -1:
        raise HTTPException(status_code=404, detail="Objective index error.")

    target_idx = idx - 1 if req.direction == "up" else idx + 1
    if 0 <= target_idx < len(plan_objs):
        # Swap orders
        plan_objs[idx].stage_order, plan_objs[target_idx].stage_order = (
            plan_objs[target_idx].stage_order,
            plan_objs[idx].stage_order,
        )
        db.commit()

    return {"message": "Roadmap reordered successfully."}

@router.get("/practice-tasks", response_model=List[PracticeTaskResponse])
def get_practice_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tasks = (
        db.query(PracticeTask)
        .join(LearningObjective)
        .join(LearningPlan)
        .filter(LearningPlan.user_id == current_user.id, LearningPlan.status == "active")
        .all()
    )
    return [
        PracticeTaskResponse(
            id=pt.id,
            title=pt.title,
            topic=pt.topic,
            estimated_time=pt.estimated_time,
            difficulty=pt.difficulty,
            prompt=pt.prompt,
            schema_hint=pt.schema_hint,
            starter_query=pt.starter_query,
            solution_note=pt.solution_note,
            completed=pt.completed,
            evaluation_feedback=pt.evaluation_feedback,
            evaluation_score=pt.evaluation_score,
        )
        for pt in tasks
    ]

@router.post("/practice-tasks/{task_id}/submit")
def submit_practice_task(
    task_id: int,
    sub_in: PracticeSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = (
        db.query(PracticeTask)
        .join(LearningObjective)
        .join(LearningPlan)
        .filter(PracticeTask.id == task_id, LearningPlan.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Practice task not found.")

    target_role_title = task.objective.plan.target_role.title if task.objective.plan.target_role else "Data Analyst"

    decision = progress_agent.evaluate_task_submission(
        task=task,
        submission_text=sub_in.submission_text,
        user_skills_summary="",
        target_role=target_role_title,
    )

    task.user_submission = sub_in.submission_text
    task.evaluation_feedback = decision.evaluation_feedback
    task.evaluation_score = decision.score
    task.completed = decision.passed

    if decision.passed:
        progress_agent.apply_progress_update(
            db=db,
            user_id=current_user.id,
            objective=task.objective,
            decision=decision,
        )

    db.commit()

    return {
        "passed": decision.passed,
        "score": decision.score,
        "feedback": decision.evaluation_feedback,
        "roadmap_adjustment": decision.roadmap_adjustment_note,
    }
