import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { departments, getKPIStatus, formatNumber, formatCurrency } from '../../lib/data'

export default function AcademicPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [showAdvisingForm, setShowAdvisingForm] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', type: '', issue: '', details: '' })
  const [advisingForm, setAdvisingForm] = useState({ name: '', email: '', pid: '', topic: '', urgency: '', details: '' })
  const [submitted, setSubmitted] = useState(null)
  const [liveTime, setLiveTime] = useState(new Date())
  const { policies, operationalData } = useApp()

  const department = departments.find(d => d.id === 'academic')
  const researchPositions = operationalData?.research?.positions || []
  const deptPolicies = policies.filter(p => p.department === 'academic')
  const overallProgress = deptPolicies.length > 0 ? Math.round(deptPolicies.reduce((sum, p) => sum + (p.progress || 0), 0) / deptPolicies.length) : 0
  const statusCounts = {
    completed: deptPolicies.filter(p => p.status === 'completed').length,
    in_progress: deptPolicies.filter(p => p.status === 'in_progress').length,
    planned: deptPolicies.filter(p => p.status === 'planned').length,
  }

  const filteredPositions = researchPositions.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const tabs = [
    { id: 'dashboard', label: 'Command Center', icon: '◉' },
    { id: 'research', label: 'Research Connect', icon: '◈' },
    { id: 'advising', label: 'Advising Hub', icon: '⊕' },
    { id: 'registration', label: 'Registration', icon: '◎' },
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

  return (
    <Layout>
      <Head>
        <title>Academic Excellence Center | Project Bold</title>
      </Head>

      {/* Command Center Hero */}
      <div className="relative bg-[#0a0e14] border-b border-[#30363d] overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#388bfd 1px, transparent 1px), linear-gradient(90deg, #388bfd 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#388bfd]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#388bfd]/5 blur-[80px] rounded-full" />

        <div className="relative max-w-[1600px] mx-auto px-6 py-8">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#388bfd]/10 border border-[#388bfd]/30 rounded text-xs font-mono">
                <div className="w-2 h-2 bg-[#388bfd] rounded-full animate-pulse" />
                <span className="text-[#388bfd]">SYSTEM ONLINE</span>
              </div>
              <span className="text-[#6e7681] text-xs font-mono">SERVICE LEVEL: {department?.serviceLevel || 'PREMIUM'}</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-[#8b949e]">
              <span>SLA: {department?.sla?.responseTime || '24h'} RESPONSE</span>
              <span className="text-[#388bfd]">{liveTime.toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#388bfd] to-[#1f6feb] flex items-center justify-center text-2xl">
                  {department?.icon || '📚'}
                </div>
                <div>
                  <p className="text-[#388bfd] text-xs font-medium tracking-widest uppercase">Academic Excellence Center</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#f0f6fc] tracking-tight">Academic Affairs</h1>
                </div>
              </div>
              <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed mb-4">
                {department?.tagline || 'Empowering Academic Success'} — {department?.description || 'Course registration, advising, research opportunities, and academic success resources supporting your journey at Carolina.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {(department?.channels || ['Portal', 'Email', 'In-Person', 'Phone']).map(channel => (
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
                  <div className="w-1.5 h-1.5 bg-[#388bfd] rounded-full animate-pulse" />
                  <span className="text-[10px] text-[#6e7681] font-mono">REAL-TIME</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#f0f6fc]">Initiative Progress</span>
                    <span className="text-[#388bfd] font-mono">{overallProgress}%</span>
                  </div>
                  <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#388bfd] to-[#1f6feb] rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
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
                    <span className="text-[#388bfd] font-mono">{department?.satisfactionTarget || 90}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Banner */}
      <div className="bg-gradient-to-r from-[#1f6feb] to-[#388bfd] border-b border-[#58a6ff]">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <p className="font-semibold text-white uppercase text-sm tracking-wide">Registration Period Active</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="https://connectcarolina.unc.edu" target="_blank" rel="noopener noreferrer" className="bg-white text-[#1f6feb] px-5 py-2 rounded font-mono font-bold hover:bg-[#f0f6fc] transition-colors flex items-center gap-2">
              <span>◉</span> ConnectCarolina
            </a>
            <button onClick={() => setShowAdvisingForm(true)} className="bg-white/10 border border-white/30 text-white px-5 py-2 rounded font-mono hover:bg-white/20 transition-colors">
              Schedule Advising
            </button>
            <a href="#" className="bg-white/10 border border-white/30 text-white px-5 py-2 rounded font-mono hover:bg-white/20 transition-colors">
              Degree Audit
            </a>
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
                    ? 'border-[#388bfd] text-[#388bfd] bg-[#388bfd]/5'
                    : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-[#388bfd]' : 'text-[#6e7681]'}>{tab.icon}</span>
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
                {submitted === 'feedback' && 'Thank you for your feedback! We will review and address your concern.'}
                {submitted === 'advising' && 'Advising request submitted. You will receive confirmation within 24 hours.'}
              </p>
              <button onClick={() => setSubmitted(null)} className="text-[#3fb950] text-sm font-medium hover:underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Dashboard Tab - Command Center Style */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* KPI Grid */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">Key Performance Indicators</h2>
                  <span className="text-xs text-[#6e7681] font-mono">TARGET vs ACTUAL</span>
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
                    // Default academic KPIs when no policy data
                    [
                      { name: 'Research Positions', current: 234, target: 300, unit: 'positions', color: '#388bfd' },
                      { name: 'Student Placements', current: 89, target: 150, unit: 'students', color: '#3fb950' },
                      { name: 'Advising Sessions', current: 1245, target: 2000, unit: 'sessions', color: '#a371f7' },
                      { name: 'Course Sections', current: 3456, target: 4000, unit: 'sections', color: '#d29922' },
                    ].map(kpi => {
                      const percentage = (kpi.current / kpi.target) * 100
                      return (
                        <div key={kpi.name} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <p className="text-xs text-[#8b949e] uppercase tracking-wider">{kpi.name}</p>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#388bfd]/10 text-[#388bfd] border border-[#388bfd]">
                              {percentage >= 100 ? 'ACHIEVED' : percentage >= 75 ? 'ON-TRACK' : percentage >= 50 ? 'AT-RISK' : 'BEHIND'}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2 mb-2">
                            <p className="text-2xl font-mono font-bold" style={{ color: kpi.color }}>
                              {formatNumber(kpi.current)}
                            </p>
                            <p className="text-sm text-[#6e7681] font-mono">/ {formatNumber(kpi.target)} {kpi.unit}</p>
                          </div>
                          <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: kpi.color }} />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Quick Access Services */}
              <div>
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Quick Access Services</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button onClick={() => setActiveTab('research')} className="bg-[#161b22] border border-[#388bfd] rounded-lg p-5 hover:bg-[#388bfd]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#388bfd]/10 rounded-lg flex items-center justify-center group-hover:bg-[#388bfd]/20 transition-all">
                        <span className="text-[#388bfd] text-lg">◈</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Research Connect</p>
                        <p className="text-xs text-[#6e7681]">234 Open Positions</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Find undergraduate research opportunities across all departments</p>
                  </button>
                  <button onClick={() => setShowAdvisingForm(true)} className="bg-[#161b22] border border-[#3fb950] rounded-lg p-5 hover:bg-[#3fb950]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#3fb950]/10 rounded-lg flex items-center justify-center group-hover:bg-[#3fb950]/20 transition-all">
                        <span className="text-[#3fb950] text-lg">⊕</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Smart Advising</p>
                        <p className="text-xs text-[#6e7681]">AI-Assisted Scheduling</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Schedule advisor meetings with intelligent time recommendations</p>
                  </button>
                  <button onClick={() => setActiveTab('registration')} className="bg-[#161b22] border border-[#a371f7] rounded-lg p-5 hover:bg-[#a371f7]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#a371f7]/10 rounded-lg flex items-center justify-center group-hover:bg-[#a371f7]/20 transition-all">
                        <span className="text-[#a371f7] text-lg">◎</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Registration Hub</p>
                        <p className="text-xs text-[#6e7681]">Real-time Updates</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Course availability, waitlist status, and registration reforms</p>
                  </button>
                  <a href="#" className="bg-[#161b22] border border-[#d29922] rounded-lg p-5 hover:bg-[#d29922]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#d29922]/10 rounded-lg flex items-center justify-center group-hover:bg-[#d29922]/20 transition-all">
                        <span className="text-[#d29922] text-lg">⬡</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Syllabus Database</p>
                        <p className="text-xs text-[#6e7681]">890 Syllabi Available</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Preview course content before registration</p>
                  </a>
                </div>
              </div>

              {/* Active Initiatives */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">Active Initiatives</h2>
                  <button onClick={() => setActiveTab('policies')} className="text-xs text-[#388bfd] hover:underline">
                    VIEW ALL →
                  </button>
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  {deptPolicies.filter(p => p.status !== 'completed').slice(0, 4).map(policy => (
                    <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#388bfd]/50 transition-all">
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
                          {policy.priority?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-[#8b949e] mb-4 line-clamp-2">{policy.description}</p>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[#6e7681]">Progress</span>
                        <span className="text-[#388bfd] font-mono">{policy.progress}%</span>
                      </div>
                      <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#388bfd] to-[#1f6feb] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
                      </div>
                      {policy.milestones && (
                        <div className="mt-4 pt-3 border-t border-[#21262d]">
                          <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-2">Milestones</p>
                          <div className="flex gap-2 overflow-x-auto">
                            {policy.milestones.slice(0, 3).map((m, i) => (
                              <span key={i} className={`flex-shrink-0 px-2 py-1 rounded text-[10px] font-mono ${
                                m.status === 'completed' ? 'bg-[#3fb950]/10 text-[#3fb950]' :
                                m.status === 'in_progress' ? 'bg-[#58a6ff]/10 text-[#58a6ff]' :
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
                </div>
              </div>
            </div>
          )}

          {/* Research Tab */}
          {activeTab === 'research' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Research Connect Platform</h2>
                  <p className="text-[#8b949e] mt-2">AI-powered matching system connecting students with research opportunities across all disciplines</p>
                </div>
                <a href="#" className="bg-gradient-to-r from-[#388bfd] to-[#1f6feb] text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition-all uppercase text-sm tracking-wide">
                  Create Profile
                </a>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { value: '234', label: 'Open', sublabel: 'Positions', color: '#388bfd' },
                  { value: '567', label: 'Total', sublabel: 'Applications', color: '#3fb950' },
                  { value: '89', label: 'Active', sublabel: 'Placements', color: '#a371f7' },
                  { value: '45+', label: 'Partner', sublabel: 'Departments', color: '#d29922' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">{stat.label}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Search */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                <div className="flex gap-4">
                  <Input
                    placeholder="Search by position, department, or professor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-[#0d1117] border-[#30363d] text-[#f0f6fc] placeholder-[#6e7681]"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-[#388bfd] to-[#1f6feb] text-white rounded font-medium hover:opacity-90 transition-all">
                    Search
                  </button>
                </div>
              </div>

              {/* Positions */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Available Positions</h3>
                <div className="space-y-4">
                  {filteredPositions.length > 0 ? filteredPositions.map(pos => (
                    <div key={pos.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#388bfd]/50 transition-all">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#f0f6fc] text-lg">{pos.title}</h4>
                          <p className="text-sm text-[#8b949e] mt-1">{pos.department} | {pos.professor}</p>
                          <div className="flex gap-3 mt-3">
                            <span className={`px-2.5 py-1 rounded text-xs font-medium border ${
                              pos.type === 'paid'
                                ? 'border-[#3fb950] text-[#3fb950] bg-[#3fb950]/10'
                                : 'border-[#388bfd] text-[#388bfd] bg-[#388bfd]/10'
                            }`}>
                              {pos.type === 'paid' ? 'PAID' : 'CREDIT'}
                            </span>
                            <span className="text-sm text-[#6e7681] font-mono">{pos.hours}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-xs text-[#6e7681]">Deadline: <span className="font-mono text-[#d29922]">{pos.deadline}</span></p>
                          <button className="px-5 py-2.5 bg-gradient-to-r from-[#388bfd] to-[#1f6feb] text-white rounded text-sm font-medium hover:opacity-90 transition-all">
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    // Sample positions when no data
                    [
                      { id: 1, title: 'AI Research Assistant', department: 'Computer Science', professor: 'Dr. Chen', type: 'paid', hours: '10-15 hrs/week', deadline: 'Feb 15, 2026' },
                      { id: 2, title: 'Neuroscience Lab Assistant', department: 'Biology', professor: 'Dr. Williams', type: 'credit', hours: '8-12 hrs/week', deadline: 'Feb 20, 2026' },
                      { id: 3, title: 'Economic Policy Analyst', department: 'Economics', professor: 'Dr. Johnson', type: 'paid', hours: '15-20 hrs/week', deadline: 'Mar 1, 2026' },
                    ].map(pos => (
                      <div key={pos.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#388bfd]/50 transition-all">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#f0f6fc] text-lg">{pos.title}</h4>
                            <p className="text-sm text-[#8b949e] mt-1">{pos.department} | {pos.professor}</p>
                            <div className="flex gap-3 mt-3">
                              <span className={`px-2.5 py-1 rounded text-xs font-medium border ${
                                pos.type === 'paid'
                                  ? 'border-[#3fb950] text-[#3fb950] bg-[#3fb950]/10'
                                  : 'border-[#388bfd] text-[#388bfd] bg-[#388bfd]/10'
                              }`}>
                                {pos.type === 'paid' ? 'PAID' : 'CREDIT'}
                              </span>
                              <span className="text-sm text-[#6e7681] font-mono">{pos.hours}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-xs text-[#6e7681]">Deadline: <span className="font-mono text-[#d29922]">{pos.deadline}</span></p>
                            <button className="px-5 py-2.5 bg-gradient-to-r from-[#388bfd] to-[#1f6feb] text-white rounded text-sm font-medium hover:opacity-90 transition-all">
                              Apply Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Advising Tab */}
          {activeTab === 'advising' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Smart Advising Hub</h2>
                  <p className="text-[#8b949e] mt-2">AI-enhanced academic advising with predictive degree planning and real-time scheduling</p>
                </div>
                <button onClick={() => setShowAdvisingForm(true)} className="bg-gradient-to-r from-[#3fb950] to-[#2ea043] text-[#0d1117] px-6 py-3 rounded font-semibold hover:opacity-90 transition-all uppercase text-sm tracking-wide">
                  Schedule Session
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { value: '3.8', label: 'Average', sublabel: 'Rating', color: '#3fb950' },
                  { value: '456', label: 'Student', sublabel: 'Reviews', color: '#388bfd' },
                  { value: '24h', label: 'Response', sublabel: 'Time', color: '#a371f7' },
                  { value: '95%', label: 'Satisfaction', sublabel: 'Rate', color: '#d29922' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">{stat.label}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Services Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-[#388bfd]/50 transition-all">
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-3">Find Your Advisor</h3>
                  <p className="text-sm text-[#8b949e] mb-5">Look up your assigned academic advisor by school or department</p>
                  <Select
                    options={[
                      { value: '', label: 'Select your school...' },
                      { value: 'cas', label: 'College of Arts & Sciences' },
                      { value: 'business', label: 'Kenan-Flagler Business School' },
                      { value: 'journalism', label: 'Hussman School of Journalism' },
                      { value: 'nursing', label: 'School of Nursing' },
                      { value: 'education', label: 'School of Education' },
                    ]}
                    className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
                  />
                  <button className="mt-5 px-5 py-2.5 bg-gradient-to-r from-[#388bfd] to-[#1f6feb] text-white rounded text-sm font-medium hover:opacity-90 transition-all">
                    Find Advisor
                  </button>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-[#388bfd]/50 transition-all">
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-3">Rate Your Experience</h3>
                  <p className="text-sm text-[#8b949e] mb-5">Help us improve advising quality through anonymous feedback</p>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} className="w-8 h-8 rounded bg-[#21262d] text-[#d29922] hover:bg-[#30363d] transition-colors">
                          ★
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-[#6e7681]">Current Avg: <span className="text-[#3fb950] font-mono">3.8/5.0</span></span>
                  </div>
                  <button className="px-5 py-2.5 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded text-sm font-medium hover:bg-[#30363d] transition-colors">
                    Submit Review
                  </button>
                </div>
              </div>

              {/* Advising Tips */}
              <div className="bg-[#161b22] border border-[#388bfd]/30 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Smart Advising Protocol</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: '📅', title: 'Schedule Early', desc: 'Book appointments before registration periods for best availability' },
                    { icon: '📝', title: 'Prepare Questions', desc: 'Bring a focused list of specific questions and degree concerns' },
                    { icon: '📊', title: 'Review Requirements', desc: 'Run a degree audit before your meeting to identify gaps' },
                    { icon: '📧', title: 'Follow Up', desc: 'Confirm discussed plans via email for documentation' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-[#0d1117] rounded-lg">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="font-semibold text-[#f0f6fc]">{item.title}</h4>
                        <p className="text-sm text-[#8b949e] mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Registration Tab */}
          {activeTab === 'registration' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Registration Intelligence Hub</h2>
                  <p className="text-[#8b949e] mt-2">Real-time course availability, waitlist analytics, and registration reform advocacy</p>
                </div>
                <button onClick={() => setShowFeedbackForm(true)} className="bg-gradient-to-r from-[#a371f7] to-[#8b5cf6] text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition-all uppercase text-sm tracking-wide">
                  Submit Feedback
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { value: '1,890', label: 'Feedback', sublabel: 'Submissions', color: '#388bfd' },
                  { value: '156', label: 'Issues', sublabel: 'Identified', color: '#d29922' },
                  { value: '45', label: 'Issues', sublabel: 'Resolved', color: '#3fb950' },
                  { value: '89%', label: 'Reform', sublabel: 'Progress', color: '#a371f7' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">{stat.label}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Common Issues */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Priority Issues Under Review</h3>
                <div className="space-y-4">
                  {[
                    { issue: 'Waitlist Transparency', votes: 456, status: 'In Progress', progress: 65 },
                    { issue: 'Registration Time Fairness', votes: 389, status: 'Researching', progress: 35 },
                    { issue: 'Course Capacity Limits', votes: 312, status: 'Meeting Scheduled', progress: 50 },
                    { issue: 'System Stability During Peak', votes: 287, status: 'Escalated to ITS', progress: 45 },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#388bfd]/50 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold text-[#f0f6fc] text-lg">{item.issue}</h4>
                          <p className="text-sm text-[#6e7681] mt-1"><span className="font-mono text-[#d29922]">{item.votes}</span> students affected</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded text-xs font-mono border ${
                          item.status === 'In Progress' ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]' :
                          item.status === 'Escalated to ITS' ? 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]' :
                          'bg-[#388bfd]/10 text-[#388bfd] border-[#388bfd]'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[#6e7681]">Resolution Progress</span>
                        <span className="text-[#388bfd] font-mono">{item.progress}%</span>
                      </div>
                      <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#388bfd] to-[#1f6feb] rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4">Syllabus Preview Database</h3>
                  <p className="text-sm text-[#8b949e] mb-5">Access past syllabi to make informed course decisions</p>
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="text-center">
                      <p className="text-2xl font-mono font-bold text-[#388bfd]">890</p>
                      <p className="text-[10px] text-[#6e7681] uppercase">Syllabi</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-mono font-bold text-[#3fb950]">2,340</p>
                      <p className="text-[10px] text-[#6e7681] uppercase">Reviews</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-mono font-bold text-[#a371f7]">456</p>
                      <p className="text-[10px] text-[#6e7681] uppercase">Courses</p>
                    </div>
                  </div>
                  <Input placeholder="Search by course code (e.g., COMP 110)" className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc] placeholder-[#6e7681]" />
                  <button className="mt-4 w-full px-5 py-2.5 bg-gradient-to-r from-[#388bfd] to-[#1f6feb] text-white rounded text-sm font-medium hover:opacity-90 transition-all">
                    Search Syllabi
                  </button>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4">Credit Transfer Portal</h3>
                  <p className="text-sm text-[#8b949e] mb-5">Check course equivalencies from transfer institutions</p>
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="text-center">
                      <p className="text-2xl font-mono font-bold text-[#d29922]">1,234</p>
                      <p className="text-[10px] text-[#6e7681] uppercase">Equivalencies</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-mono font-bold text-[#58a6ff]">234</p>
                      <p className="text-[10px] text-[#6e7681] uppercase">Requests</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-mono font-bold text-[#3fb950]">81%</p>
                      <p className="text-[10px] text-[#6e7681] uppercase">Approved</p>
                    </div>
                  </div>
                  <Select
                    options={[
                      { value: '', label: 'Select transfer institution...' },
                      { value: 'ncsu', label: 'NC State University' },
                      { value: 'duke', label: 'Duke University' },
                      { value: 'uncc', label: 'UNC Charlotte' },
                      { value: 'other', label: 'Other Institution' },
                    ]}
                    className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
                  />
                  <button className="mt-4 w-full px-5 py-2.5 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded text-sm font-medium hover:bg-[#30363d] transition-colors">
                    Check Equivalency
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Policies/Initiatives Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">All Academic Initiatives</h2>
                <span className="text-xs text-[#6e7681] font-mono">{deptPolicies.length} INITIATIVES</span>
              </div>
              <div className="space-y-4">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#388bfd]/50 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-[#f0f6fc] text-lg">{policy.title}</h3>
                          <span className={`px-2.5 py-1 rounded text-xs font-mono border ${
                            policy.status === 'completed' ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]' :
                            policy.status === 'in_progress' ? 'bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]' :
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
                        <p className="text-3xl font-mono font-bold text-[#388bfd]">{policy.progress}%</p>
                        <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">Progress</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-[#21262d] rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-gradient-to-r from-[#388bfd] to-[#1f6feb] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
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
                          <span key={f} className="px-2.5 py-1 bg-[#388bfd]/10 text-[#388bfd] border border-[#388bfd]/30 rounded text-xs font-mono">
                            {f.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registration Feedback Form Modal */}
          {showFeedbackForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-6">Submit Registration Feedback</h3>
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted('feedback'); setShowFeedbackForm(false) }} className="space-y-5">
                  <Input label="Name (optional)" name="name" value={feedbackForm.name} onChange={e => setFeedbackForm({...feedbackForm, name: e.target.value})} className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
                  <Input label="Email (optional)" type="email" name="email" value={feedbackForm.email} onChange={e => setFeedbackForm({...feedbackForm, email: e.target.value})} className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
                  <Select label="Issue Type" name="type" value={feedbackForm.type} onChange={e => setFeedbackForm({...feedbackForm, type: e.target.value})} required
                    options={[
                      { value: '', label: 'Select issue type...' },
                      { value: 'waitlist', label: 'Waitlist Issues' },
                      { value: 'timing', label: 'Registration Timing' },
                      { value: 'capacity', label: 'Course Capacity' },
                      { value: 'technical', label: 'Technical Problems' },
                      { value: 'other', label: 'Other' },
                    ]}
                    className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
                  />
                  <Textarea label="Describe the Issue" name="details" value={feedbackForm.details} onChange={e => setFeedbackForm({...feedbackForm, details: e.target.value})} required rows={4} className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-[#a371f7] to-[#8b5cf6] text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition-all">
                      Submit Feedback
                    </button>
                    <button type="button" onClick={() => setShowFeedbackForm(false)} className="px-6 py-3 rounded font-medium text-[#8b949e] border border-[#30363d] hover:bg-[#21262d] transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Advising Request Form Modal */}
          {showAdvisingForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-6">Schedule Advising Session</h3>
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted('advising'); setShowAdvisingForm(false) }} className="space-y-5">
                  <Input label="Full Name" name="name" value={advisingForm.name} onChange={e => setAdvisingForm({...advisingForm, name: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
                  <Input label="Email" type="email" name="email" value={advisingForm.email} onChange={e => setAdvisingForm({...advisingForm, email: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
                  <Input label="PID" name="pid" value={advisingForm.pid} onChange={e => setAdvisingForm({...advisingForm, pid: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
                  <Select label="Topic" name="topic" value={advisingForm.topic} onChange={e => setAdvisingForm({...advisingForm, topic: e.target.value})} required
                    options={[
                      { value: '', label: 'Select topic...' },
                      { value: 'registration', label: 'Course Registration' },
                      { value: 'major', label: 'Major/Minor Declaration' },
                      { value: 'graduation', label: 'Graduation Requirements' },
                      { value: 'transfer', label: 'Transfer Credits' },
                      { value: 'other', label: 'Other' },
                    ]}
                    className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
                  />
                  <Select label="Urgency" name="urgency" value={advisingForm.urgency} onChange={e => setAdvisingForm({...advisingForm, urgency: e.target.value})} required
                    options={[
                      { value: '', label: 'Select urgency...' },
                      { value: 'urgent', label: 'Urgent (within 24 hours)' },
                      { value: 'standard', label: 'Standard (within 1 week)' },
                      { value: 'flexible', label: 'Flexible (within 2 weeks)' },
                    ]}
                    className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
                  />
                  <Textarea label="Additional Details" name="details" value={advisingForm.details} onChange={e => setAdvisingForm({...advisingForm, details: e.target.value})} rows={3} className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-[#3fb950] to-[#2ea043] text-[#0d1117] px-6 py-3 rounded font-semibold hover:opacity-90 transition-all">
                      Submit Request
                    </button>
                    <button type="button" onClick={() => setShowAdvisingForm(false)} className="px-6 py-3 rounded font-medium text-[#8b949e] border border-[#30363d] hover:bg-[#21262d] transition-colors">
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
