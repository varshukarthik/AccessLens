import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  User, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Building2, 
  CheckCircle2, 
  Shield
} from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { user } = useAuth();

  if (!isOpen || !user) return null;

  const getClearanceBadge = (clearance) => {
    switch (clearance?.toLowerCase()) {
      case 'restricted':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'confidential':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'internal':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 p-4 flex justify-between items-start">
          <div className="flex items-center space-x-2 text-white/90 text-xs font-semibold tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Employee Identity</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold border-4 border-white dark:border-slate-900 shadow-lg">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center space-x-1.5 ${getClearanceBadge(user.clearance)}`}>
              <Lock className="w-3.5 h-3.5" />
              <span>{user.clearance} Level</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {user.role} ? {user.department} Department
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Employee ID</span>
              </div>
              <div className="font-mono font-bold text-slate-900 dark:text-white">{user.employee_id}</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Department</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">{user.department}</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 col-span-2">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Work Email</span>
              </div>
              <div className="font-semibold text-slate-900 dark:text-white truncate">{user.email}</div>
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-xs">
            <div className="flex items-center space-x-1.5 font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Attribute-Based Access Control (ABAC) Scope</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-emerald-900 dark:text-emerald-200">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Document Tier: Authorized up to <strong>{user.clearance}</strong> classification</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Department Isolation: Direct access to <strong>{user.department}</strong> repository</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>NexusGuard Context Gate: Pre-LLM mathematical policy filtering active</span>
              </li>
            </ul>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs shadow-xs transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
