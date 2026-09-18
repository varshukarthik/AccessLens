import os
import json
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.document import Document
from app.models.leave import LeaveRequest
from app.core.security import get_password_hash

def seed_database(db: Session):
    # 1. Seed Users if not already present
    existing_users = db.query(User).count()
    if existing_users == 0:
        users = [
            User(
                employee_id="U102",
                name="David Chen",
                email="d.chen@novasolutions.internal",
                role="Financial Analyst",
                department="Finance",
                clearance="Internal",
                status="ACTIVE",
                is_admin=False,
                password_hash=get_password_hash("password123")
            ),
            User(
                employee_id="U205",
                name="Sarah Jenkins",
                email="s.jenkins@novasolutions.internal",
                role="Marketing Manager",
                department="Marketing",
                clearance="Internal",
                status="ACTIVE",
                is_admin=False,
                password_hash=get_password_hash("password123")
            ),
            User(
                employee_id="U301",
                name="Michael Ross",
                email="m.ross@novasolutions.internal",
                role="Financial Controller",
                department="Finance",
                clearance="Internal",
                status="ACTIVE",
                is_admin=False,
                password_hash=get_password_hash("password123")
            ),
            User(
                employee_id="Admin",
                name="Elena Vance",
                email="security.admin@novasolutions.internal",
                role="Security Officer",
                department="Security",
                clearance="Restricted",
                status="ACTIVE",
                is_admin=True,
                password_hash=get_password_hash("adminpassword")
            ),
            User(
                employee_id="EXEC001",
                name="Victoria Sterling",
                email="v.sterling@novasolutions.internal",
                role="Chief Executive Officer",
                department="Executive",
                clearance="Restricted",
                status="ACTIVE",
                is_admin=False,
                password_hash=get_password_hash("execpassword")
            ),
        ]
        for u in users:
            db.add(u)
        db.commit()
        print("[Seed] Users seeded successfully.")

    # 2. Seed Documents if not already present
    existing_docs = db.query(Document).count()
    if existing_docs == 0:
        docs = [
            # Standard Financial Outlook Documents
            Document(
                doc_id="DOC-101",
                title="Q4 Revenue Forecast",
                description="Standard departmental Q4 revenue projection of 120 crore.",
                content="Q4 revenue forecast is 120 crore based on validated enterprise customer subscription renewals and finance department financial models.",
                summary="Standard finance departmental Q4 revenue projection of 120 crore.",
                classification="Internal",
                required_clearance="Internal",
                allowed_departments_json='["Finance"]',
                allowed_roles_json='[]',
                explicit_denies_json='[]',
                owner_department="Finance",
                version="2.0",
                lineage_group="REVENUE_FORECAST",
                effective_date="2026-09-01",
                status="ACTIVE",
                uploaded_by="Admin",
                is_searchable=True
            ),
            Document(
                doc_id="DOC-201",
                title="Q4 Revenue Forecast",
                description="Executive restricted Q4 forecast of 145 crore with non-public strategic data.",
                content="Q4 revenue forecast is 145 crore including confidential non-public strategic acquisitions, high-risk executive projections, and inorganic expansion targets.",
                summary="Executive restricted Q4 forecast of 145 crore with non-public strategic data.",
                classification="Restricted",
                required_clearance="Restricted",
                allowed_departments_json='[]',
                allowed_roles_json='["Chief Executive Officer", "Executive", "Security Officer"]',
                explicit_denies_json='[]',
                owner_department="Executive",
                version="3.0",
                lineage_group="REVENUE_FORECAST",
                effective_date="2026-09-01",
                status="ACTIVE",
                uploaded_by="Admin",
                is_searchable=True
            ),
            Document(
                doc_id="DOC-301",
                title="Q4 Forecast",
                description="Initial mid-year Q4 financial baseline estimate of 110 crore.",
                content="Q4 forecast is 110 crore baseline projection as calculated during mid-year budget planning.",
                summary="Initial mid-year Q4 financial baseline estimate of 110 crore.",
                classification="Internal",
                required_clearance="Internal",
                allowed_departments_json='["Finance"]',
                allowed_roles_json='[]',
                explicit_denies_json='[]',
                owner_department="Finance",
                version="1.0",
                lineage_group="Q4_FINANCIAL_OUTLOOK",
                effective_date="2026-06-01",
                status="ACTIVE",
                uploaded_by="Admin",
                is_searchable=True
            ),
            Document(
                doc_id="DOC-302",
                title="Q4 Forecast",
                description="Revised effective Q4 forecast of 125 crore superseding version 1.0.",
                content="The latest Q4 forecast is 125 crore revised projection incorporating updated enterprise customer retention figures and contract expansions.",
                summary="Revised effective Q4 forecast of 125 crore superseding version 1.0.",
                classification="Internal",
                required_clearance="Internal",
                allowed_departments_json='["Finance"]',
                allowed_roles_json='[]',
                explicit_denies_json='[]',
                owner_department="Finance",
                version="2.0",
                lineage_group="Q4_FINANCIAL_OUTLOOK",
                effective_date="2026-09-01",
                status="ACTIVE",
                uploaded_by="Admin",
                is_searchable=True
            ),
            Document(
                doc_id="DOC-105",
                title="Regional Budget Allocation & Expense Control Memo",
                description="Financial guidelines for Q4 regional operating expenses.",
                content="Operating budget for regional expansion: North America ₹42 Cr, EMEA ₹38 Cr, APAC ₹30 Cr. Cost optimization targets mandate a 12% reduction in non-essential vendor licenses.",
                summary="Financial guidelines for Q4 regional operating expenses.",
                classification="Internal",
                required_clearance="Internal",
                allowed_departments_json='["Finance"]',
                allowed_roles_json='[]',
                explicit_denies_json='[]',
                owner_department="Finance",
                version="1.0",
                lineage_group="BUDGET_CONTROL",
                effective_date="2026-08-01",
                status="ACTIVE",
                uploaded_by="Admin",
                is_searchable=True
            ),
            # Human Resources Documents
            Document(
                doc_id="DOC-401",
                title="Employee Travel & Expense Policy 2026",
                description="Standard travel guidelines and per diem rates.",
                content="All employees traveling for business must book economy class for flights under 6 hours. Per diem meal allowance is $75 per day. Expenses exceeding $500 require prior manager approval.",
                summary="Standard travel policy guidelines and reimbursement rates.",
                classification="Internal",
                required_clearance="Internal",
                allowed_departments_json='[]',
                allowed_roles_json='[]',
                explicit_denies_json='[]',
                owner_department="Human Resources",
                version="1.2",
                lineage_group="HR_POLICIES",
                effective_date="2026-01-15",
                status="ACTIVE",
                uploaded_by="Admin",
                is_searchable=True
            ),
            Document(
                doc_id="DOC-402",
                title="Employee Remote Work & Leave Guidelines 2026",
                description="Corporate policies on flexible work schedules, paid time off, and parental leave.",
                content="Employees are eligible for 24 days annual paid time off plus 12 regional public holidays. Core collaboration hours are 10:00 AM to 4:00 PM local time. Remote equipment stipends are renewed annually.",
                summary="Corporate policies on flexible work schedules and PTO.",
                classification="Internal",
                required_clearance="Internal",
                allowed_departments_json='[]',
                allowed_roles_json='[]',
                explicit_denies_json='[]',
                owner_department="Human Resources",
                version="2.0",
                lineage_group="HR_POLICIES",
                effective_date="2026-02-01",
                status="ACTIVE",
                uploaded_by="Admin",
                is_searchable=True
            ),
            # Marketing Documents
            Document(
                doc_id="DOC-501",
                title="Q4 Global Brand Marketing Campaign Strategy",
                description="Strategic marketing roadmap and digital campaign allocation for Q4.",
                content="The Q4 marketing campaign focuses on enterprise knowledge security and AI governance, allocating $2.5M to digital thought leadership, partner webinars, and major technology summits.",
                summary="Strategic marketing roadmap and digital campaign allocation for Q4.",
                classification="Internal",
                required_clearance="Internal",
                allowed_departments_json='["Marketing"]',
                allowed_roles_json='[]',
                explicit_denies_json='[]',
                owner_department="Marketing",
                version="1.0",
                lineage_group="MKTG_STRATEGY",
                effective_date="2026-08-15",
                status="ACTIVE",
                uploaded_by="Admin",
                is_searchable=True
            ),
            Document(
                doc_id="DOC-502",
                title="Customer Segmentation & Lead Generation Strategy",
                description="Analysis of high-value enterprise accounts and inbound conversion channels.",
                content="Target customer segments comprise Fortune 500 banks, healthcare networks, and logistics providers. Inbound conversion target is set at 450 enterprise qualified leads for Q4.",
                summary="Customer segmentation and inbound target metrics.",
                classification="Internal",
                required_clearance="Internal",
                allowed_departments_json='["Marketing"]',
                allowed_roles_json='[]',
                explicit_denies_json='[]',
                owner_department="Marketing",
                version="1.1",
                lineage_group="MKTG_STRATEGY",
                effective_date="2026-09-01",
                status="ACTIVE",
                uploaded_by="Admin",
                is_searchable=True
            ),
            # Engineering Documents
            Document(
                doc_id="DOC-601",
                title="Project Aegis Architecture & Security Standards",
                description="Technical security blueprint and compliance standards for internal software systems.",
                content="All internal Nova Solutions microservices must enforce TLS 1.3, mutual certificate authentication, and pre-LLM deterministic authorization gates. Direct database access from frontend clients is strictly prohibited.",
                summary="Technical security blueprint and compliance standards for internal software systems.",
                classification="Confidential",
                required_clearance="Confidential",
                allowed_departments_json='["Security", "Engineering"]',
                allowed_roles_json='[]',
                explicit_denies_json='[]',
                owner_department="Security",
                version="2.4",
                lineage_group="ENG_STANDARDS",
                effective_date="2026-07-10",
                status="ACTIVE",
                uploaded_by="Admin",
                is_searchable=True
            ),
            Document(
                doc_id="DOC-602",
                title="Helix Cloud Migration Deployment Schedule",
                description="Detailed milestone schedule for core microservices cloud migration.",
                content="Helix platform cluster migration to multi-region Kubernetes is scheduled for Q4 release. Target latency SLO is sub-25ms for p95 requests. Rollback procedures are verified and automated.",
                summary="Milestone schedule for core cloud infrastructure.",
                classification="Internal",
                required_clearance="Internal",
                allowed_departments_json='["Engineering", "Operations"]',
                allowed_roles_json='[]',
                explicit_denies_json='[]',
                owner_department="Engineering",
                version="1.0",
                lineage_group="ENG_STANDARDS",
                effective_date="2026-08-20",
                status="ACTIVE",
                uploaded_by="Admin",
                is_searchable=True
            ),
            # Executive Restricted Documents
            Document(
                doc_id="DOC-701",
                title="Project Phoenix - Confidential Acquisition Brief",
                description="Confidential M&A evaluation dossier for Project Phoenix.",
                content="Strategic acquisition memorandum for target entity codenamed Phoenix. Preliminary enterprise valuation estimated at $85M subject to final board audit and regulatory clearance.",
                summary="Confidential M&A evaluation dossier for Project Phoenix.",
                classification="Restricted",
                required_clearance="Restricted",
                allowed_departments_json='[]',
                allowed_roles_json='["Chief Executive Officer", "Executive"]',
                explicit_denies_json='[]',
                owner_department="Executive",
                version="1.0",
                lineage_group="MA_PIPELINE",
                effective_date="2026-09-10",
                status="ACTIVE",
                uploaded_by="Admin",
                is_searchable=True
            ),
        ]
        for d in docs:
            db.add(d)
        db.commit()
        print("[Seed] Documents seeded successfully.")

    # 3. Ensure all existing users have manager_id and leave_balance
    user_updates = {
        "U102": ("U301", 18),
        "U205": ("EXEC001", 15),
        "U301": ("EXEC001", 22),
        "Admin": ("EXEC001", 20),
        "EXEC001": (None, 25)
    }
    for emp_id, (mgr_id, bal) in user_updates.items():
        u = db.query(User).filter(User.employee_id == emp_id).first()
        if u:
            u.manager_id = mgr_id
            if not u.leave_balance or u.leave_balance == 0:
                u.leave_balance = bal
    db.commit()

    # 4. Seed Leave Policy Document if missing
    existing_doc = db.query(Document).filter(Document.doc_id == "DOC-401").first()
    if not existing_doc:
        doc_401 = Document(
            doc_id="DOC-401",
            title="Nova Solutions Employee Leave and Attendance Policy",
            description="Comprehensive guidelines governing annual casual, sick, personal time-off, and manager approval hierarchy.",
            content="All active Nova Solutions employees receive 18 days of standard annual paid leave per calendar year. Leave requests must be submitted through the NexusGuard enterprise assistant and are subject to validation against current leave balances, date chronological validity, and department operational coverage. Overlapping leave requests and requests exceeding available balances are automatically blocked. All submissions are deterministically routed to the employee's direct manager or authorized department administrator. Self-approval of leave requests is strictly forbidden under corporate governance regulations.",
            summary="Official corporate guidelines on leave allocation, manager approval routing, and self-approval restrictions.",
            classification="Internal",
            required_clearance="Internal",
            allowed_departments_json="[]",
            allowed_roles_json="[]",
            explicit_denies_json="[]",
            owner_department="Human Resources",
            version="1.0",
            lineage_group="HR_POLICIES",
            effective_date="2026-09-01",
            status="ACTIVE",
            uploaded_by="Admin",
            is_searchable=True
        )
        db.add(doc_401)
        db.commit()

    # 5. Seed initial Leave Requests
    if db.query(LeaveRequest).count() == 0:
        seed_leaves = [
            LeaveRequest(
                request_id="LEV-2026-001",
                employee_id="U102",
                employee_name="David Chen",
                department="Finance",
                leave_type="Casual",
                start_date="2026-08-10",
                end_date="2026-08-11",
                days_count=2,
                reason="Personal family commitment.",
                status="Approved",
                approver_id="U301",
                approver_name="Michael Ross"
            ),
            LeaveRequest(
                request_id="LEV-2026-002",
                employee_id="U205",
                employee_name="Sarah Jenkins",
                department="Marketing",
                leave_type="Annual",
                start_date="2026-09-28",
                end_date="2026-09-30",
                days_count=3,
                reason="Annual scheduled vacation.",
                status="Pending",
                approver_id="EXEC001",
                approver_name="Victoria Sterling"
            ),
            LeaveRequest(
                request_id="LEV-2026-003",
                employee_id="U301",
                employee_name="Michael Ross",
                department="Finance",
                leave_type="Personal",
                start_date="2026-10-05",
                end_date="2026-10-06",
                days_count=2,
                reason="Personal business errands.",
                status="Pending",
                approver_id="EXEC001",
                approver_name="Victoria Sterling"
            )
        ]
        for lr in seed_leaves:
            db.add(lr)
        db.commit()
        print("[Seed] Leave requests and HR policy seeded successfully.")

    # 6. Ingest full dataset bundle if present
    bundle_path = os.path.join(os.path.dirname(__file__), "dataset_bundle.json")
    if os.path.exists(bundle_path):
        try:
            with open(bundle_path, "r", encoding="utf-8") as f:
                bundle = json.load(f)

            # Ingest bundle users if missing
            bundle_users = bundle.get("demo_users", bundle.get("users", []))
            for u_data in bundle_users:
                existing_u = db.query(User).filter(User.employee_id == u_data["employee_id"]).first()
                if not existing_u:
                    groups_list = []
                    raw_projs = u_data.get("assigned_projects", "")
                    if raw_projs and "none" not in raw_projs.lower():
                        groups_list = [p.strip() for p in raw_projs.replace(";", ",").split(",") if p.strip()]

                    new_user = User(
                        employee_id=u_data["employee_id"],
                        name=u_data["name"],
                        email=u_data["email"],
                        role=u_data["role"],
                        department=u_data["department"],
                        clearance=u_data["clearance"],
                        status=u_data.get("status", "ACTIVE"),
                        is_admin=u_data.get("is_admin", False),
                        is_active=(u_data.get("status", "ACTIVE") == "ACTIVE"),
                        manager_id=u_data.get("manager_id"),
                        leave_balance=u_data.get("leave_balance", 18),
                        groups_json=json.dumps(groups_list),
                        password_hash=get_password_hash("password123")
                    )
                    db.add(new_user)
            db.commit()

            # Ingest bundle documents
            bundle_docs = bundle.get("documents", [])
            for d_data in bundle_docs:
                existing_d = db.query(Document).filter(Document.doc_id == d_data["doc_id"]).first()
                if not existing_d:
                    new_doc = Document(
                        doc_id=d_data["doc_id"],
                        title=d_data["title"],
                        description=d_data.get("description", ""),
                        content=d_data["content"],
                        summary=d_data.get("summary", ""),
                        classification=d_data.get("classification", "Internal"),
                        required_clearance=d_data.get("required_clearance", "Internal"),
                        allowed_departments_json=json.dumps(d_data.get("allowed_departments", [])),
                        allowed_roles_json=json.dumps(d_data.get("allowed_roles", [])),
                        explicit_denies_json=json.dumps(d_data.get("explicit_denies", [])),
                        owner_department=d_data.get("owner_department", "Corporate"),
                        version=d_data.get("version", "1.0"),
                        lineage_group=d_data.get("lineage_group", "GENERAL"),
                        effective_date=d_data.get("effective_date", "2026-09-01"),
                        status=d_data.get("status", "ACTIVE"),
                        uploaded_by="Admin",
                        is_searchable=d_data.get("is_searchable", True)
                    )
                    db.add(new_doc)
            db.commit()
            print(f"[Seed] Ingested dataset bundle: {len(bundle_users)} users, {len(bundle_docs)} documents.")
        except Exception as e:
            print(f"[Seed] Failed to ingest dataset bundle: {e}")
            db.rollback()

