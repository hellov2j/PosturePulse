from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..database import get_db
from ..models.session import WorkoutSession, Rep
from ..models.schemas import SessionResponse, SessionDetail

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("/", response_model=list[SessionResponse])
def list_sessions(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    sessions = (
        db.query(WorkoutSession)
        .order_by(WorkoutSession.started_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        SessionResponse(
            id=s.id,
            exercise=s.exercise,
            total_reps=s.total_reps,
            valid_reps=s.valid_reps,
            avg_form_score=s.avg_form_score,
            duration_seconds=s.duration_seconds,
            started_at=s.started_at.isoformat() if s.started_at else "",
        )
        for s in sessions
    ]


@router.post("/", response_model=SessionResponse)
def create_session(exercise: str, db: Session = Depends(get_db)):
    session = WorkoutSession(
        exercise=exercise,
        started_at=datetime.now(timezone.utc),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return SessionResponse(
        id=session.id,
        exercise=session.exercise,
        total_reps=session.total_reps,
        valid_reps=session.valid_reps,
        avg_form_score=session.avg_form_score,
        duration_seconds=session.duration_seconds,
        started_at=session.started_at.isoformat() if session.started_at else "",
    )


@router.get("/stats/summary")
def get_stats_summary(db: Session = Depends(get_db)):
    sessions = db.query(WorkoutSession).filter(WorkoutSession.ended_at.isnot(None)).all()

    if not sessions:
        return {
            "total_sessions": 0,
            "total_reps": 0,
            "avg_form_score": 0,
            "total_time_hours": 0,
            "exercise_breakdown": {},
        }

    total_reps = sum(s.total_reps for s in sessions)
    total_time = sum(s.duration_seconds for s in sessions)
    avg_score = sum(s.avg_form_score for s in sessions) / len(sessions)

    breakdown = {}
    for s in sessions:
        if s.exercise not in breakdown:
            breakdown[s.exercise] = {"sessions": 0, "reps": 0}
        breakdown[s.exercise]["sessions"] += 1
        breakdown[s.exercise]["reps"] += s.total_reps

    return {
        "total_sessions": len(sessions),
        "total_reps": total_reps,
        "avg_form_score": round(avg_score, 1),
        "total_time_hours": round(total_time / 3600, 1),
        "exercise_breakdown": breakdown,
    }


@router.get("/{session_id}", response_model=SessionDetail)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(WorkoutSession).filter(WorkoutSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return SessionDetail(
        id=session.id,
        exercise=session.exercise,
        total_reps=session.total_reps,
        valid_reps=session.valid_reps,
        avg_form_score=session.avg_form_score,
        duration_seconds=session.duration_seconds,
        started_at=session.started_at.isoformat() if session.started_at else "",
        reps=[
            {
                "id": r.id,
                "rep_number": r.rep_number,
                "form_score": r.form_score,
                "peak_angle": r.peak_angle,
                "is_valid": r.is_valid,
            }
            for r in session.reps
        ],
    )


@router.put("/{session_id}/complete")
def complete_session(
    session_id: int,
    total_reps: int = 0,
    valid_reps: int = 0,
    avg_form_score: float = 0.0,
    duration_seconds: int = 0,
    db: Session = Depends(get_db),
):
    session = db.query(WorkoutSession).filter(WorkoutSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.total_reps = total_reps
    session.valid_reps = valid_reps
    session.avg_form_score = avg_form_score
    session.duration_seconds = duration_seconds
    session.ended_at = datetime.now(timezone.utc)

    db.commit()
    return {"status": "completed", "session_id": session_id}
