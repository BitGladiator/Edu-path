import logging
from typing import List, Dict, Any
from pydantic import BaseModel
from app.services.llm_service import llm_service

logger = logging.getLogger("edupath.skill_gap_agent")

class EvaluatedGap(BaseModel):
    skill: str
    current_level: str
    required_level: str
    status: str  # "Ready", "Improve", "Gap"
    priority: str  # "Critical", "High", "Medium", "Low"
    reason: str
    ai_note: str

class SkillGapAnalysisOutput(BaseModel):
    gaps: List[EvaluatedGap]
    overall_readiness_score: float  # 0.0 to 1.0
    strategic_summary: str

class SkillGapAgent:
    SYSTEM_INSTRUCTION = """You are the EduPath Skill Gap Agent.
Your job is to compare a learner's actual current capabilities against the authoritative requirements for their target role.
Requirements come from a verified competency database.
For each requirement:
- If current level matches or exceeds required: status='Ready'
- If current level is 1 tier below required: status='Improve'
- If current level is substantially below required or missing: status='Gap'
Provide specific, concise reasoning explaining WHY this gap matters for candidate evaluation in the target role."""

    def evaluate_gaps(
        self,
        target_role_title: str,
        role_requirements: List[Dict[str, Any]],
        learner_skills: List[Dict[str, Any]],
        experience_summary: str,
    ) -> SkillGapAnalysisOutput:
        prompt = f"""Target Role: {target_role_title}
Learner Experience: {experience_summary}

Target Role Requirements (from Database):
{role_requirements}

Learner Current Skills (from Profile):
{learner_skills}

Perform the skill gap evaluation comparing each requirement against the learner's capabilities."""

        if llm_service.is_configured():
            try:
                result = llm_service.generate_structured(
                    prompt=prompt,
                    response_model=SkillGapAnalysisOutput,
                    system_instruction=self.SYSTEM_INSTRUCTION,
                )
                if result and result.gaps:
                    return result
            except Exception as e:
                logger.error(f"SkillGapAgent LLM analysis failed: {e}. Using deterministic evaluation fallback.")

        # Deterministic comparison fallback
        gaps: List[EvaluatedGap] = []
        user_skills_map = {s["name"].lower().strip(): s["level"] for s in learner_skills}

        levels_order = {"none": 0, "beginner": 1, "intermediate": 2, "strong": 3, "advanced": 4}

        ready_count = 0
        for req in role_requirements:
            skill_name = req["name"]
            req_level = req.get("required_level", "Intermediate")
            importance = req.get("importance", "High")

            curr_level = user_skills_map.get(skill_name.lower().strip(), "None")
            curr_score = levels_order.get(curr_level.lower(), 0)
            req_score = levels_order.get(req_level.lower(), 2)

            if curr_score >= req_score:
                status = "Ready"
                priority = "Low"
                reason = f"Current proficiency ({curr_level}) satisfies role expectation ({req_level})."
                ai_note = f"Your demonstrated knowledge of {skill_name} meets requirements."
                ready_count += 1
            elif curr_score == req_score - 1:
                status = "Improve"
                priority = "High" if importance in ["Critical", "High"] else "Medium"
                reason = f"Intermediate grasp; requires reinforcement to reach {req_level} production grade."
                ai_note = f"Bridging the {skill_name} gap from {curr_level} to {req_level} will satisfy technical screenings."
            else:
                status = "Gap"
                priority = "Critical" if importance == "Critical" else "High"
                reason = f"Fundamental gap; {req_level} level is expected for {target_role_title} candidates."
                ai_note = f"{skill_name} is a high-priority gap that must be addressed in your learning sequence."

            gaps.append(
                EvaluatedGap(
                    skill=skill_name,
                    current_level=curr_level if curr_level != "None" else "Beginner",
                    required_level=req_level,
                    status=status,
                    priority=priority,
                    reason=reason,
                    ai_note=ai_note,
                )
            )

        readiness = ready_count / len(role_requirements) if role_requirements else 0.0

        return SkillGapAnalysisOutput(
            gaps=gaps,
            overall_readiness_score=readiness,
            strategic_summary=f"Compared against {len(role_requirements)} competencies for {target_role_title}. {ready_count} ready, {len(gaps) - ready_count} gaps identified.",
        )

skill_gap_agent = SkillGapAgent()
