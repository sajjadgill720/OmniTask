import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Sun, 
  Moon, 
  Bell, 
  Volume2, 
  HardDrive, 
  Download, 
  Upload, 
  Crown, 
  Bug, 
  Check, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { AppPermissionsState, ThemeMode, Task, Area, Project } from '../types';
import { exportTasksJSON, exportTasksMarkdown } from '../utils/storage';
import { 
  requestNotificationPermission, 
  requestPersistentStorage,
  sendLocalNotification, 
  playCompletionSound 
} from '../utils/permissions';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  permissions: AppPermissionsState;
  onUpdatePermissions: () => void;
  isProUser: boolean;
  onOpenSubscription: () => void;
  tasks: Task[];
  areas: Area[];
  projects: Project[];
  debugMode: boolean;
  onToggleDebugMode: () => void;
}

type SettingsTab = 'general' | 'notifications' | 'data' | 'subscription';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  permissions,
  onUpdatePermissions,
  isProUser,
  onOpenSubscription,
  tasks,
  areas,
  projects,
  debugMode,
  onToggleDebugMode,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [notificationTestSent, setNotificationTestSent] = useState(false);

  const handleRequestNotifications = async () => {
    await requestNotificationPermission();
    onUpdatePermissions();
  };

  const handleRequestStorage = async () => {
    await requestPersistentStorage();
    onUpdatePermissions();
  };

  const handleTestNotification = () => {
    sendLocalNotification(
      'OmniSticky Focus Reminder',
      { body: 'This is a sample notification to keep your daily focus on track.' }
    );
    setNotificationTestSent(true);
    setTimeout(() => setNotificationTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white dark:bg-[#14161f] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Settings & Preferences
              </h3>
              <p className="text-[11px] text-slate-400">
                Manage your environment, notifications, backups, and display.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-100 dark:border-white/10 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 transition border-b-2 cursor-pointer ${
              activeTab === 'general'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-2.5 px-3 transition border-b-2 cursor-pointer ${
              activeTab === 'notifications'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`pb-2.5 px-3 transition border-b-2 cursor-pointer ${
              activeTab === 'data'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Data & Backups
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`pb-2.5 px-3 transition border-b-2 cursor-pointer flex items-center gap-1 ${
              activeTab === 'subscription'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Crown className="w-3 h-3 text-amber-500" />
            <span>Subscription</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* TAB: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              
              {/* Appearance / Theme */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Appearance</h4>
                    <p className="text-[11px] text-slate-400">Toggle between Light and Dark mode.</p>
                  </div>
                </div>
                <button
                  onClick={onToggleTheme}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 hover:bg-slate-100 transition cursor-pointer shadow-xs"
                >
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Completion Sound</h4>
                    <p className="text-[11px] text-slate-400">Play an acoustic chime when checking off tasks.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const next = !permissions.audioEnabled;
                    localStorage.setItem('omnisticky_audio_sound', next ? 'true' : 'false');
                    onUpdatePermissions();
                    if (next) playCompletionSound();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    permissions.audioEnabled
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-white/10'
                  }`}
                >
                  {permissions.audioEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>

              {/* Developer / 3D Debug Readouts */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <Bug className="w-4 h-4 text-indigo-500" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">3D Debug Metrics</h4>
                    <p className="text-[11px] text-slate-400">Show camera pitch, yaw, and scale overlay on 3D Canvas.</p>
                  </div>
                </div>
                <button
                  onClick={onToggleDebugMode}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    debugMode
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                      : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-white/10'
                  }`}
                >
                  {debugMode ? 'Visible' : 'Hidden'}
                </button>
              </div>

            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 text-xs">
                <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300 mb-1">
                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Desktop & Browser Alerts</span>
                </div>
                <p className="text-blue-700 dark:text-blue-400/90 leading-relaxed text-[11px]">
                  Get gentle reminders for scheduled tasks, due date alerts, and focus sessions even when working in another tab.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">System Notification Access</h4>
                  <p className="text-[11px] text-slate-400">
                    Status: <span className="font-semibold uppercase">{permissions.notifications}</span>
                  </p>
                </div>
                {permissions.notifications === 'granted' ? (
                  <button
                    onClick={handleTestNotification}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 hover:bg-slate-100 transition cursor-pointer"
                  >
                    {notificationTestSent ? 'Sent!' : 'Send Test Alert'}
                  </button>
                ) : (
                  <button
                    onClick={handleRequestNotifications}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-xs"
                  >
                    Enable Notifications
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB: DATA & BACKUPS */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Zero Lock-in Export
                </h4>
                <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                  Your notes belong to you. Download a portable copy of your entire workspace at any time.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => exportTasksJSON(tasks)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-500" />
                    <span>Export JSON Backup</span>
                  </button>

                  <button
                    onClick={() => exportTasksMarkdown(tasks, areas, projects)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Export Markdown (.md)</span>
                  </button>
                </div>
              </div>

              {/* Local Storage Persistence */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <HardDrive className="w-4 h-4 text-amber-500" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Persistent Offline Storage</h4>
                    <p className="text-[11px] text-slate-400">
                      {permissions.persistentStorage 
                        ? 'Protected against browser eviction' 
                        : 'Browser may evict storage under low disk conditions'}
                    </p>
                  </div>
                </div>
                {!permissions.persistentStorage && (
                  <button
                    onClick={handleRequestStorage}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition cursor-pointer"
                  >
                    Protect Storage
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB: SUBSCRIPTION */}
          {activeTab === 'subscription' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-indigo-500/10 to-blue-500/10 border border-amber-500/30 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Crown className="w-6 h-6 fill-white" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">
                  {isProUser ? 'OmniSticky Pro (Active)' : 'OmniSticky Free Tier'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                  {isProUser 
                    ? 'All pro features unlocked: unlimited projects, 3D spatial canvas, widget suites, and zero lock-in sync.'
                    : 'Upgrade to OmniSticky Pro for full multi-experience views, widgets hub, and unrestricted categories.'}
                </p>
                {!isProUser && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSubscription();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-500/25 transition active:scale-95 cursor-pointer"
                  >
                    View Pro Plans
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
