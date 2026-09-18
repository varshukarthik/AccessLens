from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.schemas.research import ResearchQueryRequest, ResearchResponse, ResearchSessionResponse, ChatMessageResponse, CitationItem
from app.services.orchestrator import ResearchOrchestrator

router = APIRouter(prefix="/research", tags=["NexusGuard Research Assistant"])

@router.post("/query", response_model=ResearchResponse)
async def query_nexusguard(
    req: ResearchQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.query or not req.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty."
        )

    response = await ResearchOrchestrator.process_query(
        db=db,
        user=current_user,
        query=req.query,
        session_id=req.session_id
    )
    return response

@router.get("/sessions", response_model=List[ResearchSessionResponse])
def get_user_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.updated_at.desc()).all()
    results = []
    for s in sessions:
        msgs = db.query(ChatMessage).filter(ChatMessage.session_id == s.session_id).order_by(ChatMessage.created_at.asc()).all()
        msg_responses = []
        for m in msgs:
            citations = [CitationItem(**c) if isinstance(c, dict) else c for c in m.citations]
            msg_responses.append(ChatMessageResponse(
                id=m.id,
                session_id=m.session_id,
                sender=m.sender,
                content=m.content,
                citations=citations,
                evidence_status=m.evidence_status,
                request_id=m.request_id,
                created_at=m.created_at
            ))
        results.append(ResearchSessionResponse(
            session_id=s.session_id,
            title=s.title,
            created_at=s.created_at,
            messages=msg_responses
        ))
    return results

@router.get("/sessions/{session_id}", response_model=ResearchSessionResponse)
def get_session_detail(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research session not found.")
    
    msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session.session_id).order_by(ChatMessage.created_at.asc()).all()
    msg_responses = []
    for m in msgs:
        citations = [CitationItem(**c) if isinstance(c, dict) else c for c in m.citations]
        msg_responses.append(ChatMessageResponse(
            id=m.id,
            session_id=m.session_id,
            sender=m.sender,
            content=m.content,
            citations=citations,
            evidence_status=m.evidence_status,
            request_id=m.request_id,
            created_at=m.created_at
        ))
    
    return ResearchSessionResponse(
        session_id=session.session_id,
        title=session.title,
        created_at=session.created_at,
        messages=msg_responses
    )
