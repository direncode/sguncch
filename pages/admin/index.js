import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { departments, getOverallProgress, getStatusCounts } from '../../lib/data'
import {
  MetricCard, StatusBadge, DonutChart, HorizontalBarChart, ProgressBar,
  LiveIndicator, Panel, AlertBanner, SearchInput, TabNav, Button
} from '../../components/FormInput'
import {
  EditWindow, PolicyEditor, AnnouncementEditor, QuickStatsEditor, BudgetEditor
} from '../../components/EditWindow'

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const formatRelativeTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// ==========================================
// LIVE CLOCK COMPONENT
// ==========================================
const LiveClock = () => {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="text-[#f0f6fc] font-mono text-sm tracking-wide">
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="text-[10px] text-[#6e7681] uppercase tracking-widest">
          {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// SYSTEM HEALTH MONITOR
// ==========================================
const SystemHealthMonitor = ({ policies, feedback, activityLog }) => {
  const overallProgress = getOverallProgress(policies)
  const statusCounts = getStatusCounts(policies)
  const newFeedback = feedback.filter(f => f.status === 'new').length
  const recentActivity = activityLog.filter(a => {
    const diff = Date.now() - new Date(a.timestamp).getTime()
    return diff < 3600000 // Last hour
  }).length

  const healthScore = Math.round(
    (overallProgress * 0.4) +
    ((statusCounts.completed / policies.length) * 100 * 0.3) +
    (Math.min(recentActivity, 10) * 3)
  )

  const getHealthStatus = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'green', variant: 'success' }
    if (score >= 60) return { label: 'Good', color: 'cyan', variant: 'info' }
    if (score >= 40) return { label: 'Fair', color: 'yellow', variant: 'warning' }
    return { label: 'Needs Attention', color: 'red', variant: 'danger' }
  }

  const health = getHealthStatus(healthScore)

  return (
    <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#00d4ff]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">System Health</span>
              <LiveIndicator label="Live" variant={health.variant} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold font-mono text-[#${health.color === 'green' ? '3fb950' : health.color === 'cyan' ? '00d4ff' : health.color === 'yellow' ? 'd29922' : 'f85149'}]`}>
                {healthScore}
              </span>
              <span className="text-xl text-[#6e7681]">/100</span>
            </div>
            <StatusBadge status={health.variant}>{health.label}</StatusBadge>
          </div>
          <DonutChart
            data={[
              { value: statusCounts.completed, color: '#3fb950' },
              { value: statusCounts.in_progress, color: '#d29922' },
              { value: statusCounts.planned, color: '#30363d' },
            ]}
            size={100}
            thickness={14}
            centerValue={`${overallProgress}%`}
            centerLabel="Progress"
          />
        </div>
        <div className="grid grid-cols-4 gap-3 mt-6 pt-4 border-t border-[#30363d]">
          <div className="text-center">
            <p className="text-2xl font-bold font-mono text-[#3fb950]">{statusCounts.completed}</p>
            <p className="text-[10px] text-[#6e7681] uppercase">Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-mono text-[#d29922]">{statusCounts.in_progress}</p>
            <p className="text-[10px] text-[#6e7681] uppercase">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-mono text-[#6e7681]">{statusCounts.planned}</p>
            <p className="text-[10px] text-[#6e7681] uppercase">Planned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-mono text-[#a371f7]">{newFeedback}</p>
            <p className="text-[10px] text-[#6e7681] uppercase">New</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// DEPARTMENT HEATMAP
// ==========================================
const DepartmentHeatmap = ({ policies, onDeptClick }) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {departments.map(dept => {
        const deptPolicies = policies.filter(p => p.department === dept.id)
        const progress = getOverallProgress(deptPolicies)
        const getHeatColor = (p) => {
          if (p >= 80) return 'bg-[#3fb950]/30 border-[#3fb950]/50 hover:bg-[#3fb950]/40'
          if (p >= 60) return 'bg-[#00d4ff]/30 border-[#00d4ff]/50 hover:bg-[#00d4ff]/40'
          if (p >= 40) return 'bg-[#d29922]/30 border-[#d29922]/50 hover:bg-[#d29922]/40'
          if (p >= 20) return 'bg-[#db6d28]/30 border-[#db6d28]/50 hover:bg-[#db6d28]/40'
          return 'bg-[#f85149]/20 border-[#f85149]/40 hover:bg-[#f85149]/30'
        }
        return (
          <button
            key={dept.id}
            onClick={() => onDeptClick(dept.id)}
            className={`${getHeatColor(progress)} border rounded-lg p-3 transition-all hover:scale-105 group`}
          >
            <span className="text-2xl block mb-1">{dept.icon}</span>
            <p className="text-[10px] text-[#f0f6fc] font-medium truncate">{dept.name}</p>
            <p className="text-lg font-mono font-bold text-[#f0f6fc]">{progress}%</p>
            <p className="text-[9px] text-[#6e7681]">{deptPolicies.length} policies</p>
          </button>
        )
      })}
    </div>
  )
}

// ==========================================
// REAL-TIME ACTIVITY STREAM
// ==========================================
const ActivityStream = ({ activityLog, maxItems = 15 }) => {
  const getActivityColor = (action) => {
    if (action.includes('PROGRESS') || action.includes('COMPLETE')) return 'bg-[#3fb950]'
    if (action.includes('UPDATE')) return 'bg-[#00d4ff]'
    if (action.includes('CREATE') || action.includes('ADD')) return 'bg-[#a371f7]'
    if (action.includes('DELETE') || action.includes('RESET')) return 'bg-[#f85149]'
    return 'bg-[#6e7681]'
  }

  return (
    <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {activityLog.slice(0, maxItems).map((entry, i) => {
        const dept = departments.find(d => d.id === entry.category)
        const hasProgress = entry.metadata?.progress !== undefined
        const progressDelta = hasProgress && entry.metadata?.previousProgress !== undefined
          ? entry.metadata.progress - entry.metadata.previousProgress
          : null

        return (
          <div
            key={entry.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-[#21262d]/50 ${i === 0 ? 'bg-[#00d4ff]/5 border border-[#00d4ff]/20' : ''}`}
          >
            <div className={`w-2 h-2 rounded-full ${getActivityColor(entry.action)} mt-1.5 shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {dept && <span className="text-sm">{dept.icon}</span>}
                <p className="text-sm text-[#f0f6fc] truncate">{entry.details}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono text-[#6e7681] uppercase">{formatRelativeTime(entry.timestamp)}</span>
                {hasProgress && (
                  <span className="px-1.5 py-0.5 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded text-[10px] font-mono font-bold text-[#3fb950]">
                    {entry.metadata.progress}%
                    {progressDelta !== null && progressDelta !== 0 && (
                      <span className={`ml-1 ${progressDelta > 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                        ({progressDelta > 0 ? '+' : ''}{progressDelta})
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
      {activityLog.length === 0 && (
        <div className="text-center py-8 text-[#6e7681] text-sm">No activity recorded yet</div>
      )}
    </div>
  )
}

// ==========================================
// INSIGHTS ENGINE
// ==========================================
const InsightsEngine = ({ policies, feedback, activityLog, budgetData }) => {
  const insights = useMemo(() => {
    const results = []
    const overallProgress = getOverallProgress(policies)
    const statusCounts = getStatusCounts(policies)

    // Progress insights
    if (overallProgress >= 75) {
      results.push({ type: 'success', title: 'Strong Progress', message: `Platform is ${overallProgress}% complete. Excellent momentum!` })
    } else if (overallProgress < 30) {
      results.push({ type: 'warning', title: 'Progress Alert', message: 'Overall progress is below 30%. Consider prioritizing key initiatives.' })
    }

    // Stalled policies
    const stalledPolicies = policies.filter(p => p.status === 'in_progress' && p.progress < 25)
    if (stalledPolicies.length > 0) {
      results.push({ type: 'warning', title: 'Stalled Initiatives', message: `${stalledPolicies.length} active policies have less than 25% progress.` })
    }

    // Feedback insights
    const urgentFeedback = feedback.filter(f => f.status === 'new')
    if (urgentFeedback.length > 5) {
      results.push({ type: 'danger', title: 'Feedback Backlog', message: `${urgentFeedback.length} feedback items awaiting review.` })
    }

    // Budget insights
    const budgetUtilization = (budgetData.spent / budgetData.total) * 100
    if (budgetUtilization > 80) {
      results.push({ type: 'warning', title: 'Budget Alert', message: `${budgetUtilization.toFixed(0)}% of budget utilized.` })
    }

    // Recent activity
    const recentProgressUpdates = activityLog.filter(a => a.action === 'LOG_PROGRESS' && Date.now() - new Date(a.timestamp).getTime() < 86400000).length
    if (recentProgressUpdates >= 5) {
      results.push({ type: 'success', title: 'Active Team', message: `${recentProgressUpdates} progress updates in the last 24 hours.` })
    }

    // Department performance
    const deptPerformance = departments.map(d => ({
      dept: d,
      progress: getOverallProgress(policies.filter(p => p.department === d.id))
    })).sort((a, b) => b.progress - a.progress)

    if (deptPerformance[0]?.progress >= 70) {
      results.push({ type: 'info', title: 'Top Performer', message: `${deptPerformance[0].dept.name} leading with ${deptPerformance[0].progress}% progress.` })
    }

    return results.slice(0, 4)
  }, [policies, feedback, activityLog, budgetData])

  if (insights.length === 0) return null

  return (
    <div className="space-y-2">
      {insights.map((insight, i) => (
        <AlertBanner key={i} type={insight.type} title={insight.title} message={insight.message} />
      ))}
    </div>
  )
}

// ==========================================
// QUICK ACTIONS PANEL
// ==========================================
const QuickActionsPanel = ({ onAction }) => {
  const actions = [
    { id: 'announcement', icon: '', label: 'New Announcement', color: 'cyan' },
    { id: 'export', icon: '', label: 'Export Data', color: 'green' },
    { id: 'feedback', icon: '', label: 'Review Feedback', color: 'purple' },
    { id: 'budget', icon: '', label: 'Add Transaction', color: 'yellow' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map(action => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className="flex items-center gap-3 p-3 bg-[#0d1117] border border-[#30363d] rounded-lg hover:border-[#00d4ff]/50 hover:bg-[#161b22] transition-all group"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">{action.icon}</span>
          <span className="text-xs text-[#8b949e] group-hover:text-[#f0f6fc] font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  )
}

// ==========================================
// MAIN ADMIN DASHBOARD COMPONENT
// ==========================================
export default function AdminDashboard() {
  const router = useRouter()
  const {
    isAdmin, isLoaded, policies, operationalData, budgetData, announcements,
    activityLog, feedback, quickStats, dataSource,
    updatePolicy, updatePolicyMetrics, logPolicyProgress,
    addAnnouncement, deleteAnnouncement, pinAnnouncement,
    updateFeedbackStatus,
    addTechDevice, updateTechDevice, deleteTechDevice, addTechLoan, updateTechLoan,
    updatePantryLocation, logPantryVisit, logPantryDonation,
    addTrainingSession,
    updateBudget, updateBudgetCategory, addBudgetTransaction,
    updateQuickStats,
    exportAllData, importData, resetAllData, clearActivityLog,
  } = useApp()

  const [activeTab, setActiveTab] = useState('command')
  const [selectedDept, setSelectedDept] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(null)
  const [toast, setToast] = useState(null)

  // Edit Window state
  const [editWindow, setEditWindow] = useState({
    isOpen: false,
    type: null,        // 'policy', 'announcement', 'quickStats', 'budget', 'feedback'
    data: null,
    title: '',
    subtitle: ''
  })

  // Open edit window helper
  const openEditWindow = useCallback((type, data, title, subtitle) => {
    setEditWindow({
      isOpen: true,
      type,
      data,
      title,
      subtitle
    })
  }, [])

  // Close edit window helper
  const closeEditWindow = useCallback(() => {
    setEditWindow({
      isOpen: false,
      type: null,
      data: null,
      title: '',
      subtitle: ''
    })
    setToast({ message: 'Changes committed', type: 'success' })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Handle edit window save
  const handleEditWindowSave = useCallback(async (updatedData) => {
    switch (editWindow.type) {
      case 'policy':
        updatePolicy(updatedData.id, updatedData)
        if (updatedData.metrics) {
          updatePolicyMetrics(updatedData.id, updatedData.metrics)
        }
        break
      case 'announcement':
        // Update announcement (would need updateAnnouncement function)
        // For now, we'll delete and re-add
        deleteAnnouncement(updatedData.id)
        addAnnouncement({ ...updatedData, id: updatedData.id })
        break
      case 'quickStats':
        updateQuickStats(updatedData)
        break
      case 'budget':
        updateBudget(updatedData)
        break
      case 'feedback':
        updateFeedbackStatus(updatedData.id, updatedData.status, updatedData.adminNote)
        break
    }
  }, [editWindow.type, updatePolicy, updatePolicyMetrics, deleteAnnouncement, addAnnouncement, updateQuickStats, updateBudget, updateFeedbackStatus])

  // Form states
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', category: 'general', pinned: false })
  const [deviceForm, setDeviceForm] = useState({ type: 'laptop-windows', name: '', total: 0, available: 0 })
  const [loanForm, setLoanForm] = useState({ studentName: '', studentEmail: '', deviceType: '', dueDate: '' })
  const [trainingForm, setTrainingForm] = useState({ type: 'mentalHealthFirstAid', title: '', date: '', location: '', capacity: 0 })
  const [transactionForm, setTransactionForm] = useState({ type: 'expense', amount: 0, description: '', category: '' })
  const [progressLogForm, setProgressLogForm] = useState({ policyId: null, progress: 0, note: '' })

  // Computed values
  const overallProgress = useMemo(() => getOverallProgress(policies), [policies])
  const statusCounts = useMemo(() => getStatusCounts(policies), [policies])

  const filteredPolicies = useMemo(() => {
    let filtered = selectedDept === 'all' ? policies : policies.filter(p => p.department === selectedDept)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.department.toLowerCase().includes(query)
      )
    }
    return filtered
  }, [policies, selectedDept, searchQuery])

  // Auth check
  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push('/admin/login')
    }
  }, [isLoaded, isAdmin, router])

  // Notification helper
  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Quick progress update
  const handleQuickProgressUpdate = useCallback((policyId, newProgress) => {
    const policy = policies.find(p => p.id === policyId)
    if (!policy) return
    const clampedProgress = Math.max(0, Math.min(100, newProgress))
    logPolicyProgress(policyId, clampedProgress, `Progress updated to ${clampedProgress}%`)
    notify(`${policy.title}: ${clampedProgress}%`)
  }, [policies, logPolicyProgress, notify])

  // Export handler
  const handleExport = useCallback(() => {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projectbold-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    notify('Data exported successfully')
  }, [exportAllData, notify])

  // Import handler
  const handleImport = useCallback((e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          importData(data)
          notify('Data imported successfully')
        } catch {
          notify('Import failed - invalid file', 'error')
        }
      }
      reader.readAsText(file)
    }
  }, [importData, notify])

  // Quick action handler
  const handleQuickAction = useCallback((actionId) => {
    switch (actionId) {
      case 'announcement': setShowModal('announcement'); break
      case 'export': handleExport(); break
      case 'feedback': setActiveTab('feedback'); break
      case 'budget': setShowModal('transaction'); break
    }
  }, [handleExport])

  // Loading state
  if (!isLoaded || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#00d4ff] rounded-full animate-pulse" />
            <div className="w-3 h-3 bg-[#00d4ff] rounded-full animate-pulse delay-100" />
            <div className="w-3 h-3 bg-[#00d4ff] rounded-full animate-pulse delay-200" />
          </div>
          <p className="text-[#6e7681] text-sm font-mono">Initializing Command Center...</p>
        </div>
      </div>
    )
  }

  // Tab configuration
  const tabs = [
    { id: 'command', label: 'Command Center', icon: '' },
    { id: 'policies', label: 'Policies', icon: '', count: policies.length },
    { id: 'activity', label: 'Activity Log', icon: '', count: activityLog.filter(a => a.action === 'LOG_PROGRESS').length },
    { id: 'budget', label: 'Budget', icon: '' },
    { id: 'feedback', label: 'Feedback', icon: '', count: feedback.filter(f => f.status === 'new').length },
    { id: 'announcements', label: 'Comms', icon: '' },
    { id: 'analytics', label: 'Analytics', icon: '' },
    { id: 'settings', label: 'Settings', icon: '' },
  ]

  // Modal Component
  const Modal = ({ title, onClose, children, size = 'md' }) => {
    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    }
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`bg-[#161b22] border border-[#30363d] rounded-xl ${sizes[size]} w-full shadow-2xl shadow-black/50`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
            <h3 className="text-lg font-semibold text-[#f0f6fc]">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center hover:bg-[#30363d] hover:border-[#8b949e] transition-all">
              <span className="text-[#8b949e] text-lg leading-none">&times;</span>
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    )
  }

  // Input Components
  const Input = ({ label, ...props }) => (
    <div>
      {label && <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">{label}</label>}
      <input {...props} className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] font-mono text-sm transition" />
    </div>
  )

  const Select = ({ label, options, ...props }) => (
    <div>
      {label && <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">{label}</label>}
      <select {...props} className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm transition">
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <Head>
        <title>Command Center | Project Bold Admin</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-sm font-mono animate-[fadeIn_0.2s] ${
          toast.type === 'error' ? 'bg-[#f85149]/20 border border-[#f85149]/50 text-[#f85149]' :
          'bg-[#161b22] border border-[#00d4ff]/50 text-[#00d4ff] shadow-[#00d4ff]/10'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Command Center Header */}
      <header className="bg-[#0d1117]/95 backdrop-blur-xl border-b border-[#30363d] sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 text-[#8b949e] text-xs font-medium hover:text-[#00d4ff] transition-colors">
                <span className="text-lg">&larr;</span>
                <span className="uppercase tracking-widest">Exit</span>
              </Link>
              <div className="h-6 w-px bg-[#30363d]" />
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#3fb950] rounded-full animate-pulse shadow-[0_0_8px_#3fb950]" />
                <h1 className="text-[#f0f6fc] text-base font-bold tracking-wide">
                  COMMAND CENTER
                </h1>
                <span className="px-2 py-0.5 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded text-[#00d4ff] text-[9px] font-mono tracking-wider">
                  v2.0
                </span>
              </div>
            </div>

            {/* Center section - Quick Stats */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[#6e7681] text-[10px] uppercase tracking-widest">Progress</span>
                <span className="text-[#00d4ff] font-mono font-bold">{overallProgress}%</span>
              </div>
              <div className="w-px h-4 bg-[#30363d]" />
              <div className="flex items-center gap-2">
                <span className="text-[#6e7681] text-[10px] uppercase tracking-widest">Active</span>
                <span className="text-[#d29922] font-mono font-bold">{statusCounts.in_progress}</span>
              </div>
              <div className="w-px h-4 bg-[#30363d]" />
              <div className="flex items-center gap-2">
                <span className="text-[#6e7681] text-[10px] uppercase tracking-widest">Done</span>
                <span className="text-[#3fb950] font-mono font-bold">{statusCounts.completed}</span>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-5">
              <div className="hidden md:flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                  dataSource === 'supabase' ? 'bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950]' : 'bg-[#d29922]/10 border border-[#d29922]/30 text-[#d29922]'
                }`}>
                  {dataSource === 'supabase' ? 'CLOUD' : 'LOCAL'}
                </span>
              </div>
              <div className="h-6 w-px bg-[#30363d]" />
              <LiveClock />
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-[#0d1117] border-b border-[#30363d] sticky top-16 z-30">
        <div className="max-w-[1800px] mx-auto px-6">
          <TabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {/* COMMAND CENTER TAB */}
        {activeTab === 'command' && (
          <div className="space-y-6">
            {/* Top Row - Health Monitor + Insights */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SystemHealthMonitor policies={policies} feedback={feedback} activityLog={activityLog} />
              </div>
              <div className="space-y-4">
                <InsightsEngine policies={policies} feedback={feedback} activityLog={activityLog} budgetData={budgetData} />
                <QuickActionsPanel onAction={handleQuickAction} />
              </div>
            </div>

            {/* Middle Row - Department Heatmap + Activity Stream */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Panel title="Department Performance Matrix" subtitle="Click to filter policies by department">
                  <DepartmentHeatmap policies={policies} onDeptClick={(id) => { setSelectedDept(id); setActiveTab('policies'); }} />
                </Panel>
              </div>
              <Panel title="Live Activity Stream" subtitle={`${activityLog.length} total events`} badge={activityLog.length > 0 ? { status: 'success', text: 'Live' } : null}>
                <ActivityStream activityLog={activityLog} />
              </Panel>
            </div>

            {/* Bottom Row - Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <MetricCard
                label="Students Reached"
                value={quickStats.totalStudentsReached?.toLocaleString() || '0'}
                color="cyan"
                sparklineData={[12, 19, 3, 5, 2, 3, 9, 15, 22, 18, 25, 30]}
              />
              <MetricCard
                label="Active Initiatives"
                value={quickStats.activeInitiatives || statusCounts.in_progress}
                color="yellow"
                change="+3"
                trend="up"
              />
              <MetricCard
                label="Events This Month"
                value={quickStats.eventsThisMonth || '0'}
                color="purple"
              />
              <MetricCard
                label="Feedback Queue"
                value={feedback.filter(f => f.status === 'new').length}
                color={feedback.filter(f => f.status === 'new').length > 5 ? 'red' : 'green'}
              />
              <MetricCard
                label="Budget Utilized"
                value={`${((budgetData.spent / budgetData.total) * 100).toFixed(0)}%`}
                subtitle={`$${budgetData.spent.toLocaleString()} spent`}
                color="green"
              />
              <MetricCard
                label="Announcements"
                value={announcements.length}
                color="blue"
                subtitle={`${announcements.filter(a => a.pinned).length} pinned`}
              />
            </div>

            {/* Quick Stats Editor */}
            <Panel
              title="Platform Metrics"
              subtitle="Click values to edit"
              collapsible
              defaultCollapsed
              actions={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditWindow('quickStats', quickStats, 'Edit Platform Metrics', 'Homepage Statistics')}
                >
                  Open Editor
                </Button>
              }
            >
              <div className="grid grid-cols-4 gap-4">
                {[
                  { key: 'totalStudentsReached', label: 'Students Reached', color: '#00d4ff' },
                  { key: 'activeInitiatives', label: 'Active Initiatives', color: '#3fb950' },
                  { key: 'eventsThisMonth', label: 'Events This Month', color: '#d29922' },
                  { key: 'feedbackReceived', label: 'Total Feedback', color: '#a371f7' },
                ].map(item => (
                  <div key={item.key} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                    <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest block mb-2">{item.label}</label>
                    <input
                      type="number"
                      value={quickStats[item.key]}
                      onChange={(e) => updateQuickStats({ [item.key]: parseInt(e.target.value) || 0 })}
                      className="w-full bg-transparent text-2xl font-mono font-bold border-0 p-0 focus:ring-0 focus:outline-none"
                      style={{ color: item.color }}
                    />
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* POLICIES TAB */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            {/* Header with Search and Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#f0f6fc]">Policy Management</h2>
                <p className="text-[#8b949e] mt-1">Manage all {policies.length} policy initiatives across {departments.length} departments</p>
              </div>
              <div className="flex items-center gap-3">
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  placeholder="Search policies..."
                />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-4 py-2.5 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff]"
                >
                  <option value="all">All Departments</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
                </select>
              </div>
            </div>

            {/* Policy Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
                  <span className="text-2xl font-mono font-bold text-[#00d4ff]">{filteredPolicies.length}</span>
                </div>
                <div>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">Showing</p>
                  <p className="text-sm text-[#f0f6fc]">Policies</p>
                </div>
              </div>
              <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#3fb950]/10 flex items-center justify-center">
                  <span className="text-2xl font-mono font-bold text-[#3fb950]">{filteredPolicies.filter(p => p.status === 'completed').length}</span>
                </div>
                <div>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">Completed</p>
                  <p className="text-sm text-[#f0f6fc]">Initiatives</p>
                </div>
              </div>
              <div className="bg-[#161b22] border border-[#d29922]/30 rounded-lg p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#d29922]/10 flex items-center justify-center">
                  <span className="text-2xl font-mono font-bold text-[#d29922]">{filteredPolicies.filter(p => p.status === 'in_progress').length}</span>
                </div>
                <div>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">In Progress</p>
                  <p className="text-sm text-[#f0f6fc]">Active Now</p>
                </div>
              </div>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#21262d] flex items-center justify-center">
                  <span className="text-2xl font-mono font-bold text-[#6e7681]">{filteredPolicies.filter(p => p.status === 'planned').length}</span>
                </div>
                <div>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">Planned</p>
                  <p className="text-sm text-[#f0f6fc]">Upcoming</p>
                </div>
              </div>
            </div>

            {/* Policy List */}
            <div className="space-y-4">
              {filteredPolicies.map(policy => {
                const dept = departments.find(d => d.id === policy.department)
                return (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 hover:border-[#8b949e]/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#0d1117] flex items-center justify-center text-2xl">
                          {dept?.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#f0f6fc] text-lg">{policy.title}</h3>
                          <p className="text-sm text-[#8b949e] mt-1">{policy.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-[#6e7681] uppercase tracking-widest">{dept?.name}</span>
                            <span className="text-[#30363d]">•</span>
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${
                              policy.priority === 'high' ? 'bg-transparent border-[#f85149]/50 text-[#f85149]' :
                              policy.priority === 'medium' ? 'bg-transparent border-[#d29922]/50 text-[#d29922]' :
                              'bg-transparent border-[#30363d] text-[#6e7681]'
                            }`}>{policy.priority}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={
                          policy.status === 'completed' ? 'success' :
                          policy.status === 'in_progress' ? 'warning' : 'default'
                        }>
                          {policy.status === 'in_progress' ? 'Active' : policy.status}
                        </StatusBadge>
                        <button
                          onClick={() => openEditWindow('policy', policy, `Edit: ${policy.title}`, `${dept?.name} Department`)}
                          className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center hover:bg-[#00d4ff]/20 hover:border-[#00d4ff] transition-all group"
                          title="Open Edit Window"
                        >
                          <svg className="w-4 h-4 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Status</label>
                        <select
                          value={policy.status}
                          onChange={(e) => { updatePolicy(policy.id, { status: e.target.value }); notify('Status updated') }}
                          className="w-full mt-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff]"
                        >
                          <option value="planned">Planned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Progress</label>
                          <span className="text-lg font-mono font-bold text-[#00d4ff]">{policy.progress}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={policy.progress}
                            onChange={(e) => handleQuickProgressUpdate(policy.id, parseInt(e.target.value))}
                            className="flex-1 accent-[#00d4ff]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Priority</label>
                        <select
                          value={policy.priority}
                          onChange={(e) => { updatePolicy(policy.id, { priority: e.target.value }); notify('Priority updated') }}
                          className="w-full mt-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff]"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>

                    <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${
                        policy.status === 'completed' ? 'bg-[#3fb950]' :
                        policy.status === 'in_progress' ? 'bg-gradient-to-r from-[#00d4ff] to-[#388bfd]' : 'bg-[#6e7681]'
                      }`} style={{ width: `${policy.progress}%` }} />
                    </div>

                    {policy.metrics && Object.keys(policy.metrics).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#30363d]">
                        <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Metrics</label>
                        <div className="grid grid-cols-3 gap-3 mt-3">
                          {Object.entries(policy.metrics).map(([key, value]) => (
                            <div key={key} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
                              <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest block mb-2">{key.replace(/([A-Z])/g, ' $1')}</label>
                              <input
                                type="number"
                                value={value}
                                onChange={(e) => updatePolicyMetrics(policy.id, { [key]: parseInt(e.target.value) || 0 })}
                                className="w-full bg-transparent text-lg font-mono font-semibold text-[#00d4ff] border-0 p-0 focus:ring-0"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ACTIVITY LOG TAB */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#f0f6fc]">Activity Log</h2>
                <p className="text-[#8b949e] mt-1">Track all progress updates and administrative actions</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => clearActivityLog()}>Clear Log</Button>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-mono font-bold text-[#3fb950]">{activityLog.filter(a => a.action === 'LOG_PROGRESS').length}</p>
                <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mt-1">Progress Updates</p>
              </div>
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-mono font-bold text-[#00d4ff]">{activityLog.filter(a => a.action.includes('UPDATE')).length}</p>
                <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mt-1">Total Updates</p>
              </div>
              <div className="bg-[#161b22] border border-[#a371f7]/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-mono font-bold text-[#a371f7]">{activityLog.filter(a => a.action.includes('CREATE') || a.action.includes('ADD')).length}</p>
                <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mt-1">Items Created</p>
              </div>
              <div className="bg-[#161b22] border border-[#d29922]/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-mono font-bold text-[#d29922]">{activityLog.filter(a => Date.now() - new Date(a.timestamp).getTime() < 86400000).length}</p>
                <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mt-1">Last 24 Hours</p>
              </div>
            </div>

            {/* Progress Log Section */}
            <Panel title="Progress Log" subtitle="All policy progress updates with notes">
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {activityLog
                  .filter(a => a.action === 'LOG_PROGRESS')
                  .map((entry) => {
                    const policy = policies.find(p => p.id === entry.metadata?.policyId)
                    const dept = departments.find(d => d.id === entry.metadata?.department || d.id === policy?.department)
                    const progressDelta = entry.metadata?.previousProgress !== undefined
                      ? entry.metadata.progress - entry.metadata.previousProgress
                      : null

                    return (
                      <div key={entry.id} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 hover:border-[#00d4ff]/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                entry.metadata?.progress >= 100 ? 'bg-[#3fb950]/20 text-[#3fb950] border border-[#3fb950]/30' :
                                entry.metadata?.progress >= 50 ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30' :
                                'bg-[#d29922]/20 text-[#d29922] border border-[#d29922]/30'
                              }`}>
                                {entry.metadata?.progress || 0}%
                                {progressDelta !== null && progressDelta !== 0 && (
                                  <span className={`ml-1 ${progressDelta > 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                                    ({progressDelta > 0 ? '+' : ''}{progressDelta})
                                  </span>
                                )}
                              </span>
                              {dept && <span className="text-xs text-[#6e7681] uppercase tracking-widest">{dept.name}</span>}
                            </div>
                            <p className="font-medium text-[#f0f6fc]">{entry.metadata?.policyTitle || policy?.title || 'Unknown Policy'}</p>
                            <p className="text-sm text-[#8b949e] mt-1">{entry.metadata?.note || entry.details}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-xs font-mono text-[#6e7681]">{formatDate(entry.timestamp)}</p>
                            <p className="text-xs font-mono text-[#6e7681]">{formatTime(entry.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                {activityLog.filter(a => a.action === 'LOG_PROGRESS').length === 0 && (
                  <div className="text-center py-8 text-[#6e7681]">
                    <p className="text-sm">No progress updates yet</p>
                    <p className="text-xs mt-1">Update policy progress to see entries here</p>
                  </div>
                )}
              </div>
            </Panel>

            {/* Full Activity Log */}
            <Panel title="All Activity" subtitle={`${activityLog.length} total entries`} collapsible defaultCollapsed>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {activityLog.slice(0, 100).map((entry) => {
                  const getActionColor = (action) => {
                    if (action.includes('PROGRESS') || action.includes('COMPLETE')) return 'text-[#3fb950]'
                    if (action.includes('UPDATE')) return 'text-[#00d4ff]'
                    if (action.includes('CREATE') || action.includes('ADD')) return 'text-[#a371f7]'
                    if (action.includes('DELETE') || action.includes('RESET')) return 'text-[#f85149]'
                    if (action.includes('LOGIN')) return 'text-[#d29922]'
                    return 'text-[#6e7681]'
                  }

                  return (
                    <div key={entry.id} className="flex items-center justify-between py-2 px-3 rounded hover:bg-[#21262d] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-mono font-bold uppercase ${getActionColor(entry.action)}`}>
                          {entry.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-[#f0f6fc]">{entry.details}</span>
                      </div>
                      <span className="text-xs font-mono text-[#6e7681] shrink-0">{formatRelativeTime(entry.timestamp)}</span>
                    </div>
                  )
                })}
              </div>
            </Panel>
          </div>
        )}

        {/* BUDGET TAB */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#f0f6fc]">Financial Management</h2>
                <p className="text-[#8b949e] mt-1">Track spending, allocations, and transactions</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => openEditWindow('budget', budgetData, 'Edit Budget', 'Financial Overview')}
                >
                  Open Editor
                </Button>
                <Button onClick={() => setShowModal('transaction')}>Add Transaction</Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <MetricCard label="Total Budget" value={`$${budgetData.total.toLocaleString()}`} color="green" />
              <MetricCard label="Allocated" value={`$${budgetData.allocated.toLocaleString()}`} color="cyan" />
              <MetricCard label="Spent" value={`$${budgetData.spent.toLocaleString()}`} color="yellow" subtitle={`${((budgetData.spent / budgetData.total) * 100).toFixed(1)}% utilized`} />
            </div>

            <Panel title="Category Breakdown" subtitle="Budget allocation by category">
              <div className="space-y-6">
                {budgetData.categories.map(cat => (
                  <div key={cat.name}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-[#f0f6fc]">{cat.name}</span>
                      <span className="text-sm font-mono text-[#8b949e]">${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()}</span>
                    </div>
                    <ProgressBar value={cat.spent} max={cat.allocated} color={cat.spent / cat.allocated > 0.9 ? 'red' : cat.spent / cat.allocated > 0.7 ? 'yellow' : 'green'} showLabel={false} size="md" />
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Allocated</label>
                        <input type="number" value={cat.allocated} onChange={(e) => updateBudgetCategory(cat.name, { allocated: parseFloat(e.target.value) || 0 })} className="w-full mt-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] font-mono focus:ring-1 focus:ring-[#00d4ff]" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Spent</label>
                        <input type="number" value={cat.spent} onChange={(e) => updateBudgetCategory(cat.name, { spent: parseFloat(e.target.value) || 0 })} className="w-full mt-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] font-mono focus:ring-1 focus:ring-[#00d4ff]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {budgetData.transactions?.length > 0 && (
              <Panel title="Recent Transactions" subtitle={`${budgetData.transactions.length} total transactions`}>
                <div className="space-y-1">
                  {budgetData.transactions.slice(-10).reverse().map(tx => (
                    <div key={tx.id} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-[#21262d] transition-colors">
                      <div>
                        <p className="font-medium text-[#f0f6fc]">{tx.description}</p>
                        <p className="text-xs font-mono text-[#6e7681]">{formatDate(tx.date)} · {tx.category || 'Uncategorized'}</p>
                      </div>
                      <span className={`font-mono font-semibold ${tx.type === 'expense' ? 'text-[#f85149]' : 'text-[#3fb950]'}`}>
                        {tx.type === 'expense' ? '-' : '+'}${tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </div>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc]">Feedback Management</h2>
              <p className="text-[#8b949e] mt-1">Review and respond to student submissions</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <MetricCard label="Total" value={feedback.length} color="cyan" />
              <MetricCard label="New" value={feedback.filter(f => f.status === 'new').length} color="yellow" />
              <MetricCard label="Reviewed" value={feedback.filter(f => f.status === 'reviewed').length} color="purple" />
              <MetricCard label="Resolved" value={feedback.filter(f => f.status === 'resolved').length} color="green" />
            </div>

            <div className="space-y-4">
              {feedback.map(item => (
                <div key={item.id} className={`bg-[#161b22] border-l-2 border rounded-lg p-6 ${
                  item.status === 'new' ? 'border-l-[#d29922] border-[#30363d]' :
                  item.status === 'reviewed' ? 'border-l-[#a371f7] border-[#30363d]' :
                  item.status === 'resolved' ? 'border-l-[#3fb950] border-[#30363d]' : 'border-[#30363d]'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <StatusBadge status={
                      item.status === 'new' ? 'warning' :
                      item.status === 'reviewed' ? 'info' :
                      item.status === 'resolved' ? 'success' : 'default'
                    }>{item.status}</StatusBadge>
                    <span className="text-xs font-mono text-[#6e7681]">{formatDate(item.submittedAt)}</span>
                  </div>
                  <p className="text-[#f0f6fc] mb-3">{item.message}</p>
                  {item.email && <p className="text-sm font-mono text-[#8b949e] mb-3">From: {item.email}</p>}
                  {item.adminNote && (
                    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 mb-3">
                      <p className="text-sm text-[#8b949e]"><strong className="text-[#f0f6fc]">Note:</strong> {item.adminNote}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <select value={item.status} onChange={(e) => { updateFeedbackStatus(item.id, e.target.value); notify('Status updated') }} className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff]">
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                    <input type="text" placeholder="Add note..." className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff]" onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value) { updateFeedbackStatus(item.id, item.status, e.target.value); e.target.value = ''; notify('Note added') }}} />
                  </div>
                </div>
              ))}
              {feedback.length === 0 && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-12 text-center">
                  <p className="text-[#6e7681]">No feedback yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#f0f6fc]">Communications</h2>
                <p className="text-[#8b949e] mt-1">Publish announcements to students</p>
              </div>
              <Button onClick={() => setShowModal('announcement')}>New Announcement</Button>
            </div>

            <div className="space-y-4">
              {[...announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(a => (
                <div key={a.id} className={`bg-[#161b22] border rounded-lg p-6 ${a.pinned ? 'border-[#d29922]' : 'border-[#30363d]'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {a.pinned && <span className="text-[#d29922] text-xs font-bold">PINNED</span>}
                        <StatusBadge status={
                          a.category === 'urgent' ? 'danger' :
                          a.category === 'event' ? 'info' :
                          a.category === 'milestone' ? 'success' : 'default'
                        }>{a.category}</StatusBadge>
                      </div>
                      <h3 className="text-lg font-semibold text-[#f0f6fc]">{a.title}</h3>
                      <p className="text-[#8b949e] mt-2">{a.content}</p>
                      <p className="text-xs font-mono text-[#6e7681] mt-4">{formatDate(a.createdAt)}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => openEditWindow('announcement', a, `Edit: ${a.title}`, 'Announcement')}
                        className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center hover:bg-[#00d4ff]/20 hover:border-[#00d4ff] transition-all"
                        title="Edit"
                      >
                        <svg className="w-4 h-4 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => { pinAnnouncement(a.id, !a.pinned); notify(a.pinned ? 'Unpinned' : 'Pinned') }} className="px-2 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center hover:border-[#d29922] text-[#8b949e] hover:text-[#d29922] transition-all text-xs font-medium">PIN</button>
                      <button onClick={() => { deleteAnnouncement(a.id); notify('Deleted') }} className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center hover:border-[#f85149] text-[#8b949e] hover:text-[#f85149] transition-all">×</button>
                    </div>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-12 text-center">
                  <p className="text-[#6e7681]">No announcements yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc]">Analytics & Insights</h2>
              <p className="text-[#8b949e] mt-1">Deep dive into platform performance metrics</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Department Performance */}
              <Panel title="Department Performance" subtitle="Progress by department">
                <HorizontalBarChart
                  data={departments.map(d => ({
                    label: d.name,
                    value: getOverallProgress(policies.filter(p => p.department === d.id)),
                    color: getOverallProgress(policies.filter(p => p.department === d.id)) >= 70 ? '#3fb950' :
                           getOverallProgress(policies.filter(p => p.department === d.id)) >= 40 ? '#d29922' : '#f85149'
                  }))}
                  maxValue={100}
                />
              </Panel>

              {/* Status Distribution */}
              <Panel title="Initiative Status" subtitle="Distribution by status">
                <div className="flex items-center justify-center">
                  <DonutChart
                    data={[
                      { value: statusCounts.completed, color: '#3fb950' },
                      { value: statusCounts.in_progress, color: '#d29922' },
                      { value: statusCounts.planned, color: '#6e7681' },
                    ]}
                    size={180}
                    thickness={20}
                    centerValue={policies.length}
                    centerLabel="Total"
                  />
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#3fb950]" />
                    <span className="text-sm text-[#8b949e]">Completed ({statusCounts.completed})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#d29922]" />
                    <span className="text-sm text-[#8b949e]">Active ({statusCounts.in_progress})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#6e7681]" />
                    <span className="text-sm text-[#8b949e]">Planned ({statusCounts.planned})</span>
                  </div>
                </div>
              </Panel>

              {/* Activity Analysis */}
              <Panel title="Activity Log Analysis" subtitle={`${activityLog.length} total events recorded`}>
                <div className="space-y-4">
                  {(() => {
                    const actionCounts = activityLog.reduce((acc, a) => {
                      acc[a.action] = (acc[a.action] || 0) + 1
                      return acc
                    }, {})
                    const topActions = Object.entries(actionCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                    return topActions.map(([action, count]) => (
                      <div key={action} className="flex items-center justify-between">
                        <span className="text-sm text-[#8b949e] font-mono">{action}</span>
                        <span className="text-sm font-mono text-[#00d4ff]">{count}</span>
                      </div>
                    ))
                  })()}
                </div>
              </Panel>

              {/* Budget Analytics */}
              <Panel title="Budget Utilization" subtitle="Spending analysis">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#0d1117] rounded-lg">
                    <span className="text-sm text-[#8b949e]">Total Budget</span>
                    <span className="text-lg font-mono font-bold text-[#3fb950]">${budgetData.total.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#0d1117] rounded-lg">
                    <span className="text-sm text-[#8b949e]">Amount Spent</span>
                    <span className="text-lg font-mono font-bold text-[#d29922]">${budgetData.spent.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#0d1117] rounded-lg">
                    <span className="text-sm text-[#8b949e]">Remaining</span>
                    <span className="text-lg font-mono font-bold text-[#00d4ff]">${(budgetData.total - budgetData.spent).toLocaleString()}</span>
                  </div>
                  <ProgressBar value={budgetData.spent} max={budgetData.total} color={budgetData.spent / budgetData.total > 0.8 ? 'red' : 'green'} />
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc]">Settings</h2>
              <p className="text-[#8b949e] mt-1">Data management and system configuration</p>
            </div>

            <Panel title="Backup & Restore" subtitle="Export or import platform data">
              <div className="flex gap-3">
                <Button onClick={handleExport}>Export Data</Button>
                <label className="px-4 py-2.5 rounded-md font-medium text-xs uppercase tracking-wider bg-[#21262d] text-[#8b949e] border border-[#30363d] hover:text-[#f0f6fc] hover:bg-[#30363d] cursor-pointer transition-all">
                  Import Data
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </Panel>

            <Panel title="Storage Metrics" subtitle="Data storage overview">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Policies', value: policies.length },
                  { label: 'Announcements', value: announcements.length },
                  { label: 'Feedback', value: feedback.length },
                  { label: 'Activity Log', value: activityLog.length },
                ].map(item => (
                  <div key={item.label} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                    <p className="text-2xl font-mono font-semibold text-[#00d4ff]">{item.value}</p>
                    <p className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mt-2">{item.label}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Activity Log Management" subtitle="Clear activity history">
              <Button variant="secondary" onClick={() => { if(confirm('Clear all activity?')) { clearActivityLog(); notify('Activity cleared') }}}>Clear Activity Log</Button>
            </Panel>

            <div className="bg-[#f85149]/5 border border-[#f85149]/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#f85149] mb-2">Danger Zone</h3>
              <p className="text-[#8b949e] mb-6">This action cannot be undone. All data will be reset to initial state.</p>
              <Button variant="danger" onClick={() => { if(confirm('Reset ALL data?')) { if(confirm('Are you sure?')) { resetAllData(); notify('Data reset') }}}}>Reset All Data</Button>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {showModal === 'announcement' && (
        <Modal title="New Announcement" onClose={() => setShowModal(null)}>
          <form onSubmit={(e) => { e.preventDefault(); addAnnouncement(announcementForm); setAnnouncementForm({ title: '', content: '', category: 'general', pinned: false }); setShowModal(null); notify('Announcement published') }} className="space-y-4">
            <Input label="Title" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} required />
            <Select label="Category" value={announcementForm.category} onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value })} options={[
              { value: 'general', label: 'General' },
              { value: 'policy', label: 'Policy Update' },
              { value: 'event', label: 'Event' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'milestone', label: 'Milestone' },
            ]} />
            <div>
              <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">Content</label>
              <textarea value={announcementForm.content} onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} rows={4} required className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] resize-none focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm" />
            </div>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={announcementForm.pinned} onChange={(e) => setAnnouncementForm({ ...announcementForm, pinned: e.target.checked })} className="w-4 h-4 bg-[#0d1117] border-[#30363d] rounded text-[#00d4ff] focus:ring-[#00d4ff]" />
              <span className="text-sm text-[#8b949e]">Pin announcement</span>
            </label>
            <div className="flex gap-3 pt-2">
              <Button type="submit">Publish</Button>
              <Button variant="secondary" type="button" onClick={() => setShowModal(null)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}

      {showModal === 'device' && (
        <Modal title="Add Device" onClose={() => setShowModal(null)}>
          <form onSubmit={(e) => { e.preventDefault(); addTechDevice({ ...deviceForm, onLoan: 0 }); setDeviceForm({ type: 'laptop-windows', name: '', total: 0, available: 0 }); setShowModal(null); notify('Device added') }} className="space-y-4">
            <Select label="Type" value={deviceForm.type} onChange={(e) => setDeviceForm({ ...deviceForm, type: e.target.value })} options={[
              { value: 'laptop-windows', label: 'Windows Laptop' },
              { value: 'laptop-mac', label: 'MacBook' },
              { value: 'hotspot', label: 'Wi-Fi Hotspot' },
              { value: 'tablet', label: 'Tablet' },
              { value: 'charger', label: 'Charger' },
            ]} />
            <Input label="Name" value={deviceForm.name} onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Total" type="number" value={deviceForm.total} onChange={(e) => setDeviceForm({ ...deviceForm, total: parseInt(e.target.value) || 0 })} />
              <Input label="Available" type="number" value={deviceForm.available} onChange={(e) => setDeviceForm({ ...deviceForm, available: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">Add Device</Button>
              <Button variant="secondary" type="button" onClick={() => setShowModal(null)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}

      {showModal === 'loan' && (
        <Modal title="Record Loan" onClose={() => setShowModal(null)}>
          <form onSubmit={(e) => { e.preventDefault(); addTechLoan(loanForm); setLoanForm({ studentName: '', studentEmail: '', deviceType: '', dueDate: '' }); setShowModal(null); notify('Loan recorded') }} className="space-y-4">
            <Input label="Student Name" value={loanForm.studentName} onChange={(e) => setLoanForm({ ...loanForm, studentName: e.target.value })} required />
            <Input label="Email" type="email" value={loanForm.studentEmail} onChange={(e) => setLoanForm({ ...loanForm, studentEmail: e.target.value })} required />
            <Input label="Device Type" value={loanForm.deviceType} onChange={(e) => setLoanForm({ ...loanForm, deviceType: e.target.value })} required />
            <Input label="Due Date" type="date" value={loanForm.dueDate} onChange={(e) => setLoanForm({ ...loanForm, dueDate: e.target.value })} required />
            <div className="flex gap-3 pt-2">
              <Button type="submit">Record Loan</Button>
              <Button variant="secondary" type="button" onClick={() => setShowModal(null)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}

      {showModal === 'training' && (
        <Modal title="Add Training Session" onClose={() => setShowModal(null)}>
          <form onSubmit={(e) => { e.preventDefault(); addTrainingSession(trainingForm.type, trainingForm); setTrainingForm({ type: 'mentalHealthFirstAid', title: '', date: '', location: '', capacity: 0 }); setShowModal(null); notify('Session added') }} className="space-y-4">
            <Select label="Type" value={trainingForm.type} onChange={(e) => setTrainingForm({ ...trainingForm, type: e.target.value })} options={[
              { value: 'mentalHealthFirstAid', label: 'Mental Health First Aid' },
            ]} />
            <Input label="Title" value={trainingForm.title} onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })} required />
            <Input label="Date" type="date" value={trainingForm.date} onChange={(e) => setTrainingForm({ ...trainingForm, date: e.target.value })} required />
            <Input label="Location" value={trainingForm.location} onChange={(e) => setTrainingForm({ ...trainingForm, location: e.target.value })} />
            <Input label="Capacity" type="number" value={trainingForm.capacity} onChange={(e) => setTrainingForm({ ...trainingForm, capacity: parseInt(e.target.value) || 0 })} />
            <div className="flex gap-3 pt-2">
              <Button type="submit">Add Session</Button>
              <Button variant="secondary" type="button" onClick={() => setShowModal(null)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}

      {showModal === 'transaction' && (
        <Modal title="Add Transaction" onClose={() => setShowModal(null)}>
          <form onSubmit={(e) => { e.preventDefault(); addBudgetTransaction(transactionForm); setTransactionForm({ type: 'expense', amount: 0, description: '', category: '' }); setShowModal(null); notify('Transaction added') }} className="space-y-4">
            <Select label="Type" value={transactionForm.type} onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })} options={[
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' },
            ]} />
            <Input label="Amount" type="number" value={transactionForm.amount} onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) || 0 })} required />
            <Input label="Description" value={transactionForm.description} onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })} required />
            <Select label="Category" value={transactionForm.category} onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })} options={[
              { value: '', label: 'Select...' },
              ...budgetData.categories.map(c => ({ value: c.name, label: c.name }))
            ]} />
            <div className="flex gap-3 pt-2">
              <Button type="submit">Add Transaction</Button>
              <Button variant="secondary" type="button" onClick={() => setShowModal(null)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT WINDOW */}
      <EditWindow
        isOpen={editWindow.isOpen}
        onClose={closeEditWindow}
        title={editWindow.title}
        subtitle={editWindow.subtitle}
        type={editWindow.type}
        data={editWindow.data}
        onSave={handleEditWindowSave}
      >
        {({ data, onChange, isDirty }) => {
          if (!data) return null

          switch (editWindow.type) {
            case 'policy':
              return <PolicyEditor data={data} onChange={onChange} departments={departments} />
            case 'announcement':
              return <AnnouncementEditor data={data} onChange={onChange} />
            case 'quickStats':
              return <QuickStatsEditor data={data} onChange={onChange} />
            case 'budget':
              return <BudgetEditor data={data} onChange={onChange} />
            default:
              return null
          }
        }}
      </EditWindow>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
