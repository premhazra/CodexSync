// ─── Logo Component (uses actual logo image) ─────────
export default function Logo({ size = 44, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/logo192.png"
        alt="CodexSync"
        width={size}
        height={size}
        className="rounded-lg"
      />
      <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
        CodexSync
      </span>
    </div>
  );
}
