from sqlalchemy import String, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class Speaker(Base):
    __tablename__ = "speakers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    meeting_id: Mapped[str] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"))
    label: Mapped[str] = mapped_column(String(64))       # internal: SPEAKER_00, SPEAKER_01 ...
    name: Mapped[str] = mapped_column(String(256))        # identified or user-edited name
    color: Mapped[str] = mapped_column(String(16), default="#6366f1")
    is_identified: Mapped[bool] = mapped_column(Boolean, default=False)
    embedding: Mapped[list | None] = mapped_column(JSON)  # stored voice embedding

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="speakers")
    segments: Mapped[list["Segment"]] = relationship("Segment", back_populates="speaker")
