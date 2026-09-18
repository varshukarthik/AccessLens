import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Building2, 
  Sparkles, 
  Files, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Layers, 
  Briefcase, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  TrendingUp,
  ListTodo,
  FolderGit2,
  Users2,
  CheckSquare
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  
  const [workload, setWorkload] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getWorkloadData().catch(err => {
        console.error('Failed to load workload:', err);
        return null;
      }),
      api.getAuthorizedDocuments().catch(err => {
        console.error('Failed to load documents:', err);
        return [];
      })
    ]).then(([workloadData, docs]) => {
      if (workloadData) setWorkload(workloadData);
      setDocuments(docs || []);
      setLoading(false);
    });
  }, [user]);

  const tasks = workload?.tasks || [];
  const projects = workload?.projects || [];
  const meetings = workload?.meetings || [];
  const announcements = workload?.announcements || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-colors duration-200">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Nova Solutions Enterprise Intranet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {currentDateStr} ? <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.role}</span> in <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.department}</span> (ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{user?.employee_id}</span>)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center space-x-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Clearance</div>
              <div className="font-bold text-slate-900 dark:text-white">{user?.clearance}</div>
            </div>
          </div>

          <Link
            to="/portal/nexusguard"
            className="inline-flex items-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-emerald-600/20 hover:shadow-lg transition group"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Open NexusGuard AI</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link 
          to="/portal/tasks"
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-emerald-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Assigned Tasks</span>
            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{tasks.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Active deliverables</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">View Board ?</span>
          </div>
        </Link>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Projects</span>
            <FolderGit2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{projects.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{user?.department} strategic track</div>
        </div>

        <Link
          to="/portal/documents"
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-emerald-500/50 transition group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Authorized Records</span>
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{documents.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>In {user?.clearance} tier</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Open Vault ?</span>
          </div>
        </Link>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Upcoming Syncs</span>
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{meetings.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Scheduled team sessions</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ListTodo className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Assigned Tasks & Work Items</h3>
              </div>
              <Link to="/portal/tasks" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
                Manage All ?
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Loading assigned workload...</div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No active tasks assigned.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                      <th className="py-3 px-4">Task ID</th>
                      <th className="py-3 px-4">Title & Category</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tasks.slice(0, 5).map((t) => (
                      <tr key={t.task_id || t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{t.task_id || t.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{t.title}</div>
                          <div className="text-[11px] text-slate-400">{t.category || t.project} ? Role: {t.assigned_role || user?.role}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            t.priority === 'High' || t.priority === 'Urgent'
                              ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                              : t.priority === 'Medium'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{t.due_date}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            t.status === 'Completed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderGit2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Active Department Initiatives</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{user?.department} Strategic Goals</span>
            </div>

            <div className="space-y-4">
              {projects.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">{p.status}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{p.description}</p>
                  
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>Target Delivery: {p.target_date}</span>
                      <span>{p.progress}% Complete</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Upcoming Meetings</h3>
            </div>

            <div className="space-y-3">
              {meetings.map((m, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{m.title}</div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{m.time}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{m.location} ? {m.organizer}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Files className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Documents</h3>
              </div>
              <Link to="/portal/documents" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
                Vault ?
              </Link>
            </div>

            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400 animate-pulse">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No documents in your clearance.</div>
            ) : (
              <div className="space-y-2">
                {documents.slice(0, 3).map((d) => (
                  <div key={d.doc_id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">{d.title}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-semibold">{d.doc_id}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>v{d.version} ? {d.effective_date}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{d.classification}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Announcements</h3>
            </div>

            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">{a.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{a.summary}</p>
                  <div className="text-[10px] text-slate-400 font-mono pt-1">{a.dept} ? {a.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
