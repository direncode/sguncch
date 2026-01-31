import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import { useApp } from '../lib/store'
import { departments, getOverallProgress, getStatusCounts } from '../lib/data'
import { DonutChart, StatusBadge, LiveIndicator } from '../components/FormInput'
import { Editable, EditModeToggle } from '../components/InlineEditor'

// Live Clock Component
const LiveClock = () => {
  const [time, setTime] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Avoid hydration mismatch
  if (!mounted || !time) {
    return (
      <div className="font-mono text-sm text-[#8b949e]">
        <span className="text-[#f0f6fc]">--:--:--</span>
        <span className="mx-2 text-[#30363d]">|</span>
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className="font-mono text-sm text-[#8b949e]">
      <span className="text-[#f0f6fc]">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      <span className="mx-2 text-[#30363d]">|</span>
      <span>{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
    </div>
  )
}

// Animated Counter
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const target = parseInt(value) || 0
    const increment = target / (duration / 16)
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [value, duration])
  return <span>{count.toLocaleString()}</span>
}

export default function Home() {
  const [selectedDept, setSelectedDept] = useState(null)
  const [hoveredPolicy, setHoveredPolicy] = useState(null)
  const { isAdmin, policies, budgetData, announcements, activityLog, quickStats, feedback } = useApp()

  const overallProgress = useMemo(() => getOverallProgress(policies), [policies])
  const statusCounts = useMemo(() => getStatusCounts(policies), [policies])

  const filteredPolicies = selectedDept
    ? policies.filter(p => p.department === selectedDept)
    : policies

  const deptLinks = {
    'wellness': '/wellness',
    'basic-needs': '/basic-needs',
    'academic': '/academic',
    'communications': '/communications',
    'environmental': '/environmental',
  }

  const recentActivity = activityLog?.slice(0, 8) || []
  const pinnedAnnouncements = announcements?.filter(a => a.pinned) || []

  // Department stats for heatmap
  const deptStats = useMemo(() => departments.map(dept => {
    const deptPolicies = policies.filter(p => p.department === dept.id)
    const progress = getOverallProgress(deptPolicies)
    const completed = deptPolicies.filter(p => p.status === 'completed').length
    return { ...dept, progress, completed, total: deptPolicies.length }
  }), [policies])

  return (
    <Layout>
      <Head>
        <title>Operations Dashboard | Project Bold 2026</title>
        <meta name="description" content="Project Bold Operations Platform - UNC Student Government - Real-time tracking of all 40 policy initiatives" />
      </Head>

      {/* Admin Quick Access Banner */}
      {isAdmin && (
        <div className="bg-[#161b22] border-b border-[#30363d] px-6 py-2">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LiveIndicator label="Admin" variant="success" />
              <span className="text-xs text-[#8b949e]"><Editable k="home.admin.loggedIn">Logged in as administrator</Editable></span>
            </div>
            <Link href="/admin" className="text-xs text-[#00d4ff] hover:text-[#58a6ff] transition">
              <Editable k="home.admin.dashboardLink">Open Admin Dashboard</Editable>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Command Center */}
      <div className="relative bg-gradient-to-b from-[#0d1117] via-[#0d1117] to-[#0a0e14] border-b border-[#30363d] overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: 'linear-gradient(#30363d 1px, transparent 1px), linear-gradient(90deg, #30363d 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00d4ff]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#a371f7]/10 rounded-full blur-3xl" />

        <div className="relative max-w-[1600px] mx-auto px-6 py-16">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-12">
            <div>
              <div className="flex items-center gap-4 mb-5">
                <LiveIndicator label="Operations Live" variant="success" />
                <LiveClock />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#f0f6fc] tracking-tight mb-4">
                <Editable k="home.hero.titlePart1">Operations</Editable> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#a371f7]"><Editable k="home.hero.titlePart2">Command</Editable></span>
              </h1>
              <p className="text-lg text-[#8b949e] max-w-2xl">
                <Editable k="home.hero.description">Real-time monitoring of {policies.length} policy initiatives across {departments.length} departments. Building a Carolina where every student thrives.</Editable>
              </p>
            </div>
            <div className="hidden lg:flex items-start gap-3">
              <div className="inline-block bg-[#161b22]/80 backdrop-blur border border-[#30363d] rounded-xl p-5">
                <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-2"><Editable k="home.session.label">Session</Editable></p>
                <p className="text-2xl font-mono font-bold text-[#00d4ff] tracking-wide"><Editable k="home.session.code">SG-2026</Editable></p>
                <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mt-2"><Editable k="home.session.project">Project Bold</Editable></p>
              </div>
            </div>
          </div>

          {/* Hero Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-[#161b22]/80 backdrop-blur border border-[#00d4ff]/30 rounded-xl p-5 relative overflow-hidden group hover:border-[#00d4ff]/60 transition-all">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00d4ff] to-transparent" />
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-3"><Editable k="home.stats.progressLabel">Overall Progress</Editable></p>
              <p className="text-4xl font-bold font-mono text-[#00d4ff]"><AnimatedCounter value={overallProgress} />%</p>
              <div className="mt-3 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00d4ff] to-[#388bfd] rounded-full transition-all duration-1000" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>

            <div className="bg-[#161b22]/80 backdrop-blur border border-[#3fb950]/30 rounded-xl p-5 relative overflow-hidden group hover:border-[#3fb950]/60 transition-all">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3fb950] to-transparent" />
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-3"><Editable k="home.stats.completedLabel">Completed</Editable></p>
              <p className="text-4xl font-bold font-mono text-[#3fb950]"><AnimatedCounter value={statusCounts.completed} /></p>
              <p className="text-xs text-[#6e7681] mt-1"><Editable k="home.stats.completedDesc">initiatives done</Editable></p>
            </div>

            <div className="bg-[#161b22]/80 backdrop-blur border border-[#d29922]/30 rounded-xl p-5 relative overflow-hidden group hover:border-[#d29922]/60 transition-all">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#d29922] to-transparent" />
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-3"><Editable k="home.stats.inProgressLabel">In Progress</Editable></p>
              <p className="text-4xl font-bold font-mono text-[#d29922]"><AnimatedCounter value={statusCounts.in_progress} /></p>
              <p className="text-xs text-[#6e7681] mt-1"><Editable k="home.stats.inProgressDesc">active now</Editable></p>
            </div>

            <div className="bg-[#161b22]/80 backdrop-blur border border-[#a371f7]/30 rounded-xl p-5 relative overflow-hidden group hover:border-[#a371f7]/60 transition-all">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#a371f7] to-transparent" />
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-3"><Editable k="home.stats.studentsLabel">Students Reached</Editable></p>
              <p className="text-4xl font-bold font-mono text-[#a371f7]"><AnimatedCounter value={quickStats?.totalStudentsReached || 0} /></p>
              <p className="text-xs text-[#6e7681] mt-1"><Editable k="home.stats.studentsDesc">this semester</Editable></p>
            </div>

            <div className="bg-[#161b22]/80 backdrop-blur border border-[#f85149]/30 rounded-xl p-5 relative overflow-hidden group hover:border-[#f85149]/60 transition-all">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#f85149] to-transparent" />
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-3"><Editable k="home.stats.eventsLabel">Events</Editable></p>
              <p className="text-4xl font-bold font-mono text-[#f85149]"><AnimatedCounter value={quickStats?.eventsThisMonth || 0} /></p>
              <p className="text-xs text-[#6e7681] mt-1"><Editable k="home.stats.eventsDesc">this month</Editable></p>
            </div>

            <div className="bg-[#161b22]/80 backdrop-blur border border-[#388bfd]/30 rounded-xl p-5 relative overflow-hidden group hover:border-[#388bfd]/60 transition-all">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#388bfd] to-transparent" />
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-3"><Editable k="home.stats.feedbackLabel">Feedback</Editable></p>
              <p className="text-4xl font-bold font-mono text-[#388bfd]"><AnimatedCounter value={feedback?.length || 0} /></p>
              <p className="text-xs text-[#6e7681] mt-1"><Editable k="home.stats.feedbackDesc">responses</Editable></p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-6 py-10">
        {/* Pinned Announcements */}
        {pinnedAnnouncements.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-[#d29922] text-lg">PINNED</span>
                <h2 className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-widest"><Editable k="home.announcements.heading">Important Announcements</Editable></h2>
              </div>
              {isAdmin && (
                <Link href="/admin?tab=announcements" className="text-xs text-[#00d4ff] hover:underline">
                  <Editable k="home.announcements.adminLink">Manage Announcements</Editable>
                </Link>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {pinnedAnnouncements.slice(0, 2).map(a => (
                <div key={a.id} className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#d29922]/30 rounded-xl p-6 hover:border-[#d29922]/60 transition-all group relative">
                  <div className="flex items-start justify-between mb-3">
                    <StatusBadge status={
                      a.category === 'urgent' ? 'danger' :
                      a.category === 'milestone' ? 'success' :
                      a.category === 'event' ? 'info' : 'default'
                    }>{a.category}</StatusBadge>
                    <span className="text-[10px] text-[#6e7681] font-mono">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-2">{a.title}</h3>
                  <p className="text-sm text-[#8b949e] line-clamp-2">{a.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Department Matrix + Policies */}
          <div className="lg:col-span-2 space-y-8">
            {/* Department Performance Matrix */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-widest"><Editable k="home.deptMatrix.heading">Department Matrix</Editable></h2>
                  <span className="text-[10px] text-[#6e7681] font-mono">{departments.length} <Editable k="home.deptMatrix.count">departments</Editable></span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {deptStats.map(dept => {
                  const getHeatColor = (p) => {
                    if (p >= 80) return 'from-[#3fb950]/20 to-[#3fb950]/5 border-[#3fb950]/40 hover:border-[#3fb950]'
                    if (p >= 60) return 'from-[#00d4ff]/20 to-[#00d4ff]/5 border-[#00d4ff]/40 hover:border-[#00d4ff]'
                    if (p >= 40) return 'from-[#d29922]/20 to-[#d29922]/5 border-[#d29922]/40 hover:border-[#d29922]'
                    if (p >= 20) return 'from-[#db6d28]/20 to-[#db6d28]/5 border-[#db6d28]/40 hover:border-[#db6d28]'
                    return 'from-[#f85149]/20 to-[#f85149]/5 border-[#f85149]/40 hover:border-[#f85149]'
                  }
                  const getTextColor = (p) => {
                    if (p >= 80) return 'text-[#3fb950]'
                    if (p >= 60) return 'text-[#00d4ff]'
                    if (p >= 40) return 'text-[#d29922]'
                    return 'text-[#f85149]'
                  }
                  return (
                    <Link
                      key={dept.id}
                      href={deptLinks[dept.id]}
                      className={`bg-gradient-to-br ${getHeatColor(dept.progress)} border rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-lg group`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{dept.icon}</span>
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          dept.progress >= 75 ? 'bg-[#3fb950] shadow-[0_0_8px_#3fb950]' :
                          dept.progress >= 50 ? 'bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]' :
                          dept.progress >= 25 ? 'bg-[#d29922] shadow-[0_0_8px_#d29922]' : 'bg-[#6e7681]'
                        }`} />
                      </div>
                      <h3 className="font-semibold text-[#f0f6fc] text-sm mb-2 group-hover:text-[#00d4ff] transition truncate">{dept.name}</h3>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className={`text-2xl font-mono font-bold ${getTextColor(dept.progress)}`}>{dept.progress}%</span>
                      </div>
                      <p className="text-[10px] text-[#6e7681]">{dept.completed}/{dept.total} complete</p>
                      <div className="mt-2 h-1 bg-[#21262d] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${
                          dept.progress >= 75 ? 'bg-[#3fb950]' :
                          dept.progress >= 50 ? 'bg-[#00d4ff]' :
                          dept.progress >= 25 ? 'bg-[#d29922]' : 'bg-[#6e7681]'
                        }`} style={{ width: `${dept.progress}%` }} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Policy Registry */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#21262d] mb-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-widest"><Editable k="home.policyRegistry.heading">Policy Registry</Editable></h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded text-[#00d4ff]">{filteredPolicies.length} <Editable k="home.policyRegistry.count">policies</Editable></span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setSelectedDept(null)}
                    className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded-lg transition ${
                      !selectedDept ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]' : 'text-[#6e7681] border border-[#30363d] hover:bg-[#21262d] hover:text-[#8b949e]'
                    }`}
                  >
                    All
                  </button>
                  {departments.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDept(selectedDept === d.id ? null : d.id)}
                      className={`px-2.5 py-1.5 text-sm rounded-lg transition hidden md:block ${
                        selectedDept === d.id ? 'bg-[#00d4ff]/10 border border-[#00d4ff]' : 'border border-[#30363d] hover:bg-[#21262d]'
                      }`}
                      title={d.name}
                    >
                      {d.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredPolicies.slice(0, 10).map(policy => {
                  const dept = departments.find(d => d.id === policy.department)
                  return (
                    <div
                      key={policy.id}
                      className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[#8b949e]/30 transition-all group relative"
                      onMouseEnter={() => setHoveredPolicy(policy.id)}
                      onMouseLeave={() => setHoveredPolicy(null)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{dept?.icon}</span>
                          <span className="text-[10px] text-[#6e7681] uppercase tracking-wider">{dept?.name}</span>
                          {policy.priority === 'high' && (
                            <span className="px-1.5 py-0.5 bg-[#f85149]/10 border border-[#f85149]/30 rounded text-[9px] font-mono text-[#f85149] uppercase">Priority</span>
                          )}
                        </div>
                        <StatusBadge status={
                          policy.status === 'completed' ? 'success' :
                          policy.status === 'in_progress' ? 'warning' : 'default'
                        }>
                          {policy.status === 'in_progress' ? 'Active' : policy.status}
                        </StatusBadge>
                      </div>
                      <h3 className="font-semibold text-[#f0f6fc] mb-2 group-hover:text-[#00d4ff] transition">{policy.title}</h3>
                      <p className="text-sm text-[#8b949e] mb-4 line-clamp-1">{policy.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${
                              policy.status === 'completed' ? 'bg-[#3fb950]' :
                              policy.status === 'in_progress' ? 'bg-gradient-to-r from-[#00d4ff] to-[#388bfd]' : 'bg-[#6e7681]'
                            }`} style={{ width: `${policy.progress}%` }} />
                          </div>
                        </div>
                        <span className={`text-sm font-mono font-bold ${
                          policy.status === 'completed' ? 'text-[#3fb950]' :
                          policy.progress >= 50 ? 'text-[#00d4ff]' : 'text-[#8b949e]'
                        }`}>{policy.progress}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredPolicies.length > 10 && (
                <div className="mt-5 text-center">
                  <Link href={selectedDept ? deptLinks[selectedDept] : '/communications'} className="inline-flex items-center gap-2 text-sm text-[#00d4ff] hover:underline">
                    View all {filteredPolicies.length} policies
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="space-y-8">
            {/* Status Distribution */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-widest mb-5"><Editable k="home.status.heading">Status Overview</Editable></h3>
              <div className="flex items-center justify-center mb-6">
                <DonutChart
                  data={[
                    { value: statusCounts.completed, color: '#3fb950' },
                    { value: statusCounts.in_progress, color: '#d29922' },
                    { value: statusCounts.planned, color: '#6e7681' },
                  ]}
                  size={140}
                  thickness={16}
                  centerValue={`${overallProgress}%`}
                  centerLabel="Complete"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#3fb950]" />
                    <span className="text-sm text-[#8b949e]"><Editable k="home.status.completed">Completed</Editable></span>
                  </div>
                  <span className="font-mono font-bold text-[#3fb950]">{statusCounts.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#d29922]" />
                    <span className="text-sm text-[#8b949e]"><Editable k="home.status.inProgress">In Progress</Editable></span>
                  </div>
                  <span className="font-mono font-bold text-[#d29922]">{statusCounts.in_progress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#6e7681]" />
                    <span className="text-sm text-[#8b949e]"><Editable k="home.status.planned">Planned</Editable></span>
                  </div>
                  <span className="font-mono font-bold text-[#6e7681]">{statusCounts.planned}</span>
                </div>
              </div>
            </div>

            {/* Budget Overview */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 group relative">
              <h3 className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-widest mb-5"><Editable k="home.budget.heading">Budget Allocation</Editable></h3>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="text-center">
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-1"><Editable k="home.budget.totalLabel">Total</Editable></p>
                  <p className="text-xl font-bold font-mono text-[#f0f6fc]">${(budgetData.total / 1000).toFixed(0)}K</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-1"><Editable k="home.budget.allocatedLabel">Allocated</Editable></p>
                  <p className="text-xl font-bold font-mono text-[#00d4ff]">${(budgetData.allocated / 1000).toFixed(0)}K</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-1"><Editable k="home.budget.spentLabel">Spent</Editable></p>
                  <p className="text-xl font-bold font-mono text-[#3fb950]">${(budgetData.spent / 1000).toFixed(0)}K</p>
                </div>
              </div>
              <div className="h-3 bg-[#21262d] rounded-full overflow-hidden flex">
                <div className="h-full bg-[#3fb950]" style={{ width: `${(budgetData.spent / budgetData.total) * 100}%` }} />
                <div className="h-full bg-[#00d4ff]" style={{ width: `${((budgetData.allocated - budgetData.spent) / budgetData.total) * 100}%` }} />
              </div>
              <div className="flex justify-between mt-3 text-[10px] text-[#6e7681]">
                <span>Spent: {((budgetData.spent / budgetData.total) * 100).toFixed(0)}%</span>
                <span>Available: {(((budgetData.total - budgetData.spent) / budgetData.total) * 100).toFixed(0)}%</span>
              </div>
              <Link href="/budget" className="flex items-center justify-center gap-2 mt-5 py-2.5 border border-[#30363d] rounded-lg text-xs text-[#8b949e] hover:text-[#00d4ff] hover:border-[#00d4ff] transition">
                <Editable k="home.budget.viewDashboard">View Full Dashboard</Editable>
              </Link>
            </div>

            {/* Activity Feed */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-widest"><Editable k="home.activity.heading">Recent Activity</Editable></h3>
                <LiveIndicator label="Live" variant="success" />
              </div>
              <div className="space-y-0">
                {recentActivity.length > 0 ? recentActivity.map(entry => {
                  const dept = departments.find(d => d.id === entry.category)
                  return (
                    <div key={entry.id} className="flex items-start gap-3 py-3 border-b border-[#21262d] last:border-0">
                      <div className="w-2 h-2 rounded-full bg-[#00d4ff] mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {dept && <span className="text-sm">{dept.icon}</span>}
                          <p className="text-sm text-[#f0f6fc] truncate">{entry.details}</p>
                        </div>
                        <p className="text-[10px] text-[#6e7681] font-mono mt-0.5">
                          {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                }) : (
                  <p className="text-sm text-[#6e7681] text-center py-6"><Editable k="home.activity.empty">No recent activity</Editable></p>
                )}
              </div>
            </div>

            {/* Quick Access */}
            <div>
              <h3 className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-widest mb-4"><Editable k="home.quickAccess.heading">Quick Access</Editable></h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/budget" className="bg-gradient-to-br from-[#388bfd]/20 to-[#388bfd]/5 border border-[#388bfd]/30 rounded-xl p-4 hover:border-[#388bfd] transition-all group">
                  <span className="text-2xl">$</span>
                  <p className="font-medium text-[#f0f6fc] text-sm mt-3 group-hover:text-[#388bfd] transition"><Editable k="home.quickAccess.budget">Budget</Editable></p>
                  <p className="text-[10px] text-[#6e7681] mt-0.5"><Editable k="home.quickAccess.budgetDesc">Funding & Requests</Editable></p>
                </Link>
                <Link href="/environmental" className="bg-gradient-to-br from-[#238636]/20 to-[#238636]/5 border border-[#238636]/30 rounded-xl p-4 hover:border-[#238636] transition-all group">
                  <span className="text-2xl">E</span>
                  <p className="font-medium text-[#f0f6fc] text-sm mt-3 group-hover:text-[#238636] transition"><Editable k="home.quickAccess.environmental">Environmental</Editable></p>
                  <p className="text-[10px] text-[#6e7681] mt-0.5"><Editable k="home.quickAccess.environmentalDesc">Sustainability</Editable></p>
                </Link>
                <Link href="/wellness" className="bg-gradient-to-br from-[#3fb950]/20 to-[#3fb950]/5 border border-[#3fb950]/30 rounded-xl p-4 hover:border-[#3fb950] transition-all group">
                  <span className="text-2xl">W</span>
                  <p className="font-medium text-[#f0f6fc] text-sm mt-3 group-hover:text-[#3fb950] transition"><Editable k="home.quickAccess.wellness">Wellness</Editable></p>
                  <p className="text-[10px] text-[#6e7681] mt-0.5"><Editable k="home.quickAccess.wellnessDesc">Crisis Support</Editable></p>
                </Link>
                <Link href="/basic-needs" className="bg-gradient-to-br from-[#d29922]/20 to-[#d29922]/5 border border-[#d29922]/30 rounded-xl p-4 hover:border-[#d29922] transition-all group">
                  <span className="text-2xl">B</span>
                  <p className="font-medium text-[#f0f6fc] text-sm mt-3 group-hover:text-[#d29922] transition"><Editable k="home.quickAccess.basicNeeds">Basic Needs</Editable></p>
                  <p className="text-[10px] text-[#6e7681] mt-0.5"><Editable k="home.quickAccess.basicNeedsDesc">Food & Housing</Editable></p>
                </Link>
                <Link href="/academic" className="bg-gradient-to-br from-[#a371f7]/20 to-[#a371f7]/5 border border-[#a371f7]/30 rounded-xl p-4 hover:border-[#a371f7] transition-all group">
                  <span className="text-2xl">A</span>
                  <p className="font-medium text-[#f0f6fc] text-sm mt-3 group-hover:text-[#a371f7] transition"><Editable k="home.quickAccess.academic">Academic</Editable></p>
                  <p className="text-[10px] text-[#6e7681] mt-0.5"><Editable k="home.quickAccess.academicDesc">Student Success</Editable></p>
                </Link>
                <Link href="/communications" className="bg-gradient-to-br from-[#00d4ff]/20 to-[#00d4ff]/5 border border-[#00d4ff]/30 rounded-xl p-4 hover:border-[#00d4ff] transition-all group">
                  <span className="text-2xl">T</span>
                  <p className="font-medium text-[#f0f6fc] text-sm mt-3 group-hover:text-[#00d4ff] transition"><Editable k="home.quickAccess.transparency">Transparency</Editable></p>
                  <p className="text-[10px] text-[#6e7681] mt-0.5"><Editable k="home.quickAccess.transparencyDesc">Full Dashboard</Editable></p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Edit Mode Toggle */}
      <EditModeToggle />
    </Layout>
  )
}
