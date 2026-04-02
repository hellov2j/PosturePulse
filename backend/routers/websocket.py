import json
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..services.scorer import SessionManager
from ..services.feedback import get_severity
from ..database import SessionLocal
from ..models.session import WorkoutSession

router = APIRouter()
session_manager = SessionManager()


def save_session_to_db(stats: dict):
    if not stats or not stats.get("exercise"):
        return

    db = SessionLocal()
    try:
        session = WorkoutSession(
            exercise=stats["exercise"],
            total_reps=stats.get("total_reps", 0),
            valid_reps=stats.get("valid_reps", 0),
            avg_form_score=stats.get("avg_form_score", 0.0),
            duration_seconds=stats.get("duration_seconds", 0),
            started_at=datetime.now(timezone.utc),
            ended_at=datetime.now(timezone.utc),
        )
        db.add(session)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            msg_type = message.get("type", "")

            if msg_type == "start":
                exercise = message.get("exercise", "squat")
                try:
                    session_manager.start_session(exercise)
                    await websocket.send_json(
                        {
                            "type": "session_started",
                            "exercise": exercise,
                            "message": f"Session started: {exercise.upper()}",
                        }
                    )
                except ValueError as e:
                    await websocket.send_json({"type": "error", "message": str(e)})

            elif msg_type == "landmarks":
                landmarks = message.get("landmarks", [])
                if landmarks and session_manager.active_validator:
                    result = session_manager.process_frame(landmarks)

                    severity = get_severity(
                        result.get("angles", {}),
                        session_manager.current_exercise or "",
                    )

                    await websocket.send_json(
                        {
                            "type": "feedback",
                            "angles": result["angles"],
                            "is_correct": result["is_correct"],
                            "corrections": result["corrections"],
                            "form_score": result["form_score"],
                            "rep_count": result["rep_count"],
                            "set_count": result["set_count"],
                            "severity": severity,
                        }
                    )

                    if result["corrections"]:
                        await websocket.send_json(
                            {
                                "type": "correction",
                                "message": result["corrections"][0],
                                "severity": severity,
                                "joint_indices": result.get("joint_indices", []),
                            }
                        )

            elif msg_type == "next_set":
                session_manager.next_set()
                await websocket.send_json(
                    {
                        "type": "set_started",
                        "set_count": session_manager.active_validator.set_count
                        if session_manager.active_validator
                        else 1,
                    }
                )

            elif msg_type == "end":
                stats = session_manager.end_session()
                save_session_to_db(stats)
                await websocket.send_json({"type": "session_ended", "stats": stats})

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        stats = session_manager.end_session()
        save_session_to_db(stats)
