from .base import ExerciseValidator
from ..angle_calculator import calculate_angle, get_point


class DeadliftValidator(ExerciseValidator):
    def __init__(self):
        super().__init__()
        self.name = "deadlift"
        self.angle_targets = {
            "hip": (80, 120),
            "knee": (80, 130),
            "back": (160, 180),
        }

    def validate(self, landmarks: list[list[float]]) -> dict:
        l_shoulder = get_point(landmarks, 11)
        l_hip = get_point(landmarks, 23)
        l_knee = get_point(landmarks, 25)
        l_ankle = get_point(landmarks, 27)

        r_shoulder = get_point(landmarks, 12)
        r_hip = get_point(landmarks, 24)
        r_knee = get_point(landmarks, 26)
        r_ankle = get_point(landmarks, 28)

        l_hip_angle = calculate_angle(l_shoulder, l_hip, l_knee)
        r_hip_angle = calculate_angle(r_shoulder, r_hip, r_knee)
        hip_angle = (l_hip_angle + r_hip_angle) / 2

        l_knee_angle = calculate_angle(l_hip, l_knee, l_ankle)
        r_knee_angle = calculate_angle(r_hip, r_knee, r_ankle)
        knee_angle = (l_knee_angle + r_knee_angle) / 2

        l_neck = get_point(landmarks, 0)
        r_neck = get_point(landmarks, 0)
        l_back_angle = calculate_angle(l_neck, l_hip, l_knee)
        r_back_angle = calculate_angle(r_neck, r_hip, r_knee)
        back_angle = (l_back_angle + r_back_angle) / 2

        angles = {
            "hip": round(hip_angle, 1),
            "knee": round(knee_angle, 1),
            "back": round(back_angle, 1),
        }

        corrections = []
        is_correct = True

        if back_angle < 155 and hip_angle < 140:
            corrections.append("Keep your back straight throughout")
            is_correct = False

        if hip_angle < 110 and not self.in_down_position:
            self.in_down_position = True

        if hip_angle > 165 and knee_angle > 160 and self.in_down_position:
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
            "joint_indices": [11, 23, 25] if corrections else [],
        }
