"""Speaker diarization using pyannote.audio."""
from dataclasses import dataclass
from pathlib import Path

from ..config import get_settings

settings = get_settings()

_pipeline = None


def _get_pipeline(num_speakers: int | None = None):
    global _pipeline
    if _pipeline is None:
        from pyannote.audio import Pipeline  # type: ignore
        _pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            cache_dir=str(settings.pyannote_model_dir),
        )
        # Move to MPS (Apple Silicon) if available
        try:
            import torch
            if torch.backends.mps.is_available():
                _pipeline = _pipeline.to(torch.device("mps"))
            elif torch.cuda.is_available():
                _pipeline = _pipeline.to(torch.device("cuda"))
        except Exception:
            pass
    return _pipeline


@dataclass
class DiarizationSegment:
    start: float
    end: float
    speaker: str   # e.g. "SPEAKER_00"


def diarize(audio_path: Path, num_speakers: int | None = None) -> list[DiarizationSegment]:
    pipeline = _get_pipeline()
    kwargs: dict = {}
    if num_speakers is not None:
        kwargs["num_speakers"] = num_speakers

    diarization = pipeline(str(audio_path), **kwargs)
    segments = []
    for turn, _, speaker in diarization.itertracks(yield_label=True):
        segments.append(DiarizationSegment(
            start=turn.start,
            end=turn.end,
            speaker=speaker,
        ))
    return segments


def assign_speakers(
    whisper_segments: list,
    diarization_segments: list[DiarizationSegment],
) -> list[tuple]:
    """Return list of (whisper_segment, speaker_label) pairs.

    For each transcription segment, find the diarization segment with the
    maximum time overlap.
    """
    result = []
    for wseg in whisper_segments:
        best_speaker = None
        best_overlap = 0.0
        for dseg in diarization_segments:
            overlap = max(0.0, min(wseg.end, dseg.end) - max(wseg.start, dseg.start))
            if overlap > best_overlap:
                best_overlap = overlap
                best_speaker = dseg.speaker
        result.append((wseg, best_speaker or "SPEAKER_00"))
    return result
