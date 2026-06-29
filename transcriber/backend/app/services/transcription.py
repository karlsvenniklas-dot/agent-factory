"""Whisper-based transcription service.

Prefers whisper.cpp binary (kb-whisper-large.bin) for best Swedish quality.
Falls back to Python openai-whisper if binary/model not found.
"""
import json
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

from ..config import get_settings

settings = get_settings()


@dataclass
class WhisperSegment:
    start: float
    end: float
    text: str
    confidence: float | None = None


def transcribe(audio_path: Path, language: str = "sv") -> list[WhisperSegment]:
    if _has_whisper_cpp():
        return _transcribe_cpp(audio_path, language)
    return _transcribe_python(audio_path, language)


def _has_whisper_cpp() -> bool:
    return (
        settings.whisper_binary.exists()
        and settings.kb_lab_model.exists()
        and settings.use_kb_lab_model
    )


def _transcribe_cpp(audio_path: Path, language: str) -> list[WhisperSegment]:
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as f:
        output_json = Path(f.name)

    cmd = [
        str(settings.whisper_binary),
        "-m", str(settings.kb_lab_model),
        "-f", str(audio_path),
        "-l", language,
        "--output-json",
        "-of", str(output_json.with_suffix("")),
        "--no-timestamps", "false",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"whisper.cpp failed: {result.stderr}")

    data = json.loads(output_json.read_text())
    segments = []
    for seg in data.get("transcription", []):
        segments.append(WhisperSegment(
            start=_parse_ts(seg["timestamps"]["from"]),
            end=_parse_ts(seg["timestamps"]["to"]),
            text=seg["text"].strip(),
        ))
    output_json.unlink(missing_ok=True)
    return segments


def _parse_ts(ts: str) -> float:
    """Parse whisper.cpp timestamp 'HH:MM:SS,mmm' to seconds."""
    h, m, rest = ts.split(":")
    s, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def _transcribe_python(audio_path: Path, language: str) -> list[WhisperSegment]:
    import whisper  # type: ignore
    model = whisper.load_model(settings.whisper_model)
    result = model.transcribe(str(audio_path), language=language, word_timestamps=True)
    segments = []
    for seg in result["segments"]:
        segments.append(WhisperSegment(
            start=seg["start"],
            end=seg["end"],
            text=seg["text"].strip(),
            confidence=seg.get("avg_logprob"),
        ))
    return segments
