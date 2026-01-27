import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Checkbox } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { departments, getKPIStatus, formatNumber } from '../../lib/data'

export default function CivicPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [showFellowsForm, setShowFellowsForm] = useState(false)
  const [registrationForm, setRegistrationForm] = useState({ name: '', email: '', dob: '', address: '', county: '' })
  const [fellowsForm, setFellowsForm] = useState({ name: '', email: '', pid: '', year: '', major: '', motivation: '' })
  const [submitted, setSubmitted] = useState(null)
  const [liveTime, setLiveTime] = useState(new Date())
  const { policies } = useApp()

  const department = departments.find(d => d.id === 'civic')
  const deptPolicies = policies.filter(p => p.department === 'civic')
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

  const handleRegistrationSubmit = (e) => {
    e.preventDefault()
    setSubmitted('voter')
    setShowRegistrationForm(false)
    setRegistrationForm({ name: '', email: '', dob: '', address: '', county: '' })
  }

  const handleFellowsSubmit = (e) => {
    e.preventDefault()
    setSubmitted('fellows')
    setShowFellowsForm(false)
    setFellowsForm({ name: '', email: '', pid: '', year: '', major: '', motivation: '' })
  }

  const tabs = [
    { id: 'dashboard', label: 'Command Center', icon: '◉' },
    { id: 'democracy', label: 'Democracy Hub', icon: '◈' },
    { id: 'fellows', label: 'Service Fellows', icon: '⊕' },
    { id: 'community', label: 'Community', icon: '◎' },
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
        <title>Civic Engagement Command | Project Bold</title>
      </Head>

      {/* Command Center Hero */}
      <div className="relative bg-[#0a0e14] border-b border-[#30363d] overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#a371f7 1px, transparent 1px), linear-gradient(90deg, #a371f7 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#a371f7]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#a371f7]/5 blur-[80px] rounded-full" />

        <div className="relative max-w-[1600px] mx-auto px-6 py-8">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#a371f7]/10 border border-[#a371f7]/30 rounded text-xs font-mono">
                <div className="w-2 h-2 bg-[#a371f7] rounded-full animate-pulse" />
                <span className="text-[#a371f7]">DEMOCRACY ACTIVE</span>
              </div>
              <span className="text-[#6e7681] text-xs font-mono">SERVICE LEVEL: {department?.serviceLevel || 'STANDARD'}</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-[#8b949e]">
              <span>SLA: {department?.sla?.responseTime || '24H'} RESPONSE</span>
              <span className="text-[#a371f7]">{liveTime.toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#a371f7] to-[#8b5cf6] flex items-center justify-center text-2xl">
                  {department?.icon || '🗳️'}
                </div>
                <div>
                  <p className="text-[#a371f7] text-xs font-medium tracking-widest uppercase">Digital Governance Portal</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#f0f6fc] tracking-tight">Civic Engagement</h1>
                </div>
              </div>
              <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed mb-4">
                {department?.tagline || 'Your Voice Matters'} — Voting, service, and community participation. Make it count in elections and in our community.
              </p>
              <div className="flex flex-wrap gap-2">
                {(department?.channels || ['In-Person', 'Digital', 'Events']).map(channel => (
                  <span key={channel} className="px-3 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#8b949e] uppercase tracking-wider">
                    {channel}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Metrics Panel */}
            <div className="bg-[#0d1117]/80 border border-[#30363d] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-[#6e7681] uppercase tracking-widest">Democracy Metrics</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#a371f7] rounded-full animate-pulse" />
                  <span className="text-[10px] text-[#6e7681] font-mono">REAL-TIME</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#f0f6fc]">Initiative Progress</span>
                    <span className="text-[#a371f7] font-mono">{overallProgress}%</span>
                  </div>
                  <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#a371f7] to-[#8b5cf6] rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
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
                    <span className="text-[#6e7681]">Campus Turnout Target</span>
                    <span className="text-[#a371f7] font-mono">78%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Election Alert Banner */}
      <div className="bg-gradient-to-r from-[#a371f7] to-[#8b5cf6] border-b border-[#a371f7]">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <p className="font-semibold text-white uppercase text-sm tracking-wide">NC Primary Election: March 3, 2026</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <button onClick={() => setShowRegistrationForm(true)} className="bg-white text-[#a371f7] px-5 py-2 rounded font-mono font-bold hover:bg-[#f0f6fc] transition-colors flex items-center gap-2">
              <span>◉</span> REGISTER NOW
            </button>
            <span className="bg-white/10 border border-white/30 text-white px-5 py-2 rounded font-mono">
              Deadline: Feb 7
            </span>
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
                    ? 'border-[#a371f7] text-[#a371f7] bg-[#a371f7]/5'
                    : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-[#a371f7]' : 'text-[#6e7681]'}>{tab.icon}</span>
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
                {submitted === 'voter' && 'Thank you! Check your email for next steps to complete your voter registration.'}
                {submitted === 'fellows' && 'Your Civic Fellows application has been submitted! We will review and contact you within 2 weeks.'}
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
                    // Default KPIs when no policy data
                    [
                      { name: 'Students Registered', current: 4560, target: 6000, unit: 'students', color: '#a371f7' },
                      { name: 'Registration Events', current: 23, target: 30, unit: 'events', color: '#58a6ff' },
                      { name: 'Active Volunteers', current: 89, target: 120, unit: 'volunteers', color: '#3fb950' },
                      { name: 'Campus Turnout', current: 65, target: 78, unit: '%', color: '#d29922' },
                    ].map((kpi, i) => (
                      <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#a371f7]/50 transition-all">
                        <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-3">{kpi.name}</p>
                        <div className="flex items-baseline gap-2 mb-2">
                          <p className="text-2xl font-mono font-bold" style={{ color: kpi.color }}>
                            {formatNumber(kpi.current)}
                          </p>
                          <p className="text-sm text-[#6e7681] font-mono">/ {formatNumber(kpi.target)} {kpi.unit}</p>
                        </div>
                        <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${(kpi.current / kpi.target) * 100}%`, backgroundColor: kpi.color }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Access Services */}
              <div>
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Quick Access Services</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button onClick={() => setShowRegistrationForm(true)} className="bg-[#161b22] border border-[#a371f7] rounded-lg p-5 hover:bg-[#a371f7]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#a371f7]/10 rounded-lg flex items-center justify-center group-hover:bg-[#a371f7]/20 transition-all">
                        <span className="text-[#a371f7] text-lg">🗳️</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Voter Registration</p>
                        <p className="text-xs text-[#6e7681]">5-minute process</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Register or update your NC voter registration</p>
                  </button>
                  <button onClick={() => setShowFellowsForm(true)} className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-5 hover:bg-[#58a6ff]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#58a6ff]/10 rounded-lg flex items-center justify-center group-hover:bg-[#58a6ff]/20 transition-all">
                        <span className="text-[#58a6ff] text-lg">🏛️</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Civic Fellows</p>
                        <p className="text-xs text-[#6e7681]">Government internships</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Apply to join our fellowship program</p>
                  </button>
                  <button onClick={() => setActiveTab('community')} className="bg-[#161b22] border border-[#3fb950] rounded-lg p-5 hover:bg-[#3fb950]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#3fb950]/10 rounded-lg flex items-center justify-center group-hover:bg-[#3fb950]/20 transition-all">
                        <span className="text-[#3fb950] text-lg">🤝</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Day of Service</p>
                        <p className="text-xs text-[#6e7681]">March 28, 2026</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Register to volunteer in your community</p>
                  </button>
                </div>
              </div>

              {/* Active Initiatives Grid */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">Active Initiatives</h2>
                  <button onClick={() => setActiveTab('policies')} className="text-xs text-[#a371f7] hover:underline">VIEW ALL →</button>
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  {deptPolicies.filter(p => p.status !== 'completed').slice(0, 4).map(policy => (
                    <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#a371f7]/50 transition-all">
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
                          {policy.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>
                      <p className="text-sm text-[#8b949e] mb-4 line-clamp-2">{policy.description}</p>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[#6e7681]">Progress</span>
                        <span className="text-[#a371f7] font-mono">{policy.progress}%</span>
                      </div>
                      <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#a371f7] to-[#8b5cf6] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
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
                  {deptPolicies.filter(p => p.status !== 'completed').length === 0 && (
                    <div className="col-span-2 bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
                      <p className="text-[#6e7681]">No active initiatives at this time</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Important Dates */}
              <div>
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Upcoming Deadlines</h2>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody className="divide-y divide-[#21262d]">
                      {[
                        { date: 'Feb 7, 2026', event: 'Voter Registration Deadline', status: 'urgent' },
                        { date: 'Feb 13-29, 2026', event: 'Early Voting Period', status: 'upcoming' },
                        { date: 'Mar 3, 2026', event: 'Primary Election Day', status: 'upcoming' },
                        { date: 'Mar 28, 2026', event: 'Carolina Day of Service', status: 'scheduled' },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-[#21262d] transition-colors">
                          <td className="px-5 py-4 font-mono text-[#a371f7]">{item.date}</td>
                          <td className="px-5 py-4 text-[#f0f6fc]">{item.event}</td>
                          <td className="px-5 py-4 text-right">
                            <span className={`px-2.5 py-1 rounded text-xs font-mono border ${
                              item.status === 'urgent' ? 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]' :
                              item.status === 'upcoming' ? 'bg-[#a371f7]/10 text-[#a371f7] border-[#a371f7]' :
                              'bg-[#21262d] text-[#6e7681] border-[#30363d]'
                            }`}>
                              {item.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Democracy Hub Tab */}
          {activeTab === 'democracy' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Democracy Hub</h2>
                  <p className="text-[#8b949e] mt-2">Your one-stop portal for voter registration, polling info, and civic education</p>
                </div>
                <button
                  onClick={() => setShowRegistrationForm(true)}
                  className="bg-gradient-to-r from-[#a371f7] to-[#8b5cf6] text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition-all uppercase text-sm tracking-wide"
                >
                  Register to Vote
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { value: '4,560', label: 'Students', sublabel: 'Registered', color: '#a371f7' },
                  { value: '23', label: 'Registration', sublabel: 'Events', color: '#58a6ff' },
                  { value: '89', label: 'Active', sublabel: 'Volunteers', color: '#3fb950' },
                  { value: '78%', label: 'Turnout', sublabel: 'Goal', color: '#d29922' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center hover:border-[#a371f7]/50 transition-all">
                    <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">{stat.label}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Action Cards */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-[#a371f7]/20 to-[#a371f7]/5 border border-[#a371f7]/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-[#f0f6fc] mb-2">Register to Vote</h3>
                  <p className="text-[#8b949e] mb-5">Takes only 5 minutes. Register or update your registration.</p>
                  <button
                    onClick={() => setShowRegistrationForm(true)}
                    className="bg-[#a371f7] text-white px-5 py-2.5 rounded font-medium hover:bg-[#8b5cf6] transition-colors"
                  >
                    Start Registration
                  </button>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="text-xl font-bold text-[#f0f6fc] mb-2">Check Your Status</h3>
                  <p className="text-[#8b949e] mb-5">Verify your voter registration and find your polling place.</p>
                  <a href="https://vt.ncsbe.gov/RegLkup/" target="_blank" rel="noopener noreferrer">
                    <button className="bg-[#21262d] text-[#f0f6fc] border border-[#30363d] px-5 py-2.5 rounded font-medium hover:bg-[#30363d] hover:border-[#8b949e] transition-colors">
                      Check Status
                    </button>
                  </a>
                </div>
              </div>

              {/* Polling Locations */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Campus Polling Locations</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: 'Student Union', address: 'Frank Porter Graham Student Union', precinct: 'Chapel Hill 2', hours: '6:30 AM - 7:30 PM' },
                    { name: 'Rams Head Recreation', address: '101 Student Recreation Center Way', precinct: 'Chapel Hill 3', hours: '6:30 AM - 7:30 PM' },
                  ].map((loc, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#a371f7]/50 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-[#f0f6fc]">{loc.name}</h4>
                        <span className="px-2.5 py-1 rounded text-xs font-mono bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]/30">OPEN</span>
                      </div>
                      <p className="text-sm text-[#8b949e]">{loc.address}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#21262d]">
                        <p className="text-xs text-[#a371f7] font-mono">Precinct: {loc.precinct}</p>
                        <p className="text-xs text-[#6e7681] font-mono">{loc.hours}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Election Transit */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">Election Day Transit</h3>
                    <p className="text-xs text-[#6e7681] mt-1">Free shuttle service to all polling locations</p>
                  </div>
                  <span className="px-3 py-1.5 rounded text-xs font-mono bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/30">5 ROUTES</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { name: 'Route A: South Campus', frequency: 'Every 15 min' },
                    { name: 'Route B: North Campus', frequency: 'Every 15 min' },
                    { name: 'Route C: Off-Campus', frequency: 'Every 20 min' },
                  ].map((route, i) => (
                    <div key={i} className="bg-[#0d1117] rounded-lg p-4">
                      <p className="font-medium text-[#f0f6fc] text-sm">{route.name}</p>
                      <p className="text-xs text-[#a371f7] font-mono mt-1">{route.frequency}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Dates */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Election Calendar</h3>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody className="divide-y divide-[#21262d]">
                      {[
                        { date: 'Feb 7, 2026', event: 'Voter Registration Deadline' },
                        { date: 'Feb 13-29, 2026', event: 'Early Voting Period' },
                        { date: 'Mar 3, 2026', event: 'Primary Election Day' },
                        { date: 'Oct 9, 2026', event: 'General Election Registration Deadline' },
                        { date: 'Nov 3, 2026', event: 'General Election Day' },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-[#21262d] transition-colors">
                          <td className="px-5 py-4 font-mono text-[#a371f7]">{item.date}</td>
                          <td className="px-5 py-4 text-[#8b949e]">{item.event}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Service Fellows Tab */}
          {activeTab === 'fellows' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Civic Fellows Program</h2>
                  <p className="text-[#8b949e] mt-2">Fellowship connecting students with local government internships and leadership opportunities</p>
                </div>
                <button
                  onClick={() => setShowFellowsForm(true)}
                  className="bg-gradient-to-r from-[#58a6ff] to-[#388bfd] text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition-all uppercase text-sm tracking-wide"
                >
                  Apply Now
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { value: '24', label: 'Current', sublabel: 'Fellows', color: '#a371f7' },
                  { value: '18', label: 'Active', sublabel: 'Placements', color: '#58a6ff' },
                  { value: '12', label: 'Government', sublabel: 'Partners', color: '#3fb950' },
                  { value: '96%', label: 'Completion', sublabel: 'Rate', color: '#d29922' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center hover:border-[#a371f7]/50 transition-all">
                    <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">{stat.label}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Partner Organizations */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Placement Partners</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { org: 'Chapel Hill Town Council', type: 'Municipal', icon: '🏛️' },
                    { org: 'Carrboro Town Hall', type: 'Municipal', icon: '🏢' },
                    { org: 'Orange County Government', type: 'County', icon: '📋' },
                    { org: 'NC General Assembly', type: 'State', icon: '⚖️' },
                    { org: 'Governor\'s Office', type: 'Executive', icon: '🎖️' },
                    { org: 'Secretary of State', type: 'State', icon: '📜' },
                  ].map((partner, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#a371f7]/50 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{partner.icon}</span>
                        <div>
                          <p className="font-medium text-[#f0f6fc]">{partner.org}</p>
                          <p className="text-xs text-[#6e7681] font-mono">{partner.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fellowship Tracks */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Fellowship Tracks</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: '⊕', title: 'Policy Research', desc: 'Legislative analysis and briefings', color: '#a371f7' },
                    { icon: '◎', title: 'Constituent Services', desc: 'Direct community engagement', color: '#58a6ff' },
                    { icon: '◇', title: 'Communications', desc: 'Public affairs and media', color: '#3fb950' },
                    { icon: '⬡', title: 'Administration', desc: 'Operations and management', color: '#d29922' },
                  ].map((track, i) => (
                    <div key={i} className="bg-[#0d1117] rounded-lg p-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-lg" style={{ backgroundColor: `${track.color}15`, color: track.color }}>
                        {track.icon}
                      </div>
                      <h4 className="font-semibold text-[#f0f6fc]">{track.title}</h4>
                      <p className="text-xs text-[#8b949e] mt-1">{track.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Application Process</h3>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="grid md:grid-cols-4 gap-6">
                    {[
                      { step: '01', title: 'Apply Online', desc: 'Submit application and resume' },
                      { step: '02', title: 'Interview', desc: 'Meet with program directors' },
                      { step: '03', title: 'Placement', desc: 'Matched with government office' },
                      { step: '04', title: 'Fellowship', desc: '10-15 hours per week' },
                    ].map(item => (
                      <div key={item.step} className="flex gap-4">
                        <span className="w-10 h-10 bg-[#a371f7]/10 border border-[#a371f7]/30 text-[#a371f7] rounded-lg flex items-center justify-center font-mono text-sm shrink-0">{item.step}</span>
                        <div>
                          <p className="font-semibold text-[#f0f6fc]">{item.title}</p>
                          <p className="text-sm text-[#6e7681] mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Community Tab */}
          {activeTab === 'community' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Community Engagement</h2>
                  <p className="text-[#8b949e] mt-2">Carolina Day of Service and Democracy Week programming</p>
                </div>
              </div>

              {/* Day of Service */}
              <div className="bg-gradient-to-br from-[#3fb950]/20 to-[#3fb950]/5 border border-[#3fb950]/30 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#f0f6fc]">Carolina Day of Service</h3>
                    <p className="text-[#8b949e] mt-1">Annual community service event bringing together hundreds of Tar Heels</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-mono font-bold text-[#3fb950]">March 28, 2026</p>
                    <p className="text-xs text-[#6e7681] uppercase tracking-widest">Save the Date</p>
                  </div>
                </div>
                <button className="bg-[#3fb950] text-[#0d1117] px-6 py-3 rounded font-semibold hover:opacity-90 transition-all uppercase text-sm tracking-wide">
                  Register to Volunteer
                </button>
              </div>

              {/* Service Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { value: '500+', label: 'Volunteers', sublabel: 'Expected', color: '#3fb950' },
                  { value: '25', label: 'Service', sublabel: 'Sites', color: '#58a6ff' },
                  { value: '2,000', label: 'Hours', sublabel: 'Contributed', color: '#a371f7' },
                  { value: '15', label: 'Community', sublabel: 'Partners', color: '#d29922' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center hover:border-[#a371f7]/50 transition-all">
                    <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">{stat.label}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Service Areas */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Service Areas</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { area: 'Environmental', desc: 'Park cleanups and tree planting', icon: '🌳', color: '#3fb950' },
                    { area: 'Education', desc: 'Tutoring and mentoring programs', icon: '📚', color: '#58a6ff' },
                    { area: 'Community', desc: 'Food banks and shelters', icon: '🤝', color: '#d29922' },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#a371f7]/50 transition-all">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 text-2xl" style={{ backgroundColor: `${item.color}15` }}>
                        {item.icon}
                      </div>
                      <h4 className="font-semibold text-[#f0f6fc]">{item.area}</h4>
                      <p className="text-sm text-[#8b949e] mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Democracy Week */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">Democracy Week Events</h3>
                    <p className="text-xs text-[#6e7681] mt-1">A week of civic education, voter engagement, and democratic participation</p>
                  </div>
                  <span className="px-3 py-1.5 rounded text-xs font-mono bg-[#a371f7]/10 text-[#a371f7] border border-[#a371f7]/30">OCT 15-18</span>
                </div>
                <div className="space-y-3">
                  {[
                    { title: 'Voter Registration Drive', date: 'Oct 15, 2026', time: '10am-4pm', location: 'The Pit' },
                    { title: 'Candidate Forum', date: 'Oct 16, 2026', time: '6pm', location: 'Memorial Hall' },
                    { title: 'Democracy & Dialogue Workshop', date: 'Oct 17, 2026', time: '3pm', location: 'Student Union' },
                    { title: 'Mock Election', date: 'Oct 18, 2026', time: 'All Day', location: 'Online' },
                  ].map((event, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#a371f7]/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#a371f7]/10 border border-[#a371f7]/30 rounded-lg flex items-center justify-center">
                          <span className="text-[#a371f7] font-mono text-sm">{event.date.split(' ')[1]}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#f0f6fc]">{event.title}</p>
                          <p className="text-xs text-[#6e7681] font-mono">{event.time} | {event.location}</p>
                        </div>
                      </div>
                      <button className="bg-[#21262d] text-[#f0f6fc] border border-[#30363d] px-5 py-2.5 rounded font-medium hover:bg-[#30363d] hover:border-[#8b949e] transition-colors text-sm uppercase tracking-wide">
                        RSVP
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Initiatives Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">All Civic Initiatives</h2>
                <span className="text-xs text-[#6e7681] font-mono">{deptPolicies.length} INITIATIVES</span>
              </div>
              <div className="space-y-4">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#a371f7]/50 transition-all">
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
                        <p className="text-3xl font-mono font-bold text-[#a371f7]">{policy.progress}%</p>
                        <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">Progress</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-[#21262d] rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-gradient-to-r from-[#a371f7] to-[#8b5cf6] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
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
                          <span key={f} className="px-2.5 py-1 bg-[#a371f7]/10 text-[#a371f7] border border-[#a371f7]/30 rounded text-xs font-mono">
                            {f.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {deptPolicies.length === 0 && (
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
                    <p className="text-[#6e7681]">No civic initiatives found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voter Registration Form Modal */}
          {showRegistrationForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-2">Voter Registration Assistance</h3>
                <p className="text-sm text-[#8b949e] mb-6">We'll help you complete your NC voter registration form.</p>
                <form onSubmit={handleRegistrationSubmit} className="space-y-5">
                  <Input label="Full Legal Name" name="name" value={registrationForm.name} onChange={e => setRegistrationForm({...registrationForm, name: e.target.value})} required />
                  <Input label="Email" type="email" name="email" value={registrationForm.email} onChange={e => setRegistrationForm({...registrationForm, email: e.target.value})} required />
                  <Input label="Date of Birth" type="date" name="dob" value={registrationForm.dob} onChange={e => setRegistrationForm({...registrationForm, dob: e.target.value})} required />
                  <Input label="NC Residential Address" name="address" value={registrationForm.address} onChange={e => setRegistrationForm({...registrationForm, address: e.target.value})} required />
                  <Select label="County" name="county" value={registrationForm.county} onChange={e => setRegistrationForm({...registrationForm, county: e.target.value})} required
                    options={[
                      { value: 'orange', label: 'Orange County' },
                      { value: 'durham', label: 'Durham County' },
                      { value: 'wake', label: 'Wake County' },
                      { value: 'other', label: 'Other NC County' },
                    ]}
                  />
                  <Checkbox label="I am a US citizen and will be 18 by election day" />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-[#a371f7] to-[#8b5cf6] text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition-all">
                      Submit Registration
                    </button>
                    <button type="button" onClick={() => setShowRegistrationForm(false)} className="px-6 py-3 rounded font-medium text-[#8b949e] border border-[#30363d] hover:bg-[#21262d] transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Civic Fellows Form Modal */}
          {showFellowsForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-6">Civic Fellows Application</h3>
                <form onSubmit={handleFellowsSubmit} className="space-y-5">
                  <Input label="Full Name" name="name" value={fellowsForm.name} onChange={e => setFellowsForm({...fellowsForm, name: e.target.value})} required />
                  <Input label="Email" type="email" name="email" value={fellowsForm.email} onChange={e => setFellowsForm({...fellowsForm, email: e.target.value})} required />
                  <Input label="PID" name="pid" value={fellowsForm.pid} onChange={e => setFellowsForm({...fellowsForm, pid: e.target.value})} required />
                  <Select label="Year" name="year" value={fellowsForm.year} onChange={e => setFellowsForm({...fellowsForm, year: e.target.value})} required
                    options={[
                      { value: 'sophomore', label: 'Sophomore' },
                      { value: 'junior', label: 'Junior' },
                      { value: 'senior', label: 'Senior' },
                    ]}
                  />
                  <Input label="Major" name="major" value={fellowsForm.major} onChange={e => setFellowsForm({...fellowsForm, major: e.target.value})} required />
                  <Textarea label="Why are you interested in civic engagement?" name="motivation" value={fellowsForm.motivation} onChange={e => setFellowsForm({...fellowsForm, motivation: e.target.value})} required rows={4} />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-[#58a6ff] to-[#388bfd] text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition-all">
                      Submit Application
                    </button>
                    <button type="button" onClick={() => setShowFellowsForm(false)} className="px-6 py-3 rounded font-medium text-[#8b949e] border border-[#30363d] hover:bg-[#21262d] transition-colors">
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
