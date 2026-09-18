import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  Check, 
  X,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Plus,
  UserCheck,
  Building2,
  AlertCircle
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

  const [activeTab, setActiveTab] = useState('manager_approvals');
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [operationalApprovals, setOperationalApprovals] = useState(INITIAL_APPROVALS);
  const [leaveBalance, setLeaveBalance] = useState(18);

  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Apply Leave Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    start_date: '',
    end_date: '',
    leave_type: 'Casual',
    reason: ''
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Reject Reason Modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRejectReq, setSelectedRejectReq] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pending, myReqs, balData] = await Promise.all([
        api.getPendingApprovals(),
        api.getMyLeaveRequests(),
        api.getLeaveBalance()
      ]);
      setPendingApprovals(Array.isArray(pending) ? pending : []);
      setMyRequests(Array.isArray(myReqs) ? myReqs : []);
      if (balData && typeof balData.leave_balance === 'number') {
        setLeaveBalance(balData.leave_balance);
      }
    } catch (err) {
      console.error('Error loading approvals data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const showSuccess = (msg) => {
    setActionSuccess(msg);
    setActionError('');
    setTimeout(() => setActionSuccess(''), 4500);
  };

  const showError = (msg) => {
    setActionError(msg);
    setActionSuccess('');
    setTimeout(() => setActionError(''), 5500);
  };

  const handleApprove = async (requestId, employeeId) => {
    if (employeeId === user?.employee_id) {
      showError("Self-approval violation: You cannot approve your own request under Section 4.2 of Governance Rules.");
      return;
    }
    try {
      await api.approveLeave(requestId);
      showSuccess(`Leave Request ${requestId} approved successfully. Balance deducted for employee.`);
      loadData();
    } catch (err) {
      showError(err.message || `Failed to approve ${requestId}`);
    }
  };

  const handleOpenRejectModal = (req) => {
    if (req.employee_id === user?.employee_id) {
      showError("Self-approval violation: You cannot decide your own leave request.");
      return;
    }
    setSelectedRejectReq(req);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRejectReq) return;
    try {
      setRejectLoading(true);
      await api.rejectLeave(selectedRejectReq.request_id, rejectionReason || 'Operational constraints');
      setIsRejectModalOpen(false);
      setSelectedRejectReq(null);
      showSuccess(`Leave Request ${selectedRejectReq.request_id} has been rejected.`);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to reject leave request.');
    } finally {
      setRejectLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    if (!applyForm.start_date || !applyForm.end_date) {
      setApplyError('Please select both start and end dates.');
      return;
    }
    if (new Date(applyForm.start_date) > new Date(applyForm.end_date)) {
      setApplyError('Start date cannot be after end date.');
      return;
    }
    try {
      setApplyLoading(true);
      const res = await api.applyLeave(applyForm);
      setIsApplyModalOpen(false);
      setApplyForm({ start_date: '', end_date: '', leave_type: 'Casual', reason: '' });
      showSuccess(`Leave request ${res.request_id} registered and routed to assigned manager (${res.approver_name || res.approver_id}).`);
      loadData();
    } catch (err) {
      setApplyError(err.message || 'Failed to submit leave request.');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleOperationalAction = (id, newStatus) => {
    setOperationalApprovals(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    showSuccess(`Operational Request ${id} updated to ${newStatus}.`);
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
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
      {/* Header & Balance Widget */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Governance & Workplace Actions</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Workplace Approvals & Authorizations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Permission-governed workplace requests, two-sided managerial workflows, and zero-trust audit compliance.
          </p>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              {leaveBalance}
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                PTO Balance
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Days Available
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Leave</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {actionSuccess && (
        <div className="p-3 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 px-4 rounded-2xl bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-800 dark:text-red-300 flex items-center space-x-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('manager_approvals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'manager_approvals'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Awaiting My Approval</span>
            {pendingApprovals.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 dark:bg-emerald-400 text-white dark:text-slate-950 text-[10px] font-black">
                {pendingApprovals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('my_requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'my_requests'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Submitted Requests</span>
            <span className="text-[10px] text-slate-400 font-normal">
              ({myRequests.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('operational')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'operational'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Operational PO & Cloud</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter requests..."
            className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Governance Notice */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex items-start space-x-3 text-xs text-indigo-900 dark:text-indigo-200">
        <ShieldCheck className="w-4 h-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Governance Rule Section 4.2 Enforced: </span>
          <span>
            Self-approval is strictly barred across all managerial and executive tiers. Every leave request must be countersigned by the designated direct supervisor or executive committee member.
          </span>
        </div>
      </div>

      {/* Content for Tab 1: Awaiting My Approval */}
      {activeTab === 'manager_approvals' && (
        <div className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                All Direct Reports Approved
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                There are currently no pending leave requests awaiting your managerial authorization.
              </p>
            </div>
          ) : (
            pendingApprovals
              .filter(r => !searchQuery || 
                r.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.request_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.department.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(req => (
                <div
                  key={req.request_id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition hover:border-emerald-500/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {req.request_id}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-[11px] font-semibold">
                        {req.leave_type} Leave
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(req.status)}`}>
                        {req.status} Manager Review
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Submitted: {new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {req.employee_name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ({req.department} • {req.employee_id})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Reason:</span> "{req.reason}"
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {req.start_date} → {req.end_date}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {req.days_count} business days
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleOpenRejectModal(req)}
                        className="px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 font-semibold text-xs flex items-center space-x-1.5 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApprove(req.request_id, req.employee_id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Leave</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* Content for Tab 2: My Submitted Requests */}
      {activeTab === 'my_requests' && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto opacity-70" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                No Leave Requests Submitted
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                You haven't filed any leave requests. Click "+ Apply Leave" or ask NexusGuard to register one for you.
              </p>
            </div>
          ) : (
            myRequests
              .filter(r => !searchQuery || 
                r.request_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.reason.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(req => (
                <div
                  key={req.request_id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {req.request_id}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                        {req.leave_type}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Applied: {new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        {req.start_date} → {req.end_date} ({req.days_count} business days)
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        "{req.reason}"
                      </p>
                      {req.rejection_reason && (
                        <div className="text-xs text-red-600 dark:text-red-400 font-semibold pt-1">
                          Manager Rejection Note: {req.rejection_reason}
                        </div>
                      )}
                    </div>

                    <div className="text-right text-xs space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Approver</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {req.approver_name || req.approver_id}
                      </span>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* Content for Tab 3: Operational PO & Cloud */}
      {activeTab === 'operational' && (
        <div className="space-y-4">
          {operationalApprovals
            .filter(a => !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(req => (
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Requester</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{req.requester}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Department</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{req.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Estimated Amount</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{req.amount}</span>
                    </div>
                  </div>

                  {req.status === 'Pending' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOperationalAction(req.id, 'Rejected')}
                        className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100 text-xs font-semibold flex items-center space-x-1 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleOperationalAction(req.id, 'Approved')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white hover:bg-slate-800 dark:hover:bg-emerald-500 text-xs font-semibold flex items-center space-x-1 shadow-xs transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Submit Leave Request
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Governed Workplace PTO Workflow
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {applyError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400">
                {applyError}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={applyForm.start_date}
                    onChange={(e) => setApplyForm({ ...applyForm, start_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={applyForm.end_date}
                    onChange={(e) => setApplyForm({ ...applyForm, end_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Leave Type
                </label>
                <select
                  value={applyForm.leave_type}
                  onChange={(e) => setApplyForm({ ...applyForm, leave_type: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Annual">Annual Paid Time Off</option>
                  <option value="Sick">Medical / Sick Leave</option>
                  <option value="Personal">Personal Errands</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Reason for Absence
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide context for manager review..."
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Available Balance:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{leaveBalance} Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Routing:</span>
                  <span className="font-bold text-slate-900 dark:text-white">Assigned Direct Supervisor</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
                >
                  {applyLoading ? <span>Submitting...</span> : <span>Submit Application</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Note Modal */}
      {isRejectModalOpen && selectedRejectReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Reject Leave Request ({selectedRejectReq.request_id})
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Please enter the official operational or business rationale for declining this request from <span className="font-semibold">{selectedRejectReq.employee_name}</span>.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Rejection Rationale
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Critical project deadline requires full departmental presence during this week..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejectLoading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-xs transition"
              >
                {rejectLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
