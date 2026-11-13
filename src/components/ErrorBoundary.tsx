import React from 'react';
import { downloadFile } from '../utils/backup';
export class ErrorBoundary extends React.Component<React.PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="p-8 max-w-xl mx-auto"><h1 className="text-2xl font-bold mb-3">The workspace could not be displayed</h1><p className="mb-4">Your saved data has not been cleared. Download a recovery copy before reloading. If the problem continues, keep this file for recovery.</p><button className="launch-button mr-3" onClick={() => {
      const saved: Record<string, string> = {};
      try { for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i)!; if (key.startsWith('omnisticky_')) saved[key] = localStorage.getItem(key)!; } } catch { /* storage unavailable */ }
      downloadFile(JSON.stringify({ format: 'omnisticky-recovery', saved }, null, 2), 'omnisticky-recovery.json');
    }}>Download recovery data</button><button className="launch-button" onClick={() => location.reload()}>Reload</button><p className="mt-4 text-sm">Recovery data contains local text and image references. Photos stored separately on this device are not included.</p></main>;
  }
}
