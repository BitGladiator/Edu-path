from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    current_level = Column(String(50), nullable=False) # Beginner, Intermediate, Strong, Advanced, None
    required_level = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False) # Ready, Improve, Gap
    priority = Column(String(50), nullable=False, default="Medium") # Critical, High, Medium, Low
    reason = Column(Text, nullable=True)
    ai_note = Column(Text, nullable=True) # Why this matters for target role
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="skill_gaps")
    skill = relationship("Skill", back_populates="skill_gaps")
