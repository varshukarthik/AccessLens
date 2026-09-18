import React from 'react';
import { 
  X, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  LifeBuoy
} from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">Employee Help & Guide</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Nova Solutions Intranet & NexusGuard System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>How to Query NexusGuard Assistant</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              NexusGuard is Nova Solutions' policy-gated AI assistant. When you submit a question, NexusGuard evaluates company documents against your security clearance and department membership before sending context to the language model.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Understanding Clearance Tiers</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-emerald-700 dark:text-emerald-400">Internal</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">General employee policies, handbooks, guidelines.</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-amber-700 dark:text-amber-400">Confidential</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Department projects, vendor contracts, internal budgets.</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 col-span-2">
                <div className="font-semibold text-purple-700 dark:text-purple-400">Restricted</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Executive strategy, M&A records, core cryptographic credentials.</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white">Need Elevated Permissions?</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">Submit an access request through the Approvals tab.</div>
            </div>
            <a 
              href="mailto:it-support@novasolutions.internal" 
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
            >
              Contact IT
            </a>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
