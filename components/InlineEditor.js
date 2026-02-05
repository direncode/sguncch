import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../lib/store'

// ============================================
// UNIVERSAL EDITABLE COMPONENT
// Wraps ANY text and makes it editable in edit mode
// Usage: <Editable k="page.section.element">Default text here</Editable>
// ============================================
export function Editable({
  k, // content key like "wellness.hero.title"
  children, // default text/content
  as = 'span',
  className = '',
  multiline = false,
  placeholder = 'Click to edit...',
}) {
  const { editMode, siteContent, setSiteContentValue } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  // Get the current value - either from stored content or children (default)
  const defaultValue = typeof children === 'string' ? children : ''
  const storedValue = siteContent?.[k]
  const currentValue = storedValue !== undefined ? storedValue : defaultValue

  const [editValue, setEditValue] = useState(currentValue)

  useEffect(() => {
    setEditValue(currentValue)
  }, [currentValue])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current.select) {
        inputRef.current.select()
      }
    }
  }, [isEditing])

  const handleSave = useCallback(() => {
    setIsEditing(false)
    if (editValue !== currentValue) {
      // Only store if different from default
      if (editValue !== defaultValue) {
        setSiteContentValue(k, editValue)
      } else {
        // If reset to default, remove the override
        setSiteContentValue(k, undefined)
      }
    }
  }, [editValue, currentValue, defaultValue, k, setSiteContentValue])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setEditValue(currentValue)
      setIsEditing(false)
    }
  }, [multiline, handleSave, currentValue])

  // Not in edit mode - render normally
  if (!editMode) {
    const Tag = as
    return <Tag className={className}>{currentValue || children}</Tag>
  }

  // Editing - show input
  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`bg-[#0d1117] border border-[#00d4ff] rounded px-2 py-1 text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 resize-none w-full ${className}`}
          rows={3}
        />
      )
    }
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-[#0d1117] border border-[#00d4ff] rounded px-2 py-0.5 text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50`}
        style={{ width: `${Math.max((editValue?.length || 10) * 8, 60)}px`, minWidth: '100px' }}
      />
    )
  }

  // Edit mode but not actively editing - show clickable
  const Tag = as
  const isModified = storedValue !== undefined
  return (
    <Tag
      className={`${className} cursor-pointer hover:bg-[#00d4ff]/10 hover:outline hover:outline-1 hover:outline-[#00d4ff]/50 rounded px-1 -mx-1 transition-all group relative ${isModified ? 'bg-[#00d4ff]/5' : ''}`}
      onClick={() => setIsEditing(true)}
      title={isModified ? 'Modified - Click to edit' : 'Click to edit'}
    >
      {currentValue || <span className="text-[#6e7681] italic">{placeholder}</span>}
      <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-3 h-3 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </span>
      {isModified && (
        <span className="absolute -top-1 -left-1 w-2 h-2 bg-[#00d4ff] rounded-full opacity-60" title="Modified from default" />
      )}
    </Tag>
  )
}

// ============================================
// EDITABLE NUMBER - for stats and numbers
// Usage: <EditableNum k="wellness.stats.rides">247</EditableNum>
// ============================================
export function EditableNum({
  k,
  children,
  className = '',
  prefix = '',
  suffix = '',
  min,
  max,
}) {
  const { editMode, siteContent, setSiteContentValue } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  const defaultValue = typeof children === 'number' ? children : parseFloat(children) || 0
  const storedValue = siteContent?.[k]
  const currentValue = storedValue !== undefined ? storedValue : defaultValue

  const [editValue, setEditValue] = useState(currentValue)

  useEffect(() => {
    setEditValue(currentValue)
  }, [currentValue])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = useCallback(() => {
    setIsEditing(false)
    const numValue = parseFloat(editValue)
    if (!isNaN(numValue) && numValue !== currentValue) {
      if (numValue !== defaultValue) {
        setSiteContentValue(k, numValue)
      } else {
        setSiteContentValue(k, undefined)
      }
    }
  }, [editValue, currentValue, defaultValue, k, setSiteContentValue])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setEditValue(currentValue)
      setIsEditing(false)
    }
  }, [handleSave, currentValue])

  if (!editMode) {
    return <span className={className}>{prefix}{currentValue}{suffix}</span>
  }

  if (isEditing) {
    return (
      <span className={className}>
        {prefix}
        <input
          ref={inputRef}
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          className="bg-[#0d1117] border border-[#00d4ff] rounded px-2 py-0.5 text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 w-24"
        />
        {suffix}
      </span>
    )
  }

  const isModified = storedValue !== undefined
  return (
    <span
      className={`${className} cursor-pointer hover:bg-[#00d4ff]/10 hover:outline hover:outline-1 hover:outline-[#00d4ff]/50 rounded px-1 -mx-1 transition-all group relative inline-flex items-center ${isModified ? 'bg-[#00d4ff]/5' : ''}`}
      onClick={() => setIsEditing(true)}
      title={isModified ? 'Modified - Click to edit' : 'Click to edit'}
    >
      {prefix}{currentValue}{suffix}
      <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-3 h-3 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </span>
      {isModified && (
        <span className="absolute -top-1 -left-1 w-2 h-2 bg-[#00d4ff] rounded-full opacity-60" />
      )}
    </span>
  )
}

