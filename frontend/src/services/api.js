import { mockBackend } from './mockBackend';

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
  : '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('nexusguard_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

function getMultipartAuthHeaders() {
  const token = localStorage.getItem('nexusguard_token');
  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

function getCurrentStoredUser() {
  const userStr = localStorage.getItem('nexusguard_user');
  if (userStr) {
    try { return JSON.parse(userStr); } catch(e) {}
  }
  return null;
}

async function handleResponse(response) {
  if (response.status === 401) {
    if (!window.location.pathname.includes('/login')) {
      localStorage.removeItem('nexusguard_token');
      localStorage.removeItem('nexusguard_user');
    }
  }

  const rawText = await response.text();
  let data = {};
  
  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      if (!response.ok || rawText.trim().startsWith('<')) {
        const error = new Error(`API error (${response.status})`);
        error.status = response.status;
        throw error;
      }
      data = { detail: rawText };
    }
  }

  if (!response.ok) {
    const error = new Error(data.detail || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  // Auth
  async login(employee_id, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id, password })
      });
      return await handleResponse(res);
    } catch (err) {
      // Graceful fallback to client ABAC engine on Vercel
      console.warn('API unreachable, operating with local ABAC engine:', err.message);
      return mockBackend.login(employee_id, password);
    }
  },

  async demoSwitch(employee_id) {
    try {
      const res = await fetch(`${API_BASE}/auth/demo-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id })
      });
      return await handleResponse(res);
    } catch (err) {
      return mockBackend.login(employee_id, "password123");
    }
  },

  async getMe() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      const user = getCurrentStoredUser();
      if (!user) throw new Error('Not authenticated');
      return user;
    }
  },

  async getDemoAccounts() {
    try {
      const res = await fetch(`${API_BASE}/auth/demo-accounts`);
      return await handleResponse(res);
    } catch (err) {
      return mockBackend.getAllUsers().map(u => ({
        employee_id: u.employee_id,
        name: u.name,
        role: u.role,
        department: u.department,
        clearance: u.clearance,
        is_admin: u.is_admin,
        description: `${u.role} in ${u.department} (${u.clearance} clearance)`
      }));
    }
  },

  // Intranet Portal & Workload
  async getWorkload() {
    try {
      const res = await fetch(`${API_BASE}/portal/workload`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      const user = getCurrentStoredUser();
      return mockBackend.getWorkload(user);
    }
  },

  async getWorkloadData() {
    return this.getWorkload();
  },

  // Research (NexusGuard)
  async queryNexusGuard(query, sessionId = null) {
    try {
      const res = await fetch(`${API_BASE}/research/query`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query, session_id: sessionId })
      });
      return await handleResponse(res);
    } catch (err) {
      const user = getCurrentStoredUser();
      return mockBackend.queryNexusGuard(user, query);
    }
  },

  async getSessions() {
    try {
      const res = await fetch(`${API_BASE}/research/sessions`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      return [];
    }
  },

  async getSessionDetail(sessionId) {
    try {
      const res = await fetch(`${API_BASE}/research/sessions/${sessionId}`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      return { messages: [] };
    }
  },

  // Documents (Employee view)
  async getAuthorizedDocuments() {
    try {
      const res = await fetch(`${API_BASE}/documents`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      const user = getCurrentStoredUser();
      return mockBackend.getAuthorizedDocuments(user);
    }
  },

  async getDocumentDetail(docId) {
    try {
      const res = await fetch(`${API_BASE}/documents/${docId}`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      const user = getCurrentStoredUser();
      const docs = mockBackend.getAuthorizedDocuments(user);
      const doc = docs.find(d => d.doc_id === docId);
      if (!doc) throw new Error('Document not found or access denied');
      return doc;
    }
  },

  // Admin & Governance
  async getAdminOverview() {
    try {
      const res = await fetch(`${API_BASE}/admin/overview`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      return mockBackend.getAdminOverview();
    }
  },

  async getAllDocuments() {
    try {
      const res = await fetch(`${API_BASE}/admin/documents`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      return mockBackend.getAllDocuments();
    }
  },

  async uploadDocument(formData) {
    try {
      const res = await fetch(`${API_BASE}/admin/documents/upload`, {
        method: 'POST',
        headers: getMultipartAuthHeaders(),
        body: formData
      });
      return await handleResponse(res);
    } catch (err) {
      const user = getCurrentStoredUser();
      return mockBackend.uploadDocument(user, formData);
    }
  },

  async createDocument(docData) {
    try {
      const res = await fetch(`${API_BASE}/admin/documents`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(docData)
      });
      return await handleResponse(res);
    } catch (err) {
      return mockBackend.updateDocument(docData.id, docData);
    }
  },

  async updateDocument(id, docData) {
    try {
      const res = await fetch(`${API_BASE}/admin/documents/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(docData)
      });
      return await handleResponse(res);
    } catch (err) {
      return mockBackend.updateDocument(id, docData);
    }
  },

  async deleteDocument(id) {
    try {
      const res = await fetch(`${API_BASE}/admin/documents/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      return mockBackend.deleteDocument(id);
    }
  },

  // User Management
  async getAllUsers() {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      return mockBackend.getAllUsers();
    }
  },

  async createUser(userData) {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      return await handleResponse(res);
    } catch (err) {
      return mockBackend.createUser(userData);
    }
  },

  async updateUser(id, userData) {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      return await handleResponse(res);
    } catch (err) {
      return mockBackend.updateUser(id, userData);
    }
  },

  async deleteUser(id) {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      return mockBackend.deleteUser(id);
    }
  },

  // Policies & Simulator
  async getPolicies() {
    try {
      const res = await fetch(`${API_BASE}/admin/policies`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      return mockBackend.getPolicies();
    }
  },

  async testPolicy(employeeId, docId) {
    try {
      const res = await fetch(`${API_BASE}/admin/policies/test`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ employee_id: employeeId, doc_id: docId })
      });
      return await handleResponse(res);
    } catch (err) {
      return mockBackend.testPolicy(employeeId, docId);
    }
  },

  async getAuditLogs(userId = null, status = null, limit = 50) {
    try {
      let url = `${API_BASE}/admin/audit?limit=${limit}`;
      if (userId) url += `&user_id=${encodeURIComponent(userId)}`;
      if (status) url += `&status_filter=${encodeURIComponent(status)}`;
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      return mockBackend.getAuditLogs();
    }
  },

  async getSecurityTrace(requestId) {
    try {
      const res = await fetch(`${API_BASE}/admin/requests/${requestId}/trace`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      const logs = mockBackend.getAuditLogs();
      const log = logs.find(l => l.request_id === requestId) || logs[0];
      return {
        request_id: log?.request_id || requestId,
        timestamp: log?.timestamp || new Date().toISOString(),
        user: { employee_id: log?.user_employee_id || 'U102' },
        query: log?.query || 'Q4 Forecast',
        candidate_documents: [],
        authorization_decisions: log?.authorization_decisions || [],
        authorized_documents: [],
        version_resolution: { selected_ids: log?.selected_ids || [] },
        llm_evidence_package: [],
        response_status: log?.response_status || 'SUCCESS',
        answer: log?.answer_preview || '',
        citations: []
      };
    }
  },

  // Governed Workplace Actions
  async applyLeave(data) {
    try {
      const res = await fetch(`${API_BASE}/actions/leave/apply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await handleResponse(res);
    } catch (err) {
      const curUser = getCurrentStoredUser();
      return mockBackend.applyLeave(curUser?.employee_id || 'U102', data);
    }
  },

  async getMyLeaveRequests() {
    try {
      const res = await fetch(`${API_BASE}/actions/leave/my-requests`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      const curUser = getCurrentStoredUser();
      return mockBackend.getMyLeaveRequests(curUser?.employee_id || 'U102');
    }
  },

  async getPendingApprovals() {
    try {
      const res = await fetch(`${API_BASE}/actions/leave/pending-approvals`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      const curUser = getCurrentStoredUser();
      return mockBackend.getPendingApprovals(curUser?.employee_id || 'U102');
    }
  },

  async approveLeave(requestId) {
    try {
      const res = await fetch(`${API_BASE}/actions/leave/${requestId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      const curUser = getCurrentStoredUser();
      return mockBackend.approveLeave(curUser?.employee_id || 'U102', requestId);
    }
  },

  async rejectLeave(requestId, rejectionReason = '') {
    try {
      const res = await fetch(`${API_BASE}/actions/leave/${requestId}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rejection_reason: rejectionReason })
      });
      return await handleResponse(res);
    } catch (err) {
      const curUser = getCurrentStoredUser();
      return mockBackend.rejectLeave(curUser?.employee_id || 'U102', requestId, rejectionReason);
    }
  },

  async getLeaveBalance() {
    try {
      const res = await fetch(`${API_BASE}/actions/leave/balance`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      const curUser = getCurrentStoredUser();
      return mockBackend.getLeaveBalance(curUser?.employee_id || 'U102');
    }
  }
};
