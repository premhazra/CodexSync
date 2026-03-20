// ─── Onboarding Layout (shared wrapper for auth steps) ─

import Logo from './Logo.jsx';

export default function OnboardingLayout({ step, totalSteps, title, children }) {
  return (
    <div className="flex flex-col min-h-[520px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <Logo size={38} />
        <span className="text-xs text-zinc-500 font-medium">
          Step {step} of {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mx-5 mb-4 h-1 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {/* Title */}
      {title && (
        <h2 className="px-5 mb-4 text-base font-semibold text-zinc-100">{title}</h2>
      )}

      {/* Content */}
      <div className="flex-1 px-5 pb-5">{children}</div>
    </div>
  );
}
