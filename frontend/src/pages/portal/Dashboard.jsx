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
  Users2
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  
  const [workload, setWorkload] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getWorkload().catch(err => {
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

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header Summary Banner */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Nova Solutions Enterprise Intranet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {currentDateStr} • <span className="font-semibold text-slate-700">{user?.role}</span> in <span className="font-semibold text-slate-700">{user?.department}</span> (ID: <span className="font-mono text-slate-700 font-bold">{user?.employee_id}</span>)
          </p>
        </div>

        {/* Security Clearance Pill & NexusGuard Quick Access */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Clearance</div>
              <div className="font-bold text-slate-900">{user?.clearance}</div>
            </div>
          </div>

          <Link
            to="/portal/nexusguard"
            className="inline-flex items-center space-x-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-semibold shadow-xs transition group"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Open NexusGuard AI</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Assigned Tasks</span>
            <ListTodo className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{tasks.length}</div>
          <div className="text-[11px] text-slate-500">Active role-assigned work items</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Projects</span>
            <FolderGit2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{projects.length}</div>
          <div className="text-[11px] text-slate-500">{user?.department} initiatives</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Authorized Records</span>
            <Files className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{documents.length}</div>
          <div className="text-[11px] text-slate-500">Documents within your clearance</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Upcoming Syncs</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{meetings.length}</div>
          <div className="text-[11px] text-slate-500">Scheduled department meetings</div>
        </div>
      </div>

      {/* 3. Main Work Area: Assigned Tasks Table & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols): Tasks & Assigned Work Items */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Current Tasks Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ListTodo className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Assigned Tasks & Work Items</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Department: {user?.department}</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Loading assigned workload...</div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No active tasks assigned.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                      <th className="py-3 px-4">Task ID</th>
                      <th className="py-3 px-4">Title & Category</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tasks.map((t) => (
                      <tr key={t.task_id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.task_id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{t.title}</div>
                          <div className="text-[11px] text-slate-400">{t.category} • Role: {t.assigned_role}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            t.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                            t.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{t.due_date}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            t.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
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

          {/* Department Projects Widget */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderGit2 className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Active Department Initiatives</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{user?.department} Strategic Goals</span>
            </div>

            <div className="space-y-4">
              {projects.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">{p.status}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{p.description}</p>
                  
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Target Delivery: {p.target_date}</span>
                      <span>{p.progress}% Complete</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Meetings, Announcements & Recent Documents */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upcoming Meetings */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Upcoming Meetings</h3>
            </div>

            <div className="space-y-3">
              {meetings.map((m, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                  <div className="font-semibold text-slate-800">{m.title}</div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{m.time}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{m.location} • {m.organizer}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Authorized Documents Feed */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Files className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Recent Documents</h3>
              </div>
              <Link to="/portal/documents" className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
                Vault →
              </Link>
            </div>

            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400 animate-pulse">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No documents in your clearance.</div>
            ) : (
              <div className="space-y-2">
                {documents.slice(0, 3).map((d) => (
                  <div key={d.doc_id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate max-w-[170px]">{d.title}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-semibold">{d.doc_id}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>v{d.version} • {d.effective_date}</span>
                      <span className="text-emerald-700 font-semibold">{d.classification}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Company Announcements */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Announcements</h3>
            </div>

            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{a.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{a.summary}</p>
                  <div className="text-[10px] text-slate-400 font-mono pt-1">{a.dept} • {a.date}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
