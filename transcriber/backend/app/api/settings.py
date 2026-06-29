"""App settings endpoint – read current config (no secrets)."""
from fastapi import APIRouter

from ..config import get_settings

router = APIRouter(prefix="/settings", tags=["settings"])
settings = get_settings()


@router.get("")
def get_app_settings():
    return {
        "llm_backend": settings.llm_backend,
        "ollama_model": settings.ollama_model,
        "openrouter_model": settings.openrouter_model,
        "whisper_model": settings.whisper_model,
        "use_kb_lab_model": settings.use_kb_lab_model,
        "has_kb_lab_model": settings.kb_lab_model.exists(),
        "has_whisper_cpp": settings.whisper_binary.exists(),
    }
