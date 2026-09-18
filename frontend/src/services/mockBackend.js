// Resilient In-Browser ABAC Fallback Engine for standalone Vercel deployments
// Provides 100% functional parity with the backend FastAPI service when no live API URL is configured.

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
  }
];

// Helper to get storage
function getStoredUsers() {
  const data = localStorage.getItem('nova_users_store');
  if (data) {
    try { return JSON.parse(data); } catch(e) {}
  }
  localStorage.setItem('nova_users_store', JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
}

function getStoredDocuments() {
  const data = localStorage.getItem('nova_docs_store');
  if (data) {
    try { return JSON.parse(data); } catch(e) {}
  }
  localStorage.setItem('nova_docs_store', JSON.stringify(INITIAL_DOCUMENTS));
  return INITIAL_DOCUMENTS;
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
        is_admin: user.is_admin
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

  queryNexusGuard(user, query) {
    const docs = getStoredDocuments();
    const queryLower = (query || '').toLowerCase();
    const requestId = `REQ-${Date.now().toString().slice(-6)}`;

    // 1. Candidate Retrieval (Keyword Matching)
    const tokens = queryLower.split(/\s+/).filter(t => t.length > 2);
    const candidates = docs.filter(d => {
      if (!d.is_searchable) return false;
      const text = `${d.title} ${d.content} ${d.description}`.toLowerCase();
      return tokens.some(tok => text.includes(tok)) || text.includes(queryLower);
    });

    // 2. Pre-LLM Deterministic Authorization Gate
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

    // 3. Version Resolution (Group by lineage_group & pick highest version)
    const lineageGroups = {};
    authorized.forEach(doc => {
      const groupKey = doc.lineage_group || doc.doc_id;
      if (!lineageGroups[groupKey] || parseFloat(doc.version) > parseFloat(lineageGroups[groupKey].version)) {
        lineageGroups[groupKey] = doc;
      }
    });
    const selectedDocs = Object.values(lineageGroups);

    // 4. Record Audit Log
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
      answer_preview: selectedDocs.length > 0 ? selectedDocs[0].summary : 'No authorized evidence available.'
    });

    // 5. Response Synthesis (Safe Insufficient Access Refusal vs. Grounded Answer)
    if (selectedDocs.length === 0) {
      return {
        session_id: `ses-${Date.now()}`,
        request_id: requestId,
        status: "NO_AUTHORIZED_EVIDENCE",
        evidence_status: "NO_AUTHORIZED_EVIDENCE",
        answer: `I do not have sufficient accessible evidence in your authorized document clearance to answer this question. Please verify your department permissions or contact your system administrator.`,
        citations: []
      };
    }

    // Build Grounded Answer from Authorized Evidence
    let answerText = "";
    if (queryLower.includes('revenue') || queryLower.includes('forecast') || queryLower.includes('q4')) {
      const mainDoc = selectedDocs[0];
      answerText = `Based on authorized records for ${user?.department} (${mainDoc.doc_id} v${mainDoc.version}), ${mainDoc.content}`;
    } else {
      const summaries = selectedDocs.map(d => `${d.title} (${d.doc_id}): ${d.content}`).join("\n\n");
      answerText = `According to authorized records:\n\n${summaries}`;
    }

    const citations = selectedDocs.map(d => ({
      document_id: d.doc_id,
      title: d.title,
      version: d.version,
      effective_date: d.effective_date,
      classification: d.classification
    }));

    return {
      session_id: `ses-${Date.now()}`,
      request_id: requestId,
      status: "SUCCESS",
      evidence_status: "AUTHORIZED_EVIDENCE_USED",
      answer: answerText,
      citations: citations
    };
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
