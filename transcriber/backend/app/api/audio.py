"""Serve audio files for in-browser playback."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path

from ..database import get_db
from ..models import Meeting

router = APIRouter(tags=["audio"])


@router.get("/meetings/{meeting_id}/audio")
def get_audio(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.get(Meeting, meeting_id)
    if not meeting or not meeting.audio_path:
        raise HTTPException(404, "Audio not found")
    path = Path(meeting.audio_path)
    if not path.exists():
        raise HTTPException(404, "Audio file missing")
    return FileResponse(path, media_type="audio/mpeg")
