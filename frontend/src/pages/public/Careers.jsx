import React from 'react';
import { Briefcase, ArrowRight, CheckCircle2, Building, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Careers() {
  const openings = [
    { title: 'Senior AI Security Architect', dept: 'Security & Research', location: 'San Francisco, CA / Remote', type: 'Full-time' },
    { title: 'Full-Stack Enterprise Engineer', dept: 'Platform Core', location: 'New York, NY / Remote', type: 'Full-time' },
    { title: 'Policy Engine Systems Lead', dept: 'Governance', location: 'Seattle, WA / Remote', type: 'Full-time' },
    { title: 'Enterprise Product Designer', dept: 'Design & UX', location: 'Austin, TX / Remote', type: 'Full-time' },
  ];

  return (
    <div className="py-16 space-y-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Careers at Nova Solutions</span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2 sm:text-5xl">
            Build the Future of Secure Enterprise Intelligence
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
            Join a world-class team of engineers, security researchers, and product architects designing the next generation of deterministic enterprise AI systems.
          </p>
        </div>
      </section>

      {/* Values Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors duration-200">
            <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Security as First Principle</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We engineer zero-leakage security into every component from the database layer to user interfaces.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors duration-200">
            <Heart className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Empowered Autonomous Teams</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              High trust, high velocity. We value craft, rigorous verification, and clear technical rationale.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors duration-200">
            <Building className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Global Enterprise Impact</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our products safeguard confidential operations and multi-billion-dollar enterprise decisions daily.
            </p>
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Current Opportunities</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Explore open positions across our global engineering and security teams.</p>
        </div>

        <div className="space-y-3">
          {openings.map((job) => (
            <div key={job.title} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{job.title}</h4>
                <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>{job.dept}</span>
                  <span>•</span>
                  <span>{job.location}</span>
                  <span>•</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{job.type}</span>
                </div>
              </div>
              <button 
                onClick={() => alert('Applications are handled through the Nova Solutions Internal Portal.')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition self-start sm:self-auto"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
