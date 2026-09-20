from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(Integer, primary_key=True, index=True)
    objective_id = Column(Integer, ForeignKey("learning_objectives.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    provider = Column(String(100), default="EduPath Curated")
    url = Column(String(500), nullable=True)
    skill = Column(String(100), nullable=True)
    difficulty = Column(String(50), default="Intermediate")
    resource_type = Column(String(50), default="Guide") # Guide, Documentation, Walkthrough, Video, Book
    estimated_time = Column(String(50), default="30 min")
    description = Column(Text, nullable=True)

    # Relationships
    objective = relationship("LearningObjective", back_populates="resources")
