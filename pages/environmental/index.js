import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { departments, getKPIStatus, formatNumber, formatCurrency } from '../../lib/data'

export default function EnvironmentalPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showCommitteeForm, setShowCommitteeForm] = useState(false)
  const [projectForm, setProjectForm] = useState({ title: '', name: '', email: '', org: '', amount: '', description: '', impact: '' })
  const [committeeForm, setCommitteeForm] = useState({ name: '', email: '', pid: '', year: '', major: '', motivation: '' })
  const [submitted, setSubmitted] = useState(null)
  const [liveTime, setLiveTime] = useState(new Date())
  const { policies } = useApp()

  const department = departments.find(d => d.id === 'environmental')
  const accentColor = '#10b981'
  const deptPolicies = policies.filter(p => p.department === 'environmental')
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

  const handleProjectSubmit = (e) => {
    e.preventDefault()
    setSubmitted('project')
    setShowProjectForm(false)
    setProjectForm({ title: '', name: '', email: '', org: '', amount: '', description: '', impact: '' })
  }

  const handleCommitteeSubmit = (e) => {
    e.preventDefault()
    setSubmitted('committee')
    setShowCommitteeForm(false)
    setCommitteeForm({ name: '', email: '', pid: '', year: '', major: '', motivation: '' })
  }

  const tabs = [
    { id: 'dashboard', label: 'Command Center', icon: '◉' },
    { id: 'carbon', label: 'Carbon Zero', icon: '◈' },
    { id: 'greenfund', label: 'Green Fund', icon: '⊕' },
    { id: 'mobility', label: 'Mobility', icon: '◎' },
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

  // Environmental-specific data
  const carbonData = {
    currentReduction: 12,
    target: 100,
    baselineYear: 2007,
    targetYear: 2040,
    signatures: 890,
    actions: 45,
    meetings: 5
  }

  const greenFundData = {
    totalFunded: 156000,
    projectsFunded: 23,
    applications: 45,
    recentProjects: [
      { name: 'Solar Panel Installation - Davis Library', amount: 25000, org: 'Facilities Services' },
      { name: 'Campus Composting Bins', amount: 8500, org: 'Sustainability Office' },
      { name: 'Native Plant Garden', amount: 5000, org: 'Environmental Sciences Club' },
      { name: 'E-Bike Fleet Expansion', amount: 15000, org: 'Transportation' },
    ]
  }

  const bikeShareData = {
    bikesAvailable: 89,
    stations: 12,
    ridesThisMonth: 4500,
    stations: [
      { name: 'Student Union', bikes: 12, available: 8 },
      { name: 'Davis Library', bikes: 10, available: 6 },
      { name: 'Rams Head', bikes: 8, available: 5 },
      { name: 'Friday Center', bikes: 6, available: 3 },
      { name: 'Morrison', bikes: 8, available: 7 },
      { name: 'Carmichael', bikes: 10, available: 4 },
    ]
  }

  const diningData = {
    plasticsReduced: 45000,
    locations: 12,
    satisfaction: 4.1,
    initiatives: [
      { name: 'Reusable Container Program', status: 'Active', locations: 'All dining halls', progress: 75 },
      { name: 'Compostable Utensils', status: 'Active', locations: 'Lenoir, Chase', progress: 60 },
      { name: 'Trayless Dining', status: 'Pilot', locations: 'Lenoir', progress: 40 },
      { name: 'Local Food Sourcing', status: 'Expanding', locations: "Ram's Head", progress: 55 },
    ]
  }

  const climateCommittee = {
    members: 15,
    meetings: 12,
    initiatives: 8,
    currentInitiatives: [
      'Advocating for 100% renewable energy by 2035',
      'Expanding campus EV charging infrastructure',
      'Implementing green building standards for new construction',
      'Creating sustainability curriculum requirements',
    ],
    nextMeeting: { date: 'February 5, 2026', time: '5:00 PM', location: 'Student Union Room 3407' }
  }

  return (
    <Layout>
      <Head>
        <title>Sustainability Command Center | Project Bold</title>
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] blur-[120px] rounded-full" style={{ backgroundColor: `${accentColor}15` }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] blur-[80px] rounded-full" style={{ backgroundColor: `${accentColor}08` }} />

        <div className="relative max-w-[1600px] mx-auto px-6 py-8">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono" style={{ backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}50` }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                <span style={{ color: accentColor }}>SYSTEM ONLINE</span>
              </div>
              <span className="text-[#6e7681] text-xs font-mono">SERVICE LEVEL: {department?.serviceLevel}</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-[#8b949e]">
              <span>SLA: {department?.sla?.responseTime} RESPONSE</span>
              <span style={{ color: accentColor }}>{liveTime.toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
                  {department?.icon}
                </div>
                <div>
                  <p className="text-xs font-medium tracking-widest uppercase" style={{ color: accentColor }}>Sustainability Command Center</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#f0f6fc] tracking-tight">Environmental Affairs</h1>
                </div>
              </div>
              <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed mb-4">
                {department?.tagline} — {department?.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {department?.channels?.map(channel => (
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
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                  <span className="text-[10px] text-[#6e7681] font-mono">REAL-TIME</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#f0f6fc]">Department Progress</span>
                    <span className="font-mono" style={{ color: accentColor }}>{overallProgress}%</span>
                  </div>
                  <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${overallProgress}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)` }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-mono font-bold" style={{ color: accentColor }}>{statusCounts.completed}</p>
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
                    <span className="font-mono" style={{ color: accentColor }}>{department?.satisfactionTarget}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Climate Action Banner */}
      <div style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}dd)`, borderBottom: `1px solid ${accentColor}` }}>
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <p className="font-semibold text-white uppercase text-sm tracking-wide">Carbon Neutrality by 2040</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <button className="bg-white text-[#0d1117] px-5 py-2 rounded font-mono font-bold hover:bg-[#f0f6fc] transition-colors flex items-center gap-2">
              <span>◉</span> SIGN PETITION
            </button>
            <button className="bg-white/10 border border-white/30 text-white px-5 py-2 rounded font-mono hover:bg-white/20 transition-colors">
              TRACK PROGRESS
            </button>
            <button className="bg-white/10 border border-white/30 text-white px-5 py-2 rounded font-mono hover:bg-white/20 transition-colors">
              JOIN COMMITTEE
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
                    ? 'text-[#f0f6fc] bg-opacity-5'
                    : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
                style={activeTab === tab.id ? { borderColor: accentColor, color: accentColor, backgroundColor: `${accentColor}08` } : {}}
              >
                <span style={{ color: activeTab === tab.id ? accentColor : '#6e7681' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="bg-[#0d1117] min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {submitted && (
            <div className="mb-8 bg-[#161b22] rounded-lg p-5 flex items-center justify-between" style={{ border: `1px solid ${accentColor}` }}>
              <p className="text-[#f0f6fc] font-medium">
                {submitted === 'project' && 'Your Green Fund application has been submitted! We will review and contact you within 2 weeks.'}
                {submitted === 'committee' && 'Thank you for your interest in the Climate Action Committee! We will reach out about next steps.'}
              </p>
              <button onClick={() => setSubmitted(null)} className="text-sm font-medium hover:underline" style={{ color: accentColor }}>
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
                  {Object.entries(aggregateKPIs).slice(0, 8).map(([name, data]) => {
                    const status = getKPIStatus(data.current, data.target)
                    const statusColors = {
                      achieved: { bg: `${accentColor}15`, border: accentColor, text: accentColor },
                      'on-track': { bg: 'rgba(88, 166, 255, 0.1)', border: '#58a6ff', text: '#58a6ff' },
                      'at-risk': { bg: 'rgba(210, 153, 34, 0.1)', border: '#d29922', text: '#d29922' },
                      behind: { bg: 'rgba(248, 81, 73, 0.1)', border: '#f85149', text: '#f85149' }
                    }
                    const colors = statusColors[status]
                    const percentage = data.target > 0 ? Math.min(100, (data.current / data.target) * 100) : 0

                    return (
                      <div key={name} className="rounded-lg p-4" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-xs text-[#8b949e] uppercase tracking-wider">{name}</p>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                            {status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <p className="text-2xl font-mono font-bold" style={{ color: colors.text }}>
                            {formatNumber(data.current)}
                          </p>
                          <p className="text-sm text-[#6e7681] font-mono">/ {formatNumber(data.target)} {data.unit}</p>
                        </div>
                        <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: colors.text }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Access Services */}
              <div>
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Quick Access Services</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('carbon')}
                    className="bg-[#161b22] rounded-lg p-5 hover:bg-opacity-80 transition-all group text-left"
                    style={{ border: `1px solid ${accentColor}` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all" style={{ backgroundColor: `${accentColor}15` }}>
                        <span className="text-lg" style={{ color: accentColor }}>◈</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Carbon Tracking</p>
                        <p className="text-xs text-[#6e7681]">Real-time Emissions</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Monitor campus carbon footprint and reduction progress</p>
                  </button>
                  <button
                    onClick={() => setShowProjectForm(true)}
                    className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-5 hover:bg-[#58a6ff]/5 transition-all group text-left"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#58a6ff]/10 rounded-lg flex items-center justify-center group-hover:bg-[#58a6ff]/20 transition-all">
                        <span className="text-[#58a6ff] text-lg">⊕</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Green Fund</p>
                        <p className="text-xs text-[#6e7681]">Apply for Funding</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Submit your sustainability project proposal</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('mobility')}
                    className="bg-[#161b22] border border-[#a371f7] rounded-lg p-5 hover:bg-[#a371f7]/5 transition-all group text-left"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#a371f7]/10 rounded-lg flex items-center justify-center group-hover:bg-[#a371f7]/20 transition-all">
                        <span className="text-[#a371f7] text-lg">◎</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Bike Share</p>
                        <p className="text-xs text-[#6e7681]">Smart Mobility Hub</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Check bike availability and station status</p>
                  </button>
                </div>
              </div>

              {/* Active Initiatives */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">Active Initiatives</h2>
                  <button onClick={() => setActiveTab('policies')} className="text-xs hover:underline" style={{ color: accentColor }}>
                    VIEW ALL →
                  </button>
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  {deptPolicies.filter(p => p.status !== 'completed').slice(0, 4).map(policy => (
                    <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-opacity-50 transition-all" style={{ '--hover-border': accentColor }}>
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
                        <span className="font-mono" style={{ color: accentColor }}>{policy.progress}%</span>
                      </div>
                      <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${policy.progress}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)` }} />
                      </div>
                      {policy.milestones && (
                        <div className="mt-4 pt-3 border-t border-[#21262d]">
                          <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-2">Milestones</p>
                          <div className="flex gap-2 overflow-x-auto">
                            {policy.milestones.slice(0, 3).map((m, i) => (
                              <span key={i} className={`flex-shrink-0 px-2 py-1 rounded text-[10px] font-mono ${
                                m.status === 'completed' ? 'bg-[#10b981]/10 text-[#10b981]' :
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

              {/* Environmental Impact Summary */}
              <div>
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Impact Summary</h2>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold" style={{ color: accentColor }}>{carbonData.currentReduction}%</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">Carbon Reduced</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">From 2007</p>
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold text-[#58a6ff]">{formatCurrency(greenFundData.totalFunded).replace('.00', '')}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">Total Funded</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">Green Projects</p>
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold text-[#a371f7]">{formatNumber(bikeShareData.ridesThisMonth)}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">Bike Rides</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">This Month</p>
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold text-[#d29922]">{formatNumber(diningData.plasticsReduced)}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">Plastics Cut</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">This Year</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Carbon Zero Tab */}
          {activeTab === 'carbon' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Carbon Zero Command Center</h2>
                  <p className="text-[#8b949e] mt-2">Real-time carbon tracking with reduction targets and impact visualization</p>
                </div>
                <button className="px-6 py-3 rounded font-semibold hover:opacity-90 transition-all uppercase text-sm tracking-wide text-[#0d1117]" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)` }}>
                  Sign Petition
                </button>
              </div>

              {/* Progress */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#f0f6fc] uppercase text-xs tracking-widest">UNC Carbon Reduction Progress</h3>
                  <span className="text-[#6e7681] text-xs font-mono">TARGET: {carbonData.targetYear}</span>
                </div>
                <div className="flex items-center gap-6 mb-4">
                  <div className="text-5xl font-mono font-bold tracking-tight" style={{ color: accentColor }}>{carbonData.currentReduction}%</div>
                  <div className="flex-1">
                    <p className="text-sm text-[#8b949e] mb-2">Reduction from {carbonData.baselineYear} baseline</p>
                    <div className="h-3 bg-[#21262d] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${carbonData.currentReduction}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)` }} />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#6e7681]">Goal: Carbon neutrality by {carbonData.targetYear}</p>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-bold" style={{ color: accentColor }}>{carbonData.signatures}</p>
                  <p className="text-xs text-[#f0f6fc] mt-1">Petition Signatures</p>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">and counting</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-bold text-[#58a6ff]">{carbonData.actions}</p>
                  <p className="text-xs text-[#f0f6fc] mt-1">Actions Taken</p>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">by students</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-bold text-[#a371f7]">{carbonData.meetings}</p>
                  <p className="text-xs text-[#f0f6fc] mt-1">Admin Meetings</p>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">completed</p>
                </div>
              </div>

              {/* Sustainable Dining */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Zero Waste Dining Initiative</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold" style={{ color: accentColor }}>{formatNumber(diningData.plasticsReduced)}</p>
                    <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Plastics Reduced</p>
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold text-[#58a6ff]">{diningData.locations}</p>
                    <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Dining Locations</p>
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold text-[#a371f7]">{diningData.satisfaction}/5</p>
                    <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Satisfaction</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {diningData.initiatives.map((item, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-[#f0f6fc]">{item.name}</h4>
                          <p className="text-sm text-[#6e7681]">{item.locations}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-transparent rounded text-xs font-mono uppercase" style={{ border: `1px solid ${accentColor}`, color: accentColor }}>
                          {item.status}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.progress}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Take Action */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Take Action</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-[#161b22] rounded-lg p-6" style={{ border: `1px solid ${accentColor}` }}>
                    <h4 className="font-semibold text-lg text-[#f0f6fc] mb-2">Sign the Petition</h4>
                    <p className="text-[#8b949e] mb-4">Demand accelerated carbon neutrality timeline from university leadership.</p>
                    <button className="text-[#0d1117] px-5 py-2.5 rounded font-medium transition-colors" style={{ backgroundColor: accentColor }}>
                      Sign Now
                    </button>
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h4 className="font-semibold text-lg text-[#f0f6fc] mb-2">Contact Administration</h4>
                    <p className="text-[#8b949e] mb-4">Send a pre-written email to the Chancellor's office.</p>
                    <button className="bg-[#21262d] text-[#f0f6fc] px-5 py-2.5 rounded font-medium hover:bg-[#30363d] border border-[#30363d] transition-colors">
                      Send Email
                    </button>
                  </div>
                </div>
              </div>

              {/* Impact Calculator */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-2">Calculate Your Impact</h3>
                <p className="text-sm text-[#8b949e] mb-4">See how your daily choices affect carbon emissions.</p>
                <button className="text-[#0d1117] px-5 py-2.5 rounded font-medium transition-colors" style={{ backgroundColor: accentColor }}>
                  Open Calculator
                </button>
              </div>
            </div>
          )}

          {/* Green Fund Tab */}
          {activeTab === 'greenfund' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Student Green Investment Fund</h2>
                  <p className="text-[#8b949e] mt-2">Student-governed sustainability fund with project proposals and voting</p>
                </div>
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="px-6 py-3 rounded font-semibold hover:opacity-90 transition-all uppercase text-sm tracking-wide text-[#0d1117]"
                  style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)` }}
                >
                  Apply for Funding
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-bold" style={{ color: accentColor }}>{formatCurrency(greenFundData.totalFunded).replace('.00', '')}</p>
                  <p className="text-xs text-[#f0f6fc] mt-1">Total Funded</p>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">since inception</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-bold text-[#58a6ff]">{greenFundData.projectsFunded}</p>
                  <p className="text-xs text-[#f0f6fc] mt-1">Projects Funded</p>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">approved</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-bold text-[#a371f7]">{greenFundData.applications}</p>
                  <p className="text-xs text-[#f0f6fc] mt-1">Applications</p>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">received</p>
                </div>
              </div>

              {/* Application Process */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-4 uppercase text-xs tracking-widest">How to Apply</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { step: 1, title: 'Submit Proposal', desc: 'Complete the application form with project details' },
                    { step: 2, title: 'Committee Review', desc: 'Green Fund Committee evaluates feasibility' },
                    { step: 3, title: 'Student Vote', desc: 'Campus-wide voting on approved proposals' },
                    { step: 4, title: 'Get Funded', desc: 'Approved projects receive funding allocation' },
                  ].map(item => (
                    <div key={item.step} className="text-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-mono font-bold text-[#0d1117]" style={{ backgroundColor: accentColor }}>
                        {item.step}
                      </div>
                      <p className="font-semibold text-[#f0f6fc] text-sm">{item.title}</p>
                      <p className="text-xs text-[#6e7681] mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Funded Projects */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Recently Funded Projects</h3>
                <div className="space-y-3">
                  {greenFundData.recentProjects.map((project, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center justify-between hover:border-opacity-50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
                          <span style={{ color: accentColor }}>⊕</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#f0f6fc]">{project.name}</h4>
                          <p className="text-sm text-[#6e7681]">{project.org}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-lg" style={{ color: accentColor }}>${project.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-[#161b22] rounded-lg p-6 text-center" style={{ border: `1px solid ${accentColor}` }}>
                <h3 className="text-xl font-bold text-[#f0f6fc] mb-2">Have a sustainability idea?</h3>
                <p className="text-[#8b949e] mb-4">Submit your project proposal and get funding to make it happen.</p>
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="text-[#0d1117] px-6 py-3 rounded font-semibold transition-all"
                  style={{ backgroundColor: accentColor }}
                >
                  Start Application
                </button>
              </div>
            </div>
          )}

          {/* Mobility Tab */}
          {activeTab === 'mobility' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Smart Mobility Hub</h2>
                  <p className="text-[#8b949e] mt-2">Integrated bike sharing with real-time availability and trip planning</p>
                </div>
                <button className="bg-[#58a6ff] text-[#0d1117] px-6 py-3 rounded font-semibold hover:opacity-90 transition-all uppercase text-sm tracking-wide">
                  Download App
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold" style={{ color: accentColor }}>{bikeShareData.bikesAvailable}</p>
                  <p className="text-xs text-[#f0f6fc] mt-1">Bikes Available</p>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">campus-wide</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#58a6ff]">12</p>
                  <p className="text-xs text-[#f0f6fc] mt-1">Stations</p>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">active</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#a371f7]">{formatNumber(bikeShareData.ridesThisMonth)}</p>
                  <p className="text-xs text-[#f0f6fc] mt-1">Rides</p>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">this month</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#d29922]">2.4</p>
                  <p className="text-xs text-[#f0f6fc] mt-1">Tons CO2</p>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">saved</p>
                </div>
              </div>

              {/* Station Status */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-[#f0f6fc] uppercase text-xs tracking-widest">Station Status</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                    <span className="text-[10px] text-[#6e7681] font-mono">LIVE</span>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  {bikeShareData.stations.map((station, i) => (
                    <div key={i} className="p-4 bg-[#21262d] border border-[#30363d] rounded-lg hover:border-[#8b949e] transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-[#f0f6fc]">{station.name}</p>
                        <span className={`w-2 h-2 rounded-full ${station.available > 3 ? 'bg-[#10b981]' : station.available > 0 ? 'bg-[#d29922]' : 'bg-[#f85149]'}`} />
                      </div>
                      <p className="text-sm font-mono">
                        <span style={{ color: accentColor }}>{station.available}</span>
                        <span className="text-[#6e7681]">/{station.bikes} available</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* How to Use */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-4 uppercase text-xs tracking-widest">How to Use</h3>
                <ol className="grid md:grid-cols-5 gap-4">
                  {[
                    { step: 1, text: 'Download the UNC Bike Share app' },
                    { step: 2, text: 'Create an account with your UNC email' },
                    { step: 3, text: 'Find an available bike at any station' },
                    { step: 4, text: 'Scan the QR code to unlock' },
                    { step: 5, text: 'Return to any station when done' },
                  ].map(item => (
                    <div key={item.step} className="flex flex-col items-center text-center">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold text-[#0d1117] mb-2" style={{ backgroundColor: accentColor }}>
                        {item.step}
                      </span>
                      <span className="text-sm text-[#8b949e]">{item.text}</span>
                    </div>
                  ))}
                </ol>
              </div>

              {/* Climate Committee */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">Student Climate Council</h3>
                  <button
                    onClick={() => setShowCommitteeForm(true)}
                    className="text-xs hover:underline"
                    style={{ color: accentColor }}
                  >
                    JOIN COMMITTEE →
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold" style={{ color: accentColor }}>{climateCommittee.members}</p>
                    <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Members</p>
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold text-[#58a6ff]">{climateCommittee.meetings}</p>
                    <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Meetings</p>
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold text-[#a371f7]">{climateCommittee.initiatives}</p>
                    <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Initiatives</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {climateCommittee.currentInitiatives.map((initiative, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center gap-4">
                      <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}50` }}>
                        <svg className="w-4 h-4" style={{ color: accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-[#f0f6fc]">{initiative}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h4 className="font-semibold text-[#f0f6fc] mb-2 uppercase text-xs tracking-widest">Next Meeting</h4>
                  <p className="text-xl font-mono font-bold" style={{ color: accentColor }}>{climateCommittee.nextMeeting.date} at {climateCommittee.nextMeeting.time}</p>
                  <p className="text-[#8b949e] mt-1">{climateCommittee.nextMeeting.location}</p>
                  <p className="text-sm text-[#6e7681] mt-3">Meetings are open to all students</p>
                </div>
              </div>
            </div>
          )}

          {/* Policies/Initiatives Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">All Environmental Initiatives</h2>
                <span className="text-xs text-[#6e7681] font-mono">{deptPolicies.length} INITIATIVES</span>
              </div>
              <div className="space-y-4">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-opacity-50 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-[#f0f6fc] text-lg">{policy.title}</h3>
                          <span className={`px-2.5 py-1 rounded text-xs font-mono border ${
                            policy.status === 'completed' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]' :
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
                        <p className="text-3xl font-mono font-bold" style={{ color: accentColor }}>{policy.progress}%</p>
                        <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">Progress</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-[#21262d] rounded-full overflow-hidden mb-4">
                      <div className="h-full rounded-full transition-all" style={{ width: `${policy.progress}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)` }} />
                    </div>

                    {/* KPIs */}
                    {policy.kpis && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {policy.kpis.map((kpi, i) => {
                          const status = getKPIStatus(kpi.current, kpi.target)
                          const colors = {
                            achieved: accentColor,
                            'on-track': '#58a6ff',
                            'at-risk': '#d29922',
                            behind: '#f85149'
                          }
                          return (
                            <div key={i} className="bg-[#0d1117] rounded p-3">
                              <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-1">{kpi.name}</p>
                              <p className="font-mono font-semibold" style={{ color: colors[status] }}>
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
                          <span key={f} className="px-2.5 py-1 rounded text-xs font-mono" style={{ backgroundColor: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}50` }}>
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

          {/* Project Form Modal */}
          {showProjectForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-6">Green Fund Application</h3>
                <form onSubmit={handleProjectSubmit} className="space-y-5">
                  <Input label="Project Title" name="title" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} required />
                  <Input label="Your Name" name="name" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} required />
                  <Input label="Email" type="email" name="email" value={projectForm.email} onChange={e => setProjectForm({...projectForm, email: e.target.value})} required />
                  <Input label="Organization/Department" name="org" value={projectForm.org} onChange={e => setProjectForm({...projectForm, org: e.target.value})} required />
                  <Input label="Funding Requested ($)" type="number" name="amount" value={projectForm.amount} onChange={e => setProjectForm({...projectForm, amount: e.target.value})} required />
                  <Textarea label="Project Description" name="description" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} required rows={4} />
                  <Textarea label="Environmental Impact" name="impact" value={projectForm.impact} onChange={e => setProjectForm({...projectForm, impact: e.target.value})} required rows={3} />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 text-[#0d1117] px-6 py-3 rounded font-semibold hover:opacity-90 transition-all" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)` }}>
                      Submit Application
                    </button>
                    <button type="button" onClick={() => setShowProjectForm(false)} className="px-6 py-3 rounded font-medium text-[#8b949e] border border-[#30363d] hover:bg-[#21262d] transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Committee Form Modal */}
          {showCommitteeForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-6">Join Climate Action Committee</h3>
                <form onSubmit={handleCommitteeSubmit} className="space-y-5">
                  <Input label="Full Name" name="name" value={committeeForm.name} onChange={e => setCommitteeForm({...committeeForm, name: e.target.value})} required />
                  <Input label="Email" type="email" name="email" value={committeeForm.email} onChange={e => setCommitteeForm({...committeeForm, email: e.target.value})} required />
                  <Input label="PID" name="pid" value={committeeForm.pid} onChange={e => setCommitteeForm({...committeeForm, pid: e.target.value})} required />
                  <Select label="Year" name="year" value={committeeForm.year} onChange={e => setCommitteeForm({...committeeForm, year: e.target.value})} required
                    options={[
                      { value: 'freshman', label: 'First Year' },
                      { value: 'sophomore', label: 'Sophomore' },
                      { value: 'junior', label: 'Junior' },
                      { value: 'senior', label: 'Senior' },
                      { value: 'grad', label: 'Graduate Student' },
                    ]}
                  />
                  <Input label="Major" name="major" value={committeeForm.major} onChange={e => setCommitteeForm({...committeeForm, major: e.target.value})} required />
                  <Textarea label="Why do you want to join?" name="motivation" value={committeeForm.motivation} onChange={e => setCommitteeForm({...committeeForm, motivation: e.target.value})} required rows={3} />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 text-[#0d1117] px-6 py-3 rounded font-semibold hover:opacity-90 transition-all" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)` }}>
                      Apply
                    </button>
                    <button type="button" onClick={() => setShowCommitteeForm(false)} className="px-6 py-3 rounded font-medium text-[#8b949e] border border-[#30363d] hover:bg-[#21262d] transition-colors">
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
