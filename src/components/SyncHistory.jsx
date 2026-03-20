// ─── Sync History List ────────────────────────────────

import { useState, useEffect } from 'react';

const DIFF_COLORS = { Easy: 'text-emerald-400', Medium: 'text-amber-400', Hard: 'text-red-400' };

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function SyncHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(['sync_history'], (data) => {
      setHistory(data.sync_history || []);
    });
    const listener = (changes) => {
      if (changes.sync_history) setHistory(changes.sync_history.newValue || []);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  if (history.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/60 text-center">
        <p className="text-xs text-zinc-500">No synced solutions yet.</p>
        <p className="text-[10px] text-zinc-600 mt-1">Solve a problem on LeetCode or GFG to get started!</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-zinc-900/80 border border-zinc-800/60 overflow-hidden">
      <div className="px-3 py-2 border-b border-zinc-800/60 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400">Recent Syncs</span>
        <span className="text-[10px] text-zinc-600">{history.length} total</span>
      </div>
      <div className="max-h-[180px] overflow-y-auto divide-y divide-zinc-800/40">
        {history.slice(0, 10).map((item, i) => (
          <div key={i} className="px-3 py-2 flex items-center gap-2 hover:bg-zinc-800/30 transition-colors">
            <span className={`text-[10px] font-medium w-12 ${item.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.status === 'success' ? '✓ Synced' : '✕ Failed'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-200 truncate">{item.title}</p>
              <p className="text-[10px] text-zinc-500">
                <span className={DIFF_COLORS[item.difficulty] || 'text-zinc-500'}>{item.difficulty}</span>
                {' · '}
                {item.source}
                {' · '}
                {item.language}
              </p>
            </div>
            <span className="text-[10px] text-zinc-600 whitespace-nowrap">{timeAgo(item.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
