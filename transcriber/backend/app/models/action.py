from datetime import datetime
from sqlalchemy import String, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class Action(Base):
    """Saved smart-action prompt (e.g. 'summarize', 'action items')."""
    __tablename__ = "actions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    meeting_id: Mapped[str] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(256))
    prompt: Mapped[str] = mapped_column(Text)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="actions")
    runs: Mapped[list["ActionRun"]] = relationship("ActionRun", back_populates="action", cascade="all, delete-orphan")


class ActionRun(Base):
    """Result of running a smart action on a transcript."""
    __tablename__ = "action_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    action_id: Mapped[str] = mapped_column(ForeignKey("actions.id", ondelete="CASCADE"))
    result: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    action: Mapped["Action"] = relationship("Action", back_populates="runs")
