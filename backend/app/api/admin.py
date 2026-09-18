import json
import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_password_hash
from app.api.deps import get_current_admin_user
from app.models.user import User
from app.models.document import Document
from app.models.audit import AuditLog
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentDetailResponse
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.audit import AuditLogResponse, SecurityTraceResponse, OverviewStatsResponse, DecisionItem
from app.services.policy_engine import PolicyEngine, CLASSIFICATION_LEVELS, REASON_CODES
from app.services.document_parser import extract_text_from_file

router = APIRouter(prefix="/admin", tags=["Admin & Security Governance"])

@router.get("/overview", response_model=OverviewStatsResponse)
def get_admin_overview(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    total_docs = db.query(Document).count()
    total_users = db.query(User).count()
    total_queries = db.query(AuditLog).count()

    # Classification counts
    classifications = db.query(Document.classification, func.count(Document.id)).group_by(Document.classification).all()
    class_counts = {c[0]: c[1] for c in classifications if c[0]}
    for level in ["Public", "Internal", "Confidential", "Restricted"]:
        if level not in class_counts:
            class_counts[level] = 0

    # Decision counts from recent logs
    recent_logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(30).all()
    recent_decisions = {"ALLOWED": 0, "DENIED": 0}
    for log in recent_logs:
        for dec in log.authorization_decisions:
            d_type = dec.get("decision", "DENIED")
            recent_decisions[d_type] = recent_decisions.get(d_type, 0) + 1

    formatted_recent = []
    for log in recent_logs:
        decisions = [DecisionItem(**d) for d in log.authorization_decisions]
        formatted_recent.append(AuditLogResponse(
            id=log.id,
            request_id=log.request_id,
            timestamp=log.timestamp,
            user_id=log.user_id,
            user_employee_id=log.user_employee_id,
            user_role=log.user_role,
            user_dept=log.user_dept,
            user_clearance=log.user_clearance,
            query=log.query,
            candidate_ids=log.candidate_ids,
            authorization_decisions=decisions,
            authorized_ids=log.authorized_ids,
            llm_evidence_ids=log.llm_evidence_ids,
            selected_ids=log.selected_ids,
            response_status=log.response_status,
            answer_preview=log.answer_preview,
            latency_ms=log.latency_ms
        ))

    return OverviewStatsResponse(
        total_documents=total_docs,
        total_users=total_users,
        total_queries=total_queries,
        classification_counts=class_counts,
        recent_decisions=recent_decisions,
        recent_activity=formatted_recent
    )

@router.get("/documents", response_model=List[DocumentDetailResponse])
def get_all_documents(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    docs = db.query(Document).order_by(Document.id.asc()).all()
    return [
        DocumentDetailResponse(
            id=d.id,
            doc_id=d.doc_id,
            title=d.title,
            description=d.description,
            content=d.content,
            summary=d.summary,
            classification=d.classification,
            required_clearance=d.required_clearance,
            allowed_roles=d.allowed_roles,
            allowed_departments=d.allowed_departments,
            explicit_denies=d.explicit_denies,
            owner_department=d.owner_department,
            version=d.version,
            lineage_group=d.lineage_group,
            effective_date=d.effective_date,
            status=d.status,
            uploaded_by=d.uploaded_by,
            file_name=d.file_name,
            file_type=d.file_type,
            is_searchable=d.is_searchable,
            created_at=d.created_at,
            updated_at=d.updated_at
        )
        for d in docs
    ]

@router.post("/documents/upload", response_model=DocumentDetailResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    classification: str = Form("Internal"),
    required_clearance: Optional[str] = Form(None),
    allowed_departments: Optional[str] = Form("[]"),
    allowed_roles: Optional[str] = Form("[]"),
    explicit_denies: Optional[str] = Form("[]"),
    owner_department: str = Form("Corporate"),
    version: str = Form("1.0"),
    lineage_group: Optional[str] = Form(None),
    effective_date: str = Form("2026-09-01"),
    status: str = Form("ACTIVE"),
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Real document upload endpoint for PDF, DOCX, TXT, and MD files.
    Extracts text, validates policy metadata, and creates searchable document record.
    """
    classification_clean = classification.strip()
    if classification_clean.upper() not in CLASSIFICATION_LEVELS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid classification '{classification}'. Allowed: Public, Internal, Confidential, Restricted"
        )

    # Read and parse file
    content_bytes = await file.read()
    extracted_text, file_type = extract_text_from_file(file, content_bytes)

    # Parse JSON or comma-separated lists
    def parse_list(val_str: Optional[str]) -> List[str]:
        if not val_str:
            return []
        try:
            parsed = json.loads(val_str)
            if isinstance(parsed, list):
                return [str(x).strip() for x in parsed if str(x).strip()]
        except Exception:
            return [s.strip() for s in val_str.split(",") if s.strip()]
        return []

    dept_list = parse_list(allowed_departments)
    roles_list = parse_list(allowed_roles)
    denies_list = parse_list(explicit_denies)

    # Auto-generate unique doc_id
    doc_seq = db.query(Document).count() + 101
    auto_doc_id = f"DOC-{doc_seq}"
    while db.query(Document).filter(Document.doc_id == auto_doc_id).first():
        doc_seq += 1
        auto_doc_id = f"DOC-{doc_seq}"

    effective_lineage = (lineage_group or title).strip().upper().replace(" ", "_")
    req_clearance = required_clearance.strip() if required_clearance else classification_clean

    new_doc = Document(
        doc_id=auto_doc_id,
        title=title.strip(),
        description=description.strip() if description else extracted_text[:180],
        content=extracted_text,
        summary=description.strip() if description else extracted_text[:180],
        classification=classification_clean,
        required_clearance=req_clearance,
        allowed_departments_json=json.dumps(dept_list),
        allowed_roles_json=json.dumps(roles_list),
        explicit_denies_json=json.dumps(denies_list),
        owner_department=owner_department.strip(),
        version=version.strip(),
        lineage_group=effective_lineage,
        effective_date=effective_date.strip(),
        status=status.strip().upper(),
        uploaded_by=admin.employee_id,
        file_name=file.filename,
        file_type=file_type,
        is_searchable=(status.strip().upper() == "ACTIVE")
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return DocumentDetailResponse(
        id=new_doc.id,
        doc_id=new_doc.doc_id,
        title=new_doc.title,
        description=new_doc.description,
        content=new_doc.content,
        summary=new_doc.summary,
        classification=new_doc.classification,
        required_clearance=new_doc.required_clearance,
        allowed_roles=new_doc.allowed_roles,
        allowed_departments=new_doc.allowed_departments,
        explicit_denies=new_doc.explicit_denies,
        owner_department=new_doc.owner_department,
        version=new_doc.version,
        lineage_group=new_doc.lineage_group,
        effective_date=new_doc.effective_date,
        status=new_doc.status,
        uploaded_by=new_doc.uploaded_by,
        file_name=new_doc.file_name,
        file_type=new_doc.file_type,
        is_searchable=new_doc.is_searchable,
        created_at=new_doc.created_at,
        updated_at=new_doc.updated_at
    )

@router.post("/documents", response_model=DocumentDetailResponse)
def create_document(
    doc_in: DocumentCreate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    if doc_in.classification.upper() not in CLASSIFICATION_LEVELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid classification '{doc_in.classification}'."
        )

    existing = db.query(Document).filter(Document.doc_id == doc_in.doc_id.strip().upper()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document ID '{doc_in.doc_id}' already exists."
        )

    req_clearance = doc_in.required_clearance or doc_in.classification

    doc = Document(
        doc_id=doc_in.doc_id.strip().upper(),
        title=doc_in.title.strip(),
        description=doc_in.description or doc_in.summary,
        content=doc_in.content.strip(),
        summary=doc_in.summary or doc_in.description or doc_in.content[:150],
        classification=doc_in.classification,
        required_clearance=req_clearance,
        allowed_roles_json=json.dumps(doc_in.allowed_roles),
        allowed_departments_json=json.dumps(doc_in.allowed_departments),
        explicit_denies_json=json.dumps(doc_in.explicit_denies),
        owner_department=doc_in.owner_department,
        version=doc_in.version,
        lineage_group=doc_in.lineage_group.strip().upper(),
        effective_date=doc_in.effective_date,
        status=doc_in.status.upper(),
        uploaded_by=admin.employee_id,
        is_searchable=doc_in.is_searchable
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return DocumentDetailResponse(
        id=doc.id,
        doc_id=doc.doc_id,
        title=doc.title,
        description=doc.description,
        content=doc.content,
        summary=doc.summary,
        classification=doc.classification,
        required_clearance=doc.required_clearance,
        allowed_roles=doc.allowed_roles,
        allowed_departments=doc.allowed_departments,
        explicit_denies=doc.explicit_denies,
        owner_department=doc.owner_department,
        version=doc.version,
        lineage_group=doc.lineage_group,
        effective_date=doc.effective_date,
        status=doc.status,
        uploaded_by=doc.uploaded_by,
        file_name=doc.file_name,
        file_type=doc.file_type,
        is_searchable=doc.is_searchable,
        created_at=doc.created_at,
        updated_at=doc.updated_at
    )

@router.put("/documents/{id}", response_model=DocumentDetailResponse)
def update_document(
    id: int,
    doc_in: DocumentUpdate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if doc_in.title is not None:
        doc.title = doc_in.title
    if doc_in.description is not None:
        doc.description = doc_in.description
    if doc_in.content is not None:
        doc.content = doc_in.content
    if doc_in.summary is not None:
        doc.summary = doc_in.summary
    if doc_in.classification is not None:
        if doc_in.classification.upper() not in CLASSIFICATION_LEVELS:
            raise HTTPException(status_code=400, detail="Invalid classification.")
        doc.classification = doc_in.classification
    if doc_in.required_clearance is not None:
        doc.required_clearance = doc_in.required_clearance
    if doc_in.allowed_roles is not None:
        doc.allowed_roles = doc_in.allowed_roles
    if doc_in.allowed_departments is not None:
        doc.allowed_departments = doc_in.allowed_departments
    if doc_in.explicit_denies is not None:
        doc.explicit_denies = doc_in.explicit_denies
    if doc_in.owner_department is not None:
        doc.owner_department = doc_in.owner_department
    if doc_in.version is not None:
        doc.version = doc_in.version
    if doc_in.lineage_group is not None:
        doc.lineage_group = doc_in.lineage_group
    if doc_in.effective_date is not None:
        doc.effective_date = doc_in.effective_date
    if doc_in.status is not None:
        doc.status = doc_in.status.upper()
        doc.is_searchable = (doc_in.status.upper() == "ACTIVE")
    if doc_in.is_searchable is not None:
        doc.is_searchable = doc_in.is_searchable

    db.commit()
    db.refresh(doc)
    return DocumentDetailResponse(
        id=doc.id,
        doc_id=doc.doc_id,
        title=doc.title,
        description=doc.description,
        content=doc.content,
        summary=doc.summary,
        classification=doc.classification,
        required_clearance=doc.required_clearance,
        allowed_roles=doc.allowed_roles,
        allowed_departments=doc.allowed_departments,
        explicit_denies=doc.explicit_denies,
        owner_department=doc.owner_department,
        version=doc.version,
        lineage_group=doc.lineage_group,
        effective_date=doc.effective_date,
        status=doc.status,
        uploaded_by=doc.uploaded_by,
        file_name=doc.file_name,
        file_type=doc.file_type,
        is_searchable=doc.is_searchable,
        created_at=doc.created_at,
        updated_at=doc.updated_at
    )

@router.delete("/documents/{id}")
def delete_document(
    id: int,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully."}

# ==================== USER MANAGEMENT ====================

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.id.asc()).all()
    return [
        UserResponse(
            id=u.id,
            employee_id=u.employee_id,
            name=u.name,
            email=u.email,
            department=u.department,
            role=u.role,
            clearance=u.clearance,
            status=u.status,
            groups=u.groups,
            is_active=u.is_active,
            is_admin=u.is_admin,
            created_at=u.created_at,
            updated_at=u.updated_at
        )
        for u in users
    ]

@router.post("/users", response_model=UserResponse)
def create_user(
    user_in: UserCreate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(
        (User.employee_id == user_in.employee_id.strip()) | (User.email == user_in.email.strip())
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID or Email already registered.")

    user = User(
        employee_id=user_in.employee_id.strip(),
        name=user_in.name.strip(),
        email=user_in.email.strip(),
        department=user_in.department.strip(),
        role=user_in.role.strip(),
        clearance=user_in.clearance.strip(),
        status=user_in.status.strip().upper(),
        groups_json=json.dumps(user_in.groups),
        is_active=(user_in.status.strip().upper() == "ACTIVE"),
        is_admin=user_in.is_admin,
        password_hash=get_password_hash(user_in.password or "password123")
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserResponse(
        id=user.id,
        employee_id=user.employee_id,
        name=user.name,
        email=user.email,
        department=user.department,
        role=user.role,
        clearance=user.clearance,
        status=user.status,
        groups=user.groups,
        is_active=user.is_active,
        is_admin=user.is_admin,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

@router.put("/users/{id}", response_model=UserResponse)
def update_user(
    id: int,
    user_in: UserUpdate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user_in.name is not None:
        user.name = user_in.name.strip()
    if user_in.email is not None:
        user.email = user_in.email.strip()
    if user_in.department is not None:
        user.department = user_in.department.strip()
    if user_in.role is not None:
        user.role = user_in.role.strip()
    if user_in.clearance is not None:
        user.clearance = user_in.clearance.strip()
    if user_in.status is not None:
        user.status = user_in.status.strip().upper()
        user.is_active = (user_in.status.strip().upper() == "ACTIVE")
    if user_in.groups is not None:
        user.groups = user_in.groups
    if user_in.is_admin is not None:
        user.is_admin = user_in.is_admin
    if user_in.password:
        user.password_hash = get_password_hash(user_in.password)

    db.commit()
    db.refresh(user)

    return UserResponse(
        id=user.id,
        employee_id=user.employee_id,
        name=user.name,
        email=user.email,
        department=user.department,
        role=user.role,
        clearance=user.clearance,
        status=user.status,
        groups=user.groups,
        is_active=user.is_active,
        is_admin=user.is_admin,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

@router.delete("/users/{id}")
def delete_user(
    id: int,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    if admin.id == id:
        raise HTTPException(status_code=400, detail="Cannot delete current logged in administrator.")
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    db.delete(user)
    db.commit()
    return {"message": "User account deleted successfully."}

# ==================== POLICIES & SIMULATOR ====================

@router.get("/policies")
def get_policy_matrix(
    admin: User = Depends(get_current_admin_user)
):
    return {
        "classification_hierarchy": [
            {"name": "Public", "level": 0, "description": "Accessible across the company and external domains if published."},
            {"name": "Internal", "level": 1, "description": "Standard company information accessible to all employees with Internal clearance."},
            {"name": "Confidential", "level": 2, "description": "Sensitive departmental or cross-functional projects requiring explicit department/role authorization."},
            {"name": "Restricted", "level": 3, "description": "Highly restricted executive or privileged board communications."}
        ],
        "reason_codes": [
            {"code": k, "description": v} for k, v in REASON_CODES.items()
        ],
        "abac_rules": [
            "User Clearance >= Document Required Clearance",
            "Document Allowed Departments is empty OR User Department in Allowed Departments",
            "Document Allowed Roles is empty OR User Role in Allowed Roles",
            "Explicit Deny rules override any allow condition",
            "Missing or malformed security metadata triggers immediate INVALID_POLICY_METADATA Default Deny"
        ]
    }

@router.post("/policies/test")
def simulate_policy_test(
    payload: Dict[str, str],
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    user_id_str = payload.get("user_id") or payload.get("employee_id")
    doc_id_str = payload.get("doc_id")

    user = db.query(User).filter((User.employee_id == user_id_str) | (User.id == user_id_str)).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id_str}' not found.")

    doc = db.query(Document).filter((Document.doc_id == doc_id_str) | (Document.id == doc_id_str)).first()
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id_str}' not found.")

    eval_result = PolicyEngine.evaluate(user, doc)
    return {
        "user": {
            "employee_id": user.employee_id,
            "name": user.name,
            "role": user.role,
            "department": user.department,
            "clearance": user.clearance,
            "status": user.status
        },
        "document": {
            "doc_id": doc.doc_id,
            "title": doc.title,
            "classification": doc.classification,
            "required_clearance": doc.required_clearance,
            "allowed_departments": doc.allowed_departments,
            "allowed_roles": doc.allowed_roles,
            "explicit_denies": doc.explicit_denies
        },
        "evaluation": eval_result.to_dict()
    }

@router.get("/audit", response_model=List[AuditLogResponse])
def get_audit_logs(
    user_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    limit: int = 50,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if user_id:
        query = query.filter(AuditLog.user_employee_id == user_id.strip())
    if status_filter:
        query = query.filter(AuditLog.response_status == status_filter.strip())

    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    results = []
    for log in logs:
        decisions = [DecisionItem(**d) for d in log.authorization_decisions]
        results.append(AuditLogResponse(
            id=log.id,
            request_id=log.request_id,
            timestamp=log.timestamp,
            user_id=log.user_id,
            user_employee_id=log.user_employee_id,
            user_role=log.user_role,
            user_dept=log.user_dept,
            user_clearance=log.user_clearance,
            query=log.query,
            candidate_ids=log.candidate_ids,
            authorization_decisions=decisions,
            authorized_ids=log.authorized_ids,
            llm_evidence_ids=log.llm_evidence_ids,
            selected_ids=log.selected_ids,
            response_status=log.response_status,
            answer_preview=log.answer_preview,
            latency_ms=log.latency_ms
        ))
    return results

@router.get("/requests/{request_id}/trace", response_model=SecurityTraceResponse)
def get_security_trace(
    request_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    log = db.query(AuditLog).filter(AuditLog.request_id == request_id.strip()).first()
    if not log:
        raise HTTPException(status_code=404, detail="Audit log entry not found.")

    candidate_docs = db.query(Document).filter(Document.doc_id.in_(log.candidate_ids)).all()
    candidates_meta = [
        {
            "doc_id": d.doc_id,
            "title": d.title,
            "classification": d.classification,
            "required_clearance": d.required_clearance,
            "version": d.version,
            "allowed_departments": d.allowed_departments,
            "allowed_roles": d.allowed_roles,
            "effective_date": d.effective_date
        }
        for d in candidate_docs
    ]

    authorized_docs = db.query(Document).filter(Document.doc_id.in_(log.authorized_ids)).all()
    authorized_meta = [
        {
            "doc_id": d.doc_id,
            "title": d.title,
            "classification": d.classification,
            "version": d.version,
            "effective_date": d.effective_date,
            "lineage_group": d.lineage_group
        }
        for d in authorized_docs
    ]

    llm_docs = db.query(Document).filter(Document.doc_id.in_(log.llm_evidence_ids)).all()
    llm_evidence_meta = [
        {
            "doc_id": d.doc_id,
            "title": d.title,
            "version": d.version,
            "effective_date": d.effective_date,
            "content_length": len(d.content),
            "excerpt": d.content[:150]
        }
        for d in llm_docs
    ]

    decisions = [DecisionItem(**d) for d in log.authorization_decisions]

    return SecurityTraceResponse(
        request_id=log.request_id,
        timestamp=log.timestamp,
        user={
            "id": log.user_id,
            "employee_id": log.user_employee_id,
            "role": log.user_role,
            "department": log.user_dept,
            "clearance": log.user_clearance
        },
        query=log.query,
        candidate_documents=candidates_meta,
        authorization_decisions=decisions,
        authorized_documents=authorized_meta,
        version_resolution={
            "selected_ids": log.selected_ids,
            "superseded_ids": [cid for cid in log.authorized_ids if cid not in log.selected_ids]
        },
        llm_evidence_package=llm_evidence_meta,
        response_status=log.response_status,
        answer=log.answer_preview or "",
        citations=[{"document_id": cid} for cid in log.selected_ids]
    )
