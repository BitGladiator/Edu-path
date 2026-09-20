from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False) # e.g. Data Querying, Analytical Reasoning
    description = Column(Text, nullable=True)

    # Relationships
    role_skills = relationship("RoleSkill", back_populates="skill")
    user_skills = relationship("UserSkill", back_populates="skill")
    skill_gaps = relationship("SkillGap", back_populates="skill")

class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    current_level = Column(String(50), nullable=False, default="Beginner") # Beginner, Intermediate, Strong, Advanced
    confidence = Column(Float, default=0.7) # 0.0 to 1.0
    verified = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="user_skills")
    skill = relationship("Skill", back_populates="user_skills")
