"""
Quexy — AI-Powered Business Intelligence Platform
Main FastAPI Application Entry Point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback

from config import settings
from routes import datasource, query, health


# --- Application ---
app = FastAPI(
    title="Quexy API",
    description="AI-Powered Business Intelligence — Connect your data. Ask naturally. Get intelligent answers.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Global Exception Handler ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions and return a clean error response."""
    if settings.APP_ENV == "development":
        detail = traceback.format_exc()
    else:
        detail = "An internal error occurred. Please try again."
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": str(exc),
            "detail": detail if settings.APP_ENV == "development" else None,
        },
    )


# --- Register Routers ---
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(datasource.router, prefix="/api/datasource", tags=["Data Source"])
app.include_router(query.router, prefix="/api/query", tags=["Query"])


# --- Root ---
@app.get("/")
async def root():
    return {
        "name": "Quexy API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }
