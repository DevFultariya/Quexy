"""
Quexy — AI Pipeline (Core Intelligence)
Orchestrates the entire flow: Question → Intent → SQL → Validate → Execute → Compose Response

This is the brain of Quexy. The user never sees any of this process.
"""
import json
import time
import uuid
import logging
import re
from typing import Any
from datetime import datetime

from ai.llm_provider import llm_provider
from ai.prompts import SQL_GENERATION_PROMPT, RESPONSE_COMPOSITION_PROMPT, INTENT_CLASSIFICATION_PROMPT
from ai.response_composer import response_composer
from ai.models import QueryResponse, QueryHistoryItem
from security.validator import query_validator
from connectors.manager import connection_manager
from schema.ast_corrector import ASTCorrector
from schema.optimizer import QueryOptimizer
from config import settings

logger = logging.getLogger(__name__)


class AIPipeline:
    """
    The main AI pipeline that processes natural language questions
    and returns adaptive business intelligence responses.
    
    Flow:
    1. Classify intent
    2. Generate SQL (with schema context)
    3. Validate SQL (security)
    4. Execute query (with self-correction on failure)
    5. Compose response (AI-powered or heuristic fallback)
    """
    
    def __init__(self):
        pass
    
    async def process_question(self, question: str, user_id: Optional[str] = None) -> QueryResponse:
        """
        Process a natural language question and return a complete response.
        
        Args:
            question: The user's natural language question
            user_id: Optional authenticated user ID for logging query logs
            
        Returns:
            QueryResponse with dynamically composed components
        """
        start_time = time.time()
        query_id = str(uuid.uuid4())[:8]
        
        try:
            # Verify connection
            if not connection_manager.is_connected:
                return QueryResponse(
                    query_id=query_id,
                    question=question,
                    success=False,
                    error="No data source connected. Please connect a database or upload a file first.",
                    timestamp=datetime.now().isoformat(),
                )
            
            # Verify LLM availability
            if not llm_provider.is_available:
                return QueryResponse(
                    query_id=query_id,
                    question=question,
                    success=False,
                    error="No AI provider configured. Please set GEMINI_API_KEY or GROQ_API_KEY in your .env file.",
                    timestamp=datetime.now().isoformat(),
                )
            
            # Step 1: Classify intent
            intent = await self._classify_intent(question)
            logger.info(f"Intent classified: {intent}")
            
            # Step 2: Generate SQL
            schema_context = connection_manager.get_schema_context()
            dialect = connection_manager.get_dialect()
            sql = await self._generate_sql(question, schema_context, dialect)
            logger.info(f"SQL generated: {sql[:100]}...")
            
            # Check if AI couldn't answer
            if sql.startswith("CANNOT_ANSWER"):
                return QueryResponse(
                    query_id=query_id,
                    question=question,
                    summary=sql.replace("CANNOT_ANSWER:", "").strip(),
                    success=False,
                    error="Unable to generate a query for this question with the available data.",
                    timestamp=datetime.now().isoformat(),
                )
            
            # Step 2b: Programmatic AST correction (fixes schema hallucinations)
            corrector = ASTCorrector(connection_manager.schema_cache)
            corrected_sql, was_corrected = corrector.correct_query(sql, dialect)
            if was_corrected:
                logger.info(f"SQL corrected programmatically: {corrected_sql[:100]}...")
            
            # Step 3: Validate SQL (security)
            validation = query_validator.validate(corrected_sql, dialect)
            if not validation.is_valid:
                logger.warning(f"SQL validation failed: {validation.reason}")
                return QueryResponse(
                    query_id=query_id,
                    question=question,
                    success=False,
                    error=f"Query security check failed: {validation.reason}",
                    timestamp=datetime.now().isoformat(),
                )
            
            # Step 4: Execute query (with self-correction on database fail)
            executed_sql = validation.sanitized_query or corrected_sql
            data = await self._execute_with_retry(executed_sql, question, schema_context, dialect)
            
            if data is None:
                return QueryResponse(
                    query_id=query_id,
                    question=question,
                    success=False,
                    error="Failed to execute query after multiple attempts.",
                    timestamp=datetime.now().isoformat(),
                )
            
            # Step 4b: Run Query Optimizer & Execution Diagnostics
            optimizer = QueryOptimizer(connection_manager)
            performance_report = optimizer.generate_report(
                original_sql=sql,
                corrected_sql=executed_sql,
                ast_corrected=was_corrected
            )
            
            # Step 5: Compose response
            response_data = await self._compose_response(question, data, intent)
            
            execution_time = int((time.time() - start_time) * 1000)
            
            response = QueryResponse(
                query_id=query_id,
                question=question,
                summary=response_data.get("summary", ""),
                kpi_cards=response_data.get("kpi_cards", []),
                charts=response_data.get("charts", []),
                tables=response_data.get("tables", []),
                insights=response_data.get("insights", []),
                recommendations=response_data.get("recommendations", []),
                success=True,
                timestamp=datetime.now().isoformat(),
                execution_time_ms=execution_time,
                performance_report=performance_report,
            )
            
            # Store in history
            if user_id and connection_manager.active_datasource_id:
                from database import save_query_log
                save_query_log(
                    user_id=user_id,
                    datasource_id=connection_manager.active_datasource_id,
                    question=question,
                    sql_query=executed_sql,
                    summary=response.summary
                )
                
            return response
        
        except Exception as e:
            logger.error(f"Pipeline error: {e}", exc_info=True)
            execution_time = int((time.time() - start_time) * 1000)
            return QueryResponse(
                query_id=query_id,
                question=question,
                success=False,
                error=str(e),
                timestamp=datetime.now().isoformat(),
                execution_time_ms=execution_time,
            )
    
    async def _classify_intent(self, question: str) -> str:
        """Classify the user's analytical intent."""
        try:
            prompt = INTENT_CLASSIFICATION_PROMPT.format(question=question)
            response = llm_provider.invoke(
                system_prompt="You are an intent classifier. Return ONLY the intent category.",
                user_prompt=prompt,
            )
            intent = response.strip().upper()
            valid_intents = ["METRIC", "TREND", "COMPARISON", "RANKING", "EXPLORATION", "DETAIL", "DISTRIBUTION"]
            return intent if intent in valid_intents else "EXPLORATION"
        except Exception:
            return "EXPLORATION"
    
    async def _generate_sql(self, question: str, schema_context: str, dialect: str) -> str:
        """Generate SQL from natural language using the LLM."""
        prompt = SQL_GENERATION_PROMPT.format(
            dialect=dialect.upper(),
            schema_context=schema_context,
            question=question,
        )
        
        response = llm_provider.invoke(
            system_prompt="You are an expert SQL analyst. Generate ONLY valid SQL queries.",
            user_prompt=prompt,
        )
        
        # Clean the response — remove markdown code blocks if present
        sql = response.strip()
        sql = re.sub(r"^```sql\s*", "", sql)
        sql = re.sub(r"^```\s*", "", sql)
        sql = re.sub(r"\s*```$", "", sql)
        sql = sql.strip()
        
        return sql
    
    async def _execute_with_retry(
        self, sql: str, question: str, schema_context: str, dialect: str
    ) -> list[dict[str, Any]] | None:
        """
        Execute SQL with self-correction on failure.
        If a query fails, sends the error back to the LLM for correction.
        """
        last_error = ""
        
        for attempt in range(settings.MAX_RETRIES):
            try:
                if attempt > 0:
                    logger.info(f"Retry attempt {attempt + 1}/{settings.MAX_RETRIES}")
                
                data = connection_manager.execute_query(sql)
                return data
                
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Query execution failed (attempt {attempt + 1}): {last_error}")
                
                if attempt < settings.MAX_RETRIES - 1:
                    # Self-correction: ask LLM to fix the query
                    correction_prompt = f"""The following SQL query failed with an error. Please fix it.

ORIGINAL QUESTION: {question}

FAILED SQL:
{sql}

ERROR:
{last_error}

DATABASE SCHEMA:
{schema_context}

Generate ONLY the corrected SQL query. No explanations."""
                    
                    try:
                        corrected = llm_provider.invoke(
                            system_prompt="You are an expert SQL debugger. Fix the SQL query based on the error.",
                            user_prompt=correction_prompt,
                        )
                        sql = corrected.strip()
                        sql = re.sub(r"^```sql\s*", "", sql)
                        sql = re.sub(r"^```\s*", "", sql)
                        sql = re.sub(r"\s*```$", "", sql)
                        sql = sql.strip()
                        
                        # Re-validate the corrected query
                        validation = query_validator.validate(sql, dialect)
                        if not validation.is_valid:
                            logger.warning(f"Corrected query failed validation: {validation.reason}")
                            continue
                        sql = validation.sanitized_query or sql
                    except Exception as correction_error:
                        logger.warning(f"Self-correction failed: {correction_error}")
                        continue
        
        logger.error(f"All retry attempts exhausted. Last error: {last_error}")
        return None
    
    async def _compose_response(
        self, question: str, data: list[dict[str, Any]], intent: str
    ) -> dict:
        """
        Compose an adaptive response using the LLM or fallback heuristics.
        """
        # Try LLM-powered composition first
        try:
            # Prepare results summary (limit data sent to LLM)
            display_data = data[:50]  # Send max 50 rows to LLM
            results_str = json.dumps(display_data, indent=2, default=str)
            
            prompt = RESPONSE_COMPOSITION_PROMPT.format(
                question=question,
                row_count=len(data),
                results=results_str,
            )
            
            response_text = llm_provider.invoke(
                system_prompt="You are a business intelligence analyst. Return ONLY valid JSON.",
                user_prompt=prompt,
            )
            
            # Parse JSON response
            response_text = response_text.strip()
            response_text = re.sub(r"^```json\s*", "", response_text)
            response_text = re.sub(r"^```\s*", "", response_text)
            response_text = re.sub(r"\s*```$", "", response_text)
            
            composed = json.loads(response_text)
            
            # Ensure all required fields exist
            composed.setdefault("summary", "")
            composed.setdefault("kpi_cards", [])
            composed.setdefault("charts", [])
            composed.setdefault("tables", [])
            composed.setdefault("insights", [])
            composed.setdefault("recommendations", [])
            
            # If the LLM didn't include table data but we have lots of rows, add it
            if not composed["tables"] and len(data) > 1:
                columns = list(data[0].keys())
                composed["tables"] = [{
                    "title": "Detailed Results",
                    "columns": [{"key": c, "label": c.replace("_", " ").title()} for c in columns],
                    "rows": data[:100],
                    "sortable": True,
                    "pagination": True,
                    "page_size": 10,
                }]
            
            return composed
            
        except (json.JSONDecodeError, Exception) as e:
            logger.warning(f"LLM response composition failed ({e}), using heuristic fallback")
            # Fallback to heuristic composer
            return response_composer.compose(question, data, intent)
    



# Singleton instance
ai_pipeline = AIPipeline()
