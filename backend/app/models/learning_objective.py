from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.connection import Base

class LearningObjective(Base):
    __tablename__ = "learning_objectives"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("learning_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    stage_order = Column(Integer, nullable=False, default=1)
    phase = Column(String(50), nullable=False) # FOUNDATION, CURRENT FOCUS, NEXT, LATER, PROJECT
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="not-started") # completed, in-progress, not-started
    estimated_time = Column(String(50), default="1 hour")
    difficulty = Column(String(50), default="Core") # Core, High Priority, Medium Priority, Capstone
    why_learn = Column(Text, nullable=True)
    objectives_json = Column(JSON, nullable=True) # list of objective bullets

    # Relationships
    plan = relationship("LearningPlan", back_populates="objectives")
    resources = relationship("LearningResource", back_populates="objective", cascade="all, delete-orphan")
    practice_tasks = relationship("PracticeTask", back_populates="objective", cascade="all, delete-orphan")
