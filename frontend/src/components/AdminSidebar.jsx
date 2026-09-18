import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  Search, 
  Files, 
  Users, 
  Sliders, 
  FileCheck, 
  ArrowLeft,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

export default function AdminSidebar() {
  const { user } = useAuth();

  const links = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Security Inspector', path: '/admin/security-inspector', icon: Search },
    { name: 'Document Management', path: '/admin/documents', icon: Files },
    { name: 'Users & Roles', path: '/admin/users', icon: Users },
    { name: 'Access Policies', path: '/admin/policies', icon: Sliders },
    { name: 'Security Audit Logs', path: '/admin/audit-logs', icon: FileCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between flex-shrink-0 min-h-screen">
      <div>
        {/* Admin Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold shadow-xs">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900">Security & Admin</div>
              <div className="text-[11px] text-purple-700 font-semibold">Governance Console</div>
            </div>
          </div>
          <Link 
            to="/portal/dashboard"
            className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 transition mt-3 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Intranet</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Governance Suite
          </div>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
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
      </div>

      {/* Admin Identity Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-slate-900 truncate">{user?.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold uppercase">
            Admin
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          {user?.role} • {user?.clearance}
        </div>
      </div>
    </aside>
  );
}
