import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  ShieldAlert, 
  Sparkles, 
  FileText, 
  X,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Q3 Financial Audits Finalized',
    description: 'Finance department document repository updated with verified regulatory records.',
    time: '25m ago',
    type: 'document',
    read: false,
    link: '/portal/documents'
  },
  {
    id: 'n2',
    title: 'NexusGuard Engine v2.4 Active',
    description: 'Zero-trust ABAC policy gating reinforced with instant cryptographic source verification.',
    time: '2h ago',
    type: 'system',
    read: false,
    link: '/portal/nexusguard'
  },
  {
    id: 'n3',
    title: 'Quarterly Access Review Due',
    description: 'Security operations has scheduled mandatory clearance re-validation for internal accounts.',
    time: 'Yesterday',
    type: 'security',
    read: true,
    link: '/portal/security'
  }
];

export default function NotificationsPopover({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'system':
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      default:
        return <FileText className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No active notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-3.5 flex items-start space-x-3 transition cursor-pointer ${
                !n.read 
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                    {n.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2 mb-1.5">
                  {n.description}
                </p>
                <Link
                  to={n.link}
                  onClick={onClose}
                  className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
        <Link
          to="/portal/activity"
          onClick={onClose}
          className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
        >
          View Full Activity Log ?
        </Link>
      </div>
    </div>
  );
}
