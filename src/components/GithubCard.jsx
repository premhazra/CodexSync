// ─── GitHub Card (profile info) ───────────────────────

export default function GithubCard({ username, repo }) {
  return (
    <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/60 flex items-center gap-3 animate-slide-up">
      {/* Avatar */}
      <img
        src={`https://github.com/${username}.png?size=80`}
        alt={username}
        className="w-10 h-10 rounded-full ring-2 ring-indigo-500/30"
      />
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-100 truncate">{username}</p>
        <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          {repo || 'No repo selected'}
        </p>
      </div>
      {/* Status dot */}
      <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20 flex-shrink-0" />
    </div>
  );
}
