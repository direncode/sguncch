import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { departments, getOverallProgress, getStatusCounts } from '../../lib/data'

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

export default function AdminDashboard() {
  const router = useRouter()
  const {
    isAdmin, isLoaded, policies, operationalData, budgetData, announcements,
    activityLog, feedback, quickStats,
    updatePolicy, updatePolicyMetrics,
    addAnnouncement, deleteAnnouncement, pinAnnouncement,
    updateFeedbackStatus,
    addTechDevice, updateTechDevice, deleteTechDevice, addTechLoan, updateTechLoan,
    updatePantryLocation, logPantryVisit, logPantryDonation,
    addTrainingSession,
    updateBudget, updateBudgetCategory, addBudgetTransaction,
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
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push('/admin/login')
    }
  }, [isLoaded, isAdmin, router])

  if (!isLoaded || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8ed]">
          <h3 className="text-lg font-semibold text-[#1d1d1f]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-[#e8e8ed] transition">
            <span className="text-[#86868b] text-xl leading-none">&times;</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )

  // Input Component
  const Input = ({ label, ...props }) => (
    <div>
      {label && <label className="block text-sm font-medium text-[#1d1d1f] mb-2">{label}</label>}
      <input {...props} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] placeholder-[#86868b] focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-0" />
    </div>
  )

  // Select Component
  const Select = ({ label, options, ...props }) => (
    <div>
      {label && <label className="block text-sm font-medium text-[#1d1d1f] mb-2">{label}</label>}
      <select {...props} className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]">
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  )

  // Button Component
  const Button = ({ variant = 'primary', children, ...props }) => {
    const base = "px-5 py-2.5 rounded-full font-medium text-sm transition-all"
    const variants = {
      primary: "bg-[#0071e3] text-white hover:bg-[#0077ed] active:scale-[0.98]",
      secondary: "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]",
      danger: "bg-[#ff3b30] text-white hover:bg-[#ff453a]",
    }
    return <button {...props} className={`${base} ${variants[variant]}`}>{children}</button>
  }

  // Stat Card
  const StatCard = ({ value, label, color = 'blue' }) => {
    const colors = {
      blue: 'text-[#0071e3]',
      green: 'text-[#34c759]',
      orange: 'text-[#ff9500]',
      purple: 'text-[#af52de]',
      red: 'text-[#ff3b30]',
    }
    return (
      <div className="bg-white rounded-2xl p-6">
        <p className={`text-4xl font-semibold ${colors[color]} tracking-tight`}>{value}</p>
        <p className="text-[#86868b] text-sm mt-1">{label}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Head>
        <title>Admin | Project Bold</title>
      </Head>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#1d1d1f] text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-[fadeIn_0.2s]">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[#e8e8ed] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-[#0071e3] text-sm font-medium hover:text-[#0077ed]">
                ← Back to Site
              </Link>
              <h1 className="text-[#1d1d1f] font-semibold">Admin</h1>
            </div>
            <div className="text-sm text-[#86868b]">Project Bold</div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white/60 backdrop-blur-xl border-b border-[#e8e8ed]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1d1d1f] text-white'
                    : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Overview</h2>
              <p className="text-[#86868b] mt-1">Platform performance at a glance</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard value={`${overallProgress}%`} label="Overall Progress" color="blue" />
              <StatCard value={statusCounts.completed} label="Completed" color="green" />
              <StatCard value={statusCounts.in_progress} label="In Progress" color="orange" />
              <StatCard value={feedback.filter(f => f.status === 'new').length} label="New Feedback" color="purple" />
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">Platform Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { key: 'totalStudentsReached', label: 'Students Reached' },
                  { key: 'activeInitiatives', label: 'Active Initiatives' },
                  { key: 'eventsThisMonth', label: 'Events This Month' },
                  { key: 'feedbackReceived', label: 'Feedback Received' },
                ].map(item => (
                  <div key={item.key}>
                    <label className="text-sm text-[#86868b] block mb-2">{item.label}</label>
                    <input
                      type="number"
                      value={quickStats[item.key]}
                      onChange={(e) => updateQuickStats({ [item.key]: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-[#f5f5f7] rounded-xl text-2xl font-semibold text-[#1d1d1f] border-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">Department Progress</h3>
              <div className="space-y-4">
                {departments.map(dept => {
                  const deptPolicies = policies.filter(p => p.department === dept.id)
                  const deptProgress = getOverallProgress(deptPolicies)
                  return (
                    <div key={dept.id} className="flex items-center gap-4">
                      <span className="text-2xl w-10">{dept.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-[#1d1d1f] text-sm">{dept.name}</span>
                          <span className="text-sm text-[#86868b]">{deptProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0071e3] rounded-full transition-all" style={{ width: `${deptProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {activityLog.slice(0, 8).map(entry => (
                  <div key={entry.id} className="flex items-center gap-4 py-2">
                    <div className="w-2 h-2 rounded-full bg-[#0071e3]" />
                    <div className="flex-1">
                      <p className="text-sm text-[#1d1d1f]">{entry.details}</p>
                      <p className="text-xs text-[#86868b]">{formatDate(entry.timestamp)} at {formatTime(entry.timestamp)}</p>
                    </div>
                  </div>
                ))}
                {activityLog.length === 0 && <p className="text-[#86868b] text-sm">No activity yet</p>}
              </div>
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Announcements</h2>
                <p className="text-[#86868b] mt-1">Communicate directly with students</p>
              </div>
              <Button onClick={() => setShowModal('announcement')}>New Announcement</Button>
            </div>

            <div className="space-y-4">
              {[...announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(a => (
                <div key={a.id} className={`bg-white rounded-2xl p-6 ${a.pinned ? 'ring-2 ring-[#ff9500]' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {a.pinned && <span className="text-[#ff9500]">★</span>}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          a.category === 'urgent' ? 'bg-[#ff3b30]/10 text-[#ff3b30]' :
                          a.category === 'event' ? 'bg-[#af52de]/10 text-[#af52de]' :
                          a.category === 'milestone' ? 'bg-[#34c759]/10 text-[#34c759]' :
                          'bg-[#f5f5f7] text-[#86868b]'
                        }`}>{a.category}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-[#1d1d1f]">{a.title}</h3>
                      <p className="text-[#6e6e73] mt-1">{a.content}</p>
                      <p className="text-xs text-[#86868b] mt-3">{formatDate(a.createdAt)}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => pinAnnouncement(a.id, !a.pinned)} className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-[#e8e8ed] text-[#86868b]">★</button>
                      <button onClick={() => { deleteAnnouncement(a.id); notify('Deleted') }} className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-[#ff3b30]/10 text-[#86868b] hover:text-[#ff3b30]">×</button>
                    </div>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <p className="text-[#86868b]">No announcements yet</p>
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
                    <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Content</label>
                    <textarea value={announcementForm.content} onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} rows={4} required className="w-full px-4 py-3 bg-[#f5f5f7] border-0 rounded-xl text-[#1d1d1f] resize-none focus:ring-2 focus:ring-[#0071e3]" />
                  </div>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={announcementForm.pinned} onChange={(e) => setAnnouncementForm({ ...announcementForm, pinned: e.target.checked })} />
                    <span className="text-sm text-[#1d1d1f]">Pin announcement</span>
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
                <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Policies</h2>
                <p className="text-[#86868b] mt-1">Manage all 40 policy initiatives</p>
              </div>
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="px-4 py-2 bg-white rounded-full text-sm text-[#1d1d1f] border-0 shadow-sm">
                <option value="all">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              {filteredPolicies.map(policy => (
                <div key={policy.id} className="bg-white rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{departments.find(d => d.id === policy.department)?.icon}</span>
                      <div>
                        <h3 className="font-semibold text-[#1d1d1f]">{policy.title}</h3>
                        <p className="text-sm text-[#86868b] mt-0.5">{policy.description}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      policy.priority === 'high' ? 'bg-[#ff3b30]/10 text-[#ff3b30]' :
                      policy.priority === 'medium' ? 'bg-[#ff9500]/10 text-[#ff9500]' :
                      'bg-[#f5f5f7] text-[#86868b]'
                    }`}>{policy.priority}</span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-[#86868b] uppercase tracking-wider">Status</label>
                      <select value={policy.status} onChange={(e) => { updatePolicy(policy.id, { status: e.target.value }); notify('Updated') }} className="w-full mt-1 px-3 py-2 bg-[#f5f5f7] rounded-lg text-sm border-0">
                        <option value="planned">Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#86868b] uppercase tracking-wider">Progress — {policy.progress}%</label>
                      <input type="range" min="0" max="100" value={policy.progress} onChange={(e) => updatePolicy(policy.id, { progress: parseInt(e.target.value) })} className="w-full mt-3" />
                    </div>
                    <div>
                      <label className="text-xs text-[#86868b] uppercase tracking-wider">Priority</label>
                      <select value={policy.priority} onChange={(e) => { updatePolicy(policy.id, { priority: e.target.value }); notify('Updated') }} className="w-full mt-1 px-3 py-2 bg-[#f5f5f7] rounded-lg text-sm border-0">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden mb-4">
                    <div className={`h-full rounded-full transition-all ${
                      policy.status === 'completed' ? 'bg-[#34c759]' :
                      policy.status === 'in_progress' ? 'bg-[#0071e3]' : 'bg-[#d2d2d7]'
                    }`} style={{ width: `${policy.progress}%` }} />
                  </div>

                  {policy.metrics && (
                    <div>
                      <label className="text-xs text-[#86868b] uppercase tracking-wider">Metrics</label>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        {Object.entries(policy.metrics).map(([key, value]) => (
                          <div key={key} className="bg-[#f5f5f7] rounded-lg p-3">
                            <label className="text-xs text-[#86868b] capitalize block mb-1">{key.replace(/([A-Z])/g, ' $1')}</label>
                            <input type="number" value={value} onChange={(e) => updatePolicyMetrics(policy.id, { [key]: parseInt(e.target.value) || 0 })} className="w-full bg-transparent text-lg font-semibold text-[#1d1d1f] border-0 p-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OPERATIONS */}
        {activeTab === 'operations' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Operations</h2>
              <p className="text-[#86868b] mt-1">Manage programs and services</p>
            </div>

            {/* Tech Loaner */}
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#1d1d1f]">Tech Loaner Program</h3>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setShowModal('device')}>Add Device</Button>
                  <Button onClick={() => setShowModal('loan')}>Record Loan</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e8e8ed]">
                      <th className="text-left py-3 text-xs text-[#86868b] uppercase tracking-wider font-semibold">Device</th>
                      <th className="text-center py-3 text-xs text-[#86868b] uppercase tracking-wider font-semibold">Total</th>
                      <th className="text-center py-3 text-xs text-[#86868b] uppercase tracking-wider font-semibold">Available</th>
                      <th className="text-center py-3 text-xs text-[#86868b] uppercase tracking-wider font-semibold">On Loan</th>
                      <th className="text-right py-3 text-xs text-[#86868b] uppercase tracking-wider font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operationalData.techLoaners.devices.map(device => (
                      <tr key={device.id} className="border-b border-[#e8e8ed]">
                        <td className="py-4 font-medium text-[#1d1d1f]">{device.name}</td>
                        <td className="py-4 text-center">
                          <input type="number" value={device.total} onChange={(e) => updateTechDevice(device.id, { total: parseInt(e.target.value) || 0 })} className="w-16 text-center bg-[#f5f5f7] rounded-lg py-1 border-0" />
                        </td>
                        <td className="py-4 text-center">
                          <input type="number" value={device.available} onChange={(e) => updateTechDevice(device.id, { available: parseInt(e.target.value) || 0 })} className="w-16 text-center bg-[#f5f5f7] rounded-lg py-1 border-0" />
                        </td>
                        <td className="py-4 text-center">
                          <input type="number" value={device.onLoan} onChange={(e) => updateTechDevice(device.id, { onLoan: parseInt(e.target.value) || 0 })} className="w-16 text-center bg-[#f5f5f7] rounded-lg py-1 border-0" />
                        </td>
                        <td className="py-4 text-right">
                          <button onClick={() => { deleteTechDevice(device.id); notify('Deleted') }} className="text-[#ff3b30] text-sm hover:underline">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {operationalData.techLoaners.loans.filter(l => l.status === 'active').length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#e8e8ed]">
                  <h4 className="text-xs text-[#86868b] uppercase tracking-wider font-semibold mb-3">Active Loans</h4>
                  {operationalData.techLoaners.loans.filter(l => l.status === 'active').map(loan => (
                    <div key={loan.id} className="flex items-center justify-between py-3 border-b border-[#f5f5f7]">
                      <div>
                        <p className="font-medium text-[#1d1d1f]">{loan.studentName}</p>
                        <p className="text-sm text-[#86868b]">{loan.deviceType} · Due {loan.dueDate}</p>
                      </div>
                      <button onClick={() => { updateTechLoan(loan.id, { status: 'returned' }); notify('Returned') }} className="text-[#0071e3] text-sm font-medium hover:underline">Mark Returned</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Food Pantry */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-6">Food Pantry</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#ff9500]/10 rounded-xl p-4 text-center">
                  <p className="text-3xl font-semibold text-[#ff9500]">{operationalData.foodPantry.totalVisits}</p>
                  <p className="text-sm text-[#86868b]">Total Visits</p>
                </div>
                <div className="bg-[#34c759]/10 rounded-xl p-4 text-center">
                  <p className="text-3xl font-semibold text-[#34c759]">${operationalData.foodPantry.donations}</p>
                  <p className="text-sm text-[#86868b]">Donations</p>
                </div>
                <div className="bg-[#0071e3]/10 rounded-xl p-4 text-center">
                  <p className="text-3xl font-semibold text-[#0071e3]">{operationalData.foodPantry.locations.length}</p>
                  <p className="text-sm text-[#86868b]">Locations</p>
                </div>
              </div>
              <div className="space-y-4">
                {operationalData.foodPantry.locations.map(loc => (
                  <div key={loc.id} className="bg-[#f5f5f7] rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-[#1d1d1f]">{loc.name}</h4>
                        <p className="text-sm text-[#86868b]">{loc.hours}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { logPantryVisit(loc.id, 1); notify('+1 visit') }} className="px-3 py-1 bg-white rounded-full text-sm text-[#0071e3] font-medium">+1</button>
                        <button onClick={() => { logPantryVisit(loc.id, 10); notify('+10 visits') }} className="px-3 py-1 bg-white rounded-full text-sm text-[#0071e3] font-medium">+10</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#86868b]">Visits</label>
                        <input type="number" value={loc.visits || 0} onChange={(e) => updatePantryLocation(loc.id, { visits: parseInt(e.target.value) || 0 })} className="w-full mt-1 px-3 py-2 bg-white rounded-lg border-0 text-[#1d1d1f]" />
                      </div>
                      <div>
                        <label className="text-xs text-[#86868b]">Inventory</label>
                        <select value={loc.inventory || 'unknown'} onChange={(e) => updatePantryLocation(loc.id, { inventory: e.target.value })} className="w-full mt-1 px-3 py-2 bg-white rounded-lg border-0 text-[#1d1d1f]">
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
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#1d1d1f]">Training Programs</h3>
                <Button variant="secondary" onClick={() => setShowModal('training')}>Add Session</Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#af52de]/10 rounded-xl p-6">
                  <h4 className="font-medium text-[#1d1d1f]">Mental Health First Aid</h4>
                  <p className="text-3xl font-semibold text-[#af52de] mt-2">{operationalData.trainings.mentalHealthFirstAid.totalTrained}</p>
                  <p className="text-sm text-[#86868b]">trained · {operationalData.trainings.mentalHealthFirstAid.sessions.length} sessions</p>
                </div>
                <div className="bg-[#ff9500]/10 rounded-xl p-6">
                  <h4 className="font-medium text-[#1d1d1f]">Bias Response</h4>
                  <p className="text-3xl font-semibold text-[#ff9500] mt-2">{operationalData.trainings.biasResponse.totalTrained}</p>
                  <p className="text-sm text-[#86868b]">trained · {operationalData.trainings.biasResponse.sessions.length} sessions</p>
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
                    { value: 'biasResponse', label: 'Bias Response' },
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

        {/* BUDGET */}
        {activeTab === 'budget' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Budget</h2>
                <p className="text-[#86868b] mt-1">Track spending and allocations</p>
              </div>
              <Button onClick={() => setShowModal('transaction')}>Add Transaction</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6">
                <label className="text-xs text-[#86868b] uppercase tracking-wider">Total Budget</label>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-[#86868b]">$</span>
                  <input type="number" value={budgetData.total} onChange={(e) => updateBudget({ total: parseFloat(e.target.value) || 0 })} className="text-4xl font-semibold text-[#34c759] bg-transparent border-0 w-full" />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <label className="text-xs text-[#86868b] uppercase tracking-wider">Allocated</label>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-[#86868b]">$</span>
                  <input type="number" value={budgetData.allocated} onChange={(e) => updateBudget({ allocated: parseFloat(e.target.value) || 0 })} className="text-4xl font-semibold text-[#0071e3] bg-transparent border-0 w-full" />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <label className="text-xs text-[#86868b] uppercase tracking-wider">Spent</label>
                <p className="text-4xl font-semibold text-[#ff9500] mt-2">${budgetData.spent.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xs text-[#86868b] uppercase tracking-wider font-semibold mb-4">Categories</h3>
              <div className="space-y-6">
                {budgetData.categories.map(cat => (
                  <div key={cat.name}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-[#1d1d1f]">{cat.name}</span>
                      <span className="text-sm text-[#86868b]">${cat.spent} / ${cat.allocated}</span>
                    </div>
                    <div className="h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-[#34c759] rounded-full" style={{ width: `${cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#86868b]">Allocated</label>
                        <input type="number" value={cat.allocated} onChange={(e) => updateBudgetCategory(cat.name, { allocated: parseFloat(e.target.value) || 0 })} className="w-full mt-1 px-3 py-2 bg-[#f5f5f7] rounded-lg border-0" />
                      </div>
                      <div>
                        <label className="text-xs text-[#86868b]">Spent</label>
                        <input type="number" value={cat.spent} onChange={(e) => updateBudgetCategory(cat.name, { spent: parseFloat(e.target.value) || 0 })} className="w-full mt-1 px-3 py-2 bg-[#f5f5f7] rounded-lg border-0" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {budgetData.transactions?.length > 0 && (
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-xs text-[#86868b] uppercase tracking-wider font-semibold mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {budgetData.transactions.slice(-8).reverse().map(tx => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-[#f5f5f7]">
                      <div>
                        <p className="font-medium text-[#1d1d1f]">{tx.description}</p>
                        <p className="text-sm text-[#86868b]">{formatDate(tx.date)}</p>
                      </div>
                      <span className={`font-semibold ${tx.type === 'expense' ? 'text-[#ff3b30]' : 'text-[#34c759]'}`}>
                        {tx.type === 'expense' ? '-' : '+'}${tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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
              <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Feedback</h2>
              <p className="text-[#86868b] mt-1">Student submissions and responses</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <StatCard value={feedback.length} label="Total" color="blue" />
              <StatCard value={feedback.filter(f => f.status === 'new').length} label="New" color="orange" />
              <StatCard value={feedback.filter(f => f.status === 'reviewed').length} label="Reviewed" color="purple" />
              <StatCard value={feedback.filter(f => f.status === 'resolved').length} label="Resolved" color="green" />
            </div>

            <div className="space-y-4">
              {feedback.map(item => (
                <div key={item.id} className={`bg-white rounded-2xl p-6 border-l-4 ${
                  item.status === 'new' ? 'border-[#ff9500]' :
                  item.status === 'reviewed' ? 'border-[#af52de]' :
                  item.status === 'resolved' ? 'border-[#34c759]' : 'border-[#e8e8ed]'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'new' ? 'bg-[#ff9500]/10 text-[#ff9500]' :
                      item.status === 'reviewed' ? 'bg-[#af52de]/10 text-[#af52de]' :
                      item.status === 'resolved' ? 'bg-[#34c759]/10 text-[#34c759]' :
                      'bg-[#f5f5f7] text-[#86868b]'
                    }`}>{item.status}</span>
                    <span className="text-sm text-[#86868b]">{formatDate(item.submittedAt)}</span>
                  </div>
                  <p className="text-[#1d1d1f] mb-3">{item.message}</p>
                  {item.email && <p className="text-sm text-[#86868b] mb-3">From: {item.email}</p>}
                  {item.adminNote && (
                    <div className="bg-[#f5f5f7] rounded-lg p-3 mb-3">
                      <p className="text-sm text-[#6e6e73]"><strong>Note:</strong> {item.adminNote}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <select value={item.status} onChange={(e) => { updateFeedbackStatus(item.id, e.target.value); notify('Updated') }} className="px-3 py-2 bg-[#f5f5f7] rounded-lg text-sm border-0">
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                    <input type="text" placeholder="Add note..." className="flex-1 px-3 py-2 bg-[#f5f5f7] rounded-lg text-sm border-0" onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value) { updateFeedbackStatus(item.id, item.status, e.target.value); e.target.value = ''; notify('Note added') }}} />
                  </div>
                </div>
              ))}
              {feedback.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <p className="text-[#86868b]">No feedback yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Activity</h2>
                <p className="text-[#86868b] mt-1">Complete audit trail</p>
              </div>
              <button onClick={() => { if(confirm('Clear all activity?')) { clearActivityLog(); notify('Cleared') }}} className="text-sm text-[#ff3b30] hover:underline">Clear Log</button>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                {activityLog.map(entry => (
                  <div key={entry.id} className="flex items-center gap-4 px-6 py-4 border-b border-[#f5f5f7] hover:bg-[#f5f5f7]/50">
                    <div className="w-2 h-2 rounded-full bg-[#0071e3]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1d1d1f] truncate">{entry.details}</p>
                      <p className="text-xs text-[#86868b]">{entry.category} · {entry.action}</p>
                    </div>
                    <span className="text-sm text-[#86868b] whitespace-nowrap">{formatDate(entry.timestamp)} {formatTime(entry.timestamp)}</span>
                  </div>
                ))}
                {activityLog.length === 0 && (
                  <div className="p-12 text-center text-[#86868b]">No activity yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Settings</h2>
              <p className="text-[#86868b] mt-1">Data management and backup</p>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">Backup & Restore</h3>
              <p className="text-[#86868b] mb-4">Export your data for backup or import a previous backup.</p>
              <div className="flex gap-3">
                <Button onClick={handleExport}>Export Data</Button>
                <label className="px-5 py-2.5 rounded-full font-medium text-sm bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed] cursor-pointer transition-all">
                  Import Data
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Storage</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Policies', value: policies.length },
                  { label: 'Announcements', value: announcements.length },
                  { label: 'Feedback', value: feedback.length },
                  { label: 'Activity Log', value: activityLog.length },
                ].map(item => (
                  <div key={item.label} className="bg-[#f5f5f7] rounded-xl p-4">
                    <p className="text-2xl font-semibold text-[#1d1d1f]">{item.value}</p>
                    <p className="text-sm text-[#86868b]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#ff3b30]/5 border border-[#ff3b30]/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#ff3b30] mb-2">Danger Zone</h3>
              <p className="text-[#6e6e73] mb-4">This action cannot be undone. All data will be reset to initial state.</p>
              <Button variant="danger" onClick={() => { if(confirm('Reset ALL data?')) { if(confirm('Are you sure?')) { resetAllData(); notify('Data reset') }}}}>Reset All Data</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
