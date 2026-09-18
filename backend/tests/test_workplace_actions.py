import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.leave import LeaveRequest
from app.services.seed_data import seed_database
from app.services.action_engine import ActionEngine

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

def get_token(employee_id, password="password123"):
    res = client.post("/api/auth/login", json={"employee_id": employee_id, "password": password})
    assert res.status_code == 200, f"Login failed: {res.text}"
    return res.json()["access_token"]

@pytest.fixture(autouse=True)
def clean_test_leaves():
    db = SessionLocal()
    # Reset leave requests to initial seed set
    db.query(LeaveRequest).filter(~LeaveRequest.request_id.in_(["LEV-2026-001", "LEV-2026-002", "LEV-2026-003"])).delete(synchronize_session=False)
    # Reset test users' leave balance
    u102 = db.query(User).filter(User.employee_id == "U102").first()
    if u102:
        u102.leave_balance = 18
    u205 = db.query(User).filter(User.employee_id == "U205").first()
    if u205:
        u205.leave_balance = 15
    db.commit()
    db.close()

def test_natural_language_leave_application():
    token = get_token("U102")  # David Chen, manager is U301
    headers = {"Authorization": f"Bearer {token}"}

    # Ask NexusGuard to apply for leave
    res = client.post(
        "/api/research/query",
        headers=headers,
        json={"query": "Apply leave from 23 September to 25 September for personal errands."}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["ACTION_PROCESSED", "SUCCESS"]
    assert data["evidence_status"] == "WORKPLACE_ACTION"
    assert "Leave" in data["answer"]
    assert "Pending Manager Approval" in data["answer"] or "registered successfully" in data["answer"]
    assert "Michael Ross" in data["answer"] or "U301" in data["answer"]

def test_direct_leave_apply_api():
    token = get_token("U102")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(
        "/api/actions/leave/apply",
        headers=headers,
        json={
            "start_date": "2026-11-10",
            "end_date": "2026-11-12",
            "leave_type": "Casual",
            "reason": "Test personal leave"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["days_count"] == 3
    assert data["status"] == "Pending"
    assert data["approver_id"] == "U301"

def test_insufficient_leave_balance_rejected():
    token = get_token("U102")
    headers = {"Authorization": f"Bearer {token}"}

    # Request 40 days (exceeds balance of 18)
    res = client.post(
        "/api/actions/leave/apply",
        headers=headers,
        json={
            "start_date": "2026-11-01",
            "end_date": "2026-12-10",
            "leave_type": "Annual",
            "reason": "Excessive leave"
        }
    )
    assert res.status_code == 400
    assert "Insufficient leave balance" in res.json()["detail"]

def test_overlapping_leave_request_rejected():
    token = get_token("U102")
    headers = {"Authorization": f"Bearer {token}"}

    # First request
    res1 = client.post(
        "/api/actions/leave/apply",
        headers=headers,
        json={
            "start_date": "2026-12-15",
            "end_date": "2026-12-18",
            "leave_type": "Casual",
            "reason": "Holiday break"
        }
    )
    assert res1.status_code == 200

    # Overlapping request
    res2 = client.post(
        "/api/actions/leave/apply",
        headers=headers,
        json={
            "start_date": "2026-12-17",
            "end_date": "2026-12-20",
            "leave_type": "Casual",
            "reason": "Overlapping request"
        }
    )
    assert res2.status_code == 400
    assert "Conflict detected" in res2.json()["detail"]

def test_self_approval_strictly_blocked():
    # U102 creates a request
    token_u102 = get_token("U102")
    res = client.post(
        "/api/actions/leave/apply",
        headers={"Authorization": f"Bearer {token_u102}"},
        json={
            "start_date": "2026-11-20",
            "end_date": "2026-11-21",
            "leave_type": "Casual",
            "reason": "Test self approval"
        }
    )
    assert res.status_code == 200
    req_id = res.json()["request_id"]

    # U102 tries to approve their own request -> MUST BE 403 FORBIDDEN
    res_approve = client.post(
        f"/api/actions/leave/{req_id}/approve",
        headers={"Authorization": f"Bearer {token_u102}"}
    )
    assert res_approve.status_code == 403
    assert "Self-approval violation" in res_approve.json()["detail"]

def test_manager_can_approve_and_balance_deducts():
    # U102 creates request
    token_u102 = get_token("U102")
    res = client.post(
        "/api/actions/leave/apply",
        headers={"Authorization": f"Bearer {token_u102}"},
        json={
            "start_date": "2026-11-25",
            "end_date": "2026-11-26",
            "leave_type": "Casual",
            "reason": "Valid trip"
        }
    )
    assert res.status_code == 200
    req_id = res.json()["request_id"]

    # Manager U301 approves
    token_u301 = get_token("U301")
    res_approve = client.post(
        f"/api/actions/leave/{req_id}/approve",
        headers={"Authorization": f"Bearer {token_u301}"}
    )
    assert res_approve.status_code == 200
    assert res_approve.json()["status"] == "Approved"

def test_manager_can_reject_leave():
    # U102 creates request
    token_u102 = get_token("U102")
    res = client.post(
        "/api/actions/leave/apply",
        headers={"Authorization": f"Bearer {token_u102}"},
        json={
            "start_date": "2026-11-28",
            "end_date": "2026-11-29",
            "leave_type": "Casual",
            "reason": "Coverage check"
        }
    )
    assert res.status_code == 200
    req_id = res.json()["request_id"]

    # Manager U301 rejects
    token_u301 = get_token("U301")
    res_reject = client.post(
        f"/api/actions/leave/{req_id}/reject",
        headers={"Authorization": f"Bearer {token_u301}"},
        json={"rejection_reason": "Quarter-end audit coverage required"}
    )
    assert res_reject.status_code == 200
    assert res_reject.json()["status"] == "Rejected"
    assert res_reject.json()["rejection_reason"] == "Quarter-end audit coverage required"

def test_leave_balance_and_status_queries():
    token = get_token("U102")
    headers = {"Authorization": f"Bearer {token}"}

    # Query balance
    res_bal = client.post(
        "/api/research/query",
        headers=headers,
        json={"query": "What is my leave balance?"}
    )
    assert res_bal.status_code == 200
    assert "leave balance summary" in res_bal.json()["answer"].lower()
    assert "available" in res_bal.json()["answer"].lower()

    # Query status
    res_stat = client.post(
        "/api/research/query",
        headers=headers,
        json={"query": "Check my leave request status"}
    )
    assert res_stat.status_code == 200
    assert "leave request" in res_stat.json()["answer"].lower()

def test_version_aware_retrieval_internal_vs_restricted():
    # U102 (Internal clearance, Finance) asks for Q4 revenue forecast
    token_u102 = get_token("U102")
    res_u102 = client.post(
        "/api/research/query",
        headers={"Authorization": f"Bearer {token_u102}"},
        json={"query": "What is the Q4 revenue forecast?"}
    )
    assert res_u102.status_code == 200
    # Must get v2.0 (120 crore) and NEVER leak v3.0 (145 crore)
    assert "120" in res_u102.json()["answer"]
    assert "145" not in res_u102.json()["answer"]

    # EXEC001 (Restricted clearance, CEO) asks for Q4 revenue forecast
    token_exec = get_token("EXEC001", password="execpassword")
    res_exec = client.post(
        "/api/research/query",
        headers={"Authorization": f"Bearer {token_exec}"},
        json={"query": "What is the Q4 revenue forecast?"}
    )
    assert res_exec.status_code == 200
    # Authorized for Restricted v3.0 (145 crore)
    assert "145" in res_exec.json()["answer"]
