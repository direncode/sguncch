import Link from 'next/link'

export default function PolicyCard({ policy, department, showDepartment = false }) {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    planned: 'bg-gray-100 text-gray-800',
  }

  const priorityColors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-gray-500',
  }

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

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{policy.progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4B9CD3] rounded-full transition-all"
            style={{ width: `${policy.progress}%` }}
          />
        </div>
      </div>

      {/* Metrics preview */}
      {policy.metrics && (
        <div className="flex gap-4 text-xs text-gray-500 mb-3">
          {Object.entries(policy.metrics).slice(0, 3).map(([key, value]) => (
            <span key={key}>
              <span className="font-medium text-gray-700">{typeof value === 'number' ? value.toLocaleString() : value}</span>
              {' '}{key}
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
