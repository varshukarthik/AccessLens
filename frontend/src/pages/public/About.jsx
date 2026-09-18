import React from 'react';
import { ShieldCheck, Target, Users, Award, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const leadership = [
    { name: 'Victoria Sterling', role: 'Chief Executive Officer', bio: 'Former Enterprise Strategy VP with 18+ years leading enterprise digital transformation and secure operations.' },
    { name: 'Marcus Vance', role: 'Chief Technology Officer', bio: 'Enterprise systems architect specializing in distributed data platforms, resilient cloud systems, and zero-trust engineering.' },
    { name: 'Elena Vance', role: 'Head of Information Security', bio: 'Former intelligence auditor and architect of Nova Solutions zero-trust compliance standards.' },
  ];

  return (
    <div className="py-16 space-y-20">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">About Nova Solutions</span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-2 sm:text-5xl">
            Modernizing Enterprise Operations with Provable Security
          </h1>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            Founded on the principle that operational agility must never compromise data security, Nova Solutions provides mission-critical technology platforms and consulting to high-governance enterprises worldwide.
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Our Mission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To empower enterprise teams to make faster, data-informed decisions while enforcing deterministic security governance that protects proprietary assets.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Zero-Trust by Design</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We design every solution around provable authorization boundaries, isolated context envelopes, and automated compliance auditing.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Engineered Excellence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every data platform and automated workflow is built for scale, resilience, and verified audit integrity across complex enterprise environments.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Executive Leadership</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Guided by Enterprise Pioneers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leadership.map((leader) => (
            <div key={leader.name} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center mb-3">
                {leader.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h4 className="font-bold text-slate-900 text-base">{leader.name}</h4>
              <div className="text-xs font-semibold text-indigo-600">{leader.role}</div>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">{leader.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-200">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Are you a Nova Solutions Employee?</h3>
            <p className="text-xs text-slate-600 mt-1">Access your corporate workspace, projects, and documents.</p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 text-indigo-400" />
          </Link>
        </div>
      </section>
    </div>
  );
}
