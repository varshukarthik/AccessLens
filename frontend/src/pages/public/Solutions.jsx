import React from 'react';
import { ShieldCheck, Cpu, Layers, Lock, Database, CheckCircle2, ArrowRight, Workflow, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Solutions() {
  const solutions = [
    {
      icon: Cpu,
      title: 'Enterprise Technology Consulting',
      description: 'Full-lifecycle IT strategy, digital architecture modernizations, and cloud transformation advisory tailored for global enterprises.',
      features: [
        'Enterprise architecture & modernization blueprints',
        'Legacy-to-cloud migration roadmaps',
        'High-governance systems integration',
        'Microservices and event-driven architectures'
      ]
    },
    {
      icon: Database,
      title: 'Data & Business Intelligence Platforms',
      description: 'Unified data platforms, real-time analytics engines, and business intelligence fabrics that empower automated decision intelligence.',
      features: [
        'Omnichannel data lakehouse engineering',
        'Real-time streaming pipeline orchestration',
        'Automated regulatory compliance reporting',
        'Secure multi-tenant data warehousing'
      ]
    },
    {
      icon: Lock,
      title: 'Deterministic Security & Governance Engine',
      description: 'Independent policy module that evaluates clearance levels (Public < Internal < Confidential < Restricted), department silos, and role privileges before knowledge retrieval occurs.',
      features: [
        'Deterministic mathematical rule enforcement',
        'Pre-LLM context isolation and access gating',
        'Explicit denial override capabilities',
        'Default-deny on malformed or missing metadata'
      ]
    },
    {
      icon: Workflow,
      title: 'Digital Operations & Workflow Automation',
      description: 'Scalable automation frameworks that connect disparate enterprise systems, streamline cross-functional workflows, and reduce operational latency.',
      features: [
        'End-to-end business process orchestration',
        'Automated task tracking and audit trails',
        'Enterprise ERP and CRM system integrations',
        'Operational SLA telemetry and analytics'
      ]
    }
  ];

  return (
    <div className="py-16 space-y-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Enterprise Solutions</span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-2 sm:text-5xl">
            Modern Digital Operations for Resilient Enterprises
          </h1>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            Nova Solutions delivers secure data infrastructure, cloud modernization, and operational intelligence designed to solve mission-critical enterprise challenges.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {solutions.map((sol) => {
          const Icon = sol.icon;
          return (
            <div key={sol.title} className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-1 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{sol.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{sol.description}</p>
              </div>

              <div className="lg:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Core Capabilities</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sol.features.map((feat) => (
                    <div key={feat} className="flex items-start space-x-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-center text-white space-y-4">
          <h3 className="text-2xl font-bold">Nova Solutions Employee Intranet</h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto">
            Authorized team members can access internal tools, projects, and the NexusGuard assistant through the company portal.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