// ============================================
// LEGACY COMPONENTS BELOW
// (keeping for backwards compatibility)
// ============================================

// Inline editable text - click to edit, auto-saves on blur
export function EditableText({
  value,
  onChange,
  className = '',
  as = 'span',
  multiline = false,
  placeholder = 'Click to edit...',
}) {
  const { editMode } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = useCallback(() => {
    setIsEditing(false)
    if (editValue !== value) {
      onChange(editValue)
    }
  }, [editValue, value, onChange])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setEditValue(value)
      setIsEditing(false)
    }
  }, [multiline, handleSave, value])

  if (!editMode) {
    const Tag = as
    return <Tag className={className}>{value || placeholder}</Tag>
  }

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`bg-[#0d1117] border border-[#00d4ff] rounded px-2 py-1 text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 resize-none w-full ${className}`}
          rows={3}
        />
      )
    }
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-[#0d1117] border border-[#00d4ff] rounded px-2 py-0.5 text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 ${className}`}
        style={{ width: `${Math.max(editValue.length * 8, 60)}px` }}
      />
    )
  }

  const Tag = as
  return (
    <Tag
      className={`${className} cursor-pointer hover:bg-[#00d4ff]/10 hover:outline hover:outline-1 hover:outline-[#00d4ff]/50 rounded px-1 -mx-1 transition-all group relative`}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value || <span className="text-[#6e7681] italic">{placeholder}</span>}
      <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-3 h-3 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </span>
    </Tag>
  )
}

// Editable number input
export function EditableNumber({
  value,
  onChange,
  className = '',
  prefix = '',
  suffix = '',
  min,
  max,
}) {
  const { editMode } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = useCallback(() => {
    setIsEditing(false)
    const numValue = parseFloat(editValue)
    if (!isNaN(numValue) && numValue !== value) {
      onChange(numValue)
    }
  }, [editValue, value, onChange])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setEditValue(value)
      setIsEditing(false)
    }
  }, [handleSave, value])

  if (!editMode) {
    return <span className={className}>{prefix}{value}{suffix}</span>
  }

  if (isEditing) {
    return (
      <span className={className}>
        {prefix}
        <input
          ref={inputRef}
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          className="bg-[#0d1117] border border-[#00d4ff] rounded px-2 py-0.5 text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 w-20"
        />
        {suffix}
      </span>
    )
  }

  return (
    <span
      className={`${className} cursor-pointer hover:bg-[#00d4ff]/10 hover:outline hover:outline-1 hover:outline-[#00d4ff]/50 rounded px-1 -mx-1 transition-all group relative inline-flex items-center`}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {prefix}{value}{suffix}
      <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-3 h-3 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </span>
    </span>
  )
}

// Editable toggle for boolean values like planb/narcan availability
export function EditableToggle({
  value,
  onChange,
  label,
  activeColor = '#3fb950',
  inactiveColor = '#6e7681',
}) {
  const { editMode } = useApp()

  if (!editMode) {
    if (!value) return null
    return (
      <span
        className="px-2 py-0.5 rounded text-xs border"
        style={{
          backgroundColor: `${activeColor}10`,
          color: activeColor,
          borderColor: activeColor,
        }}
      >
        {label}
      </span>
    )
  }

  return (
    <button
      onClick={() => onChange(!value)}
      className={`px-2 py-0.5 rounded text-xs border transition-all ${
        value
          ? 'hover:opacity-70'
          : 'opacity-50 hover:opacity-100'
      }`}
      style={{
        backgroundColor: value ? `${activeColor}10` : `${inactiveColor}10`,
        color: value ? activeColor : inactiveColor,
        borderColor: value ? activeColor : inactiveColor,
      }}
      title={`Click to ${value ? 'disable' : 'enable'} ${label}`}
    >
      {label}
    </button>
  )
}

