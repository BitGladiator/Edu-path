from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class TargetRole(Base):
    __tablename__ = "target_roles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)

    # Relationships
    role_skills = relationship("RoleSkill", back_populates="role", cascade="all, delete-orphan")
    profiles = relationship("Profile", back_populates="target_role")
    learning_plans = relationship("LearningPlan", back_populates="target_role")

class RoleSkill(Base):
    __tablename__ = "role_skills"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("target_roles.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    required_level = Column(String(50), nullable=False, default="Intermediate") # Beginner, Intermediate, Advanced, Strong
    importance = Column(String(50), nullable=False, default="High") # Critical, High, Medium, Nice to have

    # Relationships
    role = relationship("TargetRole", back_populates="role_skills")
    skill = relationship("Skill", back_populates="role_skills")
