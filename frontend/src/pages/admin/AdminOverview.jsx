import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Files, 
  Users, 
  Search, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  ArrowRight,
  BarChart2,
  Clock
} from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminOverview()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
        Loading governance telemetry...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Security Governance Console</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Governance & Security Overview</h1>
          <p className="text-xs text-slate-500">
            Real-time telemetry on deterministic authorization gates, document classifications, and audit traces.
          </p>
        </div>

        <Link
          to="/admin/security-inspector"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Launch Security Inspector</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Documents</span>
            <Files className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.total_documents || 0}</div>
          <div className="text-[11px] text-slate-400">Classified repository assets</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Users</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.total_users || 0}</div>
          <div className="text-[11px] text-slate-400">Finance, Marketing, Exec & Admin</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Research Queries</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.total_queries || 0}</div>
          <div className="text-[11px] text-slate-400">Evaluated queries on NexusGuard</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Gate Authorization Ratio</span>
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <span className="text-emerald-600">{stats?.recent_decisions?.ALLOWED || 0}</span>
            <span className="text-slate-300 text-lg">/</span>
            <span className="text-amber-600">{stats?.recent_decisions?.DENIED || 0}</span>
          </div>
          <div className="text-[11px] text-slate-400">Allowed vs Blocked candidate evaluations</div>
        </div>
      </div>

      {/* Classification Distribution & Security Alert Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classification Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Classification Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats?.classification_counts || {}).map(([level, count]) => {
              const colors = {
                Public: 'bg-slate-100 text-slate-700 border-slate-200',
                Internal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                Confidential: 'bg-amber-50 text-amber-700 border-amber-200',
                Restricted: 'bg-purple-50 text-purple-700 border-purple-200',
              };
              return (
                <div key={level} className="flex items-center justify-between p-3 rounded-xl border bg-slate-50/50">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-800">{level}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${colors[level] || 'bg-slate-100 text-slate-700'}`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Rule Enforcement Notice */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[11px] font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Deterministic Enforcement Guarantee</span>
            </div>
            <h3 className="text-xl font-bold">Pre-LLM Security Isolation</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              All candidate documents are evaluated against the active policy engine before any text is serialized into LLM prompts. Restricted documents (e.g. DOC-201's 145 Cr forecast) are mathematically barred from entering prompts for non-executive employees.
            </p>
          </div>

          <div className="pt-2 flex items-center space-x-4 text-xs text-slate-300 border-t border-slate-700/60">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Default Deny on Invalid Metadata</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Lineage Version Tie-Breakers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Query Telemetry Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Research Request Telemetry</h3>
            <p className="text-xs text-slate-500">Live feed of queries evaluated by the deterministic authorization engine.</p>
          </div>
          <Link to="/admin/audit-logs" className="text-xs text-purple-600 hover:text-purple-800 font-semibold">
            View full audit logs →
          </Link>
        </div>

        {stats?.recent_activity?.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No recent queries logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-2.5 px-3">Request ID</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Query</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Candidates</th>
                  <th className="py-2.5 px-3">Authorized</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent_activity.slice(0, 8).map((log) => (
                  <tr key={log.request_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono font-medium text-slate-700">{log.request_id}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900">{log.user_employee_id}</span>
                      <span className="text-slate-400 ml-1">({log.user_dept})</span>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-700 font-medium">{log.query}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        log.response_status === 'SUCCESS' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {log.response_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {log.candidate_ids?.length || 0}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {log.authorized_ids?.length || 0}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/admin/security-inspector?requestId=${log.request_id}`}
                        className="text-purple-600 hover:text-purple-900 font-semibold"
                      >
                        Inspect →
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
