"""Segment editing endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Segment
from ..schemas import SegmentRead, SegmentUpdate

router = APIRouter(prefix="/meetings/{meeting_id}/segments", tags=["segments"])


@router.get("", response_model=list[SegmentRead])
def list_segments(meeting_id: str, db: Session = Depends(get_db)):
    return (
        db.query(Segment)
        .filter(Segment.meeting_id == meeting_id)
        .order_by(Segment.start_time)
        .all()
    )


@router.patch("/{segment_id}", response_model=SegmentRead)
def update_segment(meeting_id: str, segment_id: str, body: SegmentUpdate, db: Session = Depends(get_db)):
    seg = db.get(Segment, segment_id)
    if not seg or seg.meeting_id != meeting_id:
        raise HTTPException(404, "Segment not found")

    if body.text is not None and not seg.is_edited:
        seg.original_text = seg.text
        seg.is_edited = True
    if body.text is not None:
        seg.text = body.text
    if body.speaker_id is not None:
        seg.speaker_id = body.speaker_id

    db.commit()
    db.refresh(seg)
    return seg
