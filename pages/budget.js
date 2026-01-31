import { useState, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import { Input, Select, Textarea } from '../components/FormInput'
import { useApp } from '../lib/store'
import { sampleBudgetLineItems, sampleFundingRequests } from '../lib/data'
import {
  BUDGET_CATEGORIES,
  exportLineItemsToCSV,
  exportFundingRequestsToCSV,
} from '../lib/budgetEngine'
import {
  Editable,
  EditModeToggle,
} from '../components/InlineEditor'

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

  // Use sample data if no real data exists
  const displayLineItems = budgetLineItems?.length > 0 ? budgetLineItems : sampleBudgetLineItems
  const displayFundingRequests = fundingRequests?.length > 0 ? fundingRequests : sampleFundingRequests
  const isUsingDemoData = budgetLineItems?.length === 0 && fundingRequests?.length === 0

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

      {/* Hero */}
      <div className="relative bg-[#0a0e14] border-b border-[#30363d] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#388bfd 1px, transparent 1px), linear-gradient(90deg, #388bfd 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#388bfd]/10 blur-3xl rounded-full" />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <p className="text-[#388bfd] text-xs font-medium tracking-widest uppercase mb-4">
            <Editable k="budget.hero.label">Student Government</Editable>
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0f6fc] tracking-tight mb-4">
            <Editable k="budget.hero.title">Budget & Funding</Editable>
          </h1>
          <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed">
            <Editable k="budget.hero.description" multiline>Full transparency into how Student Government allocates and spends student fees. Request funding for your organization.</Editable>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0d1117] sticky top-16 z-40 border-b border-[#30363d]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 text-xs font-medium tracking-wider uppercase whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#388bfd] text-[#388bfd]'
                    : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
              >
                {tab.label}
                {tab.id === 'pending' && stats.pendingCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#388bfd]/20">
                    {stats.pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="bg-[#0d1117] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              {/* Demo Data Notice */}
              {isUsingDemoData && (
                <div className="bg-[#d29922]/10 border border-[#d29922] rounded-lg p-4 mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[#d29922] text-xl">ℹ</span>
                    <div>
                      <p className="text-[#f0f6fc] font-medium">Displaying Sample Data</p>
                      <p className="text-sm text-[#8b949e]">Configure database and APIs to use real budget data.</p>
                    </div>
                  </div>
                  <Link
                    href="/setup"
                    className="px-4 py-2 text-sm text-[#d29922] border border-[#d29922] rounded hover:bg-[#d29922]/10 transition-colors whitespace-nowrap"
                  >
                    Setup Guide
                  </Link>
                </div>
              )}

              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">
                <Editable k="budget.overview.title">Budget Overview</Editable>
              </h2>

              {/* Key Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#388bfd]/30 rounded-lg p-5">
                  <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-2">Total Allocated</p>
                  <p className="text-3xl font-mono font-bold text-[#388bfd]">
                    ${stats.totalAllocated.toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-5">
                  <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-2">Total Spent</p>
                  <p className="text-3xl font-mono font-bold text-[#3fb950]">
                    ${stats.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#161b22] border border-[#d29922]/30 rounded-lg p-5">
                  <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-2">Pending Requests</p>
                  <p className="text-3xl font-mono font-bold text-[#d29922]">
                    ${stats.totalPending.toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#161b22] border border-[#a371f7]/30 rounded-lg p-5">
                  <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-2">Utilization</p>
                  <p className="text-3xl font-mono font-bold text-[#a371f7]">
                    {stats.utilizationRate.toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-10">
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-4">
                  <Editable k="budget.overview.progressTitle">Budget Utilization</Editable>
                </h3>
                <div className="h-4 bg-[#21262d] rounded-full overflow-hidden flex mb-4">
                  <div
                    className="h-full bg-[#3fb950] transition-all"
                    style={{ width: `${stats.utilizationRate}%` }}
                    title={`Spent: $${stats.totalSpent.toLocaleString()}`}
                  />
                  <div
                    className="h-full bg-[#d29922] transition-all"
                    style={{ width: `${stats.totalAllocated > 0 ? (stats.totalPending / stats.totalAllocated) * 100 : 0}%` }}
                    title={`Pending: $${stats.totalPending.toLocaleString()}`}
                  />
                </div>
                <div className="flex flex-wrap gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#3fb950]" />
                    <span className="text-[#8b949e]">Spent (${stats.totalSpent.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#d29922]" />
                    <span className="text-[#8b949e]">Pending (${stats.totalPending.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#21262d]" />
                    <span className="text-[#8b949e]">Available (${stats.totalRemaining.toLocaleString()})</span>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">
                <Editable k="budget.overview.categoryTitle">By Category</Editable>
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {stats.categories.filter(c => c.allocated > 0 || c.count > 0).map(cat => {
                  const utilization = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0
                  return (
                    <div
                      key={cat.id}
                      className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#388bfd] transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCategory(cat.id)
                        setActiveTab('allocations')
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <h4 className="font-semibold text-[#f0f6fc]">{cat.name}</h4>
                        </div>
                        <span className="text-xs text-[#6e7681] font-mono">{cat.count} items</span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-mono font-bold text-[#f0f6fc]">
                          ${cat.spent.toLocaleString()}
                        </span>
                        <span className="text-sm text-[#6e7681]">
                          / ${cat.allocated.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${utilization}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ALLOCATIONS TAB */}
          {activeTab === 'allocations' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">
                  <Editable k="budget.allocations.title">Budget Allocations</Editable>
                </h2>
                <button
                  onClick={handleExportLineItems}
                  className="px-4 py-2 text-sm text-[#388bfd] border border-[#388bfd] rounded hover:bg-[#388bfd]/10 transition-colors"
                >
                  Export CSV
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded text-sm text-[#f0f6fc] placeholder-[#6e7681] focus:border-[#388bfd] focus:outline-none"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded text-sm text-[#f0f6fc] focus:border-[#388bfd] focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {BUDGET_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Line Items List */}
              <div className="space-y-3">
                {filteredItems.map(item => {
                  const cat = BUDGET_CATEGORIES.find(c => c.id === item.category)
                  const utilization = item.approved > 0 ? (item.spent / item.approved) * 100 : 0
                  return (
                    <div key={item.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#8b949e]/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-[#f0f6fc]">{item.orgName}</h3>
                            <span
                              className="px-2 py-0.5 rounded text-xs font-mono border"
                              style={{ borderColor: cat?.color + '60', color: cat?.color, backgroundColor: cat?.color + '15' }}
                            >
                              {cat?.name || item.category}
                            </span>
                          </div>
                          <p className="text-sm text-[#8b949e]">{item.description}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-xs font-mono border ${
                          item.status === 'spent' ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]' :
                          item.status === 'approved' ? 'bg-[#388bfd]/10 text-[#388bfd] border-[#388bfd]' :
                          'bg-[#21262d] text-[#6e7681] border-[#30363d]'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-3">
                          <span className="text-lg font-mono font-bold text-[#f0f6fc]">
                            ${(item.spent || 0).toLocaleString()}
                          </span>
                          <span className="text-sm text-[#6e7681]">
                            of ${(item.approved || 0).toLocaleString()} approved
                          </span>
                        </div>
                        <span className="text-sm text-[#6e7681] font-mono">{utilization.toFixed(0)}%</span>
                      </div>
                      <div className="mt-3 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${utilization}%`, backgroundColor: cat?.color || '#388bfd' }}
                        />
                      </div>
                      {item.impactNotes && (
                        <p className="mt-3 text-xs text-[#6e7681] italic">Impact: {item.impactNotes}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* REQUEST FUNDING TAB */}
          {activeTab === 'request' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">
                <Editable k="budget.request.title">Request Funding</Editable>
              </h2>
              <p className="text-[#8b949e] mb-8">
                <Editable k="budget.request.subtitle">Submit a funding request for your registered student organization.</Editable>
              </p>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  {submissionResult ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-[#3fb950]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl text-[#3fb950]">$</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#f0f6fc] mb-2">Request Submitted!</h3>
                      <p className="text-[#8b949e] mb-4">Your request for ${submissionResult.amount?.toLocaleString()} has been submitted.</p>

                      {/* AI Score Display */}
                      {submissionResult.aiScore && (
                        <div className="bg-[#21262d] rounded-lg p-4 mb-6 text-left">
                          <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-2">AI Assessment</p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-mono font-bold" style={{ color: submissionResult.aiScore.recommendation?.color || '#8b949e' }}>
                              {submissionResult.aiScore.score}/100
                            </span>
                            <span className={`px-2.5 py-1 rounded text-xs font-mono border`} style={{
                              borderColor: submissionResult.aiScore.recommendation?.color,
                              color: submissionResult.aiScore.recommendation?.color,
                              backgroundColor: submissionResult.aiScore.recommendation?.color + '15',
                            }}>
                              {submissionResult.aiScore.recommendation?.action}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleNewRequest}
                        className="bg-[#388bfd] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#58a6ff] transition-colors"
                      >
                        Submit Another Request
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitRequest} className="space-y-4">
                      {error && (
                        <div className="bg-[#f85149]/10 border border-[#f85149] rounded p-3 text-[#f85149] text-sm">
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
                        className="w-full bg-[#388bfd] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#58a6ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Funding Request'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Budget Info Sidebar */}
                <div className="space-y-6">
                  <div className="bg-[#161b22] border border-[#388bfd] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Category Budget</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCategoryStats.color }} />
                      <span className="text-[#f0f6fc]">{selectedCategoryStats.name || 'Events'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-mono font-bold text-[#388bfd]">
                          ${(selectedCategoryStats.allocated || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-[#6e7681] uppercase">Allocated</p>
                      </div>
                      <div>
                        <p className="text-2xl font-mono font-bold text-[#3fb950]">
                          ${categoryAvailable.toLocaleString()}
                        </p>
                        <p className="text-xs text-[#6e7681] uppercase">Available</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">How It Works</h3>
                    <div className="space-y-4">
                      {[
                        { step: 1, text: 'Submit your funding request with justification' },
                        { step: 2, text: 'AI scores your request based on impact and budget' },
                        { step: 3, text: 'Request goes to admin review queue' },
                        { step: 4, text: 'Decision within 3-5 business days' },
                      ].map(item => (
                        <div key={item.step} className="flex gap-3">
                          <div className="w-6 h-6 bg-[#388bfd] text-[#0d1117] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {item.step}
                          </div>
                          <p className="text-sm text-[#8b949e]">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PENDING REQUESTS TAB */}
          {activeTab === 'pending' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">
                  <Editable k="budget.pending.title">Pending Requests</Editable>
                </h2>
                <button
                  onClick={handleExportRequests}
                  className="px-4 py-2 text-sm text-[#388bfd] border border-[#388bfd] rounded hover:bg-[#388bfd]/10 transition-colors"
                >
                  Export CSV
                </button>
              </div>

              {displayFundingRequests.filter(r => r.status === 'pending').length === 0 ? (
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-12 text-center">
                  <p className="text-[#8b949e]">No pending funding requests.</p>
                  <button
                    onClick={() => setActiveTab('request')}
                    className="mt-4 text-[#388bfd] hover:underline"
                  >
                    Submit a request
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayFundingRequests.filter(r => r.status === 'pending').map(req => {
                    const cat = BUDGET_CATEGORIES.find(c => c.id === req.category)
                    return (
                      <div key={req.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-[#f0f6fc]">{req.orgName}</h3>
                              <span
                                className="px-2 py-0.5 rounded text-xs font-mono border"
                                style={{ borderColor: cat?.color + '60', color: cat?.color, backgroundColor: cat?.color + '15' }}
                              >
                                {cat?.name || req.category}
                              </span>
                            </div>
                            <p className="text-sm text-[#8b949e]">{req.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-mono font-bold text-[#f0f6fc]">
                              ${(req.amount || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-[#6e7681]">
                              {new Date(req.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* AI Score */}
                        {req.aiScore && (
                          <div className="flex items-center justify-between bg-[#21262d] rounded p-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-[#6e7681] uppercase">AI Score:</span>
                              <span className="font-mono font-bold" style={{ color: req.aiScore.recommendation?.color }}>
                                {req.aiScore.score}/100
                              </span>
                            </div>
                            <span
                              className="px-2 py-0.5 rounded text-xs font-mono border"
                              style={{
                                borderColor: req.aiScore.recommendation?.color,
                                color: req.aiScore.recommendation?.color,
                                backgroundColor: req.aiScore.recommendation?.color + '15',
                              }}
                            >
                              {req.aiScore.recommendation?.action}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TRANSPARENCY TAB */}
          {activeTab === 'transparency' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">
                <Editable k="budget.transparency.title">Budget Transparency</Editable>
              </h2>
              <p className="text-[#8b949e] mb-8">
                <Editable k="budget.transparency.subtitle">Open access to all Student Government financial data.</Editable>
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#3fb950] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Download Data</h3>
                  <p className="text-sm text-[#8b949e] mb-6">Export complete budget data in CSV format for your own analysis.</p>
                  <div className="space-y-3">
                    <button
                      onClick={handleExportLineItems}
                      className="w-full bg-[#3fb950] text-[#0d1117] px-4 py-3 rounded font-semibold hover:bg-[#46c356] transition-colors"
                    >
                      Download Line Items CSV
                    </button>
                    <button
                      onClick={handleExportRequests}
                      className="w-full bg-[#21262d] text-[#f0f6fc] px-4 py-3 rounded font-semibold border border-[#30363d] hover:border-[#3fb950] transition-colors"
                    >
                      Download Funding Requests CSV
                    </button>
                  </div>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Methodology</h3>
                  <p className="text-sm text-[#8b949e] mb-4">
                    All budget data is updated in real-time as transactions are recorded. AI scoring uses rule-based
                    analysis considering urgency, SG priority alignment, budget availability, and impact metrics.
                  </p>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li className="flex items-center gap-2">
                      <span className="text-[#3fb950]">-</span> Data updated in real-time
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#3fb950]">-</span> Transparent scoring criteria
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#3fb950]">-</span> Complete audit trail
                    </li>
                  </ul>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">At a Glance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-mono font-bold text-[#388bfd]">{stats.lineItemCount}</p>
                    <p className="text-xs text-[#6e7681] uppercase mt-1">Line Items</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-mono font-bold text-[#3fb950]">{stats.categories.filter(c => c.count > 0).length}</p>
                    <p className="text-xs text-[#6e7681] uppercase mt-1">Categories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-mono font-bold text-[#d29922]">{stats.pendingCount}</p>
                    <p className="text-xs text-[#6e7681] uppercase mt-1">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-mono font-bold text-[#a371f7]">{stats.utilizationRate.toFixed(0)}%</p>
                    <p className="text-xs text-[#6e7681] uppercase mt-1">Utilized</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Edit Mode Toggle */}
      <EditModeToggle />
    </Layout>
  )
}
