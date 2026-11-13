// Keep storage failures visible; never replace unreadable saved work with defaults.
const blockedKeys = new Set<string>();
let storageError = '';
export function reportStorageError(message: string) {
  storageError = message;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('omnisticky-storage-error'));
}
export function getStorageError() { return storageError; }
export function protectStorageKey(key: string) {
  blockedKeys.add(key);
  reportStorageError('Some saved data could not be read. Its original copy has been preserved. Export your current work before restoring a backup or clearing site data.');
}
export const safeStorage = {
  getItem(key: string): string | null {
    try { return localStorage.getItem(key); }
    catch { reportStorageError('Storage is unavailable. Changes will last only for this session. Export a backup before leaving.'); return null; }
  },
  setItem(key: string, value: string): boolean {
    if (blockedKeys.has(key)) return false;
    try { localStorage.setItem(key, value); return true; }
    catch { reportStorageError('Your latest changes could not be saved. Storage may be full or disabled. Export a backup now before closing this window.'); return false; }
  },
};
