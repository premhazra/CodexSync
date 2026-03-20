// ─── Settings Panel ───────────────────────────────────

import { useState, useEffect } from 'react';

export default function SettingsPanel({ onClose, onReset }) {
  const [repo, setRepo] = useState('');
  const [subdir, setSubdir] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(['github_codexsync_repo', 'github_codexsync_subdirectory'], (data) => {
      setRepo(data.github_codexsync_repo || '');
      setSubdir(data.github_codexsync_subdirectory || '');
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    await chrome.storage.sync.set({
      github_codexsync_repo: repo.trim(),
      github_codexsync_subdirectory: subdir.trim(),
    });
    setSaving(false);
    onClose();
  }

  async function handleReset() {
    if (!confirm('This will clear all CodexSync data. Continue?')) return;
    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
    onReset();
  }

  return (
    <div className="flex flex-col min-h-[520px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-800/60">
        <h2 className="text-sm font-semibold text-zinc-100">Settings</h2>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xs font-bold transition-colors">
          ✕
        </button>
      </div>

      <div className="flex-1 px-5 py-4 space-y-4">
        {/* Repo */}
        <label className="block">
          <span className="text-xs text-zinc-400 font-medium">Repository Name</span>
          <input
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="my-solutions"
            className="mt-1 w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200
                       placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
        </label>

        {/* Subdirectory */}
        <label className="block">
          <span className="text-xs text-zinc-400 font-medium">Subdirectory (optional)</span>
          <input
            type="text"
            value={subdir}
            onChange={(e) => setSubdir(e.target.value)}
            placeholder="solutions"
            className="mt-1 w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200
                       placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
          <span className="text-[10px] text-zinc-600 mt-1 block">
            Files will be saved under this folder in your repo.
          </span>
        </label>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 rounded-lg bg-indigo-500 text-white text-sm font-semibold
                     hover:bg-indigo-400 disabled:opacity-50 transition-all"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>

        {/* Divider */}
        <div className="border-t border-zinc-800/60 pt-4">
          <h3 className="text-xs font-semibold text-zinc-400 mb-2">Danger Zone</h3>
          <button
            onClick={handleReset}
            className="w-full py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold
                       hover:bg-red-500/20 transition-all"
          >
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}
