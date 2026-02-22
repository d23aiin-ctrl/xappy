# Xappy Platform

Multi-project monorepo powering the Xappy ecosystem — domain-specific AI-powered platforms for Healthcare, Oil & Gas, Property Management, and Mental Wellness.

---

## Table of Contents

- [Repository Structure](#repository-structure)
- [Quick Start (Docker)](#quick-start-docker)
- [Service URLs & Ports](#service-urls--ports)
- [Demo Credentials](#demo-credentials)
  - [Xappy-Oil](#xappy-oil-demo-users)
  - [Xappy-Health](#xappy-health-demo-users)
  - [Xappy-Property](#xappy-property-demo-users)
  - [moodcraft / CereBro](#moodcraft--cerebro-demo-users)
- [Seeding Data](#seeding-data)
- [Projects](#projects)
  - [XappyIO — Marketing Website](#1-xappyio--marketing-website)
  - [Xappy-Health — Healthcare Compliance](#2-xappy-health--healthcare-compliance)
  - [Xappy-Oil — Oil & Gas Operations](#3-xappy-oil--oil--gas-operations)
  - [Xappy-Property — Property Management](#4-xappy-property--property-management)
  - [moodcraft (CereBro) — Mental Wellness AI](#5-moodcraft-cerebro--mental-wellness-ai)
- [Tech Stack](#tech-stack)
- [API Reference](#api-reference)
- [Database](#database)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Docker & Deployment](#docker--deployment)

---

## Repository Structure

```
Xappy/
├── XappyIO/                  # Marketing website (Next.js)
├── Xappy-Health/             # Healthcare compliance platform
│   ├── backend/              #   FastAPI backend
│   ├── frontend/             #   Next.js frontend
│   └── XappyApp/             #   iOS app (Swift)
├── Xappy-Oil/                # Oil & Gas operations platform
│   ├── backend/              #   FastAPI backend
│   ├── frontend/             #   Next.js frontend
│   └── XappyApp/             #   iOS app (Swift)
├── Xappy-Property/           # Property management platform
│   ├── backend/              #   FastAPI backend
│   ├── frontend/             #   Next.js frontend
│   └── XappyApp/             #   iOS app (Swift)
├── moodcraft/                # Mental wellness AI platform (Turbo monorepo)
│   ├── apps/web/             #   Next.js + Prisma frontend
│   └── apps/nlp-service/     #   FastAPI + LangGraph AI backend
├── docker-compose.yml        # Full stack Docker Compose
├── scripts/                  # Init scripts (Postgres)
└── README.md                 # This file
```

---

## Quick Start (Docker)

### Prerequisites

- **Docker** & **Docker Compose** v2+
- Copy `.env.example` to `.env` and fill in API keys (OpenAI, WhatsApp, etc.)

### Start All Services

```bash
# First time — build all images (only needed once)
docker compose build

# Start everything (no rebuild — uses cached images)
docker compose up -d

# Start only Oil & Gas services
docker compose up -d postgres redis oil-api oil-web

# Start only Property services
docker compose up -d postgres redis property-api property-web

# Start only Health services
docker compose up -d postgres redis health-api health-web
```

### Seed Demo Data

After services are running, seed the databases:

```bash
# Xappy-Oil — full seed (3 sites, 21 users, 26 reports)
docker compose exec oil-api python scripts/seed_data.py

# Xappy-Oil — users only (5 quick-start users)
docker compose exec oil-api python scripts/seed_users.py

# Xappy-Health — full seed
docker compose exec health-api python scripts/seed_data.py

# Xappy-Property — full seed (4 sites, 28 users, 30+ reports)
docker compose exec property-api python scripts/seed_data.py

# Xappy-Property — property management data (5 properties, tenants, compliance)
docker compose exec property-api python scripts/seed_pm_data.py

# moodcraft — seed via Prisma
docker compose exec moodcraft-web npx prisma db seed
```

### Stop & Manage

```bash
# Stop all services
docker compose down

# View logs
docker compose logs -f oil-api

# Rebuild only when Dockerfile or requirements.txt changes
docker compose build oil-api
```

Code changes are picked up automatically — all services volume-mount source code and run with `--reload`.

---

## Service URLs & Ports

| Service | Type | Local URL | Production URL |
|---------|------|-----------|---------------|
| XappyIO | Frontend | http://localhost:5051 | https://xappy.io |
| Xappy-Health | Frontend | http://localhost:5053 | https://health.xappy.io |
| Xappy-Health | Backend API | http://localhost:5056 | https://healthapi.xappy.io |
| Xappy-Oil | Frontend | http://localhost:5052 | https://oilngas.xappy.io |
| Xappy-Oil | Backend API | http://localhost:5054 | https://oilngasapi.xappy.io |
| Xappy-Property | Frontend | http://localhost:5057 | https://prop.xappy.io |
| Xappy-Property | Backend API | http://localhost:5058 | https://propapi.xappy.io |
| moodcraft | Frontend | http://localhost:5160 | https://moodcraft.xappy.io |
| moodcraft | NLP Backend | http://localhost:5161 | https://apimoodcraft.xappy.io |

All backend APIs serve Swagger docs at `/docs` (e.g., http://localhost:5054/docs).

---

## Demo Credentials

### Xappy-Oil Demo Users

All users use **PIN: `1234`**. Seeded via `docker compose exec oil-api python scripts/seed_data.py`.

**Quick-start users** (via `seed_users.py`):

| Badge | Name | Role | Phone |
|-------|------|------|-------|
| `WKR-1001` | Worker One | Worker | +919990001001 |
| `SUP-2001` | Supervisor One | Supervisor | +919990002001 |
| `HSE-3001` | HSE Manager One | HSE Manager | +919990003001 |
| `CMP-4001` | Compliance One | Compliance Officer | +919990004001 |
| `ADM-9001` | Admin One | Admin | +919990009001 |

**Full seed users** (via `seed_data.py` — 21 users across 3 sites):

| Badge | Name | Role | Site |
|-------|------|------|------|
| `ADMIN001` | Vikram Mehta | Super Admin | — |
| `HSE001` | Rajesh Sharma | HSE Manager | Mumbai Refinery |
| `HSE002` | Priya Desai | HSE Officer | Mumbai Refinery |
| `SUP001` | Amit Kumar | Supervisor | Mumbai Refinery |
| `SUP002` | Suresh Patil | Supervisor | Mumbai Refinery |
| `SUP003` | Manoj Verma | Supervisor | Mumbai Refinery |
| `WRK001` | Ramesh Singh | Worker | Mumbai Refinery |
| `WRK002` | Ajay Yadav | Worker | Mumbai Refinery |
| `WRK003` | Sanjay Gupta | Worker | Mumbai Refinery |
| `WRK004` | Deepak Sharma | Worker | Mumbai Refinery |
| `WRK005` | Ravi Tiwari | Worker | Mumbai Refinery |
| `CTR001` | Mohammed Khan | Contractor | Mumbai Refinery |
| `CTR002` | Vijay Patel | Contractor | Mumbai Refinery |
| `HSE003` | Anita Joshi | HSE Manager | Jamnagar Plant |
| `SUP004` | Kiran Reddy | Supervisor | Jamnagar Plant |
| `WRK006` | Prakash Nair | Worker | Jamnagar Plant |
| `WRK007` | Ganesh Iyer | Worker | Jamnagar Plant |
| `HSE004` | Sunil Menon | HSE Officer | Bombay High Offshore |
| `SUP005` | Arun Nambiar | Supervisor | Bombay High Offshore |
| `WRK008` | Joseph Thomas | Worker | Bombay High Offshore |
| `WRK009` | Peter D'Souza | Worker | Bombay High Offshore |

**Sites:** Mumbai Refinery (MR-001), Jamnagar Processing Plant (JP-002), Bombay High Offshore Platform (BH-003)

**Reports:** 26 reports including near-misses, incidents, toolbox talks, shift handovers, PTW/LOTO evidence, spill reports, inspections, and daily safety logs.

**Login example:**
```bash
curl -X POST http://localhost:5054/api/v1/auth/badge-login \
  -H "Content-Type: application/json" \
  -d '{"badge_number": "SUP001", "pin": "1234"}'
```

---

### Xappy-Health Demo Users

Same seed scripts and user structure as Xappy-Oil (identical `seed_data.py` and `seed_users.py`). All users use **PIN: `1234`**.

```bash
docker compose exec health-api python scripts/seed_data.py
```

Same badge numbers, names, and roles as the Oil tables above.

---

### Xappy-Property Demo Users

All users use **PIN: `1234`**. Two seed scripts available:

**Construction/Development seed** (via `seed_data.py` — 28 users across 4 sites):

| Badge | Name | Role | Site |
|-------|------|------|------|
| `ADMIN001` | Vikram Mehta | Admin | — |
| `PM001` | Rajesh Sharma | Project Manager | Skyline Towers |
| `SM001` | Priya Desai | Site Manager | Skyline Towers |
| `SUP001` | Amit Kumar | Supervisor | Skyline Towers |
| `QI001` | Anita Joshi | Quality Inspector | Skyline Towers |
| `SO001` | Kiran Reddy | Safety Officer | Skyline Towers |
| `ARC001` | Neha Gupta | Architect | Skyline Towers |
| `WRK001` | Ramesh Singh | Worker | Skyline Towers |
| `CTR001` | Mohammed Khan | Contractor | Skyline Towers |
| `PM002` | Sunita Nair | Project Manager | Metro Business Park |
| `SM002` | Arun Menon | Site Manager | Metro Business Park |
| `SUP004` | Prakash Iyer | Supervisor | Metro Business Park |
| `SM003` | Ravi Tiwari | Site Manager | Palm Villas |
| `PM003` | Anil Kapoor | Project Manager | Central Mall |

**Sites:** Skyline Towers (SKY-001, Gurugram), Metro Business Park (MBP-002, Bangalore), Palm Villas (PLM-003, Bangalore), Central Mall (CTM-004, New Delhi)

**Property Management seed** (via `seed_pm_data.py` — UK properties):

| Badge | Name | Role | Email |
|-------|------|------|-------|
| `PM001` | Sarah Johnson | Property Manager | sarah@xappy.io |
| `LL001` | Michael Brown | Landlord | michael@landlord.com |
| `AG001` | Emily Davis | Agent | emily@xappy.io |
| `TN001` | James Wilson | Tenant | james@tenant.com |
| `SP001` | Dave Williams | Supplier | dave@plumber.com |

**Properties:** 5 UK properties (£950–£4500/month) with tenants, compliance records, and maintenance issues.

```bash
# Seed construction data
docker compose exec property-api python scripts/seed_data.py

# Seed property management data
docker compose exec property-api python scripts/seed_pm_data.py
```

---

### moodcraft / CereBro Demo Users

All accounts use **Password: `demo123`**.

```bash
docker compose exec moodcraft-web npx prisma db seed
```

| Email | Name | Role | Notes |
|-------|------|------|-------|
| `admin@cerebro.app` | System Admin | Super Admin | Full platform access |
| `hr@techflow.io` | Sarah Mitchell | HR | TechFlow Industries org |
| `therapist@cerebro.app` | Dr. Elena Rodriguez | Therapist | 15 yrs experience, PSY-2024-7892 |
| `maya@demo.cerebro.app` | Maya Chen | Individual | Drifter archetype, 23-day streak |
| `james@demo.cerebro.app` | James Wright | Individual | Thinker archetype, 45-day streak |
| `aisha@demo.cerebro.app` | Aisha Patel | Individual | Transformer archetype, 67-day streak |
| `marcus@demo.cerebro.app` | Marcus Johnson | Individual | Seeker archetype, 12-day streak |
| `patricia@demo.cerebro.app` | Dr. Patricia Webb | Individual | Veteran archetype, 89-day streak |

**Seeded data includes:** mood entries, journal entries, breathing sessions, badges, communities, escalation scenarios, and companion chat history for each demo persona.

**Auth method:** NextAuth.js with Credentials provider (+ optional Google OAuth)

---

## Projects

### 1. XappyIO — Marketing Website

**Location:** `XappyIO/`
**Port:** 5051

The public-facing marketing site for the Xappy platform. Static Next.js site with no authentication.

**Key Features:**
- Multi-language support (English, Hindi, Bengali, Tamil, Telugu) via `next-intl`
- Product showcase pages (Xappy, RoboGuru, D23 AI, JanSeva, OHGRT, WhatsApp Commerce)
- Solutions pages (Conversational AI, Agentic AI, AI Integration, Custom Development)
- SEO optimized with JSON-LD structured data

**Tech:** Next.js 14.2, TailwindCSS, Radix UI, Framer Motion, next-intl

---

### 2. Xappy-Health — Healthcare Compliance

**Location:** `Xappy-Health/`
**Ports:** Frontend 5053, Backend 5056
**Database:** `xappy_db`

AI-powered compliance and frontline communication platform for healthcare operations.

**Key Features:**
- Badge + PIN and Phone OTP authentication
- AI-powered chat with speech recognition for hands-free reporting
- Incident reporting: near-miss, injuries, spills, inspections
- PTW (Permit-to-Work) and LOTO (Lock-Out Tag-Out) evidence capture
- Toolbox talks and shift handover logging
- HSE dashboards with charts and metrics
- WhatsApp integration for field workers
- Bhashini API for Indian language translation
- PDF/Excel report exports
- Full audit trails

**User Roles:**
`worker`, `contractor`, `supervisor`, `site_manager`, `hse_manager`, `hse_officer`, `compliance_officer`, `operations_director`, `admin`, `super_admin`

---

### 3. Xappy-Oil — Oil & Gas Operations

**Location:** `Xappy-Oil/`
**Ports:** Frontend 5052, Backend 5054
**Database:** `xappy_oil`

AI-powered compliance platform tailored for Oil & Gas operations. Same architecture as Xappy-Health with industry-specific terminology and workflows.

**Key Features:**
- All features from Xappy-Health adapted for Oil & Gas
- Spill incident reporting (diesel, hydraulic fluid, chemicals)
- PTW management for hot work, excavation, confined space
- LOTO evidence for equipment isolation
- Oil & Gas specific safety metrics and dashboards
- Shift handover with safety status tracking

**iOS App:** Full native Swift app at `XappyApp/` with speech recognition, offline support, and SSL pinning.

**User Roles:** Same as Xappy-Health

---

### 4. Xappy-Property — Property Management

**Location:** `Xappy-Property/`
**Ports:** Frontend 5057, Backend 5058
**Database:** `xappy_property`

Full-featured property management platform for landlords, managers, tenants, and suppliers.

**Key Features:**
- Multi-role access: landlord, property manager, tenant, supplier, agent
- Property and unit management
- Lease and contract management
- Maintenance request tracking and assignment
- Security deposit tracking
- Financial management (costs, invoicing)
- Document storage and compliance tracking
- Vendor/supplier qualification
- AI-powered chat for property queries

**User Roles:**
`worker`, `supervisor`, `site_manager`, `project_manager`, `contractor`, `architect`, `quality_inspector`, `safety_officer`, `hse_manager`, `hse_officer`, `compliance_officer`, `operations_director`, `landlord`, `property_manager`, `agent`, `supplier`, `tenant`, `admin`, `super_admin`

---

### 5. moodcraft (CereBro) — Mental Wellness AI

**Location:** `moodcraft/`
**Ports:** Frontend 5160, NLP Backend 5161
**Database:** `cerebro` (separate Postgres instance on port 5433)

An agentic AI mental wellness platform with multi-agent LLM systems, RAG memory, crisis detection, and therapist support tools.

**Key Features:**
- AI Twin — personalized mental wellness companion (LangGraph multi-agent)
- RAG memory with semantic search (Pinecone / Qdrant vector DBs)
- Real-time crisis/suicide risk detection and escalation
- Mood tracking, journaling, and breathing exercises
- Therapist dashboard with AI-generated case briefs
- Clinical assessment tools
- Community and peer support features
- Google OAuth + email/password authentication (NextAuth)
- Multi-LLM: OpenAI GPT-4o (primary), Anthropic Claude (optional)

**User Roles:** `INDIVIDUAL`, `HR`, `THERAPIST`, `ADMIN`, `SUPER_ADMIN`

---

## Tech Stack

### Backend (All Projects)

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI 0.109+ |
| Server | Uvicorn (async) |
| Database | PostgreSQL 15/16 |
| ORM | SQLAlchemy (async) |
| Cache | Redis 7 |
| Auth | JWT (python-jose, bcrypt) |
| AI/LLM | OpenAI GPT-4, LangChain, LangGraph |
| Validation | Pydantic v2 |
| Logging | structlog (JSON) |

### Frontend (All Projects)

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | TailwindCSS, Radix UI |
| State | Zustand (Health/Oil/Property), NextAuth sessions (moodcraft) |
| Data Fetching | TanStack React Query + Axios |
| Charts | Recharts |
| Icons | lucide-react |

### iOS Apps (Oil / Health / Property)

| Component | Technology |
|-----------|-----------|
| Language | Swift 5.9+ |
| UI | SwiftUI |
| Architecture | Clean Architecture (Presentation → Domain → Data) |
| Persistence | SwiftData |
| Auth | JWT + Keychain |
| Network | URLSession + SSL Certificate Pinning |
| Speech | SFSpeechRecognizer |
| Testing | Swift Testing framework |

### moodcraft Additions

| Component | Technology |
|-----------|-----------|
| ORM | Prisma 5.22 |
| Auth | NextAuth 4.24 (Credentials + Google OAuth) |
| Vector DB | Pinecone, Qdrant, ChromaDB |
| LLM Orchestration | LangGraph (multi-agent) |

---

## API Reference

### Health / Oil / Property — Auth Endpoints

```
POST /api/v1/auth/badge-login     # Login with badge + PIN
POST /api/v1/auth/otp/send        # Request OTP to phone
POST /api/v1/auth/otp/verify      # Verify OTP
POST /api/v1/auth/refresh          # Refresh JWT token
POST /api/v1/auth/logout           # Logout
```

### Health / Oil — Core Endpoints

```
GET/POST /api/v1/chat/conversations
POST     /api/v1/chat/messages
GET      /api/v1/dashboard/metrics
POST     /api/v1/near-miss/
GET      /api/v1/reports/
GET/POST /api/v1/sites/
GET/POST /api/v1/users/
GET/POST /api/v1/whatsapp/webhook
```

### Property — Additional Endpoints

```
GET/POST /api/v1/properties/
GET/POST /api/v1/tenants/
GET/POST /api/v1/deposits/
GET/POST /api/v1/maintenance/
GET/POST /api/v1/contracts/
GET/POST /api/v1/costs/
GET/POST /api/v1/documents/
GET/POST /api/v1/qualifications/
GET/POST /api/v1/suppliers/
GET/POST /api/v1/compliance/
```

### Health Check (All Backends)

```
GET /health    # Returns status, uptime
GET /docs      # Swagger UI
```

---

## Database

Each project uses its own database on a shared PostgreSQL instance:

| Project | Database | Port | User | Password |
|---------|----------|------|------|----------|
| Xappy-Health | `xappy_db` | 5432 | `xappy` | `xappy_secret_2024` |
| Xappy-Oil | `xappy_oil` | 5432 | `xappy` | `xappy_secret_2024` |
| Xappy-Property | `xappy_property` | 5432 | `xappy` | `xappy_secret_2024` |
| moodcraft | `cerebro` | 5433 | `cerebro` | `cerebro_dev_password` |

Tables are auto-created on backend startup via SQLAlchemy `create_all()`. moodcraft uses Prisma migrations.

---

## Seeding Data

All seed scripts live in `<project>/backend/scripts/`. Run them via `docker compose exec` after services are up:

| Command | What it seeds |
|---------|---------------|
| `docker compose exec oil-api python scripts/seed_data.py` | Oil: 3 sites, 21 users, 26 reports |
| `docker compose exec oil-api python scripts/seed_users.py` | Oil: 5 quick-start users |
| `docker compose exec health-api python scripts/seed_data.py` | Health: 3 sites, 21 users, 26 reports |
| `docker compose exec health-api python scripts/seed_users.py` | Health: 5 quick-start users |
| `docker compose exec property-api python scripts/seed_data.py` | Property: 4 sites, 28 users, 30+ reports |
| `docker compose exec property-api python scripts/seed_pm_data.py` | Property: 5 UK properties, tenants, compliance |
| `docker compose exec property-api python scripts/seed_users.py` | Property: 5 quick-start users |
| `docker compose exec moodcraft-web npx prisma db seed` | moodcraft: 8 users, personas, mood data |

All Oil/Health/Property seed users use **PIN: `1234`**. moodcraft users use **Password: `demo123`**.

---

## Environment Variables

### Health / Oil / Property Backend

```env
DATABASE_URL=postgresql+asyncpg://xappy:xappy_secret_2024@localhost:5432/xappy_oil
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
ENVIRONMENT=development
```

### moodcraft NLP Service

```env
DATABASE_URL=postgresql://cerebro:cerebro_dev_password@localhost:5433/cerebro
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
QDRANT_URL=http://localhost:6333
API_SECRET_KEY=change-this-in-production
```

### moodcraft Frontend

```env
DATABASE_URL=postgresql://cerebro:cerebro_dev_password@localhost:5433/cerebro
NEXTAUTH_URL=http://localhost:5160
NEXTAUTH_SECRET=your-nextauth-secret
NLP_SERVICE_URL=http://localhost:5161
GOOGLE_CLIENT_ID=...           # optional, for Google OAuth
GOOGLE_CLIENT_SECRET=...       # optional
```

---

## Docker & Deployment

The root `docker-compose.yml` runs the full stack:

**Infrastructure:** PostgreSQL 15, PostgreSQL 16 (moodcraft), Redis 7, Qdrant

**Application services** (all with named images for caching):

| Service | Image | Port |
|---------|-------|------|
| `xappy-web` | `xappy-web:dev` | 5051 |
| `health-api` | `xappy-health-api:dev` | 5056 |
| `health-web` | `xappy-health-web:dev` | 5053 |
| `oil-api` | `xappy-oil-api:dev` | 5054 |
| `oil-web` | `xappy-oil-web:dev` | 5052 |
| `property-api` | `xappy-property-api:dev` | 5058 |
| `property-web` | `xappy-property-web:dev` | 5057 |
| `moodcraft-api` | `xappy-moodcraft-api:dev` | 5161 |
| `moodcraft-web` | `xappy-moodcraft-web:dev` | 5160 |

All services volume-mount source code and run with `--reload`, so code changes are reflected instantly without rebuilding.

**Rebuild only when:** Dockerfile changes, `requirements.txt` changes, or `package.json` changes.

```bash
# Rebuild a single service
docker compose build oil-api

# Rebuild everything
docker compose build
```

**Production:** Services are proxied through nginx with SSL at `*.xappy.io` subdomains.
