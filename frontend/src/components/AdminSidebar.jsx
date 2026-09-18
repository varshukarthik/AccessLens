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
  LayoutDashboard
} from 'lucide-react';

export default function AdminSidebar() {
  const { user } = useAuth();

  const links = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Policy Simulator', path: '/admin/simulator', icon: Sliders },
    { name: 'Security Inspector', path: '/admin/security-inspector', icon: Search },
    { name: 'Document Management', path: '/admin/documents', icon: Files },
    { name: 'Users & Roles', path: '/admin/users', icon: Users },
    { name: 'Access Policies', path: '/admin/policies', icon: Sliders },
    { name: 'Security Audit Logs', path: '/admin/audit-logs', icon: FileCheck },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between flex-shrink-0 min-h-screen transition-colors duration-200">
      <div>
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
              <ShieldAlert className="w-4 h-4 text-emerald-400 dark:text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Security & Admin</div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Governance Console</div>
            </div>
          </div>
          <Link 
            to="/portal/dashboard"
            className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition mt-3 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Intranet</span>
          </Link>
        </div>

        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
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

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-slate-900 dark:text-white truncate">{user?.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold uppercase">
            Admin
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          {user?.role} ? {user?.clearance}
        </div>
      </div>
    </aside>
  );
}
