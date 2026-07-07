"""
Quexy — System Database Adapter (Pure PostgreSQL)
Manages user authentication, saved database profiles, and query history logs using PostgreSQL.
"""
import os
import json
import uuid
import logging
import hashlib
import secrets
from datetime import datetime
from typing import Optional, Any, Dict, List, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor

logger = logging.getLogger(__name__)

# Fetch database connection URL from environment variables
SYSTEM_DATABASE_URL = os.getenv("SYSTEM_DATABASE_URL", "")

# --- HASHING HELPERS (Django-standard PBKDF2-SHA256) ---

def hash_password(password: str) -> str:
    """Hash a password securely using PBKDF2 with a random salt."""
    salt = secrets.token_hex(16)
    iterations = 100000
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        iterations
    )
    return f"pbkdf2_sha256${iterations}${salt}${key.hex()}"

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its PBKDF2 hash."""
    try:
        parts = hashed.split('$')
        if len(parts) != 4 or parts[0] != 'pbkdf2_sha256':
            return False
        iterations = int(parts[1])
        salt = parts[2]
        stored_key = parts[3]
        
        key = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            iterations
        )
        return key.hex() == stored_key
    except Exception:
        return False

# --- CONNECTION HELPER ---

def get_db_connection():
    """Retrieve an active PostgreSQL database connection."""
    if not SYSTEM_DATABASE_URL:
        raise ValueError(
            "SYSTEM_DATABASE_URL is not set. A PostgreSQL database is required to run Quexy."
        )
        
    conn_str = SYSTEM_DATABASE_URL
    if "sslmode" not in conn_str:
        conn_str += "?sslmode=require" if "?" not in conn_str else "&sslmode=require"
        
    conn = psycopg2.connect(conn_str, cursor_factory=RealDictCursor)
    return conn

# --- SCHEMAS INITIALIZER ---

def init_system_db():
    """Create PostgreSQL tables for users, connection profiles, and query history."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Users Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 2. Saved Datasources Table (One user can save multiple databases)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS datasources (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                name VARCHAR(150) NOT NULL,
                type VARCHAR(50) NOT NULL,
                connection_config TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # 3. Query History Table (History isolated per database connection)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS query_history (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                datasource_id VARCHAR(36) NOT NULL,
                question TEXT NOT NULL,
                sql_query TEXT NOT NULL,
                summary TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (datasource_id) REFERENCES datasources(id) ON DELETE CASCADE
            )
        """)
        
        conn.commit()
        logger.info("✓ PostgreSQL System Database initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}")
        raise e
    finally:
        if 'conn' in locals() and conn:
            conn.close()

# --- AUTH CRUD CONTROLLERS ---

def create_user(username: str, email: str, password: str) -> Tuple[bool, str]:
    """Register a new user account in PostgreSQL."""
    email = email.lower().strip()
    user_id = str(uuid.uuid4())
    pass_hash = hash_password(password)
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if email exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return False, "Email already registered."
            
        # Insert user
        cursor.execute(
            "INSERT INTO users (id, username, email, password_hash) VALUES (%s, %s, %s, %s)",
            (user_id, username, email, pass_hash)
        )
            
        conn.commit()
        return True, user_id
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        return False, f"Registration failed: {str(e)}"
    finally:
        if 'conn' in locals() and conn:
            conn.close()

def authenticate_user(email: str, password: str) -> Tuple[Optional[dict], Optional[str]]:
    """Authenticate credentials against database hash."""
    email = email.lower().strip()
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, username, email, password_hash FROM users WHERE email = %s", (email,))
        row = cursor.fetchone()
        if not row:
            return None, "Invalid email or password."
            
        # Verify hash
        if verify_password(password, row["password_hash"]):
            return {
                "id": row["id"],
                "username": row["username"],
                "email": row["email"]
            }, None
            
        return None, "Invalid email or password."
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        return None, f"Login failed: {str(e)}"
    finally:
        if 'conn' in locals() and conn:
            conn.close()

def get_user_by_id(user_id: str) -> Optional[dict]:
    """Retrieve user profile metadata by ID."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, username, email FROM users WHERE id = %s", (user_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
    except Exception:
        return None
    finally:
        if 'conn' in locals() and conn:
            conn.close()

# --- DATASOURCE CRUD CONTROLLERS ---

def save_datasource(user_id: str, name: str, source_type: str, config: dict) -> str:
    """Save or update database connection configs in PostgreSQL."""
    config_json = json.dumps(config)
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if connection profile exists
        cursor.execute("SELECT id FROM datasources WHERE user_id = %s AND name = %s", (user_id, name))
        row = cursor.fetchone()
        
        if row:
            datasource_id = row["id"]
            cursor.execute(
                "UPDATE datasources SET connection_config = %s, type = %s WHERE id = %s",
                (config_json, source_type, datasource_id)
            )
        else:
            datasource_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO datasources (id, user_id, name, type, connection_config) VALUES (%s, %s, %s, %s, %s)",
                (datasource_id, user_id, name, source_type, config_json)
            )
                
        conn.commit()
        return datasource_id
    except Exception as e:
        logger.error(f"Error saving datasource: {e}")
        raise e
    finally:
        if 'conn' in locals() and conn:
            conn.close()

