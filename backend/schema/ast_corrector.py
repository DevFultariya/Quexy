"""
Quexy — Programmatic AST Corrector
Walks the sqlglot AST of a generated query, compares it against the active database schema,
and programmatically corrects typos in table/column names without hitting the LLM again.
"""
import logging
import difflib
from typing import Any, Optional, Tuple

import sqlglot
from sqlglot import exp

logger = logging.getLogger(__name__)

class ASTCorrector:
    """
    Programmatically validates and corrects table/column name hallucinations in SQL queries.
    Uses AST traversal and string similarity algorithms.
    """

    def __init__(self, schema_cache: dict[str, Any]):
        """
        Initialize with schema cache from ConnectionManager.
        schema_cache shape: {table_name: {"columns": [{"name": ..., "type": ...}], "row_count": ...}}
        """
        self.schema_cache = schema_cache
        self.tables = list(schema_cache.keys())
        # Map table name to set of column names
        self.table_columns = {
            t: [col["name"] for col in info.get("columns", [])]
            for t, info in schema_cache.items()
        }

    def correct_query(self, sql: str, dialect: str = "sqlite") -> Tuple[str, bool]:
        """
        Parse SQL, walk the AST, correct typos, and return the transpiled SQL and a correction flag.
        
        Args:
            sql: Raw generated SQL string
            dialect: SQL dialect (sqlite, postgres, mysql)
            
        Returns:
            Tuple of (corrected_sql_string, was_corrected_bool)
        """
        try:
            # Parse SQL to AST
            # (fallback to base dialect if current dialect parsing throws exception)
            try:
                expression = sqlglot.parse_one(sql, read=dialect if dialect != "postgres" else "postgres")
            except Exception:
                expression = sqlglot.parse_one(sql)

            if not expression:
                return sql, False

            was_corrected = False

            # 1. First pass: Identify all table references and correct table name typos
            referenced_tables = []
            for node in expression.walk():
                if isinstance(node, exp.Table):
                    raw_table_name = node.this.name
                    # Find closest match for the table
                    correct_table_name = self._find_closest_table(raw_table_name)
                    if correct_table_name and correct_table_name != raw_table_name:
                        logger.info(f"Programmatic AST: Corrected table typo '{raw_table_name}' -> '{correct_table_name}'")
                        node.this.set("this", correct_table_name)
                        was_corrected = True
                        referenced_tables.append(correct_table_name)
                    else:
                        referenced_tables.append(raw_table_name if not correct_table_name else correct_table_name)

            # If no tables are referenced in the database, we can't map columns
            if not referenced_tables:
                referenced_tables = self.tables

            # 2. Second pass: Walk columns and correct column name typos
            for node in expression.walk():
                if isinstance(node, exp.Column):
                    raw_col_name = node.this.name
                    table_context = node.table
                    
                    # If column specifies a table (e.g. users.name), check that table specifically
                    if table_context:
                        target_tables = [self._find_closest_table(table_context) or table_context]
                    else:
                        target_tables = referenced_tables

                    # Check if the column exists in any of the target tables
                    col_found = False
                    for t in target_tables:
                        if t in self.table_columns and raw_col_name in self.table_columns[t]:
                            col_found = True
                            break

                    # If column not found, find the closest matching column name in target tables
                    if not col_found:
                        closest_col, similarity = self._find_closest_column(raw_col_name, target_tables)
                        if closest_col and closest_col != raw_col_name:
                            logger.info(
                                f"Programmatic AST: Corrected column typo '{raw_col_name}' -> '{closest_col}' "
                                f"in tables {target_tables} (similarity: {similarity:.2f})"
                            )
                            node.this.set("this", closest_col)
                            was_corrected = True

            # Transpile corrected AST back to SQL
            corrected_sql = expression.sql(dialect=dialect if dialect != "postgres" else "postgres")
            return corrected_sql, was_corrected

        except Exception as e:
            logger.error(f"Error in programmatic AST corrector: {e}", exc_info=True)
            return sql, False

    def _find_closest_table(self, name: str) -> Optional[str]:
        """Find the closest matching table name in the schema cache."""
        if not name or not self.tables:
            return None
            
        name_lower = name.lower()
        # Direct case-insensitive match
        for t in self.tables:
            if t.lower() == name_lower:
                return t
                
        # String similarity match (cutoff at 0.6)
        matches = difflib.get_close_matches(name, self.tables, n=1, cutoff=0.6)
        if matches:
            return matches[0]
            
        # Try matching without underscores or common prefixes
        name_clean = name_lower.replace("_", "").replace("-", "")
        for t in self.tables:
            t_clean = t.lower().replace("_", "").replace("-", "")
            if t_clean == name_clean:
                return t
                
        return None

    def _find_closest_column(self, name: str, tables: list[str]) -> Tuple[Optional[str], float]:
        """Find the closest matching column name in the specified tables."""
        if not name or not tables:
            return None, 0.0
            
        name_lower = name.lower()
        all_possible_columns = []
        for t in tables:
            if t in self.table_columns:
                all_possible_columns.extend(self.table_columns[t])
                
        if not all_possible_columns:
            return None, 0.0

        # Remove duplicate column names
        all_possible_columns = list(set(all_possible_columns))

        # Direct case-insensitive match
        for col in all_possible_columns:
            if col.lower() == name_lower:
                return col, 1.0
                
        # String similarity match
        matches = difflib.get_close_matches(name, all_possible_columns, n=1, cutoff=0.5)
        if matches:
            closest = matches[0]
            # Compute ratio
            ratio = difflib.SequenceMatcher(None, name, closest).ratio()
            return closest, ratio
            
        # Try matching cleaning underscores/caps
        name_clean = name_lower.replace("_", "").replace("-", "")
        for col in all_possible_columns:
            col_clean = col.lower().replace("_", "").replace("-", "")
            if col_clean == name_clean:
                return col, 0.9
                
        return None, 0.0
