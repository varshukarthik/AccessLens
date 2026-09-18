import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Layers, 
  Fingerprint
} from 'lucide-react';

export default function SecurityCenterPage() {
  const { user } = useAuth();

  const getClearanceRank = (clearance) => {
    switch (clearance?.toLowerCase()) {
      case 'restricted': return 4;
      case 'confidential': return 3;
      case 'internal': return 2;
      default: return 1;
    }
  };

  const clearanceRank = getClearanceRank(user?.clearance);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Trust Architecture</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Security & Clearance Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cryptographic identity, clearance hierarchies, and access boundary parameters for {user?.name}.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Fingerprint className="w-4 h-4" />
          <span>Session State: Verified & Valid</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Trust Score</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">98</span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Multi-factor authentication active, signed TLS certificate valid, zero anomalous access flags recorded.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clearance Classification</div>
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{user?.clearance}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Eligible to retrieve up to level {clearanceRank} ({user?.clearance}) classified data within {user?.department}.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compartment Isolation</div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{user?.department} Only</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Cross-department documents are automatically redacted by the NexusGuard ABAC policy engine.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Enterprise Clearance Hierarchy & Policy Tiers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { level: 'Public', desc: 'General corporate marketing, press releases, public announcements.', minRank: 1 },
            { level: 'Internal', desc: 'Employee handbook, onboarding workflows, internal wikis.', minRank: 2 },
            { level: 'Confidential', desc: 'Department roadmaps, budgets, technical architecture, client agreements.', minRank: 3 },
            { level: 'Restricted', desc: 'Executive M&A strategy, cryptographic keys, root financial ledgers.', minRank: 4 },
          ].map((tier) => {
            const isAuthorized = clearanceRank >= tier.minRank;
            return (
              <div
                key={tier.level}
                className={`p-4 rounded-2xl border transition-all ${
                  isAuthorized
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80'
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{tier.level}</span>
                  {isAuthorized ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {tier.desc}
                </p>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-wider">
                  {isAuthorized ? (
                    <span className="text-emerald-700 dark:text-emerald-400">Authorized</span>
                  ) : (
                    <span className="text-slate-400">Requires Elevation</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
