from datetime import datetime, timezone
import json
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(100), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    user_id = Column(Integer, nullable=False)
    user_employee_id = Column(String(50), index=True, nullable=False)
    user_role = Column(String(50), nullable=False)
    user_dept = Column(String(50), nullable=False)
    user_clearance = Column(String(50), nullable=False)
    query = Column(Text, nullable=False)
    candidate_ids_json = Column(Text, nullable=False, default="[]")
    authorization_decisions_json = Column(Text, nullable=False, default="[]")  # list of {doc_id, decision, reason_code, title}
    authorized_ids_json = Column(Text, nullable=False, default="[]")
    llm_evidence_ids_json = Column(Text, nullable=False, default="[]")
    selected_ids_json = Column(Text, nullable=False, default="[]")
    response_status = Column(String(50), nullable=False)  # SUCCESS, NO_AUTHORIZED_EVIDENCE, CONFLICT, ERROR
    answer_preview = Column(Text, nullable=True)  # sanitized preview
    latency_ms = Column(Float, default=0.0)

    @property
    def candidate_ids(self):
        try:
            return json.loads(self.candidate_ids_json)
        except Exception:
            return []

    @property
    def authorization_decisions(self):
        try:
            return json.loads(self.authorization_decisions_json)
        except Exception:
            return []

    @property
    def authorized_ids(self):
        try:
            return json.loads(self.authorized_ids_json)
        except Exception:
            return []

    @property
    def llm_evidence_ids(self):
        try:
            return json.loads(self.llm_evidence_ids_json)
        except Exception:
            return []

    @property
    def selected_ids(self):
        try:
            return json.loads(self.selected_ids_json)
        except Exception:
            return []

    def __repr__(self):
        return f"<AuditLog {self.request_id} - User {self.user_employee_id} -> {self.response_status}>"
