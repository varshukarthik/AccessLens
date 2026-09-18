import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, Lock, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Solutions', path: '/solutions' },
    { name: 'About', path: '/about' },
    { name: 'Careers', path: '/careers' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-600 transition">
              <ShieldCheck className="w-5 h-5 text-indigo-400 group-hover:text-white transition" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900">Nova Solutions</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Enterprise
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action */}
          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                to="/portal/dashboard"
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Intranet Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
