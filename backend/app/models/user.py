from datetime import datetime, timezone
import json
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    role = Column(String(50), nullable=False)  # e.g., "Financial Analyst", "Marketing Manager", "Security Officer"
    department = Column(String(50), nullable=False)  # e.g., "Finance", "Marketing", "Security", "Engineering"
    clearance = Column(String(50), nullable=False, default="Internal")  # "Public", "Internal", "Confidential", "Restricted"
    status = Column(String(20), nullable=False, default="ACTIVE")  # ACTIVE, SUSPENDED, INACTIVE
    groups_json = Column(Text, nullable=False, default="[]")
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    @property
    def groups(self):
        try:
            return json.loads(self.groups_json)
        except Exception:
            return []

    @groups.setter
    def groups(self, val):
        self.groups_json = json.dumps(val if isinstance(val, list) else [])

    def __repr__(self):
        return f"<User {self.employee_id} ({self.name}) - {self.role} in {self.department} [{self.clearance}]>"
