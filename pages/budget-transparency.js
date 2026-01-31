import { useState, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../lib/store'
import { sampleBudgetLineItems } from '../lib/data'
import {
  BUDGET_CATEGORIES,
  exportLineItemsToCSV,
  generateAuditReport,
  calculateWasteReductionStats,
} from '../lib/budgetEngine'

// ==========================================
// PUBLIC BUDGET TRANSPARENCY PAGE
// ==========================================

export default function BudgetTransparency() {
  const { budgetLineItems, budgetData, reallocations } = useApp()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('overview')

  // Use sample data if no real data exists
  const displayLineItems = budgetLineItems?.length > 0 ? budgetLineItems : sampleBudgetLineItems

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAllocated = displayLineItems.reduce((sum, i) => sum + (i.approved || 0), 0)
    const totalSpent = displayLineItems.reduce((sum, i) => sum + (i.spent || 0), 0)
    const totalRemaining = totalAllocated - totalSpent
    const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0

    // Category breakdown
    const categoryStats = {}
    for (const item of displayLineItems) {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = { allocated: 0, spent: 0, count: 0 }
      }
      categoryStats[item.category].allocated += item.approved || 0
      categoryStats[item.category].spent += item.spent || 0
      categoryStats[item.category].count++
    }

    return {
      totalAllocated,
      totalSpent,
      totalRemaining,
      utilizationRate,
      categoryStats,
      lineItemCount: displayLineItems.length,
    }
  }, [displayLineItems])

  // Filter line items by category
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return displayLineItems
    return displayLineItems.filter(item => item.category === selectedCategory)
  }, [displayLineItems, selectedCategory])

  // Export CSV handler
  const handleExportCSV = () => {
    const csv = exportLineItemsToCSV(displayLineItems)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sg-budget-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Head>
        <title>Budget Transparency | Project Bold</title>
        <meta name="description" content="Transparent view of Student Government budget allocations, spending, and fund utilization." />
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
              <div className="flex gap-3">
                <Link
                  href="/funding-request"
                  className="px-4 py-2 bg-[#00d4ff] text-[#0d1117] rounded-lg text-sm font-semibold hover:bg-[#00d4ff]/90 transition-all"
                >
                  Request Funding
                </Link>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-sm text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#00d4ff] transition-all"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Demo Banner */}
          <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg p-4 mb-8">
            <p className="text-[#00d4ff] text-sm">
              <strong>DEMO MODE:</strong> This page displays sample budget data for demonstration purposes.
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                  {Object.entries(stats.categoryStats).map(([catId, catStats]) => {
                    const category = BUDGET_CATEGORIES.find(c => c.id === catId)
                    const utilization = catStats.allocated > 0 ? (catStats.spent / catStats.allocated) * 100 : 0
                    return (
                      <div key={catId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category?.color || '#6e7681' }} />
                            <span className="text-[#f0f6fc] font-medium">{category?.name || catId}</span>
                            <span className="text-xs text-[#6e7681]">({catStats.count} items)</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-mono text-[#8b949e]">
                              ${catStats.spent.toLocaleString()} / ${catStats.allocated.toLocaleString()}
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
                              backgroundColor: category?.color || '#6e7681',
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

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-[#30363d]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-[#6e7681]">
                Data updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <div className="flex gap-4">
                <Link href="/funding-request" className="text-sm text-[#00d4ff] hover:underline">
                  Request Funding
                </Link>
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
