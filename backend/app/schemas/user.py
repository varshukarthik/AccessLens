from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    employee_id: str
    name: str
    email: str
    role: str
    department: str
    clearance: str = "Internal"
    status: str = "ACTIVE"
    groups: List[str] = []
    is_admin: bool = False

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    clearance: Optional[str] = None
    status: Optional[str] = None
    groups: Optional[List[str]] = None
    is_admin: Optional[bool] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
