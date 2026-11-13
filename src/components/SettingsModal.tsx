import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import type { AppPermissionsState, ThemeMode } from '../types';
import { exportTasksMarkdown } from '../utils/storage';
import { createBackup, downloadFile, downloadRecoveryData, parseBackup, prepareRestore, type Workspace } from '../utils/backup';
import { safeStorage, getStorageError } from '../utils/safeStorage';
import { requestPersistentStorage, playCompletionSound } from '../utils/permissions';
import { useDialog } from '../utils/useDialog';

interface SettingsModalProps extends Workspace {
  isOpen: boolean; onClose: () => void; theme: ThemeMode; onToggleTheme: () => void;
  permissions: AppPermissionsState; onUpdatePermissions: () => void; onRestore: (workspace: Workspace) => void;
}
function SettingsBody(props: SettingsModalProps) {
  const { onClose, theme, onToggleTheme, permissions, onUpdatePermissions, onRestore } = props;
  const ref = useDialog(onClose);
  const [tab, setTab] = useState<'general' | 'data' | 'about'>('general');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Workspace | null>(null);
  const [backedUp, setBackedUp] = useState(false);
  const backup = async () => {
    setBusy(true); setMessage('');
    try {
      downloadFile(JSON.stringify(await createBackup(props), null, 2), `omnisticky-backup-${new Date().toISOString().slice(0, 10)}.json`);
      setBackedUp(true); setMessage('Backup download started. Keep the file somewhere safe.');
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  };
  return <div ref={ref} role="dialog" aria-modal="true" aria-label="Settings" tabIndex={-1} className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-950/65 backdrop-blur-sm">
    <section className="w-full max-w-xl max-h-[90dvh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xl p-5 sm:p-7">
      <header className="flex justify-between items-center mb-5"><h2 className="text-xl font-bold">Settings</h2><button onClick={onClose} aria-label="Close settings" className="p-2"><X /></button></header>
      <nav className="flex flex-wrap gap-2 mb-5" aria-label="Settings sections">{(['general', 'data', 'about'] as const).map(value => <button key={value} aria-pressed={tab === value} onClick={() => setTab(value)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === value ? 'bg-amber-300 text-stone-950' : 'bg-stone-100 dark:bg-white/10'}`}>{value === 'data' ? 'Data & backups' : value === 'about' ? 'About & help' : 'General'}</button>)}</nav>
      {tab === 'general' && <div className="space-y-5 text-sm">
        <div className="flex justify-between items-center gap-3"><span>Appearance</span><button className="launch-button" onClick={onToggleTheme}>{theme === 'dark' ? 'Dark' : 'Light'}</button></div>
        <div className="flex justify-between items-center gap-3"><span>Completion sound</span><button className="launch-button" onClick={() => { safeStorage.setItem('omnisticky_audio_sound', String(!permissions.audioEnabled)); onUpdatePermissions(); if (!permissions.audioEnabled) playCompletionSound(); }}>{permissions.audioEnabled ? 'Enabled' : 'Muted'}</button></div>
        <p className="text-stone-500 dark:text-stone-400">Use the bell in the header to manage browser notification permission. Scheduled reminders are not available in this beta.</p>
        {window.omniStickyDesktop && <p>Closing the window keeps Omni Sticky in the system tray. Use the tray menu to enable launch at sign-in or quit the app.</p>}
      </div>}
      {tab === 'data' && <div className="space-y-5 text-sm">
        <p>Work is saved on this device in this browser profile. There is no cloud backup or automatic sync. Clearing site data or using a private browsing session can remove your work.</p>
        <div className="flex flex-wrap gap-2"><button disabled={busy} onClick={backup} className="launch-button"><Download size={16} />{busy ? 'Working…' : 'Download complete backup'}</button><button disabled={busy} className="launch-button" onClick={() => exportTasksMarkdown(props.tasks, props.areas, props.projects)}>Export notes as Markdown</button></div>
        <p className="text-xs text-stone-500 dark:text-stone-400">JSON includes notes, projects, groups, canvas items, connections, and uploaded photos. Markdown is a readable notes export. Appearance preferences are device-specific.</p>
        {getStorageError() && <div className="rounded-xl border border-amber-400 p-3"><p className="mb-2">Keep a copy of the original saved text before troubleshooting. Recovery files contain raw storage, including unreadable records and photo references; uploaded photo files are not included.</p><button className="launch-button" onClick={() => { try { downloadRecoveryData(); } catch { setMessage('Browser storage could not be read. Download a complete backup of the current session instead.'); } }}>Download raw recovery data</button></div>}
        <div className="border-t border-stone-200 dark:border-white/10 pt-4 space-y-3"><h3 className="font-bold">Restore a JSON backup</h3><p>Restoring replaces this workspace. Download your current backup first. Older task-only backups restore notes without projects or canvas items.</p>
          <input aria-label="Choose JSON backup" type="file" accept=".json,application/json" disabled={busy} onChange={async e => {
            const file = e.target.files?.[0]; e.target.value = ''; setPending(null); setMessage('');
            if (!file) return;
            if (file.size > 100 * 1024 * 1024) { setMessage('This backup exceeds the 100 MB import limit.'); return; }
            try { setPending(parseBackup(await file.text())); } catch (error) { setMessage((error as Error).message); }
          }} />
          {pending && <div className="rounded-2xl border border-amber-400 p-4 space-y-3"><p className="font-semibold">Replace with {pending.tasks.length} notes, {pending.projects.length} projects and {pending.canvasElements.length} canvas items?</p><p className="text-xs">This cannot be undone without your current backup.</p><div className="flex flex-wrap gap-2"><button disabled={busy || !backedUp} className="launch-button" onClick={async () => {
            setBusy(true);
            try { const restored = await prepareRestore(pending); onRestore(restored); setPending(null); setMessage('Workspace restored.'); }
            catch (error) { setMessage(`Restore failed: ${(error as Error).message}`); }
            finally { setBusy(false); }
          }}>Replace workspace</button><button className="launch-button" onClick={() => setPending(null)}>Cancel</button></div>{!backedUp && <p className="text-xs">Download a complete backup above to enable replacement.</p>}</div>}
        </div>
        <div className="border-t border-stone-200 dark:border-white/10 pt-4"><p className="mb-2">Storage protection: {permissions.persistentStorage ? 'granted by this browser' : 'not granted'}. Even protected data can be manually cleared.</p>{!permissions.persistentStorage && <button className="launch-button" onClick={async () => { const granted = await requestPersistentStorage(); onUpdatePermissions(); setMessage(granted ? 'Storage protection granted. Keep backups too.' : 'This browser did not grant protection. Keep regular backups.'); }}>Request storage protection</button>}</div>
      </div>}
      {tab === 'about' && <div className="space-y-4 text-sm"><h3 className="font-bold">Omni Sticky · Free beta</h3><p>A personal workspace for visual planning, notes, and focus. All currently available features are free. Payments, cloud sync, shared projects, and scheduled reminders are not available.</p><p><a className="underline" href="/help.html" target="_blank" rel="noreferrer">Getting started, keyboard shortcuts & feedback</a></p><p><a className="underline" href="/privacy.html" target="_blank" rel="noreferrer">Privacy, storage & limitations</a></p><p className="text-stone-500 dark:text-stone-400">Works best on a larger screen. The web and Windows versions have separate local workspaces; transfer work with a complete backup.</p></div>}
      {message && <p role="status" className="mt-4 rounded-xl bg-amber-100 text-amber-950 p-3 text-sm">{message}</p>}
    </section>
  </div>;
}
export const SettingsModal: React.FC<SettingsModalProps> = props => props.isOpen ? <SettingsBody {...props} /> : null;
