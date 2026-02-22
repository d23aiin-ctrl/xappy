# Xappy Platform

Multi-project monorepo powering the Xappy ecosystem — domain-specific AI-powered platforms for Healthcare, Oil & Gas, Property Management, and Mental Wellness.

---

## Table of Contents

- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Service URLs & Ports](#service-urls--ports)
- [Test Credentials](#test-credentials)
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
│   └── frontend/             #   Next.js frontend
├── Xappy-Oil/                # Oil & Gas operations platform
│   ├── backend/              #   FastAPI backend
│   └── frontend/             #   Next.js frontend
├── Xappy-Property/           # Property management platform
│   ├── backend/              #   FastAPI backend
│   └── frontend/             #   Next.js frontend
├── moodcraft/                # Mental wellness AI platform (Turbo monorepo)
│   ├── apps/web/             #   Next.js + Prisma frontend
│   └── apps/nlp-service/     #   FastAPI + LangGraph AI backend
├── start-xappy.sh            # Start all services
├── stop-xappy.sh             # Stop all services
├── open-all-websites.sh      # Open all URLs in browser
└── README.md                 # This file
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+ with virtualenvs set up in each backend (`backend/.venv/`)
- **PostgreSQL** 15 (Homebrew: `brew install postgresql@15`)
- **Redis** 7 (`brew install redis`)

### Start Everything

```bash
./start-xappy.sh
```

This will:
1. Create PostgreSQL role `xappy` and database `xappy_db` if they don't exist
2. Kill any processes on required ports
3. Start all backends and frontends sequentially
4. Wait for each service to become ready before starting the next

### Stop Everything

```bash
./stop-xappy.sh
```

### Open All Websites

```bash
./open-all-websites.sh
```

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

All backend APIs serve Swagger docs at `/docs` (e.g., http://localhost:5056/docs).

---

## Test Credentials

### Xappy-Health / Xappy-Oil / Xappy-Property (Badge + PIN Login)

All seeded users use **PIN: `1234`**

| Badge Number | Full Name | Role | Health | Oil | Property |
|-------------|-----------|------|--------|-----|----------|
| `HSE001` | HSE Manager One | hse_manager | Yes | Yes | Yes |
| `HSE002` | HSE Officer Two | hse_officer | Yes | Yes | Yes |
| `SUP001` | Supervisor One | supervisor | Yes | Yes | Yes |
| `SUP002` | Supervisor Two | supervisor | Yes | Yes | Yes |
| `WRK001` | Worker One | worker | Yes | Yes | Yes |
| `WRK002` | Worker Two | worker | Yes | Yes | Yes |

**Login page:** `/auth/login` on each frontend

**API endpoint:**
```bash
curl -X POST http://localhost:5056/api/v1/auth/badge-login \
  -H "Content-Type: application/json" \
  -d '{"badge_number": "HSE001", "pin": "1234"}'
```

### moodcraft / CereBro (Email + Password Login)

All demo accounts use **Password: `demo123`**

| Email | Name | Role |
|-------|------|------|
| `admin@cerebro.app` | Admin | SUPER_ADMIN |
| `hr@techflow.io` | HR User | HR |
| `therapist@cerebro.app` | Therapist | THERAPIST |
| `maya@demo.cerebro.app` | Maya | INDIVIDUAL (Drifter) |
| `james@demo.cerebro.app` | James | INDIVIDUAL (Thinker) |
| `aisha@demo.cerebro.app` | Aisha | INDIVIDUAL (Transformer) |
| `marcus@demo.cerebro.app` | Marcus | INDIVIDUAL (Seeker) |
| `patricia@demo.cerebro.app` | Patricia | INDIVIDUAL (Veteran) |

**Login page:** `/auth/login` on the moodcraft frontend

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
- Company, Contact, Privacy Policy, Terms of Service pages
- SEO optimized with JSON-LD structured data
- Responsive with mobile navigation

**Tech Stack:**
- Next.js 14.2, React, TypeScript
- TailwindCSS, Radix UI, Framer Motion
- next-intl for i18n

**Structure:**
```
XappyIO/
├── app/[locale]/            # Locale-based routing
│   ├── page.tsx             # Home page
│   ├── company/             # Company info
│   ├── contact/             # Contact form
│   ├── products/            # Product pages
│   ├── solutions/           # Solution pages
│   ├── privacy-policy/
│   └── terms-of-service/
├── components/
│   ├── layout/              # Header, Footer, MobileNav, LanguageSwitcher
│   ├── seo/                 # JSON-LD components
│   └── ui/                  # Button, Card, Badge, Input, etc.
├── hooks/                   # useBackToTop, useCounterAnimation, useMobileNav
├── lib/                     # animations, cn, jsonld, metadata
├── messages/                # i18n: en.json, hi.json, bn.json, ta.json, te.json
└── public/assets/images/    # Logos, favicons, OG image
```

---

### 2. Xappy-Health — Healthcare Compliance

**Location:** `Xappy-Health/`
**Ports:** Frontend 5053, Backend 5056

AI-powered compliance and frontline communication platform for healthcare operations. Workers report incidents via chat (text, voice, WhatsApp), supervisors review and manage reports through dashboards.

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

**Backend Structure:**
```
backend/app/
├── main.py                    # FastAPI app entry
├── api/v1/endpoints/
│   ├── auth.py                # Badge login, OTP, JWT refresh
│   ├── chat.py                # Conversations & messages
│   ├── healthcare_chat.py     # Healthcare-specific AI chat
│   ├── dashboard.py           # Dashboard metrics
│   ├── near_miss.py           # Near-miss reporting
│   ├── reports.py             # Report generation
│   ├── sites.py               # Site management
│   ├── users.py               # User CRUD
│   └── whatsapp.py            # WhatsApp webhook
├── models/                    # 14 SQLAlchemy models
│   ├── user.py, site.py, report.py
│   ├── incident.py, near_miss.py, spill_report.py
│   ├── inspection.py, ptw_evidence.py, loto_evidence.py
│   ├── toolbox_talk.py, shift_handover.py
│   ├── conversation.py, media_attachment.py, audit_trail.py
├── services/                  # Business logic
├── middleware/                # Request context, logging, error handling
├── core/                      # Config, security (JWT, bcrypt)
└── db/                        # Async session, Redis client
```

**Frontend Structure:**
```
frontend/src/
├── app/
│   ├── auth/login/            # Login page
│   ├── chat/                  # Chat interface
│   ├── admin/                 # Admin dashboard (chat, users, sites, audit, integrations)
│   ├── hse/                   # HSE dashboard (chat, spills, compliance, exports)
│   └── supervisor/            # Supervisor views
├── components/                # chat/, charts/, layout/, reports/, ui/
├── store/                     # Zustand state (auth, etc.)
├── hooks/                     # Custom React hooks
├── lib/                       # API client, utilities
└── types/                     # TypeScript definitions
```

---

### 3. Xappy-Oil — Oil & Gas Operations

**Location:** `Xappy-Oil/`
**Ports:** Frontend 5052, Backend 5054

AI-powered compliance platform tailored for Oil & Gas operations. Same architecture as Xappy-Health with industry-specific terminology and workflows.

**Key Features:**
- All features from Xappy-Health adapted for Oil & Gas
- Spill incident reporting (diesel, hydraulic fluid, chemicals)
- PTW management for hot work, excavation, confined space
- LOTO evidence for equipment isolation
- Oil & Gas specific safety metrics and dashboards
- Shift handover with safety status tracking

**User Roles:** Same as Xappy-Health

**Structure:** Mirrors Xappy-Health backend and frontend structure.

**Backend:** `backend/app/` — Same endpoint layout as Health
**Frontend:** `frontend/src/` — Same page/component layout as Health

---

### 4. Xappy-Property — Property Management

**Location:** `Xappy-Property/`
**Ports:** Frontend 5057, Backend 5058

Full-featured property management platform for landlords, managers, tenants, and suppliers. Extends the core Xappy architecture with property-specific modules.

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
- All base features (audit trails, dashboards, reporting)

**User Roles:**
`worker`, `supervisor`, `site_manager`, `project_manager`, `contractor`, `architect`, `quality_inspector`, `safety_officer`, `hse_manager`, `hse_officer`, `compliance_officer`, `operations_director`, `landlord`, `property_manager`, `agent`, `supplier`, `tenant`, `admin`, `super_admin`

**Backend Structure (Extended):**
```
backend/app/api/v1/endpoints/
├── auth.py                    # Badge login, OTP
├── chat.py                    # Chat/messaging
├── dashboard.py               # Dashboard metrics
├── properties.py              # Property CRUD
├── tenants.py                 # Tenant management
├── deposits.py                # Security deposits
├── maintenance.py             # Maintenance requests
├── contracts.py               # Lease agreements
├── costs.py                   # Financial tracking
├── documents.py               # Document storage
├── qualifications.py          # Vendor qualifications
├── suppliers.py               # Supplier management
├── compliance.py              # Compliance tracking
├── reports.py, sites.py, users.py
```

**Frontend Structure (Multi-role):**
```
frontend/src/app/
├── auth/login/
├── chat/
├── admin/                     # System admin
├── landlord/                  # Landlord portal
├── property-manager/          # Property manager dashboard
├── tenant/                    # Tenant portal
├── supplier/                  # Supplier interface
└── supervisor/
```

---

### 5. moodcraft (CereBro) — Mental Wellness AI

**Location:** `moodcraft/`
**Ports:** Frontend 5160, NLP Backend 5161

An agentic AI mental wellness platform with multi-agent LLM systems, RAG memory, crisis detection, and therapist support tools. Uses a Turbo monorepo structure.

**Key Features:**
- AI Twin — personalized mental wellness companion (LangGraph multi-agent)
- RAG memory with semantic search (Pinecone / Qdrant vector DBs)
- Real-time crisis/suicide risk detection and escalation
- Mood tracking, journaling, and breathing exercises
- Therapist dashboard with AI-generated case briefs
- Clinical assessment tools
- Community and peer support features
- Google OAuth + email/password authentication (NextAuth)
- Push notifications
- PDF report generation
- Multi-LLM: OpenAI GPT-4o (primary), Anthropic Claude (optional)

**User Roles:**
`INDIVIDUAL`, `HR`, `THERAPIST`, `ADMIN`, `SUPER_ADMIN`

**Monorepo Structure:**
```
moodcraft/
├── apps/
│   ├── web/                   # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/        # Login, register, therapist-register
│   │   │   ├── (b2c)/         # Consumer features
│   │   │   │   ├── ai-twin/       # AI companion chat
│   │   │   │   ├── breath/        # Breathing exercises
│   │   │   │   ├── clinical/      # Clinical assessments
│   │   │   │   ├── community/     # Community features
│   │   │   │   ├── dashboard/     # User dashboard
│   │   │   │   ├── escalation/    # Crisis escalation
│   │   │   │   ├── journal/       # Mood journal
│   │   │   │   ├── mood/          # Mood tracking
│   │   │   │   ├── profile/       # User profile
│   │   │   │   └── therapist/     # Therapist views
│   │   │   ├── (b2b)/            # B2B/corporate features
│   │   │   ├── (admin)/          # Admin dashboard
│   │   │   └── api/              # Next.js API routes
│   │   ├── components/           # React components
│   │   ├── lib/
│   │   │   ├── auth.ts           # NextAuth config
│   │   │   └── db.ts             # Prisma client
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Database schema
│   │   │   └── seed.ts           # Demo data seeding
│   │   └── middleware.ts         # Auth middleware
│   │
│   └── nlp-service/           # Python AI backend
│       ├── main.py               # FastAPI entry
│       ├── routers/
│       │   ├── ai_twin.py        # AI Twin agent endpoint
│       │   ├── sentiment.py      # Emotion analysis
│       │   ├── memory.py         # RAG memory ops
│       │   └── risk.py           # Crisis detection
│       ├── agents/
│       │   └── ai_twin_graph.py  # LangGraph multi-agent
│       ├── chains/               # LangChain chains
│       ├── prompts/              # System prompts
│       ├── vectorstores/         # Pinecone, Qdrant, Chroma
│       └── core/config.py        # Settings
│
├── packages/                  # Shared packages
├── turbo.json                 # Turbo build config
└── docker-compose.yml         # PostgreSQL, Redis, Qdrant
```

**NLP Service API:**
```
POST /api/v1/sentiment/analyze    # Emotion/sentiment analysis
POST /api/v1/sentiment/batch      # Batch analysis
POST /api/v1/risk/detect          # Crisis risk detection
POST /api/v1/risk/batch           # Batch risk detection
POST /api/v1/risk/crisis-resources # Get crisis resources
GET  /health                      # Health check
```

---

## Tech Stack

### Backend (All Projects)

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI 0.109+ |
| Server | Uvicorn (async) |
| Database | PostgreSQL 15 |
| ORM | SQLAlchemy (async) + Alembic migrations |
| Cache | Redis 7 |
| Auth | JWT (python-jose, bcrypt) |
| AI/LLM | OpenAI GPT-4, LangChain, LangGraph |
| Validation | Pydantic v2 |
| Logging | structlog (JSON) |
| Testing | pytest + pytest-asyncio |
| File Processing | Pillow, pydub, reportlab, openpyxl |

### Frontend (All Projects)

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | TailwindCSS, Radix UI |
| State | Zustand (Health/Oil/Property), NextAuth sessions (moodcraft) |
| Data Fetching | TanStack React Query + Axios |
| Charts | Recharts |
| Forms | React Hook Form |
| Icons | lucide-react |

### moodcraft Additions

| Component | Technology |
|-----------|-----------|
| ORM | Prisma 5.22 |
| Auth | NextAuth 4.24 (Credentials + Google OAuth) |
| Vector DB | Pinecone, Qdrant, ChromaDB |
| LLM Orchestration | LangGraph (multi-agent) |
| Editor | TipTap |
| PDF | @react-pdf/renderer |
| E2E Testing | Playwright |

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

### moodcraft NLP Service

```
POST /api/v1/sentiment/analyze
POST /api/v1/sentiment/batch
POST /api/v1/risk/detect
POST /api/v1/risk/batch
POST /api/v1/risk/crisis-resources
GET  /health
```

### Health Check (All Backends)

```
GET /health    # Returns status, uptime
GET /ready     # Kubernetes readiness probe
GET /docs      # Swagger UI
```

---

## Database

### Shared Database (Health, Oil, Property)

```
Host:     localhost:5432
Database: xappy_db
User:     xappy
Password: xappy_secret_2024
```

**Tables (16):**
`users`, `sites`, `areas`, `reports`, `conversations`, `messages`, `incident_details`, `near_miss_details`, `spill_report_details`, `inspection_details`, `ptw_evidence_details`, `loto_evidence_details`, `toolbox_talk_details`, `shift_handover_details`, `media_attachments`, `audit_trail`

### moodcraft Database

```
Host:     localhost:5432
Database: cerebro
User:     cerebro
Password: cerebro_dev_password
```

Uses **Prisma ORM** with its own schema and migrations.

**Seeding:**
```bash
cd moodcraft/apps/web
npx prisma db seed
```

---

## Environment Variables

### Health / Oil / Property Backend (`backend/.env`)

```env
DATABASE_URL=postgresql+asyncpg://xappy:xappy_secret_2024@localhost:5432/xappy_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
BHASHINI_API_KEY=...
AWS_S3_BUCKET=xappy-media
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### moodcraft NLP Service (`apps/nlp-service/.env`)

```env
DATABASE_URL=postgresql://cerebro:cerebro_dev_password@localhost:5432/cerebro
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
ANTHROPIC_API_KEY=...          # optional
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=cerebro-memory
QDRANT_URL=http://localhost:6333
API_SECRET_KEY=change-this-in-production
```

### moodcraft Frontend (`apps/web/.env`)

```env
DATABASE_URL=postgresql://cerebro:cerebro_dev_password@localhost:5432/cerebro
NEXTAUTH_URL=http://localhost:5160
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=...           # optional, for Google OAuth
GOOGLE_CLIENT_SECRET=...       # optional
NLP_SERVICE_URL=http://localhost:5161
ENCRYPTION_KEY=...
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `./start-xappy.sh` | Start all services (backends + frontends) on their assigned ports |
| `./stop-xappy.sh` | Stop all running Xappy services |
| `./open-all-websites.sh` | Open all production URLs in the default browser |

### Per-project Commands

**Backends (Health/Oil/Property):**
```bash
cd Xappy-Health/backend
.venv/bin/python -m uvicorn app.main:app --reload --port 5056
```

**Frontends (Health/Oil/Property):**
```bash
cd Xappy-Health/frontend
npm run dev -- --port 5053
```

**moodcraft:**
```bash
# NLP Service
cd moodcraft/apps/nlp-service
.venv/bin/python -m uvicorn main:app --reload --port 5161

# Web Frontend
cd moodcraft/apps/web
npx prisma generate          # Generate Prisma client
npm run dev -- --port 5160

# Database
npm run db:migrate            # Run migrations
npm run db:seed               # Seed demo data
npm run db:studio             # Open Prisma Studio
```

---

## Docker & Deployment

Each project includes Docker support:

- `Dockerfile` in each project root
- `docker-compose.yml` for local development with PostgreSQL, Redis
- moodcraft includes Qdrant (vector DB) in its compose file

**moodcraft Docker Compose Services:**
- `postgres:16-alpine` (port 5433)
- `redis:7-alpine` (port 6379)
- `qdrant:latest` (port 6333)
- `nlp-service` (port 8000)
- `web` (port 3000)

**Production:** Services are proxied through nginx with SSL at `*.xappy.io` subdomains.

---

## Notes

- Health, Oil, and Property backends **share the same `xappy_db` database**. User roles must be compatible across all three.
- moodcraft uses a **separate `cerebro` database** with Prisma.
- Build artifacts and virtual environments (`.venv/`, `node_modules/`, `.next/`) are excluded via `.gitignore`.
- All backends serve OpenAPI/Swagger docs at `/docs`.
