from typing import Dict, Any, List
from datetime import datetime, date

ROLE_WORKLOAD_MAP: Dict[str, Dict[str, Any]] = {
    "Finance": {
        "tasks": [
            {
                "task_id": "TASK-101",
                "title": "Review Q4 budget variance models",
                "priority": "High",
                "status": "In Progress",
                "due_date": "2026-09-24",
                "assigned_role": "Financial Analyst",
                "category": "Financial Analysis"
            },
            {
                "task_id": "TASK-102",
                "title": "Reconcile corporate procurement invoice batches",
                "priority": "Medium",
                "status": "Pending Review",
                "due_date": "2026-09-26",
                "assigned_role": "Financial Analyst",
                "category": "Ledger Audit"
            },
            {
                "task_id": "TASK-103",
                "title": "Finalize regional operating cash-flow forecast",
                "priority": "High",
                "status": "In Progress",
                "due_date": "2026-09-28",
                "assigned_role": "Financial Controller",
                "category": "Forecast & Planning"
            },
            {
                "task_id": "TASK-104",
                "title": "Audit Q3 departmental expense allocations",
                "priority": "Low",
                "status": "Completed",
                "due_date": "2026-09-18",
                "assigned_role": "Finance",
                "category": "Compliance"
            }
        ],
        "projects": [
            {
                "id": "PROJ-FIN-01",
                "name": "FY27 Capital Allocation Framework",
                "status": "Active",
                "progress": 72,
                "target_date": "2026-11-15",
                "description": "Strategic modeling for capital expenditure and inorganic expansion evaluation."
            },
            {
                "id": "PROJ-FIN-02",
                "name": "Automated ERP Ledger Sync",
                "status": "In Implementation",
                "progress": 88,
                "target_date": "2026-10-01",
                "description": "Integration of real-time multi-currency transaction streams into primary general ledger."
            },
            {
                "id": "PROJ-FIN-03",
                "name": "Global Tax Compliance Modernization",
                "status": "Planning",
                "progress": 35,
                "target_date": "2026-12-20",
                "description": "Harmonization of statutory reporting across US, UK, Singapore, and India entities."
            }
        ],
        "meetings": [
            {
                "title": "Q4 Financial Leadership Review",
                "time": "Tomorrow, 10:00 AM",
                "location": "Boardroom A / Virtual",
                "organizer": "Finance Operations"
            },
            {
                "title": "External Audit Readiness Check",
                "time": "Thursday, 2:30 PM",
                "location": "Conference Room 402",
                "organizer": "Corporate Controller"
            }
        ]
    },
    "Marketing": {
        "tasks": [
            {
                "task_id": "TASK-201",
                "title": "Finalize Meridian omnichannel campaign media plan",
                "priority": "High",
                "status": "In Progress",
                "due_date": "2026-09-25",
                "assigned_role": "Marketing Manager",
                "category": "Campaign Launch"
            },
            {
                "task_id": "TASK-202",
                "title": "Analyze enterprise lead conversion & CAC metrics",
                "priority": "Medium",
                "status": "In Progress",
                "due_date": "2026-09-27",
                "assigned_role": "Marketing Specialist",
                "category": "Growth Analytics"
            },
            {
                "task_id": "TASK-203",
                "title": "Review enterprise brand guidelines & collateral refresh",
                "priority": "Low",
                "status": "Pending Review",
                "due_date": "2026-09-30",
                "assigned_role": "Marketing",
                "category": "Brand Strategy"
            },
            {
                "task_id": "TASK-204",
                "title": "Coordinate Q4 Global Tech Summit sponsorship",
                "priority": "Medium",
                "status": "Completed",
                "due_date": "2026-09-15",
                "assigned_role": "Marketing Manager",
                "category": "Field Events"
            }
        ],
        "projects": [
            {
                "id": "PROJ-MKT-01",
                "name": "Meridian Global Awareness Campaign",
                "status": "Active",
                "progress": 64,
                "target_date": "2026-10-31",
                "description": "Multi-channel executive outreach across financial, logistics, and retail enterprise buyers."
            },
            {
                "id": "PROJ-MKT-02",
                "name": "Enterprise Thought Leadership Series",
                "status": "In Progress",
                "progress": 45,
                "target_date": "2026-11-20",
                "description": "Industry whitepapers on zero-trust digital transformation and modern operational resilience."
            }
        ],
        "meetings": [
            {
                "title": "Q4 Campaign Performance Standup",
                "time": "Today, 3:00 PM",
                "location": "Virtual Room 2",
                "organizer": "Growth Marketing"
            },
            {
                "title": "Creative Agency Alignment & Asset Review",
                "time": "Wednesday, 11:00 AM",
                "location": "Design Studio 3B",
                "organizer": "Brand Operations"
            }
        ]
    },
    "Engineering": {
        "tasks": [
            {
                "task_id": "TASK-301",
                "title": "Deploy Helix Platform v2.4 release candidate",
                "priority": "High",
                "status": "In Progress",
                "due_date": "2026-09-24",
                "assigned_role": "Software Engineer",
                "category": "Release Engineering"
            },
            {
                "task_id": "TASK-302",
                "title": "Conduct zero-trust architecture threat model review",
                "priority": "High",
                "status": "Pending Review",
                "due_date": "2026-09-26",
                "assigned_role": "Systems Architect",
                "category": "Security Engineering"
            },
            {
                "task_id": "TASK-303",
                "title": "Optimize vector retriever latency & cache hit rates",
                "priority": "Medium",
                "status": "In Progress",
                "due_date": "2026-09-28",
                "assigned_role": "Core Platform",
                "category": "Performance"
            },
            {
                "task_id": "TASK-304",
                "title": "Resolve multi-region cluster failover alert simulation",
                "priority": "Low",
                "status": "Completed",
                "due_date": "2026-09-17",
                "assigned_role": "DevOps",
                "category": "Infrastructure"
            }
        ],
        "projects": [
            {
                "id": "PROJ-ENG-01",
                "name": "Helix Distributed Platform v3",
                "status": "Active Sprint",
                "progress": 82,
                "target_date": "2026-10-15",
                "description": "Next-generation high-throughput microservices architecture with sub-millisecond telemetry."
            },
            {
                "id": "PROJ-ENG-02",
                "name": "Zero-Trust Infrastructure Hardening",
                "status": "In Review",
                "progress": 95,
                "target_date": "2026-09-30",
                "description": "Cryptographic workload isolation, automated mTLS rotation, and policy gate auditing."
            }
        ],
        "meetings": [
            {
                "title": "Core Architecture & RFC Review",
                "time": "Today, 2:00 PM",
                "location": "Eng Lab 1 / Hybrid",
                "organizer": "Platform Lead"
            },
            {
                "title": "Sprint 38 Backlog & Retrospective",
                "time": "Friday, 10:00 AM",
                "location": "Virtual Room Alpha",
                "organizer": "Scrum Master"
            }
        ]
    },
    "Human Resources": {
        "tasks": [
            {
                "task_id": "TASK-401",
                "title": "Coordinate Q3 360-degree performance review cycles",
                "priority": "High",
                "status": "In Progress",
                "due_date": "2026-09-25",
                "assigned_role": "HR Specialist",
                "category": "People Operations"
            },
            {
                "task_id": "TASK-402",
                "title": "Update global remote work & travel expense guidelines",
                "priority": "Medium",
                "status": "Pending Review",
                "due_date": "2026-09-29",
                "assigned_role": "HR Operations",
                "category": "Policy Governance"
            },
            {
                "task_id": "TASK-403",
                "title": "Review senior technical candidate interview pipeline",
                "priority": "Medium",
                "status": "In Progress",
                "due_date": "2026-09-28",
                "assigned_role": "Recruitment",
                "category": "Talent Acquisition"
            }
        ],
        "projects": [
            {
                "id": "PROJ-HR-01",
                "name": "Global Talent Growth 2026-2027",
                "status": "Active",
                "progress": 58,
                "target_date": "2026-12-31",
                "description": "Scaling technical and solution consulting headcount across US, UK, and APAC offices."
            }
        ],
        "meetings": [
            {
                "title": "People Operations Weekly Standup",
                "time": "Daily, 9:00 AM",
                "location": "HR Hub",
                "organizer": "VP People"
            }
        ]
    },
    "Executive": {
        "tasks": [
            {
                "task_id": "TASK-501",
                "title": "Review corporate operating governance compliance report",
                "priority": "High",
                "status": "In Progress",
                "due_date": "2026-09-24",
                "assigned_role": "Executive",
                "category": "Governance"
            },
            {
                "task_id": "TASK-502",
                "title": "Sign off on Q4 cross-functional department operating budgets",
                "priority": "High",
                "status": "Pending Review",
                "due_date": "2026-09-26",
                "assigned_role": "VP Operations",
                "category": "Executive Review"
            },
            {
                "task_id": "TASK-503",
                "title": "Review strategic partnership proposals for APAC expansion",
                "priority": "Medium",
                "status": "In Progress",
                "due_date": "2026-09-30",
                "assigned_role": "Executive",
                "category": "Corporate Strategy"
            }
        ],
        "projects": [
            {
                "id": "PROJ-EXEC-01",
                "name": "Enterprise Strategic Operations 2027",
                "status": "Active",
                "progress": 78,
                "target_date": "2026-12-15",
                "description": "Multi-region service scaling, corporate compliance, and inorganic market expansion."
            }
        ],
        "meetings": [
            {
                "title": "Executive Board Briefing",
                "time": "Monday, 8:30 AM",
                "location": "Executive Suite",
                "organizer": "CEO Office"
            }
        ]
    }
}

