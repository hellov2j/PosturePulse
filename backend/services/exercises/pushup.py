from .base import ExerciseValidator
from ..angle_calculator import calculate_angle, get_point


class PushupValidator(ExerciseValidator):
    def __init__(self):
        super().__init__()
        self.name = "pushup"
        self.angle_targets = {
            "elbow": (80, 110),
            "body_line": (160, 180),
        }

    def validate(self, landmarks: list[list[float]]) -> dict:
        l_shoulder = get_point(landmarks, 11)
        l_elbow = get_point(landmarks, 13)
        l_wrist = get_point(landmarks, 15)
        l_hip = get_point(landmarks, 23)
        l_ankle = get_point(landmarks, 27)

        r_shoulder = get_point(landmarks, 12)
        r_elbow = get_point(landmarks, 14)
        r_wrist = get_point(landmarks, 16)
        r_hip = get_point(landmarks, 24)
        r_ankle = get_point(landmarks, 28)

        l_elbow_angle = calculate_angle(l_shoulder, l_elbow, l_wrist)
        r_elbow_angle = calculate_angle(r_shoulder, r_elbow, r_wrist)
        elbow_angle = (l_elbow_angle + r_elbow_angle) / 2

        l_body_angle = calculate_angle(l_shoulder, l_hip, l_ankle)
        r_body_angle = calculate_angle(r_shoulder, r_hip, r_ankle)
        body_angle = (l_body_angle + r_body_angle) / 2

        angles = {
            "elbow": round(elbow_angle, 1),
            "body_line": round(body_angle, 1),
        }

        corrections = []
        is_correct = True

        if body_angle < 160 and elbow_angle < 140:
            corrections.append("Keep your body straight — hips are sagging")
            is_correct = False
        elif body_angle > 190:
            corrections.append("Lower your hips — body is piking up")
            is_correct = False

        if elbow_angle < 100 and not self.in_down_position:
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
            "joint_indices": [11, 23, 27] if corrections else [],
        }
