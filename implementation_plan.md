# Quexy — AI-Powered Business Intelligence Platform

> Connect your data. Ask naturally. Get intelligent answers.

## Overview

Quexy is a full-stack AI-powered BI platform that lets users connect any structured data source (CSV, Excel, PostgreSQL, MySQL, SQLite), ask natural language questions, and receive intelligent, dynamically-composed analytical responses — without ever seeing SQL, schemas, or AI prompts.

---

## 🆓 Free AI Strategy — Zero Cost

We use a **dual-provider failover** approach — both are 100% free, no credit card needed:

| Priority | Provider | Model | Free Limits | Why |
|----------|----------|-------|-------------|-----|
| **Primary** | **Google Gemini** | `gemini-2.5-flash` | ~1,500 RPD, 1M+ TPM | Best reasoning, large context, excellent at structured output |
| **Fallback** | **Groq** | `llama-3.3-70b-versatile` | ~1,000 RPD, 12K TPM | Blazing fast inference, great SQL generation |

**How it works:**
- Every query first goes to **Gemini** (higher accuracy, better reasoning)
- If Gemini returns a `429` rate limit error → automatically retries with **Groq**
- If both are exhausted → graceful error message: *"AI capacity reached. Please try again in a few minutes."*
- **Estimated daily capacity**: ~2,500 queries/day — more than enough for a portfolio project

**Packages:**
```
langchain-google-genai    # For Gemini
langchain-groq            # For Groq (fallback)
```

---

## Technology Stack

### Backend
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | **FastAPI** (Python) | Async, high-performance, automatic OpenAPI docs |
| **LLM Orchestration** | **LangChain** | Agentic workflows, tool-calling, self-correction |
| **Primary LLM** | **Google Gemini 2.5 Flash** (FREE) | Best free reasoning model |
| **Fallback LLM** | **Groq Llama 3.3 70B** (FREE) | Fastest inference, reliable fallback |
| **SQL Validation** | **sqlglot** | SQL parsing, transpilation, security validation |
| **DB Connectors** | `psycopg2`, `mysql-connector-python`, `sqlite3` | Native database connectivity |
| **File Processing** | `pandas` + `openpyxl` | CSV/Excel → SQLite conversion |

### Frontend
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | **Next.js 15** (App Router) | SSR, file-based routing, React Server Components |
| **Styling** | **Vanilla CSS** (custom design system) | Maximum control, premium aesthetic |
| **Charts** | **Recharts** | Composable, React-native, adaptive rendering |
| **Animations** | **Framer Motion** | Smooth micro-animations, page transitions |
| **Icons** | **Lucide React** | Clean, consistent icon set |
| **Font** | **Inter** (Google Fonts) | Modern, premium typography |

---

## 🎨 Premium UI Design Philosophy

The UI follows a **"Dark AI-Native Analytics"** aesthetic — inspired by the best Dribbble/Behance BI dashboards from 2024-2026. The goal is to make anyone who sees this project say **"wow"**.

### Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Deep Dark Base** | Rich charcoal/navy backgrounds (NOT pure black) — feels premium, reduces eye strain |
| **Layered Depth** | Cards sit on elevated surfaces with subtle lightness differences — creates hierarchy without harsh shadows |
| **Glassmorphism** | Semi-transparent panels with `backdrop-filter: blur()` — modern, premium glass effect |
| **Glow Accents** | Electric violet/cyan glows on interactive elements — "AI-powered" futuristic feel |
| **Bento Grid** | Modular, responsive grid layout for dashboard cards — organized yet dynamic |
| **Micro-animations** | Every interaction has smooth feedback: hover lifts, fade-ins, slide-ups, shimmer loaders |
| **Progressive Disclosure** | Show what matters first, reveal complexity on interaction |
| **Calm Data Density** | Whitespace-rich, never cluttered, data reads effortlessly |

### Color Palette

