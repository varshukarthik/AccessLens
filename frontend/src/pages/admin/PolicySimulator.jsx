import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Sliders, 
  Zap, 
  Cpu, 
  Layers, 
  Building2, 
  Eye, 
  ArrowRight 
} from 'lucide-react';

const ACTIONS = [
  { id: 'RETRIEVAL', name: 'Information Retrieval (ABAC Gate)', desc: 'Pre-LLM context gating and document access' },
  { id: 'LEAVE_APPLY', name: 'Apply for Leave (Workplace Action)', desc: 'Validates entitlement quota and assigns approver' },
  { id: 'LEAVE_APPROVE', name: 'Approve Leave (Section 4.2)', desc: 'Enforces manager countersignature & bars self-approval' },
  { id: 'OVERRIDE_TEST', name: 'Prompt Override / Bypass Attempt', desc: 'Simulates prompt injection against security filters' }
];

const CLEARANCES = ['Public', 'Internal', 'Confidential', 'Restricted'];

export default function PolicySimulator() {
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedAction, setSelectedAction] = useState('RETRIEVAL');
  
  // Attribute overrides
  const [overrideClearance, setOverrideClearance] = useState('');
  const [overrideDept, setOverrideDept] = useState('');
  const [overrideStatus, setOverrideStatus] = useState('ACTIVE');
  
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getAllUsers ? api.getAllUsers() : api.getDemoAccounts(),
      api.getDocuments()
    ]).then(([uList, dList]) => {
      setUsers(uList || []);
      setDocuments(dList || []);
      if (uList && uList.length > 0) setSelectedEmployeeId(uList[0].employee_id);
      if (dList && dList.length > 0) setSelectedDocId(dList[0].doc_id);
    }).catch(err => console.error('Failed to load simulator base data:', err));
  }, []);

  const handleSimulate = async () => {
    if (!selectedEmployeeId || !selectedDocId) return;

    setLoading(true);
    try {
      // Fetch base policy evaluation
      const baseRes = await api.testPolicy(selectedEmployeeId, selectedDocId);
      
      const user = users.find(u => u.employee_id === selectedEmployeeId) || baseRes.user;
      const doc = documents.find(d => d.doc_id === selectedDocId) || baseRes.document;

      const effClearance = overrideClearance || user.clearance;
      const effDept = overrideDept || user.department;
      const effStatus = overrideStatus || user.status;

      const clearanceLevels = { 'Public': 0, 'Internal': 1, 'Confidential': 2, 'Restricted': 3 };
      const userLevel = clearanceLevels[effClearance] ?? 1;
      const reqLevel = clearanceLevels[doc.required_clearance || 'Internal'] ?? 1;

      let isAllowed = true;
      let reasonCode = 'PERMITTED_MATCH';
      let outcome = 'ALLOWED';
      let responseMode = 'FULL_AUTHORIZED';

      if (selectedAction === 'OVERRIDE_TEST') {
        isAllowed = false;
        outcome = 'BLOCKED';
        reasonCode = 'PRE_RETRIEVAL_ADVERSARIAL_DEFENSE';
        responseMode = 'ADVERSARIAL_BLOCKED';
      } else if (effStatus === 'TERMINATED') {
        isAllowed = false;
        outcome = 'DENIED';
        reasonCode = 'EMPLOYEE_STATUS_TERMINATED';
        responseMode = 'TERMINATED_DENIAL';
      } else if (selectedAction === 'LEAVE_APPROVE') {
        // Test self-approval
        isAllowed = false;
        outcome = 'FORBIDDEN (403)';
        reasonCode = 'SECTION_4_2_SELF_APPROVAL_PROHIBITED';
        responseMode = 'GOVERNANCE_BLOCKED';
      } else if (selectedAction === 'LEAVE_APPLY') {
        isAllowed = true;
        outcome = 'ROUTED';
        reasonCode = 'WORKPLACE_ACTION_PENDING_APPROVAL';
        responseMode = 'ACTION_PROCESSED';
      } else {
        // RETRIEVAL
        if (doc.explicit_denies && doc.explicit_denies.includes(selectedEmployeeId)) {
          isAllowed = false;
          outcome = 'DENIED';
          reasonCode = 'EXPLICIT_DENY_POLICY_ACTIVE';
          responseMode = 'BOUNDARY_ALTERNATIVE';
        } else if (userLevel < reqLevel) {
          isAllowed = false;
          outcome = 'DENIED';
          reasonCode = 'CLEARANCE_LEVEL_INSUFFICIENT';
          responseMode = 'BOUNDARY_ALTERNATIVE';
        } else if (doc.allowed_departments && doc.allowed_departments.length > 0 && !doc.allowed_departments.includes(effDept)) {
          isAllowed = false;
          outcome = 'DENIED';
          reasonCode = 'DEPARTMENT_AUTHORIZATION_MISMATCH';
          responseMode = 'BOUNDARY_ALTERNATIVE';
        } else if (doc.allowed_roles && doc.allowed_roles.length > 0 && !doc.allowed_roles.includes(user.role)) {
          isAllowed = false;
          outcome = 'DENIED';
          reasonCode = 'ROLE_AUTHORIZATION_MISMATCH';
          responseMode = 'BOUNDARY_ALTERNATIVE';
        } else {
          isAllowed = true;
          outcome = 'ALLOWED';
          reasonCode = 'ABAC_ATTRIBUTE_MATCH';
          responseMode = 'FULL_AUTHORIZED';
        }
      }

      setSimulationResult({
        user: {
          ...user,
          clearance: effClearance,
          department: effDept,
          status: effStatus
        },
        document: doc,
        action: selectedAction,
        is_allowed: isAllowed,
        outcome: outcome,
        reason_code: reasonCode,
        response_mode: responseMode,
        allowed_domains: isAllowed ? [`${effDept} Records`, 'General Operations', 'HR Policy DOC-401'] : ['General Company Handbooks'],
        restricted_domains: isAllowed ? [] : [doc.classification + ' Documents', doc.title]
      });
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEmployeeId && selectedDocId) {
      handleSimulate();
    }
  }, [selectedEmployeeId, selectedDocId, selectedAction, overrideClearance, overrideDept, overrideStatus]);

  const activeUser = users.find(u => u.employee_id === selectedEmployeeId);
  const activeDoc = documents.find(d => d.doc_id === selectedDocId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Cpu className="w-5 h-5 text-emerald-400 dark:text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>ABAC Policy Simulator & Governance Workbench</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive pre-LLM access control engine simulator. Test permissions across personas, documents, and governed actions.
              </p>
            </div>
          </div>

          <button
            onClick={handleSimulate}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-evaluate Policy</span>
          </button>
        </div>
      </div>

      {/* Simulator Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: User Selection & Attribute Overrides */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">1. Select Identity Subject</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">User Persona</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  setOverrideClearance('');
                  setOverrideDept('');
                  setOverrideStatus('ACTIVE');
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                {users.map(u => (
                  <option key={u.employee_id} value={u.employee_id}>
                    {u.name} ({u.employee_id}) — {u.department} ({u.clearance})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Attributes:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Department:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeUser?.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Clearance:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeUser?.clearance}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Role:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{activeUser?.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{activeUser?.status || 'ACTIVE'}</span>
                </div>
              </div>
            </div>

            {/* Test Overrides */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center space-x-1">
                <Sliders className="w-3 h-3 text-slate-400" />
                <span>Simulate Attribute Override:</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Override Clearance</label>
                  <select
                    value={overrideClearance}
                    onChange={(e) => setOverrideClearance(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-800 dark:text-slate-200"
                  >
                    <option value="">(Default: {activeUser?.clearance})</option>
                    {CLEARANCES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Override Status</label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-800 dark:text-slate-200"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="TERMINATED">TERMINATED</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Resource / Document Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">2. Select Resource Object</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Target Document</label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                {documents.map(d => (
                  <option key={d.doc_id} value={d.doc_id}>
                    {d.doc_id} — {d.title} ({d.classification})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Security Policy Constraints:</span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Classification:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{activeDoc?.classification}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Required Clearance:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{activeDoc?.required_clearance || 'Internal'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allowed Departments:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeDoc?.allowed_departments?.length ? activeDoc.allowed_departments.join(', ') : 'All Departments'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allowed Roles:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeDoc?.allowed_roles?.length ? activeDoc.allowed_roles.join(', ') : 'Any Role'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Action Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">3. Select Action Mode</h2>
          </div>

          <div className="space-y-2">
            {ACTIONS.map(act => (
              <button
                key={act.id}
                type="button"
                onClick={() => setSelectedAction(act.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer ${
                  selectedAction === act.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-bold">{act.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulation Outcome Card */}
      {simulationResult && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              {simulationResult.is_allowed ? (
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
              )}

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Deterministic Gate Result</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-bold ${simulationResult.is_allowed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {simulationResult.outcome}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                    {simulationResult.reason_code}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Response Mode:</span>
              <span className="font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {simulationResult.response_mode}
              </span>
            </div>
          </div>

          {/* Analysis Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Permitted Knowledge Domains</span>
              <div className="flex flex-wrap gap-1.5">
                {simulationResult.allowed_domains.map((dom, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800 text-[11px]">
                    ✓ {dom}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Restricted / Excluded Domains</span>
              <div className="flex flex-wrap gap-1.5">
                {simulationResult.restricted_domains.length > 0 ? (
                  simulationResult.restricted_domains.map((rdom, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-medium border border-rose-200 dark:border-rose-800 text-[11px] flex items-center space-x-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{rdom}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">None. Subject clearance satisfies all resource requirements.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
