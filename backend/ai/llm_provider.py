"""
Quexy — Dual LLM Provider with Automatic Failover
Primary: Google Gemini 2.5 Flash (FREE)
Fallback: Groq Llama 3.3 70B (FREE)

Both are 100% free with no credit card required.
"""
import time
import logging
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.language_models.chat_models import BaseChatModel

from config import settings

logger = logging.getLogger(__name__)


class LLMProvider:
    """
    Manages dual LLM providers with automatic failover.
    
    Flow:
    1. Try primary (Gemini) first
    2. On rate limit (429) → automatically retry with fallback (Groq)
    3. If both fail → raise with clear error message
    """
    
    def __init__(self):
        self._primary: BaseChatModel | None = None
        self._fallback: BaseChatModel | None = None
        self._primary_name = "Gemini 2.5 Flash"
        self._fallback_name = "Groq Llama 3.3 70B"
        self._initialized = False
    
    def _initialize(self):
        """Lazy initialization of LLM clients."""
        if self._initialized:
            return
        
        # Initialize Primary: Google Gemini
        if settings.has_gemini:
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                self._primary = ChatGoogleGenerativeAI(
                    model=settings.GEMINI_MODEL,
                    google_api_key=settings.GEMINI_API_KEY,
                    temperature=0,
                    max_output_tokens=4096,
                )
                logger.info(f"✓ Primary LLM initialized: {self._primary_name}")
            except Exception as e:
                logger.warning(f"✗ Failed to initialize Gemini: {e}")
        
        # Initialize Fallback: Groq
        if settings.has_groq:
            try:
                from langchain_groq import ChatGroq
                self._fallback = ChatGroq(
                    model=settings.GROQ_MODEL,
                    api_key=settings.GROQ_API_KEY,
                    temperature=0,
                    max_tokens=4096,
                )
                logger.info(f"✓ Fallback LLM initialized: {self._fallback_name}")
            except Exception as e:
                logger.warning(f"✗ Failed to initialize Groq: {e}")
        
        self._initialized = True
        
        if not self._primary and not self._fallback:
            logger.error("✗ No LLM provider available! Set GEMINI_API_KEY or GROQ_API_KEY in .env")
    
    def invoke(self, system_prompt: str, user_prompt: str) -> str:
        """
        Send a prompt to the LLM with automatic failover.
        
        Args:
            system_prompt: System instructions for the LLM
            user_prompt: The user's actual question/request
            
        Returns:
            The LLM's response text
        """
        self._initialize()
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]
        
        # Try primary first
        if self._primary:
            try:
                response = self._primary.invoke(messages)
                logger.info(f"Response from {self._primary_name}")
                return response.content
            except Exception as e:
                error_str = str(e).lower()
                if "429" in error_str or "resource_exhausted" in error_str or "rate" in error_str:
                    logger.warning(f"{self._primary_name} rate limited, falling back to {self._fallback_name}")
                else:
                    logger.warning(f"{self._primary_name} error: {e}, trying fallback")
        
        # Try fallback
        if self._fallback:
            try:
                response = self._fallback.invoke(messages)
                logger.info(f"Response from {self._fallback_name}")
                return response.content
            except Exception as e:
                error_str = str(e).lower()
                if "429" in error_str or "rate" in error_str:
                    raise RuntimeError(
                        "Both AI providers have reached their rate limits. "
                        "Please try again in a few minutes."
                    )
                raise RuntimeError(f"LLM error: {str(e)}")
        
        raise RuntimeError(
            "No LLM provider is configured. "
            "Please set GEMINI_API_KEY or GROQ_API_KEY in your .env file."
        )
    
    @property
    def is_available(self) -> bool:
        """Check if at least one LLM provider is configured."""
        self._initialize()
        return self._primary is not None or self._fallback is not None
    
    @property
    def provider_status(self) -> dict:
        """Get the status of all providers."""
        self._initialize()
        return {
            "primary": {
                "name": self._primary_name,
                "available": self._primary is not None,
            },
            "fallback": {
                "name": self._fallback_name,
                "available": self._fallback is not None,
            },
        }


# Singleton instance
llm_provider = LLMProvider()
