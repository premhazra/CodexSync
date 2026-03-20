// ─── Error Message Banner ─────────────────────────────

export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="mx-5 mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 animate-slide-up">
      <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-xs text-red-300 flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-300 text-xs font-bold">
          ✕
        </button>
      )}
    </div>
  );
}
