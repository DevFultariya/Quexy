# 🌌 Quexy — Enterprise AI-Powered Business Intelligence Platform

> **Connect your data. Ask naturally. Get intelligent answers. Instantly.**

Quexy is a full-stack, enterprise-grade AI Business Intelligence (BI) platform that bridges the gap between raw database sources and business executives. By translating plain-English questions into secure, optimized analytical queries, Quexy empowers business users to generate visual reports, charts, and metrics without writing a single line of SQL or code.

The platform is designed to completely abstract technical schemas, database dialects, and query generation, delivering a responsive, zero-knowledge analytical dashboard inside a premium glassmorphic user interface.

---

## 💎 Product Capabilities & Value Propositions

*   **🔌 Plug-and-Play Connectors:**
    *   Native integration for relational databases including **PostgreSQL**, **MySQL**, and **SQLite**.
    *   Zero-config spreadsheet uploads supporting **Excel** and **CSV** files.
*   **🛡️ Read-Only Security Shield:**
    *   Defensive `sqlglot`-powered AST parsing to ensure complete security.
    *   Immutable read-only sandboxing that blocks data modification queries (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`).
    *   Protects backend resources by enforcing automatic row limit cutoffs and statement timeouts.
*   **🧠 Programmatic Schema Profiler:**
    *   Automatically maps and caches database schemas, tables, column relationships, and data formats upon connection.
    *   Dynamically injects active metadata context to ground AI outputs without storing customer database content.
*   **⚡ Resilient Dual-LLM Orchestration:**
    *   Primary Query Engine: **Google Gemini 2.5 Flash**.
    *   Fallback Query Engine: **Groq Llama 3.3 70B** (highly optimized for low-latency processing).
    *   **Circuit-Breaker Cooldown**: Automatically detects Gemini rate limits and routes consecutive user questions to Groq instantly, avoiding network timeouts.
*   **🔧 Self-Healing Query Compiler**:
    *   If database execution returns a syntax error, the compiler catches the traceback and automatically coordinates with the LLM to patch, correct, and re-execute the query behind the scenes.
    *   Corrects table or column name hallucinations programmatically before query run-time using AST edit-distance alignment.
*   **🎨 Responsive Presentation Engine:**
    *   Dynamically maps query results to optimal business components: time-series data translates to line charts, categorical rankings map to bar graphs, and aggregates compile into executive summaries.
*   **💅 Premium Executive Dashboard UI:**
    *   Designed with high-end glassmorphism, depth elevations, micro-animations, and glowing neon violet/cyan states.
    *   Features a real-time **AI Pipeline Status Tracer** that visually updates the user through processing stages (Intent Decoding ➔ Security Check ➔ Execution ➔ Visualization).

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND LAYER (Next.js 15 / SSR)          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Connection│ │  Query   │ │Dashboard │ │   Query    │  │
│  │ Manager  │ │Interface │ │ Renderer │ │  History   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬───────┘  │
│       │             │            │             │        │
│  ┌────┴─────────────┴────────────┴─────────────┴──────┐  │
│  │              Adaptive Presentation Engine            │  │
│  │        (Metrics | Visual Charts | Data Tables)     │  │
│  └─────────────────────┬───────────────────────────────┘  │
└────────────────────────┼──────────────────────────────────┘
                         │ REST API (JSON / SSL)
┌────────────────────────┼──────────────────────────────────┘
│            BACKEND API SERVICE (FastAPI / ASGI)           │
│  ┌─────────────────────┴───────────────────────────────┐  │
│  │                     API Router                       │  │
│  └──┬──────┬──────┬──────┬──────┬──────┬───────────────┘  │
│     │      │      │      │      │      │                  │
│  ┌──┴──┐┌──┴──┐┌──┴──┐┌──┴──┐┌──┴──┐┌──┴──┐              │
│  │Data ││Schema││Query││Secur││Exec ││Visual│              │
│  │Conn.││Intel ││Gen  ││Valid││ution││Comp  │              │
│  └─────┘└──────┘└─────┘└─────┘└─────┘└─────┘              │
│                         │                                 │
│  ┌──────────────────────┴─────────────────────────────┐   │
│  │         LLM Orchestrator (with Circuit Breaker)    │   │
│  │  ┌────────────────┐       ┌─────────────────────┐  │   │
│  │  │ Google Gemini   │──────▶│ Groq Llama 3.3 70B  │  │   │
│  │  │ (Primary)       │  [429]│ (Fallback Engine)   │  │   │
│  │  └────────────────┘       └─────────────────────┘  │   │
│  └────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

*   **Backend Services:** Python, FastAPI, Uvicorn, Pandas, Openpyxl, Sqlglot, LangChain, psycopg2-binary, mysql-connector-python.
*   **Client Interface:** Next.js 15, React 19, TypeScript, Recharts, Framer Motion, Lucide Icons, Modern HSL CSS Variables.
*   **Security & Engine:** Abstract Syntax Tree (AST) Validation, JWT Encryption, Session Sandboxing.

---

## 📈 Example Business Analytical Queries

Quexy adapts to your database and answers complex business questions dynamically:

*   📊 **Executive Metrics:** `"What is our total profit for the last fiscal year?"`
*   📈 **Temporal Trends:** `"Show me the monthly sales growth trend."`
*   ⚔️ **Categorical Comparisons:** `"Compare our sales margins between the Electronics and Apparel divisions."`
*   🏆 **Rankings:** `"Identify our top 10 retail customers by purchase volume."`
*   🧩 **Operational Insights:** `"Which departments are showing declining margins over time?"`

---

## 🛡️ License

Quexy is distributed under the MIT License. Built as a technical showcase for production-ready AI-driven business intelligence.
