"""
Quexy — AI Response Models
Pydantic models for the adaptive response engine.
These define the contract between backend and frontend.
"""
from pydantic import BaseModel
from typing import Any
from datetime import datetime


class KPICard(BaseModel):
    """A single KPI metric card."""
    title: str
    value: str | int | float
    change: str | None = None       # e.g., "+18.5%"
    trend: str = "neutral"          # "up", "down", "neutral"
    icon: str | None = None         # Icon name suggestion
    prefix: str = ""                # e.g., "$", "₹"
    suffix: str = ""                # e.g., "%", " units"


class ChartData(BaseModel):
    """Configuration for a single chart."""
    chart_type: str                 # "line", "bar", "pie", "area", "scatter"
    title: str
    data: list[dict[str, Any]]      # Chart data points
    x_key: str                      # Key for X axis
    y_keys: list[str]               # Keys for Y axis (supports multi-series)
    colors: list[str] | None = None # Custom colors per series
    x_label: str = ""
    y_label: str = ""


class TableData(BaseModel):
    """Configuration for a data table."""
    title: str
    columns: list[dict[str, str]]   # [{key, label, type}]
    rows: list[dict[str, Any]]
    sortable: bool = True
    pagination: bool = True
    page_size: int = 10


class InsightItem(BaseModel):
    """A single AI-generated business insight."""
    text: str
    type: str = "info"              # "positive", "negative", "neutral", "info", "warning"
    icon: str | None = None


class PerformanceAdvice(BaseModel):
    """Performance recommendation for index tuning or execution optimization."""
    type: str  # "warning", "info", "success"
    message: str
    action_sql: str | None = None  # SQL to fix the issue (e.g. CREATE INDEX ...)


class PerformanceReport(BaseModel):
    """Execution statistics and automated DBA diagnostic metrics."""
    original_sql: str
    corrected_sql: str | None = None
    ast_corrected: bool = False
    explain_plan: list[str] = []
    advice: list[PerformanceAdvice] = []


class RecommendationItem(BaseModel):
    """A single AI-generated business recommendation."""
    text: str
    priority: str = "medium"        # "high", "medium", "low"


class QueryResponse(BaseModel):
    """
    The complete adaptive response returned for every query.
    The frontend renders whichever components are present.
    """
    query_id: str
    question: str
    summary: str = ""               # Executive summary text
    
    # Dynamic components — only non-empty ones get rendered
    kpi_cards: list[KPICard] = []
    charts: list[ChartData] = []
    tables: list[TableData] = []
    insights: list[InsightItem] = []
    recommendations: list[RecommendationItem] = []
    
    # Metadata
    success: bool = True
    error: str | None = None
    timestamp: str = ""
    execution_time_ms: int = 0
    performance_report: PerformanceReport | None = None


class QueryHistoryItem(BaseModel):
    """A single item in query history."""
    query_id: str
    question: str
    summary: str = ""
    timestamp: str
    has_kpis: bool = False
    has_charts: bool = False
    has_tables: bool = False
    has_insights: bool = False
