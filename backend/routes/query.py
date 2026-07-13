"""
Quexy — Query API Routes
Endpoints for submitting queries, listing history, and hydrating past analyses.
Integrates user session checks to isolate query outcomes per connection.
"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from ai.pipeline import ai_pipeline
from connectors.manager import connection_manager
from routes.auth import get_current_user
from database import get_user_history, get_query_log_by_id, get_datasource_by_id

logger = logging.getLogger(__name__)

router = APIRouter()


class QueryRequest(BaseModel):
    """Request body for submitting a natural language query."""
    question: str


@router.post("")
async def submit_query(
    request: QueryRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit a natural language question and receive an adaptive response.
    Saves the execution history in the query log vault.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    
    if not connection_manager.is_connected:
        raise HTTPException(
            status_code=400,
            detail="No data source connected. Please connect a database or upload a file first.",
        )
    
    # Process query passing active user_id for logging
    response = await ai_pipeline.process_question(
        request.question.strip(), 
        user_id=current_user["user_id"]
    )
    
    return {
        "success": response.success,
        "data": response.model_dump(),
    }


@router.get("/history")
async def get_query_history(current_user: dict = Depends(get_current_user)):
    """Get the query history for the active user account and database connection."""
    datasource_id = connection_manager.active_datasource_id
    if not datasource_id:
        return {
            "success": True,
            "data": [],
        }
        
    history = get_user_history(current_user["user_id"], datasource_id)
    
    # Map logs to frontend history item format
    formatted = []
    for item in history:
        q_lower = item["question"].lower()
        formatted.append({
            "query_id": item["query_id"],
            "question": item["question"],
            "summary": item["summary"],
            "timestamp": item["timestamp"],
            "has_kpis": True,
            "has_charts": any(x in q_lower for x in ("trend", "sales", "compare", "chart", "growth", "revenue")),
            "has_tables": True,
            "has_insights": True
        })
        
    return {
        "success": True,
        "data": formatted,
    }


@router.get("/{query_id}")
async def get_query_response(
    query_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific past query response by re-executing it (hydration).
    Ensures fresh data calculations with zero database caching bloat.
    """
    log = get_query_log_by_id(query_id)
    if not log or log["user_id"] != current_user["user_id"]:
        raise HTTPException(
            status_code=404, 
            detail="Query record not found or access denied."
        )
        
    # Auto-connect connection profile if disconnected or switched
    if not connection_manager.is_connected or connection_manager.active_datasource_id != log["datasource_id"]:
        profile = get_datasource_by_id(log["datasource_id"])
        if not profile or profile["user_id"] != current_user["user_id"]:
            raise HTTPException(
                status_code=400,
                detail="The database profile for this query was not found or is restricted."
            )
        try:
            t = profile["type"]
            cfg = profile["config"]
            name = profile["name"]
            ds_id = log["datasource_id"]
            
            if t == "csv":
                connection_manager.connect_csv(cfg["file_path"], name, datasource_id=ds_id)
            elif t == "excel":
                connection_manager.connect_excel(cfg["file_path"], datasource_id=ds_id)
            elif t == "sqlite":
                connection_manager.connect_sqlite(cfg["file_path"], datasource_id=ds_id)
            elif t == "postgresql":
                connection_manager.connect_postgresql(
                    host=cfg["host"],
                    port=cfg["port"],
                    database=cfg["database"],
                    username=cfg["username"],
                    password=cfg["password"],
                    datasource_id=ds_id
                )
            elif t == "mysql":
                connection_manager.connect_mysql(
                    host=cfg["host"],
                    port=cfg["port"],
                    database=cfg["database"],
                    username=cfg["username"],
                    password=cfg["password"],
                    datasource_id=ds_id
                )
            else:
                raise Exception(f"Unsupported connection type: {t}")
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to auto-connect database for history item: {str(e)}"
            )
        
    try:
        # Run SQL through ASTCorrector to ensure dialect-compatibility and schema alignment
        logger.info(f"Hydration request for query ID: {query_id}. Original SQL: {log['sql_query']}")
        from schema.ast_corrector import ASTCorrector
        corrector = ASTCorrector(connection_manager.schema_cache)
        sql, _ = corrector.correct_query(log["sql_query"], connection_manager.get_dialect())
        logger.info(f"Hydration. Cleaned and corrected SQL: {sql}")
        
        data = connection_manager.execute_query(sql)
        
        # Re-classify intent & recompose output layouts (programmatic, runs instantly)
        intent = ai_pipeline._classify_intent_programmatic(log["question"])
        response_data = await ai_pipeline._compose_response(log["question"], data, intent)
        
        return {
            "success": True,
            "data": {
                "query_id": query_id,
                "question": log["question"],
                "summary": response_data.get("summary", ""),
                "kpi_cards": response_data.get("kpi_cards", []),
                "charts": response_data.get("charts", []),
                "tables": response_data.get("tables", []),
                "insights": response_data.get("insights", []),
                "recommendations": response_data.get("recommendations", []),
                "success": True,
                "timestamp": log["timestamp"],
                "execution_time_ms": 0
            }
        }
    except Exception as e:
        normalized = ai_pipeline.normalize_error(str(e))
        raise HTTPException(
            status_code=400,
            detail=normalized
        )
