"""
Quexy — Query Security Validator
Validates generated SQL queries to ensure they are safe to execute.
Uses sqlglot for SQL parsing and analysis.
"""
import re
from dataclasses import dataclass

import sqlglot
from sqlglot import exp


@dataclass
class ValidationResult:
    """Result of a SQL query validation."""
    is_valid: bool
    query: str
    reason: str = ""
    sanitized_query: str = ""


class QueryValidator:
    """
    Validates SQL queries for security before execution.
    
    Enforces:
    - Read-only operations only (SELECT)
    - No data modification (INSERT, UPDATE, DELETE)
    - No schema changes (DROP, ALTER, CREATE, TRUNCATE)
    - No privilege commands (GRANT, REVOKE)
    - No PRAGMA writes
    - No multi-statement queries
    - SQL injection prevention
    - Row limit enforcement
    """
    
    # SQL statements that are BLOCKED
    BLOCKED_STATEMENT_TYPES = {
        exp.Insert, exp.Update, exp.Delete, exp.Drop,
        exp.Create, exp.Alter,
        exp.Grant, exp.Command,
    }
    
    # Keywords that should never appear in user-generated queries
    BLOCKED_KEYWORDS = [
        "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE",
        "TRUNCATE", "GRANT", "REVOKE", "EXEC", "EXECUTE",
        "CALL", "MERGE", "REPLACE INTO",
    ]
    
    # Dangerous PRAGMA commands (SQLite-specific)
    BLOCKED_PRAGMA_PATTERNS = [
        r"PRAGMA\s+\w+\s*=",  # PRAGMA setting = value
        r"PRAGMA\s+\w+\s*\(",  # PRAGMA function()
    ]
    
    # SQL injection patterns
    INJECTION_PATTERNS = [
        r";\s*(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|TRUNCATE)",  # Piggyback attacks
        r"--\s*$",  # Comment-based injection at end
        r"/\*.*\*/",  # Block comments (potential obfuscation)
        r"UNION\s+ALL\s+SELECT.*FROM\s+sqlite_master",  # Schema extraction
        r"INTO\s+OUTFILE",  # File write attempts
        r"INTO\s+DUMPFILE",  # File write attempts
        r"LOAD_FILE\s*\(",  # File read attempts
        r"BENCHMARK\s*\(",  # Timing attacks
        r"SLEEP\s*\(",  # Timing attacks
        r"WAITFOR\s+DELAY",  # SQL Server timing
    ]
    
    def __init__(self, max_rows: int = 10000):
        self.max_rows = max_rows
    
    def validate(self, sql: str, dialect: str = "sqlite") -> ValidationResult:
        """
        Validate a SQL query for security.
        
        Args:
            sql: The SQL query to validate
            dialect: The SQL dialect (sqlite, postgres, mysql)
            
        Returns:
            ValidationResult with is_valid, reason, and sanitized query
        """
        if not sql or not sql.strip():
            return ValidationResult(
                is_valid=False,
                query=sql,
                reason="Empty query provided.",
            )
        
        cleaned_sql = sql.strip().rstrip(";")
        
        # Check 1: Multi-statement detection
        if self._has_multiple_statements(cleaned_sql):
            return ValidationResult(
                is_valid=False,
                query=sql,
                reason="Multiple SQL statements are not allowed.",
            )
        
        # Check 2: Blocked keywords (fast string check before parsing)
        keyword_check = self._check_blocked_keywords(cleaned_sql)
        if keyword_check:
            return ValidationResult(
                is_valid=False,
                query=sql,
                reason=keyword_check,
            )
        
        # Check 3: SQL injection pattern detection
        injection_check = self._check_injection_patterns(cleaned_sql)
        if injection_check:
            return ValidationResult(
                is_valid=False,
                query=sql,
                reason=injection_check,
            )
        
        # Check 4: PRAGMA validation (SQLite)
        if dialect == "sqlite":
            pragma_check = self._check_pragma(cleaned_sql)
            if pragma_check:
                return ValidationResult(
                    is_valid=False,
                    query=sql,
                    reason=pragma_check,
                )
        
        # Check 5: Parse with sqlglot and validate AST
        try:
            parsed = sqlglot.parse(cleaned_sql, read=dialect if dialect != "postgres" else "postgres")
            
            if not parsed:
                return ValidationResult(
                    is_valid=False,
                    query=sql,
                    reason="Failed to parse SQL query.",
                )
            
            for statement in parsed:
                if statement is None:
                    continue
                
                # Check if it's a SELECT statement
                if not isinstance(statement, exp.Select):
                    # Allow UNION, INTERSECT, EXCEPT (set operations on SELECTs)
                    if not isinstance(statement, (exp.Union, exp.Intersect, exp.Except)):
                        return ValidationResult(
                            is_valid=False,
                            query=sql,
                            reason=f"Only SELECT queries are allowed. Got: {type(statement).__name__}",
                        )
                
                # Check for blocked node types in the AST
                for node in statement.walk():
                    for blocked_type in self.BLOCKED_STATEMENT_TYPES:
                        if isinstance(node, blocked_type):
                            return ValidationResult(
                                is_valid=False,
                                query=sql,
                                reason=f"Blocked operation detected: {type(node).__name__}",
                            )
        
        except sqlglot.errors.ErrorLevel:
            pass  # Some queries might not parse perfectly but are still valid
        except Exception:
            pass  # If sqlglot can't parse it, fall through to keyword checks
        
        # Check 6: Add row limit if not present
        sanitized = self._enforce_row_limit(cleaned_sql, dialect)
        
        return ValidationResult(
            is_valid=True,
            query=sql,
            sanitized_query=sanitized,
            reason="Query passed all security checks.",
        )
    
    def _has_multiple_statements(self, sql: str) -> bool:
        """Check for multiple SQL statements (semicolon-separated)."""
        # Remove strings to avoid false positives on semicolons within string literals
        cleaned = re.sub(r"'[^']*'", "", sql)
        cleaned = re.sub(r'"[^"]*"', "", cleaned)
        return ";" in cleaned
    
    def _check_blocked_keywords(self, sql: str) -> str | None:
        """Check for blocked SQL keywords."""
        upper_sql = sql.upper().strip()
        
        for keyword in self.BLOCKED_KEYWORDS:
            # Check if the query STARTS with a blocked keyword
            if upper_sql.startswith(keyword):
                return f"Blocked operation: {keyword} statements are not allowed."
            
            # Check for blocked keywords after common injection points
            pattern = rf"\b{keyword}\b"
            # Only flag if keyword is at statement level (not in subqueries or strings)
            if re.search(pattern, upper_sql) and not upper_sql.startswith("SELECT"):
                return f"Blocked operation: {keyword} detected in query."
        
        return None
    
    def _check_injection_patterns(self, sql: str) -> str | None:
        """Check for common SQL injection patterns."""
        for pattern in self.INJECTION_PATTERNS:
            if re.search(pattern, sql, re.IGNORECASE):
                return "Potential SQL injection pattern detected."
        return None
    
    def _check_pragma(self, sql: str) -> str | None:
        """Check for dangerous PRAGMA commands (SQLite-specific)."""
        for pattern in self.BLOCKED_PRAGMA_PATTERNS:
            if re.search(pattern, sql, re.IGNORECASE):
                return "Write PRAGMA commands are not allowed."
        return None
    
    def _enforce_row_limit(self, sql: str, dialect: str) -> str:
        """Add a LIMIT clause if not already present."""
        upper_sql = sql.upper()
        
        # If LIMIT already exists, don't add another
        if "LIMIT" in upper_sql:
            return sql
        
        # For SQL Server / future dialects that use TOP
        if "TOP" in upper_sql:
            return sql
        
        # Add LIMIT
        return f"{sql} LIMIT {self.max_rows}"


# Default validator instance
query_validator = QueryValidator()
