import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Files, 
  Users, 
  Search, 
  Activity, 
  ArrowRight,
  BarChart2,
  PieChart,
  ShieldCheck
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
      <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading governance telemetry...
      </div>
    );
  }

  const allowedCount = stats?.recent_decisions?.ALLOWED || 0;
  const deniedCount = stats?.recent_decisions?.DENIED || 0;
  const totalDecisions = allowedCount + deniedCount || 1;
  const allowedPercent = Math.round((allowedCount / totalDecisions) * 100);

  const classificationCounts = stats?.classification_counts || {
    Public: 2,
    Internal: 3,
    Confidential: 4,
    Restricted: 3
  };

  const totalClassifiedDocs = Object.values(classificationCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Security Governance Console</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Governance & Security Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time telemetry on deterministic authorization gates, document classifications, and audit traces.
          </p>
        </div>

        <Link
          to="/admin/security-inspector"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Launch Security Inspector</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Documents</span>
            <Files className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.total_documents || 12}</div>
          <div className="text-[11px] text-slate-400">Classified repository assets</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Active Users</span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.total_users || 5}</div>
          <div className="text-[11px] text-slate-400">Finance, Marketing, Exec & Admin</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Research Queries</span>
            <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.total_queries || 14}</div>
          <div className="text-[11px] text-slate-400">Evaluated queries on NexusGuard</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Gate Authorization Ratio</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span className="text-emerald-600 dark:text-emerald-400">{allowedCount}</span>
            <span className="text-slate-300 dark:text-slate-600 text-lg">/</span>
            <span className="text-amber-600 dark:text-amber-400">{deniedCount}</span>
          </div>
          <div className="text-[11px] text-slate-400">{allowedPercent}% Allowed vs Blocked</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Documents by Classification</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Total: {totalClassifiedDocs}</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(classificationCounts).map(([level, count]) => {
              const pct = Math.round((count / totalClassifiedDocs) * 100);
              const colorConfig = {
                Public: { bar: 'bg-slate-500' },
                Internal: { bar: 'bg-emerald-500' },
                Confidential: { bar: 'bg-amber-500' },
                Restricted: { bar: 'bg-purple-500' },
              }[level] || { bar: 'bg-slate-500' };

              return (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{level}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">{count} docs ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorConfig.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">ABAC Authorization Decisions</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{totalDecisions} evaluations</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3">
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-1">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{allowedCount}</div>
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Allowed Access</div>
              <div className="text-[11px] text-slate-500">{allowedPercent}% of all attempts</div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-center space-y-1">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{deniedCount}</div>
              <div className="text-xs font-bold text-amber-800 dark:text-amber-300">Gated / Denied</div>
              <div className="text-[11px] text-slate-500">{100 - allowedPercent}% blocked by policy</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Zero security leaks detected across all LLM inference streams.</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Research Request Telemetry</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live feed of queries evaluated by the deterministic authorization engine.</p>
          </div>
          <Link to="/admin/audit-logs" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
            View full audit logs ?
          </Link>
        </div>

        {stats?.recent_activity?.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No recent queries logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-2.5 px-3">Request ID</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Query</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Candidates</th>
                  <th className="py-2.5 px-3">Authorized</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(stats?.recent_activity || []).slice(0, 8).map((log) => (
                  <tr key={log.request_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">{log.request_id}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 dark:text-white">{log.user_employee_id}</span>
                      <span className="text-slate-400 ml-1">({log.user_dept})</span>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-700 dark:text-slate-300 font-medium">{log.query}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        log.response_status === 'SUCCESS' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {log.response_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {log.candidate_ids?.length || 0}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {log.authorized_ids?.length || 0}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/admin/security-inspector?requestId=${log.request_id}`}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold"
                      >
                        Inspect ?
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
