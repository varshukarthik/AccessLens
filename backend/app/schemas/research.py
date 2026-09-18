from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel

class ResearchQueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = None

class CitationItem(BaseModel):
    document_id: str
    title: str
    version: str
    effective_date: str
    classification: Optional[str] = None
    excerpt: Optional[str] = None

class ResearchResponse(BaseModel):
    request_id: str
    status: str  # SUCCESS | NO_AUTHORIZED_EVIDENCE | CONFLICT | ERROR | ACTION_PROCESSED
    answer: str
    citations: List[CitationItem] = []
    evidence_status: str  # AUTHORIZED_EVIDENCE_USED | NO_AUTHORIZED_EVIDENCE | CONFLICT_DETECTED | WORKPLACE_ACTION
    session_id: str
    action_card: Optional[Any] = None
    response_scope: Optional[Any] = None
    untrusted_instruction_detected: Optional[bool] = False
    timeline: Optional[List[Any]] = []
    context_manifest: Optional[List[Any]] = []
    withheld_documents: Optional[List[Any]] = []
    security_events: Optional[List[Any]] = []
    dlp_redactions: Optional[List[Any]] = []
    intent: Optional[str] = "information_retrieval"
    
    # Note: Admin traces are NEVER included in this employee response schema.

class ChatMessageResponse(BaseModel):
    id: int
    session_id: str
    sender: str
    content: str
    citations: List[CitationItem] = []
    evidence_status: Optional[str] = None
    request_id: Optional[str] = None
    response_scope: Optional[Any] = None
    untrusted_instruction_detected: Optional[bool] = False
    timeline: Optional[List[Any]] = []
    context_manifest: Optional[List[Any]] = []
    withheld_documents: Optional[List[Any]] = []
    security_events: Optional[List[Any]] = []
    dlp_redactions: Optional[List[Any]] = []
    intent: Optional[str] = "information_retrieval"
    created_at: datetime

    class Config:
        from_attributes = True

class ResearchSessionResponse(BaseModel):
    session_id: str
    title: str
    created_at: datetime
    messages: List[ChatMessageResponse] = []

