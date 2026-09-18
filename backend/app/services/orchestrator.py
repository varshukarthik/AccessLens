import time
import uuid
from datetime import datetime, timezone
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
from app.services.action_engine import ActionEngine

class ResearchOrchestrator:
    """
    Dual-Capability Enterprise Assistant Orchestrator:
    1. Secure Enterprise Information Retrieval (Deterministic Pre-LLM ABAC gating)
    2. Governed Workplace Actions (Leave applications, balance queries, approval routing)
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
            else:
                chat_session.updated_at = datetime.now(timezone.utc)
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

        # Step 2: Intent Classification (Workplace Action vs Status Inquiry vs Document Retrieval)
        is_action, action_type = ActionEngine.is_action_intent(query)

        # -------------------------------------------------------------
        # WORKPLACE ACTION: LEAVE APPLICATION
        # -------------------------------------------------------------
        if is_action and action_type == 'LEAVE_APPLICATION':
            params = ActionEngine.parse_leave_request_params(query)
            result = ActionEngine.validate_and_apply_leave(
                db=db,
                user=user,
                start_date=params['start_date'],
                end_date=params['end_date'],
                leave_type=params.get('leave_type', 'Casual'),
                reason=params.get('reason')
            )

            if result['success']:
                leave_req = result['leave_request']
                answer_text = (
                    f"Your leave application has been registered successfully.\n\n"
                    f"• Request ID: {leave_req.request_id}\n"
                    f"• Type: {leave_req.leave_type} Leave\n"
                    f"• Period: {leave_req.start_date} to {leave_req.end_date} ({leave_req.days_count} business day{'s' if leave_req.days_count > 1 else ''})\n"
                    f"• Reason: {leave_req.reason}\n"
                    f"• Status: Pending Manager Approval\n"
                    f"• Approver: {result['approver_name']} ({result['approver_id']})\n"
                    f"• Remaining Available Balance: {result['remaining_balance']} days\n\n"
                    f"This request has been routed to your approver's queue under Corporate Policy. "
                    f"You can monitor the status anytime under 'My Tasks' or ask NexusGuard."
                )
                action_card = {
                    'action_type': 'LEAVE_APPLICATION',
                    'action_status': 'PENDING_APPROVAL',
                    'request_id': leave_req.request_id,
                    'title': f"{leave_req.leave_type} Leave Request",
                    'summary': f"{leave_req.days_count} days from {leave_req.start_date} to {leave_req.end_date}",
                    'details': {
                        'Request ID': leave_req.request_id,
                        'Duration': f"{leave_req.days_count} days",
                        'Status': 'Pending Approval',
                        'Assigned Approver': f"{result['approver_name']} ({result['approver_id']})",
                        'Remaining Balance': f"{result['remaining_balance']} days"
                    }
                }
                status = "ACTION_PROCESSED"
                evidence_status = "WORKPLACE_ACTION"
            else:
                answer_text = f"Unable to process leave application: {result['error']}"
                action_card = {
                    'action_type': 'LEAVE_APPLICATION',
                    'action_status': 'ERROR',
                    'title': "Leave Application Failed",
                    'summary': result['error'],
                    'details': {'Error': result['error']}
                }
                status = "ERROR"
                evidence_status = "WORKPLACE_ACTION"

            # Save assistant message
            assistant_msg = ChatMessage(
                session_id=session_id,
                user_id=user.id,
                sender="nexusguard",
                content=answer_text,
                evidence_status=evidence_status,
                request_id=request_id
            )
            assistant_msg.citations = []
            db.add(assistant_msg)
            db.commit()

            return ResearchResponse(
                request_id=request_id,
                status=status,
                answer=answer_text,
                citations=[],
                evidence_status=evidence_status,
                session_id=session_id,
                action_card=action_card
            )

        # -------------------------------------------------------------
        # WORKPLACE ACTION: LEAVE BALANCE INQUIRY
        # -------------------------------------------------------------
        if is_action and action_type == 'LEAVE_BALANCE_INQUIRY':
            summary = ActionEngine.get_user_leave_summary(db, user)
            answer_text = (
                f"Here is your official leave balance summary for {user.name} ({user.department}):\n\n"
                f"• Total Annual Allocation: {summary['total_allocated']} days\n"
                f"• Approved / Used Days: {summary['used_days']} days\n"
                f"• Pending Approval: {summary['pending_days']} days\n"
                f"• Available to Request: {summary['available_balance']} days\n\n"
                f"All leave requests are subject to approval by your designated manager."
            )
            action_card = {
                'action_type': 'LEAVE_BALANCE',
                'action_status': 'SUCCESS',
                'title': "Leave Quota & Balance",
                'summary': f"{summary['available_balance']} days available",
                'details': {
                    'Available Balance': f"{summary['available_balance']} days",
                    'Pending Days': f"{summary['pending_days']} days",
                    'Used Days': f"{summary['used_days']} days",
                    'Total Allocated': f"{summary['total_allocated']} days"
                }
            }
            assistant_msg = ChatMessage(
                session_id=session_id,
                user_id=user.id,
                sender="nexusguard",
                content=answer_text,
                evidence_status="WORKPLACE_ACTION",
                request_id=request_id
            )
            assistant_msg.citations = []
            db.add(assistant_msg)
            db.commit()

            return ResearchResponse(
                request_id=request_id,
                status="ACTION_PROCESSED",
                answer=answer_text,
                citations=[],
                evidence_status="WORKPLACE_ACTION",
                session_id=session_id,
                action_card=action_card
            )

        # -------------------------------------------------------------
        # WORKPLACE ACTION: LEAVE STATUS INQUIRY
        # -------------------------------------------------------------
        if is_action and action_type == 'LEAVE_STATUS_INQUIRY':
            summary = ActionEngine.get_user_leave_summary(db, user)
            reqs = summary['recent_requests']
            if not reqs:
                answer_text = f"You do not currently have any submitted leave requests on record. You can apply anytime by saying: 'Apply leave from [start date] to [end date]'."
            else:
                lines = [f"Found {len(reqs)} leave request(s) on your record:\n"]
                for r in reqs[-5:]:
                    status_note = f" (Approver: {r.approver_name or r.approver_id})" if r.status == 'Pending' else ""
                    if r.status == 'Rejected' and r.rejection_reason:
                        status_note += f" - Reason: {r.rejection_reason}"
                    lines.append(f"• [{r.status.upper()}] {r.request_id}: {r.start_date} to {r.end_date} ({r.days_count} days, {r.leave_type}){status_note}")
                answer_text = "\n".join(lines)

            action_card = {
                'action_type': 'LEAVE_STATUS',
                'action_status': 'SUCCESS',
                'title': "Leave Requests Status",
                'summary': f"{len(reqs)} requests tracked",
                'details': {'Total Requests': len(reqs)}
            }

            assistant_msg = ChatMessage(
                session_id=session_id,
                user_id=user.id,
                sender="nexusguard",
                content=answer_text,
                evidence_status="WORKPLACE_ACTION",
                request_id=request_id
            )
            assistant_msg.citations = []
            db.add(assistant_msg)
            db.commit()

            return ResearchResponse(
                request_id=request_id,
                status="ACTION_PROCESSED",
                answer=answer_text,
                citations=[],
                evidence_status="WORKPLACE_ACTION",
                session_id=session_id,
                action_card=action_card
            )

        # -------------------------------------------------------------
        # INFORMATION RETRIEVAL PIPELINE (11-Step Deterministic ABAC)
        # -------------------------------------------------------------
        sanitized_query = query.strip()

        # Step 3: Candidate Retrieval
        candidates: List[Document] = DocumentRetriever.retrieve_candidates(db, sanitized_query)
        candidate_ids = [doc.doc_id for doc in candidates]

        # Step 4: Deterministic Authorization Gate
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
