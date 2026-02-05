import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { departments as defaultDepartments, getOverallProgress, getStatusCounts } from '../../lib/data'
import {
  BUDGET_CATEGORIES,
  exportLineItemsToCSV,
  exportFundingRequestsToCSV,
  generateAuditReport,
} from '../../lib/budgetEngine'

// ==========================================
// SCROLL REVEAL HOOK
// ==========================================
function useScrollReveal() {
  const [revealed, setRevealed] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRevealed(true)
      },
      { threshold: 0.1, rootMargin: '-50px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return [ref, revealed]
}

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, revealed] = useScrollReveal()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatRelativeTime = (dateString) => {
  if (!dateString) return ''
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// ==========================================
// LIVE CLOCK
// ==========================================
const LiveClock = () => {
  const [time, setTime] = useState(null)

  useEffect(() => {
    setTime(new Date())
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!time) return <div className="font-mono text-gray-500">--:--:--</div>

  return (
    <div className="text-right">
      <div className="font-mono text-white text-sm">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-xs text-gray-500 uppercase tracking-wider">
        {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  )
}

// ==========================================
// MAIN ADMIN COMPONENT
// ==========================================
export default function AdminConsole() {
  const router = useRouter()
  const {
    isAdmin,
    isLoaded,
    policies,
    budgetData,
    feedback,
    activityLog,
    announcements,
    quickStats,
    siteContent,
    budgetLineItems,
    fundingRequests,
    reallocations,
    // Actions
    updatePolicy,
    logPolicyProgress,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    updateFeedbackStatus,
    updateQuickStats,
    approveFundingRequest,
    denyFundingRequest,
    generateReallocations,
    approveReallocation,
    exportAllData,
    importData,
    resetAllData,
    resetAllSiteContent,
    logActivity,
  } = useApp()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [showConfirmReset, setShowConfirmReset] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push('/admin/login')
    }
  }, [isLoaded, isAdmin, router])

  // Calculate stats
  const overallProgress = useMemo(() => getOverallProgress(policies), [policies])
  const statusCounts = useMemo(() => getStatusCounts(policies), [policies])

  const filteredPolicies = useMemo(() => {
    let items = policies
    if (selectedDepartment !== 'all') {
      items = items.filter(p => p.department === selectedDepartment)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }
    return items
  }, [policies, selectedDepartment, searchQuery])

  const pendingRequests = fundingRequests.filter(r => r.status === 'pending')
  const newFeedback = feedback.filter(f => f.status === 'new')

  // Export handlers
  const handleExportAll = () => {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project-bold-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        importData(data)
        alert('Data imported successfully!')
      } catch (err) {
        alert('Failed to import data: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'platform', label: 'Platform Builder' },
    { id: 'budget', label: 'Budget & Funding' },
    { id: 'content', label: 'Content' },
    { id: 'feedback', label: 'Feedback', badge: newFeedback.length },
    { id: 'settings', label: 'Settings' },
  ]

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>Admin Console | Project Bold</title>
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-gray-900">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold tracking-tight">
                Project Bold
              </Link>
              <span className="px-3 py-1 bg-white/10 rounded text-xs font-mono uppercase tracking-wider">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-6">
              <LiveClock />
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="sticky top-16 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-900">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-xs font-medium tracking-widest uppercase whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-500 hover:text-white hover:border-gray-700'
                }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 rounded text-[10px] font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">

          {/* ==========================================
              DASHBOARD TAB
          ========================================== */}
          {activeTab === 'dashboard' && (
            <div>
              <Reveal>
                <div className="mb-12">
                  <h1 className="text-4xl font-bold mb-4">Command Center</h1>
                  <p className="text-gray-400 text-lg">Real-time overview of your platform's performance and activity.</p>
                </div>
              </Reveal>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <Reveal delay={50}>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Overall Progress</p>
                    <p className="text-4xl font-mono font-bold text-white">{overallProgress}%</p>
                    <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
                    </div>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Active Policies</p>
                    <p className="text-4xl font-mono font-bold text-white">{statusCounts.in_progress}</p>
                    <p className="text-xs text-gray-500 mt-2">{policies.length} total policies</p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Pending Requests</p>
                    <p className="text-4xl font-mono font-bold text-white">{pendingRequests.length}</p>
                    <p className="text-xs text-gray-500 mt-2">${pendingRequests.reduce((s, r) => s + (r.amount || 0), 0).toLocaleString()} total</p>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">New Feedback</p>
                    <p className="text-4xl font-mono font-bold text-white">{newFeedback.length}</p>
                    <p className="text-xs text-gray-500 mt-2">{feedback.length} total submissions</p>
                  </div>
                </Reveal>
              </div>

              {/* Department Progress */}
              <Reveal>
                <div className="mb-12">
                  <h2 className="text-xl font-semibold mb-6">Department Progress</h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {defaultDepartments.map((dept, i) => {
                      const deptPolicies = policies.filter(p => p.department === dept.id)
                      const progress = getOverallProgress(deptPolicies)
                      return (
                        <Reveal key={dept.id} delay={i * 50}>
                          <button
                            onClick={() => {
                              setSelectedDepartment(dept.id)
                              setActiveTab('platform')
                            }}
                            className="bg-white/5 border border-gray-800 rounded-xl p-5 hover:bg-white/10 transition-all text-left group"
                          >
                            <p className="text-sm text-gray-400 mb-2 group-hover:text-white transition-colors">{dept.name}</p>
                            <p className="text-2xl font-mono font-bold text-white">{progress}%</p>
                            <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-xs text-gray-600 mt-2">{deptPolicies.length} policies</p>
                          </button>
                        </Reveal>
                      )
                    })}
                  </div>
                </div>
              </Reveal>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-8">
                <Reveal>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {activityLog.slice(0, 15).map((entry, i) => (
                        <div key={entry.id} className={`flex items-start gap-3 p-3 rounded-lg ${i === 0 ? 'bg-white/5' : ''}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${
                            entry.action.includes('PROGRESS') ? 'bg-green-500' :
                            entry.action.includes('CREATE') ? 'bg-blue-500' :
                            entry.action.includes('UPDATE') ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{entry.details}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(entry.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                      {activityLog.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No activity recorded yet</p>
                      )}
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowAnnouncementModal(true)}
                        className="p-4 bg-white/5 border border-gray-700 rounded-lg hover:bg-white/10 transition-all text-left"
                      >
                        <p className="text-sm font-medium text-white">New Announcement</p>
                        <p className="text-xs text-gray-500 mt-1">Post update to students</p>
                      </button>
                      <button
                        onClick={handleExportAll}
                        className="p-4 bg-white/5 border border-gray-700 rounded-lg hover:bg-white/10 transition-all text-left"
                      >
                        <p className="text-sm font-medium text-white">Export Data</p>
                        <p className="text-xs text-gray-500 mt-1">Download all platform data</p>
                      </button>
                      <button
                        onClick={() => setActiveTab('feedback')}
                        className="p-4 bg-white/5 border border-gray-700 rounded-lg hover:bg-white/10 transition-all text-left"
                      >
                        <p className="text-sm font-medium text-white">Review Feedback</p>
                        <p className="text-xs text-gray-500 mt-1">{newFeedback.length} pending</p>
                      </button>
                      <button
                        onClick={() => setActiveTab('budget')}
                        className="p-4 bg-white/5 border border-gray-700 rounded-lg hover:bg-white/10 transition-all text-left"
                      >
                        <p className="text-sm font-medium text-white">Funding Requests</p>
                        <p className="text-xs text-gray-500 mt-1">{pendingRequests.length} pending</p>
                      </button>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          )}

          {/* ==========================================
              PLATFORM BUILDER TAB
          ========================================== */}
          {activeTab === 'platform' && (
            <div>
              <Reveal>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-4xl font-bold mb-4">Platform Builder</h1>
                    <p className="text-gray-400 text-lg">Create, edit, and manage your entire policy platform.</p>
                  </div>
                  <button
                    onClick={() => { setEditingPolicy(null); setShowPolicyModal(true) }}
                    className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-all"
                  >
                    + New Policy
                  </button>
                </div>
              </Reveal>

              {/* Filters */}
              <Reveal>
                <div className="flex flex-wrap gap-4 mb-8">
                  <input
                    type="text"
                    placeholder="Search policies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-3 bg-black border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:border-white focus:outline-none min-w-[250px]"
                  />
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="px-4 py-3 bg-black border border-gray-800 rounded-lg text-sm text-white focus:border-white focus:outline-none"
                  >
                    <option value="all">All Departments</option>
                    {defaultDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </Reveal>

              {/* Policy List */}
              <div className="space-y-4">
                {filteredPolicies.map((policy, i) => {
                  const dept = defaultDepartments.find(d => d.id === policy.department)
                  return (
                    <Reveal key={policy.id} delay={i * 30}>
                      <div className="bg-white/5 border border-gray-800 rounded-xl p-6 hover:bg-white/[0.07] transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{policy.title}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                                policy.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                policy.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {policy.status?.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-3">{policy.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{dept?.name || policy.department}</span>
                              <span>Updated {formatDate(policy.lastUpdated)}</span>
                            </div>
                          </div>
                          <div className="text-right ml-6">
                            <p className="text-3xl font-mono font-bold text-white">{policy.progress}%</p>
                            <p className="text-xs text-gray-500">Progress</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white rounded-full transition-all"
                              style={{ width: `${policy.progress}%` }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditingPolicy(policy); setShowPolicyModal(true) }}
                              className="px-3 py-1.5 bg-white/10 border border-gray-700 rounded text-xs text-white hover:bg-white/20 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                const newProgress = Math.min(100, policy.progress + 10)
                                logPolicyProgress(policy.id, newProgress, `Progress updated to ${newProgress}%`)
                              }}
                              className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 hover:bg-green-500/30 transition-all"
                            >
                              +10%
                            </button>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  )
                })}
                {filteredPolicies.length === 0 && (
                  <div className="text-center py-16 text-gray-500">
                    <p className="mb-4">No policies found</p>
                    <button
                      onClick={() => { setEditingPolicy(null); setShowPolicyModal(true) }}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      Create your first policy
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              BUDGET & FUNDING TAB
          ========================================== */}
          {activeTab === 'budget' && (
            <div>
              <Reveal>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold mb-4">Budget & Funding</h1>
                  <p className="text-gray-400 text-lg">Manage funding requests, allocations, and financial transparency.</p>
                </div>
              </Reveal>

              {/* Budget Overview */}
              <div className="grid md:grid-cols-4 gap-4 mb-12">
                <Reveal delay={50}>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Budget</p>
                    <p className="text-3xl font-mono font-bold text-white">${budgetData.total?.toLocaleString()}</p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Spent</p>
                    <p className="text-3xl font-mono font-bold text-white">${budgetData.spent?.toLocaleString()}</p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Remaining</p>
                    <p className="text-3xl font-mono font-bold text-white">${(budgetData.total - budgetData.spent)?.toLocaleString()}</p>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Pending Requests</p>
                    <p className="text-3xl font-mono font-bold text-white">{pendingRequests.length}</p>
                  </div>
                </Reveal>
              </div>

              {/* Pending Funding Requests */}
              <Reveal>
                <h2 className="text-xl font-semibold mb-6">Pending Funding Requests</h2>
              </Reveal>

              {pendingRequests.length === 0 ? (
                <Reveal>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-12 text-center">
                    <p className="text-gray-400">No pending funding requests</p>
                  </div>
                </Reveal>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request, i) => {
                    const cat = BUDGET_CATEGORIES.find(c => c.id === request.category)
                    return (
                      <Reveal key={request.id} delay={i * 50}>
                        <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-white">{request.orgName}</h3>
                                <span className="px-2 py-0.5 rounded text-xs font-mono bg-white/10 text-gray-400">
                                  {cat?.name || request.category}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400 mb-2">{request.description}</p>
                              <p className="text-xs text-gray-500">Submitted {formatRelativeTime(request.submittedAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-mono font-bold text-white">${request.amount?.toLocaleString()}</p>
                              {request.contextCheck && (
                                <span className={`px-2 py-0.5 rounded text-xs font-mono mt-2 inline-block ${
                                  request.contextCheck.flag === 'PASS'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {request.contextCheck.flag === 'PASS' ? 'Realistic' : 'Review'}
                                </span>
                              )}
                            </div>
                          </div>

                          {request.justification && (
                            <div className="bg-black/30 rounded-lg p-4 mb-4">
                              <p className="text-xs text-gray-500 uppercase mb-1">Justification</p>
                              <p className="text-sm text-gray-300">{request.justification}</p>
                            </div>
                          )}

                          {request.contextCheck?.note && (
                            <p className="text-xs text-gray-500 mb-4">Context: {request.contextCheck.note}</p>
                          )}

                          <div className="flex gap-3">
                            <button
                              onClick={() => approveFundingRequest(request.id, request.amount)}
                              className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-400 hover:bg-green-500/30 transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const note = prompt('Reason for denial (optional):')
                                denyFundingRequest(request.id, note || '')
                              }}
                              className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/30 transition-all"
                            >
                              Deny
                            </button>
                          </div>
                        </div>
                      </Reveal>
                    )
                  })}
                </div>
              )}

              {/* Export Options */}
              <Reveal>
                <div className="mt-12 pt-8 border-t border-gray-800">
                  <h3 className="text-lg font-semibold mb-4">Export Financial Data</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        const csv = exportLineItemsToCSV(budgetLineItems.length ? budgetLineItems : [])
                        const blob = new Blob([csv], { type: 'text/csv' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `budget-line-items-${new Date().toISOString().split('T')[0]}.csv`
                        a.click()
                      }}
                      className="px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-sm text-white hover:bg-white/20 transition-all"
                    >
                      Export Line Items CSV
                    </button>
                    <button
                      onClick={() => {
                        const csv = exportFundingRequestsToCSV(fundingRequests)
                        const blob = new Blob([csv], { type: 'text/csv' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `funding-requests-${new Date().toISOString().split('T')[0]}.csv`
                        a.click()
                      }}
                      className="px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-sm text-white hover:bg-white/20 transition-all"
                    >
                      Export Requests CSV
                    </button>
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          {/* ==========================================
              CONTENT TAB
          ========================================== */}
          {activeTab === 'content' && (
            <div>
              <Reveal>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold mb-4">Content Management</h1>
                  <p className="text-gray-400 text-lg">Manage announcements and site-wide content.</p>
                </div>
              </Reveal>

              {/* Announcements */}
              <Reveal>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Announcements</h2>
                  <button
                    onClick={() => { setEditingAnnouncement(null); setShowAnnouncementModal(true) }}
                    className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-all text-sm"
                  >
                    + New Announcement
                  </button>
                </div>
              </Reveal>

              <div className="space-y-4 mb-12">
                {announcements.map((ann, i) => (
                  <Reveal key={ann.id} delay={i * 50}>
                    <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{ann.title}</h3>
                          <p className="text-sm text-gray-400">{ann.content}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => { setEditingAnnouncement(ann); setShowAnnouncementModal(true) }}
                            className="px-3 py-1.5 bg-white/10 border border-gray-700 rounded text-xs text-white hover:bg-white/20 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this announcement?')) {
                                deleteAnnouncement(ann.id)
                              }
                            }}
                            className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400 hover:bg-red-500/30 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{ann.category || 'General'}</span>
                        <span>{formatDate(ann.createdAt)}</span>
                        {ann.pinned && <span className="text-yellow-400">Pinned</span>}
                      </div>
                    </div>
                  </Reveal>
                ))}
                {announcements.length === 0 && (
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-12 text-center">
                    <p className="text-gray-400">No announcements yet</p>
                  </div>
                )}
              </div>

              {/* Site Content */}
              <Reveal>
                <div className="pt-8 border-t border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold">Site Content Overrides</h2>
                      <p className="text-sm text-gray-500 mt-1">Custom content set via inline editing</p>
                    </div>
                    {Object.keys(siteContent).length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm('Reset all content to defaults? This cannot be undone.')) {
                            resetAllSiteContent()
                          }
                        }}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/30 transition-all"
                      >
                        Reset All to Default
                      </button>
                    )}
                  </div>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                    {Object.keys(siteContent).length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No content overrides. Use edit mode on pages to customize text.</p>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {Object.entries(siteContent).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                            <div className="flex-1 min-w-0 mr-4">
                              <p className="text-xs text-gray-500 font-mono truncate">{key}</p>
                              <p className="text-sm text-white truncate">{String(value)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          {/* ==========================================
              FEEDBACK TAB
          ========================================== */}
          {activeTab === 'feedback' && (
            <div>
              <Reveal>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold mb-4">Student Feedback</h1>
                  <p className="text-gray-400 text-lg">Review and respond to feedback from students.</p>
                </div>
              </Reveal>

              {/* Feedback Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-12">
                <Reveal delay={50}>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total</p>
                    <p className="text-3xl font-mono font-bold text-white">{feedback.length}</p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                    <p className="text-xs text-yellow-400 uppercase tracking-wider mb-2">New</p>
                    <p className="text-3xl font-mono font-bold text-yellow-400">{feedback.filter(f => f.status === 'new').length}</p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">In Review</p>
                    <p className="text-3xl font-mono font-bold text-white">{feedback.filter(f => f.status === 'in_review').length}</p>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                    <p className="text-xs text-green-400 uppercase tracking-wider mb-2">Resolved</p>
                    <p className="text-3xl font-mono font-bold text-green-400">{feedback.filter(f => f.status === 'resolved').length}</p>
                  </div>
                </Reveal>
              </div>

              {/* Feedback List */}
              <div className="space-y-4">
                {feedback.map((item, i) => (
                  <Reveal key={item.id} delay={i * 30}>
                    <div className={`bg-white/5 border rounded-xl p-6 ${
                      item.status === 'new' ? 'border-yellow-500/30' : 'border-gray-800'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                              item.status === 'new' ? 'bg-yellow-500/20 text-yellow-400' :
                              item.status === 'in_review' ? 'bg-blue-500/20 text-blue-400' :
                              item.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {item.status?.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">{item.category || 'General'}</span>
                          </div>
                          <p className="text-white mb-2">{item.message}</p>
                          <p className="text-xs text-gray-500">{formatRelativeTime(item.submittedAt)}</p>
                        </div>
                      </div>
                      {item.status !== 'resolved' && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-800">
                          {item.status === 'new' && (
                            <button
                              onClick={() => updateFeedbackStatus(item.id, 'in_review')}
                              className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-400 hover:bg-blue-500/30 transition-all"
                            >
                              Mark In Review
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const note = prompt('Resolution note (optional):')
                              updateFeedbackStatus(item.id, 'resolved', note || '')
                            }}
                            className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 hover:bg-green-500/30 transition-all"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      )}
                    </div>
                  </Reveal>
                ))}
                {feedback.length === 0 && (
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-12 text-center">
                    <p className="text-gray-400">No feedback submissions yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              SETTINGS TAB
          ========================================== */}
          {activeTab === 'settings' && (
            <div>
              <Reveal>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold mb-4">Settings</h1>
                  <p className="text-gray-400 text-lg">Manage platform data, backups, and system settings.</p>
                </div>
              </Reveal>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Data Management */}
                <Reveal>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-8">
                    <h2 className="text-xl font-semibold mb-6">Data Management</h2>

                    <div className="space-y-4">
                      <div className="p-4 bg-black/30 rounded-lg">
                        <h3 className="font-medium text-white mb-2">Export All Data</h3>
                        <p className="text-sm text-gray-400 mb-4">Download a complete backup of all platform data including policies, budget, feedback, and settings.</p>
                        <button
                          onClick={handleExportAll}
                          className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-all text-sm"
                        >
                          Download Backup
                        </button>
                      </div>

                      <div className="p-4 bg-black/30 rounded-lg">
                        <h3 className="font-medium text-white mb-2">Import Data</h3>
                        <p className="text-sm text-gray-400 mb-4">Restore from a previous backup or import data from another platform.</p>
                        <label className="px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-sm text-white hover:bg-white/20 transition-all cursor-pointer inline-block">
                          Choose File
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Danger Zone */}
                <Reveal delay={100}>
                  <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-8">
                    <h2 className="text-xl font-semibold text-red-400 mb-6">Danger Zone</h2>

                    <div className="space-y-4">
                      <div className="p-4 bg-black/30 rounded-lg">
                        <h3 className="font-medium text-white mb-2">Reset All Data</h3>
                        <p className="text-sm text-gray-400 mb-4">Permanently delete all data and start fresh. This action cannot be undone.</p>
                        {!showConfirmReset ? (
                          <button
                            onClick={() => setShowConfirmReset(true)}
                            className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/30 transition-all"
                          >
                            Reset Platform
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-red-400 font-medium">Are you absolutely sure? This will delete everything.</p>
                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  resetAllData()
                                  setShowConfirmReset(false)
                                  alert('Platform has been reset.')
                                }}
                                className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all text-sm"
                              >
                                Yes, Delete Everything
                              </button>
                              <button
                                onClick={() => setShowConfirmReset(false)}
                                className="px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-sm text-white hover:bg-white/20 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Platform Info */}
                <Reveal delay={150}>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-8">
                    <h2 className="text-xl font-semibold mb-6">Platform Statistics</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Total Policies</span>
                        <span className="font-mono text-white">{policies.length}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Announcements</span>
                        <span className="font-mono text-white">{announcements.length}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Feedback Submissions</span>
                        <span className="font-mono text-white">{feedback.length}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Funding Requests</span>
                        <span className="font-mono text-white">{fundingRequests.length}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-800">
                        <span className="text-gray-400">Activity Log Entries</span>
                        <span className="font-mono text-white">{activityLog.length}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Content Overrides</span>
                        <span className="font-mono text-white">{Object.keys(siteContent).length}</span>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Quick Links */}
                <Reveal delay={200}>
                  <div className="bg-white/5 border border-gray-800 rounded-xl p-8">
                    <h2 className="text-xl font-semibold mb-6">Quick Links</h2>
                    <div className="space-y-3">
                      <Link
                        href="/"
                        className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-all"
                      >
                        <span className="text-white">View Public Site</span>
                        <span className="text-gray-500">→</span>
                      </Link>
                      <Link
                        href="/budget"
                        className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-all"
                      >
                        <span className="text-white">Budget Page</span>
                        <span className="text-gray-500">→</span>
                      </Link>
                      <Link
                        href="/setup"
                        className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-all"
                      >
                        <span className="text-white">Setup Guide</span>
                        <span className="text-gray-500">→</span>
                      </Link>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ==========================================
          POLICY MODAL
      ========================================== */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">{editingPolicy ? 'Edit Policy' : 'New Policy'}</h2>
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  ×
                </button>
              </div>

              <PolicyForm
                policy={editingPolicy}
                onSave={(data) => {
                  if (editingPolicy) {
                    updatePolicy(editingPolicy.id, data)
                  } else {
                    // For new policies, we'd need an addPolicy function
                    // For now, just log
                    logActivity('CREATE_POLICY', 'platform', `Created new policy: ${data.title}`)
                  }
                  setShowPolicyModal(false)
                }}
                onCancel={() => setShowPolicyModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ANNOUNCEMENT MODAL
      ========================================== */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl max-w-xl w-full">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</h2>
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  ×
                </button>
              </div>

              <AnnouncementForm
                announcement={editingAnnouncement}
                onSave={(data) => {
                  if (editingAnnouncement) {
                    updateAnnouncement(editingAnnouncement.id, data)
                  } else {
                    addAnnouncement(data)
                  }
                  setShowAnnouncementModal(false)
                }}
                onCancel={() => setShowAnnouncementModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// POLICY FORM COMPONENT
// ==========================================
function PolicyForm({ policy, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: policy?.title || '',
    description: policy?.description || '',
    department: policy?.department || 'wellness',
    status: policy?.status || 'planned',
    progress: policy?.progress || 0,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title) return alert('Title is required')
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Policy Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-white focus:outline-none"
          placeholder="Enter policy title"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-white focus:outline-none resize-none"
          placeholder="Describe the policy..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Department</label>
          <select
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:border-white focus:outline-none"
          >
            {defaultDepartments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:border-white focus:outline-none"
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Progress ({form.progress}%)</label>
        <input
          type="range"
          min="0"
          max="100"
          value={form.progress}
          onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-all"
        >
          {policy ? 'Save Changes' : 'Create Policy'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-white/10 border border-gray-700 rounded-lg text-white hover:bg-white/20 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ==========================================
// ANNOUNCEMENT FORM COMPONENT
// ==========================================
function AnnouncementForm({ announcement, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    category: announcement?.category || 'general',
    pinned: announcement?.pinned || false,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title || !form.content) return alert('Title and content are required')
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-white focus:outline-none"
          placeholder="Announcement title"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Content</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-white focus:outline-none resize-none"
          placeholder="Write your announcement..."
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:border-white focus:outline-none"
        >
          <option value="general">General</option>
          <option value="wellness">Wellness</option>
          <option value="academic">Academic</option>
          <option value="events">Events</option>
          <option value="budget">Budget</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.pinned}
          onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
          className="w-5 h-5 rounded border-gray-700 bg-black"
        />
        <span className="text-sm text-gray-400">Pin this announcement</span>
      </label>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-all"
        >
          {announcement ? 'Save Changes' : 'Post Announcement'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-white/10 border border-gray-700 rounded-lg text-white hover:bg-white/20 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
