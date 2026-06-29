"""WebSocket endpoints for live transcription and processing progress."""
import asyncio
import json

import redis.asyncio as aioredis
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..config import get_settings

router = APIRouter(tags=["live"])
settings = get_settings()


@router.websocket("/ws/meetings/{meeting_id}/progress")
async def meeting_progress_ws(websocket: WebSocket, meeting_id: str):
    """Push processing progress events to the client via Redis pubsub."""
    await websocket.accept()
    r = await aioredis.from_url(settings.redis_url)
    pubsub = r.pubsub()
    await pubsub.subscribe(f"meeting:{meeting_id}")
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                try:
                    await websocket.send_text(message["data"].decode())
                except WebSocketDisconnect:
                    break
    finally:
        await pubsub.unsubscribe(f"meeting:{meeting_id}")
        await r.aclose()


@router.websocket("/ws/live")
async def live_transcription_ws(websocket: WebSocket):
    """Accept audio chunks from the browser and return transcription in real-time.

    Protocol:
      client → binary: raw PCM / WebM audio chunk
      server → text: JSON { "text": "...", "speaker": "...", "start": 0.0, "end": 1.2 }
      client → text "STOP": end session and trigger high-quality reprocessing
    """
    await websocket.accept()
    buffer = bytearray()
    session_id = None

    try:
        import tempfile, uuid, subprocess
        from pathlib import Path
        from ..services.transcription import transcribe
        from ..services.audio import convert_to_wav

        session_id = str(uuid.uuid4())
        tmp_dir = Path(tempfile.mkdtemp())
        raw_path = tmp_dir / "live_audio.webm"
        raw_file = raw_path.open("wb")
        chunk_index = 0

        while True:
            data = await websocket.receive()
            if "bytes" in data and data["bytes"]:
                chunk = data["bytes"]
                raw_file.write(chunk)
                buffer.extend(chunk)

                # Process every ~4 seconds of audio (heuristic: ~64KB for webm)
                if len(buffer) >= 64 * 1024:
                    chunk_path = tmp_dir / f"chunk_{chunk_index:04d}.webm"
                    chunk_path.write_bytes(bytes(buffer))
                    buffer.clear()
                    try:
                        wav = tmp_dir / f"chunk_{chunk_index:04d}.wav"
                        convert_to_wav(chunk_path, wav)
                        segs = transcribe(wav, language="sv")
                        for seg in segs:
                            await websocket.send_text(json.dumps({
                                "text": seg.text,
                                "start": seg.start,
                                "end": seg.end,
                                "speaker": None,
                            }))
                    except Exception as e:
                        await websocket.send_text(json.dumps({"error": str(e)}))
                    chunk_index += 1

            elif "text" in data and data["text"] == "STOP":
                raw_file.close()
                await websocket.send_text(json.dumps({"status": "processing_final"}))
                # Trigger high-quality background reprocessing
                # (save to uploads and submit Celery task)
                await websocket.send_text(json.dumps({"status": "done", "session_id": session_id}))
                break

    except WebSocketDisconnect:
        pass
    finally:
        try:
            raw_file.close()
        except Exception:
            pass
