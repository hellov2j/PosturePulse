from abc import ABC, abstractmethod


class ExerciseValidator(ABC):
    def __init__(self):
        self.name: str = ""
        self.rep_count: int = 0
        self.set_count: int = 1
        self.in_down_position: bool = False
        self.form_scores: list[int] = []

    @abstractmethod
    def validate(self, landmarks: list[list[float]]) -> dict:
        pass

    def reset(self):
        self.rep_count = 0
        self.set_count = 1
        self.in_down_position = False
        self.form_scores = []

    def new_set(self):
        self.set_count += 1
        self.in_down_position = False

    def _calculate_form_score(self, angles: dict[str, float], targets: dict[str, tuple[float, float]]) -> int:
        if not angles:
            return 0

        total_score = 0
        count = 0

        for angle_name, value in angles.items():
            if angle_name in targets:
                ideal_min, ideal_max = targets[angle_name]
                ideal_mid = (ideal_min + ideal_max) / 2
                range_half = (ideal_max - ideal_min) / 2

                if range_half == 0:
                    range_half = 1

                distance = abs(value - ideal_mid)
                score = max(0, 100 - (distance / range_half) * 50)
                total_score += score
                count += 1

        if count == 0:
            return 0

        return int(total_score / count)
