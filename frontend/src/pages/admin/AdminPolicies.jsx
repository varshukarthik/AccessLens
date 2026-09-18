import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Layers, 
  Play, 
  User, 
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function AdminPolicies() {
  const [policyData, setPolicyData] = useState(null);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    api.getPolicies().then(setPolicyData).catch(console.error);
    api.getAllUsers().then(data => {
      setUsers(data);
      if (data.length > 0) setSelectedUser(data[0].employee_id);
    }).catch(console.error);
    api.getAllDocuments().then(data => {
      setDocuments(data);
      if (data.length > 0) setSelectedDoc(data[0].doc_id);
    }).catch(console.error);
  }, []);

  const handleSimulate = async () => {
    if (!selectedUser || !selectedDoc) return;
    setSimulating(true);
    try {
      const res = await api.testPolicy(selectedUser, selectedDoc);
      setSimulationResult(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
          <Sliders className="w-4 h-4" />
          <span>Rules & Policy Engine</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Access Policies & Simulator</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Deterministic classification matrix, reason codes, and live permission simulator.
        </p>
      </div>

      {/* Interactive Policy Simulator */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Play className="w-4 h-4 text-purple-600 fill-purple-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Interactive Policy Gate Simulator</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Employee Persona</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 font-medium"
            >
              {users.map(u => (
                <option key={u.id} value={u.employee_id}>
                  {u.name} ({u.employee_id} • {u.department} • {u.clearance})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Target Document</label>
            <select
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 font-medium"
            >
              {documents.map(d => (
                <option key={d.id} value={d.doc_id}>
                  {d.doc_id} - {d.title} [{d.classification}]
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition shadow-sm flex items-center justify-center space-x-2"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{simulating ? 'Evaluating...' : 'Simulate Gate Evaluation'}</span>
            </button>
          </div>
        </div>

        {simulationResult && (
          <div className={`p-5 rounded-2xl border transition space-y-3 ${
            simulationResult.evaluation.is_allowed
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-red-50/70 border-red-200 text-red-950'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-sm">
                {simulationResult.evaluation.is_allowed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>Deterministic Gate Outcome: {simulationResult.evaluation.decision}</span>
              </div>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded font-bold bg-white border">
                {simulationResult.evaluation.reason_code}
              </span>
            </div>

            <p className="text-xs leading-relaxed">
              {simulationResult.evaluation.reason_description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-[11px] pt-2 border-t border-slate-200/60 font-mono">
              <div>
                <strong>User Context:</strong> {simulationResult.user.name} ({simulationResult.user.employee_id}), Dept: {simulationResult.user.department}, Role: {simulationResult.user.role}, Clearance: {simulationResult.user.clearance}
              </div>
              <div>
                <strong>Document Constraints:</strong> {simulationResult.document.doc_id}, Class: {simulationResult.document.classification}, Depts: [{simulationResult.document.allowed_departments.join(', ')}], Roles: [{simulationResult.document.allowed_roles.join(', ')}]
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Policy Matrix Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classification Hierarchy */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Classification Hierarchy</h3>
          <div className="space-y-2">
            {policyData?.classification_hierarchy?.map((lvl) => (
              <div key={lvl.name} className="p-3 rounded-xl bg-slate-50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{lvl.name}</span>
                  <p className="text-[11px] text-slate-500">{lvl.description}</p>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Level {lvl.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reason Codes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Deterministic Reason Codes</h3>
          <div className="space-y-2">
            {policyData?.reason_codes?.map((rc) => (
              <div key={rc.code} className="p-3 rounded-xl bg-slate-50 border border-slate-100 dark:border-slate-800 space-y-0.5 text-xs">
                <span className="font-mono font-bold text-purple-700 text-[11px]">{rc.code}</span>
                <p className="text-[11px] text-slate-500">{rc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
