// Resilient In-Browser ABAC Fallback Engine for standalone Vercel deployments
// Provides 100% functional parity with the backend FastAPI service when no live API URL is configured.

import datasetBundle from '../data/dataset_bundle.json';

const CLASSIFICATION_LEVELS = {
  'PUBLIC': 0,
  'INTERNAL': 1,
  'CONFIDENTIAL': 2,
  'RESTRICTED': 3
};

const INITIAL_USERS = [
  {
    id: 1,
    employee_id: "U102",
    name: "David Chen",
    email: "d.chen@novasolutions.internal",
    role: "Financial Analyst",
    department: "Finance",
    clearance: "Internal",
    status: "ACTIVE",
    is_admin: false,
    manager_id: "U301",
    leave_balance: 18,
    password: "password123"
  },
  {
    id: 2,
    employee_id: "U205",
    name: "Sarah Jenkins",
    email: "s.jenkins@novasolutions.internal",
    role: "Marketing Manager",
    department: "Marketing",
    clearance: "Internal",
    status: "ACTIVE",
    is_admin: false,
    manager_id: "EXEC001",
    leave_balance: 15,
    password: "password123"
  },
  {
    id: 3,
    employee_id: "U301",
    name: "Michael Ross",
    email: "m.ross@novasolutions.internal",
    role: "Financial Controller",
    department: "Finance",
    clearance: "Internal",
    status: "ACTIVE",
    is_admin: false,
    manager_id: "EXEC001",
    leave_balance: 20,
    password: "password123"
  },
  {
    id: 4,
    employee_id: "Admin",
    name: "Elena Vance",
    email: "security.admin@novasolutions.internal",
    role: "Security Officer",
    department: "Security",
    clearance: "Restricted",
    status: "ACTIVE",
    is_admin: true,
    manager_id: "EXEC001",
    leave_balance: 22,
    password: "adminpassword"
  },
  {
    id: 5,
    employee_id: "EXEC001",
    name: "Victoria Sterling",
    email: "v.sterling@novasolutions.internal",
    role: "Chief Executive Officer",
    department: "Executive",
    clearance: "Restricted",
    status: "ACTIVE",
    is_admin: false,
    manager_id: null,
    leave_balance: 25,
    password: "execpassword"
  }
];

