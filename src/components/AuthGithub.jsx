// ─── Auth GitHub Step ─────────────────────────────────

import OnboardingLayout from './OnboardingLayout.jsx';
import { GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI } from '../constants.js';

export default function AuthGithub({ onComplete }) {
  function handleConnect() {
    const scope = 'repo';
    const authUrl =
      `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}` +
      `&scope=${scope}`;
    chrome.tabs.create({ url: authUrl });

    // Listen for the OAuth callback
    const listener = (changes) => {
      if (changes.github_codexsync_token?.newValue) {
        chrome.storage.onChanged.removeListener(listener);
        onComplete();
      }
    };
    chrome.storage.onChanged.addListener(listener);
  }

  return (
    <OnboardingLayout step={1} totalSteps={3} title="Connect GitHub">
      <div className="space-y-4">
        <p className="text-sm text-zinc-400 leading-relaxed">
          Grant CodexSync permission to push solutions to your GitHub account.
          We only request <span className="text-indigo-400 font-medium">repo</span> scope.
        </p>

        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold text-indigo-300">What we access</span>
          </div>
          <ul className="text-xs text-indigo-200/80 space-y-0.5 ml-6">
            <li>• Read/write to selected repository</li>
            <li>• Your public profile info</li>
          </ul>
        </div>

        <button
          onClick={handleConnect}
          className="w-full py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm font-semibold
                     flex items-center justify-center gap-2
                     hover:bg-zinc-700 hover:border-zinc-600 transition-all active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Connect with GitHub
        </button>
      </div>
    </OnboardingLayout>
  );
}
