import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Sparkles, 
  LayoutDashboard, 
  Files, 
  History, 
  ShieldAlert, 
  ChevronRight,
  Lock,
  Building2
} from 'lucide-react';

export default function PortalSidebar() {
  const { user } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/portal/dashboard', icon: LayoutDashboard },
    { name: 'NexusGuard AI', path: '/portal/nexusguard', icon: Sparkles },
    { name: 'Authorized Documents', path: '/portal/documents', icon: Files },
    { name: 'Research History', path: '/portal/history', icon: History },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between flex-shrink-0 min-h-screen">
      <div>
        {/* Company Header */}
        <div className="p-5 border-b border-slate-100">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900">Nova Solutions</div>
              <div className="text-[11px] text-slate-500 font-medium">Employee Intranet</div>
            </div>
          </Link>
        </div>

        {/* Product Brand Banner: NexusGuard */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="flex items-center space-x-2 text-indigo-700 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>NexusGuard Assistant</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Policy-gated AI research across company knowledge.
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Admin Link if privileged */}
        {user?.is_admin && (
          <div className="px-3 mt-6 pt-4 border-t border-slate-100 space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Governance
            </div>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-indigo-700 hover:bg-indigo-50/70 bg-indigo-50/40 border border-indigo-100'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-4 h-4" />
                <span>Security Console</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </NavLink>
          </div>
        )}
      </div>

      {/* User Footer Card */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-slate-900 truncate">{user?.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-semibold">
            {user?.employee_id}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate">{user?.role}</span>
          <span className="text-emerald-700 font-semibold px-1.5 py-0.2 bg-emerald-50 rounded border border-emerald-200 text-[10px]">
            {user?.clearance}
          </span>
        </div>
      </div>
    </aside>
  );
}