```
  ┌─────────────────────────────────────────────────┐
  │  QUEXY DESIGN SYSTEM — COLOR PALETTE            │
  ├─────────────────────────────────────────────────┤
  │                                                 │
  │  BACKGROUNDS                                    │
  │  ██████  #0A0A0F  — App background (deep void)  │
  │  ██████  #12121A  — Surface level 1 (sidebar)   │
  │  ██████  #1A1A2E  — Surface level 2 (cards)     │
  │  ██████  #23233A  — Surface level 3 (elevated)  │
  │                                                 │
  │  ACCENTS                                        │
  │  ██████  #7C3AED  — Primary (Electric Violet)   │
  │  ██████  #06B6D4  — Secondary (Cyan)            │
  │  ██████  #8B5CF6  — Hover/Glow (Soft Violet)    │
  │                                                 │
  │  GRADIENTS                                      │
  │  ██████→██████  #7C3AED → #06B6D4  (AI Accent)  │
  │  ██████→██████  #1A1A2E → #0A0A0F  (Depth)      │
  │  ██████→██████  #7C3AED → #EC4899  (Premium)     │
  │                                                 │
  │  TEXT                                           │
  │  ██████  #F1F5F9  — Primary text (bright)       │
  │  ██████  #94A3B8  — Secondary text (muted)      │
  │  ██████  #64748B  — Tertiary text (subtle)      │
  │                                                 │
  │  SEMANTIC                                       │
  │  ██████  #10B981  — Success / Growth (Emerald)  │
  │  ██████  #EF4444  — Error / Decline (Red)       │
  │  ██████  #F59E0B  — Warning (Amber)             │
  │  ██████  #3B82F6  — Info (Blue)                 │
  │                                                 │
  │  CHART PALETTE                                  │
  │  ██████  #7C3AED  — Series 1 (Violet)           │
  │  ██████  #06B6D4  — Series 2 (Cyan)             │
  │  ██████  #F59E0B  — Series 3 (Amber)            │
  │  ██████  #EC4899  — Series 4 (Pink)             │
  │  ██████  #10B981  — Series 5 (Emerald)          │
  │  ██████  #8B5CF6  — Series 6 (Soft Violet)      │
  │                                                 │
  └─────────────────────────────────────────────────┘
```

### UI Layout — Three Key Screens

#### Screen 1: Connect Data Source (Onboarding)
- Full-screen dark gradient background with subtle animated particles/mesh
- Centered glassmorphic card with the Quexy logo + tagline
- Two options side-by-side: **Upload File** (drag-drop zone) | **Connect Database** (form)
- File drop zone with animated dashed border, icon animation on hover
- Database form with glowing input fields, type selector (PostgreSQL/MySQL/SQLite)
- "Connect" button with violet-to-cyan gradient, glow on hover
- Success animation: confetti-like burst → smooth transition to dashboard

#### Screen 2: Main Dashboard (The Star)
- **Left sidebar**: Collapsible, dark surface, shows logo + connected DB info + table list + query history
- **Top area**: Large, prominent query input bar with glass effect, placeholder text rotates through suggestions
- **Main area**: Bento-style grid that dynamically fills with response components:
  - **KPI Cards**: Glassmorphic cards with large numbers, trend arrows, subtle gradient accents
  - **Charts**: Smooth gradient fills, rounded corners, animated data points, clean tooltips
  - **Data Tables**: Alternating subtle row colors, fixed headers, smooth sort animations
  - **AI Insights**: Cards with colored left border (green/red/blue), lightbulb icon, clean text
  - **Recommendations**: Numbered cards with action-oriented text, priority badges
- All components animate in with staggered timing (cascade effect)

#### Screen 3: Loading / Thinking State
- Skeleton placeholders with shimmer animation
- "Quexy is analyzing your data..." with animated dots
- Subtle pulsing glow around the query bar
- Feels alive and intelligent, not static

