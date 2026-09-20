import logging
from typing import List, Optional
from pydantic import BaseModel
from app.services.llm_service import llm_service

logger = logging.getLogger("edupath.profile_agent")

class ExtractedSkill(BaseModel):
    name: str
    level: str  # Beginner, Intermediate, Strong, Advanced
    confidence: float  # 0.0 to 1.0

class ProfileAnalysisOutput(BaseModel):
    skills: List[ExtractedSkill]
    experience_summary: str
    key_strengths: List[str]
    suggested_target_roles: List[str]

class ProfileAgent:
    SYSTEM_INSTRUCTION = """You are the EduPath Profile Analysis Agent.
Your responsibility is to analyze a learner's raw input, resume text, experience level, and projects to extract a verified, structured capability profile.
Do not hallucinate skills. Calibrate estimated skill levels conservatively:
- 'Beginner' for skills mentioned with <1 year or tutorial usage.
- 'Intermediate' for 1-3 years of applied practical work.
- 'Strong' or 'Advanced' for 3+ years, deep architectural fluency, or proven production projects."""

    def analyze_profile(
        self,
        full_name: str,
        experience_level: str,
        raw_skills: List[str],
        career_goal: Optional[str] = None,
        resume_text: Optional[str] = None,
    ) -> ProfileAnalysisOutput:
        prompt = f"""Learner Name: {full_name}
Declared Experience: {experience_level}
Declared Skills: {', '.join(raw_skills) if raw_skills else 'None specified'}
Career Goal: {career_goal or 'Not specified'}

Resume Content Excerpt:
\"\"\"{resume_text[:4000] if resume_text else 'No resume uploaded.'}\"\"\"

Analyze this learner's background and produce the structured profile output with validated skill proficiencies."""

        if llm_service.is_configured():
            try:
                result = llm_service.generate_structured(
                    prompt=prompt,
                    response_model=ProfileAnalysisOutput,
                    system_instruction=self.SYSTEM_INSTRUCTION,
                )
                if result and result.skills:
                    return result
            except Exception as e:
                logger.error(f"ProfileAgent LLM analysis failed: {e}. Using deterministic parsing fallback.")

        # Deterministic fallback parser
        skills: List[ExtractedSkill] = []
        for s in raw_skills:
            clean = s.strip()
            if not clean:
                continue
            skills.append(
                ExtractedSkill(
                    name=clean,
                    level="Intermediate" if "1-3" in experience_level or "3-5" in experience_level else "Beginner",
                    confidence=0.85,
                )
            )

        if not skills and resume_text:
            common = ["Python", "SQL", "Excel", "JavaScript", "React", "Docker", "Git"]
            for term in common:
                if term.lower() in resume_text.lower():
                    skills.append(ExtractedSkill(name=term, level="Intermediate", confidence=0.75))

        return ProfileAnalysisOutput(
            skills=skills,
            experience_summary=f"{full_name} has {experience_level} of practical experience.",
            key_strengths=[s.name for s in skills[:3]],
            suggested_target_roles=["Data Analyst", "Full Stack Developer"],
        )

profile_agent = ProfileAgent()
