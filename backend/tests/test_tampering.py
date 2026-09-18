import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.services.seed_data import seed_database
from app.core.security import create_access_token

@pytest.fixture(autouse=True, scope="function")
def init_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

def test_unauthenticated_protected_route_fails():
    with TestClient(app) as client:
        res = client.get("/api/documents")
        assert res.status_code == 401

def test_admin_route_forbidden_for_regular_employee():
    token = create_access_token(
        subject="U102",
        extra_claims={"user_id": 1, "role": "Finance", "department": "Finance", "clearance": "Internal", "is_admin": False}
    )
    headers = {"Authorization": f"Bearer {token}"}
    
    with TestClient(app) as client:
        res = client.get("/api/admin/overview", headers=headers)
        assert res.status_code == 403

def test_admin_route_allowed_for_admin():
    token = create_access_token(
        subject="Admin",
        extra_claims={"user_id": 4, "role": "Admin", "department": "Security", "clearance": "Restricted", "is_admin": True}
    )
    headers = {"Authorization": f"Bearer {token}"}
    
    with TestClient(app) as client:
        res = client.get("/api/admin/overview", headers=headers)
        assert res.status_code == 200
        assert "total_documents" in res.json()

def test_employee_response_has_no_admin_traces():
    token = create_access_token(
        subject="U102",
        extra_claims={"user_id": 1, "role": "Finance", "department": "Finance", "clearance": "Internal", "is_admin": False}
    )
    headers = {"Authorization": f"Bearer {token}"}
    
    with TestClient(app) as client:
        res = client.post(
            "/api/research/query",
            json={"query": "What is the Q4 revenue forecast?"},
            headers=headers
        )
        assert res.status_code == 200
        data = res.json()
        assert "candidate_ids" not in data
        assert "authorization_decisions" not in data
        assert "llm_evidence_ids" not in data
        assert "selected_ids" not in data
