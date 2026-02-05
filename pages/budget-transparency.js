import { useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { Input, Select, Textarea } from '../components/FormInput'
import { useApp } from '../lib/store'
import { budgetCategories, sgPriorities } from '../lib/data'

export default function BudgetTransparencyPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const { budgetData, getBudgetSummaryStats, submitFundingRequest, checkRateLimit } = useApp()

  const [requestForm, setRequestForm] = useState({
    orgName: '',
    amount: '',
    category: 'Events',
    description: '',
    impactJustification: '',
    priority: 'Community Building',
    urgency: 'normal'
  })

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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'spending', label: 'Spending by Category' },
    { id: 'reallocations', label: 'Reallocations' },
    { id: 'request', label: 'Request Funding' },
  ]

  const handleFormSubmit = (e) => {
    e.preventDefault()

    if (!checkRateLimit || !checkRateLimit(requestForm.orgName)) {
      setSubmitted({ type: 'error', message: 'Rate limit exceeded. Maximum 10 requests per organization per week.' })
      return
    }

    const result = submitFundingRequest({
      ...requestForm,
      amount: parseFloat(requestForm.amount) || 0
    })

    if (result?.success) {
      setSubmitted({ type: 'success', message: `Request submitted! AI Score: ${result.request.aiScore}/100. You'll hear back within 24-48 hours.` })
      setRequestForm({
        orgName: '',
        amount: '',
        category: 'Events',
        description: '',
        impactJustification: '',
        priority: 'Community Building',
        urgency: 'normal'
      })
      setShowRequestForm(false)
    } else {
      setSubmitted({ type: 'error', message: result?.error || 'Failed to submit request. Please try again.' })
    }
  }

  return (
    <Layout>
      <Head>
        <title>Budget Transparency | Project Bold</title>
      </Head>

      {/* Hero */}
      <div className="relative bg-[#0a0e14] border-b border-[#30363d] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00d4ff]/10 blur-3xl rounded-full" />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <p className="text-[#00d4ff] text-xs font-medium tracking-widest uppercase mb-4">Financial Transparency</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0f6fc] tracking-tight mb-4">
            Budget Transparency
          </h1>
          <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed">
            See exactly how Student Government allocates and spends your student fees.
            Maximum transparency, minimum waste, rapid response to student needs.
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
                    ? 'border-[#00d4ff] text-[#00d4ff]'
                    : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="bg-[#0d1117] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {submitted && (
            <div className={`mb-8 bg-[#161b22] border rounded-lg p-5 ${
              submitted.type === 'success' ? 'border-[#3fb950]' : 'border-[#f85149]'
            }`}>
              <p className={`font-medium ${submitted.type === 'success' ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                {submitted.message}
              </p>
              <button onClick={() => setSubmitted(null)} className="text-[#00d4ff] text-sm font-medium mt-3 hover:underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Budget Overview</h2>

              {/* Key Metrics */}
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2.5 py-1 rounded text-xs font-mono border bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]">
                      UTILIZATION
                    </span>
                  </div>
                  <p className="text-3xl font-mono font-bold text-[#3fb950]">{stats.utilizationRate}%</p>
                  <p className="text-xs text-[#8b949e] mt-2">Budget actively spent</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2.5 py-1 rounded text-xs font-mono border bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]">
                      FUNDED
                    </span>
                  </div>
                  <p className="text-3xl font-mono font-bold text-[#00d4ff]">{stats.orgCount}</p>
                  <p className="text-xs text-[#8b949e] mt-2">Organizations this semester</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2.5 py-1 rounded text-xs font-mono border bg-[#a371f7]/10 text-[#a371f7] border-[#a371f7]">
                      REALLOCATED
                    </span>
                  </div>
                  <p className="text-3xl font-mono font-bold text-[#a371f7]">${stats.wasteReduction.reallocatedFunds.toLocaleString()}</p>
                  <p className="text-xs text-[#8b949e] mt-2">Redirected to high-impact</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2.5 py-1 rounded text-xs font-mono border bg-[#d29922]/10 text-[#d29922] border-[#d29922]">
                      PROCESSING
                    </span>
                  </div>
                  <p className="text-3xl font-mono font-bold text-[#d29922]">{stats.wasteReduction.avgProcessingHours}h</p>
                  <p className="text-xs text-[#8b949e] mt-2">Avg request to decision</p>
                </div>
              </div>

              {/* Visual Budget Breakdown */}
              <div className="grid lg:grid-cols-2 gap-8 mb-10">
                {/* Pie Chart Representation */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-6">Allocation vs Spend</h3>
                  <div className="flex items-center justify-center py-4">
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
                          <p className="text-[10px] text-[#6e7681] uppercase tracking-wider">total budget</p>
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
                  </div>
                </div>

                {/* Waste Reduction Impact */}
                <div className="bg-[#161b22] border border-[#3fb950] rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-6">Waste Reduction Impact</h3>
                  <p className="text-sm text-[#8b949e] mb-6">
                    Our AI-assisted funding system and mid-semester reallocation engine help us reduce waste and maximize impact.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 px-4 bg-[#21262d] rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#f0f6fc]">Duplicate Requests Prevented</p>
                        <p className="text-xs text-[#6e7681]">AI detects similar recent requests</p>
                      </div>
                      <span className="text-xl font-mono font-bold text-[#00d4ff]">{stats.wasteReduction.duplicatesPrevented}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 bg-[#21262d] rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#f0f6fc]">Unused Funds Recovered</p>
                        <p className="text-xs text-[#6e7681]">Mid-semester reallocation</p>
                      </div>
                      <span className="text-xl font-mono font-bold text-[#3fb950]">${stats.wasteReduction.unusedRecovered.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 bg-[#21262d] rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#f0f6fc]">Fast-Tracked Requests</p>
                        <p className="text-xs text-[#6e7681]">Processed within 24 hours</p>
                      </div>
                      <span className="text-xl font-mono font-bold text-[#a371f7]">{stats.wasteReduction.fastProcessed}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#00d4ff] transition-colors cursor-pointer"
                  onClick={() => setActiveTab('spending')}>
                  <h4 className="font-semibold text-[#f0f6fc] mb-1">View Spending Breakdown</h4>
                  <p className="text-sm text-[#8b949e]">See how funds are distributed across categories</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#00d4ff] transition-colors cursor-pointer"
                  onClick={() => setActiveTab('reallocations')}>
                  <h4 className="font-semibold text-[#f0f6fc] mb-1">View Reallocations</h4>
                  <p className="text-sm text-[#8b949e]">See recent fund redistributions</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#00d4ff] transition-colors cursor-pointer"
                  onClick={() => setActiveTab('request')}>
                  <h4 className="font-semibold text-[#f0f6fc] mb-1">Request Funding</h4>
                  <p className="text-sm text-[#8b949e]">Submit a rapid funding request</p>
                </div>
              </div>
            </div>
          )}

          {/* Spending by Category Tab */}
          {activeTab === 'spending' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Spending by Category</h2>
              <p className="text-[#8b949e] mb-8">How SG funds are allocated and spent across major categories</p>

              {/* Category Progress Bars */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-10">
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-6">Category Breakdown</h3>
                <div className="space-y-6">
                  {(budgetData?.categories || []).map(cat => {
                    const utilization = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-[#f0f6fc]">{cat.name}</span>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-mono border ${
                              utilization > 90 ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]' :
                              utilization > 50 ? 'bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]' :
                              'bg-[#d29922]/10 text-[#d29922] border-[#d29922]'
                            }`}>{Math.round(utilization)}%</span>
                            <span className="text-sm font-mono text-[#8b949e]">${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-[#21262d] rounded overflow-hidden">
                          <div className={`h-full rounded transition-all ${
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

              {/* Summary Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-2">Total Budget</p>
                  <p className="text-2xl font-mono font-bold text-[#3fb950]">${(budgetData?.total || 0).toLocaleString()}</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-2">Total Allocated</p>
                  <p className="text-2xl font-mono font-bold text-[#00d4ff]">${(budgetData?.allocated || 0).toLocaleString()}</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-2">Total Spent</p>
                  <p className="text-2xl font-mono font-bold text-[#d29922]">${(budgetData?.spent || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reallocations Tab */}
          {activeTab === 'reallocations' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Fund Reallocations</h2>
              <p className="text-[#8b949e] mb-8">We actively move unused funds to where they're needed most</p>

              {(budgetData?.approvedReallocations || []).length > 0 ? (
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
                  <div className="px-6 py-4 border-b border-[#30363d] flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded text-xs font-mono border bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]">
                      APPROVED
                    </span>
                    <span className="text-sm text-[#8b949e]">Recent fund redistributions</span>
                  </div>
                  <div className="divide-y divide-[#30363d]">
                    {(budgetData.approvedReallocations || []).map(r => (
                      <div key={r.id} className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[100px]">
                            <p className="text-sm text-[#8b949e]">{r.fromCategory || r.fromOrg}</p>
                            <p className="text-[10px] text-[#6e7681] uppercase">From</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-px bg-[#30363d]" />
                            <span className="text-[#6e7681]">→</span>
                            <div className="w-6 h-px bg-[#30363d]" />
                          </div>
                          <div className="text-center min-w-[100px]">
                            <p className="text-sm font-medium text-[#f0f6fc]">{r.toCategory}</p>
                            <p className="text-[10px] text-[#6e7681] uppercase">To</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-[#a371f7] text-lg">+${r.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-12 text-center">
                  <div className="w-12 h-12 bg-[#21262d] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-[#8b949e]">No reallocations yet this semester</p>
                  <p className="text-xs text-[#6e7681] mt-2">Reallocations are made mid-semester when unused funds are identified</p>
                </div>
              )}

              {/* Reallocation Stats */}
              <div className="grid md:grid-cols-2 gap-4 mt-8">
                <div className="bg-[#161b22] border border-[#a371f7] rounded-lg p-5">
                  <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-2">Total Reallocated This Semester</p>
                  <p className="text-3xl font-mono font-bold text-[#a371f7]">${stats.wasteReduction.reallocatedFunds.toLocaleString()}</p>
                </div>
                <div className="bg-[#161b22] border border-[#3fb950] rounded-lg p-5">
                  <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-2">Unused Funds Recovered</p>
                  <p className="text-3xl font-mono font-bold text-[#3fb950]">${stats.wasteReduction.unusedRecovered.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Request Funding Tab */}
          {activeTab === 'request' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Rapid Funding Request</h2>
              <p className="text-[#8b949e] mb-8">Submit a funding request for your organization. Our AI-assisted system scores and routes requests for fast review.</p>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Request Form */}
                <div className="bg-[#161b22] border border-[#00d4ff] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-6">Submit Request</h3>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <Input
                      label="Organization Name"
                      value={requestForm.orgName}
                      onChange={(e) => setRequestForm({ ...requestForm, orgName: e.target.value })}
                      required
                      placeholder="Your registered organization name"
                    />
                    <Input
                      label="Requested Amount ($)"
                      type="number"
                      value={requestForm.amount}
                      onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                      required
                      min="1"
                      placeholder="0"
                    />
                    <Select
                      label="Category"
                      value={requestForm.category}
                      onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })}
                      required
                      options={(budgetCategories || ['Events', 'Travel', 'Merch', 'Programming', 'Equipment', 'Marketing', 'Food & Catering', 'Speakers & Guests', 'Supplies', 'Other']).map(c => ({ value: c, label: c }))}
                    />
                    <Select
                      label="SG Priority Area"
                      value={requestForm.priority}
                      onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
                      required
                      options={(sgPriorities || ['Student Wellness', 'Basic Needs', 'Academic Support', 'Diversity & Inclusion', 'Sustainability', 'Community Building', 'Leadership Development', 'Crisis Response']).map(p => ({ value: p, label: p }))}
                    />
                    <Select
                      label="Urgency"
                      value={requestForm.urgency}
                      onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                      options={[
                        { value: 'normal', label: 'Normal' },
                        { value: 'high', label: 'High (Crisis/Time-Sensitive)' }
                      ]}
                    />
                    <Textarea
                      label="Event/Initiative Description"
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                      required
                      rows={2}
                      placeholder="Brief description of what this funding is for..."
                    />
                    <Textarea
                      label="Impact Justification (Improves AI Score)"
                      value={requestForm.impactJustification}
                      onChange={(e) => setRequestForm({ ...requestForm, impactJustification: e.target.value })}
                      required
                      rows={3}
                      placeholder="How many students will benefit? What outcomes do you expect?"
                    />
                    <p className="text-xs text-[#6e7681]">Tip: Detailed justifications (20+ words) receive higher AI scores</p>

                    <button
                      type="submit"
                      className="w-full bg-[#00d4ff] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#33ddff] transition-colors"
                    >
                      Submit Funding Request
                    </button>
                  </form>
                </div>

                {/* Info Panel */}
                <div className="space-y-6">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">How It Works</h3>
                    <div className="space-y-4">
                      {[
                        { step: 1, title: 'Submit Request', desc: 'Fill out the form with your funding details' },
                        { step: 2, title: 'AI Analysis', desc: 'Our system scores based on priority, impact, and budget' },
                        { step: 3, title: 'Admin Review', desc: 'Requests are queued for one-click approve/deny' },
                        { step: 4, title: 'Notification', desc: "You'll hear back within 24-48 hours" },
                      ].map(item => (
                        <div key={item.step} className="flex gap-3">
                          <div className="w-6 h-6 bg-[#00d4ff] text-[#0d1117] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {item.step}
                          </div>
                          <div>
                            <p className="font-medium text-[#f0f6fc] text-sm">{item.title}</p>
                            <p className="text-xs text-[#8b949e]">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#161b22] border border-[#d29922] rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-2.5 py-1 rounded text-xs font-mono border bg-[#d29922]/10 text-[#d29922] border-[#d29922]">
                        RATE LIMIT
                      </span>
                    </div>
                    <p className="text-sm text-[#8b949e]">
                      Organizations are limited to <strong className="text-[#f0f6fc]">10 requests per week</strong> to ensure fair access and prevent spam.
                    </p>
                  </div>

                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h4 className="font-semibold text-[#f0f6fc] mb-3">What Improves Your AI Score?</h4>
                    <ul className="space-y-2 text-sm text-[#8b949e]">
                      <li className="flex items-center gap-2">
                        <span className="text-[#3fb950]">✓</span> Alignment with SG priorities
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#3fb950]">✓</span> High urgency (wellness/crisis)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#3fb950]">✓</span> Detailed impact justification
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#3fb950]">✓</span> Budget availability
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#f85149]">✗</span> Duplicate recent requests
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-12 bg-[#161b22] border border-[#30363d] rounded-lg p-6 text-center">
            <p className="text-sm text-[#8b949e] mb-2">
              <span className="text-[#00d4ff]">●</span> Public data model — anyone can verify allocation transparency
            </p>
            <p className="text-xs text-[#6e7681]">
              Questions about budget allocations? Contact <a href="mailto:student.government@unc.edu" className="text-[#00d4ff] hover:underline">student.government@unc.edu</a>
            </p>
          </div>
        </div>
      </main>
    </Layout>
  )
}
