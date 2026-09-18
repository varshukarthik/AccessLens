from typing import Optional
from pydantic import BaseModel
from app.schemas.user import UserResponse

class LoginRequest(BaseModel):
    employee_id: str
    password: str

class SwitchUserRequest(BaseModel):
    employee_id: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
