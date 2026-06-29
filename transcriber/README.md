# Transcriber

Lokal mötestranskribering med AI-driven talaridentifiering. Hela kedjan – från rått ljud till namngiven, sökbar transkription – körs på din maskin utan att data lämnar den.

## Vad det gör

- Laddar upp ljud/video eller spelar in direkt i webbläsaren
- Transkriberar med **whisper.cpp** + KB-LABs svenska modeller
- Identifierar talare med **pyannote** speaker diarization
- Kopplar namn till röster via iterativ intro-analys med **Qwen3 8B** (Ollama, körs lokalt)
- Presenterar resultatet i ett React-gränssnitt med synkroniserad ljuduppspelning
- Exporterar i 7 format: SRT, WebVTT, TXT, Markdown, JSON, DOCX, PDF
- AI-drivna smarta åtgärder: sammanfattning, åtgärdslista, mötesprotokoll
- Kryptering av känsliga transkript

## Arkitektur

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (React + TypeScript + Tailwind)                │
│  Ladda upp → Visa progress → Redigera → Exportera        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP + WebSocket
┌──────────────────────▼──────────────────────────────────┐
│  BACKEND (FastAPI)                                       │
│  /api/meetings   /api/speakers   /api/segments           │
│  /api/actions    /ws/meetings/{id}/progress              │
└──────────┬─────────────────────────────────┬────────────┘
           │ Celery task                     │ Redis pubsub
┌──────────▼──────────┐         ┌────────────▼────────────┐
│  WORKER (GPU-nativ)  │         │  PostgreSQL + Redis      │
│  whisper.cpp         │         │  (Docker)                │
│  pyannote            │         └─────────────────────────┘
│  intro-analys (LLM)  │
└─────────────────────┘
```

## Pipeline

```
Ljud → ffmpeg (WAV 16kHz) → whisper.cpp (text+tidsstämplar)
                          → pyannote (talarsegment)
                          → Intro-analys LLM (antal+namn)
                          → Förfinad pyannote (med känt antal)
                          → Koppla namn ↔ etiketter
                          → Spara i PostgreSQL
                          → Publisera via WebSocket
```

## Snabbstart

### Förutsättningar

- Python 3.11+
- Node.js 20+
- Docker + Docker Compose
- ffmpeg (`brew install ffmpeg`)
- Ollama med Qwen3 8B (`ollama pull qwen3:8b`)
- *(Valfritt)* whisper.cpp byggt med Metal-stöd + KB-LAB-modell

### Installation

```bash
# 1. Klona repot och gå in i mappen
cd transcriber

# 2. Konfigurera miljövariabler
cp .env.example .env
# Redigera .env efter behov

# 3. Starta infrastruktur (Postgres + Redis)
make infra

# 4. Installera Python-beroenden
cd backend && pip install -r requirements.txt

# 5. Kör databasmigreringar
make migrate

# 6. Starta bakgrundsarbetare (GPU-beroende)
make worker

# 7. Starta backend-servern
make backend

# 8. Installera och starta frontend
cd frontend && npm install && npm run dev
```

Öppna [http://localhost:5173](http://localhost:5173)

### Modeller

| Modell | Syfte | Nedladdning |
|--------|-------|-------------|
| KB-LABs Whisper large-v3 | Svenska transkription | [HuggingFace](https://huggingface.co/KBLab/kb-whisper) |
| pyannote/speaker-diarization-3.1 | Talaruppdelning | [HuggingFace](https://huggingface.co/pyannote/speaker-diarization-3.1) |
| Qwen3 8B via Ollama | Intro-analys | `ollama pull qwen3:8b` |

## Offline-drift

När alla modeller är nedladdade lokalt fungerar Transcriber helt utan internetuppkoppling. Sätt `LLM_BACKEND=ollama` i `.env`.

## Konfiguration

Alla inställningar via `.env`:

| Variabel | Standard | Beskrivning |
|----------|---------|-------------|
| `LLM_BACKEND` | `ollama` | `ollama`, `openrouter` eller `openai` |
| `OLLAMA_MODEL` | `qwen3:8b` | Vilken Ollama-modell att använda |
| `WHISPER_MODEL` | `large-v3` | Whisper-modell (fallback om ej whisper.cpp) |
| `USE_KB_LAB_MODEL` | `true` | Använd KB-LABs svenska modell |

## API

```
GET    /api/meetings                 # Lista möten
POST   /api/meetings                 # Ladda upp (multipart)
GET    /api/meetings/{id}            # Hämta möte
PATCH  /api/meetings/{id}            # Uppdatera titel/kryptering
DELETE /api/meetings/{id}            # Ta bort
POST   /api/meetings/{id}/reprocess  # Bearbeta om

GET    /api/meetings/{id}/speakers              # Lista talare
PATCH  /api/meetings/{id}/speakers/{sid}        # Byt namn/färg
POST   /api/meetings/{id}/speakers/merge        # Slå ihop talare

GET    /api/meetings/{id}/segments              # Lista segment
PATCH  /api/meetings/{id}/segments/{sid}        # Redigera text/talare

GET    /api/meetings/{id}/export/{format}       # Exportera (srt/vtt/txt/md/json/docx/pdf)

POST   /api/meetings/{id}/actions               # Skapa åtgärd
POST   /api/meetings/{id}/actions/{aid}/run     # Kör åtgärd

WS     /ws/meetings/{id}/progress               # Realtidsuppdateringar
WS     /ws/live                                 # Live-transkribering
```

## Teknisk stack

**Backend**: FastAPI, Celery, Redis, PostgreSQL, SQLAlchemy, Alembic  
**AI/ML**: whisper.cpp (KB-LAB), pyannote.audio 3.x, SpeechBrain ECAPA-TDNN, Qwen3 8B/Ollama  
**Frontend**: React 18, TypeScript, Tailwind CSS, Vite, React Router  
**Infrastruktur**: Docker Compose (Redis + Postgres), native GPU-processer (Apple Metal)

## Designval

GPU-processerna (whisper, pyannote, SpeechBrain) körs **nativt** – inte i Docker – för direkt åtkomst till Apple Metal. Docker hanterar bara stateless infrastrukturkomponenter.