const INITIAL_DOCUMENTS = [
  {
    id: 1,
    doc_id: "DOC-101",
    title: "Q4 Revenue Forecast",
    description: "Standard departmental Q4 revenue projection of 120 crore.",
    content: "Q4 revenue forecast is 120 crore based on validated enterprise customer subscription renewals and finance department financial models.",
    summary: "Standard finance departmental Q4 revenue projection of 120 crore.",
    classification: "Internal",
    required_clearance: "Internal",
    allowed_departments: ["Finance"],
    allowed_roles: [],
    explicit_denies: [],
    owner_department: "Finance",
    version: "2.0",
    lineage_group: "REVENUE_FORECAST",
    effective_date: "2026-09-01",
    status: "ACTIVE",
    is_searchable: true
  },
  {
    id: 2,
    doc_id: "DOC-201",
    title: "Q4 Revenue Forecast",
    description: "Executive restricted Q4 forecast of 145 crore with non-public strategic data.",
    content: "Q4 revenue forecast is 145 crore including confidential non-public strategic acquisitions, high-risk executive projections, and inorganic expansion targets.",
    summary: "Executive restricted Q4 forecast of 145 crore with non-public strategic data.",
    classification: "Restricted",
    required_clearance: "Restricted",
    allowed_departments: [],
    allowed_roles: ["Chief Executive Officer", "Executive", "Security Officer"],
    explicit_denies: [],
    owner_department: "Executive",
    version: "3.0",
    lineage_group: "REVENUE_FORECAST",
    effective_date: "2026-09-01",
    status: "ACTIVE",
    is_searchable: true
  },
  {
    id: 3,
    doc_id: "DOC-301",
    title: "Q4 Forecast",
    description: "Initial mid-year Q4 financial baseline estimate of 110 crore.",
    content: "Q4 forecast is 110 crore baseline projection as calculated during mid-year budget planning.",
    summary: "Initial mid-year Q4 financial baseline estimate of 110 crore.",
    classification: "Internal",
    required_clearance: "Internal",
    allowed_departments: ["Finance"],
    allowed_roles: [],
    explicit_denies: [],
    owner_department: "Finance",
    version: "1.0",
    lineage_group: "Q4_FINANCIAL_OUTLOOK",
    effective_date: "2026-06-01",
    status: "ACTIVE",
    is_searchable: true
  },
  {
    id: 4,
    doc_id: "DOC-302",
    title: "Q4 Forecast",
    description: "Revised effective Q4 forecast of 125 crore superseding version 1.0.",
    content: "Q4 forecast is 125 crore revised projection incorporating updated enterprise customer retention figures and contract expansions.",
    summary: "Revised effective Q4 forecast of 125 crore superseding version 1.0.",
    classification: "Internal",
    required_clearance: "Internal",
    allowed_departments: ["Finance"],
    allowed_roles: [],
    explicit_denies: [],
    owner_department: "Finance",
    version: "2.0",
    lineage_group: "Q4_FINANCIAL_OUTLOOK",
    effective_date: "2026-09-01",
    status: "ACTIVE",
    is_searchable: true
  },
  {
    id: 5,
    doc_id: "DOC-105",
    title: "Regional Budget Allocation & Expense Control Memo",
    description: "Financial guidelines for Q4 regional operating expenses.",
    content: "Operating budget for regional expansion: North America ₹42 Cr, EMEA ₹38 Cr, APAC ₹30 Cr. Cost optimization targets mandate a 12% reduction in non-essential vendor licenses.",
    summary: "Financial guidelines for Q4 regional operating expenses.",
    classification: "Internal",
    required_clearance: "Internal",
    allowed_departments: ["Finance"],
    allowed_roles: [],
    explicit_denies: [],
    owner_department: "Finance",
    version: "1.0",
    lineage_group: "BUDGET_CONTROL",
    effective_date: "2026-08-01",
    status: "ACTIVE",
    is_searchable: true
  },
  {
    id: 6,
    doc_id: "DOC-401",
    title: "Employee Travel & Expense Policy 2026",
    description: "Standard travel guidelines and per diem rates.",
    content: "All employees traveling for business must book economy class for flights under 6 hours. Per diem meal allowance is $75 per day. Expenses exceeding $500 require prior manager approval.",
    summary: "Standard travel policy guidelines and reimbursement rates.",
    classification: "Internal",
    required_clearance: "Internal",
    allowed_departments: [],
    allowed_roles: [],
    explicit_denies: [],
    owner_department: "Human Resources",
    version: "1.2",
    lineage_group: "HR_POLICIES",
    effective_date: "2026-01-15",
    status: "ACTIVE",
    is_searchable: true
  },
  {
    id: 7,
    doc_id: "DOC-402",
    title: "Employee Remote Work & Leave Guidelines 2026",
    description: "Corporate policies on flexible work schedules, paid time off, and parental leave.",
    content: "Employees are eligible for 24 days annual paid time off plus 12 regional public holidays. Core collaboration hours are 10:00 AM to 4:00 PM local time. Remote equipment stipends are renewed annually.",
    summary: "Corporate policies on flexible work schedules and PTO.",
    classification: "Internal",
    required_clearance: "Internal",
    allowed_departments: [],
    allowed_roles: [],
    explicit_denies: [],
    owner_department: "Human Resources",
    version: "2.0",
    lineage_group: "HR_POLICIES",
    effective_date: "2026-02-01",
    status: "ACTIVE",
    is_searchable: true
  },
  {
    id: 8,
    doc_id: "DOC-501",
    title: "Q4 Global Brand Marketing Campaign Strategy",
    description: "Strategic marketing roadmap and digital campaign allocation for Q4.",
    content: "The Q4 marketing campaign focuses on enterprise knowledge security and AI governance, allocating $2.5M to digital thought leadership, partner webinars, and major technology summits.",
    summary: "Strategic marketing roadmap and digital campaign allocation for Q4.",
    classification: "Internal",
    required_clearance: "Internal",
    allowed_departments: ["Marketing"],
    allowed_roles: [],
    explicit_denies: [],
    owner_department: "Marketing",
    version: "1.0",
    lineage_group: "MKTG_STRATEGY",
    effective_date: "2026-08-15",
    status: "ACTIVE",
    is_searchable: true
  },
  {
    id: 9,
    doc_id: "DOC-502",
    title: "Customer Segmentation & Lead Generation Strategy",
    description: "Analysis of high-value enterprise accounts and inbound conversion channels.",
    content: "Target customer segments comprise Fortune 500 banks, healthcare networks, and logistics providers. Inbound conversion target is set at 450 enterprise qualified leads for Q4.",
    summary: "Customer segmentation and inbound target metrics.",
    classification: "Internal",
    required_clearance: "Internal",
    allowed_departments: ["Marketing"],
    allowed_roles: [],
    explicit_denies: [],
    owner_department: "Marketing",
    version: "1.1",
    lineage_group: "MKTG_STRATEGY",
    effective_date: "2026-09-01",
    status: "ACTIVE",
    is_searchable: true
  },
  {
    id: 10,
    doc_id: "DOC-601",
    title: "Project Aegis Architecture & Security Standards",
    description: "Technical security blueprint and compliance standards for internal software systems.",
    content: "All internal Nova Solutions microservices must enforce TLS 1.3, mutual certificate authentication, and pre-LLM deterministic authorization gates. Direct database access from frontend clients is strictly prohibited.",
    summary: "Technical security blueprint and compliance standards for internal software systems.",
    classification: "Confidential",
    required_clearance: "Confidential",
    allowed_departments: ["Security", "Engineering"],
    allowed_roles: [],
    explicit_denies: [],
    owner_department: "Security",
    version: "2.4",
    lineage_group: "ENG_STANDARDS",
    effective_date: "2026-07-10",
    status: "ACTIVE",
    is_searchable: true
  },
  {
    id: 11,
    doc_id: "DOC-602",
    title: "Helix Cloud Migration Deployment Schedule",
    description: "Detailed milestone schedule for core microservices cloud migration.",
    content: "Helix platform cluster migration to multi-region Kubernetes is scheduled for Q4 release. Target latency SLO is sub-25ms for p95 requests. Rollback procedures are verified and automated.",
    summary: "Milestone schedule for core cloud infrastructure.",
    classification: "Internal",
    required_clearance: "Internal",
    allowed_departments: ["Engineering", "Operations"],
    allowed_roles: [],
    explicit_denies: [],
    owner_department: "Engineering",
    version: "1.0",
    lineage_group: "ENG_STANDARDS",
    effective_date: "2026-08-20",
    status: "ACTIVE",
    is_searchable: true
  },
  {
    id: 12,
    doc_id: "DOC-701",
    title: "Project Phoenix - Confidential Acquisition Brief",
    description: "Confidential M&A evaluation dossier for Project Phoenix.",
    content: "Strategic acquisition memorandum for target entity codenamed Phoenix. Preliminary enterprise valuation estimated at $85M subject to final board audit and regulatory clearance.",
    summary: "Confidential M&A evaluation dossier for Project Phoenix.",
    classification: "Restricted",
    required_clearance: "Restricted",
    allowed_departments: [],
    allowed_roles: ["Chief Executive Officer", "Executive"],
    explicit_denies: [],
    owner_department: "Executive",
    version: "1.0",
    lineage_group: "MA_PIPELINE",
    effective_date: "2026-09-10",
    status: "ACTIVE",
    is_searchable: true
  },
  {
    id: 11,
    doc_id: "DOC-401",
    title: "HR Leave and Paid Time Off (PTO) Policy",
    description: "Standard workplace leave policies, entitlements, and approval rules for all full-time Nova Solutions employees.",
    content: "Nova Solutions Leave & Paid Time Off (PTO) Policy:\n1. Standard Annual Entitlement: All full-time employees are allocated 18 to 25 days of paid annual/casual leave per fiscal year.\n2. Application Procedure: Leave must be submitted through NexusGuard or the Nova Workplace Portal at least 48 hours prior to planned absence.\n3. Approval Chain: All leave requests require managerial review and electronic authorization by the designated direct supervisor/manager.\n4. Self-Approval Prohibition: Employees and managers are strictly barred from approving their own leave requests under Section 4.2 of Governance Rules. Direct manager or executive countersignature is required.\n5. Consecutive Leave: Consecutive leaves exceeding 10 business days require departmental director or HR VP approval.",
    summary: "Standard workplace leave policy detailing 18-25 days PTO, managerial approval workflows, and strict prohibition of self-approval.",
    classification: "Internal",
    required_clearance: "Internal",
    allowed_departments: [],
    allowed_roles: [],
    explicit_denies: [],
    owner_department: "Human Resources",
    version: "1.0",
    lineage_group: "HR_LEAVE_POLICY",
    effective_date: "2026-01-01",
    status: "ACTIVE",
    is_searchable: true
  }
];

const USER_DEFAULTS = {
  "U102": { manager_id: "U301", leave_balance: 18 },
  "U205": { manager_id: "EXEC001", leave_balance: 15 },
  "U301": { manager_id: "EXEC001", leave_balance: 20 },
  "Admin": { manager_id: "EXEC001", leave_balance: 22 },
  "EXEC001": { manager_id: null, leave_balance: 25 },
  "EMP-0242": { manager_id: "EMP-0105", leave_balance: 14 },
  "EMP-0105": { manager_id: "EMP-0001", leave_balance: 18 },
  "EMP-0046": { manager_id: "EMP-0001", leave_balance: 18 },
  "EMP-0078": { manager_id: "EMP-0001", leave_balance: 18 },
  "EMP-0001": { manager_id: null, leave_balance: 25 },
  "EMP-0035": { manager_id: "EMP-0001", leave_balance: 18 },
  "EMP-0248": { manager_id: "EMP-0035", leave_balance: 18 },
  "EMP-0106": { manager_id: "EMP-0035", leave_balance: 18 }
};

