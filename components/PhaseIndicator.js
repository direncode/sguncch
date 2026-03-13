import { POLICY_PHASES } from '../lib/data'

/**
 * PhaseIndicator — 6-phase stepper showing policy lifecycle progress
 *
 * Props:
 *   currentPhase: number (1-6)
 *   compact: boolean (default false) — small inline version
 *   showLabels: boolean (default true)
 */
export default function PhaseIndicator({ currentPhase = 1, compact = false, showLabels = true }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {POLICY_PHASES.map((phase) => (
          <div
            key={phase.number}
            className={`rounded-full transition-all ${
              phase.number <= currentPhase
                ? phase.number === currentPhase
                  ? 'bg-[#4B9CD3] w-3 h-3'
                  : 'bg-[#4B9CD3]/50 w-2 h-2'
                : 'bg-gray-600 w-2 h-2'
            }`}
            title={`Phase ${phase.number}: ${phase.label}`}
          />
        ))}
        <span className="ml-2 text-xs text-gray-400 font-mono">
          {POLICY_PHASES.find(p => p.number === currentPhase)?.shortLabel || 'Research'}
        </span>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-700" />
        <div
          className="absolute top-3 left-0 h-0.5 bg-[#4B9CD3] transition-all duration-500"
          style={{ width: `${((currentPhase - 1) / 5) * 100}%` }}
        />

        {POLICY_PHASES.map((phase) => {
          const isComplete = phase.number < currentPhase
          const isCurrent = phase.number === currentPhase
          const isFuture = phase.number > currentPhase

          return (
            <div key={phase.number} className="flex flex-col items-center relative z-10">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isComplete
                    ? 'bg-[#4B9CD3] text-white'
                    : isCurrent
                      ? 'bg-[#4B9CD3] text-white ring-2 ring-[#4B9CD3]/40 ring-offset-2 ring-offset-gray-900'
                      : 'bg-gray-700 text-gray-500'
                }`}
              >
                {isComplete ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  phase.number
                )}
              </div>
              {showLabels && (
                <span
                  className={`mt-2 text-[10px] font-mono tracking-wide text-center max-w-[70px] leading-tight ${
                    isCurrent ? 'text-[#4B9CD3] font-semibold' : isComplete ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {phase.shortLabel}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
