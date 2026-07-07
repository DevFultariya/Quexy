"""
Quexy — Authentication API Routes & Security Dependency
Endpoints for user registration, login, and secure session extraction.
Provides the standard FastAPI dependency injection helper for route authorization.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from typing import Optional

from database import create_user, authenticate_user, get_user_by_id
from security.auth import generate_session_token, verify_session_token

router = APIRouter()

# --- Request Schemas ---

class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=100)


class UserLoginRequest(BaseModel):
    email: str
    password: str


# --- Security Dependency Helper ---

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    FastAPI dependency injection helper.
    Extracts Bearer token from Authorization header and verifies user session.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header is missing. Please sign in."
        )
        
    try:
        parts = authorization.split(" ")
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization header format. Use 'Bearer <token>'."
            )
            
        token = parts[1]
        user_payload = verify_session_token(token)
        
        if not user_payload:
            raise HTTPException(
                status_code=401,
                detail="Session expired or invalid token. Please login again."
            )
            
        return user_payload
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Authentication failed: {str(e)}"
        )

# --- Endpoints ---

@router.post("/register")
async def register(request: UserRegisterRequest):
    """Register a new user account."""
    email_clean = request.email.strip().lower()
    if "@" not in email_clean or "." not in email_clean:
        raise HTTPException(status_code=400, detail="Invalid email format.")
        
    success, result = create_user(
        username=request.username.strip(),
        email=email_clean,
        password=request.password
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=result)
        
    # Generate session token automatically on success
    token = generate_session_token(user_id=result, username=request.username.strip())
    
    return {
        "success": True,
        "message": "User registered successfully.",
        "data": {
            "token": token,
            "username": request.username.strip(),
            "user_id": result
        }
    }


@router.post("/login")
async def login(request: UserLoginRequest):
    """Authenticate and login a user."""
    user, error = authenticate_user(email=request.email, password=request.password)
    
    if error:
        raise HTTPException(status_code=401, detail=error)
        
    # Generate session token
    token = generate_session_token(user_id=user["id"], username=user["username"])
    
    return {
        "success": True,
        "message": "Login successful.",
        "data": {
            "token": token,
            "username": user["username"],
            "user_id": user["id"]
        }
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Fetch current authenticated user profile details."""
    user = get_user_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    return {
        "success": True,
        "data": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"]
        }
    }
