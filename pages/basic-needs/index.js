import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { departments, getKPIStatus, formatNumber, formatCurrency } from '../../lib/data'

export default function BasicNeedsPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showHousingForm, setShowHousingForm] = useState(false)
  const [showTechForm, setShowTechForm] = useState(false)
  const [housingForm, setHousingForm] = useState({ name: '', email: '', pid: '', situation: '', urgency: '', amount: '' })
  const [techForm, setTechForm] = useState({ name: '', email: '', pid: '', device: '', reason: '', duration: '' })
  const [submitted, setSubmitted] = useState(null)
  const [liveTime, setLiveTime] = useState(new Date())
  const { policies, operationalData } = useApp()

  const department = departments.find(d => d.id === 'basic-needs')
  const pantryLocations = operationalData?.foodPantry?.locations || []
  const deptPolicies = policies.filter(p => p.department === 'basic-needs')
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
    { id: 'food', label: 'Smart Pantry', icon: '◈' },
    { id: 'housing', label: 'Housing', icon: '⊕' },
    { id: 'technology', label: 'Tech Access', icon: '◎' },
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
        <title>Digital Services Portal | Project Bold</title>
      </Head>

      {/* Command Center Hero */}
      <div className="relative bg-[#0a0e14] border-b border-[#30363d] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#d29922 1px, transparent 1px), linear-gradient(90deg, #d29922 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#d29922]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#d29922]/5 blur-[80px] rounded-full" />

        <div className="relative max-w-[1600px] mx-auto px-6 py-8">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#d29922]/10 border border-[#d29922]/30 rounded text-xs font-mono">
                <div className="w-2 h-2 bg-[#d29922] rounded-full animate-pulse" />
                <span className="text-[#d29922]">CRITICAL SERVICES</span>
              </div>
              <span className="text-[#6e7681] text-xs font-mono">SERVICE LEVEL: {department?.serviceLevel}</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-[#8b949e]">
              <span>SLA: {department?.sla?.responseTime} RESPONSE</span>
              <span className="text-[#d29922]">{liveTime.toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#d29922] to-[#b8860b] flex items-center justify-center text-2xl">
                  {department?.icon}
                </div>
                <div>
                  <p className="text-[#d29922] text-xs font-medium tracking-widest uppercase">Digital Services Portal</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#f0f6fc] tracking-tight">Basic Needs</h1>
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
                <span className="text-xs font-medium text-[#6e7681] uppercase tracking-widest">Service Metrics</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#d29922] rounded-full animate-pulse" />
                  <span className="text-[10px] text-[#6e7681] font-mono">REAL-TIME</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#f0f6fc]">Initiative Progress</span>
                    <span className="text-[#d29922] font-mono">{overallProgress}%</span>
                  </div>
                  <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#d29922] to-[#b8860b] rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
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
                    <span className="text-[#d29922] font-mono">{department?.satisfactionTarget}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="bg-gradient-to-r from-[#b62324] to-[#9e1c1c] border-b border-[#da3633]">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <p className="font-semibold text-white uppercase text-sm tracking-wide">Emergency Services Available 24/7</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="tel:919-962-8396" className="bg-white text-[#b62324] px-5 py-2 rounded font-mono font-bold hover:bg-[#f0f6fc] transition-colors flex items-center gap-2">
              <span>◉</span> Dean of Students
            </a>
            <button onClick={() => setShowHousingForm(true)} className="bg-white/10 border border-white/30 text-white px-5 py-2 rounded font-mono hover:bg-white/20 transition-colors">
              Emergency Housing
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
                    ? 'border-[#d29922] text-[#d29922] bg-[#d29922]/5'
                    : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-[#d29922]' : 'text-[#6e7681]'}>{tab.icon}</span>
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
                {submitted === 'housing' && 'Emergency housing application submitted. A case manager will contact you within 4 hours.'}
                {submitted === 'tech' && 'Device request submitted. Pickup details will be sent within 24 hours.'}
              </p>
              <button onClick={() => setSubmitted(null)} className="text-[#3fb950] text-sm font-medium hover:underline">Dismiss</button>
            </div>
          )}

          {/* Dashboard Tab */}
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
                            {data.unit === '$' ? formatCurrency(data.current) : formatNumber(data.current)}
                          </p>
                          <p className="text-sm text-[#6e7681] font-mono">/ {data.unit === '$' ? formatCurrency(data.target) : formatNumber(data.target)} {data.unit !== '$' && data.unit}</p>
                        </div>
                        <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${colors.text.replace('text-', 'bg-')}`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Services */}
              <div>
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Instant Access Services</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button onClick={() => setActiveTab('food')} className="bg-[#161b22] border border-[#d29922] rounded-lg p-5 hover:bg-[#d29922]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#d29922]/10 rounded-lg flex items-center justify-center group-hover:bg-[#d29922]/20 transition-all">
                        <span className="text-[#d29922] text-lg">🍎</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Smart Pantry</p>
                        <p className="text-xs text-[#6e7681]">IoT-enabled food access</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Real-time inventory at 4 locations</p>
                  </button>
                  <button onClick={() => setShowHousingForm(true)} className="bg-[#161b22] border border-[#f85149] rounded-lg p-5 hover:bg-[#f85149]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#f85149]/10 rounded-lg flex items-center justify-center group-hover:bg-[#f85149]/20 transition-all">
                        <span className="text-[#f85149] text-lg">🏠</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Emergency Housing</p>
                        <p className="text-xs text-[#6e7681]">4-hour processing</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Rapid-response housing assistance</p>
                  </button>
                  <button onClick={() => setShowTechForm(true)} className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-5 hover:bg-[#58a6ff]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#58a6ff]/10 rounded-lg flex items-center justify-center group-hover:bg-[#58a6ff]/20 transition-all">
                        <span className="text-[#58a6ff] text-lg">💻</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">Device Access</p>
                        <p className="text-xs text-[#6e7681]">Smart checkout</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Enterprise-grade device lending</p>
                  </button>
                  <a href="#" className="bg-[#161b22] border border-[#a371f7] rounded-lg p-5 hover:bg-[#a371f7]/5 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#a371f7]/10 rounded-lg flex items-center justify-center group-hover:bg-[#a371f7]/20 transition-all">
                        <span className="text-[#a371f7] text-lg">📚</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">OER Hub</p>
                        <p className="text-xs text-[#6e7681]">Course matching</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#8b949e]">Free textbook alternatives</p>
                  </a>
                </div>
              </div>

              {/* Active Initiatives */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">Active Initiatives</h2>
                  <button onClick={() => setActiveTab('policies')} className="text-xs text-[#d29922] hover:underline">VIEW ALL →</button>
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  {deptPolicies.filter(p => p.status !== 'completed').slice(0, 4).map(policy => (
                    <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#d29922]/50 transition-all">
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
                        <span className="text-[#d29922] font-mono">{policy.progress}%</span>
                      </div>
                      <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#d29922] to-[#b8860b] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Food Pantry Tab */}
          {activeTab === 'food' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Smart Pantry Network</h2>
                <p className="text-[#8b949e]">IoT-enabled food pantry system with real-time inventory and predictive restocking</p>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { value: '0', label: 'Today', sublabel: 'Visits', color: '#d29922' },
                  { value: '4', label: 'Active', sublabel: 'Locations', color: '#3fb950' },
                  { value: '0', label: 'Items', sublabel: 'Distributed', color: '#58a6ff' },
                  { value: '100%', label: 'Anonymous', sublabel: 'Access', color: '#a371f7' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">{stat.label}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Locations */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Network Locations</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {pantryLocations.map(loc => (
                    <div key={loc.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#d29922]/50 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-[#f0f6fc]">{loc.name}</h4>
                          <p className="text-xs text-[#6e7681] mt-1">{loc.address}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-xs font-mono uppercase border ${
                          loc.inventory === 'well-stocked' ? 'border-[#3fb950] text-[#3fb950] bg-[#3fb950]/10' :
                          loc.inventory === 'moderate' ? 'border-[#d29922] text-[#d29922] bg-[#d29922]/10' :
                          loc.inventory === 'low' ? 'border-[#f85149] text-[#f85149] bg-[#f85149]/10' :
                          'border-[#6e7681] text-[#6e7681] bg-[#21262d]'
                        }`}>
                          {loc.inventory || 'CHECKING'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-[#21262d]">
                        <span className="text-[#6e7681] font-mono">{loc.hours}</span>
                        <span className="text-[#d29922]">{loc.visits || 0} visits today</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Smart Access Protocol</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { step: '01', title: 'Visit Any Location', desc: 'No appointment or registration required' },
                    { step: '02', title: 'Swipe OneCard', desc: 'Anonymous tracking for funding purposes' },
                    { step: '03', title: 'Select Items', desc: 'Fresh produce, pantry staples, personal care' },
                  ].map(item => (
                    <div key={item.step} className="flex gap-4">
                      <span className="w-10 h-10 bg-[#d29922]/10 border border-[#d29922]/30 text-[#d29922] rounded-lg flex items-center justify-center font-mono text-sm shrink-0">{item.step}</span>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">{item.title}</p>
                        <p className="text-sm text-[#6e7681] mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Housing Tab */}
          {activeTab === 'housing' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Emergency Housing Response</h2>
                  <p className="text-[#8b949e] mt-2">Rapid-response housing assistance with 4-hour processing guarantee</p>
                </div>
                <button onClick={() => setShowHousingForm(true)} className="bg-gradient-to-r from-[#f85149] to-[#da3633] text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition-all uppercase text-sm tracking-wide">
                  Apply Now
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { value: '4h', label: 'Processing', sublabel: 'Guarantee', color: '#f85149' },
                  { value: '0', label: 'Students', sublabel: 'Assisted', color: '#3fb950' },
                  { value: '$0', label: 'Funds', sublabel: 'Distributed', color: '#d29922' },
                  { value: '3', label: 'Partner', sublabel: 'Hotels', color: '#58a6ff' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">{stat.label}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Eligibility */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-4">Eligibility Criteria</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Currently enrolled UNC student',
                    'Facing unexpected housing emergency',
                    'Demonstrated financial need',
                    'No other immediate housing options'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[#3fb950]/10 rounded-full flex items-center justify-center">
                        <span className="text-[#3fb950] text-xs">✓</span>
                      </div>
                      <span className="text-[#8b949e]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Technology Tab */}
          {activeTab === 'technology' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Digital Equity Device Program</h2>
                  <p className="text-[#8b949e] mt-2">Enterprise-grade device lending with automated checkout and remote support</p>
                </div>
                <button onClick={() => setShowTechForm(true)} className="bg-gradient-to-r from-[#58a6ff] to-[#388bfd] text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition-all uppercase text-sm tracking-wide">
                  Request Device
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { value: '0', label: 'Device', sublabel: 'Fleet', color: '#58a6ff' },
                  { value: '0%', label: 'Utilization', sublabel: 'Rate', color: '#3fb950' },
                  { value: '0', label: 'Active', sublabel: 'Loans', color: '#d29922' },
                  { value: '99%', label: 'Device', sublabel: 'Uptime', color: '#a371f7' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-[#f0f6fc] mt-1">{stat.label}</p>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">{stat.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Device Types */}
              <div>
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Available Devices</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { type: 'Laptop (Windows)', icon: '💻', available: 0, total: 0 },
                    { type: 'MacBook Air', icon: '🖥️', available: 0, total: 0 },
                    { type: 'Wi-Fi Hotspot', icon: '📶', available: 0, total: 0 },
                  ].map((device, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#58a6ff]/50 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{device.icon}</span>
                        <div>
                          <h4 className="font-semibold text-[#f0f6fc]">{device.type}</h4>
                          <p className="text-xs text-[#6e7681] font-mono">{device.available} / {device.total} available</p>
                        </div>
                      </div>
                      <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                        <div className="h-full bg-[#58a6ff] rounded-full" style={{ width: device.total > 0 ? `${(device.available / device.total) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Policies Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase">All Basic Needs Initiatives</h2>
                <span className="text-xs text-[#6e7681] font-mono">{deptPolicies.length} INITIATIVES</span>
              </div>
              <div className="space-y-4">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#d29922]/50 transition-all">
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
                          {policy.budget > 0 && <span>Budget: <span className="text-[#d29922]">{formatCurrency(policy.budget)}</span></span>}
                          {policy.lead && <span>Lead: <span className="text-[#f0f6fc]">{policy.lead}</span></span>}
                        </div>
                      </div>
                      <div className="lg:text-right">
                        <p className="text-3xl font-mono font-bold text-[#d29922]">{policy.progress}%</p>
                        <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">Progress</p>
                      </div>
                    </div>

                    <div className="h-2 bg-[#21262d] rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-gradient-to-r from-[#d29922] to-[#b8860b] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
                    </div>

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
                                {kpi.unit === '$' ? formatCurrency(kpi.current) : formatNumber(kpi.current)}
                                <span className="text-[#6e7681] text-xs"> / {kpi.unit === '$' ? formatCurrency(kpi.target) : formatNumber(kpi.target)} {kpi.unit !== '$' && kpi.unit}</span>
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {policy.digitalFeatures && (
                      <div className="flex flex-wrap gap-2">
                        {policy.digitalFeatures.map(f => (
                          <span key={f} className="px-2.5 py-1 bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/30 rounded text-xs font-mono">
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

          {/* Housing Form Modal */}
          {showHousingForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-6">Emergency Housing Application</h3>
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted('housing'); setShowHousingForm(false) }} className="space-y-5">
                  <Input label="Full Name" name="name" value={housingForm.name} onChange={e => setHousingForm({...housingForm, name: e.target.value})} required />
                  <Input label="Email" type="email" name="email" value={housingForm.email} onChange={e => setHousingForm({...housingForm, email: e.target.value})} required />
                  <Input label="PID" name="pid" value={housingForm.pid} onChange={e => setHousingForm({...housingForm, pid: e.target.value})} required />
                  <Select label="Urgency Level" name="urgency" value={housingForm.urgency} onChange={e => setHousingForm({...housingForm, urgency: e.target.value})} required
                    options={[
                      { value: 'immediate', label: 'Immediate (homeless tonight)' },
                      { value: 'week', label: 'Within a week' },
                      { value: 'month', label: 'Within a month' },
                    ]}
                  />
                  <Textarea label="Describe your situation" name="situation" value={housingForm.situation} onChange={e => setHousingForm({...housingForm, situation: e.target.value})} required rows={4} />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-[#f85149] to-[#da3633] text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition-all">
                      Submit Application
                    </button>
                    <button type="button" onClick={() => setShowHousingForm(false)} className="px-6 py-3 rounded font-medium text-[#8b949e] border border-[#30363d] hover:bg-[#21262d] transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tech Form Modal */}
          {showTechForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-6">Request Device</h3>
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted('tech'); setShowTechForm(false) }} className="space-y-5">
                  <Input label="Full Name" name="name" value={techForm.name} onChange={e => setTechForm({...techForm, name: e.target.value})} required />
                  <Input label="Email" type="email" name="email" value={techForm.email} onChange={e => setTechForm({...techForm, email: e.target.value})} required />
                  <Input label="PID" name="pid" value={techForm.pid} onChange={e => setTechForm({...techForm, pid: e.target.value})} required />
                  <Select label="Device Type" name="device" value={techForm.device} onChange={e => setTechForm({...techForm, device: e.target.value})} required
                    options={[
                      { value: 'laptop-windows', label: 'Laptop (Windows)' },
                      { value: 'laptop-mac', label: 'MacBook Air' },
                      { value: 'hotspot', label: 'Wi-Fi Hotspot' },
                    ]}
                  />
                  <Select label="Loan Duration" name="duration" value={techForm.duration} onChange={e => setTechForm({...techForm, duration: e.target.value})} required
                    options={[
                      { value: 'semester', label: 'Full Semester' },
                      { value: 'month', label: '1 Month' },
                      { value: 'week', label: '1 Week' },
                    ]}
                  />
                  <Textarea label="Reason for Request" name="reason" value={techForm.reason} onChange={e => setTechForm({...techForm, reason: e.target.value})} required />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-[#58a6ff] to-[#388bfd] text-white px-6 py-3 rounded font-semibold hover:opacity-90 transition-all">
                      Submit Request
                    </button>
                    <button type="button" onClick={() => setShowTechForm(false)} className="px-6 py-3 rounded font-medium text-[#8b949e] border border-[#30363d] hover:bg-[#21262d] transition-colors">
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
