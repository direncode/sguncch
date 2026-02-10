import { useState, useMemo, useEffect, useRef } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { Input, Select, Textarea } from '../components/FormInput'
import { useApp } from '../lib/store'
import {
  BUDGET_CATEGORIES,
  exportLineItemsToCSV,
  exportFundingRequestsToCSV,
} from '../lib/budgetEngine'
import {
  Editable,
  EditModeToggle,
} from '../components/InlineEditor'

// Scroll reveal hook
function useScrollReveal() {
  const [revealed, setRevealed] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return [ref, revealed]
}

// Reveal component
function Reveal({ children, delay = 0, className = '' }) {
  const [ref, revealed] = useScrollReveal()

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${className}`}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(40px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

export default function BudgetPage() {
  const {
    budgetData,
    budgetLineItems,
    fundingRequests,
    submitFundingRequest,
  } = useApp()

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

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
    let items = displayLineItems
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory)
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item =>
        item.orgName?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    }
    return items
  }, [displayLineItems, selectedCategory, searchQuery])

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
    { id: 'allocations', label: 'Allocations' },
    { id: 'request', label: 'Request Funding' },
    { id: 'pending', label: 'Pending Requests' },
    { id: 'transparency', label: 'Transparency' },
  ]

  return (
    <Layout>
      <Head>
        <title>Budget & Funding | Project Bold</title>
        <meta name="description" content="Student Government budget transparency, allocations, and funding requests." />
      </Head>

      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center relative overflow-hidden border-b border-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <Reveal>
            <span className="caption mb-6 block">
              <Editable k="budget.hero.label">Student Government</Editable>
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="hero-title mb-6">
              <Editable k="budget.hero.title">Budget & Funding</Editable>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="hero-subtitle max-w-2xl mb-10">
              <Editable k="budget.hero.description" multiline>Full transparency into how Student Government allocates and spends student fees. Request funding for your organization.</Editable>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-20 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-xs font-medium tracking-widest uppercase whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-500 hover:text-white hover:border-gray-700'
                }`}
              >
                {tab.label}
                {tab.id === 'pending' && stats.pendingCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10">
                    {stats.pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="section-padding">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-8">
                  <Editable k="budget.overview.title">Budget Overview</Editable>
                </h2>
              </Reveal>

              {/* Key Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-16">
                <Reveal delay={50}>
                  <div className="card-highlight p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2"><Editable k="budget.overview.stats.allocated">Total Allocated</Editable></p>
                    <p className="text-3xl font-mono font-bold text-white">
                      ${stats.totalAllocated.toLocaleString()}
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="card p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2"><Editable k="budget.overview.stats.spent">Total Spent</Editable></p>
                    <p className="text-3xl font-mono font-bold text-white">
                      ${stats.totalSpent.toLocaleString()}
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="card p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2"><Editable k="budget.overview.stats.pending">Pending Requests</Editable></p>
                    <p className="text-3xl font-mono font-bold text-white">
                      ${stats.totalPending.toLocaleString()}
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <div className="card p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2"><Editable k="budget.overview.stats.utilization">Utilization</Editable></p>
                    <p className="text-3xl font-mono font-bold text-white">
                      {stats.utilizationRate.toFixed(0)}%
                    </p>
                  </div>
                </Reveal>
              </div>

              {/* Budget Progress Bar */}
              <Reveal>
                <div className="card p-8 mb-16">
                  <span className="caption mb-6 block">
                    <Editable k="budget.overview.progressTitle">Budget Utilization</Editable>
                  </span>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex mb-6">
                    <div
                      className="h-full bg-white transition-all"
                      style={{ width: `${stats.utilizationRate}%` }}
                      title={`Spent: $${stats.totalSpent.toLocaleString()}`}
                    />
                    <div
                      className="h-full bg-gray-500 transition-all"
                      style={{ width: `${stats.totalAllocated > 0 ? (stats.totalPending / stats.totalAllocated) * 100 : 0}%` }}
                      title={`Pending: $${stats.totalPending.toLocaleString()}`}
                    />
                  </div>
                  <div className="flex flex-wrap gap-8 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded bg-white" />
                      <span className="text-gray-400">Spent (${stats.totalSpent.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded bg-gray-500" />
                      <span className="text-gray-400">Pending (${stats.totalPending.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded bg-gray-800" />
                      <span className="text-gray-400">Available (${stats.totalRemaining.toLocaleString()})</span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Category Breakdown */}
              <Reveal>
                <span className="caption mb-6 block">
                  <Editable k="budget.overview.categoryTitle">By Category</Editable>
                </span>
              </Reveal>
              <div className="grid md:grid-cols-3 gap-4">
                {stats.categories.filter(c => c.allocated > 0 || c.count > 0).map((cat, index) => {
                  const utilization = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0
                  return (
                    <Reveal key={cat.id} delay={index * 50}>
                      <div
                        className="card p-6 cursor-pointer group"
                        onClick={() => {
                          setSelectedCategory(cat.id)
                          setActiveTab('allocations')
                        }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-white" />
                            <h4 className="font-semibold text-white group-hover:text-gray-300 transition-colors">{cat.name}</h4>
                          </div>
                          <span className="text-xs text-gray-500 font-mono">{cat.count} items</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-2xl font-mono font-bold text-white">
                            ${cat.spent.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            / ${cat.allocated.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all bg-white"
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                      </div>
                    </Reveal>
                  )
                })}
              </div>
            </div>
          )}

          {/* ALLOCATIONS TAB */}
          {activeTab === 'allocations' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <Reveal>
                  <h2 className="section-title">
                    <Editable k="budget.allocations.title">Budget Allocations</Editable>
                  </h2>
                </Reveal>
                <button
                  onClick={handleExportLineItems}
                  className="btn-secondary"
                >
                  <Editable k="budget.allocations.export">Export CSV</Editable>
                </button>
              </div>

              {/* Filters */}
              <Reveal>
                <div className="flex flex-wrap gap-4 mb-8">
                  <input
                    type="text"
                    placeholder="Search organizations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-3 bg-black border border-gray-800 rounded text-sm text-white placeholder-gray-600 focus:border-white focus:outline-none"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-black border border-gray-800 rounded text-sm text-white focus:border-white focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {BUDGET_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </Reveal>

              {/* Line Items List */}
              <div className="space-y-4">
                {filteredItems.map((item, index) => {
                  const cat = BUDGET_CATEGORIES.find(c => c.id === item.category)
                  const utilization = item.approved > 0 ? (item.spent / item.approved) * 100 : 0
                  return (
                    <Reveal key={item.id} delay={index * 30}>
                      <div className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-white">{item.orgName}</h3>
                              <span className="px-2 py-0.5 rounded text-xs font-mono border border-gray-700 text-gray-400 bg-white/5">
                                {cat?.name || item.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">{item.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded text-xs font-mono ${
                            item.status === 'spent' ? 'bg-white/10 text-white' :
                            item.status === 'approved' ? 'bg-white/5 text-gray-300' :
                            'bg-white/5 text-gray-500'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-baseline gap-3">
                            <span className="text-xl font-mono font-bold text-white">
                              ${(item.spent || 0).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500">
                              of ${(item.approved || 0).toLocaleString()} approved
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 font-mono">{utilization.toFixed(0)}%</span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all bg-white"
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                        {item.impactNotes && (
                          <p className="mt-4 text-xs text-gray-500 italic">Impact: {item.impactNotes}</p>
                        )}
                      </div>
                    </Reveal>
                  )
                })}
              </div>
            </div>
          )}

          {/* REQUEST FUNDING TAB */}
          {activeTab === 'request' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2">
                  <Editable k="budget.request.title">Request Funding</Editable>
                </h2>
                <p className="body-large text-gray-400 mb-8">
                  <Editable k="budget.request.subtitle">Submit a funding request for your registered student organization.</Editable>
                </p>
              </Reveal>

              <div className="grid lg:grid-cols-2 gap-12">
                {/* Form */}
                <Reveal>
                  <div className="card p-8">
                    {submissionResult ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                          <span className="text-3xl text-white">$</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3"><Editable k="budget.request.success.title">Request Submitted!</Editable></h3>
                        <p className="text-gray-400 mb-6">Your request for ${submissionResult.amount?.toLocaleString()} has been submitted.</p>

                        {/* Context Check Display */}
                        {submissionResult.contextCheck && (
                          <div className="card p-6 mb-8 text-left">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Context Check</p>
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-3 py-1 rounded text-xs font-mono ${
                                submissionResult.contextCheck.flag === 'PASS'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {submissionResult.contextCheck.flag === 'PASS' ? 'Realistic' : 'Needs Review'}
                              </span>
                            </div>
                            {submissionResult.contextCheck.note && (
                              <p className="text-sm text-gray-400">{submissionResult.contextCheck.note}</p>
                            )}
                            {submissionResult.contextCheck.marketContext && (
                              <p className="text-sm text-gray-500 mt-2 italic">{submissionResult.contextCheck.marketContext}</p>
                            )}
                          </div>
                        )}

                        <button
                          onClick={handleNewRequest}
                          className="btn-primary"
                        >
                          <Editable k="budget.request.success.button">Submit Another Request</Editable>
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitRequest} className="space-y-5">
                        {error && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded p-4 text-red-400 text-sm">
                            {error}
                          </div>
                        )}

                        <Input
                          label="Organization Name"
                          required
                          value={form.orgName}
                          onChange={e => setForm({ ...form, orgName: e.target.value })}
                          placeholder="e.g., Carolina Esports"
                        />

                        <Select
                          label="Category"
                          required
                          value={form.category}
                          onChange={e => setForm({ ...form, category: e.target.value })}
                          options={BUDGET_CATEGORIES.map(cat => ({ value: cat.id, label: cat.name }))}
                        />

                        <Input
                          label="Amount Requested ($)"
                          type="number"
                          required
                          value={form.amount}
                          onChange={e => setForm({ ...form, amount: e.target.value })}
                          placeholder="0.00"
                        />

                        <Input
                          label="Brief Description"
                          required
                          value={form.description}
                          onChange={e => setForm({ ...form, description: e.target.value })}
                          placeholder="What is this funding for?"
                        />

                        <Textarea
                          label="Justification"
                          required
                          rows={3}
                          value={form.justification}
                          onChange={e => setForm({ ...form, justification: e.target.value })}
                          placeholder="Explain the impact and why this funding is needed..."
                        />

                        <Input
                          label="Students Impacted (estimate)"
                          type="number"
                          value={form.studentsImpacted}
                          onChange={e => setForm({ ...form, studentsImpacted: e.target.value })}
                          placeholder="0"
                        />

                        <Input
                          label="Contact Email"
                          type="email"
                          value={form.contactEmail}
                          onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                          placeholder="your@email.unc.edu"
                        />

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Submitting...' : <Editable k="budget.request.form.submit">Submit Funding Request</Editable>}
                        </button>
                      </form>
                    )}
                  </div>
                </Reveal>

                {/* Budget Info Sidebar */}
                <div className="space-y-6">
                  <Reveal delay={100}>
                    <div className="card-highlight p-8">
                      <h3 className="text-lg font-semibold text-white mb-6"><Editable k="budget.request.sidebar.title">Category Budget</Editable></h3>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 rounded-full bg-white" />
                        <span className="text-white">{selectedCategoryStats.name || 'Events'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="card p-4">
                          <p className="text-2xl font-mono font-bold text-white">
                            ${(selectedCategoryStats.allocated || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 uppercase mt-1"><Editable k="budget.request.sidebar.allocated">Allocated</Editable></p>
                        </div>
                        <div className="card p-4">
                          <p className="text-2xl font-mono font-bold text-white">
                            ${categoryAvailable.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 uppercase mt-1"><Editable k="budget.request.sidebar.available">Available</Editable></p>
                        </div>
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={150}>
                    <div className="card p-8">
                      <h3 className="text-lg font-semibold text-white mb-6"><Editable k="budget.request.howItWorks.title">How It Works</Editable></h3>
                      <div className="space-y-4">
                        {[
                          { step: 1, text: 'Submit your funding request with justification' },
                          { step: 2, text: 'AI scores your request based on impact and budget' },
                          { step: 3, text: 'Request goes to admin review queue' },
                          { step: 4, text: 'Decision within 3-5 business days' },
                        ].map(item => (
                          <div key={item.step} className="flex gap-4">
                            <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {item.step}
                            </div>
                            <p className="text-sm text-gray-400 pt-1"><Editable k={`budget.request.howItWorks.step${item.step}`}>{item.text}</Editable></p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            </div>
          )}

          {/* PENDING REQUESTS TAB */}
          {activeTab === 'pending' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <Reveal>
                  <h2 className="section-title">
                    <Editable k="budget.pending.title">Pending Requests</Editable>
                  </h2>
                </Reveal>
                <button
                  onClick={handleExportRequests}
                  className="btn-secondary"
                >
                  <Editable k="budget.pending.export">Export CSV</Editable>
                </button>
              </div>

              {displayFundingRequests.filter(r => r.status === 'pending').length === 0 ? (
                <Reveal>
                  <div className="card p-12 text-center">
                    <p className="text-gray-400"><Editable k="budget.pending.empty">No pending funding requests.</Editable></p>
                    <button
                      onClick={() => setActiveTab('request')}
                      className="mt-4 text-white hover:text-gray-300 transition-colors"
                    >
                      <Editable k="budget.pending.submitLink">Submit a request</Editable>
                    </button>
                  </div>
                </Reveal>
              ) : (
                <div className="space-y-4">
                  {displayFundingRequests.filter(r => r.status === 'pending').map((req, index) => {
                    const cat = BUDGET_CATEGORIES.find(c => c.id === req.category)
                    return (
                      <Reveal key={req.id} delay={index * 50}>
                        <div className="card p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-white">{req.orgName}</h3>
                                <span className="px-2 py-0.5 rounded text-xs font-mono border border-gray-700 text-gray-400 bg-white/5">
                                  {cat?.name || req.category}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">{req.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-mono font-bold text-white">
                                ${(req.amount || 0).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(req.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Context Check */}
                          {req.contextCheck && (
                            <div className="flex items-center justify-between card p-4">
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-500 uppercase"><Editable k="budget.pending.contextCheck">Context:</Editable></span>
                                <span className="text-sm text-gray-400">
                                  {req.contextCheck.note}
                                </span>
                              </div>
                              <span className={`px-3 py-1 rounded text-xs font-mono ${
                                req.contextCheck.flag === 'PASS'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {req.contextCheck.flag === 'PASS' ? 'Realistic' : 'Review'}
                              </span>
                            </div>
                          )}
                        </div>
                      </Reveal>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TRANSPARENCY TAB */}
          {activeTab === 'transparency' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2">
                  <Editable k="budget.transparency.title">Budget Transparency</Editable>
                </h2>
                <p className="body-large text-gray-400 mb-8">
                  <Editable k="budget.transparency.subtitle">Open access to all Student Government financial data.</Editable>
                </p>
              </Reveal>

              <div className="grid md:grid-cols-2 gap-8 mb-16">
                <Reveal>
                  <div className="card-highlight p-8">
                    <h3 className="text-lg font-semibold text-white mb-4"><Editable k="budget.transparency.download.title">Download Data</Editable></h3>
                    <p className="text-sm text-gray-400 mb-8"><Editable k="budget.transparency.download.description">Export complete budget data in CSV format for your own analysis.</Editable></p>
                    <div className="space-y-3">
                      <button
                        onClick={handleExportLineItems}
                        className="btn-primary w-full"
                      >
                        <Editable k="budget.transparency.download.lineItems">Download Line Items CSV</Editable>
                      </button>
                      <button
                        onClick={handleExportRequests}
                        className="btn-secondary w-full"
                      >
                        <Editable k="budget.transparency.download.requests">Download Funding Requests CSV</Editable>
                      </button>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="card p-8">
                    <h3 className="text-lg font-semibold text-white mb-4"><Editable k="budget.transparency.methodology.title">Methodology</Editable></h3>
                    <p className="text-sm text-gray-400 mb-6">
                      <Editable k="budget.transparency.methodology.description" multiline>All budget data is updated in real-time as transactions are recorded. AI scoring uses rule-based
                      analysis considering urgency, SG priority alignment, budget availability, and impact metrics.</Editable>
                    </p>
                    <ul className="space-y-3 text-sm text-gray-400">
                      <li className="flex items-center gap-3">
                        <span className="text-white">-</span> <Editable k="budget.transparency.methodology.item1">Data updated in real-time</Editable>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="text-white">-</span> <Editable k="budget.transparency.methodology.item2">Transparent scoring criteria</Editable>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="text-white">-</span> <Editable k="budget.transparency.methodology.item3">Complete audit trail</Editable>
                      </li>
                    </ul>
                  </div>
                </Reveal>
              </div>

              {/* Quick Stats */}
              <Reveal>
                <div className="card p-8">
                  <span className="caption mb-6 block"><Editable k="budget.transparency.stats.title">At a Glance</Editable></span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-mono font-bold text-white">{stats.lineItemCount}</p>
                      <p className="text-xs text-gray-500 uppercase mt-2"><Editable k="budget.transparency.stats.lineItems">Line Items</Editable></p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-mono font-bold text-white">{stats.categories.filter(c => c.count > 0).length}</p>
                      <p className="text-xs text-gray-500 uppercase mt-2"><Editable k="budget.transparency.stats.categories">Categories</Editable></p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-mono font-bold text-white">{stats.pendingCount}</p>
                      <p className="text-xs text-gray-500 uppercase mt-2"><Editable k="budget.transparency.stats.pending">Pending</Editable></p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-mono font-bold text-white">{stats.utilizationRate.toFixed(0)}%</p>
                      <p className="text-xs text-gray-500 uppercase mt-2"><Editable k="budget.transparency.stats.utilized">Utilized</Editable></p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          )}
        </div>
      </main>

      {/* Floating Edit Mode Toggle */}
      <EditModeToggle />
    </Layout>
  )
}
