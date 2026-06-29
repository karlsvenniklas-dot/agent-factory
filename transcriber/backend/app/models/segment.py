from sqlalchemy import String, ForeignKey, Text, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class Segment(Base):
    __tablename__ = "segments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    meeting_id: Mapped[str] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"))
    speaker_id: Mapped[str | None] = mapped_column(ForeignKey("speakers.id", ondelete="SET NULL"), nullable=True)

    start_time: Mapped[float] = mapped_column(Float, nullable=False)
    end_time: Mapped[float] = mapped_column(Float, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    original_text: Mapped[str | None] = mapped_column(Text)   # preserved before editing
    confidence: Mapped[float | None] = mapped_column(Float)
    is_edited: Mapped[bool] = mapped_column(Boolean, default=False)

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="segments")
    speaker: Mapped["Speaker | None"] = relationship("Speaker", back_populates="segments")
