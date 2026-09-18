from datetime import datetime, timezone
import json
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    classification = Column(String(50), nullable=False, default="Internal")  # Public, Internal, Confidential, Restricted
    required_clearance = Column(String(50), nullable=False, default="Internal")
    allowed_roles_json = Column(Text, nullable=False, default="[]")
    allowed_departments_json = Column(Text, nullable=False, default="[]")
    explicit_denies_json = Column(Text, nullable=False, default="[]")
    owner_department = Column(String(100), nullable=False, default="Corporate")
    version = Column(String(20), nullable=False, default="1.0")
    lineage_group = Column(String(100), nullable=False, index=True, default="GENERAL")
    effective_date = Column(String(50), nullable=False, default="2026-09-01")
    status = Column(String(50), nullable=False, default="ACTIVE")  # ACTIVE, DRAFT, ARCHIVED
    uploaded_by = Column(String(50), nullable=False, default="SYSTEM")
    file_name = Column(String(255), nullable=True)
    file_type = Column(String(20), nullable=True)  # pdf, docx, txt, md
    is_searchable = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    @property
    def allowed_roles(self):
        try:
            return json.loads(self.allowed_roles_json)
        except Exception:
            return []

    @allowed_roles.setter
    def allowed_roles(self, val):
        self.allowed_roles_json = json.dumps(val if isinstance(val, list) else [])

    @property
    def allowed_departments(self):
        try:
            return json.loads(self.allowed_departments_json)
        except Exception:
            return []

    @allowed_departments.setter
    def allowed_departments(self, val):
        self.allowed_departments_json = json.dumps(val if isinstance(val, list) else [])

    @property
    def explicit_denies(self):
        try:
            return json.loads(self.explicit_denies_json)
        except Exception:
            return []

    @explicit_denies.setter
    def explicit_denies(self, val):
        self.explicit_denies_json = json.dumps(val if isinstance(val, list) else [])

    def __repr__(self):
        return f"<Document {self.doc_id} - '{self.title}' v{self.version} [{self.classification}]>"
