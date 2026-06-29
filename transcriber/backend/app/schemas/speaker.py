from pydantic import BaseModel


class SpeakerRead(BaseModel):
    id: str
    meeting_id: str
    label: str
    name: str
    color: str
    is_identified: bool

    model_config = {"from_attributes": True}


class SpeakerUpdate(BaseModel):
    name: str | None = None
    color: str | None = None


class MergeSpeakersRequest(BaseModel):
    source_speaker_id: str
    target_speaker_id: str
