CORRECTION_MESSAGES = {
    "squat": {
        "knee_low": "Go deeper — bend your knees more",
        "knee_high": "You're high — squat lower",
        "back_bend": "Straighten your back — chest up",
        "good": "Great depth!",
    },
    "pushup": {
        "elbow_high": "Lower your chest — bend elbows more",
        "body_sag": "Keep your body straight — tighten your core",
        "body_pike": "Lower your hips — don't pike up",
        "good": "Solid rep!",
    },
    "lunge": {
        "front_knee": "Bend your front knee to 90 degrees",
        "back_knee": "Lower your back knee closer to the ground",
        "torso": "Keep your torso upright",
        "good": "Perfect lunge!",
    },
    "deadlift": {
        "back_round": "Keep your back flat — don't round",
        "hip_hinge": "Hinge at the hips, not the back",
        "good": "Clean lift!",
    },
    "plank": {
        "sag": "Lift your hips — body is sagging",
        "pike": "Lower your hips — don't pike up",
        "good": "Strong plank hold!",
    },
    "curl": {
        "swing": "Keep elbows pinned — no swinging",
        "partial": "Full extension at the bottom",
        "good": "Great curl!",
    },
}


def get_severity(angles: dict[str, float], exercise: str) -> str:
    if exercise == "squat":
        knee = angles.get("knee", 180)
        back = angles.get("back", 180)
        if knee < 60 or back < 140:
            return "danger"
        if knee < 80 or back < 155:
            return "warning"

    elif exercise == "pushup":
        body = angles.get("body_line", 180)
        if body < 150 or body > 195:
            return "danger"
        if body < 160 or body > 188:
            return "warning"

    elif exercise == "plank":
        body = angles.get("body_line", 180)
        if body < 150 or body > 195:
            return "danger"
        if body < 162 or body > 185:
            return "warning"

    elif exercise == "lunge":
        front = angles.get("front_knee", 180)
        back = angles.get("back_knee", 180)
        if front > 150 or back > 160:
            return "danger"
        if front > 120 or back > 130:
            return "warning"

    elif exercise == "deadlift":
        hip = angles.get("hip", 180)
        back = angles.get("back", 180)
        if back < 140:
            return "danger"
        if hip < 90 or back < 155:
            return "warning"

    elif exercise == "curl":
        elbow = angles.get("elbow", 180)
        if elbow > 100 and elbow < 150:
            return "warning"

    return "info"
