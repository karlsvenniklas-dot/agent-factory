from pydantic_settings import BaseSettings
from pydantic import Field
from pathlib import Path
from functools import lru_cache


class Settings(BaseSettings):
    # App
    secret_key: str = "change-me-in-production"
    encryption_salt: str = "change-me-too"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Database
    database_url: str = "postgresql://transcriber:transcriber@localhost:5432/transcriber"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"

    # Storage
    upload_dir: Path = Path("./uploads")
    model_dir: Path = Path("./models")

    # Whisper
    whisper_model: str = "large-v3"
    whisper_binary: Path = Path("./bin/whisper-cli")
    kb_lab_model: Path = Path("./models/kb-whisper-large.bin")
    use_kb_lab_model: bool = True

    # Pyannote
    pyannote_model_dir: Path = Path("./models/pyannote")

    # SpeechBrain
    speechbrain_model: str = "speechbrain/spkrec-ecapa-voxceleb"

    # LLM
    llm_backend: str = "ollama"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen3:8b"
    openrouter_api_key: str = ""
    openrouter_model: str = "anthropic/claude-sonnet-4-6"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    class Config:
        env_file = ".env"
        extra = "ignore"

    def ensure_dirs(self):
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.model_dir.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    s.ensure_dirs()
    return s