### Typography Scale
```css
--font-family: 'Inter', -apple-system, sans-serif;
--text-xs:    0.75rem;    /* Labels, badges */
--text-sm:    0.875rem;   /* Secondary text */
--text-base:  1rem;       /* Body text */
--text-lg:    1.125rem;   /* Section headers */
--text-xl:    1.25rem;    /* Card titles */
--text-2xl:   1.5rem;     /* KPI values */
--text-3xl:   1.875rem;   /* Hero numbers */
--text-4xl:   2.25rem;    /* Big KPI metrics */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Connect  │ │  Query   │ │Dashboard │ │  History   │ │
│  │  Data    │ │Interface │ │ Renderer │ │   Panel    │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬───────┘ │
│       │             │            │             │         │
│  ┌────┴─────────────┴────────────┴─────────────┴──────┐ │
│  │              Adaptive Response Renderer             │ │
│  │   (KPI Cards | Charts | Tables | Insights | Reco)  │ │
│  └─────────────────────┬───────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────┘
                         │ REST API
┌────────────────────────┼─────────────────────────────────┐
│                   BACKEND (FastAPI)                       │
│  ┌─────────────────────┴───────────────────────────────┐ │
│  │                   API Router                         │ │
│  └──┬──────┬──────┬──────┬──────┬──────┬───────────────┘ │
│     │      │      │      │      │      │                 │
│  ┌──┴──┐┌──┴──┐┌──┴──┐┌──┴──┐┌──┴──┐┌──┴──┐             │
│  │Data ││Schma││Query││Secur││Exec ││Resp │             │
│  │Conn.││Intel││Gen  ││Valid││ute  ││Engn │             │
│  └─────┘└─────┘└─────┘└─────┘└─────┘└─────┘             │
│                         │                                │
│  ┌──────────────────────┴────────────────────────────┐   │
│  │           LLM Provider (with Failover)             │   │
│  │  ┌────────────────┐    ┌────────────────────────┐  │   │
│  │  │ Google Gemini   │───▶│ Groq Llama 3.3 (Fback)│  │   │
│  │  │ 2.5 Flash (Pri) │    └────────────────────────┘  │   │
│  │  └────────────────┘                                 │   │
│  └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## Proposed Changes

### Phase 1 — Backend Core

---

#### Backend: Project Setup

##### [NEW] [backend/](file:///d:/Quexy/backend/)
- Python project with `requirements.txt`
- FastAPI application entry point
- Environment configuration via `.env`
- CORS setup for frontend communication

##### [NEW] [requirements.txt](file:///d:/Quexy/backend/requirements.txt)
```
fastapi
uvicorn[standard]
python-multipart
pandas
openpyxl
psycopg2-binary
mysql-connector-python
sqlglot
langchain
langchain-core
langchain-google-genai
langchain-groq
python-dotenv
pydantic
```

##### [NEW] [main.py](file:///d:/Quexy/backend/main.py)
- FastAPI app with CORS middleware
- Router registration for all endpoints
- Global error handling middleware

##### [NEW] [config.py](file:///d:/Quexy/backend/config.py)
- Environment variable loading via `python-dotenv`
- `GEMINI_API_KEY`, `GROQ_API_KEY`
- Rate limit settings, max row limits, query timeout

---

#### Backend: Data Source Connectors

##### [NEW] [connectors/base.py](file:///d:/Quexy/backend/connectors/base.py)
- Abstract `DataSourceConnector` base class
- Interface: `connect()`, `test_connection()`, `get_schema()`, `execute_query()`, `get_dialect()`

##### [NEW] [connectors/csv_connector.py](file:///d:/Quexy/backend/connectors/csv_connector.py)
- CSV upload → pandas → in-memory SQLite database
- Auto-detects data types, handles encoding issues

##### [NEW] [connectors/excel_connector.py](file:///d:/Quexy/backend/connectors/excel_connector.py)
- .xlsx upload → pandas + openpyxl → SQLite
- Each sheet becomes a separate table

##### [NEW] [connectors/postgres_connector.py](file:///d:/Quexy/backend/connectors/postgres_connector.py)
- Connection via `psycopg2` with SSL support
- Connection validation

##### [NEW] [connectors/mysql_connector.py](file:///d:/Quexy/backend/connectors/mysql_connector.py)
- Connection via `mysql-connector-python`
- Connection validation

##### [NEW] [connectors/sqlite_connector.py](file:///d:/Quexy/backend/connectors/sqlite_connector.py)
- Direct connection via built-in `sqlite3`
- Accepts file upload of `.db`/`.sqlite` files

##### [NEW] [connectors/manager.py](file:///d:/Quexy/backend/connectors/manager.py)
- Manages active connection, stores schema cache
- Singleton pattern for session management

---

#### Backend: Schema Intelligence Engine

##### [NEW] [schema/analyzer.py](file:///d:/Quexy/backend/schema/analyzer.py)
- Extracts: tables, columns, types, PKs, FKs, row counts, sample values, null stats
- Produces `SchemaProfile` for AI context injection

##### [NEW] [schema/models.py](file:///d:/Quexy/backend/schema/models.py)
- Pydantic models: `TableSchema`, `ColumnSchema`, `SchemaProfile`, `RelationshipInfo`

---

#### Backend: Query Security Layer

##### [NEW] [security/validator.py](file:///d:/Quexy/backend/security/validator.py)
- `sqlglot` based SQL parsing and validation
- Blocks: INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, GRANT, REVOKE, PRAGMA
- Multi-statement detection, injection prevention
- Max row limit enforcement (default 10,000)
- Returns `ValidationResult` with pass/fail and reason

---

#### Backend: AI Pipeline (Core Intelligence)

##### [NEW] [ai/llm_provider.py](file:///d:/Quexy/backend/ai/llm_provider.py)
- **Dual-provider manager** with automatic failover
- Primary: `ChatGoogleGenerativeAI(model="gemini-2.5-flash")`
- Fallback: `ChatGroq(model="llama-3.3-70b-versatile")`
- On `429` errors → automatic retry with fallback provider
- Exponential backoff, graceful degradation

##### [NEW] [ai/pipeline.py](file:///d:/Quexy/backend/ai/pipeline.py)
- Full orchestration: question → structured response
- Steps: Intent Classification → Schema Context → SQL Generation → Security Check → Self-Correction (max 3 retries) → Data Analysis → Response Composition

##### [NEW] [ai/prompts.py](file:///d:/Quexy/backend/ai/prompts.py)
- System prompts for each pipeline stage
- Structured JSON output instructions
- Few-shot examples for common query patterns

##### [NEW] [ai/response_composer.py](file:///d:/Quexy/backend/ai/response_composer.py)
- **Adaptive Response Engine** — the defining feature
- Dynamically composes response: `kpi_cards`, `charts`, `tables`, `insights`, `recommendations`, `summary`
- Chart type selection based on data shape (time series → line, categories ≤6 → pie, etc.)

##### [NEW] [ai/models.py](file:///d:/Quexy/backend/ai/models.py)
- Pydantic response models: `QueryResponse`, `KPICard`, `ChartData`, `InsightItem`, `RecommendationItem`

---

#### Backend: API Routes

##### [NEW] [routes/datasource.py](file:///d:/Quexy/backend/routes/datasource.py)
- `POST /api/datasource/upload` — Upload CSV/Excel/SQLite
- `POST /api/datasource/connect` — Connect to PostgreSQL/MySQL
- `GET /api/datasource/status` — Connection status
- `GET /api/datasource/schema` — Schema summary
- `DELETE /api/datasource/disconnect` — Disconnect

##### [NEW] [routes/query.py](file:///d:/Quexy/backend/routes/query.py)
- `POST /api/query` — Submit NL question → adaptive response
- `GET /api/query/history` — Query history
- `GET /api/query/{id}` — Past query response

##### [NEW] [routes/health.py](file:///d:/Quexy/backend/routes/health.py)
- `GET /api/health` — Health check

---

### Phase 2 — Frontend: Premium Dashboard UI

---

#### Frontend: Project Setup

##### [NEW] [frontend/](file:///d:/Quexy/frontend/)
- Next.js 15 (App Router), TypeScript
- Dependencies: `recharts`, `framer-motion`, `lucide-react`

---

#### Frontend: Design System

##### [NEW] [globals.css](file:///d:/Quexy/frontend/src/app/globals.css)
Premium design system:
- CSS custom properties for entire color palette, typography, spacing
- Deep dark backgrounds with layered elevation system
- Glassmorphism utility classes (`backdrop-filter: blur(20px)`)
- Gradient utilities (AI accent, premium, depth)
- Button styles with glow effects
- Input styles with glowing focus states
- Card styles with glass effect + hover lift
- Responsive breakpoints (mobile-first)
- Skeleton/shimmer animation keyframes
- Smooth transitions on everything

---

#### Frontend: Core Components

##### [NEW] [ConnectDataSource.tsx](file:///d:/Quexy/frontend/src/components/ConnectDataSource.tsx)
- Full-screen onboarding with animated gradient mesh background
- Glassmorphic centered card with logo + tagline
- **Upload tab**: Drag-drop zone with animated dashed border, file icon animation
- **Database tab**: Glowing input fields, database type selector pills
- "Connect" button with gradient + glow hover effect
- Success animation → transition to dashboard

##### [NEW] [QueryInterface.tsx](file:///d:/Quexy/frontend/src/components/QueryInterface.tsx)
- Large, prominent glassmorphic input bar
- Animated placeholder text cycling through example questions
- Send button with gradient, pulse animation on submit
- Loading state: pulsing glow around input

##### [NEW] [AdaptiveResponse.tsx](file:///d:/Quexy/frontend/src/components/AdaptiveResponse.tsx)
- Dynamically renders response components in Bento grid
- Staggered cascade animation (each card fades in 100ms apart)
- Responsive: 1 col mobile, 2 col tablet, 3-4 col desktop

##### [NEW] [KPICard.tsx](file:///d:/Quexy/frontend/src/components/KPICard.tsx)
- Glassmorphic card with gradient accent border (top or left)
- Large metric value with number counter animation
- Trend arrow (↑ emerald / ↓ red) with percentage badge
- Subtle icon in background (opacity 5-10%)

##### [NEW] [DynamicChart.tsx](file:///d:/Quexy/frontend/src/components/DynamicChart.tsx)
- Recharts wrapper, renders: Line, Bar, Pie, Area, Scatter
- Gradient fills on all charts (using `<defs><linearGradient>`)
- Smooth entry animations, rounded bars
- Custom glassmorphic tooltips, clean legends
- Consistent chart palette across all chart types

##### [NEW] [DataTable.tsx](file:///d:/Quexy/frontend/src/components/DataTable.tsx)
- Sortable columns with animated sort indicators
- Pagination with page numbers
- Search/filter bar
- Export CSV button
- Alternating subtle row shading, hover highlight
- Horizontal scroll on mobile with fade indicators

##### [NEW] [InsightCard.tsx](file:///d:/Quexy/frontend/src/components/InsightCard.tsx)
- Card with colored left accent border (green/red/amber/blue)
- Lightbulb/brain icon, insight text
- Type badge (positive/negative/neutral/info)

##### [NEW] [QueryHistory.tsx](file:///d:/Quexy/frontend/src/components/QueryHistory.tsx)
- Sidebar list of past questions
- Click to re-view responses
- Timestamp, question text, subtle result preview
- Active question highlight

##### [NEW] [Sidebar.tsx](file:///d:/Quexy/frontend/src/components/Sidebar.tsx)
- Collapsible sidebar with smooth animation
- Logo with gradient glow
- Connection status indicator (pulsing green dot)
- Schema explorer: table names with column count badges
- Navigation: Dashboard, History
- Collapse toggle for mobile

##### [NEW] [LoadingState.tsx](file:///d:/Quexy/frontend/src/components/LoadingState.tsx)
- Skeleton placeholders with shimmer animation
- "Quexy is analyzing..." with animated pulsing dots
- Mimics real dashboard layout (skeleton KPI cards, chart areas)

---

#### Frontend: API Client & Types

##### [NEW] [lib/api.ts](file:///d:/Quexy/frontend/src/lib/api.ts)
- Centralized API client with error handling
- Functions: `uploadFile()`, `connectDatabase()`, `submitQuery()`, `getHistory()`, `getStatus()`

##### [NEW] [lib/types.ts](file:///d:/Quexy/frontend/src/lib/types.ts)
- TypeScript interfaces mirroring backend models

---

### Phase 3 — Integration & Polish

---

##### [NEW] [data/sample/ecommerce_sample.csv](file:///d:/Quexy/backend/data/sample/ecommerce_sample.csv)
- Sample e-commerce dataset (~1000 rows)
- Columns: OrderID, Date, Product, Category, Revenue, Quantity, Customer, Region, State
- Pre-loaded so anyone reviewing the project can immediately try queries

##### [NEW] [README.md](file:///d:/Quexy/README.md)
- Project overview with screenshots
- Tech stack badges, architecture diagram
- Setup instructions (backend + frontend)
- Feature highlights, demo GIF placeholder

##### [NEW] [.gitignore](file:///d:/Quexy/.gitignore)
- Python + Node + env files + uploaded data

---

## Project Structure

```
d:\Quexy\
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── config.py                  # Environment config
│   ├── requirements.txt
│   ├── .env                       # API keys (gitignored)
│   ├── connectors/
│   │   ├── __init__.py
│   │   ├── base.py                # Abstract connector
│   │   ├── csv_connector.py
│   │   ├── excel_connector.py
│   │   ├── postgres_connector.py
│   │   ├── mysql_connector.py
│   │   ├── sqlite_connector.py
│   │   └── manager.py            # Connection manager
│   ├── schema/
│   │   ├── __init__.py
│   │   ├── analyzer.py           # Schema intelligence
│   │   └── models.py             # Schema models
│   ├── security/
│   │   ├── __init__.py
│   │   └── validator.py          # Query security
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── llm_provider.py       # Dual AI with failover
│   │   ├── pipeline.py           # AI orchestration
│   │   ├── prompts.py            # LLM prompts
│   │   ├── response_composer.py  # Adaptive response engine
│   │   └── models.py             # Response models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── datasource.py
│   │   ├── query.py
│   │   └── health.py
│   └── data/
│       └── sample/
│           └── ecommerce_sample.csv
│
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css       # Premium design system
│   │   ├── components/
│   │   │   ├── ConnectDataSource.tsx
│   │   │   ├── QueryInterface.tsx
│   │   │   ├── AdaptiveResponse.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── DynamicChart.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── InsightCard.tsx
│   │   │   ├── QueryHistory.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── LoadingState.tsx
│   │   └── lib/
│   │       ├── api.ts
│   │       └── types.ts
│   └── public/
│       └── logo.svg
│
├── README.md
└── .gitignore
```

---

## Verification Plan

### Automated Tests
```bash
# Backend
cd backend && uvicorn main:app --reload --port 8000

