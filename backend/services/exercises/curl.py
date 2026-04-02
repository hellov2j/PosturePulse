from .base import ExerciseValidator
from ..angle_calculator import calculate_angle, get_point


class CurlValidator(ExerciseValidator):
    def __init__(self):
        super().__init__()
        self.name = "curl"
        self.angle_targets = {
            "elbow": (30, 160),
        }

    def validate(self, landmarks: list[list[float]]) -> dict:
        l_shoulder = get_point(landmarks, 11)
        l_elbow = get_point(landmarks, 13)
        l_wrist = get_point(landmarks, 15)

        r_shoulder = get_point(landmarks, 12)
        r_elbow = get_point(landmarks, 14)
        r_wrist = get_point(landmarks, 16)

        l_elbow_angle = calculate_angle(l_shoulder, l_elbow, l_wrist)
        r_elbow_angle = calculate_angle(r_shoulder, r_elbow, r_wrist)
        elbow_angle = (l_elbow_angle + r_elbow_angle) / 2

        l_shoulder_drift = calculate_angle(
            get_point(landmarks, 23), l_shoulder, l_elbow
        )
        r_shoulder_drift = calculate_angle(
            get_point(landmarks, 24), r_shoulder, r_elbow
        )
        shoulder_drift = (l_shoulder_drift + r_shoulder_drift) / 2

        angles = {
            "elbow": round(elbow_angle, 1),
        }

        corrections = []
        is_correct = True

        if shoulder_drift < 160 and elbow_angle < 100:
            corrections.append("Keep your elbows locked — no swinging")
            is_correct = False

        if elbow_angle < 50 and not self.in_down_position:
            self.in_down_position = True

        if elbow_angle > 155 and self.in_down_position:
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
            "joint_indices": [11, 13, 15] if corrections else [],
        }
