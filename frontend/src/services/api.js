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
      // If Vercel returned HTML (e.g. index.html rewrite or 404 page) because backend is not configured
      if (!response.ok || rawText.trim().startsWith('<')) {
        const errorMsg = !response.ok 
          ? `Backend unreachable (${response.status}). Please ensure backend is running or VITE_API_URL is configured.`
          : 'Backend returned invalid response. Please verify VITE_API_URL environment variable on Vercel.';
        const error = new Error(errorMsg);
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
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id, password })
    });
    return handleResponse(res);
  },

  async demoSwitch(employee_id) {
    const res = await fetch(`${API_BASE}/auth/demo-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id })
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getDemoAccounts() {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return handleResponse(res);
  },

  // Research (NexusGuard)
  async queryNexusGuard(query, sessionId = null) {
    const res = await fetch(`${API_BASE}/research/query`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, session_id: sessionId })
    });
    return handleResponse(res);
  },

  async getSessions() {
    const res = await fetch(`${API_BASE}/research/sessions`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getSessionDetail(sessionId) {
    const res = await fetch(`${API_BASE}/research/sessions/${sessionId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Intranet Portal & Workload
  async getWorkload() {
    const res = await fetch(`${API_BASE}/portal/workload`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Documents (Employee view)
  async getAuthorizedDocuments() {
    const res = await fetch(`${API_BASE}/documents`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getDocumentDetail(docId) {
    const res = await fetch(`${API_BASE}/documents/${docId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Admin & Governance
  async getAdminOverview() {
    const res = await fetch(`${API_BASE}/admin/overview`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getAllDocuments() {
    const res = await fetch(`${API_BASE}/admin/documents`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async uploadDocument(formData) {
    const res = await fetch(`${API_BASE}/admin/documents/upload`, {
      method: 'POST',
      headers: getMultipartAuthHeaders(),
      body: formData
    });
    return handleResponse(res);
  },

  async createDocument(docData) {
    const res = await fetch(`${API_BASE}/admin/documents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(docData)
    });
    return handleResponse(res);
  },

  async updateDocument(id, docData) {
    const res = await fetch(`${API_BASE}/admin/documents/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(docData)
    });
    return handleResponse(res);
  },

  async deleteDocument(id) {
    const res = await fetch(`${API_BASE}/admin/documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // User Management
  async getAllUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createUser(userData) {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  async updateUser(id, userData) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  async deleteUser(id) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Policies & Simulator
  async getPolicies() {
    const res = await fetch(`${API_BASE}/admin/policies`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async testPolicy(employeeId, docId) {
    const res = await fetch(`${API_BASE}/admin/policies/test`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ employee_id: employeeId, doc_id: docId })
    });
    return handleResponse(res);
  },

  async getAuditLogs(userId = null, status = null, limit = 50) {
    let url = `${API_BASE}/admin/audit?limit=${limit}`;
    if (userId) url += `&user_id=${encodeURIComponent(userId)}`;
    if (status) url += `&status_filter=${encodeURIComponent(status)}`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getSecurityTrace(requestId) {
    const res = await fetch(`${API_BASE}/admin/requests/${requestId}/trace`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};