// Editable select dropdown
export function EditableSelect({
  value,
  onChange,
  options,
  className = '',
}) {
  const { editMode } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus()
    }
  }, [isEditing])

  const selectedOption = options.find(o => o.value === value) || options[0]

  if (!editMode) {
    return <span className={className}>{selectedOption?.label || value}</span>
  }

  if (isEditing) {
    return (
      <select
        ref={selectRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setIsEditing(false)
        }}
        onBlur={() => setIsEditing(false)}
        className={`bg-[#0d1117] border border-[#00d4ff] rounded px-2 py-0.5 text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 ${className}`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    )
  }

  return (
    <span
      className={`${className} cursor-pointer hover:bg-[#00d4ff]/10 hover:outline hover:outline-1 hover:outline-[#00d4ff]/50 rounded px-1 -mx-1 transition-all group relative inline-flex items-center`}
      onClick={() => setIsEditing(true)}
      title="Click to change"
    >
      {selectedOption?.label || value}
      <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-3 h-3 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </span>
  )
}

// Editable list item with delete button
export function EditableListItem({
  children,
  onDelete,
  className = '',
}) {
  const { editMode } = useApp()
  const [showDelete, setShowDelete] = useState(false)

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {children}
      {editMode && showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm('Delete this item?')) {
              onDelete()
            }
          }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-[#f85149] text-white rounded-full flex items-center justify-center text-xs hover:bg-[#da3633] transition-colors shadow-lg z-10"
          title="Delete"
        >
          x
        </button>
      )}
    </div>
  )
}

// Add new item button
export function AddItemButton({
  onClick,
  label = 'Add Item',
  className = '',
}) {
  const { editMode } = useApp()

  if (!editMode) return null

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 border border-dashed border-[#00d4ff]/50 rounded-lg text-[#00d4ff] text-sm hover:bg-[#00d4ff]/10 hover:border-[#00d4ff] transition-all ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      {label}
    </button>
  )
}

// Editable bullet list
export function EditableBulletList({
  items,
  onChange,
  className = '',
}) {
  const { editMode } = useApp()
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingIndex])

  const handleSave = (index) => {
    if (editValue.trim()) {
      const newItems = [...items]
      newItems[index] = editValue
      onChange(newItems)
    }
    setEditingIndex(null)
  }

  const handleDelete = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
  }

  const handleAdd = () => {
    onChange([...items, 'New item'])
    setEditingIndex(items.length)
    setEditValue('New item')
  }

  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-[#8b949e] group">
          <span className="text-[#3fb950] mt-0.5">•</span>
          {editingIndex === i ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleSave(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave(i)
                if (e.key === 'Escape') setEditingIndex(null)
              }}
              className="flex-1 bg-[#0d1117] border border-[#00d4ff] rounded px-2 py-0.5 text-[#f0f6fc] focus:outline-none text-sm"
            />
          ) : (
            <span
              className={editMode ? 'cursor-pointer hover:text-[#f0f6fc] flex-1' : 'flex-1'}
              onClick={() => {
                if (editMode) {
                  setEditingIndex(i)
                  setEditValue(item)
                }
              }}
            >
              {item}
            </span>
          )}
          {editMode && editingIndex !== i && (
            <button
              onClick={() => handleDelete(i)}
              className="opacity-0 group-hover:opacity-100 text-[#f85149] hover:text-[#da3633] transition-opacity"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </li>
      ))}
      {editMode && (
        <li>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 text-sm text-[#00d4ff] hover:text-[#58a6ff] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add bullet
          </button>
        </li>
      )}
    </ul>
  )
}

