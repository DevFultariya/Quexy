"""
Quexy — Abstract Base Connector
All data source connectors inherit from this base class.
"""
from abc import ABC, abstractmethod
from typing import Any


class DataSourceConnector(ABC):
    """Abstract base class for all data source connectors."""
    
    def __init__(self):
        self.connection = None
        self.dialect: str = "sqlite"  # Default SQL dialect
        self.is_connected: bool = False
        self.source_name: str = ""
        self.source_type: str = ""
    
    @abstractmethod
    def connect(self, **kwargs) -> bool:
        """Establish connection to the data source. Returns True on success."""
        pass
    
    @abstractmethod
    def disconnect(self) -> None:
        """Close the connection and clean up resources."""
        pass
    
    @abstractmethod
    def test_connection(self) -> bool:
        """Test if the connection is alive and valid."""
        pass
    
    @abstractmethod
    def execute_query(self, sql: str) -> list[dict[str, Any]]:
        """
        Execute a SQL query and return results as a list of dicts.
        Each dict represents one row: {column_name: value}
        """
        pass
    
    @abstractmethod
    def get_tables(self) -> list[str]:
        """Return a list of all table names in the data source."""
        pass
    
    @abstractmethod
    def get_table_schema(self, table_name: str) -> list[dict[str, Any]]:
        """
        Return schema info for a specific table.
        Each dict: {name, type, nullable, primary_key, default}
        """
        pass
    
    def get_dialect(self) -> str:
        """Return the SQL dialect for this connector."""
        return self.dialect
    
    def get_info(self) -> dict:
        """Return connection info summary."""
        return {
            "source_name": self.source_name,
            "source_type": self.source_type,
            "dialect": self.dialect,
            "is_connected": self.is_connected,
        }
