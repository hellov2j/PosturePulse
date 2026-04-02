import numpy as np


def calculate_angle(a: list[float], b: list[float], c: list[float]) -> float:
    a = np.array(a[:2])
    b = np.array(b[:2])
    c = np.array(c[:2])

    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(
        a[1] - b[1], a[0] - b[0]
    )
    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360.0 - angle

    return float(angle)


def get_point(landmarks: list[list[float]], index: int) -> list[float]:
    if index >= len(landmarks):
        return [0.0, 0.0, 0.0]
    pt = landmarks[index]
    if len(pt) >= 3:
        return [pt[0], pt[1], pt[2]]
    return [0.0, 0.0, 0.0]
