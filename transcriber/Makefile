.PHONY: infra infra-down backend worker frontend dev clean models

# Start infrastructure (Postgres + Redis)
infra:
	docker compose up -d
	@echo "Waiting for services..."
	@sleep 3
	@echo "Infrastructure ready."

infra-down:
	docker compose down

# Run database migrations
migrate:
	cd backend && python -m alembic upgrade head

# Backend dev server
backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Celery worker (GPU-bound tasks run natively for Metal access)
worker:
	cd backend && celery -A app.tasks.celery_app worker --loglevel=info -Q transcription,diarization,default

# Frontend dev server
frontend:
	cd frontend && npm run dev

# Start everything for development
dev:
	$(MAKE) infra
	$(MAKE) migrate
	@echo "Start backend:  make backend"
	@echo "Start worker:   make worker"
	@echo "Start frontend: make frontend"

# Install dependencies
install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

# Download Swedish whisper model from KB-LAB
download-models:
	mkdir -p models
	@echo "Download KB-LAB models from: https://huggingface.co/KBLab/kb-whisper"
	@echo "And pyannote speaker-diarization from: https://huggingface.co/pyannote/speaker-diarization-3.1"
	@echo "Place whisper model at: models/kb-whisper-large.bin"

clean:
	docker compose down -v
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
