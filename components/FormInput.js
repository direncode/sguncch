export function Input({ label, type = 'text', name, value, onChange, placeholder, required, className = '' }) {
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
        className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-md text-[#f0f6fc] placeholder-[#6e7681] focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] focus:shadow-[0_0_20px_rgba(0,212,255,0.1)] outline-none transition font-mono text-sm"
      />
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

export function Button({ children, type = 'button', onClick, variant = 'primary', disabled, className = '' }) {
  const variants = {
    primary: 'bg-[#00d4ff] hover:bg-[#00bfea] text-[#0a0e14] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]',
    secondary: 'bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] border border-[#30363d] hover:border-[#484f58]',
    danger: 'bg-[#da3633] hover:bg-[#f85149] text-[#f0f6fc] hover:shadow-[0_0_20px_rgba(248,81,73,0.3)]',
    success: 'bg-[#238636] hover:bg-[#2ea043] text-[#f0f6fc] hover:shadow-[0_0_20px_rgba(63,185,80,0.3)]',
    ghost: 'bg-transparent hover:bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-md font-medium text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
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

// Additional Enterprise Components

export function MetricCard({ label, value, change, trend, icon, color = 'cyan' }) {
  const colors = {
    cyan: { text: 'text-[#00d4ff]', bg: 'bg-[#00d4ff]/10', border: 'border-[#00d4ff]/30' },
    green: { text: 'text-[#3fb950]', bg: 'bg-[#3fb950]/10', border: 'border-[#3fb950]/30' },
    yellow: { text: 'text-[#d29922]', bg: 'bg-[#d29922]/10', border: 'border-[#d29922]/30' },
    red: { text: 'text-[#f85149]', bg: 'bg-[#f85149]/10', border: 'border-[#f85149]/30' },
    purple: { text: 'text-[#a371f7]', bg: 'bg-[#a371f7]/10', border: 'border-[#a371f7]/30' },
    blue: { text: 'text-[#388bfd]', bg: 'bg-[#388bfd]/10', border: 'border-[#388bfd]/30' },
  }
  const c = colors[color]

  return (
    <div className={`bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:${c.border} transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">{label}</span>
        {icon && <span className={`text-lg ${c.text}`}>{icon}</span>}
      </div>
      <p className={`text-3xl font-bold font-mono ${c.text} tracking-tight`}>{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          <span className={trend === 'up' ? 'text-[#3fb950]' : trend === 'down' ? 'text-[#f85149]' : 'text-[#6e7681]'}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
          <span className="text-xs text-[#8b949e]">{change}</span>
        </div>
      )}
    </div>
  )
}

export function StatusBadge({ status, children }) {
  const styles = {
    success: 'bg-[#3fb950]/10 border-[#3fb950] text-[#3fb950]',
    warning: 'bg-[#d29922]/10 border-[#d29922] text-[#d29922]',
    danger: 'bg-[#f85149]/10 border-[#f85149] text-[#f85149]',
    info: 'bg-[#00d4ff]/10 border-[#00d4ff] text-[#00d4ff]',
    default: 'bg-[#21262d] border-[#30363d] text-[#8b949e]',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border rounded ${styles[status] || styles.default}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'success' ? 'bg-[#3fb950]' :
        status === 'warning' ? 'bg-[#d29922]' :
        status === 'danger' ? 'bg-[#f85149]' :
        status === 'info' ? 'bg-[#00d4ff]' : 'bg-[#6e7681]'
      }`} />
      {children}
    </span>
  )
}

export function DataTable({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto border border-[#30363d] rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="bg-[#0d1117]">
            {columns.map((col, i) => (
              <th key={i} className="text-left px-4 py-3 text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest border-b border-[#30363d]">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className="border-b border-[#21262d] hover:bg-[#161b22] transition cursor-pointer"
            >
              {columns.map((col, j) => (
                <td key={j} className="px-4 py-3 text-sm text-[#8b949e]">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ProgressBar({ value, max = 100, color = 'cyan', showLabel = true, size = 'md' }) {
  const percentage = Math.min((value / max) * 100, 100)
  const colors = {
    cyan: 'from-[#00d4ff] to-[#388bfd]',
    green: 'from-[#3fb950] to-[#2ea043]',
    yellow: 'from-[#d29922] to-[#db6d28]',
    red: 'from-[#db6d28] to-[#f85149]',
  }
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
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
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function LiveIndicator({ label = 'Live' }) {
  return (
    <div className="inline-flex items-center gap-2 px-2 py-1 bg-[#3fb950]/10 border border-[#3fb950] rounded text-[10px] font-semibold text-[#3fb950] uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse shadow-[0_0_8px_#3fb950]" />
      {label}
    </div>
  )
}
