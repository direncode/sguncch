import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Textarea } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { departments, getKPIStatus, formatNumber } from '../../lib/data'

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [questionForm, setQuestionForm] = useState({ name: '', email: '', question: '', topic: '' })
  const [submitted, setSubmitted] = useState(null)
  const [liveTime, setLiveTime] = useState(new Date())
  const { policies, budgetData, operationalData } = useApp()

  const department = departments.find(d => d.id === 'communications') || {
    icon: '📡',
    tagline: 'Transparency & Engagement',
    description: 'Connecting students with their government through open communication',
    channels: ['Newsletter', 'Social Media', 'Town Halls', 'Transparency Portal'],
    serviceLevel: 'TIER 1',
    sla: { responseTime: '24h' },
    satisfactionTarget: 90
  }
  const accentColor = '#00d4ff'

  const townHallEvents = operationalData?.events?.townHalls || []
  const deptPolicies = policies.filter(p => p.department === 'communications')
  const overallProgress = deptPolicies.length > 0 ? Math.round(deptPolicies.reduce((sum, p) => sum + (p.progress || 0), 0) / deptPolicies.length) : 0
  const statusCounts = {
    completed: deptPolicies.filter(p => p.status === 'completed').length,
    in_progress: deptPolicies.filter(p => p.status === 'in_progress').length,
    planned: deptPolicies.filter(p => p.status === 'planned').length,
  }

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const tabs = [
    { id: 'dashboard', label: 'Command Center', icon: '◉' },
    { id: 'transparency', label: 'Transparency', icon: '◈' },
    { id: 'townhalls', label: 'Town Halls', icon: '⊕' },
    { id: 'social', label: 'Social Media', icon: '◎' },
    { id: 'policies', label: 'Initiatives', icon: '⬡' },
  ]

  // Calculate aggregate KPIs from all policies
  const aggregateKPIs = deptPolicies.reduce((acc, policy) => {
    if (policy.kpis) {
      policy.kpis.forEach(kpi => {
        if (!acc[kpi.name]) {
          acc[kpi.name] = { target: 0, current: 0, unit: kpi.unit }
        }
        acc[kpi.name].target += kpi.target
        acc[kpi.name].current += kpi.current
      })
    }
    return acc
  }, {})

  // Communication-specific metrics
  const commMetrics = {
    subscribers: 8900,
    openRate: 34,
    editions: 24,
    townHallsHeld: 8,
    attendance: 456,
    questionsAnswered: 234,
    surveysRun: 12,
    responses: 3400,
    socialFollowers: 15200,
    engagementRate: 4.8
  }

  return (
    <Layout>
      <Head>
        <title>Transparency Portal | Project Bold</title>
      </Head>

      {/* Command Center Hero */}
      <div className="relative bg-[#0a0e14] border-b border-[#30363d] overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00d4ff]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00d4ff]/5 blur-[80px] rounded-full" />

        <div className="relative max-w-[1600px] mx-auto px-6 py-8">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded text-xs font-mono">
                <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse" />
                <span className="text-[#00d4ff]">PORTAL ONLINE</span>
              </div>
              <span className="text-[#6e7681] text-xs font-mono">SERVICE LEVEL: {department?.serviceLevel || 'TIER 1'}</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-[#8b949e]">
              <span>SLA: {department?.sla?.responseTime || '24h'} RESPONSE</span>
              <span className="text-[#00d4ff]">{liveTime.toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#00a8cc] flex items-center justify-center text-2xl">
                  {department?.icon || '📡'}
                </div>
                <div>
                  <p className="text-[#00d4ff] text-xs font-medium tracking-widest uppercase">Digital Governance Hub</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#f0f6fc] tracking-tight">Transparency Portal</h1>
                </div>
              </div>
              <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed mb-4">
                {department?.tagline || 'Transparency & Engagement'} — {department?.description || 'Open government through radical transparency and real-time engagement'}
              </p>
              <div className="flex flex-wrap gap-2">
                {(department?.channels || ['Newsletter', 'Social Media', 'Town Halls', 'Transparency Portal']).map(channel => (
                  <span key={channel} className="px-3 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#8b949e] uppercase tracking-wider">
                    {channel}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Metrics Panel */}
            <div className="bg-[#0d1117]/80 border border-[#30363d] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-[#6e7681] uppercase tracking-widest">Live Metrics</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full animate-pulse" />
                  <span className="text-[10px] text-[#6e7681] font-mono">REAL-TIME</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#f0f6fc]">Department Progress</span>
                    <span className="text-[#00d4ff] font-mono">{overallProgress}%</span>
                  </div>
                  <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-mono font-bold text-[#3fb950]">{statusCounts.completed}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-wider">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-mono font-bold text-[#58a6ff]">{statusCounts.in_progress}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-wider">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-mono font-bold text-[#8b949e]">{statusCounts.planned}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-wider">Planned</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-[#21262d]">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6e7681]">Satisfaction Target</span>
                    <span className="text-[#00d4ff] font-mono">{department?.satisfactionTarget || 90}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Banner */}
      <div className="bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] border-b border-[#00d4ff]">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <p className="font-semibold text-[#0a0e14] uppercase text-sm tracking-wide">Open Government Initiative</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="#" className="bg-[#0a0e14] text-[#00d4ff] px-5 py-2 rounded font-mono font-bold hover:bg-[#161b22] transition-colors flex items-center gap-2">
              <span>◉</span> VIEW LIVE BUDGET
            </a>
            <button onClick={() => setActiveTab('transparency')} className="bg-white/10 border border-white/30 text-[#0a0e14] px-5 py-2 rounded font-mono hover:bg-white/20 transition-colors">
              MEETING MINUTES
            </button>
            <button onClick={() => setActiveTab('townhalls')} className="bg-white/10 border border-white/30 text-[#0a0e14] px-5 py-2 rounded font-mono hover:bg-white/20 transition-colors">
              NEXT TOWN HALL
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#0d1117] sticky top-16 z-40 border-b border-[#30363d]">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-medium tracking-widest uppercase whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#00d4ff] text-[#00d4ff] bg-[#00d4ff]/5'
                    : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-[#00d4ff]' : 'text-[#6e7681]'}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="bg-[#0d1117] min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {submitted && (
            <div className="mb-8 bg-[#161b22] border border-[#3fb950] rounded-lg p-5 flex items-center justify-between">
              <p className="text-[#f0f6fc] font-medium">
                {submitted === 'newsletter' && 'You\'re subscribed! Check your inbox for a confirmation email.'}
                {submitted === 'question' && 'Question submitted! We\'ll address it at the next town hall.'}
              </p>
              <button onClick={() => setSubmitted(null)} className="text-[#3fb950] text-sm font-medium hover:underline">Dismiss</button>
            </div>
          )}

          {/* Dashboard Tab - Command Center Style */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* KPI Grid */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">Engagement Analytics</h2>
                  <span className="text-xs text-[#6e7681] font-mono">LIVE PERFORMANCE</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(aggregateKPIs).length > 0 ? (
                    Object.entries(aggregateKPIs).slice(0, 8).map(([name, data]) => {
                      const status = getKPIStatus(data.current, data.target)
                      const statusColors = {
                        achieved: { bg: 'bg-[#3fb950]/10', border: 'border-[#3fb950]', text: 'text-[#3fb950]' },
                        'on-track': { bg: 'bg-[#58a6ff]/10', border: 'border-[#58a6ff]', text: 'text-[#58a6ff]' },
                        'at-risk': { bg: 'bg-[#d29922]/10', border: 'border-[#d29922]', text: 'text-[#d29922]' },
                        behind: { bg: 'bg-[#f85149]/10', border: 'border-[#f85149]', text: 'text-[#f85149]' }
                      }
                      const colors = statusColors[status]
                      const percentage = data.target > 0 ? Math.min(100, (data.current / data.target) * 100) : 0

                      return (
                        <div key={name} className={`${colors.bg} border ${colors.border} rounded-lg p-4`}>
                          <div className="flex items-start justify-between mb-3">
                            <p className="text-xs text-[#8b949e] uppercase tracking-wider">{name}</p>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
                              {status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2 mb-2">
                            <p className={`text-2xl font-mono font-bold ${colors.text}`}>
                              {formatNumber(data.current)}
                            </p>
                            <p className="text-sm text-[#6e7681] font-mono">/ {formatNumber(data.target)} {data.unit}</p>
                          </div>
                          <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${colors.text.replace('text-', 'bg-')}`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    // Fallback metrics when no policies with KPIs
                    [
                      { name: 'Newsletter Subscribers', current: commMetrics.subscribers, target: 10000, color: '#00d4ff' },
                      { name: 'Email Open Rate', current: commMetrics.openRate, target: 40, unit: '%', color: '#3fb950' },
                      { name: 'Town Hall Attendance', current: commMetrics.attendance, target: 600, color: '#a371f7' },
                      { name: 'Survey Responses', current: commMetrics.responses, target: 5000, color: '#d29922' },
                    ].map((metric, i) => (
                      <div key={i} className="bg-[#00d4ff]/10 border border-[#00d4ff] rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-xs text-[#8b949e] uppercase tracking-wider">{metric.name}</p>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]">
                            ON-TRACK
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <p className="text-2xl font-mono font-bold" style={{ color: metric.color }}>
                            {formatNumber(metric.current)}{metric.unit || ''}
                          </p>
                          <p className="text-sm text-[#6e7681] font-mono">/ {formatNumber(metric.target)}{metric.unit || ''}</p>
                        </div>
                        <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ backgroundColor: metric.color, width: `${Math.min(100, (metric.current / metric.target) * 100)}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Access Services */}
              <div>
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Quick Access Services</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <button onClick={() => { setSubscribed('newsletter') }} className="bg-[#161b22] border border-[#00d4ff] rounded-lg p-5 hover:bg-[#00d4ff]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#00d4ff]/10 rounded-lg flex items-center justify-center group-hover:bg-[#00d4ff]/20 transition-all">
                        <span className="text-[#00d4ff] text-lg">📰</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">SG Weekly</p>
                        <p className="text-xs text-[#6e7681]">Newsletter</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">{formatNumber(commMetrics.subscribers)} subscribers | {commMetrics.openRate}% open rate</p>
                  </button>
                  <button onClick={() => setActiveTab('townhalls')} className="bg-[#161b22] border border-[#a371f7] rounded-lg p-5 hover:bg-[#a371f7]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#a371f7]/10 rounded-lg flex items-center justify-center group-hover:bg-[#a371f7]/20 transition-all">
                        <span className="text-[#a371f7] text-lg">🏛️</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Town Halls</p>
                        <p className="text-xs text-[#6e7681]">Direct Engagement</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">{commMetrics.townHallsHeld} held | {commMetrics.questionsAnswered} questions answered</p>
                  </button>
                  <button onClick={() => setActiveTab('transparency')} className="bg-[#161b22] border border-[#3fb950] rounded-lg p-5 hover:bg-[#3fb950]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#3fb950]/10 rounded-lg flex items-center justify-center group-hover:bg-[#3fb950]/20 transition-all">
                        <span className="text-[#3fb950] text-lg">📊</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Transparency Dashboard</p>
                        <p className="text-xs text-[#6e7681]">Budget & Records</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Real-time budget tracking | Open voting records</p>
                  </button>
                </div>
              </div>

              {/* Active Initiatives */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">Active Initiatives</h2>
                  <button onClick={() => setActiveTab('policies')} className="text-xs text-[#00d4ff] hover:underline">VIEW ALL →</button>
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  {deptPolicies.filter(p => p.status !== 'completed').slice(0, 4).map(policy => (
                    <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#00d4ff]/50 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-[#f0f6fc] mb-1">{policy.title}</h3>
                          <p className="text-xs text-[#6e7681] uppercase tracking-wider">Phase: {policy.phase || 'Planning'}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-xs font-mono border ${
                          policy.priority === 'high' ? 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]' :
                          policy.priority === 'medium' ? 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]' :
                          'bg-[#8b949e]/10 text-[#8b949e] border-[#8b949e]'
                        }`}>
                          {policy.priority?.toUpperCase() || 'NORMAL'}
                        </span>
                      </div>
                      <p className="text-sm text-[#8b949e] mb-4 line-clamp-2">{policy.description}</p>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[#6e7681]">Progress</span>
                        <span className="text-[#00d4ff] font-mono">{policy.progress}%</span>
                      </div>
                      <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
                      </div>
                      {policy.milestones && (
                        <div className="mt-4 pt-3 border-t border-[#21262d]">
                          <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-2">Milestones</p>
                          <div className="flex gap-2 overflow-x-auto">
                            {policy.milestones.slice(0, 3).map((m, i) => (
                              <span key={i} className={`flex-shrink-0 px-2 py-1 rounded text-[10px] font-mono ${
                                m.status === 'completed' ? 'bg-[#3fb950]/10 text-[#3fb950]' :
                                m.status === 'in_progress' ? 'bg-[#00d4ff]/10 text-[#00d4ff]' :
                                'bg-[#21262d] text-[#6e7681]'
                              }`}>
                                {m.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {deptPolicies.filter(p => p.status !== 'completed').length === 0 && (
                    <div className="col-span-2 bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
                      <p className="text-[#6e7681]">No active initiatives at this time</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Transparency Tab */}
          {activeTab === 'transparency' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Transparency Dashboard</h2>
                <p className="text-[#8b949e]">Real-time governance data with full public access to budget, votes, and meeting records</p>
              </div>

              {/* Overall Progress */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-widest mb-5">Overall Policy Progress</h3>
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-5xl font-bold font-mono text-[#00d4ff] tracking-tight">{overallProgress}%</div>
                  <div className="flex-1">
                    <div className="h-3 bg-[#21262d] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] rounded-full transition-all duration-500"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0d1117] border border-[#238636] rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#3fb950] tracking-tight">{statusCounts.completed}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Completed</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#00d4ff]/50 rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#00d4ff] tracking-tight">{statusCounts.in_progress}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">In Progress</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#6e7681] rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#8b949e] tracking-tight">{statusCounts.planned}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Planned</p>
                  </div>
                </div>
              </div>

              {/* Budget Transparency */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-widest mb-5">Budget Transparency</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#f0f6fc] tracking-tight">
                      ${budgetData?.total?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Total Budget</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#00d4ff]/50 rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#00d4ff] tracking-tight">
                      ${budgetData?.allocated?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Allocated</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#238636] rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#3fb950] tracking-tight">
                      ${budgetData?.spent?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Spent</p>
                  </div>
                </div>

                {/* Budget Categories */}
                <h4 className="text-xs font-medium text-[#f0f6fc] uppercase tracking-wider mb-4">By Category</h4>
                <div className="space-y-5">
                  {(budgetData?.categories || []).map((cat, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[#f0f6fc] font-medium">{cat.name}</span>
                        <span className="text-[#6e7681] font-mono">
                          ${cat.spent?.toLocaleString() || 0} / ${cat.allocated?.toLocaleString() || 0}
                          <span className="ml-2 text-[#00d4ff]">
                            ({cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : 0}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] rounded-full transition-all duration-500"
                          style={{ width: `${cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meeting Minutes */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-widest mb-5">Recent Meeting Minutes</h3>
                <div className="space-y-3">
                  {[
                    { date: 'Jan 21, 2026', title: 'Senate Meeting #15', type: 'Senate', status: 'published' },
                    { date: 'Jan 14, 2026', title: 'Senate Meeting #14', type: 'Senate', status: 'published' },
                    { date: 'Jan 12, 2026', title: 'Executive Committee', type: 'Executive', status: 'published' },
                    { date: 'Jan 7, 2026', title: 'Finance Committee', type: 'Committee', status: 'published' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#0d1117] border border-[#30363d] rounded-lg hover:border-[#00d4ff]/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg flex items-center justify-center">
                          <span className="text-[#00d4ff] font-mono text-xs">{item.date.split(' ')[1]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-[#f0f6fc]">{item.title}</p>
                          <p className="text-sm text-[#6e7681] font-mono">{item.date} | {item.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded text-[10px] font-mono uppercase bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]">
                          {item.status}
                        </span>
                        <button className="px-4 py-2 text-xs font-medium text-[#00d4ff] uppercase tracking-wider hover:bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded transition-colors">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-5 px-5 py-3 text-xs font-medium text-[#00d4ff] uppercase tracking-wider bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 border border-[#00d4ff]/30 rounded transition-colors">
                  View All Minutes
                </button>
              </div>

              {/* Voting Records */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-sm font-semibold text-[#f0f6fc] uppercase tracking-widest mb-5">Recent Votes</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Resolution 2026-08: Mental Health Funding', result: 'Passed', votes: '42-3-1', date: 'Jan 21' },
                    { title: 'Resolution 2026-07: Textbook Affordability', result: 'Passed', votes: '44-1-1', date: 'Jan 14' },
                    { title: 'Bill 2026-04: Student Org Funding Increase', result: 'Passed', votes: '40-5-1', date: 'Jan 7' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#0d1117] border border-[#30363d] rounded-lg hover:border-[#00d4ff]/50 transition-colors">
                      <div>
                        <p className="font-medium text-[#f0f6fc]">{item.title}</p>
                        <p className="text-sm text-[#6e7681] font-mono">{item.date} | Vote: {item.votes} (Yes-No-Abstain)</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded text-xs font-mono uppercase border ${
                        item.result === 'Passed'
                          ? 'bg-[#238636]/20 text-[#3fb950] border-[#238636]'
                          : 'bg-[#da3633]/20 text-[#f85149] border-[#da3633]'
                      }`}>
                        {item.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Town Halls Tab */}
          {activeTab === 'townhalls' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Town Hall Series</h2>
                  <p className="text-[#8b949e] mt-2">Direct conversations between students and leadership with real-time Q&A</p>
                </div>
                <button onClick={() => setShowQuestionForm(true)} className="bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] text-[#0a0e14] px-6 py-3 rounded font-semibold hover:opacity-90 transition-all uppercase text-sm tracking-wide">
                  Submit Question
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { value: commMetrics.townHallsHeld, label: 'Town Halls', sublabel: 'Held', color: '#00d4ff' },
                  { value: commMetrics.attendance, label: 'Total', sublabel: 'Attendance', color: '#a371f7' },
                  { value: commMetrics.questionsAnswered, label: 'Questions', sublabel: 'Answered', color: '#3fb950' },
                  { value: '95%', label: 'Satisfaction', sublabel: 'Rate', color: '#d29922' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">{stat.label}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Upcoming Events */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Upcoming Town Halls</h3>
                <div className="space-y-4">
                  {townHallEvents.length > 0 ? townHallEvents.map(event => (
                    <div key={event.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#00d4ff]/50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="w-14 h-14 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg flex flex-col items-center justify-center">
                            <span className="text-[#00d4ff] font-mono text-sm font-bold">{event.date?.split(' ')[1] || 'TBD'}</span>
                            <span className="text-[#6e7681] text-[10px]">{event.date?.split(' ')[0] || ''}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#f0f6fc]">{event.title}</h4>
                            <p className="text-sm text-[#6e7681] font-mono mt-1">{event.date} at {event.time}</p>
                            <p className="text-sm text-[#8b949e]">{event.location}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {event.topics?.map((topic, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 rounded text-xs font-medium"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button className="px-5 py-2.5 bg-[#00d4ff] text-[#0a0e14] text-xs font-bold uppercase tracking-wider rounded hover:bg-[#00a8cc] transition-colors">
                          RSVP
                        </button>
                      </div>
                    </div>
                  )) : (
                    // Placeholder events
                    [
                      { id: 1, title: 'Spring Priorities Town Hall', date: 'Feb 5, 2026', time: '6:00 PM', location: 'Student Union Great Hall', topics: ['Budget', 'Mental Health', 'Housing'] },
                      { id: 2, title: 'Open Forum: Campus Safety', date: 'Feb 19, 2026', time: '5:30 PM', location: 'Carolina Hall 104', topics: ['Safety', 'Transportation', 'Lighting'] },
                    ].map(event => (
                      <div key={event.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#00d4ff]/50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="w-14 h-14 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg flex flex-col items-center justify-center">
                              <span className="text-[#00d4ff] font-mono text-sm font-bold">{event.date.split(' ')[1]}</span>
                              <span className="text-[#6e7681] text-[10px]">{event.date.split(' ')[0]}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#f0f6fc]">{event.title}</h4>
                              <p className="text-sm text-[#6e7681] font-mono mt-1">{event.date} at {event.time}</p>
                              <p className="text-sm text-[#8b949e]">{event.location}</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {event.topics.map((topic, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 rounded text-xs font-medium"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button className="px-5 py-2.5 bg-[#00d4ff] text-[#0a0e14] text-xs font-bold uppercase tracking-wider rounded hover:bg-[#00a8cc] transition-colors">
                            RSVP
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Past Town Halls */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Past Town Hall Recordings</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: 'Fall Budget Review', date: 'Dec 5, 2025', views: 890, duration: '1:42:00' },
                    { title: 'Housing Crisis Discussion', date: 'Nov 12, 2025', views: 1200, duration: '2:01:00' },
                    { title: 'Mental Health Resources', date: 'Oct 22, 2025', views: 750, duration: '1:28:00' },
                    { title: 'Campus Safety Forum', date: 'Oct 8, 2025', views: 680, duration: '1:35:00' },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#00d4ff]/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#a371f7]/10 rounded-lg flex items-center justify-center">
                          <span className="text-[#a371f7] text-lg">▶</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#f0f6fc]">{item.title}</h4>
                          <p className="text-xs text-[#6e7681] font-mono mt-1">{item.date} | {item.duration}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-[#00d4ff]">{item.views}</p>
                          <p className="text-[10px] text-[#6e7681] uppercase">views</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Social Media Command Center</h2>
                <p className="text-[#8b949e]">Multi-channel engagement analytics and content performance tracking</p>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { value: formatNumber(commMetrics.socialFollowers), label: 'Total', sublabel: 'Followers', color: '#00d4ff' },
                  { value: `${commMetrics.engagementRate}%`, label: 'Engagement', sublabel: 'Rate', color: '#3fb950' },
                  { value: '156', label: 'Posts', sublabel: 'This Month', color: '#a371f7' },
                  { value: '2.3M', label: 'Impressions', sublabel: 'Total', color: '#d29922' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">{stat.label}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Channel Performance */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Channel Performance</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'Instagram', handle: '@uncsg', followers: 8200, growth: '+12%', color: '#E1306C', icon: '📸' },
                    { name: 'Twitter/X', handle: '@UNC_SG', followers: 4500, growth: '+8%', color: '#1DA1F2', icon: '🐦' },
                    { name: 'TikTok', handle: '@uncstudentgov', followers: 1800, growth: '+45%', color: '#00F2EA', icon: '🎵' },
                    { name: 'LinkedIn', handle: 'UNC SG', followers: 700, growth: '+5%', color: '#0A66C2', icon: '💼' },
                  ].map((channel, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#00d4ff]/50 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${channel.color}20` }}>
                          {channel.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-[#f0f6fc]">{channel.name}</p>
                          <p className="text-xs text-[#6e7681]">{channel.handle}</p>
                        </div>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <p className="text-2xl font-mono font-bold text-[#f0f6fc]">{formatNumber(channel.followers)}</p>
                        <span className="text-sm font-mono text-[#3fb950]">{channel.growth}</span>
                      </div>
                      <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mt-1">Followers</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performing Content */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Top Performing Content</h3>
                <div className="space-y-3">
                  {[
                    { platform: 'Instagram', content: 'Spring Budget Infographic', reach: 12400, engagement: 890, date: 'Jan 20' },
                    { platform: 'TikTok', content: 'Town Hall Highlights Reel', reach: 8900, engagement: 1200, date: 'Jan 18' },
                    { platform: 'Twitter', content: 'Mental Health Resources Thread', reach: 6700, engagement: 340, date: 'Jan 15' },
                  ].map((post, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center justify-between hover:border-[#00d4ff]/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono px-2 py-1 bg-[#00d4ff]/10 text-[#00d4ff] rounded">{post.platform}</span>
                        <div>
                          <p className="font-medium text-[#f0f6fc]">{post.content}</p>
                          <p className="text-xs text-[#6e7681] font-mono">{post.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <p className="font-mono text-[#f0f6fc]">{formatNumber(post.reach)}</p>
                          <p className="text-[10px] text-[#6e7681] uppercase">Reach</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[#3fb950]">{formatNumber(post.engagement)}</p>
                          <p className="text-[10px] text-[#6e7681] uppercase">Engagement</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter Stats */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">SG Weekly Newsletter</h3>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#0d1117] rounded-lg p-4 text-center">
                    <p className="text-2xl font-mono font-bold text-[#00d4ff]">{formatNumber(commMetrics.subscribers)}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mt-1">Subscribers</p>
                  </div>
                  <div className="bg-[#0d1117] rounded-lg p-4 text-center">
                    <p className="text-2xl font-mono font-bold text-[#3fb950]">{commMetrics.openRate}%</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mt-1">Open Rate</p>
                  </div>
                  <div className="bg-[#0d1117] rounded-lg p-4 text-center">
                    <p className="text-2xl font-mono font-bold text-[#a371f7]">12%</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mt-1">Click Rate</p>
                  </div>
                  <div className="bg-[#0d1117] rounded-lg p-4 text-center">
                    <p className="text-2xl font-mono font-bold text-[#d29922]">{commMetrics.editions}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mt-1">Editions</p>
                  </div>
                </div>

                {/* Subscribe */}
                {!subscribed ? (
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="your.email@unc.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent font-mono"
                    />
                    <button
                      onClick={() => { setSubscribed(true); setSubmitted('newsletter') }}
                      className="px-6 py-3 bg-[#00d4ff] text-[#0a0e14] font-bold text-sm uppercase tracking-wider rounded hover:bg-[#00a8cc] transition-colors"
                    >
                      Subscribe
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#3fb950]/10 border border-[#3fb950] rounded-lg p-4">
                    <p className="text-[#3fb950] font-medium">You're subscribed! Check your inbox for a confirmation email.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Initiatives/Policies Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">All Communications Initiatives</h2>
                <span className="text-xs text-[#6e7681] font-mono">{deptPolicies.length} INITIATIVES</span>
              </div>
              <div className="space-y-4">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#00d4ff]/50 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-[#f0f6fc] text-lg">{policy.title}</h3>
                          <span className={`px-2.5 py-1 rounded text-xs font-mono border ${
                            policy.status === 'completed' ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]' :
                            policy.status === 'in_progress' ? 'bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]' :
                            'bg-[#21262d] text-[#6e7681] border-[#30363d]'
                          }`}>
                            {policy.status === 'in_progress' ? 'ACTIVE' : policy.status?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-[#8b949e] mb-3">{policy.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-[#6e7681]">
                          <span>Phase: <span className="text-[#f0f6fc]">{policy.phase || 'Planning'}</span></span>
                          {policy.targetDate && <span>Target: <span className="text-[#f0f6fc]">{policy.targetDate}</span></span>}
                          {policy.lead && <span>Lead: <span className="text-[#f0f6fc]">{policy.lead}</span></span>}
                        </div>
                      </div>
                      <div className="lg:text-right">
                        <p className="text-3xl font-mono font-bold text-[#00d4ff]">{policy.progress}%</p>
                        <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">Progress</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-[#21262d] rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
                    </div>

                    {/* KPIs */}
                    {policy.kpis && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {policy.kpis.map((kpi, i) => {
                          const status = getKPIStatus(kpi.current, kpi.target)
                          const colors = {
                            achieved: 'text-[#3fb950]',
                            'on-track': 'text-[#58a6ff]',
                            'at-risk': 'text-[#d29922]',
                            behind: 'text-[#f85149]'
                          }
                          return (
                            <div key={i} className="bg-[#0d1117] rounded p-3">
                              <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-1">{kpi.name}</p>
                              <p className={`font-mono font-semibold ${colors[status]}`}>
                                {formatNumber(kpi.current)} <span className="text-[#6e7681] text-xs">/ {formatNumber(kpi.target)} {kpi.unit}</span>
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Digital Features */}
                    {policy.digitalFeatures && (
                      <div className="flex flex-wrap gap-2">
                        {policy.digitalFeatures.map(f => (
                          <span key={f} className="px-2.5 py-1 bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 rounded text-xs font-mono">
                            {f.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {deptPolicies.length === 0 && (
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
                    <p className="text-[#6e7681]">No communications initiatives found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Question Form Modal */}
          {showQuestionForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-6">Submit a Question for Town Hall</h3>
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted('question'); setShowQuestionForm(false) }} className="space-y-5">
                  <Input label="Name (optional)" name="name" value={questionForm.name} onChange={e => setQuestionForm({...questionForm, name: e.target.value})} />
                  <Input label="Email" type="email" name="email" value={questionForm.email} onChange={e => setQuestionForm({...questionForm, email: e.target.value})} required />
                  <div>
                    <label className="block text-sm font-medium text-[#f0f6fc] mb-2">Topic</label>
                    <select
                      value={questionForm.topic}
                      onChange={e => setQuestionForm({...questionForm, topic: e.target.value})}
                      className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="budget">Budget & Funding</option>
                      <option value="housing">Housing</option>
                      <option value="mental-health">Mental Health</option>
                      <option value="academics">Academics</option>
                      <option value="campus-life">Campus Life</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Textarea label="Your Question" name="question" value={questionForm.question} onChange={e => setQuestionForm({...questionForm, question: e.target.value})} required rows={4} />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] text-[#0a0e14] px-6 py-3 rounded font-semibold hover:opacity-90 transition-all">
                      Submit Question
                    </button>
                    <button type="button" onClick={() => setShowQuestionForm(false)} className="px-6 py-3 rounded font-medium text-[#8b949e] border border-[#30363d] hover:bg-[#21262d] transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  )
}
