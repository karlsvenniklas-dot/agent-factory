from pydantic import BaseModel


class SegmentRead(BaseModel):
    id: str
    meeting_id: str
    speaker_id: str | None
    start_time: float
    end_time: float
    text: str
    original_text: str | None
    confidence: float | None
    is_edited: bool

    model_config = {"from_attributes": True}


class SegmentUpdate(BaseModel):
    text: str | None = None
    speaker_id: str | None = None