# General fallback for any custom department
DEFAULT_WORKLOAD = {
    "tasks": [
        {
            "task_id": "TASK-GEN-01",
            "title": "Complete quarterly operational objectives review",
            "priority": "Medium",
            "status": "In Progress",
            "due_date": "2026-09-30",
            "assigned_role": "Employee",
            "category": "Operations"
        },
        {
            "task_id": "TASK-GEN-02",
            "title": "Review corporate security compliance standards",
            "priority": "High",
            "status": "Pending Review",
            "due_date": "2026-09-25",
            "assigned_role": "Employee",
            "category": "Security"
        }
    ],
    "projects": [
        {
            "id": "PROJ-GEN-01",
            "name": "Cross-Functional Operational Excellence",
            "status": "Active",
            "progress": 60,
            "target_date": "2026-12-31",
            "description": "Improving cross-department collaboration, system telemetry, and knowledge indexing."
        }
    ],
    "meetings": [
        {
            "title": "All-Hands Operations Alignment",
            "time": "Wednesday, 10:00 AM",
            "location": "Town Hall / Virtual",
            "organizer": "Nova Solutions Operations"
        }
    ]
}

COMPANY_ANNOUNCEMENTS = [
    {
        "id": 1,
        "title": "Q4 Budget & Strategic Plan Submissions Finalized",
        "dept": "Finance Operations",
        "date": "September 15, 2026",
        "summary": "All department operational models and authorized allocation memos have been synchronized."
    },
    {
        "id": 2,
        "title": "Zero-Trust Pre-LLM Knowledge Governance Standard",
        "dept": "Information Security",
        "date": "September 10, 2026",
        "summary": "NexusGuard deterministic authorization gates are actively protecting internal document repositories."
    },
    {
        "id": 3,
        "title": "Global Travel, Remote Work & Expense Policy Update",
        "dept": "Human Resources",
        "date": "September 02, 2026",
        "summary": "Updated 2026 per diem schedules, travel reimbursement, and wellness allowances are now in effect."
    }
]

def get_workload_for_user(department: str, role: str) -> Dict[str, Any]:
    """
    Returns role-aware dynamic workload items (tasks, projects, meetings, announcements)
    for any user based on their department and role.
    """
    dept_key = department if department in ROLE_WORKLOAD_MAP else "Finance"
    workload = ROLE_WORKLOAD_MAP.get(department, DEFAULT_WORKLOAD)
    
    return {
        "department": department,
        "role": role,
        "tasks": workload.get("tasks", DEFAULT_WORKLOAD["tasks"]),
        "projects": workload.get("projects", DEFAULT_WORKLOAD["projects"]),
        "meetings": workload.get("meetings", DEFAULT_WORKLOAD["meetings"]),
        "announcements": COMPANY_ANNOUNCEMENTS
    }
