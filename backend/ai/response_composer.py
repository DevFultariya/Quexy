"""
Quexy — Response Composer (Adaptive Response Engine)
Determines the best way to present query results based on data characteristics.
This is the FALLBACK composer — used when the LLM's response composition fails.
"""
import json
from typing import Any

from ai.models import (
    KPICard, ChartData, TableData, InsightItem, RecommendationItem
)


class ResponseComposer:
    """
    Fallback response composer that uses heuristics to determine
    the optimal response format based on data shape and intent.
    """
    
    CHART_COLORS = [
        "#7C3AED", "#06B6D4", "#F59E0B", "#EC4899", "#10B981", "#8B5CF6"
    ]
    
    def compose(
        self,
        question: str,
        data: list[dict[str, Any]],
        intent: str = "EXPLORATION",
    ) -> dict:
        """
        Compose an adaptive response based on data characteristics.
        
        Args:
            question: Original user question
            data: Query result rows
            intent: Classified intent (METRIC, TREND, COMPARISON, etc.)
            
        Returns:
            Dict with response components
        """
        if not data:
            return {
                "summary": "No data found for your query.",
                "kpi_cards": [],
                "charts": [],
                "tables": [],
                "insights": [{"text": "The query returned no results. Try rephrasing your question.", "type": "info"}],
                "recommendations": [],
            }
        
        columns = list(data[0].keys())
        row_count = len(data)
        numeric_cols = self._get_numeric_columns(data, columns)
        text_cols = [c for c in columns if c not in numeric_cols]
        
        result = {
            "summary": "",
            "kpi_cards": [],
            "charts": [],
            "tables": [],
            "insights": [],
            "recommendations": [],
        }
        
        # Single value result → KPI card
        if row_count == 1 and len(columns) <= 4:
            result["kpi_cards"] = self._make_kpi_cards(data[0], numeric_cols)
            result["summary"] = f"Here are the key metrics from your query."
        
        # Few rows with numeric data → KPIs + chart
        elif row_count <= 10 and numeric_cols and text_cols:
            # KPIs from aggregates
            if row_count == 1:
                result["kpi_cards"] = self._make_kpi_cards(data[0], numeric_cols)
            
            # Determine chart type
            chart_type = self._determine_chart_type(data, text_cols, numeric_cols, intent, row_count)
            result["charts"] = [self._make_chart(data, text_cols[0], numeric_cols, chart_type)]
            result["summary"] = f"Showing {row_count} results across {len(columns)} dimensions."
        
        # Many rows → chart + table
        elif row_count > 10 and numeric_cols and text_cols:
            chart_type = self._determine_chart_type(data, text_cols, numeric_cols, intent, row_count)
            result["charts"] = [self._make_chart(data[:50], text_cols[0], numeric_cols, chart_type)]
            result["tables"] = [self._make_table(data, columns)]
            result["summary"] = f"Displaying {row_count} records with visualizations."
        
        # Pure tabular data
        else:
            result["tables"] = [self._make_table(data, columns)]
            result["summary"] = f"Found {row_count} records."
        
        # Add basic insights
        if numeric_cols and data:
            result["insights"] = self._generate_basic_insights(data, numeric_cols, text_cols)
        
        return result
    
    def _get_numeric_columns(self, data: list[dict], columns: list[str]) -> list[str]:
        """Identify columns with numeric values."""
        numeric = []
        for col in columns:
            try:
                values = [row[col] for row in data[:10] if row[col] is not None]
                if values and all(isinstance(v, (int, float)) for v in values):
                    numeric.append(col)
            except (ValueError, TypeError):
                continue
        return numeric
    
    def _determine_chart_type(
        self, data, text_cols, numeric_cols, intent, row_count
    ) -> str:
        """Determine the best chart type based on data shape and intent."""
        if intent == "TREND":
            return "line"
        elif intent == "DISTRIBUTION" and row_count <= 6:
            return "pie"
        elif intent == "RANKING":
            return "bar"
        elif intent == "COMPARISON":
            return "bar"
        elif row_count <= 6 and len(numeric_cols) == 1:
            return "pie"
        elif row_count > 20:
            return "line"
        else:
            return "bar"
    
    def _make_kpi_cards(self, row: dict, numeric_cols: list[str]) -> list[dict]:
        """Create KPI cards from a single row of data."""
        cards = []
        for col in list(row.keys())[:6]:  # Max 6 KPI cards
            value = row[col]
            cards.append({
                "title": col.replace("_", " ").title(),
                "value": self._format_number(value) if isinstance(value, (int, float)) else str(value),
                "change": None,
                "trend": "neutral",
                "prefix": "$" if any(kw in col.lower() for kw in ["revenue", "sales", "price", "cost", "profit", "amount"]) else "",
                "suffix": "%" if "percent" in col.lower() or "rate" in col.lower() else "",
            })
        return cards
    
    def _make_chart(
        self, data: list[dict], x_key: str, y_keys: list[str], chart_type: str
    ) -> dict:
        """Create a chart configuration."""
        return {
            "chart_type": chart_type,
            "title": f"{', '.join(k.replace('_', ' ').title() for k in y_keys)} by {x_key.replace('_', ' ').title()}",
            "data": data[:100],  # Limit chart data points
            "x_key": x_key,
            "y_keys": y_keys[:4],  # Max 4 series
            "colors": self.CHART_COLORS[:len(y_keys)],
            "x_label": x_key.replace("_", " ").title(),
            "y_label": y_keys[0].replace("_", " ").title() if y_keys else "",
        }
    
    def _make_table(self, data: list[dict], columns: list[str]) -> dict:
        """Create a table configuration."""
        return {
            "title": "Detailed Results",
            "columns": [
                {"key": col, "label": col.replace("_", " ").title()}
                for col in columns
            ],
            "rows": data[:100],  # Limit table rows
            "sortable": True,
            "pagination": True,
            "page_size": 10,
        }
    
    def _generate_basic_insights(
        self, data: list[dict], numeric_cols: list[str], text_cols: list[str]
    ) -> list[dict]:
        """Generate basic statistical insights from the data."""
        insights = []
        
        for col in numeric_cols[:3]:  # Analyze up to 3 numeric columns
            values = [row[col] for row in data if row[col] is not None and isinstance(row[col], (int, float))]
            if not values:
                continue
            
            total = sum(values)
            avg = total / len(values)
            max_val = max(values)
            min_val = min(values)
            
            # Find the max contributor
            if text_cols:
                max_row = max(data, key=lambda r: r[col] if isinstance(r.get(col), (int, float)) else 0)
                insights.append({
                    "text": f"Highest {col.replace('_', ' ')}: {self._format_number(max_val)} ({max_row.get(text_cols[0], 'N/A')})",
                    "type": "positive",
                })
            
            # Range insight
            if max_val > 0 and min_val >= 0:
                ratio = max_val / min_val if min_val > 0 else 0
                if ratio > 5:
                    insights.append({
                        "text": f"Large variation in {col.replace('_', ' ')}: ranges from {self._format_number(min_val)} to {self._format_number(max_val)} ({ratio:.1f}x difference)",
                        "type": "warning",
                    })
        
        return insights[:5]  # Max 5 insights
    
    def _format_number(self, value) -> str:
        """Format a number for display."""
        if not isinstance(value, (int, float)):
            return str(value)
        if isinstance(value, float):
            if value >= 1_000_000:
                return f"{value / 1_000_000:.1f}M"
            elif value >= 1_000:
                return f"{value / 1_000:.1f}K"
            else:
                return f"{value:,.2f}"
        else:
            if value >= 1_000_000:
                return f"{value / 1_000_000:.1f}M"
            elif value >= 1_000:
                return f"{value:,}"
            return str(value)


# Singleton instance
response_composer = ResponseComposer()
