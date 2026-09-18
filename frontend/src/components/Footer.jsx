import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-emerald-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Nova Solutions</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enterprise technology and operations solutions. Empowering global organizations to modernize operations with secure data platforms and digital intelligence.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">Solutions & Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/solutions" className="hover:text-slate-900 dark:hover:text-white transition">Technology Consulting</Link></li>
              <li><Link to="/solutions" className="hover:text-slate-900 dark:hover:text-white transition">Data & Business Intelligence</Link></li>
              <li><Link to="/solutions" className="hover:text-slate-900 dark:hover:text-white transition">Cloud & Infrastructure</Link></li>
              <li><Link to="/solutions" className="hover:text-slate-900 dark:hover:text-white transition">Cybersecurity & Risk Management</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition">About Nova Solutions</Link></li>
              <li><Link to="/careers" className="hover:text-slate-900 dark:hover:text-white transition">Careers & Global Offices</Link></li>
              <li><Link to="/contact" className="hover:text-slate-900 dark:hover:text-white transition">Contact Enterprise Sales</Link></li>
              <li><Link to="/login" className="hover:text-slate-900 dark:hover:text-white transition">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">Global Headquarters</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              San Francisco • London • Singapore • Bengaluru • Tokyo
            </p>
            <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
              <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>ISO 27001 & SOC-2 Certified</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            © {new Date().getFullYear()} Nova Solutions Inc. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Security Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
