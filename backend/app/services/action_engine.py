import re
import uuid
from datetime import datetime, date, timedelta, timezone
from typing import Optional, Dict, Any, Tuple, List
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.leave import LeaveRequest
from app.models.audit import AuditLog

MONTH_MAP = {
    'jan': 1, 'january': 1,
    'feb': 2, 'february': 2,
    'mar': 3, 'march': 3,
    'apr': 4, 'april': 4,
    'may': 5,
    'jun': 6, 'june': 6,
    'jul': 7, 'july': 7,
    'aug': 8, 'august': 8,
    'sep': 9, 'september': 9,
    'oct': 10, 'october': 10,
    'nov': 11, 'november': 11,
    'dec': 12, 'december': 12
}

class ActionEngine:
    """
    Generalized Enterprise Workplace Action Engine.
    Enforces deterministic policy validation, balance gating, overlap prevention,
    self-approval blocking, and managerial routing.
    """

    @classmethod
    def is_action_intent(cls, query: str) -> Tuple[bool, str]:
        q = query.lower().strip()
        
        # 1. Leave Application Intent
        leave_apply_patterns = [
            r'apply(?:ing)?\s+(?:for\s+)?(?:a\s+)?leave',
            r'take\s+(?:a\s+)?leave',
            r'request(?:ing)?\s+(?:a\s+)?leave',
            r'take\s+time\s+off',
            r'request\s+time\s+off',
            r'book\s+(?:a\s+)?leave',
            r'apply\s+vacation',
            r'request\s+vacation',
            r'need\s+(?:a\s+)?leave'
        ]
        for pattern in leave_apply_patterns:
            if re.search(pattern, q):
                return True, 'LEAVE_APPLICATION'

        # 2. Leave Status Query Intent
        leave_status_patterns = [
            r'(?:what\s+is|check|show|view|status\s+of)\s+(?:my\s+)?leave\s+status',
            r'(?:my\s+)?leave\s+request\s+status',
            r'status\s+of\s+(?:my\s+)?leave',
            r'check\s+(?:my\s+)?leave\s+request',
            r'my\s+leave\s+requests?'
        ]
        for pattern in leave_status_patterns:
            if re.search(pattern, q):
                return True, 'LEAVE_STATUS_INQUIRY'

        # 3. Leave Balance Query Intent
        leave_balance_patterns = [
            r'(?:what\s+is|check|show|view)\s+(?:my\s+)?leave\s+balance',
            r'how\s+many\s+leaves?\s+(?:do\s+i\s+have|left|remaining)',
            r'how\s+many\s+days\s+(?:of\s+)?leave',
            r'remaining\s+leaves?',
            r'leave\s+quota',
            r'my\s+leave\s+balance'
        ]
        for pattern in leave_balance_patterns:
            if re.search(pattern, q):
                return True, 'LEAVE_BALANCE_INQUIRY'

        return False, ''

    @classmethod
    def parse_leave_request_params(cls, query: str) -> Dict[str, Any]:
        q = query.strip()
        current_year = 2026

        # Default leave type
        leave_type = 'Casual'
        if re.search(r'\b(sick|medical|health)\b', q, re.I):
            leave_type = 'Sick'
        elif re.search(r'\b(annual|vacation|holiday)\b', q, re.I):
            leave_type = 'Annual'
        elif re.search(r'\b(personal|emergency)\b', q, re.I):
            leave_type = 'Personal'

        # Extract reason
        reason = None
        reason_match = re.search(r'(?:for|due to|reason:?)\s+([^.!?]+)', q, re.I)
        if reason_match:
            candidate_reason = reason_match.group(1).strip()
            if not re.search(r'\b(september|october|november|december|january|february)\b', candidate_reason, re.I):
                reason = candidate_reason.capitalize()

        if not reason:
            reason = f'Requested {leave_type} leave via NexusGuard assistant.'

        # Date extraction: ISO format first (YYYY-MM-DD to YYYY-MM-DD)
        iso_match = re.search(r'(\d{4}-\d{2}-\d{2})\s+(?:to|until|-)\s+(\d{4}-\d{2}-\d{2})', q)
        if iso_match:
            return {
                'start_date': iso_match.group(1),
                'end_date': iso_match.group(2),
                'leave_type': leave_type,
                'reason': reason
            }

        # Date extraction: 'from 23 September to 25 September'
        date_pattern = re.search(
            r'(?:from\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+)(?:\s+(\d{4}))?\s+(?:to|until|-)\s+(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+)(?:\s+(\d{4}))?',
            q,
            re.I
        )

        if date_pattern:
            d1, m1, y1, d2, m2, y2 = date_pattern.groups()
            month1 = MONTH_MAP.get(m1.lower()[:3], 9)
            month2 = MONTH_MAP.get(m2.lower()[:3], month1)
            year1 = int(y1) if y1 else current_year
            year2 = int(y2) if y2 else year1

            start_d = date(year1, month1, int(d1))
            end_d = date(year2, month2, int(d2))

            return {
                'start_date': start_d.strftime('%Y-%m-%d'),
                'end_date': end_d.strftime('%Y-%m-%d'),
                'leave_type': leave_type,
                'reason': reason
            }

        # Date extraction: single month with two days, e.g., '23 to 25 September'
        single_month_pattern = re.search(
            r'(?:from\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(?:to|until|-)\s+(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+)(?:\s+(\d{4}))?',
            q,
            re.I
        )
        if single_month_pattern:
            d1, d2, m, y = single_month_pattern.groups()
            month = MONTH_MAP.get(m.lower()[:3], 9)
            yr = int(y) if y else current_year

            start_d = date(yr, month, int(d1))
            end_d = date(yr, month, int(d2))

            return {
                'start_date': start_d.strftime('%Y-%m-%d'),
                'end_date': end_d.strftime('%Y-%m-%d'),
                'leave_type': leave_type,
                'reason': reason
            }

        # Date extraction: single day 'on 23 September'
        single_day_pattern = re.search(
            r'(?:on|for)\s+(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+)(?:\s+(\d{4}))?',
            q,
            re.I
        )
        if single_day_pattern:
            d, m, y = single_day_pattern.groups()
            month = MONTH_MAP.get(m.lower()[:3], 9)
            yr = int(y) if y else current_year
            target_d = date(yr, month, int(d))
            s_str = target_d.strftime('%Y-%m-%d')
            return {
                'start_date': s_str,
                'end_date': s_str,
                'leave_type': leave_type,
                'reason': reason
            }

        # Fallback default future dates
        default_start = date(current_year, 9, 23).strftime('%Y-%m-%d')
        default_end = date(current_year, 9, 25).strftime('%Y-%m-%d')
        return {
            'start_date': default_start,
            'end_date': default_end,
            'leave_type': leave_type,
            'reason': reason
        }

    @classmethod
    def calculate_days_count(cls, start_date_str: str, end_date_str: str) -> int:
        try:
            d1 = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            d2 = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            delta = (d2 - d1).days + 1
            return max(1, delta)
        except Exception:
            return 1

    @classmethod
    def validate_and_apply_leave(
        cls,
        db: Session,
        user: User,
        start_date: str,
        end_date: str,
        leave_type: str = 'Casual',
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        # 1. User status check
        if user.status != 'ACTIVE' or not user.is_active:
            return {
                'success': False,
                'error': f'Employee account {user.employee_id} is not active ({user.status}). Leave application prohibited.'
            }

        # 2. Date format & chronology check
        try:
            d1 = datetime.strptime(start_date, '%Y-%m-%d').date()
            d2 = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return {
                'success': False,
                'error': 'Invalid date format. Expected YYYY-MM-DD.'
            }

        if d1 > d2:
            return {
                'success': False,
                'error': f'Invalid date range: Start date ({start_date}) cannot be after End date ({end_date}).'
            }

        days_count = (d2 - d1).days + 1

        # 3. Check leave balance
        available_balance = getattr(user, 'leave_balance', 18)
        
        pending_requests = db.query(LeaveRequest).filter(
            LeaveRequest.employee_id == user.employee_id,
            LeaveRequest.status == 'Pending'
        ).all()
        pending_days = sum(r.days_count for r in pending_requests)
        
        effective_balance = available_balance - pending_days

        if days_count > effective_balance:
            return {
                'success': False,
                'error': f'Insufficient leave balance. Requested: {days_count} days. Available: {effective_balance} days (Total: {available_balance}, Pending: {pending_days}).'
            }

        # 4. Check for overlapping requests
        overlap = db.query(LeaveRequest).filter(
            LeaveRequest.employee_id == user.employee_id,
            LeaveRequest.status.in_(['Pending', 'Approved']),
            LeaveRequest.start_date <= end_date,
            LeaveRequest.end_date >= start_date
        ).first()

        if overlap:
            return {
                'success': False,
                'error': f'Conflict detected: An active leave request ({overlap.request_id} from {overlap.start_date} to {overlap.end_date}, status: {overlap.status}) overlaps with the requested dates.'
            }

        # 5. Determine designated approver
        approver_id = getattr(user, 'manager_id', None)
        approver_name = 'Department Manager'

        if not approver_id:
            admin_user = db.query(User).filter(User.is_admin == True).first()
            approver_id = admin_user.employee_id if admin_user else 'Admin'
            approver_name = admin_user.name if admin_user else 'Security & Governance Officer'
        else:
            mgr = db.query(User).filter(User.employee_id == approver_id).first()
            if mgr:
                approver_name = mgr.name

        if approver_id == user.employee_id:
            ceo = db.query(User).filter(User.role == 'Chief Executive Officer').first()
            if ceo and ceo.employee_id != user.employee_id:
                approver_id = ceo.employee_id
                approver_name = ceo.name
            else:
                admin_user = db.query(User).filter(User.is_admin == True).first()
                approver_id = admin_user.employee_id if admin_user else 'Admin'
                approver_name = admin_user.name if admin_user else 'System Administrator'

        # 6. Create Pending Leave Request
        request_id = f'LEV-{d1.year}-{uuid.uuid4().hex[:6].upper()}'
        leave_req = LeaveRequest(
            request_id=request_id,
            employee_id=user.employee_id,
            employee_name=user.name,
            department=user.department,
            leave_type=leave_type,
            start_date=start_date,
            end_date=end_date,
            days_count=days_count,
            reason=reason or f'Standard {leave_type} leave',
            status='Pending',
            approver_id=approver_id,
            approver_name=approver_name
        )
        db.add(leave_req)
        db.commit()
        db.refresh(leave_req)

        # 7. Audit Log
        audit = AuditLog(
            request_id=f'AUD-ACT-{uuid.uuid4().hex[:8].upper()}',
            user_id=user.id,
            user_employee_id=user.employee_id,
            user_role=user.role,
            user_dept=user.department,
            user_clearance=user.clearance,
            query=f'ACTION: Submit Leave Request ({request_id})',
            candidate_ids_json='[]',
            authorization_decisions_json='[{"action": "LEAVE_APPLICATION", "decision": "ALLOWED", "request_id": "' + request_id + '"}]',
            authorized_ids_json='[]',
            llm_evidence_ids_json='[]',
            selected_ids_json='[]',
            response_status='ACTION_SUBMITTED',
            answer_preview=f'Leave request {request_id} ({days_count} days) created. Routed to {approver_name} ({approver_id}).'
        )
        db.add(audit)
        db.commit()

        return {
            'success': True,
            'request_id': request_id,
            'leave_request': leave_req,
            'days_count': days_count,
            'remaining_balance': effective_balance - days_count,
            'approver_id': approver_id,
            'approver_name': approver_name
        }

    @classmethod
    def approve_leave_request(
        cls,
        db: Session,
        request_id: str,
        actor_user: User
    ) -> Dict[str, Any]:
        req = db.query(LeaveRequest).filter(LeaveRequest.request_id == request_id).first()
        if not req:
            return {'success': False, 'error': f'Leave request {request_id} not found.'}

        # 1. STRICT SELF-APPROVAL PREVENTION
        if req.employee_id == actor_user.employee_id:
            return {
                'success': False,
                'status_code': 403,
                'error': 'Self-approval violation: Employees cannot approve their own leave requests under Nova Solutions Corporate Governance Policy.'
            }

        # 2. Authorization check
        if req.approver_id != actor_user.employee_id and not actor_user.is_admin:
            return {
                'success': False,
                'status_code': 403,
                'error': f'Unauthorized: You are not the designated approver ({req.approver_id}) or a Governance Administrator.'
            }

        # 3. Check status
        if req.status != 'Pending':
            return {
                'success': False,
                'error': f'Request {request_id} is already in {req.status} status.'
            }

        # 4. Deduct balance
        employee = db.query(User).filter(User.employee_id == req.employee_id).first()
        if employee:
            current_bal = getattr(employee, 'leave_balance', 18)
            employee.leave_balance = max(0, current_bal - req.days_count)

        # 5. Update request status
        req.status = 'Approved'
        req.decided_at = datetime.now(timezone.utc)
        req.approver_id = actor_user.employee_id
        req.approver_name = actor_user.name
        db.commit()

        # 6. Audit Log
        audit = AuditLog(
            request_id=f'AUD-APPR-{uuid.uuid4().hex[:8].upper()}',
            user_id=actor_user.id,
            user_employee_id=actor_user.employee_id,
            user_role=actor_user.role,
            user_dept=actor_user.department,
            user_clearance=actor_user.clearance,
            query=f'ACTION: Approve Leave Request ({request_id})',
            candidate_ids_json='[]',
            authorization_decisions_json='[{"action": "LEAVE_APPROVE", "decision": "ALLOWED", "target": "' + req.employee_id + '"}]',
            authorized_ids_json='[]',
            llm_evidence_ids_json='[]',
            selected_ids_json='[]',
            response_status='ACTION_APPROVED',
            answer_preview=f'Leave request {request_id} approved by {actor_user.name}. {req.days_count} days deducted.'
        )
        db.add(audit)
        db.commit()

        return {'success': True, 'message': f'Leave request {request_id} has been Approved.', 'leave_request': req}

    @classmethod
    def reject_leave_request(
        cls,
        db: Session,
        request_id: str,
        actor_user: User,
        rejection_reason: Optional[str] = None
    ) -> Dict[str, Any]:
        req = db.query(LeaveRequest).filter(LeaveRequest.request_id == request_id).first()
        if not req:
            return {'success': False, 'error': f'Leave request {request_id} not found.'}

        # 1. STRICT SELF-APPROVAL PREVENTION
        if req.employee_id == actor_user.employee_id:
            return {
                'success': False,
                'status_code': 403,
                'error': 'Self-approval violation: Employees cannot reject or alter their own requests from approval mode.'
            }

        # 2. Authorization check
        if req.approver_id != actor_user.employee_id and not actor_user.is_admin:
            return {
                'success': False,
                'status_code': 403,
                'error': f'Unauthorized: You are not the designated approver ({req.approver_id}) or a Governance Administrator.'
            }

        if req.status != 'Pending':
            return {
                'success': False,
                'error': f'Request {request_id} is already in {req.status} status.'
            }

        req.status = 'Rejected'
        req.rejection_reason = rejection_reason or 'Operational coverage requirements.'
        req.decided_at = datetime.now(timezone.utc)
        req.approver_id = actor_user.employee_id
        req.approver_name = actor_user.name
        db.commit()

        # Audit Log
        audit = AuditLog(
            request_id=f'AUD-REJ-{uuid.uuid4().hex[:8].upper()}',
            user_id=actor_user.id,
            user_employee_id=actor_user.employee_id,
            user_role=actor_user.role,
            user_dept=actor_user.department,
            user_clearance=actor_user.clearance,
            query=f'ACTION: Reject Leave Request ({request_id})',
            candidate_ids_json='[]',
            authorization_decisions_json='[{"action": "LEAVE_REJECT", "decision": "ALLOWED", "target": "' + req.employee_id + '"}]',
            authorized_ids_json='[]',
            llm_evidence_ids_json='[]',
            selected_ids_json='[]',
            response_status='ACTION_REJECTED',
            answer_preview=f'Leave request {request_id} rejected by {actor_user.name}. Reason: {req.rejection_reason}'
        )
        db.add(audit)
        db.commit()

        return {'success': True, 'message': f'Leave request {request_id} has been Rejected.', 'leave_request': req}

    @classmethod
    def get_user_leave_summary(cls, db: Session, user: User) -> Dict[str, Any]:
        total_balance = getattr(user, 'leave_balance', 18)
        requests = db.query(LeaveRequest).filter(LeaveRequest.employee_id == user.employee_id).all()
        pending_days = sum(r.days_count for r in requests if r.status == 'Pending')
        used_days = sum(r.days_count for r in requests if r.status == 'Approved')
        available = max(0, total_balance - pending_days)

        return {
            'employee_id': user.employee_id,
            'employee_name': user.name,
            'department': user.department,
            'total_allocated': total_balance + used_days,
            'available_balance': available,
            'pending_days': pending_days,
            'used_days': used_days,
            'recent_requests': requests
        }