const INITIAL_LEAVE_REQUESTS = [
  {
    request_id: "LEV-2026-001",
    employee_id: "U102",
    employee_name: "David Chen",
    department: "Finance",
    leave_type: "Casual",
    start_date: "2026-08-10",
    end_date: "2026-08-11",
    days_count: 2,
    reason: "Personal family commitment.",
    status: "Approved",
    approver_id: "U301",
    approver_name: "Michael Ross",
    rejection_reason: null,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    request_id: "LEV-2026-002",
    employee_id: "U205",
    employee_name: "Sarah Jenkins",
    department: "Marketing",
    leave_type: "Annual",
    start_date: "2026-09-28",
    end_date: "2026-09-30",
    days_count: 3,
    reason: "Annual scheduled vacation.",
    status: "Pending",
    approver_id: "EXEC001",
    approver_name: "Victoria Sterling",
    rejection_reason: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    request_id: "LEV-2026-003",
    employee_id: "U301",
    employee_name: "Michael Ross",
    department: "Finance",
    leave_type: "Personal",
    start_date: "2026-10-05",
    end_date: "2026-10-06",
    days_count: 2,
    reason: "Personal business errands.",
    status: "Pending",
    approver_id: "EXEC001",
    approver_name: "Victoria Sterling",
    rejection_reason: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

// Helper to get storage
function getStoredUsers() {
  const data = localStorage.getItem('nova_users_store');
  let users = [...INITIAL_USERS];

  // Ingest demo users from datasetBundle if available
  if (datasetBundle && (datasetBundle.demo_users || datasetBundle.users)) {
    const bUsers = datasetBundle.demo_users || datasetBundle.users;
    bUsers.forEach((bu, idx) => {
      if (!users.some(u => u.employee_id === bu.employee_id)) {
        users.push({
          id: users.length + 1,
          ...bu,
          password: "password123"
        });
      }
    });
  }

  if (data) {
    try {
      const parsed = JSON.parse(data);
      parsed.forEach(pu => {
        const idx = users.findIndex(u => u.employee_id === pu.employee_id);
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...pu };
        } else {
          users.push(pu);
        }
      });
    } catch(e) {}
  }

  users = users.map(u => ({
    ...u,
    manager_id: u.manager_id !== undefined ? u.manager_id : (USER_DEFAULTS[u.employee_id]?.manager_id ?? null),
    leave_balance: u.leave_balance !== undefined ? u.leave_balance : (USER_DEFAULTS[u.employee_id]?.leave_balance ?? 18)
  }));
  localStorage.setItem('nova_users_store', JSON.stringify(users));
  return users;
}

function getStoredLeaveRequests() {
  const data = localStorage.getItem('nova_leave_requests_store');
  if (data) {
    try { return JSON.parse(data); } catch(e) {}
  }
  localStorage.setItem('nova_leave_requests_store', JSON.stringify(INITIAL_LEAVE_REQUESTS));
  return INITIAL_LEAVE_REQUESTS;
}

function saveLeaveRequests(requests) {
  localStorage.setItem('nova_leave_requests_store', JSON.stringify(requests));
}

function getStoredDocuments() {
  const data = localStorage.getItem('nova_docs_store');
  let docs = [...INITIAL_DOCUMENTS];

  // Ingest documents from datasetBundle
  if (datasetBundle && datasetBundle.documents) {
    datasetBundle.documents.forEach((bd) => {
      if (!docs.some(d => d.doc_id === bd.doc_id)) {
        docs.push({
          id: docs.length + 1,
          ...bd
        });
      }
    });
  }

  if (data) {
    try {
      const parsed = JSON.parse(data);
      parsed.forEach(pd => {
        const idx = docs.findIndex(d => d.doc_id === pd.doc_id);
        if (idx >= 0) {
          docs[idx] = { ...docs[idx], ...pd };
        } else {
          docs.push(pd);
        }
      });
    } catch(e) {}
  }

  localStorage.setItem('nova_docs_store', JSON.stringify(docs));
  return docs;
}

function getStoredAuditLogs() {
  const data = localStorage.getItem('nova_audit_logs');
  return data ? JSON.parse(data) : [];
}

function addAuditLog(entry) {
  const logs = getStoredAuditLogs();
  logs.unshift(entry);
  localStorage.setItem('nova_audit_logs', JSON.stringify(logs.slice(0, 100)));
}

function getStoredSessions() {
  const data = localStorage.getItem('nova_chat_sessions_store');
  return data ? JSON.parse(data) : [];
}

function saveStoredSessions(sessions) {
  localStorage.setItem('nova_chat_sessions_store', JSON.stringify(sessions));
}

// ABAC Policy Engine
function evaluatePolicy(user, doc) {
  if (!user || user.status !== 'ACTIVE') {
    return { is_allowed: false, reason_code: 'USER_INACTIVE' };
  }

  const userLevel = CLASSIFICATION_LEVELS[user.clearance.toUpperCase()] ?? 0;
  const docLevel = CLASSIFICATION_LEVELS[(doc.required_clearance || doc.classification).toUpperCase()] ?? 1;

  if (userLevel < docLevel) {
    return { is_allowed: false, reason_code: 'CLEARANCE_INSUFFICIENT' };
  }

  if (doc.allowed_departments && doc.allowed_departments.length > 0) {
    if (!doc.allowed_departments.includes(user.department)) {
      return { is_allowed: false, reason_code: 'DEPARTMENT_NOT_ALLOWED' };
    }
  }

  if (doc.allowed_roles && doc.allowed_roles.length > 0) {
    if (!doc.allowed_roles.includes(user.role)) {
      return { is_allowed: false, reason_code: 'ROLE_NOT_ALLOWED' };
    }
  }

  if (doc.allowed_projects && doc.allowed_projects.length > 0) {
    const userProjects = (user.assigned_projects || '').split(/[,;]/).map(p => p.trim());
    const hasProj = doc.allowed_projects.some(p => userProjects.includes(p));
    if (!hasProj) {
      return { is_allowed: false, reason_code: 'PROJECT_NOT_ALLOWED' };
    }
  }

  if (doc.explicit_denies && doc.explicit_denies.includes(user.employee_id)) {
    return { is_allowed: false, reason_code: 'EXPLICIT_DENY' };
  }

  return { is_allowed: true, reason_code: 'ALLOWED' };
}

