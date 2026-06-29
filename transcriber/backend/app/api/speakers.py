"""Speaker management: rename, recolor, merge."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Speaker, Segment
from ..schemas import SpeakerRead, SpeakerUpdate, MergeSpeakersRequest

router = APIRouter(prefix="/meetings/{meeting_id}/speakers", tags=["speakers"])


@router.get("", response_model=list[SpeakerRead])
def list_speakers(meeting_id: str, db: Session = Depends(get_db)):
    return db.query(Speaker).filter(Speaker.meeting_id == meeting_id).all()


@router.patch("/{speaker_id}", response_model=SpeakerRead)
def update_speaker(meeting_id: str, speaker_id: str, body: SpeakerUpdate, db: Session = Depends(get_db)):
    spk = db.get(Speaker, speaker_id)
    if not spk or spk.meeting_id != meeting_id:
        raise HTTPException(404, "Speaker not found")
    for field, val in body.model_dump(exclude_none=True).items():
        setattr(spk, field, val)
    db.commit()
    db.refresh(spk)
    return spk


@router.post("/merge", response_model=list[SpeakerRead])
def merge_speakers(meeting_id: str, body: MergeSpeakersRequest, db: Session = Depends(get_db)):
    source = db.get(Speaker, body.source_speaker_id)
    target = db.get(Speaker, body.target_speaker_id)
    if not source or source.meeting_id != meeting_id:
        raise HTTPException(404, "Source speaker not found")
    if not target or target.meeting_id != meeting_id:
        raise HTTPException(404, "Target speaker not found")

    db.query(Segment).filter(Segment.speaker_id == source.id).update({"speaker_id": target.id})
    db.delete(source)
    db.commit()

    return db.query(Speaker).filter(Speaker.meeting_id == meeting_id).all()
