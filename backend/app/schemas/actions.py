from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class LeaveApplyRequest(BaseModel):
    start_date: str = Field(..., description='Start date in YYYY-MM-DD format')
    end_date: str = Field(..., description='End date in YYYY-MM-DD format')
    leave_type: Optional[str] = Field('Casual', description='Annual, Casual, Sick, Personal')
    reason: Optional[str] = Field(None, description='Reason for leave request')

class LeaveDecisionRequest(BaseModel):
    rejection_reason: Optional[str] = Field(None, description='Reason if request is rejected')

class LeaveRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_id: str
    employee_id: str
    employee_name: str
    department: str
    leave_type: str
    start_date: str
    end_date: str
    days_count: int
    reason: Optional[str] = None
    status: str
    approver_id: str
    approver_name: Optional[str] = None
    created_at: Optional[datetime] = None
    decided_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

class LeaveBalanceResponse(BaseModel):
    employee_id: str
    employee_name: str
    department: str
    total_allocated: int
    used_days: int
    pending_days: int
    available_balance: int

class WorkplaceActionCard(BaseModel):
    action_type: str  # LEAVE_APPLICATION, LEAVE_STATUS, LEAVE_BALANCE
    action_status: str # SUCCESS, PENDING_APPROVAL, REJECTED, ERROR
    request_id: Optional[str] = None
    title: str
    summary: str
    details: Dict[str, Any] = {}
