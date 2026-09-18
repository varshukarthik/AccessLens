import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { FileCheck, Search, Filter, ShieldCheck, ArrowRight, Clock, AlertCircle } from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadLogs = () => {
    setLoading(true);
    api.getAuditLogs(userFilter || null, statusFilter || null, 100)
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLogs();
  }, [userFilter, statusFilter]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
          <FileCheck className="w-4 h-4" />
          <span>Compliance & Audit Trail</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security Audit Logs</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Immutable telemetry for all research queries evaluated across the deterministic policy gate.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <input
            type="text"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            placeholder="Filter by Employee ID (e.g. U102)..."
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono text-xs"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="NO_AUTHORIZED_EVIDENCE">NO_AUTHORIZED_EVIDENCE</option>
            <option value="CONFLICT">CONFLICT</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium text-xs">
          Showing <span className="font-bold text-slate-900 dark:text-white">{logs.length}</span> audit records
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading audit telemetry...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No audit records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department / Clearance</th>
                  <th className="py-3 px-4">Query</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Candidates / Approved</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4 text-right">Deep Trace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{log.request_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{log.user_employee_id}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.user_dept} • <span className="font-mono text-[10px] text-purple-700 font-semibold">{log.user_clearance}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-800">{log.query}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        log.response_status === 'SUCCESS' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {log.response_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {log.candidate_ids?.length || 0} → <span className="font-bold text-emerald-700">{log.authorized_ids?.length || 0}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {log.latency_ms} ms
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/security-inspector?requestId=${log.request_id}`}
                        className="text-purple-600 hover:text-purple-900 font-semibold inline-flex items-center space-x-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
