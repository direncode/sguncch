import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import { useApp } from '../lib/store'
import { budgetCategories, sgPriorities } from '../lib/data'

export default function BudgetTransparency() {
  const { budgetData, getBudgetSummaryStats, submitFundingRequest, checkRateLimit } = useApp()
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestForm, setRequestForm] = useState({
    orgName: '',
    amount: '',
    category: 'Events',
    description: '',
    impactJustification: '',
    priority: 'Community Building',
    urgency: 'normal'
  })
  const [submitStatus, setSubmitStatus] = useState(null)

  const stats = getBudgetSummaryStats ? getBudgetSummaryStats() : {
    totalRequested: 0,
    totalApproved: 0,
    totalSpent: 0,
    utilizationRate: 0,
    categoryStats: {},
    wasteReduction: { reallocatedFunds: 0, unusedRecovered: 0, duplicatesPrevented: 0, aiSavings: 0, avgProcessingHours: 0, fastProcessed: 0 },
    orgCount: 0,
    pendingRequests: 0
  }

  const handleSubmitRequest = (e) => {
    e.preventDefault()

    if (!checkRateLimit || !checkRateLimit(requestForm.orgName)) {
      setSubmitStatus({ type: 'error', message: 'Rate limit exceeded. Maximum 10 requests per organization per week.' })
      return
    }

    const result = submitFundingRequest({
      ...requestForm,
      amount: parseFloat(requestForm.amount) || 0
    })

    if (result?.success) {
      setSubmitStatus({ type: 'success', message: `Request submitted! AI Score: ${result.request.aiScore}/100. You'll hear back within 24-48 hours.` })
      setRequestForm({
        orgName: '',
        amount: '',
        category: 'Events',
        description: '',
        impactJustification: '',
        priority: 'Community Building',
        urgency: 'normal'
      })
      setTimeout(() => setShowRequestForm(false), 3000)
    } else {
      setSubmitStatus({ type: 'error', message: result?.error || 'Failed to submit request. Please try again.' })
    }
  }

  return (
    <Layout>
      <Head>
        <title>Budget Transparency | Project Bold</title>
        <meta name="description" content="UNC Student Government budget transparency - see how your student fees are allocated and spent" />
      </Head>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-[#3fb950] rounded-full animate-pulse" />
            <span className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Public Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold text-[#f0f6fc] tracking-tight mb-3">Budget Transparency</h1>
          <p className="text-lg text-[#8b949e] max-w-2xl">
            See exactly how Student Government allocates and spends your student fees.
            Our goal: maximum transparency, minimum waste, rapid response to student needs.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
            <p className="text-4xl font-mono font-bold text-[#3fb950]">{stats.utilizationRate}%</p>
            <p className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mt-2">Budget Utilization</p>
            <p className="text-xs text-[#8b949e] mt-2">How much of allocated funds are actively spent</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
            <p className="text-4xl font-mono font-bold text-[#00d4ff]">{stats.orgCount}</p>
            <p className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mt-2">Organizations Funded</p>
            <p className="text-xs text-[#8b949e] mt-2">Student orgs receiving SG funding this semester</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
            <p className="text-4xl font-mono font-bold text-[#a371f7]">${stats.wasteReduction.reallocatedFunds.toLocaleString()}</p>
            <p className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mt-2">Funds Reallocated</p>
            <p className="text-xs text-[#8b949e] mt-2">Unused funds redirected to high-impact areas</p>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
            <p className="text-4xl font-mono font-bold text-[#d29922]">{stats.wasteReduction.avgProcessingHours}h</p>
            <p className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mt-2">Avg Processing Time</p>
            <p className="text-xs text-[#8b949e] mt-2">Time from request to decision</p>
          </div>
        </div>

        {/* Budget Overview Visual */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Allocation Chart */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-1 bg-[#00d4ff] rounded-full" />
              <h2 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Overall Budget Allocation</h2>
            </div>
            <div className="flex items-center justify-center py-6">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#21262d" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40" fill="none" stroke="#00d4ff" strokeWidth="10"
                    strokeDasharray={`${((budgetData?.allocated || 0) / (budgetData?.total || 1)) * 251.2} 251.2`}
                    className="transition-all duration-500"
                  />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="#21262d" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="30" fill="none" stroke="#3fb950" strokeWidth="8"
                    strokeDasharray={`${((budgetData?.spent || 0) / (budgetData?.total || 1)) * 188.4} 188.4`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-mono font-bold text-[#f0f6fc]">
                      ${((budgetData?.total || 0) / 1000).toFixed(0)}k
                    </p>
                    <p className="text-[10px] text-[#6e7681] uppercase">total budget</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#00d4ff]" />
                <span className="text-xs text-[#8b949e]">Allocated (${((budgetData?.allocated || 0) / 1000).toFixed(1)}k)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#3fb950]" />
                <span className="text-xs text-[#8b949e]">Spent (${((budgetData?.spent || 0) / 1000).toFixed(1)}k)</span>
              </div>
            </div>
          </div>

          {/* Waste Reduction Impact */}
          <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 bg-[#3fb950] rounded-full animate-pulse" />
              <h2 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Waste Reduction Impact</h2>
            </div>
            <p className="text-sm text-[#8b949e] mb-6">
              Our AI-assisted funding system and mid-semester reallocation engine help us reduce waste and maximize impact.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 px-4 bg-[#0d1117] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#f0f6fc]">Duplicate Requests Prevented</p>
                  <p className="text-xs text-[#6e7681]">AI detects similar recent requests</p>
                </div>
                <span className="text-2xl font-mono font-bold text-[#00d4ff]">{stats.wasteReduction.duplicatesPrevented}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-[#0d1117] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#f0f6fc]">Unused Funds Recovered</p>
                  <p className="text-xs text-[#6e7681]">Mid-semester reallocation</p>
                </div>
                <span className="text-2xl font-mono font-bold text-[#3fb950]">${stats.wasteReduction.unusedRecovered.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-[#0d1117] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#f0f6fc]">Fast-Tracked Requests</p>
                  <p className="text-xs text-[#6e7681]">Processed within 24 hours</p>
                </div>
                <span className="text-2xl font-mono font-bold text-[#a371f7]">{stats.wasteReduction.fastProcessed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spending by Category */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-1 bg-[#00d4ff] rounded-full" />
            <h2 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Spending by Category</h2>
          </div>
          <div className="space-y-4">
            {(budgetData?.categories || []).map(cat => {
              const utilization = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#f0f6fc]">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                        utilization > 90 ? 'bg-[#3fb950]/20 text-[#3fb950]' :
                        utilization > 50 ? 'bg-[#00d4ff]/20 text-[#00d4ff]' :
                        'bg-[#d29922]/20 text-[#d29922]'
                      }`}>{Math.round(utilization)}% used</span>
                      <span className="text-sm font-mono text-[#8b949e]">${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${
                      utilization > 90 ? 'bg-[#3fb950]' :
                      utilization > 50 ? 'bg-[#00d4ff]' :
                      'bg-[#d29922]'
                    }`} style={{ width: `${Math.min(100, utilization)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Reallocations */}
        {(budgetData?.approvedReallocations || []).length > 0 && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 bg-[#a371f7] rounded-full" />
              <h2 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Recent Fund Reallocations</h2>
            </div>
            <p className="text-sm text-[#8b949e] mb-4">
              We actively move unused funds to where they're needed most. Here are recent reallocations:
            </p>
            <div className="space-y-3">
              {(budgetData.approvedReallocations || []).slice(-5).map(r => (
                <div key={r.id} className="flex items-center justify-between py-3 px-4 bg-[#0d1117] rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#8b949e]">{r.fromCategory || r.fromOrg}</span>
                    <span className="text-[#6e7681]">→</span>
                    <span className="text-sm font-medium text-[#f0f6fc]">{r.toCategory}</span>
                  </div>
                  <span className="font-mono font-semibold text-[#a371f7]">+${r.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rapid Funding Request */}
        <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full" />
                <h2 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Rapid Funding Request</h2>
              </div>
              <p className="text-sm text-[#8b949e]">
                Need funding for your organization? Submit a request and our AI-assisted system will score and route it for fast review.
              </p>
            </div>
            <button
              onClick={() => setShowRequestForm(!showRequestForm)}
              className="px-5 py-2.5 bg-[#00d4ff]/10 border border-[#00d4ff]/50 rounded-lg text-[#00d4ff] font-medium text-sm hover:bg-[#00d4ff]/20 hover:border-[#00d4ff] transition-all"
            >
              {showRequestForm ? 'Hide Form' : 'Submit Request'}
            </button>
          </div>

          {showRequestForm && (
            <form onSubmit={handleSubmitRequest} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6 space-y-4">
              {submitStatus && (
                <div className={`px-4 py-3 rounded-lg text-sm ${
                  submitStatus.type === 'success' ? 'bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950]' :
                  'bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149]'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">Organization Name *</label>
                  <input
                    type="text"
                    value={requestForm.orgName}
                    onChange={(e) => setRequestForm({ ...requestForm, orgName: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm"
                    placeholder="Your registered organization name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">Requested Amount ($) *</label>
                  <input
                    type="number"
                    value={requestForm.amount}
                    onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] text-sm font-mono"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">Category *</label>
                  <select
                    value={requestForm.category}
                    onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })}
                    className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff] text-sm"
                  >
                    {(budgetCategories || ['Events', 'Travel', 'Merch', 'Programming', 'Equipment', 'Marketing', 'Food & Catering', 'Speakers & Guests', 'Supplies', 'Other']).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">SG Priority Area *</label>
                  <select
                    value={requestForm.priority}
                    onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff] text-sm"
                  >
                    {(sgPriorities || ['Student Wellness', 'Basic Needs', 'Academic Support', 'Diversity & Inclusion', 'Sustainability', 'Community Building', 'Leadership Development', 'Crisis Response']).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">Urgency</label>
                  <select
                    value={requestForm.urgency}
                    onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                    className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-1 focus:ring-[#00d4ff] text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High (Crisis/Time-Sensitive)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">Event/Initiative Description *</label>
                <textarea
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] resize-none focus:ring-1 focus:ring-[#00d4ff] text-sm"
                  placeholder="Brief description of what this funding is for..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-2">Impact Justification * (Improves AI Score)</label>
                <textarea
                  value={requestForm.impactJustification}
                  onChange={(e) => setRequestForm({ ...requestForm, impactJustification: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg text-[#f0f6fc] placeholder-[#6e7681] resize-none focus:ring-1 focus:ring-[#00d4ff] text-sm"
                  placeholder="Explain the expected impact: How many students will benefit? What outcomes do you expect? How does this align with SG priorities?"
                />
                <p className="text-[10px] text-[#6e7681] mt-1">Tip: Detailed justifications (20+ words) receive higher AI scores</p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#00d4ff]/10 border border-[#00d4ff]/50 rounded-lg text-[#00d4ff] font-medium text-sm hover:bg-[#00d4ff]/20 hover:border-[#00d4ff] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all"
                >
                  Submit Funding Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="px-6 py-3 bg-[#21262d] border border-[#30363d] rounded-lg text-[#8b949e] font-medium text-sm hover:border-[#8b949e] transition-all"
                >
                  Cancel
                </button>
                <p className="text-xs text-[#6e7681] ml-auto">Rate limit: 10 requests per org per week</p>
              </div>
            </form>
          )}
        </div>

        {/* Verification Guide */}
        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6 text-center">
          <p className="text-sm text-[#8b949e] mb-4">
            <span className="text-[#00d4ff]">●</span> Public data model — anyone can verify allocation transparency
          </p>
          <p className="text-xs text-[#6e7681]">
            Questions about budget allocations? Contact <a href="mailto:student.government@unc.edu" className="text-[#00d4ff] hover:underline">student.government@unc.edu</a>
          </p>
        </div>
      </div>
    </Layout>
  )
}
