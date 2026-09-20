from pydantic import BaseModel
from typing import List, Optional

class DailyActivity(BaseModel):
    day: str
    hours: float
    sessions: int

class ProgressSummaryResponse(BaseModel):
    completed_percent: int
    in_progress_percent: int
    remaining_percent: int
    completed_count: int
    in_progress_count: int
    remaining_count: int
    total_stages: int
    current_focus_title: Optional[str] = None
    current_focus_time: Optional[str] = None
    verified_skills_count: int
    gaps_count: int
    total_weekly_hours: float
    weekly_activity: List[DailyActivity] = []

    # Answers to 4 core questions
    what_did_i_learn: List[str] = []
    what_am_i_working_on: Optional[str] = None
    what_is_still_missing: List[str] = []
    what_should_i_do_next: Optional[str] = None
