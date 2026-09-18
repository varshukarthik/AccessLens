from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentSummaryResponse, DocumentDetailResponse
from app.services.policy_engine import PolicyEngine

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentSummaryResponse])
def get_authorized_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns only the documents the authenticated employee is authorized to view.
    Unauthorized documents are strictly excluded from the list.
    """
    all_docs = db.query(Document).filter(Document.is_searchable == True, Document.status == "ACTIVE").all()
    authorized_docs = []

    for doc in all_docs:
        eval_result = PolicyEngine.evaluate(current_user, doc)
        if eval_result.is_allowed:
            authorized_docs.append(DocumentSummaryResponse(
                id=doc.id,
                doc_id=doc.doc_id,
                title=doc.title,
                classification=doc.classification,
                allowed_roles=doc.allowed_roles,
                allowed_departments=doc.allowed_departments,
                explicit_denies=doc.explicit_denies,
                version=doc.version,
                lineage_group=doc.lineage_group,
                effective_date=doc.effective_date,
                status=doc.status,
                owner=doc.owner,
                is_searchable=doc.is_searchable,
                summary=doc.summary,
                created_at=doc.created_at
            ))

    return authorized_docs

@router.get("/{doc_id}", response_model=DocumentDetailResponse)
def get_document_detail(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns full content of a document if and only if the current user has verified permission.
    """
    doc = db.query(Document).filter(Document.doc_id == doc_id.strip().upper()).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    eval_result = PolicyEngine.evaluate(current_user, doc)
    if not eval_result.is_allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: {eval_result.reason_description}"
        )

    return DocumentDetailResponse(
        id=doc.id,
        doc_id=doc.doc_id,
        title=doc.title,
        content=doc.content,
        classification=doc.classification,
        allowed_roles=doc.allowed_roles,
        allowed_departments=doc.allowed_departments,
        explicit_denies=doc.explicit_denies,
        version=doc.version,
        lineage_group=doc.lineage_group,
        effective_date=doc.effective_date,
        status=doc.status,
        owner=doc.owner,
        is_searchable=doc.is_searchable,
        summary=doc.summary,
        created_at=doc.created_at
    )
