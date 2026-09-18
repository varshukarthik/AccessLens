import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, LogOut, User, Lock, ExternalLink, ShieldAlert } from 'lucide-react';

export default function PortalHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getClearanceBadgeColor = (clearance) => {
    switch (clearance?.toLowerCase()) {
      case 'restricted':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'confidential':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'internal':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Intranet Workspace</span>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-700">{user?.department} Department</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Clearance Badge */}
        <div className={`px-2.5 py-1 rounded-full border text-xs font-semibold flex items-center space-x-1.5 ${getClearanceBadgeColor(user?.clearance)}`}>
          <Lock className="w-3 h-3" />
          <span>{user?.clearance} Clearance</span>
        </div>

        {/* Employee Info Pill */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left text-xs">
            <div className="font-semibold text-slate-900 leading-tight">{user?.name}</div>
            <div className="text-slate-500 font-mono text-[11px]">{user?.employee_id} • {user?.role}</div>
          </div>
        </div>

        {/* Public Website Link */}
        <Link 
          to="/" 
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          title="View Public Company Website"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
