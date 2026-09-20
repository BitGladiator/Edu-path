import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.services.llm_service import llm_service

logger = logging.getLogger("edupath.learning_planner_agent")

class GeneratedPracticeTask(BaseModel):
    title: str
    topic: str
    estimated_time: str
    difficulty: str
    prompt: str
    schema_hint: Optional[str] = None
    starter_query: Optional[str] = None
    solution_note: Optional[str] = None

class GeneratedStage(BaseModel):
    phase: str  # FOUNDATION, CURRENT FOCUS, NEXT, LATER, PROJECT
    title: str
    status: str  # completed, in-progress, not-started
    estimated_time: str
    difficulty: str
    why_learn: str
    objectives: List[str]
    practice_task: Optional[GeneratedPracticeTask] = None

class LearningPlanOutput(BaseModel):
    plan_title: str
    target_role: str
    stages: List[GeneratedStage]

class LearningPlannerAgent:
    SYSTEM_INSTRUCTION = """You are the EduPath Learning Planner Agent.
Your responsibility is to design a realistic, sequenced learning roadmap customized to close a learner's specific skill gaps.
Rules:
1. Sequence strictly by prerequisites: Foundation -> Current Focus -> Next -> Later -> Capstone Project.
2. The highest-impact skill gap currently blocking candidate readiness MUST be assigned to 'CURRENT FOCUS' with status='in-progress'.
3. Any prerequisite skill already verified as 'Ready' in the profile should be placed in 'FOUNDATION' with status='completed'.
4. Provide a realistic, hands-on practice task for each stage.
5. Provide a clear, contextual 'why_learn' explaining why this stage matters for the target role.
6. Capstone project must synthesize the newly acquired skills into a production-grade portfolio project."""

    def generate_plan(
        self,
        learner_name: str,
        target_role: str,
        skill_gaps: List[Dict[str, Any]],
        learning_pace: str = "Moderate (4-6 hrs/week)",
    ) -> LearningPlanOutput:
        prompt = f"""Learner Name: {learner_name}
Target Role: {target_role}
Pace: {learning_pace}

Evaluated Skill Gaps:
{skill_gaps}

Generate a sequenced 5-stage learning roadmap (FOUNDATION, CURRENT FOCUS, NEXT, LATER, PROJECT) with realistic practice tasks."""

        if llm_service.is_configured():
            try:
                result = llm_service.generate_structured(
                    prompt=prompt,
                    response_model=LearningPlanOutput,
                    system_instruction=self.SYSTEM_INSTRUCTION,
                )
                if result and len(result.stages) >= 3:
                    return result
            except Exception as e:
                logger.error(f"LearningPlannerAgent LLM generation failed: {e}. Using deterministic curriculum generator.")

        # Deterministic generation fallback
        # Find ready skill for foundation, highest priority gap for current focus, next gaps for next/later
        ready_gaps = [g for g in skill_gaps if g.get("status") == "Ready"]
        active_gaps = [g for g in skill_gaps if g.get("status") in ["Improve", "Gap"]]

        foundation_title = f"{ready_gaps[0]['skill']} Fundamentals" if ready_gaps else "Core Fundamentals"
        current_gap = active_gaps[0] if active_gaps else {"skill": "Core Foundations"}
        next_gap = active_gaps[1] if len(active_gaps) > 1 else {"skill": "Applied Methodology"}
        later_gap = active_gaps[2] if len(active_gaps) > 2 else {"skill": "System Architecture"}

        stages = [
            GeneratedStage(
                phase="FOUNDATION",
                title=foundation_title,
                status="completed",
                estimated_time="4 hours",
                difficulty="Core",
                why_learn=f"A solid baseline in {foundation_title} is necessary to ensure downstream analysis and queries are accurate.",
                objectives=[
                  f"Core syntax and operational patterns in {foundation_title}",
                  "Data hygiene, normalization, and relational keys",
                  "Execution plan comprehension",
                ],
                practice_task=GeneratedPracticeTask(
                    title=f"Query {foundation_title} Records",
                    topic=foundation_title,
                    estimated_time="30 min",
                    difficulty="Beginner",
                    prompt="Verify basic extraction queries and data integrity checks.",
                    schema_hint="records (id, timestamp, entity_name, value)",
                    starter_query="SELECT entity_name, COUNT(*) FROM records GROUP BY entity_name;",
                    solution_note="Aggregates records by entity name and counts occurrences.",
                ),
            ),
            GeneratedStage(
                phase="CURRENT FOCUS",
                title=f"Advanced {current_gap['skill']}",
                status="in-progress",
                estimated_time="45 min",
                difficulty="High Priority",
                why_learn=f"Advanced {current_gap['skill']} is recommended because it is currently one of the largest gaps between your profile and the {target_role} role.",
                objectives=[
                    f"Complex analytical patterns and transforms in {current_gap['skill']}",
                    "Multi-table joins, CTEs, and window partitions",
                    "Performance optimization and indexing strategies",
                ],
                practice_task=GeneratedPracticeTask(
                    title=f"{current_gap['skill']} Joins & Aggregations",
                    topic=current_gap['skill'],
                    estimated_time="45 min",
                    difficulty="Intermediate",
                    prompt=f"Solve real-world dataset queries simulating {target_role} responsibilities using {current_gap['skill']}.",
                    schema_hint="users (id, created_at, country) | orders (id, user_id, order_date, total_amount)",
                    starter_query="SELECT u.id, MIN(o.order_date) AS first_order FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;",
                    solution_note="Returns customer first order timestamps using relational joins.",
                ),
            ),
            GeneratedStage(
                phase="NEXT",
                title=f"{next_gap['skill']} Fundamentals",
                status="not-started",
                estimated_time="6 hours",
                difficulty="High Priority",
                why_learn=f"{next_gap['skill']} provides analytical rigor to distinguish statistical signal from noise in product metrics.",
                objectives=[
                    f"Core mathematical and algorithmic formulations in {next_gap['skill']}",
                    "Experimentation design, hypothesis testing, and confidence intervals",
                    "Interpreting business KPIs and regression models",
                ],
                practice_task=GeneratedPracticeTask(
                    title=f"{next_gap['skill']} A/B Experiment Analysis",
                    topic=next_gap['skill'],
                    estimated_time="40 min",
                    difficulty="Intermediate",
                    prompt="Evaluate whether an experiment cohort shows statistically significant improvement over baseline.",
                    schema_hint="control: n=5000, conv=620 | variant: n=5000, conv=690",
                    starter_query="-- Compute pooled standard error and z-score",
                    solution_note="Evaluates z-statistic against critical threshold alpha=0.05.",
                ),
            ),
            GeneratedStage(
                phase="LATER",
                title=f"{later_gap['skill']} & Dashboard Design",
                status="not-started",
                estimated_time="5 hours",
                difficulty="Medium Priority",
                why_learn=f"Stakeholders consume analytical findings through {later_gap['skill']}. Building clear executive summaries unlocks leadership decisions.",
                objectives=[
                    f"Data modeling and star schema layouts in {later_gap['skill']}",
                    "Automating KPI calculations and data refreshes",
                    "Interactive drill-through and dashboard storytelling",
                ],
                practice_task=GeneratedPracticeTask(
                    title=f"Build Executive KPI Report in {later_gap['skill']}",
                    topic=later_gap['skill'],
                    estimated_time="50 min",
                    difficulty="Intermediate",
                    prompt="Construct an interactive dashboard tracking pacing against quarterly growth targets.",
                    schema_hint="sales_pipeline (id, deal_stage, deal_value, close_date)",
                    starter_query="-- Aggregate quarterly pipeline totals",
                    solution_note="Builds executive pacing calculations.",
                ),
            ),
            GeneratedStage(
                phase="PROJECT",
                title=f"{target_role} Capstone Project",
                status="not-started",
                estimated_time="8 hours",
                difficulty="Capstone",
                why_learn=f"This capstone project synthesizes {current_gap['skill']}, {next_gap['skill']}, and presentation into a verified artifact for hiring managers.",
                objectives=[
                    f"Extract, clean, and model raw production data using {current_gap['skill']}",
                    f"Perform quantitative validation with {next_gap['skill']}",
                    "Publish a comprehensive dashboard and executive recommendations memo",
                ],
                practice_task=GeneratedPracticeTask(
                    title="Capstone Submission & Peer Review",
                    topic="Capstone",
                    estimated_time="120 min",
                    difficulty="Advanced",
                    prompt="Deliver an analytical repository and executive memo answering key business growth questions.",
                    schema_hint="production schema",
                    starter_query="-- End to end pipeline script",
                    solution_note="Complete verified portfolio project.",
                ),
            ),
        ]

        return LearningPlanOutput(
            plan_title=f"Adaptive Learning Path: {target_role}",
            target_role=target_role,
            stages=stages,
        )

learning_planner_agent = LearningPlannerAgent()
