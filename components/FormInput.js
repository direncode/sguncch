import { useState } from 'react'

export function Input({ label, type = 'text', name, value, onChange, placeholder, required, className = '', error, hint }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
          {label} {required && <span className="text-[#f85149]">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 bg-[#0d1117] border rounded-md text-[#f0f6fc] placeholder-[#6e7681] focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] focus:shadow-[0_0_20px_rgba(0,212,255,0.1)] outline-none transition font-mono text-sm ${error ? 'border-[#f85149]' : 'border-[#30363d]'}`}
      />
      {hint && <p className="text-[10px] text-[#6e7681] mt-1.5">{hint}</p>}
      {error && <p className="text-[10px] text-[#f85149] mt-1.5">{error}</p>}
    </div>
  )
}

export function Select({ label, name, value, onChange, options, required, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
          {label} {required && <span className="text-[#f85149]">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-md text-[#f0f6fc] focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition appearance-none text-sm"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236e7681' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 12px center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '20px'
        }}
      >
        <option value="" className="bg-[#0d1117]">Select...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#0d1117]">{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

export function Textarea({ label, name, value, onChange, placeholder, required, rows = 4, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
          {label} {required && <span className="text-[#f85149]">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-md text-[#f0f6fc] placeholder-[#6e7681] focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition resize-none text-sm"
      />
    </div>
  )
}

export function Button({ children, type = 'button', onClick, variant = 'primary', disabled, className = '', size = 'md' }) {
  const variants = {
    primary: 'bg-[#00d4ff] hover:bg-[#00bfea] text-[#0a0e14] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]',
    secondary: 'bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] border border-[#30363d] hover:border-[#484f58]',
    danger: 'bg-[#da3633] hover:bg-[#f85149] text-[#f0f6fc] hover:shadow-[0_0_20px_rgba(248,81,73,0.3)]',
    success: 'bg-[#238636] hover:bg-[#2ea043] text-[#f0f6fc] hover:shadow-[0_0_20px_rgba(63,185,80,0.3)]',
    ghost: 'bg-transparent hover:bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d]',
    outline: 'bg-transparent border border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2.5 text-xs',
    lg: 'px-6 py-3 text-sm',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md font-medium uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Checkbox({ label, name, checked, onChange, className = '' }) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer group ${className}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded bg-[#0d1117] border-[#30363d] text-[#00d4ff] focus:ring-[#00d4ff] focus:ring-offset-0 focus:ring-offset-[#0d1117]"
      />
      <span className="text-sm text-[#8b949e] group-hover:text-[#f0f6fc] transition">{label}</span>
    </label>
  )
}

// ==========================================
// PALANTIR-LEVEL ADVANCED COMPONENTS
// ==========================================

export function MetricCard({ label, value, change, trend, icon, color = 'cyan', sparklineData, subtitle }) {
  const colors = {
    cyan: { text: 'text-[#00d4ff]', bg: 'bg-[#00d4ff]/10', border: 'border-[#00d4ff]/30', glow: 'shadow-[0_0_30px_rgba(0,212,255,0.15)]' },
    green: { text: 'text-[#3fb950]', bg: 'bg-[#3fb950]/10', border: 'border-[#3fb950]/30', glow: 'shadow-[0_0_30px_rgba(63,185,80,0.15)]' },
    yellow: { text: 'text-[#d29922]', bg: 'bg-[#d29922]/10', border: 'border-[#d29922]/30', glow: 'shadow-[0_0_30px_rgba(210,153,34,0.15)]' },
    red: { text: 'text-[#f85149]', bg: 'bg-[#f85149]/10', border: 'border-[#f85149]/30', glow: 'shadow-[0_0_30px_rgba(248,81,73,0.15)]' },
    purple: { text: 'text-[#a371f7]', bg: 'bg-[#a371f7]/10', border: 'border-[#a371f7]/30', glow: 'shadow-[0_0_30px_rgba(163,113,247,0.15)]' },
    blue: { text: 'text-[#388bfd]', bg: 'bg-[#388bfd]/10', border: 'border-[#388bfd]/30', glow: 'shadow-[0_0_30px_rgba(56,139,253,0.15)]' },
  }
  const c = colors[color]

  return (
    <div className={`bg-[#161b22] border ${c.border} rounded-lg p-5 hover:${c.glow} transition-all relative overflow-hidden group`}>
      {/* Gradient accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${c.bg.replace('/10', '')} to-transparent`} />

      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">{label}</span>
        {icon && <span className={`text-lg ${c.text} opacity-60 group-hover:opacity-100 transition`}>{icon}</span>}
      </div>

      <p className={`text-3xl font-bold font-mono ${c.text} tracking-tight`}>{value}</p>
      {subtitle && <p className="text-xs text-[#6e7681] mt-1">{subtitle}</p>}

      {/* Mini sparkline visualization */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="flex items-end gap-[2px] h-6 mt-3">
          {sparklineData.map((v, i) => (
            <div key={i} className={`flex-1 ${c.bg} rounded-t`} style={{ height: `${(v / Math.max(...sparklineData)) * 100}%`, minHeight: '2px' }} />
          ))}
        </div>
      )}

      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          <span className={`text-xs font-semibold ${trend === 'up' ? 'text-[#3fb950]' : trend === 'down' ? 'text-[#f85149]' : 'text-[#6e7681]'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {change}
          </span>
          <span className="text-[10px] text-[#6e7681]">vs last period</span>
        </div>
      )}
    </div>
  )
}

export function StatusBadge({ status, children, pulse }) {
  const styles = {
    success: 'bg-[#3fb950]/10 border-[#3fb950] text-[#3fb950]',
    warning: 'bg-[#d29922]/10 border-[#d29922] text-[#d29922]',
    danger: 'bg-[#f85149]/10 border-[#f85149] text-[#f85149]',
    info: 'bg-[#00d4ff]/10 border-[#00d4ff] text-[#00d4ff]',
    default: 'bg-[#21262d] border-[#30363d] text-[#8b949e]',
    critical: 'bg-[#f85149]/20 border-[#f85149] text-[#f85149] animate-pulse',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border rounded ${styles[status] || styles.default}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'success' ? 'bg-[#3fb950]' :
        status === 'warning' ? 'bg-[#d29922]' :
        status === 'danger' || status === 'critical' ? 'bg-[#f85149]' :
        status === 'info' ? 'bg-[#00d4ff]' : 'bg-[#6e7681]'
      } ${pulse ? 'animate-pulse' : ''}`} />
      {children}
    </span>
  )
}

export function DataTable({ columns, data, onRowClick, sortable, searchable, emptyMessage = 'No data available' }) {
  return (
    <div className="overflow-x-auto border border-[#30363d] rounded-lg bg-[#0d1117]">
      <table className="w-full">
        <thead>
          <tr className="bg-[#161b22]">
            {columns.map((col, i) => (
              <th key={i} className={`text-left px-4 py-3 text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest border-b border-[#30363d] ${sortable ? 'cursor-pointer hover:text-[#f0f6fc]' : ''}`}>
                <div className="flex items-center gap-2">
                  {col.header}
                  {sortable && <span className="opacity-50">⇅</span>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className="border-b border-[#21262d] hover:bg-[#161b22] transition cursor-pointer group"
            >
              {columns.map((col, j) => (
                <td key={j} className="px-4 py-3 text-sm text-[#8b949e] group-hover:text-[#f0f6fc] transition">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-[#6e7681]">{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export function ProgressBar({ value, max = 100, color = 'cyan', showLabel = true, size = 'md', animated = false }) {
  const percentage = Math.min((value / max) * 100, 100)
  const colors = {
    cyan: 'from-[#00d4ff] to-[#388bfd]',
    green: 'from-[#3fb950] to-[#2ea043]',
    yellow: 'from-[#d29922] to-[#db6d28]',
    red: 'from-[#db6d28] to-[#f85149]',
    purple: 'from-[#a371f7] to-[#8957e5]',
    gradient: 'from-[#00d4ff] via-[#a371f7] to-[#f85149]',
  }
  const sizes = {
    xs: 'h-0.5',
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-[10px] text-[#6e7681] mb-1.5 font-mono">
          <span>{value.toLocaleString()}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full bg-[#21262d] rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-700 ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function LiveIndicator({ label = 'Live', variant = 'success' }) {
  const colors = {
    success: 'bg-[#3fb950]/10 border-[#3fb950] text-[#3fb950]',
    warning: 'bg-[#d29922]/10 border-[#d29922] text-[#d29922]',
    danger: 'bg-[#f85149]/10 border-[#f85149] text-[#f85149]',
  }
  const dotColors = {
    success: 'bg-[#3fb950] shadow-[0_0_8px_#3fb950]',
    warning: 'bg-[#d29922] shadow-[0_0_8px_#d29922]',
    danger: 'bg-[#f85149] shadow-[0_0_8px_#f85149]',
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 border rounded text-[10px] font-semibold uppercase tracking-wider ${colors[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColors[variant]}`} />
      {label}
    </div>
  )
}

// Donut Chart Component
export function DonutChart({ data, size = 120, thickness = 12, centerLabel, centerValue }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  let cumulativePercentage = 0

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#21262d" strokeWidth={thickness * 0.3} />
        {data.map((item, i) => {
          const percentage = (item.value / total) * 100
          const strokeDasharray = `${percentage} ${100 - percentage}`
          const strokeDashoffset = -cumulativePercentage
          cumulativePercentage += percentage
          return (
            <circle
              key={i}
              cx="18"
              cy="18"
              r="15.91549430918954"
              fill="transparent"
              stroke={item.color}
              strokeWidth={thickness * 0.3}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          )
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="text-xl font-bold font-mono text-[#f0f6fc]">{centerValue}</span>}
          {centerLabel && <span className="text-[10px] text-[#6e7681] uppercase tracking-wider">{centerLabel}</span>}
        </div>
      )}
    </div>
  )
}

// Horizontal Bar Chart
export function HorizontalBarChart({ data, maxValue, showValues = true }) {
  const max = maxValue || Math.max(...data.map(d => d.value))
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[#8b949e]">{item.label}</span>
            {showValues && <span className="text-xs font-mono text-[#6e7681]">{item.value.toLocaleString()}</span>}
          </div>
          <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color || '#00d4ff' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Activity Timeline
export function ActivityTimeline({ items, maxItems = 10 }) {
  const displayItems = items.slice(0, maxItems)
  return (
    <div className="space-y-0">
      {displayItems.map((item, i) => (
        <div key={item.id || i} className="flex gap-3 py-3 border-b border-[#21262d] last:border-0 hover:bg-[#161b22]/50 transition px-2 -mx-2 rounded">
          <div className="flex flex-col items-center">
            <div className={`w-2 h-2 rounded-full ${item.color || 'bg-[#00d4ff]'} shrink-0 mt-1.5`} />
            {i < displayItems.length - 1 && <div className="w-px h-full bg-[#30363d] my-1" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#f0f6fc]">{item.title}</p>
            {item.description && <p className="text-xs text-[#6e7681] mt-0.5 truncate">{item.description}</p>}
            <p className="text-[10px] text-[#6e7681] font-mono mt-1">{item.time}</p>
          </div>
          {item.badge && (
            <StatusBadge status={item.badgeStatus || 'default'}>{item.badge}</StatusBadge>
          )}
        </div>
      ))}
    </div>
  )
}

// Alert Banner
export function AlertBanner({ type = 'info', title, message, onDismiss, action, actionLabel }) {
  const styles = {
    info: 'bg-[#00d4ff]/10 border-[#00d4ff]/50 text-[#00d4ff]',
    success: 'bg-[#3fb950]/10 border-[#3fb950]/50 text-[#3fb950]',
    warning: 'bg-[#d29922]/10 border-[#d29922]/50 text-[#d29922]',
    danger: 'bg-[#f85149]/10 border-[#f85149]/50 text-[#f85149]',
    critical: 'bg-[#f85149]/20 border-[#f85149] text-[#f85149] animate-pulse',
  }

  return (
    <div className={`border rounded-lg p-4 ${styles[type]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          {message && <p className="text-xs opacity-80 mt-1">{message}</p>}
        </div>
        <div className="flex items-center gap-2 ml-4">
          {action && (
            <button onClick={action} className="text-xs font-medium underline hover:no-underline">
              {actionLabel || 'Action'}
            </button>
          )}
          {onDismiss && (
            <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition">×</button>
          )}
        </div>
      </div>
    </div>
  )
}

// Stat Grid for quick overview
export function StatGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#30363d] rounded-lg overflow-hidden">
      {stats.map((stat, i) => (
        <div key={i} className="bg-[#161b22] p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#6e7681] uppercase tracking-widest">{stat.label}</span>
            {stat.icon && <span className="text-sm opacity-60">{stat.icon}</span>}
          </div>
          <p className={`text-2xl font-bold font-mono ${stat.color || 'text-[#f0f6fc]'}`}>{stat.value}</p>
          {stat.change && (
            <p className={`text-[10px] mt-1 ${stat.changeType === 'positive' ? 'text-[#3fb950]' : stat.changeType === 'negative' ? 'text-[#f85149]' : 'text-[#6e7681]'}`}>
              {stat.change}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// Panel Component for dashboard sections
export function Panel({ title, subtitle, children, actions, className = '', collapsible = false, defaultCollapsed = false, badge }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <div className={`bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#30363d] bg-[#0d1117]/50">
        <div className="flex items-center gap-3">
          {collapsible && (
            <button onClick={() => setCollapsed(!collapsed)} className="text-[#6e7681] hover:text-[#f0f6fc] transition">
              <span className={`inline-block transition-transform ${collapsed ? '' : 'rotate-90'}`}>▶</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#f0f6fc]">{title}</h3>
              {badge && <StatusBadge status={badge.status}>{badge.text}</StatusBadge>}
            </div>
            {subtitle && <p className="text-[10px] text-[#6e7681] mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {!collapsed && <div className="p-5">{children}</div>}
    </div>
  )
}

// Search Input with advanced features
export function SearchInput({ value, onChange, placeholder = 'Search...', onClear, filters }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-[#6e7681]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] outline-none transition text-sm"
      />
      {value && onClear && (
        <button onClick={onClear} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6e7681] hover:text-[#f0f6fc] transition">
          ×
        </button>
      )}
    </div>
  )
}

// Tab Navigation
export function TabNav({ tabs, activeTab, onChange, variant = 'default' }) {
  const variants = {
    default: {
      container: 'flex gap-0 border-b border-[#30363d]',
      tab: (active) => `px-5 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-[1px] ${active ? 'text-[#00d4ff] border-[#00d4ff]' : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc] hover:border-[#30363d]'}`,
    },
    pills: {
      container: 'flex gap-2 p-1 bg-[#0d1117] rounded-lg',
      tab: (active) => `px-4 py-2 text-sm font-medium rounded-md transition-all ${active ? 'bg-[#21262d] text-[#00d4ff]' : 'text-[#8b949e] hover:text-[#f0f6fc]'}`,
    },
  }
  const style = variants[variant]

  return (
    <div className={style.container}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={style.tab(activeTab === tab.id)}
        >
          <span className="flex items-center gap-2">
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${activeTab === tab.id ? 'bg-[#00d4ff]/20 text-[#00d4ff]' : 'bg-[#21262d] text-[#6e7681]'}`}>
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  )
}

// Tooltip wrapper
export function Tooltip({ children, content }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#f0f6fc] whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#30363d]" />
      </div>
    </div>
  )
}

// Command Palette Trigger (for keyboard shortcuts display)
export function KeyboardShortcut({ keys }) {
  return (
    <div className="inline-flex items-center gap-1">
      {keys.map((key, i) => (
        <span key={i}>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#21262d] border border-[#30363d] rounded text-[#8b949e]">
            {key}
          </kbd>
          {i < keys.length - 1 && <span className="text-[#6e7681] mx-0.5">+</span>}
        </span>
      ))}
    </div>
  )
}
