import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { departments, getOverallProgress, getStatusCounts } from '../../lib/data'

// Helper to format dates nicely
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatShortDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Activity category colors
const categoryColors = {
  auth: 'bg-purple-100 text-purple-800',
  policy: 'bg-blue-100 text-blue-800',
  communication: 'bg-green-100 text-green-800',
  engagement: 'bg-yellow-100 text-yellow-800',
  operations: 'bg-orange-100 text-orange-800',
  'tech-loaner': 'bg-cyan-100 text-cyan-800',
  'food-pantry': 'bg-pink-100 text-pink-800',
  training: 'bg-indigo-100 text-indigo-800',
  events: 'bg-rose-100 text-rose-800',
  advocacy: 'bg-red-100 text-red-800',
  budget: 'bg-emerald-100 text-emerald-800',
  analytics: 'bg-violet-100 text-violet-800',
  system: 'bg-gray-100 text-gray-800',
}

export default function AdminDashboard() {
  const router = useRouter()
  const {
    isAdmin, isLoaded, policies, operationalData, budgetData, announcements,
    activityLog, feedback, quickStats,
    updatePolicy, updatePolicyMetrics, batchUpdatePolicies,
    addAnnouncement, updateAnnouncement, deleteAnnouncement, pinAnnouncement,
    updateFeedbackStatus,
    addTechDevice, updateTechDevice, deleteTechDevice, addTechLoan, updateTechLoan,
    updatePantryLocation, logPantryVisit, logPantryDonation,
    addTrainingSession, logTrainingAttendance,
    updateBudget, updateBudgetCategory, addBudgetTransaction,
    updateQuickStats,
    exportAllData, importData, resetAllData, clearActivityLog,
  } = useApp()

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDept, setSelectedDept] = useState('all')
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', category: 'general', pinned: false })
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [deviceForm, setDeviceForm] = useState({ type: 'laptop-windows', name: '', total: 0, available: 0 })
  const [showDeviceForm, setShowDeviceForm] = useState(false)
  const [loanForm, setLoanForm] = useState({ studentName: '', studentEmail: '', deviceType: '', dueDate: '' })
  const [showLoanForm, setShowLoanForm] = useState(false)
  const [trainingForm, setTrainingForm] = useState({ type: 'mentalHealthFirstAid', title: '', date: '', location: '', capacity: 0 })
  const [showTrainingForm, setShowTrainingForm] = useState(false)
  const [transactionForm, setTransactionForm] = useState({ type: 'expense', amount: 0, description: '', category: '' })
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [notification, setNotification] = useState(null)

  // Redirect if not admin
  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push('/admin/login')
    }
  }, [isLoaded, isAdmin, router])

  if (!isLoaded || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    )
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Calculate stats
  const overallProgress = getOverallProgress(policies)
  const statusCounts = getStatusCounts(policies)
  const filteredPolicies = selectedDept === 'all' ? policies : policies.filter(p => p.department === selectedDept)

  // Handlers
  const handlePolicyUpdate = (policyId, field, value) => {
    updatePolicy(policyId, { [field]: value })
    showNotification('Policy updated successfully')
  }

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault()
    addAnnouncement(announcementForm)
    setAnnouncementForm({ title: '', content: '', category: 'general', pinned: false })
    setShowAnnouncementForm(false)
    showNotification('Announcement published successfully')
  }

  const handleDeviceSubmit = (e) => {
    e.preventDefault()
    addTechDevice({ ...deviceForm, onLoan: 0 })
    setDeviceForm({ type: 'laptop-windows', name: '', total: 0, available: 0 })
    setShowDeviceForm(false)
    showNotification('Device added successfully')
  }

  const handleLoanSubmit = (e) => {
    e.preventDefault()
    addTechLoan(loanForm)
    setLoanForm({ studentName: '', studentEmail: '', deviceType: '', dueDate: '' })
    setShowLoanForm(false)
    showNotification('Loan recorded successfully')
  }

  const handleTrainingSubmit = (e) => {
    e.preventDefault()
    addTrainingSession(trainingForm.type, trainingForm)
    setTrainingForm({ type: 'mentalHealthFirstAid', title: '', date: '', location: '', capacity: 0 })
    setShowTrainingForm(false)
    showNotification('Training session added successfully')
  }

  const handleTransactionSubmit = (e) => {
    e.preventDefault()
    addBudgetTransaction(transactionForm)
    setTransactionForm({ type: 'expense', amount: 0, description: '', category: '' })
    setShowTransactionForm(false)
    showNotification('Transaction recorded successfully')
  }

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projectbold-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showNotification('Data exported successfully')
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          const result = importData(data)
          if (result.success) {
            showNotification('Data imported successfully')
          } else {
            showNotification('Import failed: ' + result.error, 'error')
          }
        } catch (err) {
          showNotification('Invalid JSON file', 'error')
        }
      }
      reader.readAsText(file)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'policies', label: 'Policies', icon: '📋' },
    { id: 'operations', label: 'Operations', icon: '⚙️' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'feedback', label: 'Feedback', icon: '💬' },
    { id: 'activity', label: 'Activity Log', icon: '📝' },
    { id: 'settings', label: 'Settings', icon: '🔧' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Admin Dashboard | Project Bold</title>
      </Head>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white font-medium`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-[#13294B] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-[#4B9CD3] hover:text-white">
                ← Back to Site
              </Link>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="text-sm text-gray-300">
              Project Bold Policy Platform
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap rounded-t transition ${
                  activeTab === tab.id
                    ? 'bg-[#13294B] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#13294B]">Dashboard Overview</h2>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
                <p className="text-3xl font-bold text-blue-600">{overallProgress}%</p>
                <p className="text-sm text-gray-600">Overall Progress</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
                <p className="text-3xl font-bold text-green-600">{statusCounts.completed}</p>
                <p className="text-sm text-gray-600">Completed Policies</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
                <p className="text-3xl font-bold text-yellow-600">{statusCounts.in_progress}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
                <p className="text-3xl font-bold text-purple-600">{feedback.filter(f => f.status === 'new').length}</p>
                <p className="text-sm text-gray-600">New Feedback</p>
              </div>
            </div>

            {/* Editable Quick Stats */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-[#13294B] mb-4">Platform Metrics (Editable)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Students Reached</label>
                  <input
                    type="number"
                    value={quickStats.totalStudentsReached}
                    onChange={(e) => updateQuickStats({ totalStudentsReached: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Active Initiatives</label>
                  <input
                    type="number"
                    value={quickStats.activeInitiatives}
                    onChange={(e) => updateQuickStats({ activeInitiatives: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Events This Month</label>
                  <input
                    type="number"
                    value={quickStats.eventsThisMonth}
                    onChange={(e) => updateQuickStats({ eventsThisMonth: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Feedback Received</label>
                  <input
                    type="number"
                    value={quickStats.feedbackReceived}
                    onChange={(e) => updateQuickStats({ feedbackReceived: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-[#13294B] mb-4">Recent Activity</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activityLog.slice(0, 10).map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-gray-100">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[entry.category] || 'bg-gray-100'}`}>
                      {entry.category}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{entry.details}</p>
                      <p className="text-xs text-gray-400">{formatShortDate(entry.timestamp)}</p>
                    </div>
                  </div>
                ))}
                {activityLog.length === 0 && (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </div>
            </div>

            {/* Department Progress */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-[#13294B] mb-4">Progress by Department</h3>
              <div className="space-y-4">
                {departments.map(dept => {
                  const deptPolicies = policies.filter(p => p.department === dept.id)
                  const deptProgress = getOverallProgress(deptPolicies)
                  return (
                    <div key={dept.id} className="flex items-center gap-4">
                      <span className="text-2xl w-8">{dept.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-sm">{dept.name}</span>
                          <span className="text-sm text-gray-500">{deptProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${deptProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ANNOUNCEMENTS TAB ==================== */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#13294B]">SBP Announcements</h2>
              <button
                onClick={() => setShowAnnouncementForm(true)}
                className="bg-[#13294B] text-white px-4 py-2 rounded hover:bg-[#0a1628] font-medium"
              >
                + New Announcement
              </button>
            </div>

            <p className="text-gray-600">
              Post updates directly to students. Announcements appear on the homepage and can be pinned for visibility.
            </p>

            {/* Announcement Form Modal */}
            {showAnnouncementForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-lg w-full p-6">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Create Announcement</h3>
                  <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={announcementForm.category}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="general">General Update</option>
                        <option value="policy">Policy Update</option>
                        <option value="event">Event</option>
                        <option value="urgent">Urgent</option>
                        <option value="milestone">Milestone</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                      <textarea
                        value={announcementForm.content}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="pinned"
                        checked={announcementForm.pinned}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, pinned: e.target.checked })}
                      />
                      <label htmlFor="pinned" className="text-sm">Pin to top of announcements</label>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="bg-[#13294B] text-white px-4 py-2 rounded hover:bg-[#0a1628]">
                        Publish
                      </button>
                      <button type="button" onClick={() => setShowAnnouncementForm(false)} className="border px-4 py-2 rounded hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Announcements List */}
            <div className="space-y-4">
              {[...announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(announcement => (
                <div key={announcement.id} className={`bg-white rounded-lg p-6 shadow-sm ${announcement.pinned ? 'border-l-4 border-yellow-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.pinned && <span className="text-yellow-500">📌</span>}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          announcement.category === 'urgent' ? 'bg-red-100 text-red-800' :
                          announcement.category === 'policy' ? 'bg-blue-100 text-blue-800' :
                          announcement.category === 'event' ? 'bg-purple-100 text-purple-800' :
                          announcement.category === 'milestone' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {announcement.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#13294B] text-lg">{announcement.title}</h3>
                      <p className="text-gray-600 mt-1">{announcement.content}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(announcement.createdAt)}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => pinAnnouncement(announcement.id, !announcement.pinned)}
                        className="text-gray-400 hover:text-yellow-500 p-1"
                        title={announcement.pinned ? 'Unpin' : 'Pin'}
                      >
                        📌
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(announcement.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="bg-white rounded-lg p-8 shadow-sm text-center">
                  <p className="text-gray-500">No announcements yet. Create one to communicate directly with students.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== POLICIES TAB ==================== */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-[#13294B]">Policy Management</h2>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.icon} {dept.name}</option>
                ))}
              </select>
            </div>

            <p className="text-gray-600">
              Update policy status, progress, and metrics. Changes are saved automatically and logged.
            </p>

            {/* Policies List */}
            <div className="space-y-4">
              {filteredPolicies.map(policy => (
                <div key={policy.id} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span>{departments.find(d => d.id === policy.department)?.icon}</span>
                        <h3 className="font-bold text-[#13294B]">{policy.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{policy.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      policy.priority === 'high' ? 'bg-red-100 text-red-800' :
                      policy.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {policy.priority} priority
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={policy.status}
                        onChange={(e) => handlePolicyUpdate(policy.id, 'status', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="planned">Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Progress: {policy.progress}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={policy.progress}
                        onChange={(e) => handlePolicyUpdate(policy.id, 'progress', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={policy.priority}
                        onChange={(e) => handlePolicyUpdate(policy.id, 'priority', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-gray-200 rounded-full mb-4">
                    <div
                      className={`h-full rounded-full ${
                        policy.status === 'completed' ? 'bg-green-500' :
                        policy.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${policy.progress}%` }}
                    />
                  </div>

                  {/* Metrics */}
                  {policy.metrics && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Metrics</label>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(policy.metrics).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => updatePolicyMetrics(policy.id, { [key]: parseInt(e.target.value) || 0 })}
                              className="w-full border rounded px-2 py-1 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {policy.lastUpdated && (
                    <p className="text-xs text-gray-400 mt-3">Last updated: {formatShortDate(policy.lastUpdated)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== OPERATIONS TAB ==================== */}
        {activeTab === 'operations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#13294B]">Operations Management</h2>

            {/* Tech Loaner Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#13294B] text-lg">Tech Loaner Program</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeviceForm(true)}
                    className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600"
                  >
                    + Add Device
                  </button>
                  <button
                    onClick={() => setShowLoanForm(true)}
                    className="bg-green-500 text-white px-3 py-1.5 rounded text-sm hover:bg-green-600"
                  >
                    + Record Loan
                  </button>
                </div>
              </div>

              {/* Device Inventory */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Device</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-center">Total</th>
                      <th className="px-4 py-2 text-center">Available</th>
                      <th className="px-4 py-2 text-center">On Loan</th>
                      <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {operationalData.techLoaners.devices.map(device => (
                      <tr key={device.id}>
                        <td className="px-4 py-3 font-medium">{device.name}</td>
                        <td className="px-4 py-3 text-gray-500">{device.type}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            value={device.total}
                            onChange={(e) => updateTechDevice(device.id, { total: parseInt(e.target.value) || 0 })}
                            className="w-16 border rounded px-2 py-1 text-center"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            value={device.available}
                            onChange={(e) => updateTechDevice(device.id, { available: parseInt(e.target.value) || 0 })}
                            className="w-16 border rounded px-2 py-1 text-center"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            value={device.onLoan}
                            onChange={(e) => updateTechDevice(device.id, { onLoan: parseInt(e.target.value) || 0 })}
                            className="w-16 border rounded px-2 py-1 text-center"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => deleteTechDevice(device.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Active Loans */}
              {operationalData.techLoaners.loans.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-2">Active Loans</h4>
                  <div className="space-y-2">
                    {operationalData.techLoaners.loans.filter(l => l.status === 'active').map(loan => (
                      <div key={loan.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div>
                          <p className="font-medium">{loan.studentName}</p>
                          <p className="text-sm text-gray-500">{loan.deviceType} | Due: {loan.dueDate}</p>
                        </div>
                        <button
                          onClick={() => updateTechLoan(loan.id, { status: 'returned', returnedAt: new Date().toISOString() })}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Mark Returned
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Food Pantry Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-[#13294B] text-lg mb-4">Food Pantry (Carolina Cupboard)</h3>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-orange-50 rounded p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{operationalData.foodPantry.totalVisits}</p>
                  <p className="text-sm text-gray-600">Total Visits</p>
                </div>
                <div className="bg-green-50 rounded p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">${operationalData.foodPantry.donations}</p>
                  <p className="text-sm text-gray-600">Donations</p>
                </div>
                <div className="bg-blue-50 rounded p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{operationalData.foodPantry.locations.length}</p>
                  <p className="text-sm text-gray-600">Locations</p>
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-4">
                {operationalData.foodPantry.locations.map(location => (
                  <div key={location.id} className="border rounded p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{location.name}</h4>
                        <p className="text-sm text-gray-500">{location.address} | {location.hours}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => logPantryVisit(location.id, 1)}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          +1 Visit
                        </button>
                        <button
                          onClick={() => logPantryVisit(location.id, 10)}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          +10 Visits
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="text-xs text-gray-500">Visits</label>
                        <input
                          type="number"
                          value={location.visits || 0}
                          onChange={(e) => updatePantryLocation(location.id, { visits: parseInt(e.target.value) || 0 })}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Inventory Status</label>
                        <select
                          value={location.inventory || 'unknown'}
                          onChange={(e) => updatePantryLocation(location.id, { inventory: e.target.value })}
                          className="w-full border rounded px-2 py-1"
                        >
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

              {/* Log Donation */}
              <div className="mt-4 p-4 bg-green-50 rounded">
                <h4 className="font-medium text-green-800 mb-2">Log Donation</h4>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Amount ($)"
                    className="flex-1 border rounded px-3 py-2"
                    id="donationAmount"
                  />
                  <input
                    type="text"
                    placeholder="Donor name (optional)"
                    className="flex-1 border rounded px-3 py-2"
                    id="donorName"
                  />
                  <button
                    onClick={() => {
                      const amount = parseFloat(document.getElementById('donationAmount').value) || 0
                      const donor = document.getElementById('donorName').value || 'Anonymous'
                      if (amount > 0) {
                        logPantryDonation(amount, donor)
                        document.getElementById('donationAmount').value = ''
                        document.getElementById('donorName').value = ''
                        showNotification('Donation logged')
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Log
                  </button>
                </div>
              </div>
            </div>

            {/* Training Programs */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#13294B] text-lg">Training Programs</h3>
                <button
                  onClick={() => setShowTrainingForm(true)}
                  className="bg-indigo-500 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-600"
                >
                  + Add Session
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded p-4">
                  <h4 className="font-medium mb-2">Mental Health First Aid</h4>
                  <p className="text-2xl font-bold text-indigo-600">{operationalData.trainings.mentalHealthFirstAid.totalTrained}</p>
                  <p className="text-sm text-gray-500">Total Trained</p>
                  <p className="text-sm text-gray-400 mt-2">{operationalData.trainings.mentalHealthFirstAid.sessions.length} sessions</p>
                </div>
                <div className="border rounded p-4">
                  <h4 className="font-medium mb-2">Bias Response Training</h4>
                  <p className="text-2xl font-bold text-pink-600">{operationalData.trainings.biasResponse.totalTrained}</p>
                  <p className="text-sm text-gray-500">Total Trained</p>
                  <p className="text-sm text-gray-400 mt-2">{operationalData.trainings.biasResponse.sessions.length} sessions</p>
                </div>
              </div>
            </div>

            {/* Modals */}
            {showDeviceForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Add Device</h3>
                  <form onSubmit={handleDeviceSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                      <select
                        value={deviceForm.type}
                        onChange={(e) => setDeviceForm({ ...deviceForm, type: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="laptop-windows">Windows Laptop</option>
                        <option value="laptop-mac">MacBook</option>
                        <option value="chromebook">Chromebook</option>
                        <option value="tablet">Tablet</option>
                        <option value="hotspot">Wi-Fi Hotspot</option>
                        <option value="charger">Charger</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                      <input
                        type="text"
                        value={deviceForm.name}
                        onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity</label>
                        <input
                          type="number"
                          value={deviceForm.total}
                          onChange={(e) => setDeviceForm({ ...deviceForm, total: parseInt(e.target.value) || 0 })}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available</label>
                        <input
                          type="number"
                          value={deviceForm.available}
                          onChange={(e) => setDeviceForm({ ...deviceForm, available: parseInt(e.target.value) || 0 })}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="bg-[#13294B] text-white px-4 py-2 rounded hover:bg-[#0a1628]">Add Device</button>
                      <button type="button" onClick={() => setShowDeviceForm(false)} className="border px-4 py-2 rounded hover:bg-gray-50">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showLoanForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Record Loan</h3>
                  <form onSubmit={handleLoanSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                      <input
                        type="text"
                        value={loanForm.studentName}
                        onChange={(e) => setLoanForm({ ...loanForm, studentName: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student Email</label>
                      <input
                        type="email"
                        value={loanForm.studentEmail}
                        onChange={(e) => setLoanForm({ ...loanForm, studentEmail: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                      <input
                        type="text"
                        value={loanForm.deviceType}
                        onChange={(e) => setLoanForm({ ...loanForm, deviceType: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={loanForm.dueDate}
                        onChange={(e) => setLoanForm({ ...loanForm, dueDate: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="bg-[#13294B] text-white px-4 py-2 rounded hover:bg-[#0a1628]">Record Loan</button>
                      <button type="button" onClick={() => setShowLoanForm(false)} className="border px-4 py-2 rounded hover:bg-gray-50">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showTrainingForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Add Training Session</h3>
                  <form onSubmit={handleTrainingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Training Type</label>
                      <select
                        value={trainingForm.type}
                        onChange={(e) => setTrainingForm({ ...trainingForm, type: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="mentalHealthFirstAid">Mental Health First Aid</option>
                        <option value="biasResponse">Bias Response</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
                      <input
                        type="text"
                        value={trainingForm.title}
                        onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={trainingForm.date}
                        onChange={(e) => setTrainingForm({ ...trainingForm, date: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={trainingForm.location}
                        onChange={(e) => setTrainingForm({ ...trainingForm, location: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <input
                        type="number"
                        value={trainingForm.capacity}
                        onChange={(e) => setTrainingForm({ ...trainingForm, capacity: parseInt(e.target.value) || 0 })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="bg-[#13294B] text-white px-4 py-2 rounded hover:bg-[#0a1628]">Add Session</button>
                      <button type="button" onClick={() => setShowTrainingForm(false)} className="border px-4 py-2 rounded hover:bg-gray-50">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== BUDGET TAB ==================== */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#13294B]">Budget Management</h2>
              <button
                onClick={() => setShowTransactionForm(true)}
                className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600"
              >
                + Add Transaction
              </button>
            </div>

            {/* Budget Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <label className="block text-sm text-gray-600 mb-1">Total Budget</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl">$</span>
                  <input
                    type="number"
                    value={budgetData.total}
                    onChange={(e) => updateBudget({ total: parseFloat(e.target.value) || 0 })}
                    className="text-3xl font-bold text-emerald-600 w-full bg-transparent"
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <label className="block text-sm text-gray-600 mb-1">Allocated</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl">$</span>
                  <input
                    type="number"
                    value={budgetData.allocated}
                    onChange={(e) => updateBudget({ allocated: parseFloat(e.target.value) || 0 })}
                    className="text-3xl font-bold text-blue-600 w-full bg-transparent"
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <label className="block text-sm text-gray-600 mb-1">Spent</label>
                <p className="text-3xl font-bold text-orange-600">${budgetData.spent.toLocaleString()}</p>
              </div>
            </div>

            {/* Budget Categories */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-[#13294B] mb-4">Budget Categories</h3>
              <div className="space-y-4">
                {budgetData.categories.map(category => (
                  <div key={category.name} className="border rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{category.name}</h4>
                      <span className="text-sm text-gray-500">
                        ${category.spent.toLocaleString()} / ${category.allocated.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full mb-3">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Allocated</label>
                        <input
                          type="number"
                          value={category.allocated}
                          onChange={(e) => updateBudgetCategory(category.name, { allocated: parseFloat(e.target.value) || 0 })}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Spent</label>
                        <input
                          type="number"
                          value={category.spent}
                          onChange={(e) => updateBudgetCategory(category.name, { spent: parseFloat(e.target.value) || 0 })}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            {budgetData.transactions && budgetData.transactions.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-[#13294B] mb-4">Recent Transactions</h3>
                <div className="space-y-2">
                  {budgetData.transactions.slice(-10).reverse().map(tx => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-gray-500">{formatShortDate(tx.date)} | {tx.category}</p>
                      </div>
                      <span className={`font-bold ${tx.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.type === 'expense' ? '-' : '+'}${tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction Form Modal */}
            {showTransactionForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Add Transaction</h3>
                  <form onSubmit={handleTransactionSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={transactionForm.type}
                        onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <input
                        type="number"
                        value={transactionForm.amount}
                        onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) || 0 })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={transactionForm.category}
                        onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="">Select category...</option>
                        {budgetData.categories.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="bg-[#13294B] text-white px-4 py-2 rounded hover:bg-[#0a1628]">Add</button>
                      <button type="button" onClick={() => setShowTransactionForm(false)} className="border px-4 py-2 rounded hover:bg-gray-50">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== FEEDBACK TAB ==================== */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#13294B]">Student Feedback</h2>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-blue-600">{feedback.length}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-yellow-600">{feedback.filter(f => f.status === 'new').length}</p>
                <p className="text-sm text-gray-600">New</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-purple-600">{feedback.filter(f => f.status === 'reviewed').length}</p>
                <p className="text-sm text-gray-600">Reviewed</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-green-600">{feedback.filter(f => f.status === 'resolved').length}</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>

            <div className="space-y-4">
              {feedback.map(item => (
                <div key={item.id} className={`bg-white rounded-lg p-6 shadow-sm border-l-4 ${
                  item.status === 'new' ? 'border-yellow-500' :
                  item.status === 'reviewed' ? 'border-purple-500' :
                  item.status === 'resolved' ? 'border-green-500' :
                  'border-gray-300'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'reviewed' ? 'bg-purple-100 text-purple-800' :
                        item.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">{item.category}</span>
                    </div>
                    <p className="text-xs text-gray-400">{formatShortDate(item.submittedAt)}</p>
                  </div>
                  <p className="text-gray-800 mb-3">{item.message}</p>
                  {item.email && <p className="text-sm text-gray-500 mb-3">From: {item.email}</p>}
                  {item.adminNote && (
                    <div className="bg-gray-50 rounded p-2 mb-3">
                      <p className="text-sm text-gray-600"><strong>Admin Note:</strong> {item.adminNote}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <select
                      value={item.status}
                      onChange={(e) => updateFeedbackStatus(item.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Add note..."
                      className="flex-1 border rounded px-2 py-1 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          updateFeedbackStatus(item.id, item.status, e.target.value)
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
              {feedback.length === 0 && (
                <div className="bg-white rounded-lg p-8 shadow-sm text-center">
                  <p className="text-gray-500">No feedback received yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== ACTIVITY LOG TAB ==================== */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#13294B]">Activity Log</h2>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear the activity log?')) {
                    clearActivityLog()
                    showNotification('Activity log cleared')
                  }
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Clear Log
              </button>
            </div>

            <p className="text-gray-600">
              Complete audit trail of all admin actions. Logs are automatically generated and stored locally.
            </p>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left">Timestamp</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Action</th>
                      <th className="px-4 py-3 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activityLog.map(entry => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatShortDate(entry.timestamp)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[entry.category] || 'bg-gray-100'}`}>
                            {entry.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{entry.action}</td>
                        <td className="px-4 py-3 text-gray-700">{entry.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {activityLog.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No activity logged yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SETTINGS TAB ==================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#13294B]">Settings & Data Management</h2>

            {/* Export/Import */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-[#13294B] mb-4">Data Backup & Restore</h3>
              <p className="text-gray-600 mb-4">Export all platform data as JSON for backup, or import a previous backup.</p>
              <div className="flex gap-4">
                <button
                  onClick={handleExport}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Export All Data
                </button>
                <label className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer">
                  Import Data
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </div>

            {/* Storage Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-[#13294B] mb-4">Storage Information</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-600">Policies</p>
                  <p className="font-medium">{policies.length} items</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-600">Announcements</p>
                  <p className="font-medium">{announcements.length} items</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-600">Feedback</p>
                  <p className="font-medium">{feedback.length} items</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-gray-600">Activity Log</p>
                  <p className="font-medium">{activityLog.length} entries</p>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <h3 className="font-bold text-red-800 mb-4">Danger Zone</h3>
              <p className="text-red-700 mb-4">These actions cannot be undone. Make sure to export your data first.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset ALL data? This cannot be undone.')) {
                      if (confirm('This will delete all policies, announcements, feedback, and operational data. Continue?')) {
                        resetAllData()
                        showNotification('All data has been reset')
                      }
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Reset All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
