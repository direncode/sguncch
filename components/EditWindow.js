import { useState, useEffect, useCallback, useRef } from 'react'
import { Button, StatusBadge, LiveIndicator } from './FormInput'

// ==========================================
// EDIT WINDOW - Seamless Content Editor
// ==========================================

export function EditWindow({ isOpen, onClose, title, subtitle, type, data, onSave, children }) {
  const [editedData, setEditedData] = useState(data)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'saving', 'saved', 'error'
  const [lastSaved, setLastSaved] = useState(null)
  const autoSaveTimeout = useRef(null)

  // Reset when data changes
  useEffect(() => {
    setEditedData(data)
    setIsDirty(false)
    setSaveStatus(null)
  }, [data])

  // Auto-save with debounce
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current)
    }
    autoSaveTimeout.current = setTimeout(() => {
      if (isDirty) {
        handleSave()
      }
    }, 2000) // Auto-save after 2 seconds of inactivity
  }, [isDirty])

  // Handle field changes
  const handleChange = useCallback((field, value) => {
    setEditedData(prev => {
      const updated = { ...prev }
      // Handle nested fields like "metrics.students"
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        updated[parent] = { ...updated[parent], [child]: value }
      } else {
        updated[field] = value
      }
      return updated
    })
    setIsDirty(true)
    setSaveStatus(null)
    scheduleAutoSave()
  }, [scheduleAutoSave])

  // Save handler
  const handleSave = useCallback(async () => {
    if (!isDirty) return

    setIsSaving(true)
    setSaveStatus('saving')

    try {
      await onSave(editedData)
      setIsDirty(false)
      setSaveStatus('saved')
      setLastSaved(new Date())

      // Clear saved status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error) {
      setSaveStatus('error')
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [editedData, isDirty, onSave])

  // Handle close - commit changes first
  const handleClose = useCallback(async () => {
    if (isDirty) {
      setIsSaving(true)
      setSaveStatus('saving')
      try {
        await onSave(editedData)
        setSaveStatus('saved')
      } catch (error) {
        console.error('Save on close failed:', error)
      }
      setIsSaving(false)
    }
    onClose()
  }, [isDirty, editedData, onSave, onClose])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      // Escape to close
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleSave, handleClose])

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current)
      }
    }
  }, [])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Edit Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#0d1117] border-l border-[#30363d] z-50 shadow-2xl shadow-black/50 overflow-hidden flex flex-col animate-[slideIn_0.3s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center hover:bg-[#30363d] hover:border-[#8b949e] transition-all text-[#8b949e] hover:text-[#f0f6fc]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-[#f0f6fc]">{title || 'Edit'}</h2>
                {isDirty && (
                  <span className="px-2 py-0.5 bg-[#d29922]/10 border border-[#d29922]/30 rounded text-[10px] font-mono text-[#d29922] uppercase">
                    Unsaved
                  </span>
                )}
                {saveStatus === 'saving' && (
                  <span className="px-2 py-0.5 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded text-[10px] font-mono text-[#00d4ff] uppercase animate-pulse">
                    Saving...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="px-2 py-0.5 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded text-[10px] font-mono text-[#3fb950] uppercase">
                    Committed
                  </span>
                )}
              </div>
              {subtitle && <p className="text-xs text-[#6e7681] mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-[10px] text-[#6e7681] font-mono">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button
              size="sm"
              variant={isDirty ? 'primary' : 'secondary'}
              onClick={handleSave}
              disabled={!isDirty || isSaving}
            >
              {isSaving ? 'Committing...' : isDirty ? 'Commit Changes' : 'No Changes'}
            </Button>
          </div>
        </div>

        {/* Edit Mode Indicator */}
        <div className="px-6 py-2 bg-[#00d4ff]/5 border-b border-[#00d4ff]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LiveIndicator label="Edit Mode" variant="success" />
            <span className="text-[10px] text-[#6e7681]">Changes auto-commit on close</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#6e7681]">
            <kbd className="px-1.5 py-0.5 bg-[#21262d] border border-[#30363d] rounded font-mono">⌘S</kbd>
            <span>to save</span>
            <span className="mx-1">•</span>
            <kbd className="px-1.5 py-0.5 bg-[#21262d] border border-[#30363d] rounded font-mono">ESC</kbd>
            <span>to close</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children ? (
            children({ data: editedData, onChange: handleChange, isDirty })
          ) : (
            <GenericEditor data={editedData} onChange={handleChange} type={type} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between">
          <div className="text-xs text-[#6e7681]">
            {type && <span className="uppercase tracking-widest">{type}</span>}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleClose}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save & Close'}
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #21262d;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
      `}</style>
    </>
  )
}

// ==========================================
// GENERIC EDITOR - Auto-generates form fields
// ==========================================

function GenericEditor({ data, onChange, type }) {
  if (!data) return null

  return (
    <div className="space-y-6">
      {Object.entries(data).map(([key, value]) => {
        // Skip internal fields
        if (key === 'id' || key === 'createdAt' || key === 'updatedAt') {
          return (
            <div key={key} className="opacity-50">
              <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                {formatLabel(key)} <span className="text-[#d29922]">(Read Only)</span>
              </label>
              <div className="px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#6e7681] font-mono text-sm">
                {String(value)}
              </div>
            </div>
          )
        }

        // Handle different value types
        if (typeof value === 'boolean') {
          return (
            <div key={key}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => onChange(key, e.target.checked)}
                  className="w-5 h-5 rounded bg-[#0d1117] border-[#30363d] text-[#00d4ff] focus:ring-[#00d4ff] focus:ring-offset-0"
                />
                <span className="text-sm text-[#8b949e] group-hover:text-[#f0f6fc] transition font-medium">
                  {formatLabel(key)}
                </span>
              </label>
            </div>
          )
        }

        if (typeof value === 'number') {
          return (
            <div key={key}>
              <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                {formatLabel(key)}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => onChange(key, parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] font-mono text-lg focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] transition"
              />
            </div>
          )
        }

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return (
            <div key={key} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <label className="block text-[10px] font-semibold text-[#f0f6fc] uppercase tracking-widest mb-4">
                {formatLabel(key)}
              </label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(value).map(([subKey, subValue]) => (
                  <div key={subKey}>
                    <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                      {formatLabel(subKey)}
                    </label>
                    <input
                      type={typeof subValue === 'number' ? 'number' : 'text'}
                      value={subValue}
                      onChange={(e) => onChange(`${key}.${subKey}`, typeof subValue === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] font-mono focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] transition text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        }

        if (Array.isArray(value)) {
          return (
            <div key={key}>
              <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                {formatLabel(key)} <span className="text-[#00d4ff]">({value.length} items)</span>
              </label>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                {value.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-[#21262d] last:border-0">
                    <span className="text-xs font-mono text-[#6e7681] w-6">{i + 1}.</span>
                    <span className="text-sm text-[#f0f6fc]">{typeof item === 'object' ? JSON.stringify(item) : item}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        // String fields - check if it's a long text
        const isLongText = typeof value === 'string' && (value.length > 100 || key === 'description' || key === 'content' || key === 'message')

        if (isLongText) {
          return (
            <div key={key}>
              <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                {formatLabel(key)}
              </label>
              <textarea
                value={value}
                onChange={(e) => onChange(key, e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] transition resize-none text-sm"
              />
            </div>
          )
        }

        // Check for select options
        if (key === 'status') {
          return (
            <div key={key}>
              <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                {formatLabel(key)}
              </label>
              <select
                value={value}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] transition"
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )
        }

        if (key === 'priority') {
          return (
            <div key={key}>
              <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                {formatLabel(key)}
              </label>
              <div className="flex gap-3">
                {['high', 'medium', 'low'].map(p => (
                  <button
                    key={p}
                    onClick={() => onChange(key, p)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium uppercase tracking-wider transition ${
                      value === p
                        ? p === 'high' ? 'bg-[#f85149]/10 border-[#f85149] text-[#f85149]' :
                          p === 'medium' ? 'bg-[#d29922]/10 border-[#d29922] text-[#d29922]' :
                          'bg-[#6e7681]/10 border-[#6e7681] text-[#6e7681]'
                        : 'border-[#30363d] text-[#6e7681] hover:border-[#8b949e]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )
        }

        if (key === 'category') {
          return (
            <div key={key}>
              <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                {formatLabel(key)}
              </label>
              <select
                value={value}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] transition"
              >
                <option value="general">General</option>
                <option value="policy">Policy Update</option>
                <option value="event">Event</option>
                <option value="urgent">Urgent</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>
          )
        }

        // Default string input
        return (
          <div key={key}>
            <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
              {formatLabel(key)}
            </label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] transition text-sm"
            />
          </div>
        )
      })}
    </div>
  )
}

// Helper to format field labels
function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

// ==========================================
// POLICY EDITOR - Specialized for policies
// ==========================================

export function PolicyEditor({ data, onChange, departments }) {
  const dept = departments?.find(d => d.id === data.department)

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-[#21262d] flex items-center justify-center text-3xl">
            {dept?.icon || '📋'}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => onChange('title', e.target.value)}
              className="w-full text-xl font-bold bg-transparent border-0 text-[#f0f6fc] focus:outline-none focus:ring-0 p-0 mb-1"
              placeholder="Policy Title"
            />
            <div className="flex items-center gap-2 text-xs text-[#6e7681]">
              <span>{dept?.name || 'Unknown Department'}</span>
              <span>•</span>
              <span className="font-mono">{data.id}</span>
            </div>
          </div>
        </div>

        <textarea
          value={data.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          placeholder="Policy description..."
          className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#8b949e] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] transition resize-none text-sm"
        />
      </div>

      {/* Status & Priority */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-3">
            Status
          </label>
          <div className="space-y-2">
            {[
              { value: 'planned', label: 'Planned', color: 'text-[#6e7681] border-[#6e7681]', bg: 'bg-[#6e7681]/10' },
              { value: 'in_progress', label: 'In Progress', color: 'text-[#d29922] border-[#d29922]', bg: 'bg-[#d29922]/10' },
              { value: 'completed', label: 'Completed', color: 'text-[#3fb950] border-[#3fb950]', bg: 'bg-[#3fb950]/10' },
            ].map(s => (
              <button
                key={s.value}
                onClick={() => onChange('status', s.value)}
                className={`w-full py-3 rounded-lg border text-sm font-medium transition flex items-center justify-center gap-2 ${
                  data.status === s.value ? `${s.bg} ${s.color}` : 'border-[#30363d] text-[#6e7681] hover:border-[#8b949e]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${data.status === s.value ? s.color.replace('text-', 'bg-') : 'bg-[#6e7681]'}`} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-3">
            Priority
          </label>
          <div className="space-y-2">
            {[
              { value: 'high', label: 'High Priority', color: 'text-[#f85149] border-[#f85149]', bg: 'bg-[#f85149]/10' },
              { value: 'medium', label: 'Medium Priority', color: 'text-[#d29922] border-[#d29922]', bg: 'bg-[#d29922]/10' },
              { value: 'low', label: 'Low Priority', color: 'text-[#6e7681] border-[#6e7681]', bg: 'bg-[#6e7681]/10' },
            ].map(p => (
              <button
                key={p.value}
                onClick={() => onChange('priority', p.value)}
                className={`w-full py-3 rounded-lg border text-sm font-medium transition ${
                  data.priority === p.value ? `${p.bg} ${p.color}` : 'border-[#30363d] text-[#6e7681] hover:border-[#8b949e]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">
            Progress
          </label>
          <span className="text-2xl font-mono font-bold text-[#00d4ff]">{data.progress || 0}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={data.progress || 0}
          onChange={(e) => onChange('progress', parseInt(e.target.value))}
          className="w-full h-3 bg-[#21262d] rounded-full appearance-none cursor-pointer accent-[#00d4ff]"
        />
        <div className="flex justify-between text-[10px] text-[#6e7681] mt-2 font-mono">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Metrics */}
      {data.metrics && Object.keys(data.metrics).length > 0 && (
        <div>
          <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-3">
            Key Metrics
          </label>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(data.metrics).map(([key, value]) => (
              <div key={key} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                  {formatLabel(key)}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => onChange(`metrics.${key}`, parseInt(e.target.value) || 0)}
                  className="w-full text-2xl font-mono font-bold text-[#00d4ff] bg-transparent border-0 p-0 focus:outline-none focus:ring-0"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Digital Features */}
      {data.digitalFeatures && data.digitalFeatures.length > 0 && (
        <div>
          <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-3">
            Digital Features
          </label>
          <div className="flex flex-wrap gap-2">
            {data.digitalFeatures.map((feature, i) => (
              <span key={i} className="px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-[#8b949e]">
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// ANNOUNCEMENT EDITOR
// ==========================================

export function AnnouncementEditor({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
          Title
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] text-lg font-semibold focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] transition"
          placeholder="Announcement title..."
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
          Category
        </label>
        <div className="grid grid-cols-5 gap-2">
          {[
            { value: 'general', label: 'General', color: '#6e7681' },
            { value: 'policy', label: 'Policy', color: '#00d4ff' },
            { value: 'event', label: 'Event', color: '#a371f7' },
            { value: 'urgent', label: 'Urgent', color: '#f85149' },
            { value: 'milestone', label: 'Milestone', color: '#3fb950' },
          ].map(cat => (
            <button
              key={cat.value}
              onClick={() => onChange('category', cat.value)}
              className={`py-2.5 rounded-lg border text-xs font-medium uppercase tracking-wider transition ${
                data.category === cat.value
                  ? 'border-current'
                  : 'border-[#30363d] text-[#6e7681] hover:border-[#8b949e]'
              }`}
              style={data.category === cat.value ? { color: cat.color, backgroundColor: `${cat.color}15` } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
          Content
        </label>
        <textarea
          value={data.content || ''}
          onChange={(e) => onChange('content', e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] transition resize-none text-sm leading-relaxed"
          placeholder="Write your announcement..."
        />
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer group p-4 bg-[#161b22] border border-[#30363d] rounded-lg hover:border-[#d29922] transition">
          <input
            type="checkbox"
            checked={data.pinned || false}
            onChange={(e) => onChange('pinned', e.target.checked)}
            className="w-5 h-5 rounded bg-[#0d1117] border-[#30363d] text-[#d29922] focus:ring-[#d29922] focus:ring-offset-0"
          />
          <div>
            <span className="text-sm text-[#f0f6fc] font-medium group-hover:text-[#d29922] transition flex items-center gap-2">
              ★ Pin Announcement
            </span>
            <p className="text-xs text-[#6e7681] mt-0.5">Pinned announcements appear at the top of the homepage</p>
          </div>
        </label>
      </div>
    </div>
  )
}

// ==========================================
// QUICK STATS EDITOR
// ==========================================

export function QuickStatsEditor({ data, onChange }) {
  const stats = [
    { key: 'totalStudentsReached', label: 'Students Reached', icon: '👥', color: '#00d4ff' },
    { key: 'activeInitiatives', label: 'Active Initiatives', icon: '🚀', color: '#3fb950' },
    { key: 'eventsThisMonth', label: 'Events This Month', icon: '📅', color: '#d29922' },
    { key: 'feedbackReceived', label: 'Feedback Received', icon: '📬', color: '#a371f7' },
  ]

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#8b949e]">
        Update the platform metrics displayed on the homepage and admin dashboard.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {stats.map(stat => (
          <div key={stat.key} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[#8b949e]/30 transition">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{stat.icon}</span>
              <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">
                {stat.label}
              </label>
            </div>
            <input
              type="number"
              value={data[stat.key] || 0}
              onChange={(e) => onChange(stat.key, parseInt(e.target.value) || 0)}
              className="w-full text-3xl font-mono font-bold bg-transparent border-0 p-0 focus:outline-none focus:ring-0"
              style={{ color: stat.color }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ==========================================
// BUDGET EDITOR
// ==========================================

export function BudgetEditor({ data, onChange }) {
  return (
    <div className="space-y-6">
      {/* Main Budget */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'total', label: 'Total Budget', color: '#f0f6fc' },
          { key: 'allocated', label: 'Allocated', color: '#00d4ff' },
          { key: 'spent', label: 'Spent', color: '#3fb950' },
        ].map(item => (
          <div key={item.key} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
              {item.label}
            </label>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-mono" style={{ color: item.color }}>$</span>
              <input
                type="number"
                value={data[item.key] || 0}
                onChange={(e) => onChange(item.key, parseFloat(e.target.value) || 0)}
                className="flex-1 text-2xl font-mono font-bold bg-transparent border-0 p-0 focus:outline-none focus:ring-0"
                style={{ color: item.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      {data.categories && (
        <div>
          <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-3">
            Category Breakdown
          </label>
          <div className="space-y-3">
            {data.categories.map((cat, i) => (
              <div key={cat.name} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-[#f0f6fc]">{cat.name}</span>
                  <span className="text-xs text-[#6e7681] font-mono">
                    {((cat.spent / cat.allocated) * 100).toFixed(0)}% used
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-1">
                      Allocated
                    </label>
                    <input
                      type="number"
                      value={cat.allocated}
                      onChange={(e) => {
                        const newCategories = [...data.categories]
                        newCategories[i] = { ...cat, allocated: parseFloat(e.target.value) || 0 }
                        onChange('categories', newCategories)
                      }}
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#00d4ff] font-mono focus:ring-1 focus:ring-[#00d4ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-1">
                      Spent
                    </label>
                    <input
                      type="number"
                      value={cat.spent}
                      onChange={(e) => {
                        const newCategories = [...data.categories]
                        newCategories[i] = { ...cat, spent: parseFloat(e.target.value) || 0 }
                        onChange('categories', newCategories)
                      }}
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#3fb950] font-mono focus:ring-1 focus:ring-[#00d4ff]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EditWindow
