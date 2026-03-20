// ─── Dashboard (main view after onboarding) ──────────

import { useState, useEffect } from 'react';
import Logo from './Logo.jsx';
import StatusIndicator from './StatusIndicator.jsx';
import GithubCard from './GithubCard.jsx';
import AutoSyncToggle from './AutoSyncToggle.jsx';
import SyncHistory from './SyncHistory.jsx';
import Footer from './Footer.jsx';
import { getTotalNumberOfStreaks, formatProblemsPerDay, generateTitle } from '../utils/streak.js';

export default function Dashboard({ onOpenSettings }) {
  const [username, setUsername] = useState('');
  const [repo, setRepo] = useState('');
  const [status, setStatus] = useState('idle');
  const [streak, setStreak] = useState(0);
  const [streakTitle, setStreakTitle] = useState('');
  const [streakMessage, setStreakMessage] = useState('');
  const [totalSynced, setTotalSynced] = useState(0);

  useEffect(() => {
    loadData();
    const listener = () => loadData();
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  async function loadData() {
    const syncData = await chrome.storage.sync.get([
      'github_username',
      'github_codexsync_repo',
      'github_codexsync_token',
    ]);
    const localData = await chrome.storage.local.get(['sync_history', 'problems_solved']);

    setUsername(syncData.github_username || '');
    setRepo(syncData.github_codexsync_repo || '');
    setStatus(syncData.github_codexsync_token ? 'connected' : 'idle');

    const history = localData.sync_history || [];
    setTotalSynced(history.filter((h) => h.status === 'success').length);

    const problems = localData.problems_solved || [];
    const perDay = formatProblemsPerDay(problems);
    const s = getTotalNumberOfStreaks(perDay);
    setStreak(s);
    const [title, msg] = generateTitle(s);
    setStreakTitle(title);
    setStreakMessage(msg);
  }

  return (
    <div className="flex flex-col min-h-[520px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <Logo size={38} />
        <div className="flex items-center gap-3">
          <StatusIndicator status={status} />
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            title="Settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-3 space-y-3 overflow-y-auto">
        {/* GitHub Card */}
        {username && <GithubCard username={username} repo={repo} />}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Streak */}
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔥</span>
              <span className="text-xl font-bold text-zinc-100">{streak}</span>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Day Streak</p>
            {streakTitle && (
              <p className="text-[10px] text-indigo-400 mt-0.5 truncate" title={streakMessage}>
                {streakTitle}
              </p>
            )}
          </div>
          {/* Total Synced */}
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📦</span>
              <span className="text-xl font-bold text-zinc-100">{totalSynced}</span>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Synced</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">All time</p>
          </div>
        </div>

        {/* Auto-Sync */}
        <AutoSyncToggle />

        {/* History */}
        <SyncHistory />
      </div>

      <Footer />
    </div>
  );
}
