"""Export transcript in multiple formats."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Meeting, Segment, Speaker
from ..services.export import EXPORTERS
from ..services.encryption import decrypt

router = APIRouter(prefix="/meetings/{meeting_id}/export", tags=["export"])


@router.get("/{format}")
def export_meeting(
    meeting_id: str,
    format: str,
    password: str | None = None,
    db: Session = Depends(get_db),
):
    if format not in EXPORTERS:
        raise HTTPException(400, f"Unknown format: {format}. Choose from: {', '.join(EXPORTERS)}")

    meeting = db.get(Meeting, meeting_id)
    if not meeting:
        raise HTTPException(404, "Meeting not found")

    if meeting.is_encrypted:
        if not password:
            raise HTTPException(403, "Meeting is encrypted. Provide ?password=...")

    segments = (
        db.query(Segment)
        .filter(Segment.meeting_id == meeting_id)
        .order_by(Segment.start_time)
        .all()
    )
    speakers_list = db.query(Speaker).filter(Speaker.meeting_id == meeting_id).all()
    speakers = {s.id: s for s in speakers_list}

    fn, content_type, ext = EXPORTERS[format]
    data = fn(meeting, segments, speakers)

    if meeting.is_encrypted and password:
        data = decrypt(data, password)

    filename = f"{meeting.title[:50]}{ext}"
    return Response(
        content=data,
        media_type=content_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
