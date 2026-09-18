import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Globe, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 text-sm text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-bold text-slate-900">Nova Solutions</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enterprise technology and operations solutions. Empowering global organizations to modernize operations with secure data platforms and digital intelligence.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">Solutions & Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/solutions" className="hover:text-slate-900 transition">Technology Consulting</Link></li>
              <li><Link to="/solutions" className="hover:text-slate-900 transition">Data & Business Intelligence</Link></li>
              <li><Link to="/solutions" className="hover:text-slate-900 transition">Cloud & Infrastructure</Link></li>
              <li><Link to="/solutions" className="hover:text-slate-900 transition">Cybersecurity & Risk Management</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-slate-900 transition">About Nova Solutions</Link></li>
              <li><Link to="/careers" className="hover:text-slate-900 transition">Careers & Global Offices</Link></li>
              <li><Link to="/contact" className="hover:text-slate-900 transition">Contact Enterprise Sales</Link></li>
              <li><Link to="/login" className="hover:text-slate-900 transition">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">Global Headquarters</h4>
            <p className="text-xs text-slate-500 mb-2">
              San Francisco • London • Singapore • Bengaluru • Tokyo
            </p>
            <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>ISO 27001 & SOC-2 Certified</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Nova Solutions Inc. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-900 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-900 cursor-pointer">Security Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
