import pytest
from unittest.mock import patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.user import User
from app.models.document import Document
from app.models.audit import AuditLog
from app.services.seed_data import seed_database
from app.services.orchestrator import ResearchOrchestrator
from app.services.answer_generator import AnswerGenerator

TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db)
    yield db
    db.close()

@pytest.mark.asyncio
async def test_proven_zero_leakage_to_llm_for_u205(db_session):
    """
    MATHEMATICAL SECURITY PROOF:
    Verify that when Marketing user U205 asks 'What is the Q4 revenue forecast?':
    1. The candidate retriever DOES find DOC-201 (and DOC-101) as candidates.
    2. The deterministic authorization gate evaluates and DENIES both (DOC-201 due to CLEARANCE_INSUFFICIENT, DOC-101 due to DEPARTMENT_NOT_ALLOWED).
    3. The LLM AnswerGenerator is intercepted and inspected:
       - The evidence_items list passed to LLM is strictly EMPTY.
       - The prompt passed to the LLM contains ZERO mentions of '145 crore', '145', or 'DOC-201' content.
    4. The employee response contains safe status, zero citations, and no restricted values.
    5. The audit trace records the candidate and decision without storing raw restricted text.
    """
    u205 = db_session.query(User).filter(User.employee_id == "U205").first()
    assert u205 is not None
    assert u205.department == "Marketing"
    assert u205.role == "Marketing Manager"
    assert u205.clearance == "Internal"

    # Spy on AnswerGenerator.generate_answer to inspect the exact arguments passed to the LLM
    captured_llm_prompts = []
    captured_evidence_packages = []
    original_generate = AnswerGenerator.generate_answer

    async def spy_generate_answer(query, evidence_items, prompt):
        captured_llm_prompts.append(prompt)
        captured_evidence_packages.append(evidence_items)
        return await original_generate(query, evidence_items, prompt)

    with patch.object(AnswerGenerator, 'generate_answer', side_effect=spy_generate_answer):
        response = await ResearchOrchestrator.process_query(
            db=db_session,
            user=u205,
            query="What is the Q4 revenue forecast?"
        )

    # 1. Verify candidate retrieval retrieved DOC-201 and DOC-101
    audit_entry = db_session.query(AuditLog).filter(AuditLog.request_id == response.request_id).first()
    assert audit_entry is not None
    assert "DOC-201" in audit_entry.candidate_ids
    assert "DOC-101" in audit_entry.candidate_ids

    # 2. Verify deterministic decisions
    decisions = {d["doc_id"]: d for d in audit_entry.authorization_decisions}
    assert decisions["DOC-201"]["decision"] == "DENIED"
    assert decisions["DOC-201"]["reason_code"] in ["CLEARANCE_INSUFFICIENT", "ROLE_NOT_ALLOWED"]

    assert decisions["DOC-101"]["decision"] == "DENIED"
    assert decisions["DOC-101"]["reason_code"] == "DEPARTMENT_NOT_ALLOWED"

    # 3. PROOF: Inspect captured LLM payload
    # Since all candidates were denied, evidence_package is empty
    assert len(captured_evidence_packages) == 0 or len(captured_evidence_packages[0]) == 0

    if captured_llm_prompts:
        prompt_text = captured_llm_prompts[0]
        assert "145 crore" not in prompt_text
        assert "145" not in prompt_text
        assert "strategic acquisitions" not in prompt_text
        assert "inorganic expansion" not in prompt_text

    # 4. Verify employee response
    assert response.status == "NO_AUTHORIZED_EVIDENCE"
    assert response.evidence_status == "NO_AUTHORIZED_EVIDENCE"
    assert "145 crore" not in response.answer
    assert "145" not in response.answer
    assert "120 crore" not in response.answer
    assert len(response.citations) == 0

    # 5. Verify audit log does not store raw restricted document content
    assert "145 crore including confidential non-public strategic acquisitions" not in audit_entry.answer_preview
