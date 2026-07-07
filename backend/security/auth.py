"""
Quexy — Stateless Authentication Token Manager
Generates and verifies cryptographically signed session tokens using HMAC-SHA256.
Allows stateless user verification with zero external library dependencies.
"""
import os
import hmac
import hashlib
import base64
import json
import logging
from typing import Optional

from config import settings

logger = logging.getLogger(__name__)

# Use app secret key for signing tokens
SECRET_KEY = os.getenv("SECRET_KEY", "quexy_secret_super_key_123_change_in_prod")

def generate_session_token(user_id: str, username: str) -> str:
    """
    Generate a statelessly verified session token.
    Token format: base64(payload) . signature
    """
    payload = {
        "user_id": user_id,
        "username": username
    }
    payload_json = json.dumps(payload)
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode('utf-8')).decode('utf-8').rstrip('=')
    
    # Compute signature
    signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        payload_b64.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return f"{payload_b64}.{signature}"

def verify_session_token(token: str) -> Optional[dict]:
    """
    Verify the token signature and return the user payload.
    Returns None if signature is invalid.
    """
    try:
        if not token or "." not in token:
            return None
            
        parts = token.split(".")
        if len(parts) != 2:
            return None
            
        payload_b64, signature = parts[0], parts[1]
        
        # Verify signature
        expected_sig = hmac.new(
            SECRET_KEY.encode('utf-8'),
            payload_b64.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_sig):
            logger.warning("Stateless Auth: Invalid token signature attempt.")
            return None
            
        # Decode payload
        # Add padding back if stripped
        padding = '=' * (4 - len(payload_b64) % 4)
        payload_json = base64.urlsafe_b64decode((payload_b64 + padding).encode('utf-8')).decode('utf-8')
        payload = json.loads(payload_json)
        
        return payload
    except Exception as e:
        logger.error(f"Stateless Auth Token verification error: {e}")
        return None
