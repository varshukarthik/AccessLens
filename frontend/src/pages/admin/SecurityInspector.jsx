import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Layers, 
  FileText, 
  Sparkles, 
  Bot, 
  Clock, 
  User, 
  ArrowDown, 
  Eye, 
  AlertTriangle,
  ChevronRight,
  Database
} from 'lucide-react';

export default function SecurityInspector() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialReqId = searchParams.get('requestId') || '';

  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(initialReqId);
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load list of recent audit logs for request selector
  useEffect(() => {
    api.getAuditLogs(null, null, 30)
      .then(logs => {
        setAuditLogs(logs);
        if (!selectedRequestId && logs.length > 0) {
          setSelectedRequestId(logs[0].request_id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch security trace whenever selectedRequestId changes
  useEffect(() => {
    if (selectedRequestId) {
      setLoading(true);
      setError(null);
      api.getSecurityTrace(selectedRequestId)
        .then(trace => {
          setTraceData(trace);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message || 'Unable to load trace.');
          setLoading(false);
        });
    }
  }, [selectedRequestId]);

  const handleSelectRequest = (reqId) => {
    setSelectedRequestId(reqId);
    setSearchParams({ requestId: reqId });
  };

  const getReasonCodeBadge = (code) => {
    switch (code) {
      case 'ALLOWED':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono text-[10px]">ALLOWED</span>;
      case 'ROLE_NOT_ALLOWED':
        return <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold font-mono text-[10px]">ROLE_NOT_ALLOWED</span>;
      case 'DEPARTMENT_NOT_ALLOWED':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-mono text-[10px]">DEPARTMENT_NOT_ALLOWED</span>;
      case 'CLEARANCE_INSUFFICIENT':
        return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold font-mono text-[10px]">CLEARANCE_INSUFFICIENT</span>;
      case 'EXPLICIT_DENY':
        return <span className="px-2 py-0.5 rounded bg-red-200 text-red-900 font-bold font-mono text-[10px]">EXPLICIT_DENY</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold font-mono text-[10px]">{code}</span>;
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
            <Search className="w-4 h-4" />
            <span>Core Hackathon Verification Tool</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Security Inspector</h1>
          <p className="text-xs text-slate-500">
            Step-by-step visual verification: Candidate Retrieval → Deterministic Gate → Authorized Evidence → LLM Context.
          </p>
        </div>

        {/* Request Dropdown Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600">Select Request:</span>
          <select
            value={selectedRequestId}
            onChange={(e) => handleSelectRequest(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            {auditLogs.map((log) => (
              <option key={log.request_id} value={log.request_id}>
                {log.request_id} ({log.user_employee_id} • {log.user_dept} • {log.response_status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 animate-pulse bg-white rounded-3xl border border-slate-200">
          Decompiling security trace for {selectedRequestId}...
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-xs text-red-700">
          {error}
        </div>
      ) : !traceData ? (
        <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
          Select an audit log request to inspect pipeline execution.
        </div>
      ) : (
        <div className="space-y-6">

          {/* STEP 1 & 2: User Context & Query */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* User Security Context */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>1. Authenticated User Context</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee ID</span>
                  <span className="font-bold text-slate-900 font-mono">{traceData.user?.employee_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department</span>
                  <span className="font-semibold text-slate-800">{traceData.user?.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Role</span>
                  <span className="font-semibold text-slate-800">{traceData.user?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Clearance</span>
                  <span className="font-bold text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {traceData.user?.clearance}
                  </span>
                </div>
              </div>
            </div>

            {/* Query & Timing */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>2. Employee Research Query</span>
                </div>
                <span className="font-mono text-slate-400">{traceData.request_id}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="font-medium text-sm sm:text-base font-sans leading-relaxed">
                  "{traceData.query}"
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Timestamp: {new Date(traceData.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* PIPELINE ARROW */}
          <div className="flex justify-center">
            <div className="p-2 rounded-full bg-slate-200 text-slate-600">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* STEP 3 & 4: Candidate Retrieval & Deterministic Policy Gate */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>3. Candidate Retrieval & 4. Deterministic Authorization Gate</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  Evaluated Candidate Documents ({traceData.authorization_decisions?.length || 0})
                </h3>
              </div>
              <div className="text-xs text-slate-500">
                Rule: <span className="font-semibold text-slate-800">Clearance ≥ Classification & Dept/Role match</span>
              </div>
            </div>

            <div className="space-y-3">
              {traceData.authorization_decisions?.map((dec, idx) => {
                const isAllowed = dec.decision === 'ALLOWED';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      isAllowed
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-red-50/60 border-red-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {isAllowed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        )}
                        <span className="font-bold text-slate-900">{dec.title}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-700 border">
                          {dec.doc_id}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-white">
                          {dec.classification}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 pl-6">
                        {isAllowed 
                          ? 'Passed deterministic gate. Safe for LLM evidence envelope.' 
                          : 'BLOCKED from reaching LLM context or employee frontend.'}
                      </div>
                    </div>

                    <div className="pl-6 sm:pl-0 flex items-center space-x-2">
                      {getReasonCodeBadge(dec.reason_code)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PIPELINE ARROW */}
          <div className="flex justify-center">
            <div className="p-2 rounded-full bg-slate-200 text-slate-600">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* STEP 5, 6, 7: Version Resolution & LLM Context Package */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Version Resolution */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>5. Version & Lineage Resolution</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Authorized Effective Version</h3>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">Selected Winner(s):</span>
                  <span className="font-mono text-indigo-700">
                    {traceData.version_resolution?.selected_ids?.join(', ') || 'None (No authorized docs)'}
                  </span>
                </div>
                {traceData.version_resolution?.superseded_ids?.length > 0 && (
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                    <span>Superseded Prior Versions:</span>
                    <span className="font-mono text-slate-600">
                      {traceData.version_resolution.superseded_ids.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* LLM Evidence Package */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>6. Sanitized LLM Evidence Package</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Payload Sent to LLM ({traceData.llm_evidence_package?.length || 0} Docs)
              </h3>

              {traceData.llm_evidence_package?.length === 0 ? (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800">
                  Zero documents approved. LLM prompt constructed with no-access safety instructions.
                </div>
              ) : (
                <div className="space-y-2">
                  {traceData.llm_evidence_package.map((item) => (
                    <div key={item.doc_id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{item.title} ({item.doc_id})</span>
                        <span className="font-mono text-[10px] text-slate-500">v{item.version}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono truncate">
                        "{item.excerpt}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PIPELINE ARROW */}
          <div className="flex justify-center">
            <div className="p-2 rounded-full bg-slate-200 text-slate-600">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* STEP 8: Final Employee Output */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center space-x-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  <span>7. Verified Employee Response & Citations</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  Final Response Delivered to {traceData.user?.employee_id}
                </h3>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                traceData.response_status === 'SUCCESS' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {traceData.response_status}
              </span>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
              {traceData.answer || '(No response text available)'}
            </div>

            {traceData.citations?.length > 0 && (
              <div className="pt-2 flex items-center space-x-2 text-xs">
                <span className="font-bold text-slate-600">Authorized Citations:</span>
                {traceData.citations.map((c, i) => (
                  <span key={i} className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">
                    {c.document_id}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
