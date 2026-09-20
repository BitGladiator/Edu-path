from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    target_role_id = Column(Integer, ForeignKey("target_roles.id", ondelete="SET NULL"), nullable=True)
    experience_level = Column(String(50), default="1–3 Years") # Student, 0-1, 1-3, 3-5, 5+
    career_goal = Column(Text, nullable=True)
    learning_pace = Column(String(50), default="Moderate (4-6 hrs/week)")
    raw_skills_text = Column(Text, nullable=True) # User input comma-separated
    parsed_profile_data = Column(JSON, nullable=True) # Output from Profile Analysis Agent
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="profile")
    target_role = relationship("TargetRole", back_populates="profiles")
