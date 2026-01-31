import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { departments, getOverallProgress, getStatusCounts, budgetCategories, sgPriorities } from '../../lib/data'

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

// Live clock component
const LiveClock = () => {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="font-mono text-xs text-[#6e7681]">
      {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const {
    isAdmin, isLoaded, policies, operationalData, budgetData, announcements,
    activityLog, feedback, quickStats,
    updatePolicy, updatePolicyMetrics, logPolicyProgress,
    addAnnouncement, deleteAnnouncement, pinAnnouncement,
    updateFeedbackStatus,
    addTechDevice, updateTechDevice, deleteTechDevice, addTechLoan, updateTechLoan,
    updatePantryLocation, logPantryVisit, logPantryDonation,
    addTrainingSession,
    updateBudget, updateBudgetCategory, addBudgetTransaction,
    addLineItem, updateLineItem, deleteLineItem,
    submitFundingRequest, reviewFundingRequest, checkRateLimit,
    scanForReallocations, reviewReallocation,
    exportBudgetCSV, getBudgetSummaryStats,
    updateQuickStats,
    exportAllData, importData, resetAllData, clearActivityLog,
  } = useApp()

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDept, setSelectedDept] = useState('all')
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', category: 'general', pinned: false })
  const [showModal, setShowModal] = useState(null)
  const [deviceForm, setDeviceForm] = useState({ type: 'laptop-windows', name: '', total: 0, available: 0 })
  const [loanForm, setLoanForm] = useState({ studentName: '', studentEmail: '', deviceType: '', dueDate: '' })
  const [trainingForm, setTrainingForm] = useState({ type: 'mentalHealthFirstAid', title: '', date: '', location: '', capacity: 0 })
  const [transactionForm, setTransactionForm] = useState({ type: 'expense', amount: 0, description: '', category: '' })
  const [progressLogForm, setProgressLogForm] = useState({ policyId: null, progress: 0, note: '' })
  const [quickEditPolicy, setQuickEditPolicy] = useState(null)
  const [quickEditProgress, setQuickEditProgress] = useState(0)
  const [toast, setToast] = useState(null)

  // Budget Module State
  const [budgetSubTab, setBudgetSubTab] = useState('overview')
  const [lineItemForm, setLineItemForm] = useState({ orgName: '', category: 'Events', requested: 0, approved: 0, receiptsLink: '', impactNotes: '' })
  const [editingLineItem, setEditingLineItem] = useState(null)
  const [budgetLoading, setBudgetLoading] = useState(false)

  // Quick edit progress handler
  const handleQuickProgressUpdate = (policyId, newProgress) => {
    const policy = policies.find(p => p.id === policyId)
    if (!policy) return
    const clampedProgress = Math.max(0, Math.min(100, newProgress))
    logPolicyProgress(policyId, clampedProgress, `Progress updated to ${clampedProgress}%`)
    notify(`${policy.title}: ${clampedProgress}%`)
  }

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push('/admin/login')
    }
  }, [isLoaded, isAdmin, router])

  if (!isLoaded || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse delay-100" />
          <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse delay-200" />
        </div>
      </div>
    )
  }

  const notify = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  const overallProgress = getOverallProgress(policies)
  const statusCounts = getStatusCounts(policies)
  const filteredPolicies = selectedDept === 'all' ? policies : policies.filter(p => p.department === selectedDept)

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projectbold-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    notify('Data exported')
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          importData(data)
          notify('Data imported')
        } catch {
          notify('Import failed')
        }
      }
      reader.readAsText(file)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'policies', label: 'Policies' },
    { id: 'operations', label: 'Operations' },
    { id: 'budget', label: 'Budget' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'activity', label: 'Activity' },
    { id: 'settings', label: 'Settings' },
  ]

  // Modal Component
  const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-lg w-full shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
          <h3 className="text-base font-semibold text-[#f0f6fc]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center hover:bg-[#30363d] hover:border-[#8b949e] transition-all">
            <span className="text-[#8b949e] text-lg leading-none">&times;</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )

  // Input Component
  const Input = ({ label, ...props }) => (
    <div>
      {label && <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">{label}</label>}
      <input {...props} className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] font-mono text-sm" />
    </div>
  )

  // Select Component
  const Select = ({ label, options, ...props }) => (
    <div>
      {label && <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">{label}</label>}
      <select {...props} className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm">
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  )

  // Button Component
  const Button = ({ variant = 'primary', children, ...props }) => {
    const base = "px-5 py-2.5 rounded-lg font-medium text-sm transition-all border"
    const variants = {
      primary: "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/50 hover:bg-[#00d4ff]/20 hover:border-[#00d4ff] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] active:scale-[0.98]",
      secondary: "bg-[#21262d] text-[#8b949e] border-[#30363d] hover:text-[#f0f6fc] hover:bg-[#30363d] hover:border-[#8b949e]",
      danger: "bg-[#f85149]/10 text-[#f85149] border-[#f85149]/50 hover:bg-[#f85149]/20 hover:border-[#f85149] hover:shadow-[0_0_20px_rgba(248,81,73,0.3)]",
    }
    return <button {...props} className={`${base} ${variants[variant]}`}>{children}</button>
  }

  // Stat Card
  const StatCard = ({ value, label, color = 'cyan' }) => {
    const colors = {
      cyan: 'text-[#00d4ff] border-[#00d4ff]/30',
      green: 'text-[#3fb950] border-[#3fb950]/30',
      yellow: 'text-[#d29922] border-[#d29922]/30',
      purple: 'text-[#a371f7] border-[#a371f7]/30',
      red: 'text-[#f85149] border-[#f85149]/30',
    }
    return (
      <div className={`bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-l-2 hover:${colors[color].split(' ')[1]} transition-all`}>
        <p className={`text-3xl font-mono font-semibold ${colors[color].split(' ')[0]} tracking-tight`}>{value}</p>
        <p className="text-[#6e7681] text-xs uppercase tracking-wider mt-2">{label}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <Head>
        <title>Admin | Project Bold</title>
      </Head>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#161b22] border border-[#00d4ff]/50 text-[#00d4ff] px-6 py-3 rounded-lg shadow-lg shadow-[#00d4ff]/10 text-sm font-mono animate-[fadeIn_0.2s]">
          {toast}
        </div>
      )}

      {/* Command Center Header */}
      <header className="bg-[#0d1117]/95 backdrop-blur-xl border-b border-[#30363d] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-[#8b949e] text-xs font-medium hover:text-[#00d4ff] transition-colors flex items-center gap-1.5">
                <span>&larr;</span>
                <span>EXIT</span>
              </Link>
              <div className="h-4 w-px bg-[#30363d]" />
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#3fb950] rounded-full animate-pulse" />
                <h1 className="text-[#f0f6fc] text-sm font-semibold tracking-widest uppercase">Command Center</h1>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <LiveClock />
              <div className="h-4 w-px bg-[#30363d]" />
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-[#6e7681] uppercase tracking-[0.2em]">Project Bold</span>
                <div className="px-2 py-0.5 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded text-[#3fb950] text-[9px] font-mono tracking-wider">ONLINE</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-[#0d1117] border-b border-[#30363d]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-[1px] ${
                  activeTab === tab.id
                    ? 'text-[#00d4ff] border-[#00d4ff]'
                    : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* OVERVIEW - Command Center */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* System Status Bar */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#00d4ff] to-[#00d4ff]/0" />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[#6e7681] uppercase tracking-[0.15em]">Overall</span>
                  <div className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full animate-pulse" />
                </div>
                <p className="text-3xl font-mono font-bold text-[#00d4ff] mt-2 tracking-tight">{overallProgress}%</p>
              </div>
              <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#3fb950] to-[#3fb950]/0" />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[#6e7681] uppercase tracking-[0.15em]">Completed</span>
                  <div className="w-1.5 h-1.5 bg-[#3fb950] rounded-full" />
                </div>
                <p className="text-3xl font-mono font-bold text-[#3fb950] mt-2 tracking-tight">{statusCounts.completed}</p>
              </div>
              <div className="bg-[#161b22] border border-[#d29922]/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#d29922] to-[#d29922]/0" />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[#6e7681] uppercase tracking-[0.15em]">Active</span>
                  <div className="w-1.5 h-1.5 bg-[#d29922] rounded-full animate-pulse" />
                </div>
                <p className="text-3xl font-mono font-bold text-[#d29922] mt-2 tracking-tight">{statusCounts.in_progress}</p>
              </div>
              <div className="bg-[#161b22] border border-[#a371f7]/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#a371f7] to-[#a371f7]/0" />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[#6e7681] uppercase tracking-[0.15em]">Feedback</span>
                  {feedback.filter(f => f.status === 'new').length > 0 && <div className="w-1.5 h-1.5 bg-[#a371f7] rounded-full animate-pulse" />}
                </div>
                <p className="text-3xl font-mono font-bold text-[#a371f7] mt-2 tracking-tight">{feedback.filter(f => f.status === 'new').length}</p>
              </div>
            </div>

            {/* Quick Stats - Editable */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
              <div className="px-5 py-3 border-b border-[#30363d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#00d4ff] rounded-full" />
                  <span className="text-[9px] font-bold text-[#6e7681] uppercase tracking-[0.15em]">Platform Metrics</span>
                </div>
                <span className="text-[9px] font-mono text-[#6e7681]">Click to edit</span>
              </div>
              <div className="grid grid-cols-4 divide-x divide-[#30363d]">
                {[
                  { key: 'totalStudentsReached', label: 'Students Reached', color: '#00d4ff' },
                  { key: 'activeInitiatives', label: 'Active Initiatives', color: '#3fb950' },
                  { key: 'eventsThisMonth', label: 'Events This Month', color: '#d29922' },
                  { key: 'feedbackReceived', label: 'Total Feedback', color: '#a371f7' },
                ].map(item => (
                  <div key={item.key} className="p-4 hover:bg-[#21262d]/50 transition-colors">
                    <label className="text-[9px] font-bold text-[#6e7681] uppercase tracking-[0.1em] block mb-2">{item.label}</label>
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
            </div>

            {/* Department Command Panels */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
              <div className="px-5 py-3 border-b border-[#30363d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#3fb950] rounded-full animate-pulse" />
                  <span className="text-[9px] font-bold text-[#6e7681] uppercase tracking-[0.15em]">Department Control</span>
                </div>
                <span className="text-[9px] font-mono text-[#6e7681]">Real-time progress editing</span>
              </div>
              <div className="p-5 space-y-4">
                {departments.map(dept => {
                  const deptPolicies = policies.filter(p => p.department === dept.id)
                  const deptProgress = getOverallProgress(deptPolicies)
                  return (
                    <div key={dept.id} className="group">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-xl">{dept.icon}</span>
                        <span className="font-medium text-[#f0f6fc] text-sm flex-1">{dept.name}</span>
                        <span className="text-xl font-mono font-bold text-[#00d4ff] tabular-nums">{deptProgress}%</span>
                      </div>
                      {/* Individual policy progress controls */}
                      <div className="ml-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {deptPolicies.map(policy => (
                          <div key={policy.id} className="bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 hover:border-[#00d4ff]/50 transition-colors group/policy">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-[#8b949e] truncate flex-1" title={policy.title}>{policy.title}</span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={policy.progress}
                                  onChange={(e) => handleQuickProgressUpdate(policy.id, parseInt(e.target.value) || 0)}
                                  className="w-12 text-right bg-transparent text-sm font-mono font-semibold text-[#00d4ff] border-0 p-0 focus:ring-0 focus:outline-none"
                                />
                                <span className="text-[#6e7681] text-xs">%</span>
                              </div>
                            </div>
                            <div className="h-1 bg-[#21262d] rounded-full overflow-hidden mt-1.5">
                              <div className={`h-full rounded-full transition-all ${
                                policy.progress >= 100 ? 'bg-[#3fb950]' :
                                policy.progress >= 50 ? 'bg-[#00d4ff]' :
                                policy.progress > 0 ? 'bg-[#d29922]' : 'bg-[#6e7681]'
                              }`} style={{ width: `${policy.progress}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
              <div className="px-5 py-3 border-b border-[#30363d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#3fb950] rounded-full animate-pulse" />
                  <span className="text-[9px] font-bold text-[#6e7681] uppercase tracking-[0.15em]">Activity Feed</span>
                </div>
                <span className="text-[9px] font-mono text-[#6e7681]">{activityLog.length} entries</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {activityLog.slice(0, 15).map(entry => {
                  const dept = departments.find(d => d.id === entry.category)
                  const hasProgress = entry.metadata?.progress !== undefined
                  return (
                    <div key={entry.id} className="flex items-center gap-3 px-5 py-3 border-b border-[#21262d] last:border-0 hover:bg-[#21262d]/50 transition-colors">
                      <div className={`w-1 h-1 rounded-full ${hasProgress ? 'bg-[#3fb950]' : 'bg-[#00d4ff]'}`} />
                      {dept && <span className="text-sm">{dept.icon}</span>}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#f0f6fc] truncate">{entry.details}</p>
                        <p className="text-[10px] font-mono text-[#6e7681]">{formatTime(entry.timestamp)}</p>
                      </div>
                      {hasProgress && (
                        <span className="px-2 py-0.5 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded text-[10px] font-mono font-bold text-[#3fb950]">
                          {entry.metadata.progress}%
                        </span>
                      )}
                    </div>
                  )
                })}
                {activityLog.length === 0 && <p className="text-[#6e7681] text-xs py-6 text-center">No activity recorded</p>}
              </div>
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Communications</span>
                </div>
                <h2 className="text-3xl font-semibold text-[#f0f6fc] tracking-tight">Announcements</h2>
                <p className="text-[#8b949e] mt-1">Communicate directly with students</p>
              </div>
              <Button onClick={() => setShowModal('announcement')}>New Announcement</Button>
            </div>

            <div className="space-y-4">
              {[...announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(a => (
                <div key={a.id} className={`bg-[#161b22] border rounded-lg p-6 ${a.pinned ? 'border-[#d29922]' : 'border-[#30363d]'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {a.pinned && <span className="text-[#d29922]">&#9733;</span>}
                        <span className={`px-2.5 py-1 rounded border text-xs font-mono ${
                          a.category === 'urgent' ? 'bg-transparent border-[#f85149]/50 text-[#f85149]' :
                          a.category === 'event' ? 'bg-transparent border-[#a371f7]/50 text-[#a371f7]' :
                          a.category === 'milestone' ? 'bg-transparent border-[#3fb950]/50 text-[#3fb950]' :
                          'bg-transparent border-[#30363d] text-[#8b949e]'
                        }`}>{a.category}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-[#f0f6fc]">{a.title}</h3>
                      <p className="text-[#8b949e] mt-2">{a.content}</p>
                      <p className="text-xs font-mono text-[#6e7681] mt-4">{formatDate(a.createdAt)}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => pinAnnouncement(a.id, !a.pinned)} className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center hover:border-[#d29922] text-[#8b949e] hover:text-[#d29922] transition-all">&#9733;</button>
                      <button onClick={() => { deleteAnnouncement(a.id); notify('Deleted') }} className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center hover:border-[#f85149] text-[#8b949e] hover:text-[#f85149] transition-all">&times;</button>
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

            {showModal === 'announcement' && (
              <Modal title="New Announcement" onClose={() => setShowModal(null)}>
                <form onSubmit={(e) => { e.preventDefault(); addAnnouncement(announcementForm); setAnnouncementForm({ title: '', content: '', category: 'general', pinned: false }); setShowModal(null); notify('Published') }} className="space-y-4">
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
          </div>
        )}

        {/* POLICIES */}
        {activeTab === 'policies' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Policy Management</span>
                </div>
                <h2 className="text-3xl font-semibold text-[#f0f6fc] tracking-tight">Policies</h2>
                <p className="text-[#8b949e] mt-1">Manage all 40 policy initiatives</p>
              </div>
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff]">
                <option value="all">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              {filteredPolicies.map(policy => (
                <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-[#8b949e]/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{departments.find(d => d.id === policy.department)?.icon}</span>
                      <div>
                        <h3 className="font-semibold text-[#f0f6fc]">{policy.title}</h3>
                        <p className="text-sm text-[#8b949e] mt-0.5">{policy.description}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded border text-xs font-mono ${
                      policy.priority === 'high' ? 'bg-transparent border-[#f85149]/50 text-[#f85149]' :
                      policy.priority === 'medium' ? 'bg-transparent border-[#d29922]/50 text-[#d29922]' :
                      'bg-transparent border-[#30363d] text-[#6e7681]'
                    }`}>{policy.priority}</span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Status</label>
                      <select value={policy.status} onChange={(e) => { updatePolicy(policy.id, { status: e.target.value }); notify('Updated') }} className="w-full mt-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff]">
                        <option value="planned">Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Progress</label>
                        <button
                          onClick={() => { setProgressLogForm({ policyId: policy.id, progress: policy.progress, note: '' }); setShowModal('progressLog') }}
                          className="text-[10px] font-semibold text-[#00d4ff] uppercase tracking-widest hover:text-[#00d4ff]/80 transition flex items-center gap-1"
                        >
                          <span>+</span> Log Update
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={policy.progress}
                          onChange={(e) => handleQuickProgressUpdate(policy.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-center text-lg font-mono font-bold text-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff]"
                        />
                        <span className="text-[#6e7681] text-sm">%</span>
                        <input type="range" min="0" max="100" value={policy.progress} onChange={(e) => handleQuickProgressUpdate(policy.id, parseInt(e.target.value))} className="flex-1 accent-[#00d4ff]" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Priority</label>
                      <select value={policy.priority} onChange={(e) => { updatePolicy(policy.id, { priority: e.target.value }); notify('Updated') }} className="w-full mt-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff]">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-1 bg-[#21262d] rounded-full overflow-hidden mb-4">
                    <div className={`h-full rounded-full transition-all ${
                      policy.status === 'completed' ? 'bg-[#3fb950]' :
                      policy.status === 'in_progress' ? 'bg-[#00d4ff]' : 'bg-[#6e7681]'
                    }`} style={{ width: `${policy.progress}%` }} />
                  </div>

                  {policy.metrics && (
                    <div>
                      <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Metrics</label>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        {Object.entries(policy.metrics).map(([key, value]) => (
                          <div key={key} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
                            <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest block mb-2">{key.replace(/([A-Z])/g, ' $1')}</label>
                            <input type="number" value={value} onChange={(e) => updatePolicyMetrics(policy.id, { [key]: parseInt(e.target.value) || 0 })} className="w-full bg-transparent text-lg font-mono font-semibold text-[#00d4ff] border-0 p-0 focus:ring-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {showModal === 'progressLog' && progressLogForm.policyId && (
              <Modal title="Log Progress Update" onClose={() => setShowModal(null)}>
                {(() => {
                  const policy = policies.find(p => p.id === progressLogForm.policyId)
                  const dept = departments.find(d => d.id === policy?.department)
                  return (
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      logPolicyProgress(progressLogForm.policyId, progressLogForm.progress, progressLogForm.note)
                      setProgressLogForm({ policyId: null, progress: 0, note: '' })
                      setShowModal(null)
                      notify('Progress logged')
                    }} className="space-y-4">
                      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl">{dept?.icon}</span>
                          <div>
                            <p className="font-semibold text-[#f0f6fc]">{policy?.title}</p>
                            <p className="text-xs text-[#6e7681] font-mono uppercase">{dept?.name}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Progress</label>
                          <span className="text-lg font-mono font-semibold text-[#00d4ff]">{progressLogForm.progress}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progressLogForm.progress}
                          onChange={(e) => setProgressLogForm({ ...progressLogForm, progress: parseInt(e.target.value) })}
                          className="w-full accent-[#00d4ff]"
                        />
                        <div className="flex justify-between text-[10px] text-[#6e7681] mt-1 font-mono">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">Update Note</label>
                        <textarea
                          value={progressLogForm.note}
                          onChange={(e) => setProgressLogForm({ ...progressLogForm, note: e.target.value })}
                          placeholder="Describe what was accomplished..."
                          rows={3}
                          className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] resize-none focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button type="submit">Log Progress</Button>
                        <Button variant="secondary" type="button" onClick={() => setShowModal(null)}>Cancel</Button>
                      </div>
                    </form>
                  )
                })()}
              </Modal>
            )}
          </div>
        )}

        {/* OPERATIONS */}
        {activeTab === 'operations' && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Operational Management</span>
              </div>
              <h2 className="text-3xl font-semibold text-[#f0f6fc] tracking-tight">Operations</h2>
              <p className="text-[#8b949e] mt-1">Manage programs and services</p>
            </div>

            {/* Tech Loaner */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#30363d]">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Tech Loaner Program</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setShowModal('device')}>Add Device</Button>
                  <Button onClick={() => setShowModal('loan')}>Record Loan</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#30363d]">
                      <th className="text-left py-3 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Device</th>
                      <th className="text-center py-3 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Total</th>
                      <th className="text-center py-3 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Available</th>
                      <th className="text-center py-3 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">On Loan</th>
                      <th className="text-right py-3 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operationalData.techLoaners.devices.map(device => (
                      <tr key={device.id} className="border-b border-[#21262d] hover:bg-[#21262d]/50">
                        <td className="py-4 font-medium text-[#f0f6fc]">{device.name}</td>
                        <td className="py-4 text-center">
                          <input type="number" value={device.total} onChange={(e) => updateTechDevice(device.id, { total: parseInt(e.target.value) || 0 })} className="w-16 text-center bg-[#0d1117] border border-[#30363d] rounded-lg py-1 text-[#f0f6fc] font-mono" />
                        </td>
                        <td className="py-4 text-center">
                          <input type="number" value={device.available} onChange={(e) => updateTechDevice(device.id, { available: parseInt(e.target.value) || 0 })} className="w-16 text-center bg-[#0d1117] border border-[#30363d] rounded-lg py-1 text-[#3fb950] font-mono" />
                        </td>
                        <td className="py-4 text-center">
                          <input type="number" value={device.onLoan} onChange={(e) => updateTechDevice(device.id, { onLoan: parseInt(e.target.value) || 0 })} className="w-16 text-center bg-[#0d1117] border border-[#30363d] rounded-lg py-1 text-[#d29922] font-mono" />
                        </td>
                        <td className="py-4 text-right">
                          <button onClick={() => { deleteTechDevice(device.id); notify('Deleted') }} className="text-[#f85149] text-sm font-medium hover:underline">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {operationalData.techLoaners.loans.filter(l => l.status === 'active').length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#30363d]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-[#d29922] rounded-full animate-pulse" />
                    <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Active Loans</span>
                  </div>
                  {operationalData.techLoaners.loans.filter(l => l.status === 'active').map(loan => (
                    <div key={loan.id} className="flex items-center justify-between py-3 border-b border-[#21262d]">
                      <div>
                        <p className="font-medium text-[#f0f6fc]">{loan.studentName}</p>
                        <p className="text-sm font-mono text-[#8b949e]">{loan.deviceType} &middot; Due {loan.dueDate}</p>
                      </div>
                      <button onClick={() => { updateTechLoan(loan.id, { status: 'returned' }); notify('Returned') }} className="text-[#00d4ff] text-sm font-medium hover:underline">Mark Returned</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Food Pantry */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#30363d]">
                <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Food Pantry</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#0d1117] border border-[#d29922]/30 rounded-lg p-4 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#d29922]">{operationalData.foodPantry.totalVisits}</p>
                  <p className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mt-2">Total Visits</p>
                </div>
                <div className="bg-[#0d1117] border border-[#3fb950]/30 rounded-lg p-4 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#3fb950]">${operationalData.foodPantry.donations}</p>
                  <p className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mt-2">Donations</p>
                </div>
                <div className="bg-[#0d1117] border border-[#00d4ff]/30 rounded-lg p-4 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#00d4ff]">{operationalData.foodPantry.locations.length}</p>
                  <p className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mt-2">Locations</p>
                </div>
              </div>
              <div className="space-y-4">
                {operationalData.foodPantry.locations.map(loc => (
                  <div key={loc.id} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-[#f0f6fc]">{loc.name}</h4>
                        <p className="text-sm font-mono text-[#8b949e]">{loc.hours}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { logPantryVisit(loc.id, 1); notify('+1 visit') }} className="px-3 py-1 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-[#00d4ff] font-mono hover:border-[#00d4ff] transition-colors">+1</button>
                        <button onClick={() => { logPantryVisit(loc.id, 10); notify('+10 visits') }} className="px-3 py-1 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-[#00d4ff] font-mono hover:border-[#00d4ff] transition-colors">+10</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Visits</label>
                        <input type="number" value={loc.visits || 0} onChange={(e) => updatePantryLocation(loc.id, { visits: parseInt(e.target.value) || 0 })} className="w-full mt-2 px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-[#f0f6fc] font-mono focus:ring-1 focus:ring-[#00d4ff]" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Inventory</label>
                        <select value={loc.inventory || 'unknown'} onChange={(e) => updatePantryLocation(loc.id, { inventory: e.target.value })} className="w-full mt-2 px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff]">
                          <option value="well-stocked">Well Stocked</option>
                          <option value="moderate">Moderate</option>
                          <option value="low">Low</option>
                          <option value="critical">Critical</option>
                          <option value="unknown">Unknown</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Training */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#30363d]">
                <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Training Programs</span>
                <Button variant="secondary" onClick={() => setShowModal('training')}>Add Session</Button>
              </div>
              <div className="grid md:grid-cols-1 gap-4">
                <div className="bg-[#0d1117] border border-[#a371f7]/30 rounded-lg p-6">
                  <h4 className="font-medium text-[#f0f6fc]">Mental Health First Aid</h4>
                  <p className="text-3xl font-mono font-semibold text-[#a371f7] mt-3">{operationalData.trainings.mentalHealthFirstAid.totalTrained}</p>
                  <p className="text-sm text-[#8b949e] mt-1">trained &middot; {operationalData.trainings.mentalHealthFirstAid.sessions.length} sessions</p>
                </div>
              </div>
            </div>

            {/* Modals */}
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
                    <Button type="submit">Add</Button>
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
                    <Button type="submit">Record</Button>
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
                    <Button type="submit">Add</Button>
                    <Button variant="secondary" type="button" onClick={() => setShowModal(null)}>Cancel</Button>
                  </div>
                </form>
              </Modal>
            )}
          </div>
        )}

        {/* BUDGET - Expanded Module */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Financial Management</span>
                </div>
                <h2 className="text-3xl font-semibold text-[#f0f6fc] tracking-tight">Budget & Funding</h2>
                <p className="text-[#8b949e] mt-1">Line-item tracking, AI-assisted requests, and transparency</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => {
                  setBudgetLoading(true)
                  setTimeout(() => {
                    scanForReallocations()
                    setBudgetLoading(false)
                    notify('Scanned for reallocations')
                  }, 500)
                }}>
                  {budgetLoading ? 'Scanning...' : 'Scan Reallocations'}
                </Button>
                <Button onClick={() => setShowModal('lineItem')}>Add Line Item</Button>
              </div>
            </div>

            {/* Budget Sub-Navigation */}
            <div className="flex gap-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'lineItems', label: 'Line Items' },
                { id: 'requests', label: 'Funding Requests', count: (budgetData.fundingRequests || []).filter(r => r.status === 'pending').length },
                { id: 'reallocations', label: 'Reallocations', count: (budgetData.reallocationSuggestions || []).filter(r => r.status === 'pending').length },
                { id: 'transparency', label: 'Transparency' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setBudgetSubTab(tab.id)}
                  className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    budgetSubTab === tab.id
                      ? 'bg-[#161b22] text-[#00d4ff] border border-[#00d4ff]/30'
                      : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]/50'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="px-1.5 py-0.5 bg-[#d29922]/20 text-[#d29922] text-[10px] font-mono rounded">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* OVERVIEW SUB-TAB */}
            {budgetSubTab === 'overview' && (
              <div className="space-y-6">
                {/* Budget Summary Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Total Budget</label>
                    <div className="flex items-baseline gap-1 mt-3">
                      <span className="text-[#6e7681] text-xl">$</span>
                      <input type="number" value={budgetData.total} onChange={(e) => updateBudget({ total: parseFloat(e.target.value) || 0 })} className="text-3xl font-mono font-semibold text-[#3fb950] bg-transparent border-0 w-full focus:ring-0" />
                    </div>
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Allocated</label>
                    <div className="flex items-baseline gap-1 mt-3">
                      <span className="text-[#6e7681] text-xl">$</span>
                      <input type="number" value={budgetData.allocated} onChange={(e) => updateBudget({ allocated: parseFloat(e.target.value) || 0 })} className="text-3xl font-mono font-semibold text-[#00d4ff] bg-transparent border-0 w-full focus:ring-0" />
                    </div>
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Spent</label>
                    <p className="text-3xl font-mono font-semibold text-[#d29922] mt-3">${(budgetData.spent || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <label className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Remaining</label>
                    <p className="text-3xl font-mono font-semibold text-[#a371f7] mt-3">${((budgetData.total || 0) - (budgetData.spent || 0)).toLocaleString()}</p>
                  </div>
                </div>

                {/* Visual Budget Breakdown */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Pie Chart Representation */}
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-1 bg-[#00d4ff] rounded-full" />
                      <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Allocation vs Spend</span>
                    </div>
                    <div className="flex items-center justify-center py-4">
                      <div className="relative w-40 h-40">
                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#21262d" strokeWidth="12" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#00d4ff" strokeWidth="12"
                            strokeDasharray={`${((budgetData.allocated || 0) / (budgetData.total || 1)) * 251.2} 251.2`}
                            className="transition-all duration-500" />
                          <circle cx="50" cy="50" r="28" fill="none" stroke="#21262d" strokeWidth="10" />
                          <circle cx="50" cy="50" r="28" fill="none" stroke="#3fb950" strokeWidth="10"
                            strokeDasharray={`${((budgetData.spent || 0) / (budgetData.total || 1)) * 175.9} 175.9`}
                            className="transition-all duration-500" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-xl font-mono font-bold text-[#f0f6fc]">
                              {budgetData.total > 0 ? Math.round((budgetData.spent / budgetData.total) * 100) : 0}%
                            </p>
                            <p className="text-[9px] text-[#6e7681] uppercase">spent</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#00d4ff]" />
                        <span className="text-xs text-[#8b949e]">Allocated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#3fb950]" />
                        <span className="text-xs text-[#8b949e]">Spent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#21262d]" />
                        <span className="text-xs text-[#8b949e]">Remaining</span>
                      </div>
                    </div>
                  </div>

                  {/* Waste Reduction Metrics */}
                  <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-1.5 bg-[#3fb950] rounded-full animate-pulse" />
                      <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Waste Reduction Metrics</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                        <p className="text-2xl font-mono font-bold text-[#3fb950]">${(budgetData.wasteMetrics?.totalReallocated || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-[#6e7681] uppercase mt-1">Funds Reallocated</p>
                      </div>
                      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                        <p className="text-2xl font-mono font-bold text-[#00d4ff]">{budgetData.wasteMetrics?.duplicateRequestsPrevented || 0}</p>
                        <p className="text-[10px] text-[#6e7681] uppercase mt-1">Duplicates Blocked</p>
                      </div>
                      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                        <p className="text-2xl font-mono font-bold text-[#d29922]">{budgetData.wasteMetrics?.averageProcessingTime || 0}h</p>
                        <p className="text-[10px] text-[#6e7681] uppercase mt-1">Avg Process Time</p>
                      </div>
                      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                        <p className="text-2xl font-mono font-bold text-[#a371f7]">${(budgetData.wasteMetrics?.costSavingsFromAI || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-[#6e7681] uppercase mt-1">AI Savings</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Progress Bars */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-1 bg-[#00d4ff] rounded-full" />
                    <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Category Breakdown</span>
                  </div>
                  <div className="space-y-5">
                    {(budgetData.categories || []).map(cat => {
                      const utilization = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0
                      const remaining = cat.allocated - cat.spent
                      return (
                        <div key={cat.name}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium text-[#f0f6fc]">{cat.name}</span>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                                utilization > 90 ? 'bg-[#f85149]/20 text-[#f85149]' :
                                utilization > 70 ? 'bg-[#d29922]/20 text-[#d29922]' :
                                'bg-[#3fb950]/20 text-[#3fb950]'
                              }`}>{Math.round(utilization)}%</span>
                              <span className="text-sm font-mono text-[#8b949e]">${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${
                              utilization > 90 ? 'bg-gradient-to-r from-[#f85149] to-[#f85149]/70' :
                              utilization > 70 ? 'bg-gradient-to-r from-[#d29922] to-[#d29922]/70' :
                              'bg-gradient-to-r from-[#3fb950] to-[#00d4ff]'
                            }`} style={{ width: `${Math.min(100, utilization)}%` }} />
                          </div>
                          {remaining > 0 && utilization < 30 && (
                            <p className="text-[10px] text-[#d29922] mt-1 font-mono">⚠ ${remaining.toLocaleString()} underutilized — consider reallocation</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* LINE ITEMS SUB-TAB */}
            {budgetSubTab === 'lineItems' && (
              <div className="space-y-6">
                {/* Line Items Table */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-[#00d4ff] rounded-full" />
                      <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Line-Item Funding Tracker</span>
                    </div>
                    <span className="text-xs font-mono text-[#6e7681]">{(budgetData.lineItems || []).length} items</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#30363d] bg-[#0d1117]">
                          <th className="text-left px-4 py-3 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Organization</th>
                          <th className="text-left px-4 py-3 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Category</th>
                          <th className="text-right px-4 py-3 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Requested</th>
                          <th className="text-right px-4 py-3 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Approved</th>
                          <th className="text-right px-4 py-3 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Spent</th>
                          <th className="text-center px-4 py-3 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Status</th>
                          <th className="text-center px-4 py-3 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Utilization</th>
                          <th className="text-right px-4 py-3 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(budgetData.lineItems || []).map(item => {
                          const utilization = item.approved > 0 ? ((item.spent || 0) / item.approved) * 100 : 0
                          return (
                            <tr key={item.id} className="border-b border-[#21262d] hover:bg-[#21262d]/50 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-medium text-[#f0f6fc]">{item.orgName}</p>
                                {item.impactNotes && <p className="text-xs text-[#6e7681] truncate max-w-[200px]">{item.impactNotes}</p>}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#8b949e]">{item.category}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-[#8b949e]">${(item.requested || 0).toLocaleString()}</td>
                              <td className="px-4 py-3 text-right font-mono text-[#00d4ff]">${(item.approved || 0).toLocaleString()}</td>
                              <td className="px-4 py-3 text-right">
                                <input
                                  type="number"
                                  value={item.spent || 0}
                                  onChange={(e) => updateLineItem(item.id, { spent: parseFloat(e.target.value) || 0 })}
                                  className="w-24 text-right bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 font-mono text-[#3fb950] text-sm focus:ring-1 focus:ring-[#00d4ff]"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <select
                                  value={item.status}
                                  onChange={(e) => updateLineItem(item.id, { status: e.target.value })}
                                  className={`px-2 py-1 rounded border text-xs font-mono ${
                                    item.status === 'approved' ? 'bg-[#3fb950]/10 border-[#3fb950]/30 text-[#3fb950]' :
                                    item.status === 'pending' ? 'bg-[#d29922]/10 border-[#d29922]/30 text-[#d29922]' :
                                    item.status === 'denied' ? 'bg-[#f85149]/10 border-[#f85149]/30 text-[#f85149]' :
                                    item.status === 'spent' ? 'bg-[#a371f7]/10 border-[#a371f7]/30 text-[#a371f7]' :
                                    'bg-[#21262d] border-[#30363d] text-[#8b949e]'
                                  }`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="approved">Approved</option>
                                  <option value="denied">Denied</option>
                                  <option value="spent">Spent</option>
                                </select>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${
                                      utilization > 90 ? 'bg-[#3fb950]' :
                                      utilization > 50 ? 'bg-[#00d4ff]' :
                                      'bg-[#d29922]'
                                    }`} style={{ width: `${Math.min(100, utilization)}%` }} />
                                  </div>
                                  <span className="text-[10px] font-mono text-[#6e7681] w-10">{Math.round(utilization)}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  {item.receiptsLink && (
                                    <a href={item.receiptsLink} target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] text-xs hover:underline">Receipts</a>
                                  )}
                                  <button onClick={() => { setEditingLineItem(item); setLineItemForm(item); setShowModal('editLineItem') }} className="text-[#8b949e] hover:text-[#f0f6fc] text-xs">Edit</button>
                                  <button onClick={() => { if(confirm('Delete this line item?')) { deleteLineItem(item.id); notify('Deleted') }}} className="text-[#f85149] text-xs hover:underline">Delete</button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                        {(budgetData.lineItems || []).length === 0 && (
                          <tr>
                            <td colSpan={8} className="px-4 py-12 text-center text-[#6e7681]">
                              No line items yet. Add your first line item to track funding.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Line Items by Category Summary */}
                <div className="grid md:grid-cols-5 gap-4">
                  {(budgetCategories || []).slice(0, 5).map(cat => {
                    const items = (budgetData.lineItems || []).filter(i => i.category === cat)
                    const totalApproved = items.reduce((s, i) => s + (i.approved || 0), 0)
                    const totalSpent = items.reduce((s, i) => s + (i.spent || 0), 0)
                    return (
                      <div key={cat} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                        <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-2">{cat}</p>
                        <p className="text-xl font-mono font-bold text-[#f0f6fc]">{items.length}</p>
                        <p className="text-[10px] text-[#8b949e] mt-1">${totalSpent.toLocaleString()} / ${totalApproved.toLocaleString()}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* FUNDING REQUESTS SUB-TAB */}
            {budgetSubTab === 'requests' && (
              <div className="space-y-6">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
                  <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#d29922] rounded-full animate-pulse" />
                      <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">AI-Assisted Funding Request Queue</span>
                    </div>
                    <span className="text-xs font-mono text-[#6e7681]">{(budgetData.fundingRequests || []).filter(r => r.status === 'pending').length} pending</span>
                  </div>
                  <div className="divide-y divide-[#21262d]">
                    {(budgetData.fundingRequests || []).filter(r => r.status === 'pending').map(request => (
                      <div key={request.id} className="p-6 hover:bg-[#21262d]/30 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-[#f0f6fc]">{request.orgName}</h4>
                              <span className="px-2 py-0.5 bg-[#21262d] border border-[#30363d] rounded text-[10px] text-[#8b949e] font-mono">{request.category}</span>
                              {request.urgency === 'high' && (
                                <span className="px-2 py-0.5 bg-[#f85149]/10 border border-[#f85149]/30 rounded text-[10px] text-[#f85149] font-mono">URGENT</span>
                              )}
                            </div>
                            <p className="text-sm text-[#8b949e] mb-2">{request.description}</p>
                            <p className="text-xs text-[#6e7681]"><strong className="text-[#8b949e]">Impact:</strong> {request.impactJustification}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-mono font-bold text-[#00d4ff]">${(request.amount || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-[#6e7681] mt-1">{formatDate(request.submittedAt)}</p>
                          </div>
                        </div>

                        {/* AI Scoring Section */}
                        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-[#a371f7] rounded-full" />
                              <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">AI Analysis</span>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                              request.aiScore >= 80 ? 'bg-[#3fb950]/10 border border-[#3fb950]/30' :
                              request.aiScore >= 60 ? 'bg-[#d29922]/10 border border-[#d29922]/30' :
                              'bg-[#f85149]/10 border border-[#f85149]/30'
                            }`}>
                              <span className={`text-lg font-mono font-bold ${
                                request.aiScore >= 80 ? 'text-[#3fb950]' :
                                request.aiScore >= 60 ? 'text-[#d29922]' :
                                'text-[#f85149]'
                              }`}>{request.aiScore}</span>
                              <span className="text-[10px] text-[#6e7681]">/ 100</span>
                            </div>
                          </div>
                          <p className={`text-sm font-medium mb-2 ${
                            request.aiRecommendation?.includes('Approve') ? 'text-[#3fb950]' :
                            request.aiRecommendation?.includes('Deny') ? 'text-[#f85149]' :
                            request.aiRecommendation?.includes('Reallocate') ? 'text-[#a371f7]' :
                            'text-[#d29922]'
                          }`}>
                            → {request.aiRecommendation}
                          </p>
                          {request.aiReasons && (
                            <div className="flex flex-wrap gap-2">
                              {request.aiReasons.map((reason, i) => (
                                <span key={i} className="px-2 py-0.5 bg-[#21262d] rounded text-[10px] text-[#8b949e]">{reason}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => { reviewFundingRequest(request.id, 'approved'); notify('Request approved') }}
                            className="px-4 py-2 bg-[#3fb950]/10 border border-[#3fb950]/50 rounded-lg text-[#3fb950] text-sm font-medium hover:bg-[#3fb950]/20 hover:border-[#3fb950] transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { reviewFundingRequest(request.id, 'denied'); notify('Request denied') }}
                            className="px-4 py-2 bg-[#f85149]/10 border border-[#f85149]/50 rounded-lg text-[#f85149] text-sm font-medium hover:bg-[#f85149]/20 hover:border-[#f85149] transition-all"
                          >
                            Deny
                          </button>
                          <button
                            onClick={() => { reviewFundingRequest(request.id, 'reallocated', 'Reallocated from unused funds'); notify('Request reallocated') }}
                            className="px-4 py-2 bg-[#a371f7]/10 border border-[#a371f7]/50 rounded-lg text-[#a371f7] text-sm font-medium hover:bg-[#a371f7]/20 hover:border-[#a371f7] transition-all"
                          >
                            Reallocate
                          </button>
                          <input
                            type="text"
                            placeholder="Add reviewer note..."
                            className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff]"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.target.value) {
                                reviewFundingRequest(request.id, 'approved', e.target.value)
                                e.target.value = ''
                                notify('Approved with note')
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {(budgetData.fundingRequests || []).filter(r => r.status === 'pending').length === 0 && (
                      <div className="p-12 text-center text-[#6e7681]">
                        <p className="text-sm">No pending funding requests</p>
                        <p className="text-xs mt-2">New requests from organizations will appear here for review</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recently Reviewed */}
                {(budgetData.fundingRequests || []).filter(r => r.status !== 'pending').length > 0 && (
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Recently Reviewed</span>
                    </div>
                    <div className="space-y-2">
                      {(budgetData.fundingRequests || []).filter(r => r.status !== 'pending').slice(-5).reverse().map(request => (
                        <div key={request.id} className="flex items-center justify-between py-2 px-3 bg-[#0d1117] rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${
                              request.status === 'approved' ? 'bg-[#3fb950]' :
                              request.status === 'denied' ? 'bg-[#f85149]' :
                              'bg-[#a371f7]'
                            }`} />
                            <span className="text-sm text-[#f0f6fc]">{request.orgName}</span>
                            <span className="text-xs text-[#6e7681]">${request.amount}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            request.status === 'approved' ? 'bg-[#3fb950]/10 text-[#3fb950]' :
                            request.status === 'denied' ? 'bg-[#f85149]/10 text-[#f85149]' :
                            'bg-[#a371f7]/10 text-[#a371f7]'
                          }`}>{request.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* REALLOCATIONS SUB-TAB */}
            {budgetSubTab === 'reallocations' && (
              <div className="space-y-6">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
                  <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#a371f7] rounded-full" />
                      <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Reallocation Suggestions</span>
                    </div>
                    <button
                      onClick={() => {
                        setBudgetLoading(true)
                        setTimeout(() => {
                          scanForReallocations()
                          setBudgetLoading(false)
                          notify('Scan complete')
                        }, 500)
                      }}
                      className="text-[10px] font-semibold text-[#00d4ff] uppercase tracking-widest hover:text-[#00d4ff]/80 transition"
                    >
                      {budgetLoading ? 'Scanning...' : 'Re-scan'}
                    </button>
                  </div>
                  <div className="divide-y divide-[#21262d]">
                    {(budgetData.reallocationSuggestions || []).filter(s => s.status === 'pending').map(suggestion => (
                      <div key={suggestion.id} className="p-6 hover:bg-[#21262d]/30 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-sm font-medium text-[#f0f6fc]">{suggestion.fromCategory || suggestion.fromOrg}</p>
                              <p className="text-[10px] text-[#6e7681] uppercase">From</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-px bg-[#30363d]" />
                              <span className="text-xl font-mono font-bold text-[#a371f7]">${suggestion.amount}</span>
                              <div className="w-8 h-px bg-[#30363d]" />
                              <span className="text-[#6e7681]">→</span>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-[#f0f6fc]">{suggestion.toCategory || 'High-demand area'}</p>
                              <p className="text-[10px] text-[#6e7681] uppercase">To</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-[#8b949e] mb-4 bg-[#0d1117] px-4 py-3 rounded-lg">{suggestion.reason}</p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => { reviewReallocation(suggestion.id, 'approved'); notify('Reallocation approved') }}
                            className="px-4 py-2 bg-[#3fb950]/10 border border-[#3fb950]/50 rounded-lg text-[#3fb950] text-sm font-medium hover:bg-[#3fb950]/20 transition-all"
                          >
                            Approve Reallocation
                          </button>
                          <button
                            onClick={() => { reviewReallocation(suggestion.id, 'rejected'); notify('Reallocation rejected') }}
                            className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[#8b949e] text-sm font-medium hover:border-[#8b949e] transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                    {(budgetData.reallocationSuggestions || []).filter(s => s.status === 'pending').length === 0 && (
                      <div className="p-12 text-center text-[#6e7681]">
                        <p className="text-sm">No pending reallocation suggestions</p>
                        <p className="text-xs mt-2">Click "Scan Reallocations" to analyze budget utilization</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approved Reallocations */}
                {(budgetData.approvedReallocations || []).length > 0 && (
                  <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-1.5 bg-[#3fb950] rounded-full" />
                      <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Approved Reallocations (Public)</span>
                    </div>
                    <div className="space-y-3">
                      {(budgetData.approvedReallocations || []).map(r => (
                        <div key={r.id} className="flex items-center justify-between py-3 px-4 bg-[#0d1117] rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-[#8b949e]">{r.fromCategory || r.fromOrg}</span>
                            <span className="text-[#6e7681]">→</span>
                            <span className="text-sm text-[#f0f6fc]">{r.toCategory}</span>
                          </div>
                          <span className="font-mono font-semibold text-[#3fb950]">${r.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TRANSPARENCY SUB-TAB */}
            {budgetSubTab === 'transparency' && (
              <div className="space-y-6">
                {/* Budget Transparency & Validation */}
                <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full" />
                    <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Budget Transparency & Validation</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* CSV Export */}
                    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5">
                      <h4 className="font-medium text-[#f0f6fc] mb-2">Export Line Items (CSV)</h4>
                      <p className="text-sm text-[#8b949e] mb-4">Download all line items for auditing, reporting, or external review.</p>
                      <button
                        onClick={() => {
                          const csv = exportBudgetCSV()
                          const blob = new Blob([csv], { type: 'text/csv' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `budget-line-items-${new Date().toISOString().split('T')[0]}.csv`
                          a.click()
                          notify('CSV exported')
                        }}
                        className="px-4 py-2 bg-[#00d4ff]/10 border border-[#00d4ff]/50 rounded-lg text-[#00d4ff] text-sm font-medium hover:bg-[#00d4ff]/20 transition-all"
                      >
                        Download CSV
                      </button>
                    </div>

                    {/* Reproducibility Guide */}
                    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5">
                      <h4 className="font-medium text-[#f0f6fc] mb-2">Reproducibility Guide</h4>
                      <p className="text-sm text-[#8b949e] mb-4">Step-by-step instructions for verifying budget allocations and spend.</p>
                      <button
                        onClick={() => {
                          const guide = `BUDGET AUDIT REPRODUCIBILITY GUIDE
==================================
Generated: ${new Date().toISOString()}
Semester: ${budgetData.semester || 'Spring 2026'}

HOW TO AUDIT SPEND VS BUDGET:

1. Export line items CSV from admin dashboard
2. For each line item, verify:
   - Receipts link contains valid documentation
   - Spent amount matches sum of receipt totals
   - Approved amount <= Requested amount
   - Status reflects actual fund disbursement

3. Category totals should match:
   - Sum of approved line items per category
   - Category "allocated" field in budget overview

4. Cross-reference with:
   - Bank/payment records
   - Organization event records
   - Physical receipt documentation

CONTACT: sgbudget@unc.edu for questions

---
Public Data Model — Anyone Can Verify Allocation Transparency`
                          const blob = new Blob([guide], { type: 'text/plain' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'budget-audit-guide.txt'
                          a.click()
                          notify('Guide downloaded')
                        }}
                        className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[#8b949e] text-sm font-medium hover:border-[#8b949e] hover:text-[#f0f6fc] transition-all"
                      >
                        Download Guide
                      </button>
                    </div>
                  </div>

                  {/* Public Transparency Stats Preview */}
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-[#f0f6fc]">Public Transparency Page Preview</h4>
                      <Link href="/budget-transparency" className="text-[10px] font-semibold text-[#00d4ff] uppercase tracking-widest hover:underline">
                        View Public Page →
                      </Link>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {(() => {
                        const stats = getBudgetSummaryStats ? getBudgetSummaryStats() : {}
                        return (
                          <>
                            <div className="text-center p-3 bg-[#161b22] rounded-lg">
                              <p className="text-xl font-mono font-bold text-[#3fb950]">{stats.utilizationRate || 0}%</p>
                              <p className="text-[10px] text-[#6e7681] uppercase mt-1">Utilization Rate</p>
                            </div>
                            <div className="text-center p-3 bg-[#161b22] rounded-lg">
                              <p className="text-xl font-mono font-bold text-[#00d4ff]">{stats.orgCount || 0}</p>
                              <p className="text-[10px] text-[#6e7681] uppercase mt-1">Organizations Funded</p>
                            </div>
                            <div className="text-center p-3 bg-[#161b22] rounded-lg">
                              <p className="text-xl font-mono font-bold text-[#a371f7]">${(stats.wasteReduction?.reallocatedFunds || 0).toLocaleString()}</p>
                              <p className="text-[10px] text-[#6e7681] uppercase mt-1">Funds Reallocated</p>
                            </div>
                            <div className="text-center p-3 bg-[#161b22] rounded-lg">
                              <p className="text-xl font-mono font-bold text-[#d29922]">{stats.wasteReduction?.avgProcessingHours || 0}h</p>
                              <p className="text-[10px] text-[#6e7681] uppercase mt-1">Avg Processing Time</p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Footer Note */}
                  <div className="mt-6 pt-6 border-t border-[#30363d] text-center">
                    <p className="text-xs text-[#6e7681]">
                      <span className="text-[#00d4ff]">●</span> Public data model — anyone can verify allocation transparency
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MODALS */}
            {showModal === 'lineItem' && (
              <Modal title="Add Line Item" onClose={() => setShowModal(null)}>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  addLineItem(lineItemForm)
                  setLineItemForm({ orgName: '', category: 'Events', requested: 0, approved: 0, receiptsLink: '', impactNotes: '' })
                  setShowModal(null)
                  notify('Line item added')
                }} className="space-y-4">
                  <Input label="Organization Name" value={lineItemForm.orgName} onChange={(e) => setLineItemForm({ ...lineItemForm, orgName: e.target.value })} required />
                  <Select label="Category" value={lineItemForm.category} onChange={(e) => setLineItemForm({ ...lineItemForm, category: e.target.value })} options={
                    (budgetCategories || ['Events', 'Travel', 'Merch', 'Programming', 'Equipment', 'Marketing', 'Food & Catering', 'Speakers & Guests', 'Supplies', 'Other']).map(c => ({ value: c, label: c }))
                  } />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Requested Amount ($)" type="number" value={lineItemForm.requested} onChange={(e) => setLineItemForm({ ...lineItemForm, requested: parseFloat(e.target.value) || 0 })} required />
                    <Input label="Approved Amount ($)" type="number" value={lineItemForm.approved} onChange={(e) => setLineItemForm({ ...lineItemForm, approved: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <Input label="Receipts Link (optional)" value={lineItemForm.receiptsLink} onChange={(e) => setLineItemForm({ ...lineItemForm, receiptsLink: e.target.value })} placeholder="https://drive.google.com/..." />
                  <div>
                    <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">Impact Notes</label>
                    <textarea
                      value={lineItemForm.impactNotes}
                      onChange={(e) => setLineItemForm({ ...lineItemForm, impactNotes: e.target.value })}
                      rows={3}
                      placeholder="Describe the expected impact..."
                      className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] resize-none focus:ring-1 focus:ring-[#00d4ff] text-sm"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit">Add Line Item</Button>
                    <Button variant="secondary" type="button" onClick={() => setShowModal(null)}>Cancel</Button>
                  </div>
                </form>
              </Modal>
            )}

            {showModal === 'editLineItem' && editingLineItem && (
              <Modal title="Edit Line Item" onClose={() => { setShowModal(null); setEditingLineItem(null) }}>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  updateLineItem(editingLineItem.id, lineItemForm)
                  setLineItemForm({ orgName: '', category: 'Events', requested: 0, approved: 0, receiptsLink: '', impactNotes: '' })
                  setEditingLineItem(null)
                  setShowModal(null)
                  notify('Line item updated')
                }} className="space-y-4">
                  <Input label="Organization Name" value={lineItemForm.orgName} onChange={(e) => setLineItemForm({ ...lineItemForm, orgName: e.target.value })} required />
                  <Select label="Category" value={lineItemForm.category} onChange={(e) => setLineItemForm({ ...lineItemForm, category: e.target.value })} options={
                    (budgetCategories || ['Events', 'Travel', 'Merch', 'Programming', 'Equipment', 'Marketing', 'Food & Catering', 'Speakers & Guests', 'Supplies', 'Other']).map(c => ({ value: c, label: c }))
                  } />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Requested Amount ($)" type="number" value={lineItemForm.requested} onChange={(e) => setLineItemForm({ ...lineItemForm, requested: parseFloat(e.target.value) || 0 })} required />
                    <Input label="Approved Amount ($)" type="number" value={lineItemForm.approved} onChange={(e) => setLineItemForm({ ...lineItemForm, approved: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <Input label="Receipts Link" value={lineItemForm.receiptsLink || ''} onChange={(e) => setLineItemForm({ ...lineItemForm, receiptsLink: e.target.value })} />
                  <div>
                    <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">Impact Notes</label>
                    <textarea
                      value={lineItemForm.impactNotes || ''}
                      onChange={(e) => setLineItemForm({ ...lineItemForm, impactNotes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] resize-none focus:ring-1 focus:ring-[#00d4ff] text-sm"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit">Update</Button>
                    <Button variant="secondary" type="button" onClick={() => { setShowModal(null); setEditingLineItem(null) }}>Cancel</Button>
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
                    ...(budgetData.categories || []).map(c => ({ value: c.name, label: c.name }))
                  ]} />
                  <div className="flex gap-3 pt-2">
                    <Button type="submit">Add</Button>
                    <Button variant="secondary" type="button" onClick={() => setShowModal(null)}>Cancel</Button>
                  </div>
                </form>
              </Modal>
            )}
          </div>
        )}

        {/* FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">User Feedback</span>
              </div>
              <h2 className="text-3xl font-semibold text-[#f0f6fc] tracking-tight">Feedback</h2>
              <p className="text-[#8b949e] mt-1">Student submissions and responses</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <StatCard value={feedback.length} label="Total" color="cyan" />
              <StatCard value={feedback.filter(f => f.status === 'new').length} label="New" color="yellow" />
              <StatCard value={feedback.filter(f => f.status === 'reviewed').length} label="Reviewed" color="purple" />
              <StatCard value={feedback.filter(f => f.status === 'resolved').length} label="Resolved" color="green" />
            </div>

            <div className="space-y-4">
              {feedback.map(item => (
                <div key={item.id} className={`bg-[#161b22] border-l-2 border rounded-lg p-6 ${
                  item.status === 'new' ? 'border-l-[#d29922] border-[#30363d]' :
                  item.status === 'reviewed' ? 'border-l-[#a371f7] border-[#30363d]' :
                  item.status === 'resolved' ? 'border-l-[#3fb950] border-[#30363d]' : 'border-[#30363d]'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded border text-xs font-mono ${
                      item.status === 'new' ? 'bg-transparent border-[#d29922]/50 text-[#d29922]' :
                      item.status === 'reviewed' ? 'bg-transparent border-[#a371f7]/50 text-[#a371f7]' :
                      item.status === 'resolved' ? 'bg-transparent border-[#3fb950]/50 text-[#3fb950]' :
                      'bg-transparent border-[#30363d] text-[#6e7681]'
                    }`}>{item.status}</span>
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
                    <select value={item.status} onChange={(e) => { updateFeedbackStatus(item.id, e.target.value); notify('Updated') }} className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff]">
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

        {/* ACTIVITY - Enhanced Audit Log */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-1 bg-[#00d4ff] rounded-full" />
                  <span className="text-[9px] font-bold text-[#6e7681] uppercase tracking-[0.15em]">Audit Log</span>
                </div>
                <h2 className="text-2xl font-semibold text-[#f0f6fc] tracking-tight">Activity Stream</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#6e7681]">{activityLog.length} entries</span>
                <button onClick={() => { if(confirm('Clear all activity?')) { clearActivityLog(); notify('Cleared') }}} className="text-xs text-[#f85149] hover:underline font-medium">Clear</button>
              </div>
            </div>

            {/* Progress Updates Summary */}
            {activityLog.filter(e => e.metadata?.progress !== undefined).length > 0 && (
              <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 bg-[#3fb950] rounded-full" />
                  <span className="text-[9px] font-bold text-[#6e7681] uppercase tracking-[0.15em]">Recent Progress Updates</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activityLog.filter(e => e.metadata?.progress !== undefined).slice(0, 10).map(entry => (
                    <div key={entry.id} className="bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 flex items-center gap-2">
                      <span className="text-xs text-[#8b949e] max-w-[150px] truncate">{entry.metadata.policyTitle || 'Policy'}</span>
                      {entry.metadata.previousProgress !== undefined && (
                        <span className="text-[10px] font-mono text-[#6e7681]">{entry.metadata.previousProgress}%</span>
                      )}
                      <span className="text-[#6e7681]">&rarr;</span>
                      <span className="text-sm font-mono font-bold text-[#3fb950]">{entry.metadata.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Activity Log */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
              <div className="max-h-[550px] overflow-y-auto">
                {activityLog.map(entry => {
                  const dept = departments.find(d => d.id === entry.category)
                  const hasProgress = entry.metadata?.progress !== undefined
                  const progressDelta = hasProgress && entry.metadata?.previousProgress !== undefined
                    ? entry.metadata.progress - entry.metadata.previousProgress
                    : null
                  return (
                    <div key={entry.id} className={`flex items-center gap-4 px-5 py-3 border-b border-[#21262d] hover:bg-[#21262d]/50 transition-colors ${hasProgress ? 'bg-[#3fb950]/5' : ''}`}>
                      <div className="flex items-center gap-2 min-w-[32px]">
                        {dept && <span className="text-base">{dept.icon}</span>}
                        {!dept && <div className={`w-1.5 h-1.5 rounded-full ${hasProgress ? 'bg-[#3fb950]' : 'bg-[#00d4ff]'}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm text-[#f0f6fc]">{entry.details}</p>
                          {hasProgress && (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded text-[10px] font-mono font-bold text-[#3fb950]">
                                {entry.metadata.progress}%
                              </span>
                              {progressDelta !== null && (
                                <span className={`text-[10px] font-mono font-semibold ${progressDelta > 0 ? 'text-[#3fb950]' : progressDelta < 0 ? 'text-[#f85149]' : 'text-[#6e7681]'}`}>
                                  {progressDelta > 0 ? '+' : ''}{progressDelta}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-wide ${
                            dept ? 'bg-[#00d4ff]/10 text-[#00d4ff]' : 'bg-[#21262d] text-[#6e7681]'
                          }`}>
                            {dept ? dept.name : entry.category}
                          </span>
                          <span className="text-[9px] font-mono text-[#6e7681] uppercase">{entry.action}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#6e7681] whitespace-nowrap">{formatTime(entry.timestamp)}</span>
                    </div>
                  )
                })}
                {activityLog.length === 0 && (
                  <div className="p-12 text-center text-[#6e7681] text-sm">No activity recorded yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Configuration</span>
              </div>
              <h2 className="text-3xl font-semibold text-[#f0f6fc] tracking-tight">Settings</h2>
              <p className="text-[#8b949e] mt-1">Data management and backup</p>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#f0f6fc] mb-2">Backup & Restore</h3>
              <p className="text-[#8b949e] mb-6">Export your data for backup or import a previous backup.</p>
              <div className="flex gap-3">
                <Button onClick={handleExport}>Export Data</Button>
                <label className="px-5 py-2.5 rounded-lg font-medium text-sm bg-[#21262d] text-[#8b949e] border border-[#30363d] hover:text-[#f0f6fc] hover:bg-[#30363d] hover:border-[#8b949e] cursor-pointer transition-all">
                  Import Data
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#30363d]">
                <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Storage</span>
              </div>
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
            </div>

            <div className="bg-[#f85149]/5 border border-[#f85149]/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#f85149] mb-2">Danger Zone</h3>
              <p className="text-[#8b949e] mb-6">This action cannot be undone. All data will be reset to initial state.</p>
              <Button variant="danger" onClick={() => { if(confirm('Reset ALL data?')) { if(confirm('Are you sure?')) { resetAllData(); notify('Data reset') }}}}>Reset All Data</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
