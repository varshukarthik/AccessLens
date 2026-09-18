from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import LoginRequest, SwitchUserRequest, TokenResponse, UserResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    identifier = req.employee_id.strip()
    user = db.query(User).filter(
        (User.employee_id == identifier) | (User.email == identifier)
    ).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Employee ID/Email or password."
        )
    
    access_token = create_access_token(
        subject=user.employee_id,
        extra_claims={
            "user_id": user.id,
            "role": user.role,
            "department": user.department,
            "clearance": user.clearance,
            "is_admin": user.is_admin
        }
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/demo-switch", response_model=TokenResponse)
def demo_switch(req: SwitchUserRequest, db: Session = Depends(get_db)):
    """
    Demo helper: Switches session to a valid seeded identity (U102, U205, U301, Admin, etc.)
    Generates a trusted signed JWT server-side.
    """
    user = db.query(User).filter(User.employee_id == req.employee_id.strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Demo identity '{req.employee_id}' not found."
        )

    access_token = create_access_token(
        subject=user.employee_id,
        extra_claims={
            "user_id": user.id,
            "role": user.role,
            "department": user.department,
            "clearance": user.clearance,
            "is_admin": user.is_admin
        }
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.get("/demo-accounts")
def get_demo_accounts(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "employee_id": u.employee_id,
            "name": u.name,
            "role": u.role,
            "department": u.department,
            "clearance": u.clearance,
            "is_admin": u.is_admin,
            "description": f"{u.role} in {u.department} ({u.clearance} clearance)"
        }
        for u in users
    ]
