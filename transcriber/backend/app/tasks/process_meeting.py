"""Main meeting processing pipeline Celery task.

Pipeline:
  1. Convert audio to 16 kHz WAV
  2. Transcribe with whisper.cpp / openai-whisper
  3. Run pyannote diarization (preliminary, no speaker count)
  4. Analyse intro with LLM → num_speakers, names, intro_end
  5. Re-run diarization with known speaker count
  6. Map speaker labels to names
  7. Persist results to DB
  8. Publish WebSocket progress events via Redis pubsub
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path

import redis

from .celery_app import celery_app
from ..config import get_settings
from ..database import SessionLocal
from ..models import Meeting, MeetingStatus, Speaker, Segment
from ..services.audio import convert_to_wav, get_duration
from ..services.transcription import transcribe
from ..services.diarization import diarize, assign_speakers
from ..services.intro_analysis import analyse_intro

settings = get_settings()

_SPEAKER_COLORS = [
    "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6",
    "#8b5cf6", "#ef4444", "#14b8a6", "#f97316", "#84cc16",
]


def _publish(meeting_id: str, status: str, percent: int, message: str):
    try:
        r = redis.from_url(settings.redis_url)
        payload = json.dumps({"meeting_id": meeting_id, "status": status, "percent": percent, "message": message})
        r.publish(f"meeting:{meeting_id}", payload)
    except Exception:
        pass


def _update_meeting(db, meeting_id: str, **kwargs):
    meeting = db.get(Meeting, meeting_id)
    if meeting:
        for k, v in kwargs.items():
            setattr(meeting, k, v)
        meeting.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(meeting)
    return meeting


@celery_app.task(bind=True, name="app.tasks.process_meeting.process_meeting_task")
def process_meeting_task(self, meeting_id: str):
    db = SessionLocal()
    try:
        meeting = db.get(Meeting, meeting_id)
        if not meeting:
            return

        audio_src = Path(meeting.audio_path)
        wav_path = audio_src.with_suffix(".wav")

        # Step 1: Convert
        _update_meeting(db, meeting_id, status=MeetingStatus.converting, progress_percent=5, progress_message="Konverterar ljud...")
        _publish(meeting_id, "converting", 5, "Konverterar ljud...")
        convert_to_wav(audio_src, wav_path)
        duration = get_duration(wav_path)
        _update_meeting(db, meeting_id, duration_seconds=duration)

        # Step 2: Transcribe
        _update_meeting(db, meeting_id, status=MeetingStatus.transcribing, progress_percent=15, progress_message="Transkriberar tal...")
        _publish(meeting_id, "transcribing", 15, "Transkriberar tal med Whisper...")
        whisper_segments = transcribe(wav_path, language=meeting.language)

        # Step 3: Preliminary diarization (no speaker count hint)
        _update_meeting(db, meeting_id, status=MeetingStatus.diarizing, progress_percent=40, progress_message="Identifierar talare (preliminärt)...")
        _publish(meeting_id, "diarizing", 40, "Analyserar talare...")
        prelim_diarization = diarize(wav_path)
        prelim_assigned = assign_speakers(whisper_segments, prelim_diarization)

        # Step 4: Intro analysis
        _update_meeting(db, meeting_id, progress_percent=60, progress_message="Analyserar mötesintro med AI...")
        _publish(meeting_id, "identifying", 60, "Läser mötesintro med AI...")
        intro = analyse_intro(whisper_segments, prelim_assigned)

        num_speakers = intro.num_speakers if intro.num_speakers > 0 else None

        # Step 5: Re-run diarization with known speaker count
        _update_meeting(db, meeting_id, progress_percent=65, progress_message=f"Identifierar {num_speakers} talare...")
        _publish(meeting_id, "diarizing", 65, f"Hittade {num_speakers} deltagare. Förbättrar talaruppdelning...")
        if num_speakers and num_speakers != len({d.speaker for d in prelim_diarization}):
            final_diarization = diarize(wav_path, num_speakers=num_speakers)
        else:
            final_diarization = prelim_diarization
        final_assigned = assign_speakers(whisper_segments, final_diarization)

        # Step 6: Build speaker map
        unique_labels = sorted({label for _, label in final_assigned})
        _update_meeting(db, meeting_id, num_speakers=len(unique_labels), progress_percent=80, progress_message="Kopplar namn till röster...")
        _publish(meeting_id, "identifying", 80, "Kopplar namn till röster...")

        speaker_map: dict[str, Speaker] = {}
        for i, label in enumerate(unique_labels):
            name = intro.speaker_names.get(label, f"Deltagare {i + 1}")
            spk = Speaker(
                id=str(uuid.uuid4()),
                meeting_id=meeting_id,
                label=label,
                name=name,
                color=_SPEAKER_COLORS[i % len(_SPEAKER_COLORS)],
                is_identified=label in intro.speaker_names,
            )
            db.add(spk)
            speaker_map[label] = spk
        db.flush()

        # Step 7: Persist segments
        for wseg, label in final_assigned:
            spk = speaker_map.get(label)
            seg = Segment(
                id=str(uuid.uuid4()),
                meeting_id=meeting_id,
                speaker_id=spk.id if spk else None,
                start_time=wseg.start,
                end_time=wseg.end,
                text=wseg.text,
                confidence=wseg.confidence,
            )
            db.add(seg)

        _update_meeting(db, meeting_id,
                        status=MeetingStatus.done,
                        progress_percent=100,
                        progress_message="Klar!",
                        completed_at=datetime.utcnow())
        _publish(meeting_id, "done", 100, "Transkribering klar!")

    except Exception as exc:
        _update_meeting(db, meeting_id,
                        status=MeetingStatus.error,
                        error_message=str(exc),
                        progress_message=f"Fel: {exc}")
        _publish(meeting_id, "error", 0, f"Fel: {exc}")
        raise
    finally:
        db.close()
