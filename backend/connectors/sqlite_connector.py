"""
Quexy — SQLite Connector
Connects directly to a SQLite database file.
"""
import sqlite3
import os
from typing import Any

from connectors.base import DataSourceConnector


class SQLiteConnector(DataSourceConnector):
    """Connects to a SQLite database file."""
    
    def __init__(self):
        super().__init__()
        self.dialect = "sqlite"
        self.source_type = "sqlite"
        self.db_connection: sqlite3.Connection | None = None
    
    def connect(self, file_path: str, **kwargs) -> bool:
        """
        Connect to a SQLite database file.
        
        Args:
            file_path: Path to the .db or .sqlite file
        """
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Database file not found: {file_path}")
            
            self.db_connection = sqlite3.connect(file_path, check_same_thread=False)
            self.db_connection.row_factory = sqlite3.Row
            
            # Verify it's a valid SQLite database
            cursor = self.db_connection.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = cursor.fetchall()
            
            if not tables:
                raise ConnectionError("Database contains no tables.")
            
            self.source_name = os.path.basename(file_path)
            self.is_connected = True
            self.connection = self.db_connection
            
            return True
            
        except sqlite3.DatabaseError as e:
            self.is_connected = False
            raise ConnectionError(f"Invalid SQLite database: {str(e)}")
        except Exception as e:
            self.is_connected = False
            raise ConnectionError(f"Failed to connect to SQLite database: {str(e)}")
    
    def disconnect(self) -> None:
        """Close the SQLite connection."""
        if self.db_connection:
            self.db_connection.close()
            self.db_connection = None
        self.is_connected = False
        self.connection = None
    
    def test_connection(self) -> bool:
        """Test if the database connection is alive."""
        if not self.db_connection:
            return False
        try:
            cursor = self.db_connection.cursor()
            cursor.execute("SELECT 1")
            return True
        except Exception:
            return False
    
    def execute_query(self, sql: str) -> list[dict[str, Any]]:
        """Execute SQL query against the SQLite database."""
        if not self.db_connection:
            raise ConnectionError("No active connection.")
        
        try:
            cursor = self.db_connection.cursor()
            cursor.execute(sql)
            columns = [description[0] for description in cursor.description] if cursor.description else []
            rows = cursor.fetchall()
            return [dict(zip(columns, row)) for row in rows]
        except Exception as e:
            raise RuntimeError(f"Query execution failed: {str(e)}")
    
    def get_tables(self) -> list[str]:
        """Return list of all tables in the database."""
        if not self.db_connection:
            return []
        cursor = self.db_connection.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
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
