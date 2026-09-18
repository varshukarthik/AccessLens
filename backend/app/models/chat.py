from datetime import datetime, timezone
import json
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from app.core.database import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False, default="New Research Session")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True, nullable=False)
    user_id = Column(Integer, nullable=False)
    sender = Column(String(20), nullable=False)  # "user" or "nexusguard"
    content = Column(Text, nullable=False)
    citations_json = Column(Text, nullable=False, default="[]")
    response_scope_json = Column(Text, nullable=True, default="{}")
    untrusted_instruction_detected = Column(Integer, nullable=True, default=0)
    evidence_status = Column(String(50), nullable=True)  # "AUTHORIZED_EVIDENCE_USED", "NO_AUTHORIZED_EVIDENCE", etc.
    request_id = Column(String(100), nullable=True)
    meta_json = Column(Text, nullable=True, default="{}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    @property
    def citations(self):
        try:
            return json.loads(self.citations_json)
        except Exception:
            return []

    @citations.setter
    def citations(self, val):
        self.citations_json = json.dumps(val if isinstance(val, list) else [])

    @property
    def response_scope(self):
        try:
            return json.loads(self.response_scope_json) if self.response_scope_json else None
        except Exception:
            return None

    @response_scope.setter
    def response_scope(self, val):
        self.response_scope_json = json.dumps(val if val else {})

    @property
    def meta(self):
        try:
            return json.loads(self.meta_json) if self.meta_json else {}
        except Exception:
            return {}

    @meta.setter
    def meta(self, val):
        self.meta_json = json.dumps(val if isinstance(val, dict) else {})

    @property
    def timeline(self):
        return self.meta.get("timeline", [])

    @property
    def context_manifest(self):
        return self.meta.get("context_manifest", [])

    @property
    def withheld_documents(self):
        return self.meta.get("withheld_documents", [])

    @property
    def security_events(self):
        return self.meta.get("security_events", [])

    @property
    def dlp_redactions(self):
        return self.meta.get("dlp_redactions", [])

    @property
    def intent(self):
        return self.meta.get("intent", "information_retrieval")

