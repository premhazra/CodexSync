// ─── Welcome Screen (first-time splash) ──────────────

import Logo from './Logo.jsx';

export default function WelcomeScreen({ onGetStarted }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[520px] px-8 text-center animate-fade-in">
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
        <Logo size={64} />
      </div>

      <h1 className="text-xl font-bold text-zinc-100 mb-2">
        Welcome to CodexSync
      </h1>
      <p className="text-sm text-zinc-400 leading-relaxed mb-8 max-w-[280px]">
        Automatically sync your accepted solutions from LeetCode &amp; GeeksforGeeks
        to GitHub — effortlessly.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-[260px]">
        <button
          onClick={onGetStarted}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold
                     hover:from-indigo-400 hover:to-violet-400 transition-all active:scale-[0.98]"
        >
          Get Started
        </button>
        <p className="text-[11px] text-zinc-600">
          Connect GitHub in under 30 seconds
        </p>
      </div>
    </div>
  );
}
