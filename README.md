# 🌌 Quexy — AI-Powered Business Intelligence Platform

> **Connect your data. Ask naturally. Get intelligent answers.**

Quexy is a full-stack, AI-powered Business Intelligence (BI) platform that transforms natural language questions into complete analytical experiences. Instead of writing SQL queries, building dashboards, or manually creating charts, users connect their existing data source (CSV, Excel, PostgreSQL, MySQL, SQLite), ask questions in plain English, and receive dynamically composed, interactive dashboards with KPI cards, beautiful charts, data tables, and actionable AI insights.

Designed like an intelligent, conversational business analyst, **Quexy completely hides SQL generation, database schemas, and AI prompts** from the user.

---

## ✨ Features

- **🔌 Multi-Source Data Ingestion:**
  - Fast CSV & Excel file uploads (automatically loaded into an optimized, in-memory SQLite database).
  - Native, secure connections for PostgreSQL, MySQL, and SQLite.
- **🛡️ Secure Query Validation Layer:**
  - Defensive `sqlglot`-powered AST parsing.
  - Strict read-only enforcement (blocks `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, multiple statements, and common SQL injection vectors).
  - Auto-enforces a maximum row limit (default: 10,000) and query timeouts.
- **🧠 Schema Intelligence Engine:**
  - Automatically profiles connected schemas, tables, columns, relationships, statistics, and sample values to ground the AI with precise database context.
- **🆓 Free AI Strategy with Zero-Cost Failover:**
  - Primary engine: **Google Gemini 2.5 Flash** (~1,500 free requests/day via Google AI Studio).
  - Fallback engine: **Groq Llama 3.3 70B** (~1,000 free requests/day via GroqCloud).
  - Automatic `429` rate-limit detection and seamless provider switching.
- **⚡ Self-Correction Loop:**
  - If a generated SQL query fails, the error message is fed back to the LLM to auto-correct and retry (up to 3 times) before displaying any feedback.
- **🎨 Dynamic Adaptive Response Engine:**
  - Renders custom layouts dynamically depending on the question and query results (e.g., Time series $\rightarrow$ Line chart, Categories $\rightarrow$ Bar/Pie charts, aggregates $\rightarrow$ KPI cards).
- **💅 Premium Dribbble-Grade UI:**
  - **Glassmorphic UI Design** with custom CSS, backdrop filters, and layered elevation depth.
  - Electric violet & cyan glow accents representing AI intelligence.
  - Seamless, fluid micro-animations (Framer Motion) and custom chart styling (Recharts).

---

## 🏗️ Architecture

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
                         │ REST API (JSON)
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

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, Uvicorn, Pandas, Openpyxl, Sqlglot, LangChain, `psycopg2-binary`, `mysql-connector-python`.
- **Frontend:** Next.js 15, React 19, TypeScript, Recharts, Framer Motion, Lucide Icons, Custom CSS variables.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows (Command Prompt)
   venv\Scripts\activate
   # On Windows (PowerShell)
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your API keys:
     - **Google Gemini Key:** Get one for free at [Google AI Studio](https://aistudio.google.com/).
     - **Groq API Key:** Get one for free at [Groq Console](https://console.groq.com/).
5. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend documentation will be interactive at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 Try These Sample Queries

When you launch the app, upload the pre-configured e-commerce sample dataset located at `backend/data/sample/ecommerce_sample.csv`. You can then test:
- 📊 **Metric / KPI:** `"What is our total revenue?"` or `"How much total profit did we make?"`
- 📈 **Trend:** `"Show me monthly revenue trends."`
- ⚔️ **Comparison:** `"Compare total profit between product categories."`
- 🏆 **Ranking:** `"Who are our top 5 customers by sales?"`
- 🗺️ **Regional:** `"Analyze sales distribution by state."`
- 🧩 **Complex Analysis:** `"Analyze my business performance and tell me which areas are declining."`

---

## 🛡️ License

MIT License. Designed with 💜 for resume display and technical showcases.
