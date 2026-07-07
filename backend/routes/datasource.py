"""
Quexy — Data Source API Routes
Manage secure file uploads and database connections.
Tracks and persists connection profiles on a per-user basis.
"""
import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List

from connectors.manager import connection_manager
from config import settings
from routes.auth import get_current_user
from database import (
    save_datasource, 
    get_user_datasources, 
    get_datasource_by_id, 
    delete_datasource
)

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


# --- Connection Profiles Catalog ---

@router.get("/saved")
async def get_saved_connections(current_user: dict = Depends(get_current_user)):
    """Fetch all saved database connection profiles for the active user account."""
    sources = get_user_datasources(current_user["user_id"])
    return {
        "success": True,
        "data": sources
    }


@router.post("/{datasource_id}/activate")
async def activate_datasource(
    datasource_id: str, 
    current_user: dict = Depends(get_current_user)
):
    """Hot-swap the active database engine to a saved user profile connection."""
    profile = get_datasource_by_id(datasource_id)
    if not profile or profile["user_id"] != current_user["user_id"]:
        raise HTTPException(
            status_code=404, 
            detail="Database connection profile not found in your catalog."
        )
        
    try:
        t = profile["type"]
        cfg = profile["config"]
        name = profile["name"]
        
        if t == "csv":
            result = connection_manager.connect_csv(cfg["file_path"], name, datasource_id=datasource_id)
        elif t == "excel":
            result = connection_manager.connect_excel(cfg["file_path"], datasource_id=datasource_id)
        elif t == "sqlite":
            result = connection_manager.connect_sqlite(cfg["file_path"], datasource_id=datasource_id)
        elif t == "postgresql":
            result = connection_manager.connect_postgresql(
                host=cfg["host"],
                port=cfg["port"],
                database=cfg["database"],
                username=cfg["username"],
                password=cfg["password"],
                datasource_id=datasource_id
            )
        elif t == "mysql":
            result = connection_manager.connect_mysql(
                host=cfg["host"],
                port=cfg["port"],
                database=cfg["database"],
                username=cfg["username"],
                password=cfg["password"],
                datasource_id=datasource_id
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported connection type: {t}")
            
        return {
            "success": True,
            "message": f"Successfully activated connection to {name}.",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to establish connection: {str(e)}")


@router.delete("/{datasource_id}")
async def remove_saved_connection(
    datasource_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a saved database profile from the catalog."""
    profile = get_datasource_by_id(datasource_id)
    if not profile or profile["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Profile not found.")
        
    delete_datasource(datasource_id)
    
    # If the active connection was deleted, disconnect the manager
    if connection_manager.active_datasource_id == datasource_id:
        connection_manager.disconnect()
        
    return {
        "success": True,
        "message": "Connection profile deleted successfully."
    }

# --- File Ingestion ---

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
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
    
    # Save profile catalog configuration first
    source_type = ext.replace(".", "")
    config_dict = {"file_path": file_path}
    datasource_id = save_datasource(current_user["user_id"], file.filename, source_type, config_dict)

    # Ingest and connect
    try:
        if ext == ".csv":
            result = connection_manager.connect_csv(file_path, datasource_id=datasource_id)
        elif ext in (".xlsx", ".xls"):
            result = connection_manager.connect_excel(file_path, datasource_id=datasource_id)
        elif ext in (".db", ".sqlite", ".sqlite3"):
            result = connection_manager.connect_sqlite(file_path, datasource_id=datasource_id)
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
        delete_datasource(datasource_id)
        raise HTTPException(status_code=400, detail=str(e))


# --- Database Connection ---

@router.post("/connect")
async def connect_database(
    request: DatabaseConnectionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Connect to a PostgreSQL or MySQL database and save profile."""
    # Save profile first
    config_dict = {
        "host": request.host,
        "port": request.port,
        "database": request.database,
        "username": request.username,
        "password": request.password,
    }
    datasource_id = save_datasource(current_user["user_id"], request.database, request.db_type, config_dict)

    try:
        if request.db_type == "postgresql":
            result = connection_manager.connect_postgresql(
                host=request.host,
                port=request.port,
                database=request.database,
                username=request.username,
                password=request.password,
                datasource_id=datasource_id
            )
        elif request.db_type == "mysql":
            result = connection_manager.connect_mysql(
                host=request.host,
                port=request.port,
                database=request.database,
                username=request.username,
                password=request.password,
                datasource_id=datasource_id
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
        delete_datasource(datasource_id)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        delete_datasource(datasource_id)
        raise HTTPException(status_code=500, detail=str(e))


# --- Status & Disconnect ---

@router.get("/status")
async def get_status(current_user: dict = Depends(get_current_user)):
    """Get the active connection status (checks user session context)."""
    # If connection is active, ensure it belongs to the current user
    if connection_manager.is_connected:
        profile = get_datasource_by_id(connection_manager.active_datasource_id)
        if not profile or profile["user_id"] != current_user["user_id"]:
            # Active connection belongs to someone else (or session cleared), disconnect it locally
            connection_manager.disconnect()
            
    return {
        "success": True,
        "data": connection_manager.get_status(),
    }


@router.delete("/disconnect")
async def disconnect(current_user: dict = Depends(get_current_user)):
    """Disconnect the current active database connection."""
    result = connection_manager.disconnect()
    return {"success": True, "message": "Disconnected successfully."}
