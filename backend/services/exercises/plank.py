from .base import ExerciseValidator
from ..angle_calculator import calculate_angle, get_point


class PlankValidator(ExerciseValidator):
    def __init__(self):
        super().__init__()
        self.name = "plank"
        self.angle_targets = {
            "body_line": (165, 180),
        }

    def validate(self, landmarks: list[list[float]]) -> dict:
        l_shoulder = get_point(landmarks, 11)
        l_hip = get_point(landmarks, 23)
        l_ankle = get_point(landmarks, 27)

        r_shoulder = get_point(landmarks, 12)
        r_hip = get_point(landmarks, 24)
        r_ankle = get_point(landmarks, 28)

        l_body_angle = calculate_angle(l_shoulder, l_hip, l_ankle)
        r_body_angle = calculate_angle(r_shoulder, r_hip, r_ankle)
        body_angle = (l_body_angle + r_body_angle) / 2

        angles = {
            "body_line": round(body_angle, 1),
        }

        corrections = []
        is_correct = True

        if body_angle < 160:
            corrections.append("Lift your hips — body is sagging")
            is_correct = False
        elif body_angle > 190:
            corrections.append("Lower your hips — body is piking up")
            is_correct = False

        form_score = self._calculate_form_score(angles, self.angle_targets)
        self.form_scores.append(form_score)

        return {
            "angles": angles,
            "is_correct": is_correct,
            "corrections": corrections,
            "form_score": form_score,
            "rep_count": self.rep_count,
            "set_count": self.set_count,
            "joint_indices": [11, 23, 27] if corrections else [],
        }
