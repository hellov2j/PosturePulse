import time
from .exercises.base import ExerciseValidator
from .exercises.squat import SquatValidator
from .exercises.pushup import PushupValidator
from .exercises.lunge import LungeValidator
from .exercises.deadlift import DeadliftValidator
from .exercises.plank import PlankValidator
from .exercises.curl import CurlValidator

EXERCISE_REGISTRY: dict[str, type[ExerciseValidator]] = {
    "squat": SquatValidator,
    "pushup": PushupValidator,
    "lunge": LungeValidator,
    "deadlift": DeadliftValidator,
    "plank": PlankValidator,
    "curl": CurlValidator,
}


class SessionManager:
    def __init__(self):
        self.active_validator: ExerciseValidator | None = None
        self.current_exercise: str | None = None
        self.session_start: float | None = None
        self.total_form_scores: list[int] = []

    def start_session(self, exercise: str) -> ExerciseValidator:
        if exercise not in EXERCISE_REGISTRY:
            raise ValueError(f"Unknown exercise: {exercise}")

        self.current_exercise = exercise
        self.active_validator = EXERCISE_REGISTRY[exercise]()
        self.session_start = None
        self.total_form_scores = []

        return self.active_validator

    def process_frame(self, landmarks: list[list[float]]) -> dict:
        if self.active_validator is None:
            return {"error": "No active session"}

        if self.session_start is None:
            self.session_start = time.time()

        result = self.active_validator.validate(landmarks)
        self.total_form_scores.append(result["form_score"])

        return result

    def get_session_stats(self) -> dict:
        if self.active_validator is None:
            return {}

        duration = int(time.time() - self.session_start) if self.session_start else 0
        avg_score = (
            sum(self.total_form_scores) / len(self.total_form_scores)
            if self.total_form_scores
            else 0
        )

        return {
            "exercise": self.current_exercise,
            "total_reps": self.active_validator.rep_count,
            "valid_reps": self.active_validator.rep_count,
            "avg_form_score": round(avg_score, 1),
            "duration_seconds": duration,
            "set_count": self.active_validator.set_count,
        }

    def end_session(self) -> dict:
        stats = self.get_session_stats()
        if self.active_validator:
            self.active_validator.reset()
        self.active_validator = None
        self.current_exercise = None
        self.session_start = None
        self.total_form_scores = []
        return stats

    def next_set(self):
        if self.active_validator:
            self.active_validator.new_set()
