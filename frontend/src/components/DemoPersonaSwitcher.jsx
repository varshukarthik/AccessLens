import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, UserCheck, Play, ChevronDown, ChevronUp, Sparkles, Lock } from 'lucide-react';

export default function DemoPersonaSwitcher() {
  const { user, switchPersona, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [switching, setSwitching] = useState(false);

  const personas = [
    { id: 'U102', name: 'David Chen', role: 'Finance', dept: 'Finance', clearance: 'Internal', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'U205', name: 'Sarah Jenkins', role: 'Marketing', dept: 'Marketing', clearance: 'Internal', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'U301', name: 'Michael Ross', role: 'Finance', dept: 'Finance', clearance: 'Internal', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'Admin', name: 'Elena Vance', role: 'Admin', dept: 'Security', clearance: 'Restricted', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  ];

  const handleSelectPersona = async (empId) => {
    setSwitching(true);
    try {
      await switchPersona(empId);
      if (empId === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/portal/nexusguard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(false);
    }
  };

  const handleRunScenario = async (empId, query) => {
    setSwitching(true);
    try {
      await switchPersona(empId);
      navigate('/portal/nexusguard', { state: { autoQuery: query, runKey: Date.now() } });
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <aside aria-label="Hackathon Demonstration Toolbar" className="fixed bottom-4 right-4 z-50 max-w-xl bg-white/95 backdrop-blur shadow-2xl border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 text-xs">
      {/* Header bar */}
      <div 
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between px-3 py-2 bg-slate-900 text-white cursor-pointer select-none hover:bg-slate-800 transition"
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide uppercase text-[10px] text-slate-300">PS 14 Demo Toolbar</span>
          <span className="text-slate-400">•</span>
          {user ? (
            <span className="font-medium text-slate-100">
              Active: <span className="text-indigo-300">{user.name}</span> ({user.employee_id} • {user.department} • {user.clearance})
            </span>
          ) : (
            <span className="text-slate-300 italic">Not logged in (Public view)</span>
          )}
        </div>
        <button className="text-slate-400 hover:text-white p-1">
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded controls */}
      {!collapsed && (
        <div className="p-3 bg-white space-y-2.5">
          {/* 1-Click Persona Switcher */}
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Switch Demo Persona</span>
              {switching && <span className="text-indigo-600 animate-pulse">Switching session...</span>}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {personas.map((p) => {
                const isActive = user?.employee_id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPersona(p.id)}
                    disabled={switching}
                    className={`px-2 py-1.5 rounded-lg border text-left transition flex flex-col justify-between ${
                      isActive 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-[11px] truncate">{p.id}</div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                      {p.role}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mandatory Demo Scenarios */}
          <div className="border-t border-slate-100 pt-2">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>1-Click Challenge Scenarios</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleRunScenario('U102', 'What is the Q4 revenue forecast?')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-lg text-left transition"
              >
                <div className="flex items-center space-x-1.5">
                  <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                  <span className="font-medium">Scenario A: Finance Employee (U102)</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono">Expect: 120 Cr (DOC-101)</span>
              </button>

              <button
                onClick={() => handleRunScenario('U205', 'What is the Q4 revenue forecast?')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-left transition"
              >
                <div className="flex items-center space-x-1.5">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span className="font-medium">Scenario B: Marketing Employee (U205)</span>
                </div>
                <span className="text-[10px] text-amber-800 font-mono">Expect: Denied / 0 Leakage</span>
              </button>

              <button
                onClick={() => handleRunScenario('U301', 'What is the latest Q4 forecast?')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-lg text-left transition"
              >
                <div className="flex items-center space-x-1.5">
                  <Play className="w-3 h-3 text-blue-600 fill-blue-600" />
                  <span className="font-medium">Scenario C: Version Resolver (U301)</span>
                </div>
                <span className="text-[10px] text-blue-700 font-mono">Expect: 125 Cr (DOC-302 v2.0)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
