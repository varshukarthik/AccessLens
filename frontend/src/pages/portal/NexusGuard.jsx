import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import CitationModal from '../../components/CitationModal';
import { 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Lock, 
  FileText, 
  Layers, 
  Plus, 
  MessageSquare, 
  Bot, 
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function NexusGuard() {
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Citation modal state
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].session_id);
        setMessages(data[0].messages || []);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user]);

  const handleSelectSession = async (sessionId) => {
    setActiveSessionId(sessionId);
    try {
      const detail = await api.getSessionDetail(sessionId);
      setMessages(detail.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setQueryInput('');
    setError(null);
  };

  const handleSendQuery = async (queryText) => {
    const textToSend = (queryText || queryInput).trim();
    if (!textToSend || loading) return;

    setError(null);
    setLoading(true);
    setQueryInput('');

    // Optimistically append user message
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      content: textToSend,
      citations: [],
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await api.queryNexusGuard(textToSend, activeSessionId);
      
      const assistantMsg = {
        id: Date.now() + 1,
        session_id: response.session_id,
        sender: 'nexusguard',
        content: response.answer,
        citations: response.citations || [],
        evidence_status: response.evidence_status,
        request_id: response.request_id,
        created_at: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setActiveSessionId(response.session_id);
      loadSessions();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error processing research query.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCitation = (citation) => {
    setSelectedCitation(citation);
    setIsCitationModalOpen(true);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-slate-50 overflow-hidden">
      {/* Session History Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between flex-shrink-0 hidden md:flex">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Research Sessions</span>
          <button
            onClick={handleNewSession}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Start New Research Query"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No previous sessions. Submit a research question to begin.
            </div>
          ) : (
            sessions.map((s) => (
              <button
                key={s.session_id}
                onClick={() => handleSelectSession(s.session_id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center space-x-2.5 ${
                  activeSessionId === s.session_id
                    ? 'bg-indigo-50 text-indigo-950 font-semibold border border-indigo-100'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{s.title}</span>
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-500 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Pre-LLM Authorization Active</span>
        </div>
      </aside>

      {/* Main Research Assistant Interface */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        
        {/* Assistant Header Banner */}
        <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-2">
                <span>NexusGuard AI Research Assistant</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono font-semibold">
                  Policy-Gated
                </span>
              </div>
              <div className="text-[11px] text-slate-500 hidden sm:block">
                Synthesizing grounded answers from internal documents authorized for {user?.name} ({user?.department}).
              </div>
            </div>
          </div>

          <button
            onClick={handleNewSession}
            className="md:hidden inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            /* Neutral Blank Empty State / Guidance */
            <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
              <div className="w-14 h-14 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-indigo-600 mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">NexusGuard Research Assistant</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
                  Ask NexusGuard about company information, projects, policies, or documents you are authorized to access.
                </p>
              </div>

              {/* Active Identity Context Badge */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-600 max-w-md mx-auto flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Authenticated as <strong>{user?.name}</strong></span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  {user?.clearance} • {user?.department}
                </span>
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m, idx) => (
                <div key={idx} className="space-y-3">
                  {/* User message */}
                  {m.sender === 'user' ? (
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="bg-slate-900 text-white rounded-2xl rounded-tr-xs px-4 py-3 text-xs leading-relaxed max-w-xl shadow-xs">
                        {m.content}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    </div>
                  ) : (
                    /* Assistant message */
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        {/* Main Answer Card */}
                        <div className="bg-white rounded-2xl rounded-tl-xs border border-slate-200 p-5 shadow-xs space-y-4">
                          
                          {/* Evidence Status Pill */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center space-x-2">
                              {m.evidence_status === 'AUTHORIZED_EVIDENCE_USED' ? (
                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Authorized Evidence Grounded</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>No Authorized Evidence Available</span>
                                </span>
                              )}
                            </div>

                            {m.request_id && (
                              <span className="text-[10px] font-mono text-slate-400">
                                {m.request_id}
                              </span>
                            )}
                          </div>

                          {/* Answer text */}
                          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                            {m.content}
                          </div>

                          {/* Verified Citations List */}
                          {m.citations && m.citations.length > 0 && (
                            <div className="border-t border-slate-100 pt-3 space-y-2">
                              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                                <FileText className="w-3.5 h-3.5 text-slate-500" />
                                <span>Verified Citations ({m.citations.length})</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {m.citations.map((c, cIdx) => (
                                  <div
                                    key={cIdx}
                                    onClick={() => handleOpenCitation(c)}
                                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition text-xs space-y-1 group"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                                        {c.title}
                                      </span>
                                      <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-semibold">
                                        {c.document_id}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                                      <span>v{c.version} • {c.effective_date}</span>
                                      <span className="text-indigo-600 font-semibold group-hover:underline text-[10px]">
                                        View Source →
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-xs animate-pulse">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-xs border border-slate-200 p-4 shadow-xs space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-slate-700 font-medium">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                      <span>Evaluating deterministic policy rules and retrieving authorized evidence...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Query Input Box */}
        <div className="p-4 sm:p-6 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="max-w-3xl mx-auto flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ask NexusGuard about company information, projects, policies, or documents..."
                disabled={loading}
                className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs sm:text-sm transition disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !queryInput.trim()}
              className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xs transition disabled:opacity-40 flex-shrink-0"
              title="Send research query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center text-[10px] text-slate-400 mt-2">
            Deterministic pre-LLM security active • Grounded answers derived solely from permitted evidence
          </div>
        </div>

      </div>

      {/* Citation Preview Modal */}
      <CitationModal
        citation={selectedCitation}
        isOpen={isCitationModalOpen}
        onClose={() => setIsCitationModalOpen(false)}
      />
    </div>
  );
}
