from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.workload_data import get_workload_for_user

router = APIRouter(prefix="/portal", tags=["Intranet Employee Portal"])

@router.get("/workload")
def get_user_workload(
    current_user: User = Depends(get_current_user)
):
    """
    Returns role-aware and department-aware tasks, projects, meetings,
    and announcements tailored for the authenticated employee.
    """
    workload = get_workload_for_user(current_user.department, current_user.role)
    return {
        "employee": {
            "employee_id": current_user.employee_id,
            "name": current_user.name,
            "email": current_user.email,
            "department": current_user.department,
            "role": current_user.role,
            "clearance": current_user.clearance,
            "status": current_user.status
        },
        **workload
    }
