"""Meeting CRUD + file upload + recording endpoints."""
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..models import Meeting, MeetingStatus
from ..schemas import MeetingCreate, MeetingList, MeetingRead, MeetingUpdate
from ..tasks.process_meeting import process_meeting_task

router = APIRouter(prefix="/meetings", tags=["meetings"])
settings = get_settings()

ALLOWED_AUDIO_TYPES = {
    "audio/mpeg", "audio/mp4", "audio/wav", "audio/webm",
    "audio/m4a", "video/mp4", "video/webm",
    "audio/x-m4a", "audio/ogg",
}


@router.get("", response_model=list[MeetingList])
def list_meetings(db: Session = Depends(get_db)):
    from ..models.meeting import Meeting as M
    return db.query(M).order_by(M.created_at.desc()).all()


@router.get("/{meeting_id}", response_model=MeetingRead)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    m = db.get(Meeting, meeting_id)
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return m


@router.post("", response_model=MeetingRead, status_code=status.HTTP_201_CREATED)
def upload_meeting(
    file: UploadFile = File(...),
    title: str = Form(...),
    language: str = Form("sv"),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported media type: {file.content_type}")

    meeting_id = str(uuid.uuid4())
    upload_dir = settings.upload_dir / meeting_id
    upload_dir.mkdir(parents=True, exist_ok=True)

    suffix = Path(file.filename or "audio").suffix or ".audio"
    dest = upload_dir / f"original{suffix}"
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    meeting = Meeting(
        id=meeting_id,
        title=title,
        language=language,
        audio_path=str(dest),
        original_filename=file.filename,
        status=MeetingStatus.pending,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    task = process_meeting_task.delay(meeting_id)
    meeting.celery_task_id = task.id
    db.commit()
    db.refresh(meeting)
    return meeting


@router.patch("/{meeting_id}", response_model=MeetingRead)
def update_meeting(meeting_id: str, body: MeetingUpdate, db: Session = Depends(get_db)):
    m = db.get(Meeting, meeting_id)
    if not m:
        raise HTTPException(404, "Meeting not found")
    for field, val in body.model_dump(exclude_none=True).items():
        setattr(m, field, val)
    db.commit()
    db.refresh(m)
    return m


@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    m = db.get(Meeting, meeting_id)
    if not m:
        raise HTTPException(404, "Meeting not found")
    upload_dir = settings.upload_dir / meeting_id
    if upload_dir.exists():
        shutil.rmtree(upload_dir)
    db.delete(m)
    db.commit()


@router.post("/{meeting_id}/reprocess", response_model=MeetingRead)
def reprocess_meeting(meeting_id: str, db: Session = Depends(get_db)):
    m = db.get(Meeting, meeting_id)
    if not m:
        raise HTTPException(404, "Meeting not found")
    from ..models import Segment, Speaker
    db.query(Segment).filter(Segment.meeting_id == meeting_id).delete()
    db.query(Speaker).filter(Speaker.meeting_id == meeting_id).delete()
    m.status = MeetingStatus.pending
    m.error_message = None
    m.progress_percent = 0
    db.commit()

    task = process_meeting_task.delay(meeting_id)
    m.celery_task_id = task.id
    db.commit()
    db.refresh(m)
    return m
