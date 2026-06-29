from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import Base, engine
from .api import meetings, speakers, segments, export, actions, live, settings as settings_router, audio

_settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Transcriber API",
    description="Lokal mötestranskribering med AI-driven talaridentifiering",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router, prefix="/api")
app.include_router(speakers.router, prefix="/api")
app.include_router(segments.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(actions.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")
app.include_router(audio.router, prefix="/api")
app.include_router(live.router)


@app.get("/health")
def health():
    return {"status": "ok"}
