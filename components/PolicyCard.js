import PhaseIndicator from './PhaseIndicator'
import { getLatestUpdate, getPhaseLabel } from '../lib/data'

export default function PolicyCard({ policy, department, showDepartment = false }) {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    planned: 'bg-gray-100 text-gray-800',
  }

  const latestUpdate = getLatestUpdate(policy)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          {showDepartment && department && (
            <span className="text-xs text-gray-500 mb-1 block">{department.icon} {department.name}</span>
          )}
          <h3 className="font-semibold text-[#13294B]">{policy.title}</h3>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[policy.status]}`}>
          {policy.status === 'in_progress' ? 'In Progress' : policy.status === 'completed' ? 'Completed' : 'Planned'}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-3">{policy.description}</p>

      {/* Phase indicator */}
      <div className="mb-3">
        <PhaseIndicator currentPhase={policy.phase || 1} compact />
      </div>

      {/* Impact summary — what this means for students */}
      {policy.impactSummary && (
        <div className="mb-3 px-3 py-2 bg-blue-50 border-l-2 border-[#4B9CD3] rounded-r">
          <p className="text-xs text-gray-500 font-mono mb-0.5">What this means for you</p>
          <p className="text-sm text-[#13294B]">{policy.impactSummary}</p>
        </div>
      )}

      {/* Latest update */}
      {latestUpdate && (
        <div className="mb-3 text-xs text-gray-500">
          <span className="font-medium text-gray-700">Latest:</span>{' '}
          {latestUpdate.title}
          {latestUpdate.date && (
            <span className="ml-1">
              — {new Date(latestUpdate.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      )}

      {/* Outcomes */}
      {policy.outcomes && Object.keys(policy.outcomes).length > 0 && (
        <div className="flex gap-4 text-xs text-gray-500 mb-3">
          {Object.entries(policy.outcomes)
            .filter(([k, v]) => v && typeof v !== 'object')
            .slice(0, 3)
            .map(([key, value]) => (
              <span key={key}>
                <span className="font-medium text-gray-700">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                {' '}{key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
            ))}
        </div>
      )}

      {/* Features tags */}
      {policy.digitalFeatures && (
        <div className="flex flex-wrap gap-1">
          {policy.digitalFeatures.slice(0, 3).map(feature => (
            <span key={feature} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs">
              {feature.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
