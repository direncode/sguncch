import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import { useApp } from '../lib/store'
import { departments, getOverallProgress, getStatusCounts } from '../lib/data'

export default function Home() {
  const [selectedDept, setSelectedDept] = useState(null)
  const [time, setTime] = useState(new Date())
  const { policies, budgetData, announcements, activityLog, quickStats } = useApp()
  const overallProgress = getOverallProgress(policies)
  const statusCounts = getStatusCounts(policies)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const filteredPolicies = selectedDept
    ? policies.filter(p => p.department === selectedDept)
    : policies

  const deptLinks = {
    'wellness': '/wellness',
    'basic-needs': '/basic-needs',
    'academic': '/academic',
    'civic': '/civic',
    'communications': '/communications',
    'environmental': '/environmental',
  }

  const recentActivity = activityLog?.slice(0, 5) || []
  const pinnedAnnouncements = announcements?.filter(a => a.pinned) || []

  return (
    <Layout>
      <Head>
        <title>Command Center | Project Bold</title>
        <meta name="description" content="Project Bold Operations Platform - UNC Student Government" />
      </Head>

      {/* Hero Command Center */}
      <div className="relative bg-[#0d1117] border-b border-[#30363d] overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(#21262d 1px, transparent 1px), linear-gradient(90deg, #21262d 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative max-w-[1600px] mx-auto px-6 py-12">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-[#3fb950]/10 border border-[#3fb950] rounded text-[10px] font-semibold text-[#3fb950] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse shadow-[0_0_8px_#3fb950]" />
                  Live
                </div>
                <span className="text-[10px] text-[#6e7681] font-mono">Last updated: {time.toLocaleTimeString()}</span>
              </div>
              <h1 className="text-4xl font-bold text-[#f0f6fc] tracking-tight mb-2">Operations Command</h1>
              <p className="text-[#8b949e] max-w-xl">
                Real-time monitoring of all 40 policy initiatives across 8 departments.
                Building a Carolina where every student thrives.
              </p>
            </div>
            <div className="text-right hidden lg:block">
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-1">Session</p>
              <p className="text-[#00d4ff] font-mono text-sm">SG-2026-BOLD</p>
              <p className="text-[10px] text-[#6e7681] mt-2">First, Best, For All</p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-[#30363d] rounded-lg overflow-hidden">
            <div className="bg-[#161b22] p-5">
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-2">Overall Progress</p>
              <p className="text-4xl font-bold font-mono text-[#00d4ff]">{overallProgress}%</p>
              <div className="mt-3 h-1 bg-[#21262d] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00d4ff] to-[#388bfd] rounded-full" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
            <div className="bg-[#161b22] p-5">
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-2">Active Policies</p>
              <p className="text-4xl font-bold font-mono text-[#f0f6fc]">{policies.length}</p>
              <p className="text-xs text-[#8b949e] mt-1">across {departments.length} depts</p>
            </div>
            <div className="bg-[#161b22] p-5">
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-2">Completed</p>
              <p className="text-4xl font-bold font-mono text-[#3fb950]">{statusCounts.completed}</p>
              <p className="text-xs text-[#8b949e] mt-1">initiatives done</p>
            </div>
            <div className="bg-[#161b22] p-5">
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-2">In Progress</p>
              <p className="text-4xl font-bold font-mono text-[#d29922]">{statusCounts.in_progress}</p>
              <p className="text-xs text-[#8b949e] mt-1">active now</p>
            </div>
            <div className="bg-[#161b22] p-5">
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-2">Students Reached</p>
              <p className="text-4xl font-bold font-mono text-[#a371f7]">{(quickStats?.totalStudentsReached || 0).toLocaleString()}</p>
              <p className="text-xs text-[#8b949e] mt-1">this semester</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Pinned Announcements */}
        {pinnedAnnouncements.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[#d29922]">★</span>
              <h2 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Pinned Announcements</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {pinnedAnnouncements.slice(0, 2).map(a => (
                <div key={a.id} className="bg-[#161b22] border border-[#d29922]/30 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded ${
                      a.category === 'urgent' ? 'bg-[#f85149]/10 text-[#f85149] border border-[#f85149]' :
                      a.category === 'milestone' ? 'bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]' :
                      'bg-[#21262d] text-[#8b949e] border border-[#30363d]'
                    }`}>{a.category}</span>
                    <span className="text-[10px] text-[#6e7681] font-mono">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-[#f0f6fc] mb-1">{a.title}</h3>
                  <p className="text-sm text-[#8b949e] line-clamp-2">{a.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Departments & Progress */}
          <div className="lg:col-span-2 space-y-8">
            {/* Department Status Grid */}
            <div>
              <h2 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest pb-3 border-b border-[#21262d] mb-4">Department Status</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {departments.map(dept => {
                  const deptPolicies = policies.filter(p => p.department === dept.id)
                  const avgProgress = Math.round(deptPolicies.reduce((sum, p) => sum + p.progress, 0) / deptPolicies.length) || 0
                  const completed = deptPolicies.filter(p => p.status === 'completed').length

                  return (
                    <Link
                      key={dept.id}
                      href={deptLinks[dept.id]}
                      className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#00d4ff]/50 hover:bg-[#161b22]/80 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{dept.icon}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          avgProgress >= 75 ? 'bg-[#3fb950] shadow-[0_0_8px_#3fb950]' :
                          avgProgress >= 50 ? 'bg-[#d29922] shadow-[0_0_8px_#d29922]' :
                          avgProgress >= 25 ? 'bg-[#db6d28] shadow-[0_0_8px_#db6d28]' :
                          'bg-[#6e7681]'
                        }`} />
                      </div>
                      <h3 className="font-semibold text-[#f0f6fc] text-sm mb-1 group-hover:text-[#00d4ff] transition">{dept.name}</h3>
                      <div className="flex items-center justify-between text-[10px] text-[#6e7681] mb-2">
                        <span>{deptPolicies.length} policies</span>
                        <span className="font-mono">{avgProgress}%</span>
                      </div>
                      <div className="h-1 bg-[#21262d] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${
                          avgProgress >= 75 ? 'bg-[#3fb950]' :
                          avgProgress >= 50 ? 'bg-[#d29922]' :
                          avgProgress >= 25 ? 'bg-[#db6d28]' :
                          'bg-[#6e7681]'
                        }`} style={{ width: `${avgProgress}%` }} />
                      </div>
                      <p className="text-[10px] text-[#6e7681] mt-2">{completed}/{deptPolicies.length} completed</p>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Policy Feed */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#21262d] mb-4">
                <h2 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest">Policy Registry</h2>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSelectedDept(null)}
                    className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded transition ${
                      !selectedDept ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]' : 'text-[#8b949e] border border-[#30363d] hover:bg-[#21262d]'
                    }`}
                  >
                    All
                  </button>
                  {departments.slice(0, 4).map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDept(d.id)}
                      className={`px-3 py-1.5 text-[10px] font-medium rounded transition hidden md:block ${
                        selectedDept === d.id ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]' : 'text-[#8b949e] border border-[#30363d] hover:bg-[#21262d]'
                      }`}
                    >
                      {d.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredPolicies.slice(0, 8).map(policy => {
                  const dept = departments.find(d => d.id === policy.department)
                  return (
                    <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#484f58] transition">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>{dept?.icon}</span>
                          <span className="text-[10px] text-[#6e7681] uppercase tracking-wider">{dept?.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${
                          policy.status === 'completed' ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]' :
                          policy.status === 'in_progress' ? 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]' :
                          'bg-[#21262d] text-[#6e7681] border-[#30363d]'
                        }`}>
                          {policy.status === 'in_progress' ? 'Active' : policy.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-[#f0f6fc] mb-1">{policy.title}</h3>
                      <p className="text-sm text-[#8b949e] mb-3 line-clamp-1">{policy.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="h-1 bg-[#21262d] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${
                              policy.status === 'completed' ? 'bg-[#3fb950]' :
                              policy.status === 'in_progress' ? 'bg-gradient-to-r from-[#00d4ff] to-[#388bfd]' :
                              'bg-[#6e7681]'
                            }`} style={{ width: `${policy.progress}%` }} />
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[#8b949e]">{policy.progress}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Activity & Stats */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div>
              <h2 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest pb-3 border-b border-[#21262d] mb-4">Platform Metrics</h2>
              <div className="space-y-3">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#6e7681] uppercase tracking-wider">Active Initiatives</span>
                    <span className="text-lg font-bold font-mono text-[#00d4ff]">{quickStats?.activeInitiatives || 0}</span>
                  </div>
                  <div className="h-1 bg-[#21262d] rounded-full">
                    <div className="h-full w-3/4 bg-[#00d4ff] rounded-full" />
                  </div>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#6e7681] uppercase tracking-wider">Events This Month</span>
                    <span className="text-lg font-bold font-mono text-[#a371f7]">{quickStats?.eventsThisMonth || 0}</span>
                  </div>
                  <div className="h-1 bg-[#21262d] rounded-full">
                    <div className="h-full w-1/2 bg-[#a371f7] rounded-full" />
                  </div>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#6e7681] uppercase tracking-wider">Feedback Received</span>
                    <span className="text-lg font-bold font-mono text-[#3fb950]">{quickStats?.feedbackReceived || 0}</span>
                  </div>
                  <div className="h-1 bg-[#21262d] rounded-full">
                    <div className="h-full w-2/3 bg-[#3fb950] rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Overview */}
            <div>
              <h2 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest pb-3 border-b border-[#21262d] mb-4">Budget Allocation</h2>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-1">Total</p>
                    <p className="text-lg font-bold font-mono text-[#f0f6fc]">${(budgetData.total / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-1">Allocated</p>
                    <p className="text-lg font-bold font-mono text-[#00d4ff]">${(budgetData.allocated / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-1">Spent</p>
                    <p className="text-lg font-bold font-mono text-[#3fb950]">${(budgetData.spent / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                <div className="h-2 bg-[#21262d] rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#3fb950]" style={{ width: `${(budgetData.spent / budgetData.total) * 100}%` }} />
                  <div className="h-full bg-[#00d4ff]" style={{ width: `${((budgetData.allocated - budgetData.spent) / budgetData.total) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-[#6e7681]">
                  <span>Spent: {((budgetData.spent / budgetData.total) * 100).toFixed(0)}%</span>
                  <span>Remaining: {(((budgetData.total - budgetData.spent) / budgetData.total) * 100).toFixed(0)}%</span>
                </div>
                <Link href="/communications" className="flex items-center justify-center gap-2 mt-4 py-2 border border-[#30363d] rounded text-xs text-[#8b949e] hover:text-[#00d4ff] hover:border-[#00d4ff] transition">
                  <span>→</span> View Full Transparency Dashboard
                </Link>
              </div>
            </div>

            {/* Activity Feed */}
            <div>
              <h2 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest pb-3 border-b border-[#21262d] mb-4">Activity Feed</h2>
              <div className="space-y-3">
                {recentActivity.length > 0 ? recentActivity.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-[#21262d]">
                    <div className="w-2 h-2 rounded-full bg-[#00d4ff] mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-[#8b949e] truncate">{entry.details}</p>
                      <p className="text-[10px] text-[#6e7681] font-mono mt-0.5">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-[#6e7681] text-center py-4">No recent activity</p>
                )}
              </div>
            </div>

            {/* Quick Access */}
            <div>
              <h2 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest pb-3 border-b border-[#21262d] mb-4">Quick Access</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/wellness" className="bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-lg p-4 hover:border-[#3fb950] transition-all group">
                  <span className="text-2xl">🆘</span>
                  <p className="font-medium text-[#f0f6fc] text-sm mt-2 group-hover:text-[#3fb950] transition">Wellness</p>
                  <p className="text-[10px] text-[#6e7681] mt-0.5">Crisis Support</p>
                </Link>
                <Link href="/basic-needs" className="bg-[#d29922]/10 border border-[#d29922]/30 rounded-lg p-4 hover:border-[#d29922] transition-all group">
                  <span className="text-2xl">🍎</span>
                  <p className="font-medium text-[#f0f6fc] text-sm mt-2 group-hover:text-[#d29922] transition">Basic Needs</p>
                  <p className="text-[10px] text-[#6e7681] mt-0.5">Food & Housing</p>
                </Link>
                <Link href="/civic" className="bg-[#a371f7]/10 border border-[#a371f7]/30 rounded-lg p-4 hover:border-[#a371f7] transition-all group">
                  <span className="text-2xl">🗳️</span>
                  <p className="font-medium text-[#f0f6fc] text-sm mt-2 group-hover:text-[#a371f7] transition">Civic</p>
                  <p className="text-[10px] text-[#6e7681] mt-0.5">Voter Resources</p>
                </Link>
                <Link href="/communications" className="bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg p-4 hover:border-[#00d4ff] transition-all group">
                  <span className="text-2xl">📊</span>
                  <p className="font-medium text-[#f0f6fc] text-sm mt-2 group-hover:text-[#00d4ff] transition">Transparency</p>
                  <p className="text-[10px] text-[#6e7681] mt-0.5">Full Dashboard</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}
