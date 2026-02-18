import { useState, useMemo, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../lib/store'
import {
  BUDGET_CATEGORIES,
} from '../lib/budgetEngine'

// ==========================================
// PUBLIC BUDGET TRANSPARENCY PAGE
// With Integrated Funding Request Form
// ==========================================

export default function BudgetTransparency() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const {
    budgetLineItems,
    fundingRequests,
    submitFundingRequest,
  } = useApp()

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('overview')
  const [showRequestForm, setShowRequestForm] = useState(false)

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

  const displayLineItems = budgetLineItems || []
  const displayFundingRequests = fundingRequests || []

  // Calculate statistics
  const stats = useMemo(() => {
    const categoryStats = {}

    // Initialize all categories
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

    // Sum up line items
    for (const item of displayLineItems) {
      if (categoryStats[item.category]) {
        categoryStats[item.category].allocated += item.approved || 0
        categoryStats[item.category].spent += item.spent || 0
        categoryStats[item.category].count++
      }
    }

    // Sum up pending requests
    const pendingRequests = displayFundingRequests.filter(r => r.status === 'pending')
    for (const req of pendingRequests) {
      if (categoryStats[req.category]) {
        categoryStats[req.category].pending += req.amount || 0
      }
    }

    const totalAllocated = Object.values(categoryStats).reduce((sum, c) => sum + c.allocated, 0)
    const totalSpent = Object.values(categoryStats).reduce((sum, c) => sum + c.spent, 0)
    const totalPending = Object.values(categoryStats).reduce((sum, c) => sum + c.pending, 0)
    const totalRemaining = totalAllocated - totalSpent

    return {
      categories: Object.values(categoryStats),
      categoryStats,
      totalAllocated,
      totalSpent,
      totalPending,
      totalRemaining,
      utilizationRate: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
      lineItemCount: displayLineItems.length,
      pendingCount: pendingRequests.length,
    }
  }, [displayLineItems, displayFundingRequests])

  // Filter line items by category
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return displayLineItems
    return displayLineItems.filter(item => item.category === selectedCategory)
  }, [displayLineItems, selectedCategory])

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
      setError(result.error || 'Failed to submit request. Please try again.')
    }
  }

  // Reset form for new request
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

  // Get selected category availability
  const selectedCategoryStats = stats.categoryStats[form.category] || {}
  const categoryAvailable = (selectedCategoryStats.allocated || 0) - (selectedCategoryStats.spent || 0)

  return (
    <>
      <Head>
        <title>Budget Transparency | Project Bold</title>
        <meta name="description" content="Transparent view of Student Government budget allocations, spending, and fund utilization. Request funding directly." />
      </Head>

      <div className="min-h-screen bg-[#0a0e14]">
        {/* Header */}
        <header className="bg-[#0d1117] border-b border-[#30363d] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-[#8b949e] hover:text-[#00d4ff] transition-colors text-sm">
                  &larr; Back to Home
                </Link>
                <div className="h-6 w-px bg-[#30363d]" />
                <h1 className="text-[#f0f6fc] text-lg font-bold">Budget Transparency</h1>
              </div>
              <button
                onClick={() => { setShowRequestForm(!showRequestForm); setSubmissionResult(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  showRequestForm
                    ? 'bg-[#21262d] text-[#8b949e] border border-[#30363d]'
                    : 'bg-[#00d4ff] text-[#0d1117] hover:bg-[#00d4ff]/90'
                }`}
              >
                {showRequestForm ? 'Hide Form' : 'Request Funding'}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Demo Banner */}
          <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg p-4 mb-8">
            <p className="text-[#00d4ff] text-sm">
              <strong>DEMO MODE:</strong> Sample budget data shown. Submit funding requests to see them appear in the admin dashboard.
            </p>
          </div>

          {/* Funding Request Form - Inline */}
          {showRequestForm && (
            <div className="mb-8">
              {!submissionResult ? (
                <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[#f0f6fc]">Submit Funding Request</h2>
                      <p className="text-sm text-[#8b949e] mt-1">Your request will be scored and queued for Finance Committee review</p>
                    </div>
                    <button
                      onClick={() => setShowRequestForm(false)}
                      className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center hover:border-[#8b949e] text-[#8b949e] hover:text-[#f0f6fc] transition-all"
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleSubmitRequest}>
                    <div className="grid lg:grid-cols-3 gap-6">
                      {/* Form Fields */}
                      <div className="lg:col-span-2 space-y-4">
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
                              className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm"
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
                                className="w-full pl-7 pr-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm font-mono"
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
                              className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm font-mono"
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
                            className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm"
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
                            rows={3}
                            required
                            className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm resize-none"
                          />
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
                            className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm"
                          />
                        </div>

                        {error && (
                          <div className="bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg p-3">
                            <p className="text-[#f85149] text-sm">{error}</p>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full px-6 py-3 bg-[#00d4ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#00d4ff]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                      </div>

                      {/* Category Budget Info */}
                      <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 h-fit">
                        <h3 className="text-sm font-semibold text-[#f0f6fc] mb-4">Selected Category Budget</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BUDGET_CATEGORIES.find(c => c.id === form.category)?.color || '#6e7681' }} />
                            <span className="text-[#f0f6fc] font-medium">
                              {BUDGET_CATEGORIES.find(c => c.id === form.category)?.name}
                            </span>
                          </div>
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
                          <div className="border-t border-[#30363d] pt-3 mt-3">
                            <div className="flex justify-between">
                              <span className="text-[#f0f6fc] font-medium">Available</span>
                              <span className="font-mono font-bold text-[#00d4ff]">${categoryAvailable.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#30363d]">
                          <p className="text-xs text-[#6e7681]">
                            Rate limit: 10 requests per org per week
                          </p>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                /* Success State */
                <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#3fb950]/10 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-[#3fb950]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-[#f0f6fc]">Request Submitted Successfully</h2>
                        <p className="text-[#8b949e] text-sm mt-1">
                          Your request for <strong className="text-[#f0f6fc]">${submissionResult.amount?.toLocaleString()}</strong> has been queued for review.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRequestForm(false)}
                      className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center hover:border-[#8b949e] text-[#8b949e] hover:text-[#f0f6fc] transition-all"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Context Check */}
                  {submissionResult.contextCheck && (
                    <div className="mt-4 p-4 bg-[#0d1117] border border-[#30363d] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#6e7681]">Context Check</span>
                        <span className={`px-3 py-1 rounded text-xs font-bold ${
                          submissionResult.contextCheck.flag === 'PASS'
                            ? 'bg-[#3fb950]/20 text-[#3fb950]'
                            : 'bg-[#d29922]/20 text-[#d29922]'
                        }`}>
                          {submissionResult.contextCheck.flag === 'PASS' ? 'Realistic' : 'Needs Review'}
                        </span>
                      </div>
                      {submissionResult.contextCheck.note && (
                        <p className="text-sm text-[#8b949e]">{submissionResult.contextCheck.note}</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleNewRequest}
                      className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[#f0f6fc] hover:bg-[#30363d] transition-all text-sm font-medium"
                    >
                      Submit Another
                    </button>
                    <Link
                      href="/admin"
                      className="px-4 py-2 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-all text-sm font-medium"
                    >
                      View in Admin Dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-2">Pending Requests</p>
              <p className="text-3xl font-mono font-bold text-[#d29922]">{stats.pendingCount}</p>
              <p className="text-xs text-[#6e7681] mt-1">${stats.totalPending.toLocaleString()} total</p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'overview', label: 'Category Overview' },
              { id: 'details', label: 'All Line Items' },
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setViewMode(view.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === view.id
                    ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30'
                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] border border-transparent'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          {/* Category Overview */}
          {viewMode === 'overview' && (
            <div className="space-y-6">
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#f0f6fc] mb-4">Spending by Category</h2>
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
                          <div className="text-right">
                            <span className="text-sm font-mono text-[#8b949e]">
                              ${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()}
                            </span>
                            <span className={`ml-3 text-sm font-mono ${
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

              {/* Methodology Section */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#f0f6fc] mb-4">How We Allocate Funds</h2>
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-[#8b949e] leading-relaxed">
                    Student Government allocates funding based on a transparent, rule-based scoring system that evaluates:
                  </p>
                  <ul className="text-[#8b949e] mt-3 space-y-2">
                    <li><strong className="text-[#f0f6fc]">Urgency (0-25 points):</strong> Emergency and safety-related requests receive priority</li>
                    <li><strong className="text-[#f0f6fc]">SG Priority Alignment (0-20 points):</strong> Initiatives aligned with wellness, basic needs, and academic support score higher</li>
                    <li><strong className="text-[#f0f6fc]">Budget Availability (0-20 points):</strong> Requests within available category budgets are preferred</li>
                    <li><strong className="text-[#f0f6fc]">Impact Assessment (0-15 points):</strong> Number of students reached and community benefit</li>
                    <li><strong className="text-[#f0f6fc]">Duplicate Check (-30 to 0 points):</strong> Similar recent requests are flagged to prevent redundancy</li>
                  </ul>
                  <p className="text-[#8b949e] mt-4">
                    All funding decisions are reviewed by the Finance Committee before final approval. Mid-semester, we analyze spending patterns
                    and suggest reallocations from underutilized categories to high-demand areas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Line Item Details */}
          {viewMode === 'details' && (
            <div className="space-y-4">
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
                  All Categories
                </button>
                {BUDGET_CATEGORIES.map(cat => (
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
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Line Items Table */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#30363d]">
                        <th className="text-left px-6 py-4 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Organization</th>
                        <th className="text-left px-6 py-4 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Category</th>
                        <th className="text-left px-6 py-4 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Description</th>
                        <th className="text-right px-6 py-4 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Approved</th>
                        <th className="text-right px-6 py-4 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Spent</th>
                        <th className="text-right px-6 py-4 text-[10px] text-[#6e7681] uppercase tracking-widest font-semibold">Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(item => {
                        const category = BUDGET_CATEGORIES.find(c => c.id === item.category)
                        const utilization = item.approved > 0 ? (item.spent / item.approved) * 100 : 0
                        return (
                          <tr key={item.id} className="border-b border-[#21262d] hover:bg-[#21262d]/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-[#f0f6fc] font-medium">{item.orgName}</p>
                              <p className="text-xs text-[#6e7681]">{item.semester}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category?.color || '#6e7681' }} />
                                <span className="text-sm text-[#8b949e]">{category?.name || item.category}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-[#8b949e]">{item.description}</p>
                              {item.impactNotes && (
                                <p className="text-xs text-[#6e7681] italic mt-1">{item.impactNotes}</p>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-mono text-[#3fb950]">${item.approved?.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-mono text-[#d29922]">${item.spent?.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`font-mono ${
                                utilization > 90 ? 'text-[#f85149]' : utilization > 70 ? 'text-[#d29922]' : 'text-[#3fb950]'
                              }`}>
                                {utilization.toFixed(0)}%
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Heels Life RSO Finances Embed */}
          <div className="mt-12">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#f0f6fc]">Heels Life &mdash; RSO Finances</h2>
                  <p className="text-xs text-[#6e7681] mt-1">Registered Student Organization financial portal via Heels Life</p>
                </div>
                <a
                  href="https://heellife.unc.edu/organization/rsofinances"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium text-[#00d4ff] border border-[#00d4ff]/30 rounded-lg hover:bg-[#00d4ff]/10 transition-all"
                >
                  Open in Heels Life &rarr;
                </a>
              </div>
              <iframe
                src="https://heellife.unc.edu/organization/rsofinances"
                className="w-full border-0"
                style={{ height: '600px' }}
                title="Heels Life RSO Finances"
                loading="lazy"
              />
            </div>
          </div>

          {/* Qualtrics Survey Tools */}
          <div className="mt-8">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#30363d]">
                <h2 className="text-lg font-semibold text-[#f0f6fc]">Survey Tools</h2>
                <p className="text-xs text-[#6e7681] mt-1">Budget feedback and transparency surveys powered by Qualtrics</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Default Qualtrics link */}
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[#f0f6fc] mb-1">Qualtrics &mdash; Software Distribution</h3>
                      <p className="text-xs text-[#6e7681]">Information Technology Services &bull; Access UNC&apos;s licensed Qualtrics survey platform</p>
                    </div>
                    <a
                      href="https://software.sites.unc.edu/qualtrics/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-4 py-2 text-sm font-medium bg-[#00d4ff] text-[#0d1117] rounded-lg hover:bg-[#00d4ff]/90 transition-all"
                    >
                      Go to Qualtrics
                    </a>
                  </div>
                </div>

                {/* Custom Survey Placeholder */}
                <div className="bg-[#0d1117] border border-dashed border-[#30363d] rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#21262d] flex items-center justify-center text-[#6e7681]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#8b949e]">Custom Survey</h3>
                      <p className="text-xs text-[#6e7681]">A custom Qualtrics survey will be embedded here once configured by SG admin</p>
                    </div>
                  </div>
                  <div className="h-32 bg-[#161b22] border border-[#21262d] rounded-lg flex items-center justify-center">
                    <p className="text-xs text-[#6e7681] font-mono">Survey embed placeholder &mdash; configure via Admin Dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-[#30363d]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-[#6e7681]">
                Data updated: {mounted ? new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Loading...'}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => { setShowRequestForm(true); setSubmissionResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-sm text-[#00d4ff] hover:underline"
                >
                  Request Funding
                </button>
                <Link href="/admin" className="text-sm text-[#00d4ff] hover:underline">
                  Admin Dashboard
                </Link>
                <Link href="/" className="text-sm text-[#00d4ff] hover:underline">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
