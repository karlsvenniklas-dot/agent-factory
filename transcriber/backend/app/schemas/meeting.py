from datetime import datetime
from pydantic import BaseModel
from ..models.meeting import MeetingStatus


class MeetingCreate(BaseModel):
    title: str
    language: str = "sv"


class MeetingUpdate(BaseModel):
    title: str | None = None
    is_encrypted: bool | None = None
    encryption_hint: str | None = None


class MeetingList(BaseModel):
    id: str
    title: str
    status: MeetingStatus
    duration_seconds: float | None
    num_speakers: int | None
    is_encrypted: bool
    is_live: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class MeetingRead(MeetingList):
    progress_message: str | None
    progress_percent: int
    error_message: str | None
    language: str
    original_filename: str | None
    completed_at: datetime | None
    updated_at: datetime


class ProcessingProgress(BaseModel):
    meeting_id: str
    status: MeetingStatus
    progress_percent: int
    message: str | None
