from .base import ExerciseValidator
from ..angle_calculator import calculate_angle, get_point


class SquatValidator(ExerciseValidator):
    def __init__(self):
        super().__init__()
        self.name = "squat"
        self.angle_targets = {
            "knee": (70, 110),
            "back": (155, 180),
        }

    def validate(self, landmarks: list[list[float]]) -> dict:
        l_hip = get_point(landmarks, 23)
        l_knee = get_point(landmarks, 25)
        l_ankle = get_point(landmarks, 27)
        l_shoulder = get_point(landmarks, 11)

        r_hip = get_point(landmarks, 24)
        r_knee = get_point(landmarks, 26)
        r_ankle = get_point(landmarks, 28)
        r_shoulder = get_point(landmarks, 12)

        l_knee_angle = calculate_angle(l_hip, l_knee, l_ankle)
        r_knee_angle = calculate_angle(r_hip, r_knee, r_ankle)
        knee_angle = (l_knee_angle + r_knee_angle) / 2

        l_back_angle = calculate_angle(l_shoulder, l_hip, l_knee)
        r_back_angle = calculate_angle(r_shoulder, r_hip, r_knee)
        back_angle = (l_back_angle + r_back_angle) / 2

        angles = {
            "knee": round(knee_angle, 1),
            "back": round(back_angle, 1),
        }

        corrections = []
        is_correct = True

        if knee_angle < 70:
            corrections.append("Go lower — knees need more bend")
            is_correct = False

        if back_angle < 155 and knee_angle < 140:
            corrections.append("Straighten your back")
            is_correct = False

        if knee_angle < 100 and not self.in_down_position:
            self.in_down_position = True

        if knee_angle > 155 and self.in_down_position:
            self.rep_count += 1
            self.in_down_position = False

        form_score = self._calculate_form_score(angles, self.angle_targets)
        self.form_scores.append(form_score)

        return {
            "angles": angles,
            "is_correct": is_correct,
            "corrections": corrections,
            "form_score": form_score,
            "rep_count": self.rep_count,
            "set_count": self.set_count,
            "joint_indices": [23, 25, 27, 11, 12] if corrections else [],
        }
