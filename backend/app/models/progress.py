from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class ProgressEvent(Base):
    __tablename__ = "progress_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False) # objective_completed, task_submitted, assessment_generated, roadmap_adapted
    related_id = Column(Integer, nullable=True)
    score = Column(Float, nullable=True)
    delta_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="progress_events")

class WeeklyActivity(Base):
    __tablename__ = "weekly_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    day = Column(String(10), nullable=False) # Mon, Tue, Wed, Thu, Fri, Sat, Sun
    hours = Column(Float, default=0.0)
    sessions = Column(Integer, default=0)
    week_number = Column(Integer, default=1)
    year = Column(Integer, default=2026)

    # Relationships
    user = relationship("User", back_populates="weekly_activities")
