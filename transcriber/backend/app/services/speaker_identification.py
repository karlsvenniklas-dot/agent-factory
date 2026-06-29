"""Voice embedding extraction with SpeechBrain ECAPA-TDNN.

Used to verify speaker assignment by comparing voice embeddings
from the intro (where we know who spoke) with the rest of the recording.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np

from ..config import get_settings

settings = get_settings()

_classifier = None


def _get_classifier():
    global _classifier
    if _classifier is None:
        from speechbrain.inference.speaker import EncoderClassifier  # type: ignore
        _classifier = EncoderClassifier.from_hparams(
            source=settings.speechbrain_model,
            savedir=str(settings.model_dir / "speechbrain"),
        )
    return _classifier


def extract_embedding(audio_path: Path) -> list[float]:
    """Extract speaker embedding from an audio file segment."""
    import torchaudio  # type: ignore
    clf = _get_classifier()
    signal, fs = torchaudio.load(str(audio_path))
    if fs != 16000:
        import torchaudio.transforms as T  # type: ignore
        signal = T.Resample(fs, 16000)(signal)
    embedding = clf.encode_batch(signal)
    return embedding.squeeze().tolist()


def cosine_similarity(a: list[float], b: list[float]) -> float:
    va = np.array(a)
    vb = np.array(b)
    denom = np.linalg.norm(va) * np.linalg.norm(vb)
    if denom == 0:
        return 0.0
    return float(np.dot(va, vb) / denom)


def best_match(query: list[float], candidates: dict[str, list[float]], threshold: float = 0.7) -> str | None:
    """Return label of best matching known speaker, or None if below threshold."""
    best_label = None
    best_score = threshold
    for label, emb in candidates.items():
        score = cosine_similarity(query, emb)
        if score > best_score:
            best_score = score
            best_label = label
    return best_label
