"""
Quexy — Connection Manager
Singleton that manages the active data source connection.
Stores schema cache and provides a unified interface to the connected data source.
"""
from typing import Any

from connectors.base import DataSourceConnector
from connectors.csv_connector import CSVConnector
from connectors.excel_connector import ExcelConnector
from connectors.sqlite_connector import SQLiteConnector
from connectors.postgres_connector import PostgreSQLConnector
from connectors.mysql_connector import MySQLConnector


class ConnectionManager:
    """
    Manages the active data source connection.
    Only one data source can be connected at a time.
    """
    
    def __init__(self):
        self.connector: DataSourceConnector | None = None
        self.schema_cache: dict[str, Any] = {}
        self.active_datasource_id: str | None = None
    
    @property
    def is_connected(self) -> bool:
        return self.connector is not None and self.connector.is_connected
    
    def connect_csv(self, file_path: str, table_name: str | None = None, datasource_id: str | None = None) -> dict:
        """Connect a CSV file."""
        self._disconnect_existing()
        connector = CSVConnector()
        connector.connect(file_path=file_path, table_name=table_name)
        self.connector = connector
        self.active_datasource_id = datasource_id
        self._cache_schema()
        return self.get_status()
    
    def connect_excel(self, file_path: str, datasource_id: str | None = None) -> dict:
        """Connect an Excel file."""
        self._disconnect_existing()
        connector = ExcelConnector()
        connector.connect(file_path=file_path)
        self.connector = connector
        self.active_datasource_id = datasource_id
        self._cache_schema()
        return self.get_status()
    
    def connect_sqlite(self, file_path: str, datasource_id: str | None = None) -> dict:
        """Connect a SQLite database file."""
        self._disconnect_existing()
        connector = SQLiteConnector()
        connector.connect(file_path=file_path)
        self.connector = connector
        self.active_datasource_id = datasource_id
        self._cache_schema()
        return self.get_status()
    
    def connect_postgresql(self, host: str, port: int, database: str, username: str, password: str, datasource_id: str | None = None) -> dict:
        """Connect to a PostgreSQL database."""
        self._disconnect_existing()
        connector = PostgreSQLConnector()
        connector.connect(host=host, port=port, database=database, username=username, password=password)
        self.connector = connector
        self.active_datasource_id = datasource_id
        self._cache_schema()
        return self.get_status()
    
    def connect_mysql(self, host: str, port: int, database: str, username: str, password: str, datasource_id: str | None = None) -> dict:
        """Connect to a MySQL database."""
        self._disconnect_existing()
        connector = MySQLConnector()
        connector.connect(host=host, port=port, database=database, username=username, password=password)
        self.connector = connector
        self.active_datasource_id = datasource_id
        self._cache_schema()
        return self.get_status()
    
    def disconnect(self) -> dict:
        """Disconnect the current data source."""
        self._disconnect_existing()
        return {"success": True, "message": "Disconnected successfully."}
    
    def execute_query(self, sql: str) -> list[dict[str, Any]]:
        """Execute a query on the active connection."""
        if not self.is_connected:
            raise ConnectionError("No data source connected.")
        return self.connector.execute_query(sql)
    
    def get_dialect(self) -> str:
        """Get the SQL dialect of the active connection."""
        if not self.connector:
            return "sqlite"
        return self.connector.get_dialect()
    
    def get_status(self) -> dict:
        """Get current connection status with schema summary."""
        if not self.is_connected:
            return {
                "connected": False,
                "source_name": None,
                "source_type": None,
                "tables": [],
            }
        
        return {
            "connected": True,
            "source_name": self.connector.source_name,
            "source_type": self.connector.source_type,
            "dialect": self.connector.dialect,
            "tables": self._get_table_summaries(),
        }
    
    def get_schema_context(self) -> str:
        """
        Generate a formatted schema context string for the AI pipeline.
        This is what gets injected into the LLM prompt.
        """
        if not self.is_connected or not self.schema_cache:
            return "No database connected."
        
        lines = ["DATABASE SCHEMA:"]
        lines.append(f"Database Type: {self.connector.dialect.upper()}")
        lines.append("")
        
        for table_name, table_info in self.schema_cache.items():
            lines.append(f"TABLE: {table_name}")
            lines.append(f"  Row Count: {table_info.get('row_count', 'unknown')}")
            lines.append("  Columns:")
            
            for col in table_info.get("columns", []):
                pk_marker = " [PRIMARY KEY]" if col.get("primary_key") else ""
                nullable = " (nullable)" if col.get("nullable") else ""
                lines.append(f"    - {col['name']}: {col['type']}{pk_marker}{nullable}")
            
            # Add sample values for context
            if table_info.get("sample_values"):
                lines.append("  Sample Values (first 3 rows):")
                for i, sample in enumerate(table_info["sample_values"][:3]):
                    lines.append(f"    Row {i + 1}: {sample}")
            
            lines.append("")
        
        return "\n".join(lines)
    
    def _disconnect_existing(self) -> None:
        """Disconnect any existing connection."""
        if self.connector and self.connector.is_connected:
            self.connector.disconnect()
        self.connector = None
        self.schema_cache = {}
        self.active_datasource_id = None
    
    def _cache_schema(self) -> None:
        """Cache the schema of all tables for AI context."""
        if not self.is_connected:
            return
        
        self.schema_cache = {}
        tables = self.connector.get_tables()
        
        for table_name in tables:
            columns = self.connector.get_table_schema(table_name)
            
            # Get row count
            try:
                result = self.connector.execute_query(f"SELECT COUNT(*) as cnt FROM \"{table_name}\"")
                row_count = result[0]["cnt"] if result else 0
            except Exception:
                row_count = "unknown"
            
            # Get sample values
            try:
                sample_result = self.connector.execute_query(
                    f"SELECT * FROM \"{table_name}\" LIMIT 5"
                )
                sample_values = sample_result[:5]
            except Exception:
                sample_values = []
            
            self.schema_cache[table_name] = {
                "columns": columns,
                "row_count": row_count,
                "sample_values": sample_values,
            }
    
    def _get_table_summaries(self) -> list[dict]:
        """Get a summary of all tables for the status endpoint."""
        summaries = []
        for table_name, table_info in self.schema_cache.items():
            summaries.append({
                "name": table_name,
                "columns": len(table_info.get("columns", [])),
                "rows": table_info.get("row_count", 0),
                "column_names": [c["name"] for c in table_info.get("columns", [])],
            })
        return summaries


# Singleton instance
connection_manager = ConnectionManager()
