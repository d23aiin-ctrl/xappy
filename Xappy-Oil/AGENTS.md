# Codex Agent Guide

- Scope: XAPPY AI backend (FastAPI + async SQLAlchemy) and frontend (Next.js 14 + TypeScript). Preserve compliance posture: recording-only, no safety/risk scoring or operational control.
- Safety/data: Do not weaken audit trail or hash-chain evidence; keep reference number format `XP-{TYPE}-{YYYYMMDD}-{SEQUENCE}` intact.
- Backend layout: FastAPI entry at `backend/app/main.py`; routes in `backend/app/api/v1`; schemas in `backend/app/schemas`; models in `backend/app/models`; async DB session in `backend/app/db/session.py`.
- Frontend layout: Next.js app router under `frontend/src/app`; shared UI in `frontend/src/components`; API helpers in `frontend/src/lib`; state in `frontend/src/store`.
- Testing/run: Prefer `docker-compose up -d` for full stack; backend local run via `uvicorn app.main:app --reload --port 8000` from `backend`; frontend dev via `npm run dev` from `frontend`.
- Editing: Stay ASCII, prefer `apply_patch`, keep comments minimal, avoid destructive git commands, and never undo user changes.
