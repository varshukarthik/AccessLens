import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Sparkles, MessageSquare, Clock, ArrowRight, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function History() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSessions()
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
          <HistoryIcon className="w-4 h-4 text-indigo-600" />
          <span>Research Log</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Research History</h1>
        <p className="text-xs text-slate-500">
          Review past questions submitted to NexusGuard AI, along with grounded evidence and citations.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse bg-white rounded-3xl border border-slate-200">
          Loading history records...
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="font-semibold text-slate-800">No research history yet.</div>
          <p className="text-slate-400 max-w-sm mx-auto">
            Your previous queries and grounded citations will be cataloged here.
          </p>
          <Link
            to="/portal/nexusguard"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start a Query</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div key={s.session_id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Session ID: {s.session_id}
                    </div>
                  </div>
                </div>

                <Link
                  to="/portal/nexusguard"
                  className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  <span>Open Session</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Messages excerpt */}
              <div className="space-y-3">
                {s.messages?.map((m) => (
                  <div key={m.id} className="text-xs p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-700">
                      <span>{m.sender === 'user' ? 'Question' : 'NexusGuard Answer'}</span>
                      {m.evidence_status && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          m.evidence_status === 'AUTHORIZED_EVIDENCE_USED' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {m.evidence_status}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
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