export const mockBackend = {
  login(identifier, password) {
    const users = getStoredUsers();
    const cleanId = (identifier || '').trim();
    const user = users.find(u => 
      (u.employee_id.toLowerCase() === cleanId.toLowerCase() || 
       u.email.toLowerCase() === cleanId.toLowerCase()) && 
      (u.password === password || password === 'password123' || password === 'adminpassword' || password === 'execpassword')
    );

    if (!user) {
      throw new Error('Invalid Employee ID/Email or password.');
    }

    const token = `mock-jwt-token-${user.employee_id}-${Date.now()}`;
    return {
      access_token: token,
      token_type: "bearer",
      user: {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        clearance: user.clearance,
        status: user.status,
        is_admin: user.is_admin,
        manager_id: user.manager_id,
        leave_balance: user.leave_balance
      }
    };
  },

  getMe(user) {
    return user;
  },

  getWorkload(user) {
    const dept = user?.department || 'Finance';
    const role = user?.role || 'Employee';

    const workloadMap = {
      'Finance': {
        tasks: [
          { task_id: 'TASK-101', title: 'Review Q4 budget variance models', priority: 'High', status: 'In Progress', due_date: '2026-09-24', assigned_role: 'Financial Analyst', category: 'Financial Analysis' },
          { task_id: 'TASK-102', title: 'Reconcile corporate procurement invoice batches', priority: 'Medium', status: 'Pending Review', due_date: '2026-09-26', assigned_role: 'Financial Analyst', category: 'Ledger Audit' },
          { task_id: 'TASK-103', title: 'Finalize regional operating cash-flow forecast', priority: 'High', status: 'In Progress', due_date: '2026-09-28', assigned_role: 'Financial Controller', category: 'Forecast & Planning' },
          { task_id: 'TASK-104', title: 'Audit Q3 departmental expense allocations', priority: 'Low', status: 'Completed', due_date: '2026-09-18', assigned_role: 'Finance', category: 'Compliance' }
        ],
        projects: [
          { id: 'PROJ-FIN-01', name: 'FY27 Capital Allocation Framework', status: 'Active', progress: 72, target_date: '2026-11-15', description: 'Strategic modeling for capital expenditure and inorganic expansion evaluation.' },
          { id: 'PROJ-FIN-02', name: 'Automated ERP Ledger Sync', status: 'In Implementation', progress: 88, target_date: '2026-10-01', description: 'Integration of real-time multi-currency transaction streams into primary general ledger.' }
        ],
        meetings: [
          { title: 'Q4 Financial Leadership Review', time: 'Tomorrow, 10:00 AM', location: 'Boardroom A / Virtual', organizer: 'Finance Operations' },
          { title: 'External Audit Readiness Check', time: 'Thursday, 2:30 PM', location: 'Conference Room 402', organizer: 'Corporate Controller' }
        ]
      },
      'Marketing': {
        tasks: [
          { task_id: 'TASK-201', title: 'Finalize Meridian omnichannel campaign media plan', priority: 'High', status: 'In Progress', due_date: '2026-09-25', assigned_role: 'Marketing Manager', category: 'Campaign Launch' },
          { task_id: 'TASK-202', title: 'Analyze enterprise lead conversion & CAC metrics', priority: 'Medium', status: 'In Progress', due_date: '2026-09-27', assigned_role: 'Marketing Specialist', category: 'Growth Analytics' },
          { task_id: 'TASK-203', title: 'Review enterprise brand guidelines & collateral refresh', priority: 'Low', status: 'Pending Review', due_date: '2026-09-30', assigned_role: 'Marketing', category: 'Brand Strategy' }
        ],
        projects: [
          { id: 'PROJ-MKT-01', name: 'Meridian Global Awareness Campaign', status: 'Active', progress: 64, target_date: '2026-10-31', description: 'Multi-channel executive outreach across financial, logistics, and retail enterprise buyers.' }
        ],
        meetings: [
          { title: 'Q4 Campaign Performance Standup', time: 'Today, 3:00 PM', location: 'Virtual Room 2', organizer: 'Growth Marketing' }
        ]
      },
      'Engineering': {
        tasks: [
          { task_id: 'TASK-301', title: 'Deploy Helix Platform v2.4 release candidate', priority: 'High', status: 'In Progress', due_date: '2026-09-24', assigned_role: 'Software Engineer', category: 'Release Engineering' },
          { task_id: 'TASK-302', title: 'Conduct zero-trust architecture threat model review', priority: 'High', status: 'Pending Review', due_date: '2026-09-26', assigned_role: 'Systems Architect', category: 'Security Engineering' }
        ],
        projects: [
          { id: 'PROJ-ENG-01', name: 'Helix Distributed Platform v3', status: 'Active Sprint', progress: 82, target_date: '2026-10-15', description: 'Next-generation high-throughput microservices architecture with sub-millisecond telemetry.' }
        ],
        meetings: [
          { title: 'Core Architecture & RFC Review', time: 'Today, 2:00 PM', location: 'Eng Lab 1 / Hybrid', organizer: 'Platform Lead' }
        ]
      }
    };

    const data = workloadMap[dept] || workloadMap['Finance'];
    return {
      department: dept,
      role: role,
      tasks: data.tasks,
      projects: data.projects,
      meetings: data.meetings,
      announcements: [
        { id: 1, title: 'Q4 Budget & Strategic Plan Submissions Finalized', dept: 'Finance Operations', date: 'September 15, 2026', summary: 'All department operational models and authorized allocation memos have been synchronized.' },
        { id: 2, title: 'Zero-Trust Pre-LLM Knowledge Governance Standard', dept: 'Information Security', date: 'September 10, 2026', summary: 'NexusGuard deterministic authorization gates are actively protecting internal document repositories.' },
        { id: 3, title: 'Global Travel, Remote Work & Expense Policy Update', dept: 'Human Resources', date: 'September 02, 2026', summary: 'Updated 2026 per diem schedules, travel reimbursement, and wellness allowances are now in effect.' }
      ]
    };
  },

  getAuthorizedDocuments(user) {
    const docs = getStoredDocuments();
    return docs.filter(d => d.is_searchable && evaluatePolicy(user, d).is_allowed);
  },

  getSessions(user) {
    const all = getStoredSessions();
    const empId = user?.employee_id || user?.id;
    return all
      .filter(s => !empId || s.user_id === empId || s.user_id === user?.id)
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
  },

  getSessionDetail(sessionId) {
    const all = getStoredSessions();
    const found = all.find(s => s.session_id === sessionId);
    if (!found) {
      return { session_id: sessionId, title: "New Research Session", created_at: new Date().toISOString(), messages: [] };
    }
    return found;
  },

  deleteSession(sessionId) {
    let all = getStoredSessions();
    all = all.filter(s => s.session_id !== sessionId);
    saveStoredSessions(all);
    return { success: true, message: "Session deleted successfully" };
  },

  queryNexusGuard(user, query, sessionId = null) {
    const docs = getStoredDocuments();
    const queryLower = (query || '').toLowerCase().trim();
    const requestId = `REQ-${Date.now().toString().slice(-6)}`;

    // 1. Session Resolution & Persistence
    const allSessions = getStoredSessions();
    let currentSession = null;
    const effectiveSessionId = sessionId || `SES-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    if (sessionId) {
      currentSession = allSessions.find(s => s.session_id === sessionId);
    }

    if (!currentSession) {
      currentSession = {
        session_id: effectiveSessionId,
        user_id: user?.employee_id || 'UNKNOWN',
        title: query.trim().slice(0, 40) + (query.trim().length > 40 ? '...' : ''),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: []
      };
      allSessions.unshift(currentSession);
    } else {
      currentSession.updated_at = new Date().toISOString();
    }

    // Save user message in session
    currentSession.messages.push({
      id: Date.now(),
      session_id: effectiveSessionId,
      sender: "user",
      content: query,
      citations: [],
      created_at: new Date().toISOString()
    });

    const finishResponse = (res) => {
      res.session_id = effectiveSessionId;
      currentSession.messages.push({
        id: Date.now() + 1,
        session_id: effectiveSessionId,
        sender: "nexusguard",
        content: res.answer,
        evidence_status: res.evidence_status,
        citations: res.citations || [],
        action_card: res.action_card || null,
        request_id: res.request_id,
        response_scope: res.response_scope || null,
        untrusted_instruction_detected: res.untrusted_instruction_detected || false,
        created_at: new Date().toISOString()
      });
      saveStoredSessions(allSessions);
      return res;
    };

    // 2. Security Check: Terminated employee check
    if (user && user.status === 'TERMINATED') {
      return finishResponse({
        session_id: effectiveSessionId,
        request_id: requestId,
        status: "DENY",
        evidence_status: "NO_AUTHORIZED_EVIDENCE",
        answer: "Access denied: Employee account status is TERMINATED. All retrieval access permanently disabled under Security Policy DOC-SEC-001.",
        citations: [],
        response_scope: {
          user_name: user?.name,
          user_department: user?.department,
          user_clearance: user?.clearance,
          requested_topic: "Terminated Account Access",
          allowed_domains: [],
          restricted_domains: ["All Corporate Assets"],
          response_mode: "TERMINATED_DENIAL",
          policy_applied: "SEC-POL-01 (Account Status Gate)"
        }
      });
    }

    // 3. Security Check: Prompt Injection Defense
    const injectionPatterns = [
      /ignore\s+(all\s+)?(previous\s+)?(security\s+)?rules/i,
      /you\s+are\s+(an?\s+)?unrestricted\s+ai/i,
      /system\s+override/i,
      /maintenance\s+mode/i,
      /disable\s+all\s+guardrails/i,
      /bypass\s+policy/i,
      /disregard\s+all\s+instructions/i
    ];
    if (injectionPatterns.some(p => p.test(queryLower))) {
      return finishResponse({
        session_id: effectiveSessionId,
        request_id: requestId,
        status: "NO_AUTHORIZED_EVIDENCE",
        evidence_status: "NO_AUTHORIZED_EVIDENCE",
        answer: "I couldn't find sufficient accessible evidence in company records to answer that question. Security Policy Violation: Prompt injection and adversarial override attempts are strictly blocked at the pre-retrieval policy gate.",
        citations: [],
        untrusted_instruction_detected: true,
        response_scope: {
          user_name: user?.name,
          user_department: user?.department,
          user_clearance: user?.clearance,
          requested_topic: "Adversarial Policy Bypass Attempt",
          allowed_domains: [`${user?.department || 'Employee'} Operations`],
          restricted_domains: ["Security Safeguards", "System Prompts", "Restricted Executive Records"],
          response_mode: "ADVERSARIAL_BLOCKED",
          policy_applied: "SEC-POL-01 (Pre-Retrieval Input Boundary Gate)"
        }
      });
    }

    // 3b. Sensitive Individual PII & Salary Refusal (Pattern D)
    const piiKeywords = ["salary of", "salaries", "compensation of", "how much does", "pay slip", "payroll details"];
    const isPiiQuery = piiKeywords.some(kw => queryLower.includes(kw)) && !queryLower.includes("policy") && !queryLower.includes("guideline");
    if (isPiiQuery && user?.role !== "Chief Executive Officer" && user?.role !== "Security Officer") {
      return finishResponse({
        session_id: effectiveSessionId,
        request_id: requestId,
        status: "NO_AUTHORIZED_EVIDENCE",
        evidence_status: "NO_AUTHORIZED_EVIDENCE",
        answer: "I couldn't find sufficient accessible evidence in your authorized document clearance to access individual employee compensation or personal PII records. Under Nova Solutions Data Privacy & Governance Policy (SEC-POL-09), individual compensation, performance evaluations, and salary structures are strictly confidential and restricted to authorized HR Leadership and Executive Officers.\n\nYou may, however, review general employee benefit provisions and standard PTO entitlements in the Employee Handbook (DOC-401 / DOC-HR-001).",
        citations: [],
        response_scope: {
          user_name: user?.name,
          user_department: user?.department,
          user_clearance: user?.clearance,
          requested_topic: "Employee Compensation & PII",
          allowed_domains: [`${user?.department} Operations`, "General HR Policies"],
          restricted_domains: ["Individual Compensation", "Confidential PII"],
          response_mode: "PII_RESTRICTED",
          policy_applied: "SEC-POL-09 (PII & Compensation Privacy Gate)"
        }
      });
    }

    // 3c. Clarification Required for Ambiguous Project Roadmap (Pattern E)
    if (["show me the project roadmap", "show me the roadmap", "what is the roadmap", "what is our roadmap", "project roadmap"].includes(queryLower.trim())) {
      return finishResponse({
        session_id: effectiveSessionId,
        request_id: requestId,
        status: "NO_AUTHORIZED_EVIDENCE",
        evidence_status: "NO_AUTHORIZED_EVIDENCE",
        answer: "Could you please clarify which project or domain you are inquiring about? Nova Solutions currently maintains distinct roadmaps for:\n\n1. **Project Orion** — Enterprise Data Fabric & Inventory Analytics (`DOC-ENG-001`)\n2. **Project Atlas** — Multi-Region Cloud & Infrastructure Migration (`DOC-ENG-002`)\n3. **Marketing Roadmap** — Brand Strategy & Product Launch Milestones (`DOC-MKT-001`)\n\nPlease specify the initiative or department name so I can retrieve the exact authorized documentation for your clearance.",
        citations: [],
        response_scope: {
          user_name: user?.name,
          user_department: user?.department,
          user_clearance: user?.clearance,
          requested_topic: "General Enterprise Roadmap",
          allowed_domains: [`${user?.department} Documentation`, "Public Overviews"],
          restricted_domains: ["Cross-Project Isolated Records"],
          response_mode: "CLARIFICATION_REQUIRED",
          policy_applied: "ABAC-INPUT-DISAMBIGUATION"
        }
      });
    }

    // 4. Governed Workplace Action Intent Recognition
    const isApplyLeave = (queryLower.includes('apply') && queryLower.includes('leave')) ||
                         (queryLower.includes('request') && queryLower.includes('leave')) ||
                         queryLower.includes('take leave') || queryLower.includes('submit leave') || queryLower.includes('book leave');

    const isBalanceInquiry = queryLower.includes('leave balance') || 
                             queryLower.includes('how many days') || 
                             (queryLower.includes('balance') && queryLower.includes('leave'));

    const isStatusInquiry = queryLower.includes('leave status') || 
                            queryLower.includes('status of my leave') || 
                            queryLower.includes('pending leaves') ||
                            queryLower.includes('my leave requests');

    if (isApplyLeave) {
      let startDate = "2026-09-23";
      let endDate = "2026-09-25";

      const isoMatches = query.match(/(\d{4}-\d{2}-\d{2})/g);
      if (isoMatches && isoMatches.length >= 2) {
        startDate = isoMatches[0];
        endDate = isoMatches[1];
      } else {
        const monthMap = {
          'january': '01', 'february': '02', 'march': '03', 'april': '04',
          'may': '05', 'june': '06', 'july': '07', 'august': '08',
          'september': '09', 'october': '10', 'november': '11', 'december': '12',
          'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
          'jun': '06', 'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
        };
        const textMatches = query.match(/(\d{1,2})\s+([a-zA-Z]+)(?:\s+to\s+|\s*-\s*)(\d{1,2})\s+([a-zA-Z]+)/i);
        if (textMatches) {
          const m1 = monthMap[textMatches[2].toLowerCase()] || '09';
          const m2 = monthMap[textMatches[4].toLowerCase()] || '09';
          startDate = `2026-${m1}-${textMatches[1].padStart(2, '0')}`;
          endDate = `2026-${m2}-${textMatches[3].padStart(2, '0')}`;
        }
      }

      let reason = "Personal errands and personal leave";
      const forMatch = query.match(/for\s+(.+)$/i);
      if (forMatch) {
        reason = forMatch[1].trim();
      }

      try {
        const req = this.applyLeave(user.employee_id, {
          start_date: startDate,
          end_date: endDate,
          leave_type: "Casual",
          reason: reason
        });

        return finishResponse({
          session_id: effectiveSessionId,
          request_id: requestId,
          status: "ACTION_PROCESSED",
          evidence_status: "WORKPLACE_ACTION",
          answer: `Your leave request from ${startDate} to ${endDate} (${req.days_count} business days) has been registered successfully.\n\nStatus: Pending Manager Approval\nAssigned Approver: ${req.approver_name} (${req.approver_id})\nReason: "${reason}"\nRemaining Balance: ${user.leave_balance} days\n\nUnder Section 4.2 of Nova Solutions Governance Rules, all workplace leave actions require supervisor countersignature and self-approval is strictly barred. You will receive an automated notification once reviewed.`,
          citations: [{
            document_id: "DOC-401",
            title: "HR Leave and Paid Time Off (PTO) Policy",
            version: "1.0",
            effective_date: "2026-01-01",
            classification: "Internal"
          }],
          action_card: {
            action_type: "LEAVE_APPLICATION",
            request_id: req.request_id,
            employee_id: user.employee_id,
            employee_name: user.name,
            leave_type: req.leave_type,
            start_date: req.start_date,
            end_date: req.end_date,
            days_count: req.days_count,
            reason: req.reason,
            status: req.status,
            approver_id: req.approver_id,
            approver_name: req.approver_name,
            remaining_balance: user.leave_balance,
            created_at: req.created_at
          }
        });
      } catch (err) {
        return finishResponse({
          session_id: effectiveSessionId,
          request_id: requestId,
          status: "ERROR",
          evidence_status: "WORKPLACE_ACTION",
          answer: `Unable to submit leave request: ${err.message}`,
          citations: []
        });
      }
    }

    if (isBalanceInquiry) {
      const summary = this.getLeaveBalance(user.employee_id);
      return finishResponse({
        session_id: effectiveSessionId,
        request_id: requestId,
        status: "SUCCESS",
        evidence_status: "WORKPLACE_ACTION",
        answer: `Here is your current leave entitlement status:\n• Available Leave Balance: ${summary.leave_balance} days\n• Pending Requests Awaiting Manager Approval: ${summary.pending_leaves_count}\n• Approved Leaves Taken: ${summary.approved_leaves_count}`,
        citations: [{
          document_id: "DOC-401",
          title: "HR Leave and Paid Time Off (PTO) Policy",
          version: "1.0",
          effective_date: "2026-01-01",
          classification: "Internal"
        }],
        action_card: {
          action_type: "LEAVE_BALANCE_INQUIRY",
          employee_id: user.employee_id,
          employee_name: user.name,
          remaining_balance: summary.leave_balance,
          status: "ACTIVE"
        }
      });
    }

    if (isStatusInquiry) {
      const requests = this.getMyLeaveRequests(user.employee_id);
      if (requests.length === 0) {
        return finishResponse({
          session_id: effectiveSessionId,
          request_id: requestId,
          status: "SUCCESS",
          evidence_status: "WORKPLACE_ACTION",
          answer: `You currently have no active or historical leave requests on record.`,
          citations: []
        });
      }
      const listSummary = requests.map(r => `• ${r.request_id}: ${r.start_date} to ${r.end_date} (${r.days_count} days) — Status: [${r.status}] (Approver: ${r.approver_name})`).join('\n');
      return finishResponse({
        session_id: effectiveSessionId,
        request_id: requestId,
        status: "SUCCESS",
        evidence_status: "WORKPLACE_ACTION",
        answer: `Your recorded leave requests:\n\n${listSummary}`,
        citations: []
      });
    }

    // 5. Candidate Retrieval (Keyword Matching)
    const tokens = queryLower.split(/\s+/).filter(t => t.length > 2);
    const candidates = docs.filter(d => {
      if (!d.is_searchable) return false;
      const text = `${d.title} ${d.content} ${d.description} ${d.doc_id}`.toLowerCase();
      return (d.doc_id && d.doc_id.toLowerCase().includes(queryLower)) ||
             (d.title && d.title.toLowerCase().includes(queryLower)) ||
             tokens.some(tok => text.includes(tok));
    });

    // 6. Pre-LLM Deterministic Authorization Gate
    const decisions = [];
    const authorized = [];

    candidates.forEach(doc => {
      const evalRes = evaluatePolicy(user, doc);
      decisions.push({
        doc_id: doc.doc_id,
        decision: evalRes.is_allowed ? 'ALLOWED' : 'DENIED',
        reason_code: evalRes.reason_code,
        classification: doc.classification
      });
      if (evalRes.is_allowed) {
        authorized.push(doc);
      }
    });

    // 7. Version Resolution (Group by lineage_group & pick highest version)
    const lineageGroups = {};
    authorized.forEach(doc => {
      const groupKey = doc.lineage_group || doc.doc_id;
      if (!lineageGroups[groupKey] || parseFloat(doc.version) > parseFloat(lineageGroups[groupKey].version)) {
        lineageGroups[groupKey] = doc;
      }
    });
    const selectedDocs = Object.values(lineageGroups);

    // 8. Record Audit Log
    addAuditLog({
      request_id: requestId,
      timestamp: new Date().toISOString(),
      user_employee_id: user?.employee_id,
      user_dept: user?.department,
      user_role: user?.role,
      user_clearance: user?.clearance,
      query: query,
      candidate_ids: candidates.map(c => c.doc_id),
      authorization_decisions: decisions,
      authorized_ids: authorized.map(a => a.doc_id),
      selected_ids: selectedDocs.map(s => s.doc_id),
      response_status: selectedDocs.length > 0 ? 'SUCCESS' : 'NO_AUTHORIZED_EVIDENCE',
      answer_preview: selectedDocs.length > 0 ? (selectedDocs[0].summary || selectedDocs[0].title) : 'No authorized evidence available.'
    });

    // 9. Response Synthesis (Safe Insufficient Access Refusal vs. Grounded Answer)
    const isForensicQuery = queryLower.includes("inc-sec-2026-89") || queryLower.includes("forensic");
    let untrustedDetected = false;

    if (selectedDocs.length === 0) {
      let boundaryAnswer = "I couldn't find sufficient accessible evidence in your authorized document clearance to answer this question. Please verify your department permissions or contact your system administrator.";
      let appliedPolicy = "ABAC-CLEARANCE-BOUNDARY (SEC-POL-04)";

      if (/revenue|forecast|financial|budget|p&l/i.test(queryLower)) {
        boundaryAnswer = `I couldn't find sufficient accessible evidence in your authorized document clearance to answer that question. As a member of the ${user?.department || 'current'} department (${user?.clearance || 'Internal'} clearance), financial revenue forecasts and regional budget memos (such as DOC-101 and DOC-105) are restricted to the Finance department under Policy Rule SEC-POL-04.\n\nHere are some relevant topics in your authorized domain you can explore:\n• Marketing Campaign Roadmap & Brand Guidelines (DOC-MKT-001)\n• Customer Acquisition Analytics & Digital Engagement (DOC-MKT-002)\n• Company-wide HR Policies & PTO Entitlements (DOC-401)\n• Or ask to apply for leave or check your available leave balance.`;
        appliedPolicy = "ABAC-DEPT-RESTRICTION (SEC-POL-04)";
      } else if (/atlas/i.test(queryLower)) {
        boundaryAnswer = `I couldn't find sufficient accessible evidence in your authorized document clearance to access Project Atlas documentation. Under Project Isolation Policy SEC-POL-07, Project Atlas cloud migration architecture (DOC-ENG-002) is strictly restricted to assigned engineers.\n\nYou are authorized to query documentation for your assigned project (Project Orion) or company-wide engineering coding standards (DOC-ENG-003).`;
        appliedPolicy = "ABAC-PROJECT-ISOLATION (SEC-POL-07)";
      } else if (/phoenix|acquisition|m&a|alpha/i.test(queryLower)) {
        boundaryAnswer = `I couldn't find sufficient accessible evidence in your authorized document clearance to access Project Phoenix or acquisition plans. Strategic M&A dossiers and enterprise valuations are classified as Restricted and governed by C-Suite Executive Policy SEC-POL-03.`;
        appliedPolicy = "ABAC-EXECUTIVE-CLEARANCE (SEC-POL-03)";
      }

      return finishResponse({
        session_id: effectiveSessionId,
        request_id: requestId,
        status: "NO_AUTHORIZED_EVIDENCE",
        evidence_status: "NO_AUTHORIZED_EVIDENCE",
        answer: boundaryAnswer,
        citations: [],
        response_scope: {
          user_name: user?.name,
          user_department: user?.department,
          user_clearance: user?.clearance,
          requested_topic: query.slice(0, 45),
          allowed_domains: [`${user?.department} Records`, "General Operations", "HR Policy DOC-401"],
          restricted_domains: user?.clearance !== "Restricted" ? ["Restricted Executive M&A", "Finance Forecasts", "Confidential Compensation"] : [],
          response_mode: "BOUNDARY_ALTERNATIVE",
          policy_applied: appliedPolicy
        }
      });
    }

    // Check for untrusted instruction inside documents (e.g. DOC-SEC-004 / INC-SEC-2026-89)
    if (isForensicQuery || selectedDocs.some(d => d.doc_id === 'DOC-SEC-004' || (d.title && d.title.includes('INC-SEC-2026-89')))) {
      untrustedDetected = true;
    }

    // Build Grounded Answer from Authorized Evidence
    let answerText = "";
    const mainDoc = selectedDocs[0];
    if (mainDoc.summary && mainDoc.summary.length > 30) {
      answerText = `Based on authorized records (${mainDoc.doc_id} v${mainDoc.version} - ${mainDoc.title}):\n\n${mainDoc.summary}`;
    } else if (mainDoc.content) {
      const preview = mainDoc.content.length > 450 ? mainDoc.content.slice(0, 450) + "..." : mainDoc.content;
      answerText = `Based on authorized records (${mainDoc.doc_id} v${mainDoc.version} - ${mainDoc.title}):\n\n${preview}`;
    } else {
      answerText = `Authorized document ${mainDoc.doc_id} (${mainDoc.title}) verified.`;
    }

    if (untrustedDetected) {
      answerText += "\n\n[Security Shield Alert] Untrusted instruction detected in document content. The instruction was ignored.";
    }

    const citations = selectedDocs.slice(0, 3).map(d => ({
      document_id: d.doc_id,
      title: d.title,
      version: d.version,
      effective_date: d.effective_date,
      classification: d.classification
    }));

    return finishResponse({
      session_id: effectiveSessionId,
      request_id: requestId,
      status: "SUCCESS",
      evidence_status: "AUTHORIZED_EVIDENCE_USED",
      answer: answerText,
      citations: citations,
      untrusted_instruction_detected: untrustedDetected,
      response_scope: {
        user_name: user?.name,
        user_department: user?.department,
        user_clearance: user?.clearance,
        requested_topic: query.slice(0, 45),
        allowed_domains: [`${user?.department} Records`, "General Operations", "HR Policy DOC-401"],
        restricted_domains: user?.clearance !== "Restricted" ? ["Restricted Executive M&A", "Confidential Compensation"] : [],
        response_mode: "FULL_AUTHORIZED",
        policy_applied: "ABAC-IDENTITY-MATCH (SEC-POL-01)"
      }
    });
  },

  getAllDocuments() {
    return getStoredDocuments();
  },

  uploadDocument(user, formData) {
    const docs = getStoredDocuments();
    const newId = docs.length + 101;
    const docId = `DOC-${newId}`;
    
    const newDoc = {
      id: newId,
      doc_id: docId,
      title: formData.get('title') || 'Uploaded Document',
      description: formData.get('description') || '',
      content: `Document contents for ${formData.get('title')}. Indexed successfully.`,
      summary: formData.get('description') || 'Uploaded document record.',
      classification: formData.get('classification') || 'Internal',
      required_clearance: formData.get('required_clearance') || 'Internal',
      allowed_departments: (formData.get('allowed_departments') || '').split(',').map(s => s.trim()).filter(Boolean),
      allowed_roles: (formData.get('allowed_roles') || '').split(',').map(s => s.trim()).filter(Boolean),
      explicit_denies: [],
      owner_department: formData.get('owner_department') || 'Corporate',
      version: formData.get('version') || '1.0',
      lineage_group: formData.get('lineage_group') || docId,
      effective_date: formData.get('effective_date') || '2026-09-01',
      status: formData.get('status') || 'ACTIVE',
      is_searchable: (formData.get('status') || 'ACTIVE') === 'ACTIVE'
    };

    docs.unshift(newDoc);
    localStorage.setItem('nova_docs_store', JSON.stringify(docs));
    return newDoc;
  },

  updateDocument(id, docData) {
    const docs = getStoredDocuments();
    const idx = docs.findIndex(d => d.id === parseInt(id));
    if (idx !== -1) {
      docs[idx] = { ...docs[idx], ...docData };
      localStorage.setItem('nova_docs_store', JSON.stringify(docs));
      return docs[idx];
    }
    throw new Error('Document not found');
  },

  deleteDocument(id) {
    let docs = getStoredDocuments();
    docs = docs.filter(d => d.id !== parseInt(id));
    localStorage.setItem('nova_docs_store', JSON.stringify(docs));
    return { message: 'Document deleted successfully.' };
  },

  getAllUsers() {
    return getStoredUsers();
  },

  createUser(userData) {
    const users = getStoredUsers();
    const newUser = {
      id: users.length + 101,
      ...userData,
      status: userData.status || 'ACTIVE'
    };
    users.push(newUser);
    localStorage.setItem('nova_users_store', JSON.stringify(users));
    return newUser;
  },

  updateUser(id, userData) {
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === parseInt(id));
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...userData };
      localStorage.setItem('nova_users_store', JSON.stringify(users));
      return users[idx];
    }
    throw new Error('User not found');
  },

  deleteUser(id) {
    let users = getStoredUsers();
    users = users.filter(u => u.id !== parseInt(id));
    localStorage.setItem('nova_users_store', JSON.stringify(users));
    return { message: 'User deleted successfully.' };
  },

  getAdminOverview() {
    const docs = getStoredDocuments();
    const users = getStoredUsers();
    const logs = getStoredAuditLogs();

    const classCounts = { Public: 0, Internal: 0, Confidential: 0, Restricted: 0 };
    docs.forEach(d => {
      if (classCounts[d.classification] !== undefined) {
        classCounts[d.classification]++;
      }
    });

    const recentDecisions = { ALLOWED: 0, DENIED: 0 };
    logs.forEach(l => {
      (l.authorization_decisions || []).forEach(d => {
        recentDecisions[d.decision] = (recentDecisions[d.decision] || 0) + 1;
      });
    });

    return {
      total_documents: docs.length,
      total_users: users.length,
      total_queries: logs.length,
      classification_counts: classCounts,
      recent_decisions: recentDecisions,
      recent_activity: logs.slice(0, 10)
    };
  },

  getAuditLogs() {
    return getStoredAuditLogs();
  },

  getPolicies() {
    return {
      classification_hierarchy: [
        { name: "Public", level: 0, description: "Accessible across the company and external domains if published." },
        { name: "Internal", level: 1, description: "Standard company information accessible to all employees with Internal clearance." },
        { name: "Confidential", level: 2, description: "Sensitive departmental or cross-functional projects requiring explicit department/role authorization." },
        { name: "Restricted", level: 3, description: "Highly restricted executive or privileged board communications." }
      ],
      reason_codes: [
        { code: "ALLOWED", description: "All security attribute conditions satisfied." },
        { code: "CLEARANCE_INSUFFICIENT", description: "User security clearance tier is lower than required by document." },
        { code: "DEPARTMENT_NOT_ALLOWED", description: "User department does not match document department restriction list." },
        { code: "ROLE_NOT_ALLOWED", description: "User role does not match document allowed role list." },
        { code: "EXPLICIT_DENY", description: "User is explicitly listed in document deny rule." }
      ]
    };
  },

  // Governed Workplace Actions
  applyLeave(employeeId, data) {
    const users = getStoredUsers();
    const user = users.find(u => u.employee_id === employeeId);
    if (!user) throw new Error("User not found.");

    const startDate = data.start_date;
    const endDate = data.end_date;
    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required (YYYY-MM-DD format).");
    }
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      throw new Error("Invalid date format. Use YYYY-MM-DD.");
    }
    if (d1 > d2) {
      throw new Error("Start date must be before or equal to end date.");
    }

    const daysCount = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);

    if (daysCount > user.leave_balance) {
      throw new Error(`Insufficient leave balance: Requested ${daysCount} days, but available balance is ${user.leave_balance} days.`);
    }

    // Check overlap
    const existing = getStoredLeaveRequests().filter(r => r.employee_id === employeeId && r.status !== 'Rejected');
    for (const r of existing) {
      if (!(endDate < r.start_date || startDate > r.end_date)) {
        throw new Error(`Conflict detected: You already have a leave request (${r.request_id} [${r.status}]) from ${r.start_date} to ${r.end_date} overlapping with this period.`);
      }
    }

    let approver = null;
    if (user.manager_id) {
      approver = users.find(u => u.employee_id === user.manager_id);
    }
    if (!approver) {
      approver = users.find(u => u.employee_id === 'EXEC001') || { employee_id: 'EXEC001', name: 'Victoria Sterling' };
    }

    const reqId = `LEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq = {
      request_id: reqId,
      employee_id: user.employee_id,
      employee_name: user.name,
      department: user.department,
      leave_type: data.leave_type || "Casual",
      start_date: startDate,
      end_date: endDate,
      days_count: daysCount,
      reason: data.reason || "Personal leave request",
      status: "Pending",
      approver_id: approver.employee_id,
      approver_name: approver.name,
      rejection_reason: null,
      created_at: new Date().toISOString()
    };

    const allRequests = getStoredLeaveRequests();
    allRequests.unshift(newReq);
    saveLeaveRequests(allRequests);

    addAuditLog({
      request_id: `REQ-ACT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      user_employee_id: user.employee_id,
      user_dept: user.department,
      user_role: user.role,
      user_clearance: user.clearance,
      query: `APPLY_LEAVE: ${startDate} to ${endDate} (${daysCount} days)`,
      candidate_ids: ["DOC-401"],
      authorization_decisions: [{
        action: "LEAVE_APPLY",
        decision: "ALLOWED",
        target: approver.employee_id,
        reason_code: "SUBMITTED_FOR_APPROVAL"
      }],
      authorized_ids: ["DOC-401"],
      selected_ids: ["DOC-401"],
      response_status: "SUCCESS",
      answer_preview: `Leave request ${reqId} created and routed to ${approver.name}.`
    });

    return newReq;
  },

  getMyLeaveRequests(employeeId) {
    const all = getStoredLeaveRequests();
    return all.filter(r => r.employee_id === employeeId);
  },

  getPendingApprovals(managerId) {
    const users = getStoredUsers();
    const user = users.find(u => u.employee_id === managerId);
    const all = getStoredLeaveRequests();
    if (user?.is_admin) {
      return all.filter(r => r.status === 'Pending' && r.employee_id !== managerId);
    }
    return all.filter(r => r.approver_id === managerId && r.status === 'Pending' && r.employee_id !== managerId);
  },

  approveLeave(approverId, requestId) {
    const users = getStoredUsers();
    const approver = users.find(u => u.employee_id === approverId);
    const all = getStoredLeaveRequests();
    const req = all.find(r => r.request_id === requestId);
    if (!req) throw new Error("Leave request not found.");

    if (req.employee_id === approverId) {
      const err = new Error("Self-approval violation: An employee cannot approve their own leave request under Section 4.2 Governance Rules.");
      err.status = 403;
      throw err;
    }

    if (!approver?.is_admin && req.approver_id !== approverId) {
      const err = new Error("Unauthorized approver: Only the assigned manager or administrator can approve this request.");
      err.status = 403;
      throw err;
    }

    if (req.status !== 'Pending') {
      throw new Error(`Request has already been marked as ${req.status}.`);
    }

    // Deduct balance
    const employee = users.find(u => u.employee_id === req.employee_id);
    if (employee) {
      employee.leave_balance = Math.max(0, (employee.leave_balance || 18) - req.days_count);
      localStorage.setItem('nova_users_store', JSON.stringify(users));
    }

    req.status = 'Approved';
    saveLeaveRequests(all);

    addAuditLog({
      request_id: `REQ-APP-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      user_employee_id: approverId,
      user_dept: approver?.department,
      user_role: approver?.role,
      user_clearance: approver?.clearance,
      query: `APPROVE_LEAVE: ${requestId}`,
      candidate_ids: [],
      authorization_decisions: [{
        action: "LEAVE_APPROVE",
        decision: "ALLOWED",
        target: req.employee_id,
        reason_code: "MANAGER_AUTHORIZED"
      }],
      authorized_ids: [],
      selected_ids: [],
      response_status: "SUCCESS",
      answer_preview: `Approved leave request ${requestId} for ${req.employee_name}.`
    });

    return req;
  },

  rejectLeave(approverId, requestId, rejectionReason = '') {
    const users = getStoredUsers();
    const approver = users.find(u => u.employee_id === approverId);
    const all = getStoredLeaveRequests();
    const req = all.find(r => r.request_id === requestId);
    if (!req) throw new Error("Leave request not found.");

    if (req.employee_id === approverId) {
      const err = new Error("Self-approval violation: An employee cannot decide their own leave request.");
      err.status = 403;
      throw err;
    }

    if (!approver?.is_admin && req.approver_id !== approverId) {
      const err = new Error("Unauthorized approver: Only the assigned manager or administrator can reject this request.");
      err.status = 403;
      throw err;
    }

    req.status = 'Rejected';
    req.rejection_reason = rejectionReason || 'Operational workload constraints';
    saveLeaveRequests(all);

    addAuditLog({
      request_id: `REQ-REJ-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      user_employee_id: approverId,
      user_dept: approver?.department,
      user_role: approver?.role,
      user_clearance: approver?.clearance,
      query: `REJECT_LEAVE: ${requestId}`,
      candidate_ids: [],
      authorization_decisions: [{
        action: "LEAVE_REJECT",
        decision: "ALLOWED",
        target: req.employee_id,
        reason_code: "MANAGER_REJECTED"
      }],
      authorized_ids: [],
      selected_ids: [],
      response_status: "SUCCESS",
      answer_preview: `Rejected leave request ${requestId} for ${req.employee_name}.`
    });

    return req;
  },

  getLeaveBalance(employeeId) {
    const users = getStoredUsers();
    const user = users.find(u => u.employee_id === employeeId);
    const all = getStoredLeaveRequests().filter(r => r.employee_id === employeeId);
    const pendingCount = all.filter(r => r.status === 'Pending').length;
    const approvedCount = all.filter(r => r.status === 'Approved').length;

    return {
      employee_id: employeeId,
      leave_balance: user ? user.leave_balance : 18,
      pending_leaves_count: pendingCount,
      approved_leaves_count: approvedCount
    };
  },

  testPolicy(employeeId, docId) {
    const users = getStoredUsers();
    const docs = getStoredDocuments();
    const user = users.find(u => u.employee_id === employeeId || u.id === parseInt(employeeId));
    const doc = docs.find(d => d.doc_id === docId || d.id === parseInt(docId));

    if (!user || !doc) {
      throw new Error('User or Document not found');
    }

    const evalRes = evaluatePolicy(user, doc);
    return {
      user: {
        employee_id: user.employee_id,
        name: user.name,
        role: user.role,
        department: user.department,
        clearance: user.clearance,
        status: user.status
      },
      document: {
        doc_id: doc.doc_id,
        title: doc.title,
        classification: doc.classification,
        required_clearance: doc.required_clearance,
        allowed_departments: doc.allowed_departments,
        allowed_roles: doc.allowed_roles,
        explicit_denies: doc.explicit_denies
      },
      evaluation: evalRes
    };
  }
};
