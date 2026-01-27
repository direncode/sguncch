import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { departments, wellnessResources, getKPIStatus, formatNumber, formatPercent } from '../../lib/data'

export default function WellnessPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showTrainingForm, setShowTrainingForm] = useState(false)
  const [showAmbassadorForm, setShowAmbassadorForm] = useState(false)
  const [trainingForm, setTrainingForm] = useState({ name: '', email: '', pid: '', role: '', experience: '' })
  const [ambassadorForm, setAmbassadorForm] = useState({ name: '', email: '', pid: '', year: '', major: '', motivation: '' })
  const [submitted, setSubmitted] = useState(null)
  const [liveTime, setLiveTime] = useState(new Date())
  const { policies } = useApp()

  const department = departments.find(d => d.id === 'wellness')
  const deptPolicies = policies.filter(p => p.department === 'wellness')
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

  const handleTrainingSubmit = (e) => {
    e.preventDefault()
    setSubmitted('training')
    setShowTrainingForm(false)
    setTrainingForm({ name: '', email: '', pid: '', role: '', experience: '' })
  }

  const handleAmbassadorSubmit = (e) => {
    e.preventDefault()
    setSubmitted('ambassador')
    setShowAmbassadorForm(false)
    setAmbassadorForm({ name: '', email: '', pid: '', year: '', major: '', motivation: '' })
  }

  const tabs = [
    { id: 'dashboard', label: 'Command Center', icon: '◉' },
    { id: 'resources', label: 'Resources', icon: '◈' },
    { id: 'training', label: 'First Responder', icon: '⊕' },
    { id: 'ambassadors', label: 'Ambassadors', icon: '◎' },
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
        <title>Smart Wellness Hub | Project Bold</title>
      </Head>

      {/* Command Center Hero */}
      <div className="relative bg-[#0a0e14] border-b border-[#30363d] overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#3fb950 1px, transparent 1px), linear-gradient(90deg, #3fb950 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3fb950]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3fb950]/5 blur-[80px] rounded-full" />

        <div className="relative max-w-[1600px] mx-auto px-6 py-8">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded text-xs font-mono">
                <div className="w-2 h-2 bg-[#3fb950] rounded-full animate-pulse" />
                <span className="text-[#3fb950]">SYSTEM ONLINE</span>
              </div>
              <span className="text-[#6e7681] text-xs font-mono">SERVICE LEVEL: {department?.serviceLevel}</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-[#8b949e]">
              <span>SLA: {department?.sla?.responseTime} RESPONSE</span>
              <span className="text-[#3fb950]">{liveTime.toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#3fb950] to-[#2ea043] flex items-center justify-center text-2xl">
                  {department?.icon}
                </div>
                <div>
                  <p className="text-[#3fb950] text-xs font-medium tracking-widest uppercase">Smart Service Hub</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#f0f6fc] tracking-tight">Student Wellness</h1>
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
                  <div className="w-1.5 h-1.5 bg-[#3fb950] rounded-full animate-pulse" />
                  <span className="text-[10px] text-[#6e7681] font-mono">REAL-TIME</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#f0f6fc]">Department Progress</span>
                    <span className="text-[#3fb950] font-mono">{overallProgress}%</span>
                  </div>
                  <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#3fb950] to-[#2ea043] rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
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
                    <span className="text-[#3fb950] font-mono">{department?.satisfactionTarget}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Banner */}
      <div className="bg-gradient-to-r from-[#b62324] to-[#9e1c1c] border-b border-[#da3633]">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <p className="font-semibold text-white uppercase text-sm tracking-wide">24/7 Crisis Support</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="tel:988" className="bg-white text-[#b62324] px-5 py-2 rounded font-mono font-bold hover:bg-[#f0f6fc] transition-colors flex items-center gap-2">
              <span>◉</span> CALL 988
            </a>
            <a href="sms:741741" className="bg-white/10 border border-white/30 text-white px-5 py-2 rounded font-mono hover:bg-white/20 transition-colors">
              TEXT 741741
            </a>
            <a href="tel:919-966-3658" className="bg-white/10 border border-white/30 text-white px-5 py-2 rounded font-mono hover:bg-white/20 transition-colors">
              CAPS: 919-966-3658
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
                    ? 'border-[#3fb950] text-[#3fb950] bg-[#3fb950]/5'
                    : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-[#3fb950]' : 'text-[#6e7681]'}>{tab.icon}</span>
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
                {submitted === 'training' && 'Registration confirmed. You will receive session details shortly.'}
                {submitted === 'ambassador' && 'Application submitted. We will review and contact you within 48 hours.'}
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
                  {Object.entries(aggregateKPIs).slice(0, 8).map(([name, data]) => {
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
                  })}
                </div>
              </div>

              {/* Active Initiatives */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">Active Initiatives</h2>
                  <button onClick={() => setActiveTab('policies')} className="text-xs text-[#3fb950] hover:underline">
                    VIEW ALL →
                  </button>
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  {deptPolicies.filter(p => p.status !== 'completed').slice(0, 4).map(policy => (
                    <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#3fb950]/50 transition-all">
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
                        <span className="text-[#3fb950] font-mono">{policy.progress}%</span>
                      </div>
                      <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#3fb950] to-[#2ea043] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
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

              {/* Quick Actions */}
              <div>
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Quick Access Services</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <a href="https://caps.unc.edu" target="_blank" rel="noopener noreferrer"
                    className="bg-[#161b22] border border-[#3fb950] rounded-lg p-5 hover:bg-[#3fb950]/5 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#3fb950]/10 rounded-lg flex items-center justify-center group-hover:bg-[#3fb950]/20 transition-all">
                        <span className="text-[#3fb950] text-lg">◉</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">CAPS</p>
                        <p className="text-xs text-[#6e7681]">Counseling Services</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Professional counseling and psychological services</p>
                  </a>
                  <button onClick={() => setShowTrainingForm(true)}
                    className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-5 hover:bg-[#58a6ff]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#58a6ff]/10 rounded-lg flex items-center justify-center group-hover:bg-[#58a6ff]/20 transition-all">
                        <span className="text-[#58a6ff] text-lg">⊕</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">First Responder</p>
                        <p className="text-xs text-[#6e7681]">Get Certified</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Register for Mental Health First Aid training</p>
                  </button>
                  <button onClick={() => setShowAmbassadorForm(true)}
                    className="bg-[#161b22] border border-[#a371f7] rounded-lg p-5 hover:bg-[#a371f7]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#a371f7]/10 rounded-lg flex items-center justify-center group-hover:bg-[#a371f7]/20 transition-all">
                        <span className="text-[#a371f7] text-lg">◎</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Join Network</p>
                        <p className="text-xs text-[#6e7681]">Wellness Ambassador</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Apply to join our peer support network</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Resource Directory</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {wellnessResources.map(resource => (
                    <div key={resource.id} className={`bg-[#161b22] border rounded-lg p-5 ${resource.emergency ? 'border-[#da3633]' : 'border-[#30363d]'} hover:border-[#3fb950]/50 transition-all`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-[#f0f6fc]">{resource.name}</h3>
                          <p className="text-xs text-[#6e7681] mt-1 font-mono">{resource.hours}</p>
                        </div>
                        {resource.emergency && (
                          <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-[#da3633]/10 text-[#da3633] border border-[#da3633] animate-pulse">
                            24/7 CRISIS
                          </span>
                        )}
                      </div>
                      {resource.services && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {resource.services.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-[#21262d] text-[#8b949e] text-[10px] rounded uppercase">{s}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-4 pt-3 border-t border-[#21262d]">
                        <a href={`tel:${resource.phone.replace(/\D/g, '')}`} className="text-sm text-[#3fb950] font-mono hover:underline">
                          {resource.phone}
                        </a>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#58a6ff] hover:underline flex items-center gap-1">
                          Website <span className="text-xs">→</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Training Tab */}
          {activeTab === 'training' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Mental Health First Responder</h2>
                  <p className="text-[#8b949e] mt-2">Certified peer responder program with real-time dispatch capabilities</p>
                </div>
                <button
                  onClick={() => setShowTrainingForm(true)}
                  className="bg-gradient-to-r from-[#3fb950] to-[#2ea043] text-[#0d1117] px-6 py-3 rounded font-semibold hover:opacity-90 transition-all uppercase text-sm tracking-wide"
                >
                  Register Now
                </button>
              </div>

              {/* Training Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { value: '0', label: 'Certified', sublabel: 'Responders', color: '#3fb950' },
                  { value: '0', label: 'Sessions', sublabel: 'Completed', color: '#58a6ff' },
                  { value: '0%', label: 'Completion', sublabel: 'Rate', color: '#a371f7' },
                  { value: '0', label: 'Coverage', sublabel: 'Hours/Week', color: '#d29922' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">{stat.label}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Upcoming Sessions */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Upcoming Sessions</h3>
                <div className="space-y-3">
                  {[
                    { date: 'Feb 8, 2026', time: '9:00 AM - 4:00 PM', location: 'Student Union 3201', spots: 12 },
                    { date: 'Feb 22, 2026', time: '9:00 AM - 4:00 PM', location: 'Davis Library 247', spots: 8 },
                    { date: 'Mar 8, 2026', time: '9:00 AM - 4:00 PM', location: 'Student Union 3201', spots: 20 },
                  ].map((session, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-[#3fb950]/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-lg flex items-center justify-center">
                          <span className="text-[#3fb950] font-mono text-sm">{session.date.split(' ')[1]}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#f0f6fc]">{session.date}</p>
                          <p className="text-xs text-[#6e7681] font-mono">{session.time} | {session.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1.5 rounded text-xs font-mono bg-[#d29922]/10 text-[#d29922] border border-[#d29922]">
                          {session.spots} SPOTS
                        </span>
                        <button
                          onClick={() => setShowTrainingForm(true)}
                          className="text-[#3fb950] font-medium text-sm hover:underline uppercase tracking-wide"
                        >
                          Register →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ambassadors Tab */}
          {activeTab === 'ambassadors' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Wellness Ambassador Network</h2>
                  <p className="text-[#8b949e] mt-2">Data-driven peer support network with predictive outreach capabilities</p>
                </div>
                <button
                  onClick={() => setShowAmbassadorForm(true)}
                  className="bg-gradient-to-r from-[#a371f7] to-[#8b5cf6] text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition-all uppercase text-sm tracking-wide"
                >
                  Apply Now
                </button>
              </div>

              {/* Ambassador Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { value: '0', label: 'Active', sublabel: 'Ambassadors', color: '#a371f7' },
                  { value: '0', label: 'Events', sublabel: 'Hosted', color: '#3fb950' },
                  { value: '0', label: 'Students', sublabel: 'Reached', color: '#58a6ff' },
                  { value: '0', label: 'Outreaches', sublabel: 'Monthly', color: '#d29922' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">{stat.label}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* What Ambassadors Do */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Ambassador Capabilities</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: '◎', title: 'Lead Workshops', desc: 'Facilitate mental health awareness sessions', color: '#3fb950' },
                    { icon: '⊕', title: 'Peer Support', desc: 'One-on-one support and navigation', color: '#58a6ff' },
                    { icon: '◇', title: 'Outreach', desc: 'Data-driven wellness campaigns', color: '#a371f7' },
                    { icon: '⬡', title: 'Events', desc: 'Plan and host wellness events', color: '#d29922' },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#8b949e] transition-colors">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-lg" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                        {item.icon}
                      </div>
                      <h4 className="font-semibold text-[#f0f6fc]">{item.title}</h4>
                      <p className="text-sm text-[#8b949e] mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Policies/Initiatives Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">All Wellness Initiatives</h2>
                <span className="text-xs text-[#6e7681] font-mono">{deptPolicies.length} INITIATIVES</span>
              </div>
              <div className="space-y-4">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#3fb950]/50 transition-all">
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
                        <p className="text-3xl font-mono font-bold text-[#3fb950]">{policy.progress}%</p>
                        <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">Progress</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-[#21262d] rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-gradient-to-r from-[#3fb950] to-[#2ea043] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
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
                          <span key={f} className="px-2.5 py-1 bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]/30 rounded text-xs font-mono">
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

          {/* Training Form Modal */}
          {showTrainingForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-6">Register for Training</h3>
                <form onSubmit={handleTrainingSubmit} className="space-y-5">
                  <Input label="Full Name" name="name" value={trainingForm.name} onChange={e => setTrainingForm({...trainingForm, name: e.target.value})} required />
                  <Input label="Email" type="email" name="email" value={trainingForm.email} onChange={e => setTrainingForm({...trainingForm, email: e.target.value})} required />
                  <Input label="PID" name="pid" value={trainingForm.pid} onChange={e => setTrainingForm({...trainingForm, pid: e.target.value})} required />
                  <Select label="Role" name="role" value={trainingForm.role} onChange={e => setTrainingForm({...trainingForm, role: e.target.value})} required
                    options={[
                      { value: 'ra', label: 'Resident Advisor' },
                      { value: 'org_leader', label: 'Student Org Leader' },
                      { value: 'peer_mentor', label: 'Peer Mentor' },
                      { value: 'other', label: 'Other Student' },
                    ]}
                  />
                  <Textarea label="Prior Experience (optional)" name="experience" value={trainingForm.experience} onChange={e => setTrainingForm({...trainingForm, experience: e.target.value})} />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-[#3fb950] to-[#2ea043] text-[#0d1117] px-6 py-3 rounded font-semibold hover:opacity-90 transition-all">
                      Submit Registration
                    </button>
                    <button type="button" onClick={() => setShowTrainingForm(false)} className="px-6 py-3 rounded font-medium text-[#8b949e] border border-[#30363d] hover:bg-[#21262d] transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Ambassador Form Modal */}
          {showAmbassadorForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-6">Apply to Ambassador Program</h3>
                <form onSubmit={handleAmbassadorSubmit} className="space-y-5">
                  <Input label="Full Name" name="name" value={ambassadorForm.name} onChange={e => setAmbassadorForm({...ambassadorForm, name: e.target.value})} required />
                  <Input label="Email" type="email" name="email" value={ambassadorForm.email} onChange={e => setAmbassadorForm({...ambassadorForm, email: e.target.value})} required />
                  <Input label="PID" name="pid" value={ambassadorForm.pid} onChange={e => setAmbassadorForm({...ambassadorForm, pid: e.target.value})} required />
                  <Select label="Year" name="year" value={ambassadorForm.year} onChange={e => setAmbassadorForm({...ambassadorForm, year: e.target.value})} required
                    options={[
                      { value: 'freshman', label: 'First Year' },
                      { value: 'sophomore', label: 'Sophomore' },
                      { value: 'junior', label: 'Junior' },
                      { value: 'senior', label: 'Senior' },
                      { value: 'grad', label: 'Graduate Student' },
                    ]}
                  />
                  <Input label="Major" name="major" value={ambassadorForm.major} onChange={e => setAmbassadorForm({...ambassadorForm, major: e.target.value})} required />
                  <Textarea label="Why do you want to join?" name="motivation" value={ambassadorForm.motivation} onChange={e => setAmbassadorForm({...ambassadorForm, motivation: e.target.value})} required rows={4} />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-[#a371f7] to-[#8b5cf6] text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition-all">
                      Submit Application
                    </button>
                    <button type="button" onClick={() => setShowAmbassadorForm(false)} className="px-6 py-3 rounded font-medium text-[#8b949e] border border-[#30363d] hover:bg-[#21262d] transition-colors">
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
