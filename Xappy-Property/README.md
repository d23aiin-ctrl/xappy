# Xappy Health

Compliance-grade frontline communication platform for Oil & Gas operations. The system ingests WhatsApp/SMS/voice inputs, turns them into structured records, and exposes reporting dashboards for supervisors and HSE teams.

See `XAPPY.md` for the full product and API details.

## Repo Structure

```
backend/     FastAPI + PostgreSQL + Redis
frontend/    Next.js 14 (App Router)
XappyApp/    iOS app (OhGrt)
```

## Quick Start (Docker)

```bash
docker-compose up -d
```

Services:
- API: http://localhost:8000
- Web: http://localhost:3000

## Local Development

Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## iOS App

The iOS app lives in `XappyApp/` (Xcode project `OhGrt.xcodeproj`). See `XappyApp/README.md` for OAuth setup and build steps.

## Configuration

The backend reads environment variables from `.env` (see `backend/app/core/config.py`). You can run via Docker without a local `.env`, but set secrets for production.

## Notes

- `.gitignore` is set up for Python, Next.js, and Xcode artifacts.
- If you use Firebase with the iOS app, keep `XappyApp/OhGrt/GoogleService-Info.plist` consistent with your Firebase project.
