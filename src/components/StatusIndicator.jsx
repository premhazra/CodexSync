// ─── Status Indicator (dot + label) ───────────────────

const STATUS_MAP = {
  connected: { color: 'bg-emerald-400', label: 'Connected', ring: 'ring-emerald-400/20' },
  syncing:   { color: 'bg-amber-400 animate-pulse-dot', label: 'Syncing…', ring: 'ring-amber-400/20' },
  error:     { color: 'bg-red-400', label: 'Error', ring: 'ring-red-400/20' },
  idle:      { color: 'bg-zinc-500', label: 'Not connected', ring: 'ring-zinc-500/20' },
};

export default function StatusIndicator({ status = 'idle' }) {
  const s = STATUS_MAP[status] || STATUS_MAP.idle;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
      <span className={`w-2 h-2 rounded-full ${s.color} ring-4 ${s.ring}`} />
      {s.label}
    </span>
  );
}
