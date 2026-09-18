import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.user import User
from app.models.document import Document
from app.services.seed_data import seed_database
from app.services.orchestrator import ResearchOrchestrator

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
async def test_scenario_a_authorized_finance_user(db_session):
    u102 = db_session.query(User).filter(User.employee_id == "U102").first()
    assert u102 is not None

    response = await ResearchOrchestrator.process_query(
        db=db_session,
        user=u102,
        query="What is the Q4 revenue forecast?"
    )

    assert response.status == "SUCCESS"
    assert response.evidence_status == "AUTHORIZED_EVIDENCE_USED"
    assert "120 crore" in response.answer or "120" in response.answer
    assert any(c.document_id == "DOC-101" for c in response.citations)
    assert "145 crore" not in response.answer
    assert not any(c.document_id == "DOC-201" for c in response.citations)

@pytest.mark.asyncio
async def test_scenario_b_unauthorized_marketing_user(db_session):
    u205 = db_session.query(User).filter(User.employee_id == "U205").first()
    assert u205 is not None

    response = await ResearchOrchestrator.process_query(
        db=db_session,
        user=u205,
        query="What is the Q4 revenue forecast?"
    )

    assert response.status == "NO_AUTHORIZED_EVIDENCE"
    assert response.evidence_status == "NO_AUTHORIZED_EVIDENCE"
    assert "sufficient accessible evidence" in response.answer.lower()
    assert "145 crore" not in response.answer
    assert "145" not in response.answer
    assert len(response.citations) == 0

@pytest.mark.asyncio
async def test_scenario_c_latest_authorized_version(db_session):
    u301 = db_session.query(User).filter(User.employee_id == "U301").first()
    assert u301 is not None

    response = await ResearchOrchestrator.process_query(
        db=db_session,
        user=u301,
        query="What is the latest Q4 forecast?"
    )

    assert response.status == "SUCCESS"
    assert response.evidence_status == "AUTHORIZED_EVIDENCE_USED"
    assert "125 crore" in response.answer or "125" in response.answer
    assert any(c.document_id == "DOC-302" for c in response.citations)
