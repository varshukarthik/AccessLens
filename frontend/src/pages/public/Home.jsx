import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Database, 
  Cloud, 
  Cpu, 
  ShieldCheck, 
  Users, 
  Globe, 
  BarChart3, 
  Lock,
  Briefcase,
  Sparkles,
  TrendingUp,
  Workflow
} from 'lucide-react';

export default function Home() {
  // Configurable company statistics
  const companyStats = [
    { label: 'Enterprise Clients', value: '12+', desc: 'Global Fortune 500 & scale-up partnerships' },
    { label: 'Countries Served', value: '8', desc: 'Active deployments across North America, EMEA & APAC' },
    { label: 'Client Retention', value: '96%', desc: 'Long-term enterprise contracts and satisfaction' },
    { label: 'Active Projects', value: '40+', desc: 'Complex digital transformation initiatives' },
    { label: 'Global Employees', value: '250+', desc: 'Engineers, consultants, and domain specialists' }
  ];

  // Core Service Areas
  const services = [
    {
      icon: Cpu,
      title: 'Enterprise Technology Consulting',
      description: 'Strategic advisory and modern architecture design to modernize legacy corporate infrastructure and accelerate digital initiatives.'
    },
    {
      icon: Database,
      title: 'Data & Business Intelligence',
      description: 'Unified data platforms, advanced pipeline engineering, and enterprise analytics enabling real-time executive decision-making.'
    },
    {
      icon: Cloud,
      title: 'Cloud & Infrastructure Solutions',
      description: 'Resilient multi-cloud architectures, automated hybrid migrations, and mission-critical high-availability systems.'
    },
    {
      icon: Workflow,
      title: 'Digital Operations & Automation',
      description: 'End-to-end business process re-engineering, intelligent workflows, and enterprise systems integration.'
    },
    {
      icon: Users,
      title: 'Customer Experience Platforms',
      description: 'Next-generation digital portals, omnichannel customer engagement systems, and personalized service delivery engines.'
    },
    {
      icon: ShieldCheck,
      title: 'Cybersecurity & Risk Management',
      description: 'Zero-trust governance frameworks, deterministic policy controls, cryptographic data protection, and compliance auditing.'
    }
  ];

  // Featured Client Initiatives
  const initiatives = [
    {
      name: 'Orion Analytics Platform',
      industry: 'Retail & Supply Chain',
      status: 'Active Deployment',
      description: 'Enterprise data fabric unifying multi-channel inventory logs, demand forecasting models, and supplier performance metrics.',
      impact: '32% improvement in stockout prevention and ₹45 Cr annualized logistics efficiency.'
    },
    {
      name: 'Atlas Cloud Migration',
      industry: 'Financial Services',
      status: 'Multi-Region Active',
      description: 'Seamless migration of mission-critical banking core systems to a secure, hybrid cloud architecture with automated compliance.',
      impact: '99.995% service uptime achieved across 4 global operating jurisdictions.'
    },
    {
      name: 'Helix Customer Experience Program',
      industry: 'Telecommunications',
      status: 'Scaled Production',
      description: 'Omnichannel customer support platform integrating intelligent routing, customer health analytics, and service orchestration.',
      impact: '40% reduction in resolution time across 5 million active subscribers.'
    },
    {
      name: 'Meridian Operations Modernization',
      industry: 'Healthcare Logistics',
      status: 'Active Expansion',
      description: 'Cold-chain tracking, real-time shipment monitoring, and automated regulatory validation across clinical supply networks.',
      impact: '100% regulatory audit compliance and zero temperature-excursion incidents.'
    }
  ];

  // Industries Served
  const industries = [
    { name: 'Financial Services & Banking', desc: 'Risk modeling, core modernization, and regulatory compliance.' },
    { name: 'Healthcare & Life Sciences', desc: 'Clinical logistics, data governance, and secure operations.' },
    { name: 'Retail & Consumer Goods', desc: 'Omnichannel commerce, demand forecasting, and inventory optimization.' },
    { name: 'Telecommunications & Media', desc: 'High-throughput infrastructure and customer experience platforms.' },
    { name: 'Manufacturing & Logistics', desc: 'Supply chain visibility, predictive maintenance, and IoT telemetry.' }
  ];

  // Our Methodology
  const methodology = [
    { step: '01', title: 'Strategic Discovery', desc: 'In-depth assessment of enterprise operational bottlenecks, data architectures, and security mandates.' },
    { step: '02', title: 'Architecture & Governance', desc: 'Designing resilient, zero-trust solution blueprints with built-in policy enforcement and compliance standards.' },
    { step: '03', title: 'Engineered Deployment', desc: 'Agile execution, rigorous automated verification, and phased rollouts across business units.' },
    { step: '04', title: 'Continuous Optimization', desc: 'Real-time telemetry, continuous security governance, and iterative capability expansion.' }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Nova Solutions • Enterprise Digital Solutions</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Building smarter digital operations for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-slate-800">
                modern enterprises.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Nova Solutions helps organizations improve business operations through secure technology, data platforms, automation, and enterprise intelligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/solutions"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl shadow-xs transition group"
              >
                <span>Explore Our Solutions</span>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl border border-slate-200 shadow-xs transition"
              >
                <span>Sign In</span>
              </Link>
            </div>

            {/* Trust Points */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Enterprise Architecture</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero-Trust Governance</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Global Deployment Capability</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Company Statistics Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {companyStats.map((stat, idx) => (
              <div key={stat.label} className={`space-y-1 ${idx > 0 ? 'pt-4 md:pt-0 md:pl-6' : ''}`}>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-xs font-bold text-slate-700">{stat.label}</div>
                <div className="text-[11px] text-slate-400 leading-tight">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Core Company Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Our Services & Capabilities</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Integrated Enterprise Technology & Operations
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            From strategic architecture to reliable operations, Nova Solutions delivers scalable solutions designed to solve complex business challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <div key={srv.title} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition group">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{srv.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{srv.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Client Initiatives */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Selected Client Projects</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Featured Enterprise Initiatives</h2>
            <p className="text-xs text-slate-500 mt-1">Recent modernization programs delivered across major industries.</p>
          </div>
          <Link
            to="/solutions"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            <span>View all initiatives</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initiatives.map((p) => (
            <div key={p.name} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider font-mono">{p.industry}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">{p.status}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-0.5">
                <div className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider">Business Impact</div>
                <div className="font-medium text-slate-800">{p.impact}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Industries Served & Methodology */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Industry Expertise</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Deep Domain Knowledge Across Regulated Sectors
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We engineer customized solutions tailored to specific operational requirements, regulatory standards, and business environments.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {industries.map((ind) => (
                <div key={ind.name} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <h4 className="font-bold text-sm text-white">{ind.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{ind.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Our Approach</span>
              <h3 className="text-xl sm:text-2xl font-bold">The Nova Delivery Methodology</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {methodology.map((m) => (
                <div key={m.step} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-indigo-400 font-mono font-extrabold text-sm">{m.step}</div>
                  <h4 className="font-bold text-sm text-white">{m.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 6. Corporate Contact & Global Office CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Globe className="w-4 h-4" />
              <span>Global Presence</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Partner with Nova Solutions</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explore how our technology consulting, data platforms, and secure digital operations can transform your enterprise.
            </p>
            <div className="text-xs text-slate-500">
              Offices in San Francisco • London • Singapore • Bengaluru • Tokyo
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <span>Contact Enterprise Sales</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
