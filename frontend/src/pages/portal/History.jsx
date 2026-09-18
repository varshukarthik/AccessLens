import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Sparkles, MessageSquare, Clock, ArrowRight, FileText, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

export default function History() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = () => {
    setLoading(true);
    api.getSessions()
      .then(data => {
        setSessions(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSessions();
  }, [user]);

  const handleDeleteSession = async (e, sessionId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 transition-colors duration-200">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          <HistoryIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Research Log</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Research History</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review past questions submitted to NexusGuard AI, along with grounded evidence, citations, and workplace action logs.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500 animate-pulse bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          Loading history records...
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="font-semibold text-slate-800 dark:text-slate-200">No research history yet.</div>
          <p className="text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
            Your previous queries, answers, and grounded citations will be cataloged here.
          </p>
          <Link
            to="/portal/nexusguard"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start a Query</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div key={s.session_id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{s.title || "Untitled Research Session"}</h3>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      Session ID: {s.session_id} • {new Date(s.updated_at || s.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Link
                    to={`/portal/nexusguard?session=${s.session_id}`}
                    className="inline-flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold"
                  >
                    <span>Open in Assistant</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <button
                    onClick={(e) => handleDeleteSession(e, s.session_id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Messages excerpt */}
              <div className="space-y-3">
                {s.messages?.map((m, mIdx) => (
                  <div key={mIdx} className="text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                      <span>{m.sender === 'user' ? 'Question' : 'NexusGuard Answer'}</span>
                      {m.evidence_status && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          m.evidence_status === 'AUTHORIZED_EVIDENCE_USED' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                            : m.evidence_status === 'WORKPLACE_ACTION'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {m.evidence_status}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                      {m.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