# Frontend
cd frontend && npm run dev
```

### Manual Verification
1. **Data Connection**: Upload sample CSV → verify schema detection
2. **Natural Language Queries**:
   - "Show me total revenue" → KPI card(s)
   - "Monthly revenue trends" → Line chart + KPI
   - "Top 10 products by sales" → Ranking + bar chart
   - "Analyze my business" → Full executive dashboard
   - "Compare revenue by region" → Grouped bar chart
3. **Security**: `"DROP TABLE users"` → blocked, multi-statement → blocked
4. **UI/UX**: Responsive layout, loading states, animations, chart interactions
5. **AI Failover**: Verify Groq fallback works when Gemini rate-limited

---

## Implementation Order

| Step | What | Est. Time |
|------|------|-----------|
| 1 | Backend project setup + config | ~30 min |
| 2 | Data connectors (CSV, Excel, SQLite) | ~1.5 hrs |
| 3 | Schema intelligence engine | ~1 hr |
| 4 | Query security validator | ~45 min |
| 5 | Dual AI provider + pipeline + response composer | ~2.5 hrs |
| 6 | API routes | ~1 hr |
| 7 | Frontend setup + premium design system (CSS) | ~1.5 hrs |
| 8 | Connect Data Source page (onboarding) | ~1.5 hrs |
| 9 | Query interface + adaptive response renderer | ~2 hrs |
| 10 | Dashboard components (KPI, Charts, Tables, Insights) | ~2 hrs |
| 11 | Sidebar, History, Loading states | ~1 hr |
| 12 | Integration testing + polish | ~1.5 hrs |
| 13 | PostgreSQL + MySQL connectors | ~1 hr |
| 14 | Sample data + README | ~30 min |
| **Total** | | **~17 hrs** |
