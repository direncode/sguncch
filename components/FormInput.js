export function Input({ label, type = 'text', name, value, onChange, placeholder, required, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
          {label} {required && <span className="text-[#ff3b30]">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] placeholder-[#86868b] focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-0 outline-none transition"
      />
    </div>
  )
}

export function Select({ label, name, value, onChange, options, required, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
          {label} {required && <span className="text-[#ff3b30]">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] outline-none transition appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2386868b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '20px' }}
      >
        <option value="">Select...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

export function Textarea({ label, name, value, onChange, placeholder, required, rows = 4, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
          {label} {required && <span className="text-[#ff3b30]">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] placeholder-[#86868b] focus:ring-2 focus:ring-[#0071e3] outline-none transition resize-none"
      />
    </div>
  )
}

export function Button({ children, type = 'button', onClick, variant = 'primary', disabled, className = '' }) {
  const variants = {
    primary: 'bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-[0.98]',
    secondary: 'bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f]',
    danger: 'bg-[#ff3b30] hover:bg-[#ff453a] text-white',
    success: 'bg-[#34c759] hover:bg-[#30d158] text-white',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Checkbox({ label, name, checked, onChange, className = '' }) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3] focus:ring-offset-0"
      />
      <span className="text-sm text-[#1d1d1f]">{label}</span>
    </label>
  )
}
