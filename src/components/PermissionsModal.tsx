import { useDialog } from '../utils/useDialog';
import { safeStorage } from '../utils/safeStorage';
import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Volume2, 
  HardDrive, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { AppPermissionsState } from '../types';
import { 
  requestNotificationPermission, 
  requestPersistentStorage, 
  sendLocalNotification, 
  playCompletionSound 
} from '../utils/permissions';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: AppPermissionsState;
  onUpdatePermissions: () => void;
}

const PermissionsModalBody: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  permissions,
  onUpdatePermissions,
}) => {
  const dialogRef = useDialog(onClose);

  const [testSent, setTestSent] = useState(false);
  const [notice, setNotice] = useState('');

  const handleRequestNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotice(result === 'granted' ? 'Permission granted. You can send a test notification.' : 'Notifications are unavailable or blocked. Check this site’s notification settings in your browser.');
    onUpdatePermissions();
  };

  const handleRequestStorage = async () => {
    const granted = await requestPersistentStorage();
    setNotice(granted ? 'Storage protection granted. Keep backups too.' : 'This browser did not grant storage protection. Keep regular backups.');
    onUpdatePermissions();
  };

  const handleToggleAudio = () => {
    const nextVal = !permissions.audioEnabled;
    safeStorage.setItem('omnisticky_audio_sound', nextVal ? 'true' : 'false');
    if (nextVal) {
      playCompletionSound();
    }
    onUpdatePermissions();
  };

  const handleSendTestNotification = () => {
    const sent = sendLocalNotification('Omni Sticky · Test notification', {
      body: 'This is a test of browser notification access. Scheduled reminders are not available in this beta.',
    });
    setTestSent(sent);
    setNotice(sent ? 'Test notification requested. Display depends on your system notification settings.' : 'This browser could not display a notification.');
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Permissions" tabIndex={-1} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      
      <div className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-white dark:bg-[#181a20] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        {notice && <p role="status" className="mb-3 text-sm text-amber-800 dark:text-amber-200">{notice}</p>}
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Web & OS Permissions Hub
              </h3>
              <p className="text-[11px] text-slate-400">
                Manage notifications, app badges, audio cues, and offline persistence.
              </p>
            </div>
          </div>

          <button
            onClick={onClose} aria-label="Close Permissions "
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permissions Cards List */}
        <div className="space-y-3 mb-6">
          
          {/* 1. Push / Desktop Notifications */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Task Due & Focus Notifications</span>
                  {permissions.notifications === 'granted' ? (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded">Granted</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.2 rounded">{permissions.notifications}</span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  Test browser notification access. Scheduled reminders are not available in this beta.
                </p>
              </div>
            </div>

            <div>
              {permissions.notifications === 'granted' ? (
                <button
                  onClick={handleSendTestNotification}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  {testSent ? 'Sent!' : 'Test'}
                </button>
              ) : (
                <button
                  onClick={handleRequestNotifications}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Enable
                </button>
              )}
            </div>
          </div>

          {/* 2. Tactile Audio Feedback */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mt-0.5">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Completion Chime</span>
                  {permissions.audioEnabled ? (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded">Active</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">Muted</span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  Synthesized subtle harmonic click when checking off a task.
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleAudio}
              className={`px-3 py-1.5 font-bold text-xs rounded-xl transition cursor-pointer ${
                permissions.audioEnabled 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {permissions.audioEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* 3. Persistent Storage */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mt-0.5">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Local Storage Protection</span>
                  {permissions.persistentStorage ? (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded">Persistent</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">Default</span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  Requests protection from automatic browser eviction. Clearing site data still deletes your workspace; keep backups.
                </p>
              </div>
            </div>

            <button
              onClick={handleRequestStorage}
              disabled={permissions.persistentStorage}
              className={`px-3 py-1.5 font-bold text-xs rounded-xl transition cursor-pointer ${
                permissions.persistentStorage 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-default' 
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-xs'
              }`}
            >
              {permissions.persistentStorage ? 'Protected' : 'Protect'}
            </button>
          </div>

          {/* 4. App Icon Badging */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mt-0.5">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>App Icon Badge Count</span>
                  <span className="text-[10px]">{permissions.badgingSupported ? 'Supported' : 'Unavailable'}</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  On supported installed web apps, shows pending tasks count directly on your PWA icon or dock.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end">
          <button
            onClick={onClose} aria-label="Close Permissions "
            className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>

    </div>
  );
};


export const PermissionsModal: React.FC<PermissionsModalProps> = (props) => props.isOpen ? <PermissionsModalBody {...props} /> : null;
