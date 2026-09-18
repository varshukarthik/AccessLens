import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import GreenGridCanvas from '../../components/GreenGridCanvas';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon,
  KeyRound,
  Sparkles,
  ChevronDown,
  Zap
} from 'lucide-react';

const DEMO_PERSONAS = [
  {
    id: "U102",
    name: "David Chen",
    role: "Financial Analyst",
    department: "Finance",
    clearance: "Internal",
    password: "password123",
    description: "Finance revenue access (₹120 Cr), Leave application"
  },
  {
    id: "U205",
    name: "Sarah Jenkins",
    role: "Marketing Manager",
    department: "Marketing",
    clearance: "Internal",
    password: "password123",
    description: "Marketing boundary, safe redirection alternatives, HR policies"
  },
  {
    id: "U301",
    name: "Michael Ross",
    role: "Financial Controller",
    department: "Finance",
    clearance: "Internal",
    password: "password123",
    description: "Version resolution (₹125 Cr from DOC-302 v2.0), Reporting manager approvals"
  },
  {
    id: "EXEC001",
    name: "Victoria Sterling",
    role: "Chief Executive Officer",
    department: "Executive",
    clearance: "Restricted",
    password: "execpassword",
    description: "C-Suite executive access, M&A acquisitions (₹145 Cr valuation)"
  },
  {
    id: "Admin",
    name: "Elena Vance",
    role: "Security Officer & Admin",
    department: "Security",
    clearance: "Restricted",
    password: "adminpassword",
    description: "Admin console, policy simulator, audit inspector, document controls"
  }
];

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState('');

  const selectedPersona = DEMO_PERSONAS.find(p => p.id === selectedPersonaId);

  const handlePersonaChange = (e) => {
    const pId = e.target.value;
    setSelectedPersonaId(pId);
    const found = DEMO_PERSONAS.find(p => p.id === pId);
    if (found) {
      setEmployeeId(found.id);
      setPassword(found.password);
      setError('');
    }
  };

  const handleAutoLogin = async (persona) => {
    setEmployeeId(persona.id);
    setPassword(persona.password);
    setSelectedPersonaId(persona.id);
    setError('');
    setShowForgotNotice(false);
    setLoading(true);

    try {
      const user = await login(persona.id, persona.password);
      if (user.is_admin) {
        navigate('/admin');
      } else {
        navigate('/portal/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid Employee ID/Email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowForgotNotice(false);
    setLoading(true);

    try {
      const user = await login(employeeId.trim(), password);
      if (user.is_admin) {
        navigate('/admin');
      } else {
        navigate('/portal/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid Employee ID/Email or password. Please verify your corporate credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <GreenGridCanvas />

      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      <div className="relative z-10 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-emerald-500/20 shadow-md shadow-emerald-500/5 mb-1">
            <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Nova Solutions Intranet
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Protected Enterprise Gateway & NexusGuard AI Knowledge Platform
          </p>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/40 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs text-red-700 dark:text-red-400 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {showForgotNotice && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start space-x-2.5">
              <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span className="leading-relaxed">
                To reset corporate credentials or request temporary security access, contact IT Helpdesk (<span className="font-mono font-semibold">helpdesk@novasolutions.internal</span>) or your Department Administrator.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Employee ID or Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. U102 or david.chen@novasolutions.internal"
                  autoComplete="username"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(true)}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !employeeId.trim() || !password}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </span>
              ) : (
                <>
                  <span>Sign In to Intranet</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demonstration Quick-Fill Dropdown */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Demo Credential Auto-Fill</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Quick Demonstration
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedPersonaId}
                onChange={handlePersonaChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-dashed border-emerald-500/60 dark:border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer appearance-none pr-9 transition"
              >
                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  -- Select Demo Persona to Auto-Fill --
                </option>
                {DEMO_PERSONAS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {p.name} ({p.id}) — {p.role} [{p.clearance}]
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {selectedPersona && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-2.5 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <span>{selectedPersona.name}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {selectedPersona.id}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {selectedPersona.role} • {selectedPersona.department}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                    selectedPersona.clearance === 'Restricted'
                      ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {selectedPersona.clearance}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                  {selectedPersona.description}
                </div>
                <button
                  type="button"
                  onClick={() => handleAutoLogin(selectedPersona)}
                  disabled={loading}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Instant Sign In as {selectedPersona.name.split(' ')[0]} ({selectedPersona.id})</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-1">
              <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
              <span>SSO / Active Directory Gate</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">v2.4.0-prod</span>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Authorized personnel only. All access, AI inquiries, and document transfers are cryptographically audited under Nova Solutions Information Security Policy.
        </div>
      </div>
    </div>
  );
}
