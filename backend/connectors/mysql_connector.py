"""
Quexy — MySQL Connector
Connects to a MySQL database using mysql-connector-python.
"""
from typing import Any

from connectors.base import DataSourceConnector


class MySQLConnector(DataSourceConnector):
    """Connects to a MySQL database."""
    
    def __init__(self):
        super().__init__()
        self.dialect = "mysql"
        self.source_type = "mysql"
        self.db_connection = None
    
    def connect(self, host: str, port: int, database: str, username: str, password: str, **kwargs) -> bool:
        """
        Connect to a MySQL database.
        
        Args:
            host: Database host
            port: Database port (default 3306)
            database: Database name
            username: Database username
            password: Database password
        """
        try:
            import mysql.connector
            
            self.db_connection = mysql.connector.connect(
                host=host,
                port=port,
                database=database,
                user=username,
                password=password,
                connection_timeout=10,
            )
            
            self.source_name = f"{database}@{host}:{port}"
            self.is_connected = True
            self.connection = self.db_connection
            
            return True
            
        except Exception as e:
            self.is_connected = False
            raise ConnectionError(f"Failed to connect to MySQL: {str(e)}")
    
    def disconnect(self) -> None:
        """Close the MySQL connection."""
        if self.db_connection:
            self.db_connection.close()
            self.db_connection = None
        self.is_connected = False
        self.connection = None
    
    def test_connection(self) -> bool:
        """Test if the MySQL connection is alive."""
        if not self.db_connection:
            return False
        try:
            cursor = self.db_connection.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchall()
            cursor.close()
            return True
        except Exception:
            return False
    
    def execute_query(self, sql: str) -> list[dict[str, Any]]:
        """Execute SQL query against MySQL."""
        if not self.db_connection:
            raise ConnectionError("No active MySQL connection.")
        
        try:
            cursor = self.db_connection.cursor(dictionary=True)
            cursor.execute(sql)
            rows = cursor.fetchall()
            cursor.close()
            return [dict(row) for row in rows]
        except Exception as e:
            raise RuntimeError(f"Query execution failed: {str(e)}")
    
    def get_tables(self) -> list[str]:
        """Return list of all tables in the database."""
        if not self.db_connection:
            return []
        try:
            cursor = self.db_connection.cursor()
            cursor.execute("SHOW TABLES")
            tables = [row[0] for row in cursor.fetchall()]
            cursor.close()
            return tables
        except Exception:
            return []
    
    def get_table_schema(self, table_name: str) -> list[dict[str, Any]]:
        """Return schema info for a MySQL table."""
        if not self.db_connection:
            return []
        try:
            cursor = self.db_connection.cursor()
            cursor.execute(f"DESCRIBE `{table_name}`")
            columns = cursor.fetchall()
            cursor.close()
            
            return [
                {
                    "name": col[0],
                    "type": col[1].upper() if col[1] else "TEXT",
                    "nullable": col[2] == "YES",
                    "default": col[4],
                    "primary_key": col[3] == "PRI",
                }
                for col in columns
            ]
        except Exception:
            return []
