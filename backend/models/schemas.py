from pydantic import BaseModel


class LandmarkFrame(BaseModel):
    type: str = "landmarks"
    exercise: str
    landmarks: list[list[float]]
    timestamp: int


class AngleFeedback(BaseModel):
    type: str = "feedback"
    angles: dict[str, float]
    is_correct: bool
    corrections: list[str]
    form_score: int
    rep_count: int
    set_count: int


class CorrectionMessage(BaseModel):
    type: str = "correction"
    message: str
    severity: str
    joint_indices: list[int]


class SessionResponse(BaseModel):
    id: int
    exercise: str
    total_reps: int
    valid_reps: int
    avg_form_score: float
    duration_seconds: int
    started_at: str

    class Config:
        from_attributes = True


class SessionDetail(BaseModel):
    id: int
    exercise: str
    total_reps: int
    valid_reps: int
    avg_form_score: float
    duration_seconds: int
    started_at: str
    reps: list["RepResponse"]

    class Config:
        from_attributes = True


class RepResponse(BaseModel):
    id: int
    rep_number: int
    form_score: int
    peak_angle: float
    is_valid: bool

    class Config:
        from_attributes = True
