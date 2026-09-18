from typing import Optional, List, Dict, Any
from dataclasses import dataclass

# Strict classification order
CLASSIFICATION_LEVELS = {
    "PUBLIC": 0,
    "INTERNAL": 1,
    "CONFIDENTIAL": 2,
    "RESTRICTED": 3,
}

REASON_CODES = {
    "ALLOWED": "Access permitted under active attribute and policy rules.",
    "CLEARANCE_INSUFFICIENT": "User clearance level is insufficient for document required clearance.",
    "ROLE_NOT_ALLOWED": "User role is not within the allowed roles specified for this document policy.",
    "DEPARTMENT_NOT_ALLOWED": "User department is not within the authorized departments for this document policy.",
    "INVALID_POLICY_METADATA": "Document access metadata is malformed or missing required security attributes (Default Deny).",
    "EXPLICIT_DENY": "Access explicitly denied by administrative policy rule.",
    "ACCOUNT_INACTIVE": "User account is suspended or inactive.",
}

@dataclass
class PolicyEvaluationResult:
    doc_id: str
    title: str
    classification: str
    is_allowed: bool
    reason_code: str
    reason_description: str

    @property
    def reason(self) -> str:
        return self.reason_description

    def to_dict(self) -> Dict[str, Any]:
        return {
            "doc_id": self.doc_id,
            "title": self.title,
            "classification": self.classification,
            "decision": "ALLOWED" if self.is_allowed else "DENIED",
            "reason_code": self.reason_code,
            "reason_description": self.reason_description,
        }

class PolicyEngine:
    """
    Deterministic Attribute-Based Access Control (ABAC) Policy Engine.
    Evaluates permissions BEFORE any document content reaches the LLM context or employee payload.
    Does NOT depend on employee names, hardcoded identity switches, or the LLM.
    """

    @staticmethod
    def evaluate(user: Any, document: Any) -> PolicyEvaluationResult:
        doc_id = getattr(document, "doc_id", "UNKNOWN_DOC")
        title = getattr(document, "title", "Untitled")
        raw_classification = getattr(document, "classification", None)
        raw_required_clearance = getattr(document, "required_clearance", raw_classification)

        # 1. Check for active user account status
        user_is_active = getattr(user, "is_active", True)
        user_status = getattr(user, "status", "ACTIVE")
        if not user_is_active or user_status.upper() != "ACTIVE":
            return PolicyEvaluationResult(
                doc_id=doc_id,
                title=title,
                classification=str(raw_classification) if raw_classification else "UNKNOWN",
                is_allowed=False,
                reason_code="ACCOUNT_INACTIVE",
                reason_description=REASON_CODES["ACCOUNT_INACTIVE"],
            )

        # 2. Check for missing / malformed classification and clearance metadata (Default Deny)
        if not raw_classification or not isinstance(raw_classification, str):
            return PolicyEvaluationResult(
                doc_id=doc_id,
                title=title,
                classification=str(raw_classification) if raw_classification else "UNKNOWN",
                is_allowed=False,
                reason_code="INVALID_POLICY_METADATA",
                reason_description=REASON_CODES["INVALID_POLICY_METADATA"],
            )

        classification_upper = raw_classification.strip().upper()
        if classification_upper not in CLASSIFICATION_LEVELS:
            return PolicyEvaluationResult(
                doc_id=doc_id,
                title=title,
                classification=raw_classification,
                is_allowed=False,
                reason_code="INVALID_POLICY_METADATA",
                reason_description=REASON_CODES["INVALID_POLICY_METADATA"],
            )

        # Required clearance level on document
        req_clearance_str = str(raw_required_clearance).strip().upper() if raw_required_clearance else classification_upper
        doc_required_level = CLASSIFICATION_LEVELS.get(req_clearance_str, CLASSIFICATION_LEVELS[classification_upper])

        # User clearance level
        user_clearance = getattr(user, "clearance", "INTERNAL")
        if not user_clearance or not isinstance(user_clearance, str):
            user_clearance = "INTERNAL"
        user_clearance_upper = user_clearance.strip().upper()
        user_level = CLASSIFICATION_LEVELS.get(user_clearance_upper, 0)

        # 3. Check explicit deny rules
        explicit_denies = getattr(document, "explicit_denies", [])
        if explicit_denies is None:
            explicit_denies = []
        user_emp_id = getattr(user, "employee_id", "")
        user_role = getattr(user, "role", "")
        user_dept = getattr(user, "department", "")

        if user_emp_id in explicit_denies or user_role in explicit_denies or user_dept in explicit_denies:
            return PolicyEvaluationResult(
                doc_id=doc_id,
                title=title,
                classification=raw_classification,
                is_allowed=False,
                reason_code="EXPLICIT_DENY",
                reason_description=REASON_CODES["EXPLICIT_DENY"],
            )

        # 4. Check clearance hierarchy (User Clearance >= Document Required Clearance)
        if user_level < doc_required_level:
            return PolicyEvaluationResult(
                doc_id=doc_id,
                title=title,
                classification=raw_classification,
                is_allowed=False,
                reason_code="CLEARANCE_INSUFFICIENT",
                reason_description=REASON_CODES["CLEARANCE_INSUFFICIENT"],
            )

        # 5. Check department restriction: allowed_departments is empty OR user.department is in allowed_departments
        allowed_depts = getattr(document, "allowed_departments", [])
        if allowed_depts is None:
            allowed_depts = []
        if len(allowed_depts) > 0:
            allowed_depts_normalized = [d.strip().lower() for d in allowed_depts if isinstance(d, str)]
            if user_dept.strip().lower() not in allowed_depts_normalized:
                return PolicyEvaluationResult(
                    doc_id=doc_id,
                    title=title,
                    classification=raw_classification,
                    is_allowed=False,
                    reason_code="DEPARTMENT_NOT_ALLOWED",
                    reason_description=REASON_CODES["DEPARTMENT_NOT_ALLOWED"],
                )

        # 6. Check role restriction: allowed_roles is empty OR user.role is in allowed_roles
        allowed_roles = getattr(document, "allowed_roles", [])
        if allowed_roles is None:
            allowed_roles = []
        if len(allowed_roles) > 0:
            allowed_roles_normalized = [r.strip().lower() for r in allowed_roles if isinstance(r, str)]
            if user_role.strip().lower() not in allowed_roles_normalized:
                return PolicyEvaluationResult(
                    doc_id=doc_id,
                    title=title,
                    classification=raw_classification,
                    is_allowed=False,
                    reason_code="ROLE_NOT_ALLOWED",
                    reason_description=REASON_CODES["ROLE_NOT_ALLOWED"],
                )

        # Passed all deterministic policy attribute gates
        return PolicyEvaluationResult(
            doc_id=doc_id,
            title=title,
            classification=raw_classification,
            is_allowed=True,
            reason_code="ALLOWED",
            reason_description=REASON_CODES["ALLOWED"],
        )
