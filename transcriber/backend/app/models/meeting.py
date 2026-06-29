import enum
from datetime import datetime
from sqlalchemy import String, Text, Enum, DateTime, Float, Integer, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class MeetingStatus(str, enum.Enum):
    pending = "pending"
    converting = "converting"
    transcribing = "transcribing"
    diarizing = "diarizing"
    identifying = "identifying"
    done = "done"
    error = "error"


class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    status: Mapped[MeetingStatus] = mapped_column(Enum(MeetingStatus), default=MeetingStatus.pending)
    progress_message: Mapped[str | None] = mapped_column(Text)
    progress_percent: Mapped[int] = mapped_column(Integer, default=0)

    audio_path: Mapped[str | None] = mapped_column(Text)
    original_filename: Mapped[str | None] = mapped_column(String(512))
    duration_seconds: Mapped[float | None] = mapped_column(Float)

    is_live: Mapped[bool] = mapped_column(Boolean, default=False)
    is_encrypted: Mapped[bool] = mapped_column(Boolean, default=False)
    encryption_hint: Mapped[str | None] = mapped_column(String(256))

    num_speakers: Mapped[int | None] = mapped_column(Integer)
    language: Mapped[str] = mapped_column(String(16), default="sv")

    celery_task_id: Mapped[str | None] = mapped_column(String(256))
    error_message: Mapped[str | None] = mapped_column(Text)

    extra_meta: Mapped[dict | None] = mapped_column(JSON)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)

    speakers: Mapped[list["Speaker"]] = relationship("Speaker", back_populates="meeting", cascade="all, delete-orphan")
    segments: Mapped[list["Segment"]] = relationship("Segment", back_populates="meeting", cascade="all, delete-orphan", order_by="Segment.start_time")
    actions: Mapped[list["Action"]] = relationship("Action", back_populates="meeting", cascade="all, delete-orphan")
