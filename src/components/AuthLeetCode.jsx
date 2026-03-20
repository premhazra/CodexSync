// ─── Auth LeetCode Step ───────────────────────────────

import OnboardingLayout from './OnboardingLayout.jsx';

export default function AuthLeetCode({ onComplete }) {
  function handleVerify() {
    // Check if the user has a LeetCode session cookie
    chrome.cookies.get(
      { url: 'https://leetcode.com', name: 'LEETCODE_SESSION' },
      (cookie) => {
        if (cookie && cookie.value) {
          chrome.storage.sync.set({ leetcode_authenticated: true });
          onComplete();
        } else {
          // Open LeetCode login page
          chrome.tabs.create({ url: 'https://leetcode.com/accounts/login/' });
          // Poll for the cookie
          const interval = setInterval(() => {
            chrome.cookies.get(
              { url: 'https://leetcode.com', name: 'LEETCODE_SESSION' },
              (c) => {
                if (c && c.value) {
                  clearInterval(interval);
                  chrome.storage.sync.set({ leetcode_authenticated: true });
                  onComplete();
                }
              }
            );
          }, 2000);
          // Stop polling after 2 minutes
          setTimeout(() => clearInterval(interval), 120000);
        }
      }
    );
  }

  return (
    <OnboardingLayout step={2} totalSteps={3} title="Connect LeetCode">
      <div className="space-y-4">
        <p className="text-sm text-zinc-400 leading-relaxed">
          Log in to LeetCode so CodexSync can detect your accepted submissions.
          We read your session cookie — <span className="text-indigo-400 font-medium">no password stored</span>.
        </p>

        <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">🔒</span>
            <span className="text-xs font-semibold text-violet-300">Privacy</span>
          </div>
          <p className="text-xs text-violet-200/80 ml-6">
            Your session is only used locally. Nothing is sent to any external server.
          </p>
        </div>

        <button
          onClick={handleVerify}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold
                     hover:from-amber-400 hover:to-orange-400 transition-all active:scale-[0.98]"
        >
          Verify LeetCode Login
        </button>

        <button
          onClick={onComplete}
          className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          Skip for now →
        </button>
      </div>
    </OnboardingLayout>
  );
}
