"""
Quexy — Schema Data Models
Pydantic models for representing database schema information.
"""
from pydantic import BaseModel
from typing import Any


class ColumnSchema(BaseModel):
    """Schema information for a single column."""
    name: str
    type: str
    nullable: bool = True
    primary_key: bool = False
    default: Any = None


class TableSchema(BaseModel):
    """Schema information for a single table."""
    name: str
    columns: list[ColumnSchema]
    row_count: int | str = 0
    sample_values: list[dict[str, Any]] = []


class RelationshipInfo(BaseModel):
    """Foreign key relationship between tables."""
    from_table: str
    from_column: str
    to_table: str
    to_column: str


class SchemaProfile(BaseModel):
    """Complete schema profile of a connected data source."""
    source_name: str
    source_type: str
    dialect: str
    tables: list[TableSchema]
    relationships: list[RelationshipInfo] = []
    total_tables: int = 0
    total_rows: int = 0
