// ─── Select Repository Step ───────────────────────────

import { useState } from 'react';
import OnboardingLayout from './OnboardingLayout.jsx';
import GithubHandler from '../handlers/githubHandler.js';

const github = new GithubHandler();

export default function SelectRepo({ onComplete }) {
  const [repoName, setRepoName] = useState('leetcode-solutions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleContinue() {
    if (!repoName.trim()) {
      setError('Please enter a repository name.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await github.ensureCredentials();

      const exists = await github.checkIfRepoExists(repoName.trim());
      if (!exists) {
        await github.createRepo(repoName.trim());
      }

      await chrome.storage.sync.set({ github_codexsync_repo: repoName.trim() });
      onComplete();
    } catch (err) {
      setError(err.message || 'Failed to verify repository.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingLayout step={3} totalSteps={3} title="Choose Repository">
      <div className="space-y-4">
        <p className="text-sm text-zinc-400 leading-relaxed">
          Enter the name of the GitHub repository where solutions will be synced.
          We'll create it if it doesn't exist.
        </p>

        <label className="block">
          <span className="text-xs text-zinc-400 font-medium">Repository Name</span>
          <input
            type="text"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder="leetcode-solutions"
            className="mt-1 w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200
                       placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
        </label>

        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}

        <div className="p-3 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
          <p className="text-xs text-zinc-500">
            💡 Repo will appear at{' '}
            <span className="text-zinc-300">github.com/{'<you>'}/<span className="text-indigo-400">{repoName || '...'}</span></span>
          </p>
        </div>

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold
                     hover:from-indigo-400 hover:to-violet-400 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {loading ? 'Setting up…' : 'Complete Setup'}
        </button>
      </div>
    </OnboardingLayout>
  );
}
