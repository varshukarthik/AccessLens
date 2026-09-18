import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, HelpCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

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
      setError(err.message || 'Invalid Employee ID/Email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nova Solutions Sign In</h1>
          <p className="text-xs text-slate-500">
            Enter your corporate Employee ID or Work Email to access the protected intranet.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {showForgotNotice && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-800 flex items-start space-x-2">
              <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-600" />
              <span>
                To reset your corporate password or request access, please contact your internal IT administrator or Security Operations helpdesk.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Employee ID or Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. U102 or name@novasolutions.internal"
                  autoComplete="username"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(true)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !employeeId.trim() || !password}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span className="animate-pulse">Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Protected Enterprise Intranet • Single Sign-On (SSO) Gate
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center text-[11px] text-slate-400">
          Authorized personnel only. All access is logged and governed by Nova Solutions security policies.
        </div>

      </div>
    </div>
  );
}
