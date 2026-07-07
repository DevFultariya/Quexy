"""
Quexy — PostgreSQL Connector
Connects to a PostgreSQL database using psycopg2.
"""
from typing import Any

from connectors.base import DataSourceConnector


class PostgreSQLConnector(DataSourceConnector):
    """Connects to a PostgreSQL database."""
    
    def __init__(self):
        super().__init__()
        self.dialect = "postgres"
        self.source_type = "postgresql"
        self.db_connection = None
    
    def connect(self, host: str, port: int, database: str, username: str, password: str, **kwargs) -> bool:
        """
        Connect to a PostgreSQL database.
        
        Args:
            host: Database host
            port: Database port (default 5432)
            database: Database name
            username: Database username
            password: Database password
        """
        try:
            import psycopg2
            import psycopg2.extras
            
            self.db_connection = psycopg2.connect(
                host=host,
                port=port,
                database=database,
                user=username,
                password=password,
                connect_timeout=10,
            )
            # Use RealDictCursor for dict-like row access
            self.db_connection.autocommit = True
            
            self.source_name = f"{database}@{host}:{port}"
            self.is_connected = True
            self.connection = self.db_connection
            
            return True
            
        except Exception as e:
            self.is_connected = False
            raise ConnectionError(f"Failed to connect to PostgreSQL: {str(e)}")
    
    def disconnect(self) -> None:
        """Close the PostgreSQL connection."""
        if self.db_connection:
            self.db_connection.close()
            self.db_connection = None
        self.is_connected = False
        self.connection = None
    
    def test_connection(self) -> bool:
        """Test if the PostgreSQL connection is alive."""
        if not self.db_connection:
            return False
        try:
            cursor = self.db_connection.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            return True
        except Exception:
            return False
    
    def execute_query(self, sql: str) -> list[dict[str, Any]]:
        """Execute SQL query against PostgreSQL."""
        if not self.db_connection:
            raise ConnectionError("No active PostgreSQL connection.")
        
        try:
            import psycopg2.extras
            cursor = self.db_connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute(sql)
            rows = cursor.fetchall()
            cursor.close()
            return [dict(row) for row in rows]
        except Exception as e:
            raise RuntimeError(f"Query execution failed: {str(e)}")
    
    def get_tables(self) -> list[str]:
        """Return list of all tables in the public schema."""
        if not self.db_connection:
            return []
        try:
            cursor = self.db_connection.cursor()
            cursor.execute("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """)
            tables = [row[0] for row in cursor.fetchall()]
            cursor.close()
            return tables
        except Exception:
            return []
    
    def get_table_schema(self, table_name: str) -> list[dict[str, Any]]:
        """Return schema info for a PostgreSQL table."""
        if not self.db_connection:
            return []
        try:
            cursor = self.db_connection.cursor()
            cursor.execute("""
                SELECT 
                    c.column_name,
                    c.data_type,
                    c.is_nullable,
                    c.column_default,
                    CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
                FROM information_schema.columns c
                LEFT JOIN (
                    SELECT ku.column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage ku 
                        ON tc.constraint_name = ku.constraint_name
                    WHERE tc.constraint_type = 'PRIMARY KEY' 
                        AND tc.table_name = %s
                ) pk ON c.column_name = pk.column_name
                WHERE c.table_name = %s AND c.table_schema = 'public'
                ORDER BY c.ordinal_position
            """, (table_name, table_name))
            
            columns = cursor.fetchall()
            cursor.close()
            
            return [
                {
                    "name": col[0],
                    "type": col[1].upper(),
                    "nullable": col[2] == "YES",
                    "default": col[3],
                    "primary_key": col[4],
                }
                for col in columns
            ]
        except Exception:
            return []
