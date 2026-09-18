import pytest
from app.services.policy_engine import PolicyEngine

class MockUser:
    def __init__(self, employee_id, role, department, clearance, is_admin=False):
        self.employee_id = employee_id
        self.role = role
        self.department = department
        self.clearance = clearance
        self.is_admin = is_admin

class MockDoc:
    def __init__(self, doc_id, title, classification, allowed_departments=None, allowed_roles=None, explicit_denies=None):
        self.doc_id = doc_id
        self.title = title
        self.classification = classification
        self.allowed_departments = allowed_departments or []
        self.allowed_roles = allowed_roles or []
        self.explicit_denies = explicit_denies or []

def test_clearance_hierarchy_allow():
    user = MockUser("U100", "Engineer", "Engineering", "Confidential")
    doc = MockDoc("DOC-1", "Public Notes", "Public")
    res = PolicyEngine.evaluate(user, doc)
    assert res.is_allowed is True
    assert res.reason_code == "ALLOWED"

    doc2 = MockDoc("DOC-2", "Internal Handbook", "Internal")
    res2 = PolicyEngine.evaluate(user, doc2)
    assert res2.is_allowed is True

    doc3 = MockDoc("DOC-3", "Confidential Architecture", "Confidential")
    res3 = PolicyEngine.evaluate(user, doc3)
    assert res3.is_allowed is True

def test_clearance_hierarchy_deny():
    user = MockUser("U102", "Finance", "Finance", "Internal")
    doc = MockDoc("DOC-201", "Executive Strategy", "Restricted")
    res = PolicyEngine.evaluate(user, doc)
    assert res.is_allowed is False
    assert res.reason_code == "CLEARANCE_INSUFFICIENT"

def test_department_restriction():
    finance_user = MockUser("U102", "Finance", "Finance", "Internal")
    mktg_user = MockUser("U205", "Marketing", "Marketing", "Internal")
    
    finance_doc = MockDoc("DOC-101", "Finance Forecast", "Internal", allowed_departments=["Finance"])
    
    # Allowed for Finance
    res1 = PolicyEngine.evaluate(finance_user, finance_doc)
    assert res1.is_allowed is True
    assert res1.reason_code == "ALLOWED"
    
    # Denied for Marketing
    res2 = PolicyEngine.evaluate(mktg_user, finance_doc)
    assert res2.is_allowed is False
    assert res2.reason_code == "DEPARTMENT_NOT_ALLOWED"

def test_role_restriction():
    exec_user = MockUser("EXEC001", "Executive", "Executive", "Restricted")
    finance_user = MockUser("U102", "Finance", "Finance", "Restricted")  # High clearance but wrong role
    
    board_doc = MockDoc("DOC-BOARD", "Board Decisions", "Restricted", allowed_roles=["Executive"])
    
    assert PolicyEngine.evaluate(exec_user, board_doc).is_allowed is True
    
    res = PolicyEngine.evaluate(finance_user, board_doc)
    assert res.is_allowed is False
    assert res.reason_code == "ROLE_NOT_ALLOWED"

def test_explicit_deny():
    user = MockUser("U999", "Finance", "Finance", "Restricted")
    doc = MockDoc("DOC-SPECIAL", "Audit Document", "Internal", allowed_departments=["Finance"], explicit_denies=["U999"])
    
    res = PolicyEngine.evaluate(user, doc)
    assert res.is_allowed is False
    assert res.reason_code == "EXPLICIT_DENY"

def test_missing_or_malformed_metadata_default_deny():
    user = MockUser("U102", "Finance", "Finance", "Restricted")
    
    # Missing classification
    doc_bad = MockDoc("DOC-BAD", "No Class", None)
    res = PolicyEngine.evaluate(user, doc_bad)
    assert res.is_allowed is False
    assert res.reason_code == "INVALID_POLICY_METADATA"

    # Unknown classification string
    doc_unknown = MockDoc("DOC-UNK", "Weird Class", "SuperSecretOmega")
    res2 = PolicyEngine.evaluate(user, doc_unknown)
    assert res2.is_allowed is False
    assert res2.reason_code == "INVALID_POLICY_METADATA"