// Location card component specifically for distribution locations
export function EditableLocationCard({
  location,
  onUpdate,
  onDelete,
  showPlanB = true,
  showNarcan = true,
}) {
  return (
    <EditableListItem onDelete={onDelete} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
      <h4 className="font-semibold text-[#f0f6fc] mb-1">
        <EditableText
          value={location.name}
          onChange={(val) => onUpdate({ ...location, name: val })}
        />
      </h4>
      <p className="text-sm text-[#8b949e] mb-2">
        <EditableText
          value={location.address || location.location}
          onChange={(val) => onUpdate({ ...location, address: val, location: val })}
        />
      </p>
      <p className="text-xs text-[#6e7681] font-mono mb-3">
        <EditableText
          value={location.hours}
          onChange={(val) => onUpdate({ ...location, hours: val })}
        />
      </p>
      <div className="flex gap-2">
        {showPlanB && (
          <EditableToggle
            value={location.planb}
            onChange={(val) => onUpdate({ ...location, planb: val })}
            label="Plan B"
            activeColor="#a371f7"
          />
        )}
        {showNarcan && (
          <EditableToggle
            value={location.narcan}
            onChange={(val) => onUpdate({ ...location, narcan: val })}
            label="Narcan"
            activeColor="#3fb950"
          />
        )}
        {location.status !== undefined && (
          <EditableSelect
            value={location.status}
            onChange={(val) => onUpdate({ ...location, status: val })}
            options={[
              { value: 'active', label: 'ACTIVE' },
              { value: 'coming', label: 'COMING SOON' },
            ]}
            className="text-xs"
          />
        )}
      </div>
    </EditableListItem>
  )
}

// DEPRECATED: Use EditModeToggle instead
export function AdminEditBanner() {
  const { editMode } = useApp()

  if (!editMode) return null

  return (
    <div className="bg-[#00d4ff]/10 border-b border-[#00d4ff]/30 px-4 py-2">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse" />
          <span className="text-xs text-[#00d4ff] font-medium">EDIT MODE ACTIVE</span>
          <span className="text-xs text-[#8b949e]">Click on any highlighted text to edit. Changes save automatically.</span>
        </div>
      </div>
    </div>
  )
}

// Floating Edit Mode Toggle - appears at bottom of screen for admins
export function EditModeToggle() {
  const { isAdmin, editMode, toggleEditMode } = useApp()
  const [isHovered, setIsHovered] = useState(false)

  if (!isAdmin) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex items-center gap-4 bg-[#161b22] border rounded-full shadow-2xl transition-all duration-300 ${
        editMode
          ? 'border-[#00d4ff] shadow-[#00d4ff]/20'
          : 'border-[#30363d] shadow-black/30'
      } ${isHovered ? 'px-6 py-3' : 'px-4 py-2.5'}`}>
        {/* Toggle Switch */}
        <button
          onClick={toggleEditMode}
          className="relative flex items-center"
        >
          {/* Track */}
          <div className={`w-14 h-7 rounded-full transition-all duration-300 ${
            editMode
              ? 'bg-[#00d4ff]/20 border border-[#00d4ff]'
              : 'bg-[#21262d] border border-[#30363d]'
          }`}>
            {/* Thumb */}
            <div className={`absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center ${
              editMode
                ? 'left-7 bg-[#00d4ff] shadow-[0_0_12px_#00d4ff]'
                : 'left-0.5 bg-[#6e7681]'
            }`}>
              {editMode ? (
                <svg className="w-3.5 h-3.5 text-[#0d1117]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-[#21262d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </div>
          </div>
        </button>

        {/* Label */}
        <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 max-w-[200px]' : 'opacity-100 max-w-[100px]'} overflow-hidden`}>
          <p className={`text-sm font-medium whitespace-nowrap ${editMode ? 'text-[#00d4ff]' : 'text-[#8b949e]'}`}>
            {editMode ? 'Edit Mode ON' : 'Edit Mode'}
          </p>
          {isHovered && (
            <p className="text-[10px] text-[#6e7681] whitespace-nowrap animate-[fadeIn_0.2s]">
              {editMode ? 'Click text to edit' : 'Toggle to edit content'}
            </p>
          )}
        </div>

        {/* Status Indicator */}
        {editMode && (
          <div className="flex items-center gap-2 pl-2 border-l border-[#30363d]">
            <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse" />
            <span className="text-[10px] text-[#00d4ff] font-mono uppercase tracking-wider">Active</span>
          </div>
        )}
      </div>

      {/* Keyboard shortcut hint */}
      {isHovered && !editMode && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-[#6e7681] whitespace-nowrap">
          Admin Only
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
