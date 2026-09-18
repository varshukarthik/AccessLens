from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.leave import LeaveRequest
from app.schemas.actions import (
    LeaveApplyRequest,
    LeaveDecisionRequest,
    LeaveRequestResponse,
    LeaveBalanceResponse
)
from app.services.action_engine import ActionEngine

router = APIRouter(prefix="/actions/leave", tags=["Workplace Actions - Leave Governance"])

@router.post("/apply", response_model=LeaveRequestResponse)
def apply_leave(
    req: LeaveApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = ActionEngine.validate_and_apply_leave(
        db=db,
        user=current_user,
        start_date=req.start_date,
        end_date=req.end_date,
        leave_type=req.leave_type or "Casual",
        reason=req.reason
    )
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    return result["leave_request"]

@router.get("/my-requests", response_model=List[LeaveRequestResponse])
def get_my_leave_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    requests = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == current_user.employee_id
    ).order_by(LeaveRequest.created_at.desc()).all()
    return requests

@router.get("/pending-approvals", response_model=List[LeaveRequestResponse])
def get_pending_approvals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Admins see all pending approvals; Managers see those routed to their employee_id
    if current_user.is_admin:
        requests = db.query(LeaveRequest).filter(
            LeaveRequest.status == "Pending",
            LeaveRequest.employee_id != current_user.employee_id  # Filter out self requests for approval view
        ).order_by(LeaveRequest.created_at.desc()).all()
    else:
        requests = db.query(LeaveRequest).filter(
            LeaveRequest.approver_id == current_user.employee_id,
            LeaveRequest.status == "Pending",
            LeaveRequest.employee_id != current_user.employee_id
        ).order_by(LeaveRequest.created_at.desc()).all()
    return requests

@router.post("/{request_id}/approve", response_model=LeaveRequestResponse)
def approve_leave(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = ActionEngine.approve_leave_request(db, request_id, current_user)
    if not result["success"]:
        status_code = result.get("status_code", status.HTTP_400_BAD_REQUEST)
        raise HTTPException(status_code=status_code, detail=result["error"])
    return result["leave_request"]

@router.post("/{request_id}/reject", response_model=LeaveRequestResponse)
def reject_leave(
    request_id: str,
    payload: Optional[LeaveDecisionRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reason = payload.rejection_reason if payload else None
    result = ActionEngine.reject_leave_request(db, request_id, current_user, reason)
    if not result["success"]:
        status_code = result.get("status_code", status.HTTP_400_BAD_REQUEST)
        raise HTTPException(status_code=status_code, detail=result["error"])
    return result["leave_request"]

@router.get("/balance", response_model=LeaveBalanceResponse)
def get_leave_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    summary = ActionEngine.get_user_leave_summary(db, current_user)
    return LeaveBalanceResponse(
        employee_id=summary["employee_id"],
        employee_name=summary["employee_name"],
        department=summary["department"],
        total_allocated=summary["total_allocated"],
        used_days=summary["used_days"],
        pending_days=summary["pending_days"],
        available_balance=summary["available_balance"]
    )
