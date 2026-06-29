"""Iterative intro analysis using a local or cloud LLM.

Reads the transcript in 30-second chunks, building a picture of:
  - how many speakers are present
  - each speaker's name (from self-introductions)
  - when the intro phase ends

The result feeds back into diarization (num_speakers) and is used to map
anonymous SPEAKER_XX labels to real names.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field

import httpx

from ..config import get_settings
from .transcription import WhisperSegment

settings = get_settings()


@dataclass
class IntroResult:
    num_speakers: int
    speaker_names: dict[str, str]    # label → name, e.g. {"SPEAKER_00": "Anna"}
    intro_end_time: float
    raw_mapping: dict = field(default_factory=dict)


_SYSTEM_PROMPT = """Du är en assistent som analyserar mötesintros.
Du kommer att få en textdel av ett mötesutskrift (med talarsegment).
Din uppgift: identifiera när deltagare presenterar sig, extrahera deras namn och intern talaretikett.

Svara ALLTID i giltigt JSON med formatet:
{
  "participants": [{"label": "SPEAKER_00", "name": "Anna Svensson"}, ...],
  "intro_ended": false,
  "confidence": 0.8
}

Regler:
- Sök efter fraser som "jag heter", "mitt namn är", "jag är", "jag jobbar på", "jag representerar"
- Om en person presenteras av annan, använd det namnet
- intro_ended = true om du tror introduktionsfasen är KLAR i detta utsnitt
- Om du inte ser introducerande text, returnera tom participants-lista
"""


def analyse_intro(
    segments: list[WhisperSegment],
    assigned: list[tuple[WhisperSegment, str]],  # (segment, speaker_label)
    chunk_seconds: float = 30.0,
    max_intro_seconds: float = 300.0,
) -> IntroResult:
    all_participants: dict[str, str] = {}
    intro_end_time = 0.0

    cursor = 0.0
    while cursor < min(segments[-1].end if segments else 0, max_intro_seconds):
        chunk_end = cursor + chunk_seconds
        chunk_text = _build_chunk_text(assigned, cursor, chunk_end)
        if not chunk_text.strip():
            cursor = chunk_end
            continue

        response = _query_llm(chunk_text)
        if response:
            for p in response.get("participants", []):
                label = p.get("label", "")
                name = p.get("name", "")
                if label and name:
                    all_participants[label] = name

            if response.get("intro_ended", False):
                intro_end_time = chunk_end
                break

        cursor = chunk_end

    if not intro_end_time:
        intro_end_time = cursor

    return IntroResult(
        num_speakers=max(len(all_participants), _count_unique_speakers(assigned)),
        speaker_names=all_participants,
        intro_end_time=intro_end_time,
        raw_mapping=all_participants,
    )


def _count_unique_speakers(assigned: list[tuple]) -> int:
    return len({label for _, label in assigned})


def _build_chunk_text(assigned: list[tuple], start: float, end: float) -> str:
    lines = []
    for seg, label in assigned:
        if seg.end < start:
            continue
        if seg.start > end:
            break
        lines.append(f"[{label}] {seg.text}")
    return "\n".join(lines)


def _query_llm(text: str) -> dict | None:
    backend = settings.llm_backend.lower()
    try:
        if backend == "ollama":
            return _query_ollama(text)
        elif backend in ("openrouter", "openai"):
            return _query_openai_compatible(text)
    except Exception:
        pass
    return None


def _query_ollama(text: str) -> dict | None:
    payload = {
        "model": settings.ollama_model,
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        "format": "json",
        "stream": False,
    }
    resp = httpx.post(
        f"{settings.ollama_base_url}/api/chat",
        json=payload,
        timeout=60,
    )
    resp.raise_for_status()
    content = resp.json()["message"]["content"]
    return _parse_json(content)


def _query_openai_compatible(text: str) -> dict | None:
    if settings.llm_backend == "openrouter":
        base_url = "https://openrouter.ai/api/v1"
        api_key = settings.openrouter_api_key
        model = settings.openrouter_model
    else:
        base_url = "https://api.openai.com/v1"
        api_key = settings.openai_api_key
        model = settings.openai_model

    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        "response_format": {"type": "json_object"},
    }
    resp = httpx.post(f"{base_url}/chat/completions", json=payload, headers=headers, timeout=60)
    resp.raise_for_status()
    content = resp.json()["choices"][0]["message"]["content"]
    return _parse_json(content)


def _parse_json(text: str) -> dict | None:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except Exception:
                pass
    return None
