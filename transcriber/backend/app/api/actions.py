"""Smart actions: AI-powered transcript analysis."""
import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..models import Action, ActionRun, Meeting, Segment, Speaker
from ..schemas import ActionCreate, ActionRead, ActionRunRead

router = APIRouter(prefix="/meetings/{meeting_id}/actions", tags=["actions"])
settings = get_settings()


def _build_transcript_text(segments, speakers: dict) -> str:
    lines = []
    for seg in segments:
        spk = speakers.get(seg.speaker_id)
        name = spk.name if spk else "Okänd"
        lines.append(f"[{name}] {seg.text}")
    return "\n".join(lines)


def _run_llm(system: str, user: str) -> str:
    backend = settings.llm_backend.lower()
    if backend == "ollama":
        resp = httpx.post(
            f"{settings.ollama_base_url}/api/chat",
            json={
                "model": settings.ollama_model,
                "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
                "stream": False,
            },
            timeout=120,
        )
        resp.raise_for_status()
        return resp.json()["message"]["content"]
    else:
        if backend == "openrouter":
            base_url = "https://openrouter.ai/api/v1"
            api_key = settings.openrouter_api_key
            model = settings.openrouter_model
        else:
            base_url = "https://api.openai.com/v1"
            api_key = settings.openai_api_key
            model = settings.openai_model
        resp = httpx.post(
            f"{base_url}/chat/completions",
            json={"model": model, "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}]},
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=120,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


@router.get("", response_model=list[ActionRead])
def list_actions(meeting_id: str, db: Session = Depends(get_db)):
    return db.query(Action).filter(Action.meeting_id == meeting_id).all()


@router.post("", response_model=ActionRead)
def create_action(meeting_id: str, body: ActionCreate, db: Session = Depends(get_db)):
    m = db.get(Meeting, meeting_id)
    if not m:
        raise HTTPException(404, "Meeting not found")
    action = Action(
        id=str(uuid.uuid4()),
        meeting_id=meeting_id,
        **body.model_dump(),
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action


@router.post("/{action_id}/run", response_model=ActionRunRead)
def run_action(meeting_id: str, action_id: str, db: Session = Depends(get_db)):
    action = db.get(Action, action_id)
    if not action or action.meeting_id != meeting_id:
        raise HTTPException(404, "Action not found")

    segments = (
        db.query(Segment)
        .filter(Segment.meeting_id == meeting_id)
        .order_by(Segment.start_time)
        .all()
    )
    speakers = {s.id: s for s in db.query(Speaker).filter(Speaker.meeting_id == meeting_id).all()}
    transcript = _build_transcript_text(segments, speakers)

    system = "Du är en assistent som analyserar mötesutskrifter. Svara på svenska om inget annat anges."
    user = f"{action.prompt}\n\n---\nMÖTESUTSKRIFT:\n{transcript}"

    result = _run_llm(system, user)
    run = ActionRun(id=str(uuid.uuid4()), action_id=action_id, result=result)
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


@router.delete("/{action_id}", status_code=204)
def delete_action(meeting_id: str, action_id: str, db: Session = Depends(get_db)):
    action = db.get(Action, action_id)
    if not action or action.meeting_id != meeting_id:
        raise HTTPException(404, "Action not found")
    db.delete(action)
    db.commit()
