"""
Quexy — Schema Analyzer
Extracts and analyzes database schema from a connected data source.
"""
from typing import Any

from schema.models import ColumnSchema, TableSchema, SchemaProfile, RelationshipInfo
from connectors.base import DataSourceConnector


class SchemaAnalyzer:
    """Analyzes a connected data source and produces a SchemaProfile."""
    
    def __init__(self, connector: DataSourceConnector):
        self.connector = connector
    
    def analyze(self) -> SchemaProfile:
        """
        Perform full schema analysis of the connected data source.
        Returns a SchemaProfile with all tables, columns, stats, and relationships.
        """
        tables = self.connector.get_tables()
        table_schemas = []
        total_rows = 0
        
        for table_name in tables:
            table_schema = self._analyze_table(table_name)
            table_schemas.append(table_schema)
            if isinstance(table_schema.row_count, int):
                total_rows += table_schema.row_count
        
        # Detect relationships (for databases that support foreign keys)
        relationships = self._detect_relationships(tables)
        
        return SchemaProfile(
            source_name=self.connector.source_name,
            source_type=self.connector.source_type,
            dialect=self.connector.dialect,
            tables=table_schemas,
            relationships=relationships,
            total_tables=len(table_schemas),
            total_rows=total_rows,
        )
    
    def _analyze_table(self, table_name: str) -> TableSchema:
        """Analyze a single table and return its schema."""
        # Get column info
        raw_columns = self.connector.get_table_schema(table_name)
        columns = [
            ColumnSchema(
                name=col["name"],
                type=col.get("type", "TEXT"),
                nullable=col.get("nullable", True),
                primary_key=col.get("primary_key", False),
                default=col.get("default"),
            )
            for col in raw_columns
        ]
        
        # Get row count
        try:
            result = self.connector.execute_query(f'SELECT COUNT(*) as cnt FROM "{table_name}"')
            row_count = result[0]["cnt"] if result else 0
        except Exception:
            row_count = 0
        
        # Get sample values (first 5 rows)
        try:
            sample_values = self.connector.execute_query(
                f'SELECT * FROM "{table_name}" LIMIT 5'
            )
        except Exception:
            sample_values = []
        
        return TableSchema(
            name=table_name,
            columns=columns,
            row_count=row_count,
            sample_values=sample_values,
        )
    
    def _detect_relationships(self, tables: list[str]) -> list[RelationshipInfo]:
        """
        Detect foreign key relationships between tables.
        Works for SQLite and PostgreSQL; MySQL uses a different approach.
        """
        relationships = []
        dialect = self.connector.get_dialect()
        
        try:
            if dialect == "sqlite":
                for table_name in tables:
                    try:
                        result = self.connector.execute_query(
                            f"PRAGMA foreign_key_list('{table_name}')"
                        )
                        for fk in result:
                            relationships.append(RelationshipInfo(
                                from_table=table_name,
                                from_column=fk.get("from", ""),
                                to_table=fk.get("table", ""),
                                to_column=fk.get("to", ""),
                            ))
                    except Exception:
                        continue
            
            elif dialect == "postgres":
                fk_query = """
                    SELECT
                        tc.table_name as from_table,
                        kcu.column_name as from_column,
                        ccu.table_name as to_table,
                        ccu.column_name as to_column
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                    JOIN information_schema.constraint_column_usage ccu
                        ON ccu.constraint_name = tc.constraint_name
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                """
                result = self.connector.execute_query(fk_query)
                for fk in result:
                    relationships.append(RelationshipInfo(
                        from_table=fk["from_table"],
                        from_column=fk["from_column"],
                        to_table=fk["to_table"],
                        to_column=fk["to_column"],
                    ))
            
            elif dialect == "mysql":
                fk_query = """
                    SELECT 
                        TABLE_NAME as from_table,
                        COLUMN_NAME as from_column,
                        REFERENCED_TABLE_NAME as to_table,
                        REFERENCED_COLUMN_NAME as to_column
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                    WHERE REFERENCED_TABLE_NAME IS NOT NULL
                        AND TABLE_SCHEMA = DATABASE()
                """
                result = self.connector.execute_query(fk_query)
                for fk in result:
                    relationships.append(RelationshipInfo(
                        from_table=fk["from_table"],
                        from_column=fk["from_column"],
                        to_table=fk["to_table"],
                        to_column=fk["to_column"],
                    ))
        
        except Exception:
            pass  # Relationships are optional enrichment
        
        return relationships
