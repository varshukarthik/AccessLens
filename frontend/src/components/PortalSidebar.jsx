import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
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
  FileText,
  MessageSquare,
  Plus
} from 'lucide-react';

export default function PortalSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [sessions, setSessions] = useState([]);
  const activeSessionId = searchParams.get('session');

  useEffect(() => {
    if (!user) return;
    const fetchSessions = async () => {
      try {
        const data = await api.getSessions();
        setSessions(data || []);
      } catch (err) {
        // silent fallback
      }
    };
    fetchSessions();

    const handleUpdate = () => fetchSessions();
    window.addEventListener('nexusguard:session_updated', handleUpdate);
    return () => window.removeEventListener('nexusguard:session_updated', handleUpdate);
  }, [user, location.pathname]);

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
      <div className="flex-1 overflow-y-auto">
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

        {/* Recent Conversations below Settings */}
        <div className="px-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Recent Conversations
            </span>
            <Link
              to="/portal/nexusguard"
              className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Start New Chat"
            >
              <Plus className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-slate-400 dark:text-slate-500 italic">
                No conversations yet
              </div>
            ) : (
              sessions.slice(0, 8).map((s) => {
                const isActive = location.pathname === '/portal/nexusguard' && activeSessionId === s.session_id;
                return (
                  <Link
                    key={s.session_id}
                    to={`/portal/nexusguard?session=${s.session_id}`}
                    className={`group flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs transition ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 flex-shrink-0" />
                    <span className="truncate flex-1 text-[11px]">{s.title || 'Untitled Chat'}</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

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
