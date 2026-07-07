"""
Quexy — CSV Connector
Loads CSV files into an in-memory SQLite database for uniform SQL querying.
"""
import sqlite3
import os
from typing import Any

import pandas as pd

from connectors.base import DataSourceConnector


class CSVConnector(DataSourceConnector):
    """Connects a CSV file by loading it into an in-memory SQLite database."""
    
    def __init__(self):
        super().__init__()
        self.dialect = "sqlite"
        self.source_type = "csv"
        self.db_connection: sqlite3.Connection | None = None
        self.table_name: str = ""
    
    def connect(self, file_path: str, table_name: str | None = None, **kwargs) -> bool:
        """
        Load a CSV file into an in-memory SQLite database.
        
        Args:
            file_path: Path to the CSV file
            table_name: Optional custom table name (defaults to filename without extension)
        """
        try:
            # Read CSV with pandas (auto-detects delimiter, encoding)
            df = pd.read_csv(file_path, encoding="utf-8")
            
            # Clean column names: remove spaces, special chars
            df.columns = [
                col.strip()
                .replace(" ", "_")
                .replace("-", "_")
                .replace("(", "")
                .replace(")", "")
                .replace("/", "_")
                .lower()
                for col in df.columns
            ]
            
            # Determine table name from filename
            if table_name:
                base_name, _ = os.path.splitext(table_name)
                self.table_name = (
                    base_name.strip()
                    .replace(" ", "_")
                    .replace("-", "_")
                    .lower()
                )
            else:
                self.table_name = (
                    os.path.splitext(os.path.basename(file_path))[0]
                    .strip()
                    .replace(" ", "_")
                    .replace("-", "_")
                    .lower()
                )
            
            # Create in-memory SQLite database
            self.db_connection = sqlite3.connect(":memory:", check_same_thread=False)
            self.db_connection.row_factory = sqlite3.Row
            
            # Load DataFrame into SQLite
            df.to_sql(self.table_name, self.db_connection, index=False, if_exists="replace")
            
            self.source_name = os.path.basename(file_path)
            self.is_connected = True
            self.connection = self.db_connection
            
            return True
            
        except Exception as e:
            self.is_connected = False
            raise ConnectionError(f"Failed to load CSV: {str(e)}")
    
    def disconnect(self) -> None:
        """Close the SQLite connection."""
        if self.db_connection:
            self.db_connection.close()
            self.db_connection = None
        self.is_connected = False
        self.connection = None
    
    def test_connection(self) -> bool:
        """Test if the in-memory database is accessible."""
        if not self.db_connection:
            return False
        try:
            cursor = self.db_connection.cursor()
            cursor.execute("SELECT 1")
            return True
        except Exception:
            return False
    
    def execute_query(self, sql: str) -> list[dict[str, Any]]:
        """Execute SQL query against the in-memory SQLite database."""
        if not self.db_connection:
            raise ConnectionError("No active connection. Load a CSV file first.")
        
        try:
            cursor = self.db_connection.cursor()
            cursor.execute(sql)
            columns = [description[0] for description in cursor.description] if cursor.description else []
            rows = cursor.fetchall()
            return [dict(zip(columns, row)) for row in rows]
        except Exception as e:
            raise RuntimeError(f"Query execution failed: {str(e)}")
    
    def get_tables(self) -> list[str]:
        """Return list of tables (for CSV, it's always one table)."""
        if not self.db_connection:
            return []
        cursor = self.db_connection.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        return [row[0] for row in cursor.fetchall()]
    
    def get_table_schema(self, table_name: str) -> list[dict[str, Any]]:
        """Return schema info for the specified table."""
        if not self.db_connection:
            return []
        cursor = self.db_connection.cursor()
        cursor.execute(f"PRAGMA table_info('{table_name}')")
        columns = cursor.fetchall()
        return [
            {
                "name": col[1],
                "type": col[2] or "TEXT",
                "nullable": not col[3],
                "primary_key": bool(col[5]),
                "default": col[4],
            }
            for col in columns
        ]
