"""
Quexy Backend Configuration
Loads environment variables and provides application-wide settings.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""
    
    # LLM API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    # Application
    APP_ENV: str = os.getenv("APP_ENV", "development")
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    
    # Query Limits
    MAX_ROWS: int = int(os.getenv("MAX_ROWS", "10000"))
    QUERY_TIMEOUT_SECONDS: int = int(os.getenv("QUERY_TIMEOUT_SECONDS", "30"))
    MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "3"))
    
    # File Upload
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: set[str] = {".csv", ".xlsx", ".xls", ".db", ".sqlite", ".sqlite3"}
    
    # LLM Models
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    def __init__(self):
        """Ensure upload directory exists."""
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)
    
    @property
    def has_gemini(self) -> bool:
        return bool(self.GEMINI_API_KEY and self.GEMINI_API_KEY != "your_gemini_api_key_here")
    
    @property
    def has_groq(self) -> bool:
        return bool(self.GROQ_API_KEY and self.GROQ_API_KEY != "your_groq_api_key_here")
    
    @property
    def has_any_llm(self) -> bool:
        return self.has_gemini or self.has_groq


settings = Settings()
