"""
Quexy — Query API Routes
Endpoints for submitting natural language queries and retrieving history.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ai.pipeline import ai_pipeline
from connectors.manager import connection_manager

router = APIRouter()


class QueryRequest(BaseModel):
    """Request body for submitting a natural language query."""
    question: str


@router.post("")
async def submit_query(request: QueryRequest):
    """
    Submit a natural language question and receive an adaptive response.
    
    The AI pipeline will:
    1. Understand your intent
    2. Generate the appropriate SQL query
    3. Execute it securely
    4. Compose an intelligent response with KPIs, charts, tables, and insights
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    
    if not connection_manager.is_connected:
        raise HTTPException(
            status_code=400,
            detail="No data source connected. Please connect a database or upload a file first.",
        )
    
    response = await ai_pipeline.process_question(request.question.strip())
    
    return {
        "success": response.success,
        "data": response.model_dump(),
    }


@router.get("/history")
async def get_query_history():
    """Get the query history for the current session."""
    history = ai_pipeline.get_history()
    return {
        "success": True,
        "data": [h.model_dump() for h in history],
    }


@router.get("/{query_id}")
async def get_query_response(query_id: str):
    """Get a specific past query response by ID."""
    response = ai_pipeline.get_query_by_id(query_id)
    
    if not response:
        raise HTTPException(status_code=404, detail="Query not found.")
    
    return {
        "success": True,
        "data": response,
    }
