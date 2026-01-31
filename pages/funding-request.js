import { useState, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../lib/store'
import { sampleBudgetLineItems } from '../lib/data'
import { BUDGET_CATEGORIES } from '../lib/budgetEngine'
import { Button, Input } from '../components/FormInput'

// ==========================================
// PUBLIC FUNDING REQUEST PAGE
// ==========================================

export default function FundingRequest() {
  const {
    budgetLineItems,
    fundingRequests,
    submitFundingRequest,
  } = useApp()

  // Form state
  const [form, setForm] = useState({
    orgName: '',
    category: 'events',
    amount: '',
    description: '',
    justification: '',
    studentsImpacted: '',
    contactEmail: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use sample data if no real data exists
  const displayLineItems = budgetLineItems?.length > 0 ? budgetLineItems : sampleBudgetLineItems

  // Calculate budget statistics
  const budgetStats = useMemo(() => {
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
      }
    }

    // Sum up line items
    for (const item of displayLineItems) {
      if (categoryStats[item.category]) {
        categoryStats[item.category].allocated += item.approved || 0
        categoryStats[item.category].spent += item.spent || 0
      }
    }

    // Sum up pending requests
    const pendingRequests = fundingRequests?.filter(r => r.status === 'pending') || []
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
      totalAllocated,
      totalSpent,
      totalPending,
      totalRemaining: totalAllocated - totalSpent,
      utilizationRate: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
    }
  }, [displayLineItems, fundingRequests])

  // Get current category stats
  const selectedCategoryStats = useMemo(() => {
    return budgetStats.categories.find(c => c.id === form.category) || {}
  }, [budgetStats.categories, form.category])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Validate
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

    // Submit request
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
      setSubmitted(true)
    } else {
      setError(result.error || 'Failed to submit request. Please try again.')
    }
  }

  // Reset form
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
    setSubmitted(false)
    setSubmissionResult(null)
    setError('')
  }

  return (
    <>
      <Head>
        <title>Request Funding | Project Bold</title>
        <meta name="description" content="Submit a funding request to Student Government. View current budget allocation and track your request status." />
      </Head>

      <div className="min-h-screen bg-[#0a0e14]">
        {/* Header */}
        <header className="bg-[#0d1117] border-b border-[#30363d] sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-[#8b949e] hover:text-[#00d4ff] transition-colors text-sm">
                  &larr; Back to Home
                </Link>
                <div className="h-6 w-px bg-[#30363d]" />
                <h1 className="text-[#f0f6fc] text-lg font-bold">Request Funding</h1>
              </div>
              <Link
                href="/budget-transparency"
                className="text-sm text-[#00d4ff] hover:underline"
              >
                View Full Budget
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Demo Banner */}
          <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg p-4 mb-8">
            <p className="text-[#00d4ff] text-sm">
              <strong>DEMO MODE:</strong> This form demonstrates the funding request system. Submissions are stored locally.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Budget Overview */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-[#f0f6fc] mb-4">Current Budget Status</h2>

                {/* Overall Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#0d1117] rounded-lg p-4">
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">Total Allocated</p>
                    <p className="text-xl font-mono font-bold text-[#3fb950]">${budgetStats.totalAllocated.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#0d1117] rounded-lg p-4">
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">Remaining</p>
                    <p className="text-xl font-mono font-bold text-[#00d4ff]">${budgetStats.totalRemaining.toLocaleString()}</p>
                  </div>
                </div>

                {/* Utilization Bar */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-[#6e7681]">Overall Utilization</span>
                    <span className="text-xs font-mono text-[#8b949e]">{budgetStats.utilizationRate.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-[#21262d] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#3fb950] to-[#00d4ff] rounded-full transition-all"
                      style={{ width: `${Math.min(budgetStats.utilizationRate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Category Breakdown */}
                <h3 className="text-sm font-semibold text-[#f0f6fc] mb-3">By Category</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {budgetStats.categories.filter(c => c.allocated > 0 || c.id === form.category).map(cat => {
                    const utilization = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0
                    const isSelected = cat.id === form.category
                    return (
                      <div
                        key={cat.id}
                        className={`p-3 rounded-lg transition-all ${
                          isSelected ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/30' : 'bg-[#0d1117]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className={`text-sm ${isSelected ? 'text-[#00d4ff] font-medium' : 'text-[#8b949e]'}`}>
                              {cat.name}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-[#6e7681]">
                            ${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(utilization, 100)}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                        {cat.pending > 0 && (
                          <p className="text-[10px] text-[#d29922] mt-1">
                            ${cat.pending.toLocaleString()} pending approval
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Selected Category Info */}
                {selectedCategoryStats.allocated > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#30363d]">
                    <p className="text-xs text-[#6e7681] mb-2">Selected category availability:</p>
                    <p className="text-lg font-mono font-bold text-[#3fb950]">
                      ${(selectedCategoryStats.allocated - selectedCategoryStats.spent).toLocaleString()} available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Form or Success */}
            <div className="lg:col-span-3">
              {!submitted ? (
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-[#f0f6fc] mb-2">Submit Funding Request</h2>
                  <p className="text-[#8b949e] text-sm mb-6">
                    Fill out the form below to request funding from Student Government. Your request will be reviewed
                    and scored by our AI-assisted system before being sent to the Finance Committee.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Organization Name */}
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
                        className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm"
                      />
                    </div>

                    {/* Category & Amount */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                          Category *
                        </label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff] text-sm"
                        >
                          {BUDGET_CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                          Amount Requested *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7681]">$</span>
                          <input
                            type="number"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            placeholder="0.00"
                            min="1"
                            step="0.01"
                            required
                            className="w-full pl-8 pr-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
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
                        className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm"
                      />
                    </div>

                    {/* Justification */}
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
                        className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm resize-none"
                      />
                      <p className="text-[10px] text-[#6e7681] mt-1">
                        Tip: Mention urgency, student impact, and alignment with SG priorities for a higher score
                      </p>
                    </div>

                    {/* Students Impacted & Email */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">
                          Estimated Students Impacted
                        </label>
                        <input
                          type="number"
                          value={form.studentsImpacted}
                          onChange={(e) => setForm({ ...form, studentsImpacted: e.target.value })}
                          placeholder="e.g., 200"
                          min="0"
                          className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm font-mono"
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
                          className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm"
                        />
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg p-4">
                        <p className="text-[#f85149] text-sm">{error}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-3 bg-[#00d4ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#00d4ff]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Funding Request'}
                      </button>
                    </div>

                    {/* Info Note */}
                    <p className="text-xs text-[#6e7681] text-center">
                      Rate limit: 10 requests per organization per week
                    </p>
                  </form>
                </div>
              ) : (
                /* Success State */
                <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-xl p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#3fb950]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[#3fb950]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-[#f0f6fc] mb-2">Request Submitted</h2>
                    <p className="text-[#8b949e]">Your funding request has been received and scored.</p>
                  </div>

                  {/* AI Score Display */}
                  {submissionResult?.aiScore && (
                    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-[#6e7681]">AI Assessment Score</span>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-3xl font-mono font-bold"
                            style={{ color: submissionResult.aiScore.recommendation?.color || '#6e7681' }}
                          >
                            {submissionResult.aiScore.score}
                          </span>
                          <span className="text-lg text-[#6e7681]">/100</span>
                        </div>
                      </div>

                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${
                        submissionResult.aiScore.recommendation?.action === 'APPROVE'
                          ? 'bg-[#3fb950]/20 text-[#3fb950] border border-[#3fb950]/30'
                          : submissionResult.aiScore.recommendation?.action === 'DENY'
                          ? 'bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/30'
                          : 'bg-[#d29922]/20 text-[#d29922] border border-[#d29922]/30'
                      }`}>
                        Recommendation: {submissionResult.aiScore.recommendation?.action || 'REVIEW'}
                      </div>

                      {submissionResult.aiScore.recommendation?.reason && (
                        <p className="text-sm text-[#8b949e] mt-3">
                          {submissionResult.aiScore.recommendation.reason}
                        </p>
                      )}

                      {/* Score Breakdown */}
                      {submissionResult.aiScore.breakdown && (
                        <div className="mt-4 pt-4 border-t border-[#30363d]">
                          <p className="text-xs text-[#6e7681] mb-2">Score Breakdown:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(submissionResult.aiScore.breakdown).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-[#8b949e] capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className={`font-mono ${value >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                                  {value >= 0 ? '+' : ''}{value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Request Summary */}
                  <div className="bg-[#0d1117] rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-semibold text-[#f0f6fc] mb-3">Request Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#6e7681]">Organization</span>
                        <span className="text-[#f0f6fc]">{submissionResult?.orgName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6e7681]">Amount</span>
                        <span className="text-[#f0f6fc] font-mono">${submissionResult?.amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6e7681]">Category</span>
                        <span className="text-[#f0f6fc]">
                          {BUDGET_CATEGORIES.find(c => c.id === submissionResult?.category)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6e7681]">Status</span>
                        <span className="text-[#d29922]">Pending Review</span>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-[#0d1117] rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-semibold text-[#f0f6fc] mb-2">What Happens Next?</h3>
                    <ol className="text-sm text-[#8b949e] space-y-2 list-decimal list-inside">
                      <li>Your request is queued for Finance Committee review</li>
                      <li>Committee members will see the AI recommendation alongside your request</li>
                      <li>You may be contacted if additional information is needed</li>
                      <li>Once approved, funds will be allocated to your organization</li>
                    </ol>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleNewRequest}
                      className="flex-1 px-4 py-2.5 bg-[#21262d] border border-[#30363d] rounded-lg text-[#f0f6fc] hover:bg-[#30363d] transition-all text-sm font-medium"
                    >
                      Submit Another Request
                    </button>
                    <Link
                      href="/budget-transparency"
                      className="flex-1 px-4 py-2.5 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-all text-sm font-medium text-center"
                    >
                      View Full Budget
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-[#30363d]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-[#6e7681]">
                Questions about funding? Contact the Finance Committee at sg-finance@unc.edu
              </p>
              <div className="flex gap-4">
                <Link href="/budget-transparency" className="text-sm text-[#00d4ff] hover:underline">
                  Budget Transparency
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
