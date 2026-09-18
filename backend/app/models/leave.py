from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base

class LeaveRequest(Base):
    __tablename__ = 'leave_requests'

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(50), unique=True, index=True, nullable=False)
    employee_id = Column(String(50), index=True, nullable=False)
    employee_name = Column(String(100), nullable=False)
    department = Column(String(50), nullable=False)
    leave_type = Column(String(50), nullable=False, default='Casual')  # Annual, Casual, Sick, Personal
    start_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    end_date = Column(String(20), nullable=False)    # YYYY-MM-DD
    days_count = Column(Integer, nullable=False, default=1)
    reason = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default='Pending', index=True)  # Pending, Approved, Rejected, Cancelled
    approver_id = Column(String(50), index=True, nullable=False)
    approver_name = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    decided_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    def __repr__(self):
        return f'<LeaveRequest {self.request_id} - {self.employee_id} ({self.days_count} days) [{self.status}]>'
