import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Sparkles, 
  LayoutDashboard, 
  ShieldAlert, 
  ChevronRight,
  CheckSquare,
  CheckCircle2,
  Activity,
  Settings,
  Play,
  FileText
} from 'lucide-react';

export default function PortalSidebar() {
  const { user } = useAuth();

  const links = [
    { name: 'Workspace', path: '/portal/dashboard', icon: LayoutDashboard },
    { name: 'NexusGuard AI', path: '/portal/nexusguard', icon: Sparkles, badge: 'AI' },
    { name: 'Demo Scenarios', path: '/portal/playground', icon: Play, badge: '15' },
    { name: 'My Tasks', path: '/portal/tasks', icon: CheckSquare },
    { name: 'Approvals', path: '/portal/approvals', icon: CheckCircle2 },
    { name: 'My Documents', path: '/portal/documents', icon: FileText },
    { name: 'Security Center', path: '/portal/security', icon: ShieldCheck },
    { name: 'Audit Activity', path: '/portal/activity', icon: Activity },
    { name: 'Settings', path: '/portal/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between flex-shrink-0 min-h-screen transition-colors duration-200">
      <div>
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Nova Solutions</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Enterprise Platform</div>
            </div>
          </Link>
        </div>

        <div className="p-3.5 mx-3 my-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>NexusGuard Active</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Policy-gated AI access across <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.department || 'all'}</span> knowledge.
          </p>
        </div>

        <nav className="px-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Workspace
          </div>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-current">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {user?.is_admin && (
          <div className="px-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Governance
            </div>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-slate-900 dark:bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800'
                }`
              }
            >
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Security Console</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </NavLink>
          </div>
        )}
      </div>

      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-slate-900 dark:text-white truncate">{user?.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-semibold">
            {user?.employee_id}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="truncate">{user?.role}</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 rounded border border-emerald-200 dark:border-emerald-800 text-[10px]">
            {user?.clearance}
          </span>
        </div>
      </div>
    </aside>
  );
}
