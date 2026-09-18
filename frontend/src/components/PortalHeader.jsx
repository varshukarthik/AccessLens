import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import NotificationsPopover from './NotificationsPopover';
import HelpModal from './HelpModal';
import { 
  ShieldCheck, 
  LogOut, 
  User, 
  Lock, 
  ExternalLink, 
  Sun, 
  Moon, 
  Bell, 
  HelpCircle, 
  Settings, 
  ShieldAlert, 
  ChevronDown
} from 'lucide-react';

export default function PortalHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path.includes('/nexusguard')) return 'NexusGuard AI Assistant';
    if (path.includes('/tasks')) return 'My Tasks & Workload';
    if (path.includes('/approvals')) return 'Approval Requests';
    if (path.includes('/documents')) return 'Authorized Documents';
    if (path.includes('/security')) return 'Security & Access Center';
    if (path.includes('/activity')) return 'Audit & Activity Trail';
    if (path.includes('/settings')) return 'Employee Preferences';
    if (path.includes('/history')) return 'Research History';
    return 'Employee Intranet Workspace';
  };

  const getClearanceBadgeColor = (clearance) => {
    switch (clearance?.toLowerCase()) {
      case 'restricted':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'confidential':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'internal':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
        <div className="flex items-center space-x-2 text-xs">
          <Link 
            to="/portal/dashboard"
            className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Nova Solutions</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">{user?.department || 'Corporate'}</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{getBreadcrumbTitle()}</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`hidden md:flex px-2.5 py-1 rounded-full border text-xs font-semibold items-center space-x-1.5 ${getClearanceBadgeColor(user?.clearance)}`}>
            <Lock className="w-3 h-3" />
            <span>{user?.clearance} Clearance</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setHelpModalOpen(true)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Help & Documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </button>
            <NotificationsPopover isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
          </div>

          <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-semibold text-slate-900 dark:text-white leading-tight">{user?.name}</div>
                <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{user?.employee_id}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">{user?.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
                  <div className="mt-1.5 flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-semibold">
                      {user?.employee_id}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      {user?.department} ? {user?.clearance}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center space-x-2.5 text-slate-700 dark:text-slate-300"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>View Full Profile</span>
                  </button>

                  <Link
                    to="/portal/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center space-x-2.5 text-slate-700 dark:text-slate-300"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </Link>

                  <Link
                    to="/portal/security"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center space-x-2.5 text-slate-700 dark:text-slate-300"
                  >
                    <ShieldAlert className="w-4 h-4 text-slate-400" />
                    <span>Security Center</span>
                  </Link>

                  <Link
                    to="/"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center space-x-2.5 text-slate-700 dark:text-slate-300"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Public Website</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center space-x-2.5 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <HelpModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </>
  );
}
