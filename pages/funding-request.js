import { useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../lib/store'
import { BUDGET_CATEGORIES } from '../lib/budgetEngine'

// ==========================================
// PUBLIC FUNDING REQUEST PAGE
// Redirects users to Heels Life for requests
// Admin manages the public budget ledger
// ==========================================

export default function FundingRequest() {
  const { budgetLineItems, fundingRequests } = useApp()

  const displayLineItems = budgetLineItems || []

  const budgetStats = useMemo(() => {
    const categoryStats = {}
    for (const cat of BUDGET_CATEGORIES) {
      categoryStats[cat.id] = {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        allocated: 0,
        spent: 0,
      }
    }
    for (const item of displayLineItems) {
      if (categoryStats[item.category]) {
        categoryStats[item.category].allocated += item.approved || 0
        categoryStats[item.category].spent += item.spent || 0
      }
    }
    const totalAllocated = Object.values(categoryStats).reduce((sum, c) => sum + c.allocated, 0)
    const totalSpent = Object.values(categoryStats).reduce((sum, c) => sum + c.spent, 0)

    return {
      categories: Object.values(categoryStats),
      totalAllocated,
      totalSpent,
      totalRemaining: totalAllocated - totalSpent,
      utilizationRate: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
    }
  }, [displayLineItems])

  return (
    <>
      <Head>
        <title>Funding Requests | Project Bold</title>
        <meta name="description" content="View the Student Government budget and learn how to submit funding requests through Heels Life." />
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
                <h1 className="text-[#f0f6fc] text-lg font-bold">Funding Requests</h1>
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
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Budget Overview */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-[#f0f6fc] mb-4">Current Budget Status</h2>

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

                <h3 className="text-sm font-semibold text-[#f0f6fc] mb-3">By Category</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {budgetStats.categories.filter(c => c.allocated > 0).map(cat => {
                    const utilization = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0
                    return (
                      <div key={cat.id} className="p-3 rounded-lg bg-[#0d1117]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-sm text-[#8b949e]">{cat.name}</span>
                          </div>
                          <span className="text-xs font-mono text-[#6e7681]">
                            ${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(utilization, 100)}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Heels Life Redirect */}
            <div className="lg:col-span-3">
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8">
                <h2 className="text-xl font-semibold text-[#f0f6fc] mb-2">Submit a Funding Request</h2>
                <p className="text-[#8b949e] text-sm mb-8">
                  All funding requests for student organizations are processed through Heels Life, UNC&apos;s official student engagement platform.
                </p>

                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6 mb-8">
                  <h3 className="text-sm font-semibold text-[#f0f6fc] mb-4">How to Request Funding</h3>
                  <ol className="text-sm text-[#8b949e] space-y-4 list-decimal list-inside">
                    <li>
                      <span className="text-[#f0f6fc] font-medium">Log into Heels Life</span>
                      <p className="text-[#6e7681] ml-5 mt-1">Use your UNC ONYEN credentials at heelslife.unc.edu</p>
                    </li>
                    <li>
                      <span className="text-[#f0f6fc] font-medium">Navigate to your organization</span>
                      <p className="text-[#6e7681] ml-5 mt-1">Find your registered student organization page</p>
                    </li>
                    <li>
                      <span className="text-[#f0f6fc] font-medium">Submit a funding request</span>
                      <p className="text-[#6e7681] ml-5 mt-1">Use the Finance tab to submit your request with supporting details</p>
                    </li>
                    <li>
                      <span className="text-[#f0f6fc] font-medium">Track your request</span>
                      <p className="text-[#6e7681] ml-5 mt-1">Monitor approval status directly in Heels Life</p>
                    </li>
                  </ol>
                </div>

                <a
                  href="https://heelslife.unc.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-6 py-3 bg-[#00d4ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#00d4ff]/90 transition-all text-center"
                >
                  Go to Heels Life
                </a>

                <p className="text-xs text-[#6e7681] text-center mt-4">
                  Questions about funding? Contact the Finance Committee at sg-finance@unc.edu
                </p>
              </div>

              {/* View-only info */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mt-6">
                <h3 className="text-sm font-semibold text-[#f0f6fc] mb-3">Public Budget Ledger</h3>
                <p className="text-sm text-[#8b949e] mb-4">
                  View all approved budget line items, spending, and allocation details on our transparency page.
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/budget"
                    className="flex-1 px-4 py-2.5 bg-[#21262d] border border-[#30363d] rounded-lg text-[#f0f6fc] hover:bg-[#30363d] transition-all text-sm font-medium text-center"
                  >
                    Budget Overview
                  </Link>
                  <Link
                    href="/budget-transparency"
                    className="flex-1 px-4 py-2.5 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-all text-sm font-medium text-center"
                  >
                    Full Transparency Report
                  </Link>
                </div>
              </div>
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
