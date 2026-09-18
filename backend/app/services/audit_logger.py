import json
import time
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from app.services.policy_engine import PolicyEvaluationResult

class AuditLogger:
    """
    Security Audit Logger.
    Persists decision traces and pipeline telemetry without storing raw restricted document payloads.
    """

    @staticmethod
    def log_query_execution(
        db: Session,
        request_id: str,
        user: Any,
        query: str,
        candidate_ids: List[str],
        eval_results: List[PolicyEvaluationResult],
        authorized_ids: List[str],
        llm_evidence_ids: List[str],
        selected_ids: List[str],
        response_status: str,
        answer_preview: str,
        latency_ms: float
    ) -> AuditLog:
        decisions_json = json.dumps([r.to_dict() for r in eval_results])

        audit_entry = AuditLog(
            request_id=request_id,
            timestamp=datetime.now(timezone.utc),
            user_id=user.id,
            user_employee_id=user.employee_id,
            user_role=user.role,
            user_dept=user.department,
            user_clearance=user.clearance,
            query=query,
            candidate_ids_json=json.dumps(candidate_ids),
            authorization_decisions_json=decisions_json,
            authorized_ids_json=json.dumps(authorized_ids),
            llm_evidence_ids_json=json.dumps(llm_evidence_ids),
            selected_ids_json=json.dumps(selected_ids),
            response_status=response_status,
            answer_preview=answer_preview[:200] if answer_preview else "",
            latency_ms=latency_ms
        )

        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        return audit_entry