def get_user_datasources(user_id: str) -> List[dict]:
    """Retrieve saved connection profiles for a user."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, name, type, connection_config, created_at FROM datasources WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,)
        )
            
        rows = cursor.fetchall()
        result = []
        for row in rows:
            result.append({
                "id": row["id"],
                "name": row["name"],
                "type": row["type"],
                "config": json.loads(row["connection_config"]),
                "created_at": str(row["created_at"])
            })
        return result
    except Exception as e:
        logger.error(f"Error retrieving datasources: {e}")
        return []
    finally:
        if 'conn' in locals() and conn:
            conn.close()

def get_datasource_by_id(datasource_id: str) -> Optional[dict]:
    """Retrieve connection profile details by ID."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, user_id, name, type, connection_config, created_at FROM datasources WHERE id = %s",
            (datasource_id,)
        )
            
        row = cursor.fetchone()
        if not row:
            return None
            
        return {
            "id": row["id"],
            "user_id": row["user_id"],
            "name": row["name"],
            "type": row["type"],
            "config": json.loads(row["connection_config"]),
            "created_at": str(row["created_at"])
        }
    except Exception:
        return None
    finally:
        if 'conn' in locals() and conn:
            conn.close()

def delete_datasource(datasource_id: str):
    """Delete database profile and cascade delete isolated query history log rows."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM datasources WHERE id = %s", (datasource_id,))
        cursor.execute("DELETE FROM query_history WHERE datasource_id = %s", (datasource_id,))
        conn.commit()
    except Exception as e:
        logger.error(f"Error deleting datasource: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()

# --- QUERY HISTORY CRUD CONTROLLERS ---

def save_query_log(user_id: str, datasource_id: str, question: str, sql_query: str, summary: str) -> str:
    """Save query log in PostgreSQL and cap history at 50 logs per profile."""
    query_id = str(uuid.uuid4())
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Insert new query log
        cursor.execute(
            "INSERT INTO query_history (id, user_id, datasource_id, question, sql_query, summary) VALUES (%s, %s, %s, %s, %s, %s)",
            (query_id, user_id, datasource_id, question, sql_query, summary)
        )
            
        # 2. Trim history beyond 50 logs
        cursor.execute(
            "SELECT id FROM query_history WHERE user_id = %s AND datasource_id = %s ORDER BY created_at DESC",
            (user_id, datasource_id)
        )
            
        rows = cursor.fetchall()
        
        if len(rows) > 50:
            ids_to_delete = [r["id"] for r in rows[50:]]
            cursor.execute(
                "DELETE FROM query_history WHERE id = ANY(%s)",
                (ids_to_delete,)
            )
                
        conn.commit()
        return query_id
    except Exception as e:
        logger.error(f"Error saving query log: {e}")
        return query_id
    finally:
        if 'conn' in locals() and conn:
            conn.close()

def get_user_history(user_id: str, datasource_id: str) -> List[dict]:
    """Retrieve query logs isolated by database connection profile."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, question, summary, created_at FROM query_history WHERE user_id = %s AND datasource_id = %s ORDER BY created_at DESC",
            (user_id, datasource_id)
        )
            
        rows = cursor.fetchall()
        return [
            {
                "query_id": r["id"],
                "question": r["question"],
                "summary": r["summary"],
                "timestamp": str(r["created_at"])
            }
            for r in rows
        ]
    except Exception as e:
        logger.error(f"Error loading user history: {e}")
        return []
    finally:
        if 'conn' in locals() and conn:
            conn.close()

def get_query_log_by_id(query_id: str) -> Optional[dict]:
    """Retrieve past query details for on-demand hydration."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, user_id, datasource_id, question, sql_query, summary, created_at FROM query_history WHERE id = %s",
            (query_id,)
        )
            
        row = cursor.fetchone()
        if not row:
            return None
            
        return {
            "query_id": row["id"],
            "user_id": row["user_id"],
            "datasource_id": row["datasource_id"],
            "question": row["question"],
            "sql_query": row["sql_query"],
            "summary": row["summary"],
            "timestamp": str(row["created_at"])
        }
    except Exception:
        return None
    finally:
        if 'conn' in locals() and conn:
            conn.close()
