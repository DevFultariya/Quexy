"""
Quexy — Data Source API Routes
Endpoints for connecting, uploading, and managing data sources.
"""
import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional

from connectors.manager import connection_manager
from config import settings

router = APIRouter()


# --- Request Models ---

class DatabaseConnectionRequest(BaseModel):
    """Request body for database connection."""
    db_type: str  # "postgresql" or "mysql"
    host: str
    port: int
    database: str
    username: str
    password: str


# --- File Upload Endpoints ---

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a CSV, Excel, or SQLite file as a data source.
    The file is saved to disk and loaded into the query engine.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")
    
    # Validate file extension
    _, ext = os.path.splitext(file.filename)
    ext = ext.lower()
    
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )
    
    # Save file to uploads directory
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            
            # Check file size
            if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE_MB}MB",
                )
            
            f.write(content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Connect based on file type
    try:
        if ext == ".csv":
            result = connection_manager.connect_csv(file_path)
        elif ext in (".xlsx", ".xls"):
            result = connection_manager.connect_excel(file_path)
        elif ext in (".db", ".sqlite", ".sqlite3"):
            result = connection_manager.connect_sqlite(file_path)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
        
        return {
            "success": True,
            "message": f"Successfully connected to {file.filename}",
            "data": result,
        }
    
    except Exception as e:
        # Clean up file on failure
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=str(e))


# --- Database Connection Endpoints ---

@router.post("/connect")
async def connect_database(request: DatabaseConnectionRequest):
    """Connect to a PostgreSQL or MySQL database."""
    try:
        if request.db_type == "postgresql":
            result = connection_manager.connect_postgresql(
                host=request.host,
                port=request.port,
                database=request.database,
                username=request.username,
                password=request.password,
            )
        elif request.db_type == "mysql":
            result = connection_manager.connect_mysql(
                host=request.host,
                port=request.port,
                database=request.database,
                username=request.username,
                password=request.password,
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported database type: {request.db_type}. Use 'postgresql' or 'mysql'.",
            )
        
        return {
            "success": True,
            "message": f"Successfully connected to {request.db_type} database.",
            "data": result,
        }
    
    except ConnectionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Status & Management ---

@router.get("/status")
async def get_status():
    """Get the current data source connection status."""
    return {
        "success": True,
        "data": connection_manager.get_status(),
    }


@router.get("/schema")
async def get_schema():
    """Get the schema of the connected data source."""
    if not connection_manager.is_connected:
        raise HTTPException(status_code=400, detail="No data source connected.")
    
    status = connection_manager.get_status()
    return {
        "success": True,
        "data": {
            "source_name": status["source_name"],
            "source_type": status["source_type"],
            "dialect": status.get("dialect", "sqlite"),
            "tables": status["tables"],
        },
    }


@router.delete("/disconnect")
async def disconnect():
    """Disconnect the current data source."""
    result = connection_manager.disconnect()
    return {"success": True, "message": "Disconnected successfully."}
