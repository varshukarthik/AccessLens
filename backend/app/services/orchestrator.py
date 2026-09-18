import time
import uuid
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.document import Document
from app.models.chat import ChatSession, ChatMessage
from app.schemas.research import ResearchResponse, CitationItem
from app.services.retriever import DocumentRetriever
from app.services.policy_engine import PolicyEngine, PolicyEvaluationResult
from app.services.version_resolver import VersionResolver
from app.services.context_builder import SecureContextBuilder
from app.services.answer_generator import AnswerGenerator, SAFE_NO_ACCESS_MESSAGE
from app.services.citation_validator import CitationValidator
from app.services.audit_logger import AuditLogger

class ResearchOrchestrator:
    """
    Research Orchestrator coordinating the 11-step secure research pipeline.
    Enforces deterministic authorization BEFORE document content reaches LLM context.
    """

    @classmethod
    async def process_query(
        cls,
        db: Session,
        user: User,
        query: str,
        session_id: Optional[str] = None
    ) -> ResearchResponse:
        start_time = time.time()
        request_id = f"REQ-{uuid.uuid4().hex[:8].upper()}"

        # Step 1: Ensure session
        if not session_id:
            session_id = f"SES-{uuid.uuid4().hex[:8].upper()}"
            chat_session = ChatSession(
                session_id=session_id,
                user_id=user.id,
                title=query[:40] + ("..." if len(query) > 40 else "")
            )
            db.add(chat_session)
            db.commit()
        else:
            chat_session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
            if not chat_session:
                chat_session = ChatSession(
                    session_id=session_id,
                    user_id=user.id,
                    title=query[:40] + ("..." if len(query) > 40 else "")
                )
                db.add(chat_session)
                db.commit()

        # Save user message in chat history
        user_msg = ChatMessage(
            session_id=session_id,
            user_id=user.id,
            sender="user",
            content=query,
            request_id=request_id
        )
        db.add(user_msg)
        db.commit()

        # Step 2: Query Understanding & Sanitation
        sanitized_query = query.strip()

        # Step 3: Candidate Retrieval (Finds candidate documents - NO PERMISSIONS GRANTED HERE)
        candidates: List[Document] = DocumentRetriever.retrieve_candidates(db, sanitized_query)
        candidate_ids = [doc.doc_id for doc in candidates]

        # Step 4: Deterministic Authorization Gate (Evaluates EVERY candidate)
        eval_results: List[PolicyEvaluationResult] = []
        authorized_candidates: List[Document] = []

        for candidate in candidates:
            eval_res = PolicyEngine.evaluate(user, candidate)
            eval_results.append(eval_res)
            if eval_res.is_allowed:
                authorized_candidates.append(candidate)

        authorized_ids = [doc.doc_id for doc in authorized_candidates]

        # Step 5 & 6: Version & Conflict Resolution on Authorized Evidence ONLY
        selected_authorized_docs, resolution_meta = VersionResolver.resolve_authorized_versions(
            authorized_candidates, sanitized_query
        )
        selected_ids = [doc.doc_id for doc in selected_authorized_docs]

        # Step 7: Secure Context Builder
        evidence_package = SecureContextBuilder.build_evidence_package(selected_authorized_docs)
        llm_evidence_ids = [item["document_id"] for item in evidence_package]
        llm_prompt = SecureContextBuilder.format_llm_prompt(sanitized_query, evidence_package)

        # Step 8: LLM Answer Generation
        if not evidence_package:
            status = "NO_AUTHORIZED_EVIDENCE"
            evidence_status = "NO_AUTHORIZED_EVIDENCE"
            answer = SAFE_NO_ACCESS_MESSAGE
            validated_citations = []
        else:
            answer = await AnswerGenerator.generate_answer(sanitized_query, evidence_package, llm_prompt)
            if "sufficient accessible evidence" in answer.lower():
                status = "NO_AUTHORIZED_EVIDENCE"
                evidence_status = "NO_AUTHORIZED_EVIDENCE"
                validated_citations = []
            else:
                status = "SUCCESS"
                evidence_status = "AUTHORIZED_EVIDENCE_USED"
                # Step 9: Citation Validation
                validated_citations = CitationValidator.validate_citations(answer, evidence_package)

        # Step 10: Security Audit Logging
        latency_ms = round((time.time() - start_time) * 1000, 2)
        AuditLogger.log_query_execution(
            db=db,
            request_id=request_id,
            user=user,
            query=sanitized_query,
            candidate_ids=candidate_ids,
            eval_results=eval_results,
            authorized_ids=authorized_ids,
            llm_evidence_ids=llm_evidence_ids,
            selected_ids=selected_ids,
            response_status=status,
            answer_preview=answer,
            latency_ms=latency_ms
        )

        # Save assistant message in chat history
        assistant_msg = ChatMessage(
            session_id=session_id,
            user_id=user.id,
            sender="nexusguard",
            content=answer,
            evidence_status=evidence_status,
            request_id=request_id
        )
        assistant_msg.citations = [c.model_dump() for c in validated_citations]
        db.add(assistant_msg)
        db.commit()

        # Step 11: Employee Response (No admin trace leaks)
        return ResearchResponse(
            request_id=request_id,
            status=status,
            answer=answer,
            citations=validated_citations,
            evidence_status=evidence_status,
            session_id=session_id
        )
