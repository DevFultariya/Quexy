"""
Quexy — Automated Query Optimizer & DBA Diagnostics
Analyzes SQL queries using EXPLAIN plans, checks for full table scans or sorting bottlenecks,
and generates performance diagnostics and CREATE INDEX index advisors.
"""
import re
import logging
from typing import Any, Tuple

from connectors.manager import connection_manager
from ai.models import PerformanceAdvice, PerformanceReport

logger = logging.getLogger(__name__)

class QueryOptimizer:
    """
    Runs EXPLAIN plans on database connections, parses execution paths, 
    and advises on performance tuning (indexing, sort optimizations).
    """

    def __init__(self, manager=None):
        self.manager = manager or connection_manager

    def generate_report(self, original_sql: str, corrected_sql: str, ast_corrected: bool) -> PerformanceReport:
        """
        Runs diagnostics on a query and builds a full PerformanceReport.
        """
        sql_to_analyze = corrected_sql or original_sql
        dialect = self.manager.get_dialect()
        
        explain_plan = []
        advice = []
        
        if not self.manager.is_connected:
            return PerformanceReport(
                original_sql=original_sql,
                corrected_sql=corrected_sql,
                ast_corrected=ast_corrected,
                explain_plan=["Not connected to any data source."],
                advice=[PerformanceAdvice(type="info", message="Connect a database to enable explain diagnostics.")]
            )
            
        try:
            explain_plan = self._get_explain_plan(sql_to_analyze, dialect)
            advice = self._analyze_explain_plan(explain_plan, sql_to_analyze, dialect)
        except Exception as e:
            logger.warning(f"Failed to retrieve EXPLAIN diagnostics: {e}")
            explain_plan = [f"Explain diagnostic failed: {str(e)}"]
            advice = [PerformanceAdvice(
                type="info",
                message="Explain plan unavailable for this query syntax or dialect."
            )]

        # If everything is fine, add a success advice
        if not any(a.type == "warning" for a in advice):
            advice.append(PerformanceAdvice(
                type="success",
                message="Excellent! Query execution path is optimized. Standard table scans are indexed or fit in memory."
            ))

        return PerformanceReport(
            original_sql=original_sql,
            corrected_sql=corrected_sql,
            ast_corrected=ast_corrected,
            explain_plan=explain_plan,
            advice=advice
        )

    def _get_explain_plan(self, sql: str, dialect: str) -> list[str]:
        """Execute dialect-specific EXPLAIN query and parse rows to string list."""
        plan_rows = []
        
        if dialect == "sqlite":
            # SQLite uses EXPLAIN QUERY PLAN
            query = f"EXPLAIN QUERY PLAN {sql}"
            res = self.manager.execute_query(query)
            for row in res:
                # SQLite returns format: selectid | order | from | detail
                detail = row.get("detail", "")
                if detail:
                    plan_rows.append(detail)
                    
        elif dialect == "postgres":
            query = f"EXPLAIN {sql}"
            res = self.manager.execute_query(query)
            for row in res:
                # Postgres returns rows of text in a single column
                # Get the first value in the dict
                val = list(row.values())[0]
                plan_rows.append(str(val))
                
        elif dialect == "mysql":
            query = f"EXPLAIN {sql}"
            res = self.manager.execute_query(query)
            for row in res:
                # MySQL returns columns: table, type, possible_keys, key, key_len, ref, rows, Extra
                tbl = row.get("table", "")
                join_type = row.get("type", "")
                key_used = row.get("key", "")
                rows_scanned = row.get("rows", "")
                extra = row.get("Extra", "")
                
                plan_rows.append(
                    f"Table: {tbl} | Access Type: {join_type} | Key: {key_used or 'NONE'} | "
                    f"Rows Scanned: {rows_scanned} | Extra: {extra}"
                )
        else:
            plan_rows = ["Explain not supported for this dialect."]
            
        return plan_rows

    def _analyze_explain_plan(self, plan: list[str], sql: str, dialect: str) -> list[PerformanceAdvice]:
        """Inspect the explain plan text and produce optimization recommendations."""
        advice = []
        
        # Extract tables and where clauses from the SQL (rough regex fallback if AST fails)
        referenced_tables = list(set(re.findall(r'FROM\s+"?(\w+)"?', sql, re.IGNORECASE)))
        where_columns = list(set(re.findall(r'WHERE\s+"?(\w+)"?\s*[=<>]/s*', sql, re.IGNORECASE)))
        
        if not where_columns:
            # Look for normal column comparison patterns
            where_columns = list(set(re.findall(r'"?(\w+)"?\s*=\s*[\'"]?\w+[\'"]?', sql)))
            # Exclude table aliases or constants
            where_columns = [c for c in where_columns if c.upper() not in ("SELECT", "AND", "OR", "WHERE", "JOIN", "ON")]

        # Join columns
        join_columns = list(set(re.findall(r'ON\s+"?\w+"?\."?(\w+)"?\s*=\s*"?\w+"?\."?(\w+)"?', sql, re.IGNORECASE)))
        join_cols_flat = []
        for pair in join_columns:
            join_cols_flat.extend(pair)

        # Order by columns
        order_by_match = re.search(r'ORDER\s+BY\s+("?\w+"?\."?)?("?\w+"?)', sql, re.IGNORECASE)
        order_col = order_by_match.group(2).replace('"', '') if order_by_match else None

        for step in plan:
            step_upper = step.upper()
            
            # --- Diagnostic 1: SQLite Full Scan ---
            if dialect == "sqlite" and "SCAN TABLE" in step_upper:
                match = re.search(r'SCAN TABLE "?(\w+)"?', step, re.IGNORECASE)
                table = match.group(1) if match else (referenced_tables[0] if referenced_tables else "table")
                
                # Check if we have columns in the WHERE clause we can index
                if where_columns:
                    col = where_columns[0]
                    index_name = f"idx_{table}_{col}"
                    advice.append(PerformanceAdvice(
                        type="warning",
                        message=f"Full table scan detected on table '{table}'. Query scans all rows matching filters. Suggest creating an index on column '{col}'.",
                        action_sql=f'CREATE INDEX "{index_name}" ON "{table}" ("{col}");'
                    ))
                else:
                    advice.append(PerformanceAdvice(
                        type="info",
                        message=f"Table scan on '{table}'. If this table grows large, consider adding indices to frequently filtered columns.",
                    ))
                    
            # --- Diagnostic 2: Postgres Sequential Scan ---
            elif dialect == "postgres" and "SEQ SCAN" in step_upper:
                match = re.search(r'SEQ SCAN ON "?(\w+)"?', step, re.IGNORECASE)
                table = match.group(1) if match else (referenced_tables[0] if referenced_tables else "table")
                
                if where_columns:
                    col = where_columns[0]
                    index_name = f"idx_{table}_{col}"
                    advice.append(PerformanceAdvice(
                        type="warning",
                        message=f"Sequential scan (Seq Scan) detected on '{table}'. Query filters are not indexed. Suggest index optimization.",
                        action_sql=f'CREATE INDEX "{index_name}" ON "{table}" ("{col}");'
                    ))
                else:
                    advice.append(PerformanceAdvice(
                        type="info",
                        message=f"Sequential scan on '{table}'. This is fine for small tables, but scales poorly.",
                    ))

            # --- Diagnostic 3: MySQL Full Scan ---
            elif dialect == "mysql" and "ACCESS TYPE: ALL" in step_upper:
                match = re.search(r'TABLE: "?(\w+)"?', step, re.IGNORECASE)
                table = match.group(1) if match else (referenced_tables[0] if referenced_tables else "table")
                
                if where_columns:
                    col = where_columns[0]
                    index_name = f"idx_{table}_{col}"
                    advice.append(PerformanceAdvice(
                        type="warning",
                        message=f"Full Table Scan (Access Type: ALL) on table '{table}'. No index was matched. Suggest index creation.",
                        action_sql=f'CREATE INDEX "{index_name}" ON "{table}" ("{col}");'
                    ))
                    
            # --- Diagnostic 4: Sorting Bottlenecks (Temp B-Tree / Filesort) ---
            if "TEMP B-TREE" in step_upper or "USING FILESORT" in step_upper or "Sort" in step:
                target_table = referenced_tables[0] if referenced_tables else "table"
                if order_col:
                    index_name = f"idx_{target_table}_sort_{order_col}"
                    advice.append(PerformanceAdvice(
                        type="warning",
                        message=f"Database is performing an in-memory temp sort for the ORDER BY clause. Speed this up by index-sorting column '{order_col}'.",
                        action_sql=f'CREATE INDEX "{index_name}" ON "{target_table}" ("{order_col}");'
                    ))
                else:
                    advice.append(PerformanceAdvice(
                        type="info",
                        message="Query execution path uses temporary sorting buffers. Creating indices on ORDER BY keys can avoid this sorting cost."
                    ))

        return advice
