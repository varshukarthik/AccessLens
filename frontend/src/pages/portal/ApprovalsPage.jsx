import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  Check, 
  X
} from 'lucide-react';

const INITIAL_APPROVALS = [
  {
    id: 'APP-101',
    title: 'Q4 AWS Cloud Infrastructure Expansion',
    department: 'Engineering',
    category: 'Budget Request',
    requester: 'Alex Mercer (Tech Lead)',
    amount: '$14,500 / mo',
    date: 'Today, 10:30 AM',
    status: 'Pending',
    description: 'Scaling multi-region Kubernetes nodes to support NexusGuard latency SLAs and concurrent indexing.',
    urgency: 'High'
  },
  {
    id: 'APP-102',
    title: 'Cross-Department Access: Q3 Financial Performance Audit',
    department: 'Marketing',
    category: 'Document Clearance',
    requester: 'Sarah Jenkins (Marketing Mgr)',
    amount: 'N/A',
    date: 'Yesterday',
    status: 'Pending',
    description: 'Requesting temporary read access to Finance Q3 audited metrics for inclusion in the Annual Corporate Overview.',
    urgency: 'Medium'
  },
  {
    id: 'APP-103',
    title: 'Salesforce Enterprise Integration Add-on',
    department: 'Finance',
    category: 'Vendor PO',
    requester: 'Michael Ross (Controller)',
    amount: '$6,200',
    date: 'Sep 16, 2026',
    status: 'Approved',
    description: 'Automated CRM invoice sync license renewal and ABAC identity sync module.',
    urgency: 'Normal'
  },
  {
    id: 'APP-104',
    title: 'Temporary Elevated Clearance: Prod Bastion Host',
    department: 'Security',
    category: 'Security Elevation',
    requester: 'David Chen (SecOps)',
    amount: 'N/A',
    date: 'Sep 15, 2026',
    status: 'Approved',
    description: 'Emergency bastion access for kernel security patch rollout.',
    urgency: 'High'
  }
];

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const handleAction = (id, newStatus) => {
    setApprovals(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: newStatus };
      }
      return a;
    }));
    setActionSuccess(`Request ${id} marked as ${newStatus}.`);
    setTimeout(() => setActionSuccess(''), 3500);
  };

  const filteredApprovals = approvals.filter(a => {
    const matchesStatus = filterStatus === 'all' || a.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'rejected':
        return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Governance & Authorizations</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Enterprise Approval Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review and govern operational authorizations, budget expenditures, and clearance overrides.
          </p>
        </div>

        {actionSuccess && (
          <div className="p-2.5 px-4 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, requester, or department..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                filterStatus === status
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredApprovals.map((req) => (
          <div
            key={req.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                  {req.id}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                  {req.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(req.status)}`}>
                  {req.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Submitted: {req.date}</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {req.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {req.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
              <div className="flex items-center space-x-4 text-slate-500 dark:text-slate-400 text-[11px]">
                <div>
                  <span className="text-slate-400">Requester: </span>
                  <strong className="text-slate-800 dark:text-slate-200">{req.requester}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Department: </span>
                  <strong className="text-slate-800 dark:text-slate-200">{req.department}</strong>
                </div>
                {req.amount !== 'N/A' && (
                  <div>
                    <span className="text-slate-400">Budget Impact: </span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{req.amount}</strong>
                  </div>
                )}
              </div>

              {req.status === 'Pending' ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAction(req.id, 'Rejected')}
                    className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center space-x-1 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'Approved')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-xs transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Request</span>
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 italic">
                  Decision finalized and archived in audit trail.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
