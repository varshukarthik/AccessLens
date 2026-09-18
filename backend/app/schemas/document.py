from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class DocumentBase(BaseModel):
    doc_id: str
    title: str
    description: Optional[str] = None
    classification: str = "Internal"
    required_clearance: Optional[str] = "Internal"
    allowed_roles: List[str] = []
    allowed_departments: List[str] = []
    explicit_denies: List[str] = []
    owner_department: str = "Corporate"
    version: str = "1.0"
    lineage_group: str = "GENERAL"
    effective_date: str = "2026-09-01"
    status: str = "ACTIVE"  # ACTIVE, DRAFT, ARCHIVED
    is_searchable: bool = True

class DocumentCreate(DocumentBase):
    content: str
    summary: Optional[str] = None

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    classification: Optional[str] = None
    required_clearance: Optional[str] = None
    allowed_roles: Optional[List[str]] = None
    allowed_departments: Optional[List[str]] = None
    explicit_denies: Optional[List[str]] = None
    owner_department: Optional[str] = None
    version: Optional[str] = None
    lineage_group: Optional[str] = None
    effective_date: Optional[str] = None
    status: Optional[str] = None
    is_searchable: Optional[bool] = None

class DocumentSummaryResponse(DocumentBase):
    id: int
    summary: Optional[str] = None
    uploaded_by: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DocumentDetailResponse(DocumentSummaryResponse):
    content: str
