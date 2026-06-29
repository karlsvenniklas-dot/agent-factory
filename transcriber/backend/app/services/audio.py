"""Audio conversion and utility functions."""
import subprocess
import tempfile
from pathlib import Path
import soundfile as sf


def convert_to_wav(input_path: Path, output_path: Path, sample_rate: int = 16000) -> Path:
    """Convert any audio/video file to 16kHz mono WAV for processing."""
    cmd = [
        "ffmpeg", "-y", "-i", str(input_path),
        "-ac", "1",
        "-ar", str(sample_rate),
        "-f", "wav",
        str(output_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr}")
    return output_path


def get_duration(audio_path: Path) -> float:
    """Return duration of audio file in seconds."""
    info = sf.info(str(audio_path))
    return info.duration


def split_audio(audio_path: Path, chunk_seconds: int = 30) -> list[tuple[float, float, Path]]:
    """Split audio into chunks. Returns list of (start, end, path)."""
    info = sf.info(str(audio_path))
    duration = info.duration
    chunks = []
    start = 0.0
    tmp_dir = Path(tempfile.mkdtemp())
    i = 0
    while start < duration:
        end = min(start + chunk_seconds, duration)
        chunk_path = tmp_dir / f"chunk_{i:04d}.wav"
        cmd = [
            "ffmpeg", "-y", "-i", str(audio_path),
            "-ss", str(start), "-to", str(end),
            "-ac", "1", "-ar", "16000",
            str(chunk_path),
        ]
        subprocess.run(cmd, capture_output=True, check=True)
        chunks.append((start, end, chunk_path))
        start = end
        i += 1
    return chunks
