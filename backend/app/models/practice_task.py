from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database.connection import Base

class PracticeTask(Base):
    __tablename__ = "practice_tasks"

    id = Column(Integer, primary_key=True, index=True)
    objective_id = Column(Integer, ForeignKey("learning_objectives.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    topic = Column(String(100), nullable=False)
    estimated_time = Column(String(50), default="45 min")
    difficulty = Column(String(50), default="Intermediate")
    prompt = Column(Text, nullable=False)
    schema_hint = Column(Text, nullable=True)
    starter_query = Column(Text, nullable=True)
    solution_note = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    user_submission = Column(Text, nullable=True)
    evaluation_feedback = Column(Text, nullable=True)
    evaluation_score = Column(Float, nullable=True) # 0.0 - 1.0
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    objective = relationship("LearningObjective", back_populates="practice_tasks")
