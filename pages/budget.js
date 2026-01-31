import { useState, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../lib/store'
import { sampleBudgetLineItems, sampleFundingRequests } from '../lib/data'
import {
  BUDGET_CATEGORIES,
  exportLineItemsToCSV,
  exportFundingRequestsToCSV,
} from '../lib/budgetEngine'

// ==========================================
// MAIN BUDGET PAGE
// Central hub for all budget functionality
// ==========================================

export default function BudgetPage() {
  const {
    budgetLineItems,
    fundingRequests,
    submitFundingRequest,
  } = useApp()

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Funding request form state
  const [form, setForm] = useState({
    orgName: '',
    category: 'events',
    amount: '',
    description: '',
    justification: '',
    studentsImpacted: '',
    contactEmail: '',
  })
  const [submissionResult, setSubmissionResult] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use sample data if no real data exists
  const displayLineItems = budgetLineItems?.length > 0 ? budgetLineItems : sampleBudgetLineItems
  const displayFundingRequests = fundingRequests?.length > 0 ? fundingRequests : sampleFundingRequests

  // Calculate statistics
  const stats = useMemo(() => {
    const categoryStats = {}

    for (const cat of BUDGET_CATEGORIES) {
      categoryStats[cat.id] = {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        allocated: 0,
        spent: 0,
        pending: 0,
        count: 0,
      }
    }

    for (const item of displayLineItems) {
      if (categoryStats[item.category]) {
        categoryStats[item.category].allocated += item.approved || 0
        categoryStats[item.category].spent += item.spent || 0
        categoryStats[item.category].count++
      }
    }

    const pendingRequests = displayFundingRequests.filter(r => r.status === 'pending')
    for (const req of pendingRequests) {
      if (categoryStats[req.category]) {
        categoryStats[req.category].pending += req.amount || 0
      }
    }

    const totalAllocated = Object.values(categoryStats).reduce((sum, c) => sum + c.allocated, 0)
    const totalSpent = Object.values(categoryStats).reduce((sum, c) => sum + c.spent, 0)
    const totalPending = Object.values(categoryStats).reduce((sum, c) => sum + c.pending, 0)

    return {
      categories: Object.values(categoryStats),
      categoryStats,
      totalAllocated,
      totalSpent,
      totalPending,
      totalRemaining: totalAllocated - totalSpent,
      utilizationRate: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
      lineItemCount: displayLineItems.length,
      pendingCount: pendingRequests.length,
    }
  }, [displayLineItems, displayFundingRequests])

  // Filter line items
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return displayLineItems
    return displayLineItems.filter(item => item.category === selectedCategory)
  }, [displayLineItems, selectedCategory])

  // Export handlers
  const handleExportLineItems = () => {
    const csv = exportLineItemsToCSV(displayLineItems)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sg-budget-lineitems-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const handleExportRequests = () => {
    const csv = exportFundingRequestsToCSV(displayFundingRequests)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sg-funding-requests-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Handle funding request submission
  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    if (!form.orgName || !form.amount || !form.description || !form.justification) {
      setError('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }

    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount')
      setIsSubmitting(false)
      return
    }

    const result = submitFundingRequest({
      orgName: form.orgName,
      category: form.category,
      amount: amount,
      description: form.description,
      justification: form.justification,
      studentsImpacted: parseInt(form.studentsImpacted) || 0,
      contactEmail: form.contactEmail,
    })

    setIsSubmitting(false)

    if (result.success) {
      setSubmissionResult(result.request)
    } else {
      setError(result.error || 'Failed to submit request')
    }
  }

  const handleNewRequest = () => {
    setForm({
      orgName: '',
      category: 'events',
      amount: '',
      description: '',
      justification: '',
      studentsImpacted: '',
      contactEmail: '',
    })
    setSubmissionResult(null)
    setError('')
  }

  const selectedCategoryStats = stats.categoryStats[form.category] || {}
  const categoryAvailable = (selectedCategoryStats.allocated || 0) - (selectedCategoryStats.spent || 0)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'allocations', label: 'Allocations', count: stats.lineItemCount },
    { id: 'request', label: 'Request Funding' },
    { id: 'pending', label: 'Pending', count: stats.pendingCount },
  ]

  return (
    <>
      <Head>
        <title>Budget | Project Bold</title>
        <meta name="description" content="Student Government budget transparency, allocations, and funding requests." />
      </Head>

      <div className="min-h-screen bg-[#0a0e14]">
        {/* Navigation Header */}
        <header className="bg-[#0d1117] border-b border-[#30363d] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="text-[#8b949e] hover:text-[#00d4ff] transition-colors text-sm">
                  &larr; Home
                </Link>
                <div className="h-6 w-px bg-[#30363d]" />
                <h1 className="text-xl font-bold text-[#f0f6fc]">Budget</h1>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/admin"
                  className="text-sm text-[#8b949e] hover:text-[#00d4ff] transition-colors"
                >
                  Admin Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-[#0d1117] border-b border-[#30363d]">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-[#00d4ff] border-[#00d4ff]'
                      : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc] hover:border-[#30363d]'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      activeTab === tab.id ? 'bg-[#00d4ff]/20' : 'bg-[#30363d]'
                    }`}>{tab.count}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Demo Banner */}
          <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg p-4 mb-8">
            <p className="text-[#00d4ff] text-sm">
              <strong>DEMO MODE:</strong> Sample budget data shown. Submit funding requests to see them tracked in real-time.
            </p>
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-2">Total Allocated</p>
                  <p className="text-3xl font-mono font-bold text-[#3fb950]">${stats.totalAllocated.toLocaleString()}</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-2">Total Spent</p>
                  <p className="text-3xl font-mono font-bold text-[#d29922]">${stats.totalSpent.toLocaleString()}</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-2">Remaining</p>
                  <p className="text-3xl font-mono font-bold text-[#00d4ff]">${stats.totalRemaining.toLocaleString()}</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-2">Utilization</p>
                  <p className="text-3xl font-mono font-bold text-[#a371f7]">{stats.utilizationRate.toFixed(1)}%</p>
                </div>
                <div className="bg-[#161b22] border border-[#d29922]/30 rounded-xl p-6">
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-2">Pending</p>
                  <p className="text-3xl font-mono font-bold text-[#d29922]">{stats.pendingCount}</p>
                  <p className="text-xs text-[#6e7681] mt-1">${stats.totalPending.toLocaleString()}</p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[#f0f6fc]">Spending by Category</h2>
                  <button
                    onClick={handleExportLineItems}
                    className="px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-lg text-xs text-[#8b949e] hover:text-[#f0f6fc] transition-all"
                  >
                    Export CSV
                  </button>
                </div>
                <div className="space-y-4">
                  {stats.categories.filter(c => c.allocated > 0).map(cat => {
                    const utilization = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0
                    return (
                      <div key={cat.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-[#f0f6fc] font-medium">{cat.name}</span>
                            <span className="text-xs text-[#6e7681]">({cat.count} items)</span>
                            {cat.pending > 0 && (
                              <span className="text-xs text-[#d29922]">+${cat.pending.toLocaleString()} pending</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-mono text-[#8b949e]">
                              ${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()}
                            </span>
                            <span className={`text-sm font-mono w-12 text-right ${
                              utilization > 80 ? 'text-[#f85149]' : utilization > 50 ? 'text-[#d29922]' : 'text-[#3fb950]'
                            }`}>
                              {utilization.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(utilization, 100)}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* How We Allocate */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#f0f6fc] mb-4">How We Allocate Funds</h2>
                <div className="grid md:grid-cols-5 gap-4">
                  {[
                    { label: 'Urgency', points: '0-25', desc: 'Emergency and safety priority' },
                    { label: 'SG Alignment', points: '0-20', desc: 'Wellness, basic needs focus' },
                    { label: 'Availability', points: '0-20', desc: 'Within category budget' },
                    { label: 'Impact', points: '0-15', desc: 'Students reached' },
                    { label: 'Duplicates', points: '-30 to 0', desc: 'Similar request check' },
                  ].map(item => (
                    <div key={item.label} className="bg-[#0d1117] rounded-lg p-4">
                      <p className="text-[#f0f6fc] font-medium">{item.label}</p>
                      <p className="text-lg font-mono text-[#00d4ff]">{item.points}</p>
                      <p className="text-xs text-[#6e7681] mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('request')}
                  className="px-6 py-3 bg-[#00d4ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#00d4ff]/90 transition-all"
                >
                  Request Funding
                </button>
                <button
                  onClick={() => setActiveTab('allocations')}
                  className="px-6 py-3 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] font-semibold rounded-lg hover:bg-[#30363d] transition-all"
                >
                  View All Allocations
                </button>
              </div>
            </div>
          )}

          {/* ALLOCATIONS TAB */}
          {activeTab === 'allocations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#f0f6fc]">Budget Allocations</h2>
                <button
                  onClick={handleExportLineItems}
                  className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-[#8b949e] hover:text-[#f0f6fc] transition-all"
                >
                  Export CSV
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30'
                      : 'text-[#8b949e] hover:text-[#f0f6fc] bg-[#21262d] border border-[#30363d]'
                  }`}
                >
                  All ({displayLineItems.length})
                </button>
                {BUDGET_CATEGORIES.map(cat => {
                  const count = displayLineItems.filter(i => i.category === cat.id).length
                  if (count === 0) return null
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                        selectedCategory === cat.id
                          ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30'
                          : 'text-[#8b949e] hover:text-[#f0f6fc] bg-[#21262d] border border-[#30363d]'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name} ({count})
                    </button>
                  )
                })}
              </div>

              {/* Allocations List */}
              <div className="space-y-4">
                {filteredItems.map(item => {
                  const category = BUDGET_CATEGORIES.find(c => c.id === item.category)
                  const utilization = item.approved > 0 ? (item.spent / item.approved) * 100 : 0
                  return (
                    <div key={item.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[#8b949e]/30 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: category?.color || '#6e7681' }} />
                          <div>
                            <h3 className="font-semibold text-[#f0f6fc]">{item.orgName}</h3>
                            <p className="text-sm text-[#8b949e]">{item.description}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-[#6e7681] uppercase tracking-widest">{category?.name}</span>
                              <span className="text-[10px] text-[#6e7681]">{item.semester}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'spent' ? 'bg-[#3fb950]/20 text-[#3fb950]' :
                          item.status === 'approved' ? 'bg-[#00d4ff]/20 text-[#00d4ff]' :
                          'bg-[#d29922]/20 text-[#d29922]'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-[10px] text-[#6e7681] uppercase">Requested</p>
                          <p className="font-mono text-[#8b949e]">${item.requested?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#6e7681] uppercase">Approved</p>
                          <p className="font-mono text-[#3fb950]">${item.approved?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#6e7681] uppercase">Spent</p>
                          <p className="font-mono text-[#d29922]">${item.spent?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#6e7681] uppercase">Remaining</p>
                          <p className="font-mono text-[#00d4ff]">${((item.approved || 0) - (item.spent || 0)).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(utilization, 100)}%`,
                            backgroundColor: utilization > 90 ? '#f85149' : utilization > 70 ? '#d29922' : '#3fb950',
                          }}
                        />
                      </div>

                      {item.impactNotes && (
                        <p className="text-sm text-[#6e7681] italic mt-3">{item.impactNotes}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* REQUEST FUNDING TAB */}
          {activeTab === 'request' && (
            <div className="max-w-4xl">
              {!submissionResult ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[#f0f6fc]">Request Funding</h2>
                    <p className="text-[#8b949e] mt-1">Submit a funding request for your organization. Your request will be scored by our AI system and queued for Finance Committee review.</p>
                  </div>

                  <form onSubmit={handleSubmitRequest}>
                    <div className="grid lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-4">
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                                Organization Name *
                              </label>
                              <input
                                type="text"
                                value={form.orgName}
                                onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                                placeholder="e.g., Carolina Gaming Club"
                                required
                                className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                                Amount Requested *
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7681]">$</span>
                                <input
                                  type="number"
                                  value={form.amount}
                                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                  placeholder="0.00"
                                  min="1"
                                  step="0.01"
                                  required
                                  className="w-full pl-7 pr-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] text-sm font-mono"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                                Category *
                              </label>
                              <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff] text-sm"
                              >
                                {BUDGET_CATEGORIES.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                                Students Impacted
                              </label>
                              <input
                                type="number"
                                value={form.studentsImpacted}
                                onChange={(e) => setForm({ ...form, studentsImpacted: e.target.value })}
                                placeholder="e.g., 200"
                                min="0"
                                className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] text-sm font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                              Brief Description *
                            </label>
                            <input
                              type="text"
                              value={form.description}
                              onChange={(e) => setForm({ ...form, description: e.target.value })}
                              placeholder="e.g., Spring Gaming Tournament prizes and equipment"
                              required
                              className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                              Justification & Impact *
                            </label>
                            <textarea
                              value={form.justification}
                              onChange={(e) => setForm({ ...form, justification: e.target.value })}
                              placeholder="Explain why this funding is needed and how it will benefit students..."
                              rows={4}
                              required
                              className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] text-sm resize-none"
                            />
                            <p className="text-[10px] text-[#6e7681] mt-1">
                              Tip: Mention urgency, student impact, and alignment with SG priorities for a higher score
                            </p>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                              Contact Email
                            </label>
                            <input
                              type="email"
                              value={form.contactEmail}
                              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                              placeholder="you@email.unc.edu"
                              className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] text-sm"
                            />
                          </div>
                        </div>

                        {error && (
                          <div className="bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg p-4">
                            <p className="text-[#f85149] text-sm">{error}</p>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full px-6 py-3 bg-[#00d4ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#00d4ff]/90 transition-all disabled:opacity-50"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                      </div>

                      {/* Category Info Sidebar */}
                      <div className="space-y-4">
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 sticky top-28">
                          <h3 className="text-sm font-semibold text-[#f0f6fc] mb-4">Selected Category</h3>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BUDGET_CATEGORIES.find(c => c.id === form.category)?.color }} />
                            <span className="text-[#f0f6fc] font-medium">
                              {BUDGET_CATEGORIES.find(c => c.id === form.category)?.name}
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#6e7681]">Allocated</span>
                              <span className="font-mono text-[#3fb950]">${(selectedCategoryStats.allocated || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#6e7681]">Spent</span>
                              <span className="font-mono text-[#d29922]">${(selectedCategoryStats.spent || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#6e7681]">Pending</span>
                              <span className="font-mono text-[#a371f7]">${(selectedCategoryStats.pending || 0).toLocaleString()}</span>
                            </div>
                            <div className="border-t border-[#30363d] pt-3">
                              <div className="flex justify-between">
                                <span className="text-[#f0f6fc] font-medium">Available</span>
                                <span className="font-mono font-bold text-[#00d4ff]">${categoryAvailable.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-[#6e7681] mt-4 pt-4 border-t border-[#30363d]">
                            Rate limit: 10 requests per organization per week
                          </p>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-xl p-8 max-w-2xl">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#3fb950]/10 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-[#3fb950]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#f0f6fc]">Request Submitted</h2>
                      <p className="text-[#8b949e] mt-1">
                        Your request for <strong className="text-[#f0f6fc]">${submissionResult.amount?.toLocaleString()}</strong> has been queued for review.
                      </p>
                    </div>
                  </div>

                  {submissionResult.aiScore && (
                    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5 mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-[#6e7681]">AI Assessment Score</span>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-3xl font-mono font-bold"
                            style={{ color: submissionResult.aiScore.recommendation?.color || '#6e7681' }}
                          >
                            {submissionResult.aiScore.score}
                          </span>
                          <span className="text-[#6e7681]">/100</span>
                        </div>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded text-sm font-bold ${
                        submissionResult.aiScore.recommendation?.action === 'APPROVE'
                          ? 'bg-[#3fb950]/20 text-[#3fb950]'
                          : submissionResult.aiScore.recommendation?.action === 'DENY'
                          ? 'bg-[#f85149]/20 text-[#f85149]'
                          : 'bg-[#d29922]/20 text-[#d29922]'
                      }`}>
                        Recommendation: {submissionResult.aiScore.recommendation?.action || 'REVIEW'}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleNewRequest}
                      className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[#f0f6fc] hover:bg-[#30363d] transition-all text-sm font-medium"
                    >
                      Submit Another
                    </button>
                    <button
                      onClick={() => setActiveTab('pending')}
                      className="px-4 py-2 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-all text-sm font-medium"
                    >
                      View Pending Requests
                    </button>
                    <Link
                      href="/admin"
                      className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[#8b949e] hover:text-[#f0f6fc] transition-all text-sm font-medium"
                    >
                      Admin Dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PENDING REQUESTS TAB */}
          {activeTab === 'pending' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#f0f6fc]">Pending Requests</h2>
                  <p className="text-[#8b949e] text-sm mt-1">{stats.pendingCount} requests totaling ${stats.totalPending.toLocaleString()}</p>
                </div>
                <button
                  onClick={handleExportRequests}
                  className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-[#8b949e] hover:text-[#f0f6fc] transition-all"
                >
                  Export CSV
                </button>
              </div>

              <div className="space-y-4">
                {displayFundingRequests.filter(r => r.status === 'pending').map(request => {
                  const category = BUDGET_CATEGORIES.find(c => c.id === request.category)
                  return (
                    <div key={request.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-[#f0f6fc]">{request.orgName}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: `${category?.color}20`, color: category?.color }}>
                              {category?.name}
                            </span>
                          </div>
                          <p className="text-[#8b949e] text-sm">{request.description}</p>
                          <p className="text-[#6e7681] text-sm italic mt-2">{request.justification}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-mono font-bold text-[#f0f6fc]">${request.amount?.toLocaleString()}</p>
                          <p className="text-xs text-[#6e7681]">{request.studentsImpacted} students</p>
                        </div>
                      </div>

                      {request.aiScore && (
                        <div className="flex items-center gap-4 p-3 bg-[#0d1117] rounded-lg">
                          <span className="text-sm text-[#6e7681]">AI Score:</span>
                          <span className="text-lg font-mono font-bold" style={{ color: request.aiScore.recommendation?.color }}>
                            {request.aiScore.score}/100
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            request.aiScore.recommendation?.action === 'APPROVE'
                              ? 'bg-[#3fb950]/20 text-[#3fb950]'
                              : request.aiScore.recommendation?.action === 'DENY'
                              ? 'bg-[#f85149]/20 text-[#f85149]'
                              : 'bg-[#d29922]/20 text-[#d29922]'
                          }`}>
                            {request.aiScore.recommendation?.action}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}

                {stats.pendingCount === 0 && (
                  <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-12 text-center">
                    <p className="text-[#6e7681] mb-4">No pending requests</p>
                    <button
                      onClick={() => setActiveTab('request')}
                      className="px-4 py-2 bg-[#00d4ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#00d4ff]/90 transition-all text-sm"
                    >
                      Submit a Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#30363d] mt-12">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-[#6e7681]">
                Questions? Contact sg-finance@unc.edu
              </p>
              <div className="flex gap-6">
                <Link href="/" className="text-sm text-[#00d4ff] hover:underline">Home</Link>
                <Link href="/admin" className="text-sm text-[#00d4ff] hover:underline">Admin</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
