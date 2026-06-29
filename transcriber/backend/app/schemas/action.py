from datetime import datetime
from pydantic import BaseModel


class ActionCreate(BaseModel):
    name: str
    prompt: str
    is_favorite: bool = False


class ActionRunRead(BaseModel):
    id: str
    action_id: str
    result: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ActionRead(BaseModel):
    id: str
    meeting_id: str
    name: str
    prompt: str
    is_favorite: bool
    created_at: datetime
    runs: list[ActionRunRead] = []

    model_config = {"from_attributes": True}
