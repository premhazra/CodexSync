// ─── Auto-Sync Toggle ─────────────────────────────────

import { useState, useEffect } from 'react';

export default function AutoSyncToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    chrome.storage.sync.get(['auto_sync_enabled'], (data) => {
      setEnabled(data.auto_sync_enabled !== false);
    });
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    chrome.storage.sync.set({ auto_sync_enabled: next });
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-between w-full p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/60 group hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="text-sm text-zinc-300">Auto-Sync</span>
      </div>
      {/* Toggle pill */}
      <div className={`relative w-9 h-5 rounded-full transition-colors ${enabled ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </div>
    </button>
  );
}
