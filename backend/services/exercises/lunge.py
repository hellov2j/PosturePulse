from .base import ExerciseValidator
from ..angle_calculator import calculate_angle, get_point


class LungeValidator(ExerciseValidator):
    def __init__(self):
        super().__init__()
        self.name = "lunge"
        self.angle_targets = {
            "front_knee": (80, 110),
            "back_knee": (80, 110),
            "torso": (160, 180),
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

        if l_knee_angle < r_knee_angle:
            front_knee = l_knee_angle
            back_knee = r_knee_angle
            torso_angle = calculate_angle(l_shoulder, l_hip, l_knee)
        else:
            front_knee = r_knee_angle
            back_knee = l_knee_angle
            torso_angle = calculate_angle(r_shoulder, r_hip, r_knee)

        angles = {
            "front_knee": round(front_knee, 1),
            "back_knee": round(back_knee, 1),
            "torso": round(torso_angle, 1),
        }

        corrections = []
        is_correct = True

        if front_knee > 120:
            corrections.append("Bend your front knee more")
            is_correct = False

        if back_knee > 130:
            corrections.append("Lower your back knee")
            is_correct = False

        if torso_angle < 155:
            corrections.append("Keep your torso upright")
            is_correct = False

        if front_knee < 100 and not self.in_down_position:
            self.in_down_position = True

        if front_knee > 155 and self.in_down_position:
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
            "joint_indices": [23, 25, 27] if corrections else [],
        }
