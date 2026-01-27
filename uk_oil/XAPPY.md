# XAPPY AI - Oil & Gas Compliance Platform

## Project Overview

XAPPY AI is a compliance-grade frontline communication automation platform designed for Oil & Gas environments. It transforms unstructured communication from workers (WhatsApp, SMS, voice notes) into structured, auditable safety and compliance records.

## Core Principles

1. **Worker-first design** - Zero behavior change required (use existing WhatsApp/SMS)
2. **Recording only** - Never interprets, classifies risks, or makes safety decisions
3. **No operational control** - Read-only workflows, no equipment commands
4. **Enterprise-grade audit** - Timestamped, immutable, hash-chained evidence
5. **Deterministic AI** - Confidence-thresholded RAG, no hallucinations

---

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Database**: PostgreSQL with SQLAlchemy ORM (async)
- **Cache**: Redis
- **Authentication**: JWT tokens with Badge/PIN + OTP
- **AI**: OpenAI GPT-4, LangGraph, LangChain, RAG with PGVector
- **Voice**: Bhashini (14 Indian languages)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **State**: Zustand
- **Charts**: Recharts

---

## Project Structure

```
/XappyAI/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entry
│   │   ├── core/
│   │   │   ├── config.py           # Settings
│   │   │   └── security.py         # JWT/auth
│   │   ├── db/session.py           # Async SQLAlchemy
│   │   ├── models/                 # All SQLAlchemy models
│   │   │   ├── user.py             # User, roles
│   │   │   ├── site.py             # Site, Area
│   │   │   ├── report.py           # Base Report
│   │   │   ├── near_miss.py        # Near-miss details
│   │   │   ├── incident.py         # Incident details
│   │   │   ├── shift_handover.py   # Shift handover
│   │   │   ├── toolbox_talk.py     # Toolbox talks
│   │   │   ├── ptw_evidence.py     # PTW evidence
│   │   │   ├── loto_evidence.py    # LOTO evidence
│   │   │   ├── spill_report.py     # Spill reports
│   │   │   ├── inspection.py       # Inspections
│   │   │   ├── media_attachment.py # Media files
│   │   │   ├── audit_trail.py      # Audit log
│   │   │   └── conversation.py     # Chat history
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── api/v1/
│   │   │   ├── router.py           # Main router
│   │   │   ├── deps.py             # Dependencies
│   │   │   └── endpoints/          # API endpoints
│   │   ├── services/               # Business logic
│   │   │   └── agent/              # LangGraph agent
│   │   └── middleware/             # Request middleware
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js pages
│   │   ├── components/             # React components
│   │   ├── lib/                    # API client
│   │   ├── store/                  # Zustand stores
│   │   └── types/                  # TypeScript types
│   └── Dockerfile
├── docker-compose.yml
└── XAPPY.md
```

---

## Database Models

### User Roles
```
WORKER, CONTRACTOR, SUPERVISOR, SITE_MANAGER, HSE_MANAGER,
HSE_OFFICER, COMPLIANCE_OFFICER, OPERATIONS_DIRECTOR, ADMIN
```

### Report Types (9 Use Cases)
```
NEAR_MISS, INCIDENT, DAILY_SAFETY_LOG, SHIFT_HANDOVER,
TOOLBOX_TALK, PTW_EVIDENCE, LOTO_EVIDENCE, SPILL_REPORT, INSPECTION
```

### Reference Number Format
```
XP-{TYPE}-{YYYYMMDD}-{SEQUENCE}
Example: XP-NM-20260102-0001 (Near-Miss)
```

---

## API Endpoints

### Authentication
- `POST /api/v1/auth/badge-login` - Badge + PIN login
- `POST /api/v1/auth/otp/send` - Send OTP
- `POST /api/v1/auth/otp/verify` - Verify OTP
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Reports
- `GET /api/v1/reports` - List all reports (filtered)
- `GET /api/v1/reports/{id}` - Get report details
- `POST /api/v1/reports/{id}/acknowledge` - Acknowledge
- `POST /api/v1/reports/{id}/close` - Close

### Near-Miss
- `GET /api/v1/near-miss` - List near-miss reports
- `POST /api/v1/near-miss` - Create near-miss
- `GET /api/v1/near-miss/{id}` - Get details

### WhatsApp
- `GET /api/v1/whatsapp/webhook` - Webhook verification
- `POST /api/v1/whatsapp/webhook` - Receive messages

### Dashboard
- `GET /api/v1/dashboard/supervisor/stats`
- `GET /api/v1/dashboard/hse/stats`

---

## Running the Project

### Development with Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

---

## Environment Variables

### Required
```env
# Database
DATABASE_URL=postgresql+asyncpg://xappy:password@localhost:5432/xappy_db

# JWT
SECRET_KEY=your-secret-key

# OpenAI
OPENAI_API_KEY=sk-...
```

### WhatsApp (Optional)
```env
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_VERIFY_TOKEN=xappy_verify_token
```

### Voice (Optional)
```env
BHASHINI_API_KEY=...
BHASHINI_USER_ID=...
```

---

## User Journeys

### Frontline Worker
1. Open WhatsApp
2. Send message (text, image, or voice)
3. XAPPY AI receives and extracts structured data
4. Generates report with reference number
5. Sends confirmation to worker
6. Routes to supervisor if needed

### Supervisor
1. Login to supervisor dashboard
2. View incoming structured logs
3. Acknowledge/annotate/forward reports
4. Track outstanding issues
5. Export records

### HSE Manager
1. Login to HSE dashboard
2. View KPIs and trends
3. Filter by site/date/type
4. Export audit packs
5. Generate compliance reports

---

## Out of Scope

- No operational commands to equipment
- No safety/risk scoring
- No predictive maintenance in MVP
- No PTW approvals (evidence only)
- No hazard classification beyond recording
- No AI-generated safety advice

---

## Integration Hooks (Future)

- SAP PM/EHS
- IBM Maximo
- Microsoft SharePoint

These are stubbed for future implementation.
