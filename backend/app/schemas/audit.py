from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

class DecisionItem(BaseModel):
    doc_id: Optional[str] = None
    title: Optional[str] = None
    classification: Optional[str] = None
    decision: Optional[str] = "ALLOWED"  # ALLOWED | DENIED
    reason_code: Optional[str] = None
    action: Optional[str] = None
    target: Optional[str] = None

class AuditLogResponse(BaseModel):
    id: int
    request_id: str
    timestamp: datetime
    user_id: int
    user_employee_id: str
    user_role: str
    user_dept: str
    user_clearance: str
    query: str
    candidate_ids: List[str]
    authorization_decisions: List[DecisionItem]
    authorized_ids: List[str]
    llm_evidence_ids: List[str]
    selected_ids: List[str]
    response_status: str
    answer_preview: Optional[str] = None
    latency_ms: float

    class Config:
        from_attributes = True

class SecurityTraceResponse(BaseModel):
    request_id: str
    timestamp: datetime
    user: Dict[str, Any]
    query: str
    candidate_documents: List[Dict[str, Any]]
    authorization_decisions: List[DecisionItem]
    authorized_documents: List[Dict[str, Any]]
    version_resolution: Dict[str, Any]
    llm_evidence_package: List[Dict[str, Any]]
    response_status: str
    answer: str
    citations: List[Dict[str, Any]]

class OverviewStatsResponse(BaseModel):
    total_documents: int
    total_users: int
    total_queries: int
    classification_counts: Dict[str, int]
    recent_decisions: Dict[str, int]
    recent_activity: List[AuditLogResponse]
