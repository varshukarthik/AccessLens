import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Settings, 
  User, 
  Sun, 
  Moon, 
  Bell, 
  KeyRound, 
  Check, 
  AlertCircle,
  Palette
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState({ text: '', type: '' });
  
  const [emailDigest, setEmailDigest] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [savedSettings, setSavedSettings] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdMessage({ text: 'Please fill in all password fields.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMessage({ text: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }

    setPwdMessage({ text: 'Password successfully updated.', type: 'success' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPwdMessage({ text: '', type: '' }), 4000);
  };

  const handleSavePreferences = () => {
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>Account & System Configuration</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Employee Preferences & Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your account profile, theme appearance, notifications, and security credentials.
        </p>
      </div>

      {savedSettings && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Theme</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose your preferred interface theme. Setting is saved across sessions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
              theme === 'light'
                ? 'border-emerald-500 bg-emerald-50/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-amber-500 shadow-xs">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">Light Mode</div>
                <div className="text-[11px] text-slate-500">Default crisp enterprise theme</div>
              </div>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-emerald-600" />}
          </div>

          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
              theme === 'dark'
                ? 'border-emerald-500 bg-slate-800'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400 shadow-xs">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Dark Mode</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">High-contrast cybernetic palette</div>
              </div>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-emerald-400" />}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Corporate Identity Attributes</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Full Name</label>
            <input
              type="text"
              readOnly
              value={user?.name || ''}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium cursor-not-allowed text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Employee ID</label>
            <input
              type="text"
              readOnly
              value={user?.employee_id || ''}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold cursor-not-allowed text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Department</label>
            <input
              type="text"
              readOnly
              value={user?.department || ''}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium cursor-not-allowed text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Security Clearance Tier</label>
            <input
              type="text"
              readOnly
              value={`${user?.clearance} Classification`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-emerald-700 dark:text-emerald-400 font-bold cursor-not-allowed text-xs"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Communication Preferences</h2>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Daily Department Activity Digest</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Receive morning summary of relevant documents and tasks.</div>
            </div>
            <input
              type="checkbox"
              checked={emailDigest}
              onChange={(e) => setEmailDigest(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Security & Clearance Alerts</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Instant notifications for access audits and privilege renewals.</div>
            </div>
            <input
              type="checkbox"
              checked={securityAlerts}
              onChange={(e) => setSecurityAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
        </div>

        <button
          onClick={handleSavePreferences}
          className="px-4 py-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
        >
          Save Preferences
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Change Account Password</h2>
        </div>

        {pwdMessage.text && (
          <div className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
            pwdMessage.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
          }`}>
            {pwdMessage.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span>{pwdMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="????????????"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="????????????"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="????????????"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
