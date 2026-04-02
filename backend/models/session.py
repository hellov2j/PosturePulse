from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    exercise = Column(String, nullable=False)
    total_reps = Column(Integer, default=0)
    valid_reps = Column(Integer, default=0)
    avg_form_score = Column(Float, default=0.0)
    duration_seconds = Column(Integer, default=0)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ended_at = Column(DateTime, nullable=True)

    reps = relationship("Rep", back_populates="session", cascade="all, delete-orphan")


class Rep(Base):
    __tablename__ = "reps"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("workout_sessions.id"), nullable=False)
    rep_number = Column(Integer, nullable=False)
    form_score = Column(Integer, default=0)
    peak_angle = Column(Float, default=0.0)
    is_valid = Column(Boolean, default=True)

    session = relationship("WorkoutSession", back_populates="reps")
