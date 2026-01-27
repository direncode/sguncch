import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import { useApp } from '../lib/store'
import { departments, getOverallProgress, getStatusCounts } from '../lib/data'

export default function Home() {
  const [selectedDept, setSelectedDept] = useState(null)
  const { policies, budgetData } = useApp()
  const overallProgress = getOverallProgress(policies)
  const statusCounts = getStatusCounts(policies)

  const filteredPolicies = selectedDept
    ? policies.filter(p => p.department === selectedDept)
    : policies

  const deptLinks = {
    'wellness': '/wellness',
    'basic-needs': '/basic-needs',
    'academic': '/academic',
    'civic': '/civic',
    'communications': '/communications',
    'dei': '/dei',
    'environmental': '/environmental',
    'external': '/external',
  }

  return (
    <Layout>
      <Head>
        <title>Project Bold | UNC Student Government</title>
        <meta name="description" content="First, Best, For All - UNC Student Government Policy Platform" />
      </Head>

      {/* Hero - Apple style gradient */}
      <div className="bg-gradient-to-b from-[#1d1d1f] to-[#2d2d2f] text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4">Project Bold</h1>
          <p className="text-2xl text-[#0071e3] font-medium mb-6">First, Best, For All</p>
          <p className="text-[#a1a1a6] text-lg max-w-2xl leading-relaxed">
            A unified digital platform tracking all 40 policies across 8 departments.
            Building a Carolina where every student has the resources to thrive.
          </p>

          {/* Overall Progress - Apple card */}
          <div className="mt-10 bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-md">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-white/90">Overall Progress</span>
              <span className="text-3xl font-semibold">{overallProgress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0071e3] rounded-full transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats - Apple style */}
      <div className="bg-[#0071e3] text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <p className="text-4xl font-semibold">{policies.length}</p>
              <p className="text-sm text-white/80 mt-1">Total Policies</p>
            </div>
            <div>
              <p className="text-4xl font-semibold">{statusCounts.in_progress}</p>
              <p className="text-sm text-white/80 mt-1">In Progress</p>
            </div>
            <div>
              <p className="text-4xl font-semibold">{statusCounts.planned}</p>
              <p className="text-sm text-white/80 mt-1">Planned</p>
            </div>
            <div>
              <p className="text-4xl font-semibold">{statusCounts.completed}</p>
              <p className="text-sm text-white/80 mt-1">Completed</p>
            </div>
            <div>
              <p className="text-4xl font-semibold">{departments.length}</p>
              <p className="text-sm text-white/80 mt-1">Departments</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Values */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-6">Our Values</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Courage', desc: 'Lead fearlessly' },
              { name: 'Community', desc: 'Progress together' },
              { name: 'Accountability', desc: 'Follow through' },
              { name: 'Equity', desc: 'Every Tar Heel thrives' },
              { name: 'Innovation', desc: 'Think creatively' },
            ].map(value => (
              <div key={value.name} className="bg-white rounded-2xl p-5 text-center">
                <p className="font-semibold text-[#1d1d1f]">{value.name}</p>
                <p className="text-xs text-[#86868b] mt-1">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Access */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-6">Quick Access</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/wellness" className="bg-[#34c759]/10 rounded-2xl p-5 hover:bg-[#34c759]/20 transition-all group">
              <span className="text-3xl">🆘</span>
              <p className="font-semibold text-[#1d1d1f] mt-3 group-hover:text-[#34c759] transition">Wellness Resources</p>
              <p className="text-sm text-[#86868b] mt-1">CAPS, Crisis Support, Health</p>
            </Link>
            <Link href="/basic-needs" className="bg-[#ff9500]/10 rounded-2xl p-5 hover:bg-[#ff9500]/20 transition-all group">
              <span className="text-3xl">🍎</span>
              <p className="font-semibold text-[#1d1d1f] mt-3 group-hover:text-[#ff9500] transition">Basic Needs</p>
              <p className="text-sm text-[#86868b] mt-1">Food, Housing, Technology</p>
            </Link>
            <Link href="/civic" className="bg-[#af52de]/10 rounded-2xl p-5 hover:bg-[#af52de]/20 transition-all group">
              <span className="text-3xl">🗳️</span>
              <p className="font-semibold text-[#1d1d1f] mt-3 group-hover:text-[#af52de] transition">Voter Registration</p>
              <p className="text-sm text-[#86868b] mt-1">Register, Check Status</p>
            </Link>
            <Link href="/communications" className="bg-[#0071e3]/10 rounded-2xl p-5 hover:bg-[#0071e3]/20 transition-all group">
              <span className="text-3xl">📊</span>
              <p className="font-semibold text-[#1d1d1f] mt-3 group-hover:text-[#0071e3] transition">Transparency</p>
              <p className="text-sm text-[#86868b] mt-1">Budget, Progress, Reports</p>
            </Link>
          </div>
        </section>

        {/* Departments */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-6">Departments</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {departments.map(dept => {
              const deptPolicies = policies.filter(p => p.department === dept.id)
              const avgProgress = Math.round(deptPolicies.reduce((sum, p) => sum + p.progress, 0) / deptPolicies.length) || 0

              return (
                <Link
                  key={dept.id}
                  href={deptLinks[dept.id]}
                  className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all"
                >
                  <span className="text-3xl">{dept.icon}</span>
                  <p className="font-semibold text-[#1d1d1f] mt-3">{dept.name}</p>
                  <p className="text-xs text-[#86868b] mt-1 line-clamp-2">{dept.description}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-[#86868b] mb-1.5">
                      <span>{deptPolicies.length} policies</span>
                      <span>{avgProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0071e3] rounded-full"
                        style={{ width: `${avgProgress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Budget Overview */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-6">Budget Overview</h2>
          <div className="bg-white rounded-2xl p-8">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <p className="text-4xl font-semibold text-[#1d1d1f] tracking-tight">${budgetData.total.toLocaleString()}</p>
                <p className="text-sm text-[#86868b] mt-1">Total Budget</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-semibold text-[#0071e3] tracking-tight">${budgetData.allocated.toLocaleString()}</p>
                <p className="text-sm text-[#86868b] mt-1">Allocated</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-semibold text-[#34c759] tracking-tight">${budgetData.spent.toLocaleString()}</p>
                <p className="text-sm text-[#86868b] mt-1">Spent</p>
              </div>
            </div>
            <div className="space-y-4">
              {budgetData.categories.map(cat => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-[#1d1d1f]">{cat.name}</span>
                    <span className="text-[#86868b]">${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#34c759] rounded-full"
                      style={{ width: `${(cat.spent / cat.allocated) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Link href="/communications" className="block text-center text-[#0071e3] text-sm font-medium mt-6 hover:underline">
              View Full Transparency Dashboard →
            </Link>
          </div>
        </section>

        {/* All Policies */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
              {selectedDept ? `${departments.find(d => d.id === selectedDept)?.name} Policies` : 'All Policies'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDept(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedDept ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed]'}`}
              >
                All
              </button>
              {departments.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDept(d.id)}
                  className={`px-3 py-2 rounded-full text-sm hidden md:block transition-all ${selectedDept === d.id ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed]'}`}
                >
                  {d.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredPolicies.map(policy => {
              const dept = departments.find(d => d.id === policy.department)
              return (
                <div key={policy.id} className="bg-white rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs text-[#86868b]">{dept?.icon} {dept?.name}</span>
                      <h3 className="font-semibold text-[#1d1d1f] mt-1">{policy.title}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      policy.status === 'completed' ? 'bg-[#34c759]/10 text-[#34c759]' :
                      policy.status === 'in_progress' ? 'bg-[#0071e3]/10 text-[#0071e3]' :
                      'bg-[#f5f5f7] text-[#86868b]'
                    }`}>
                      {policy.status === 'in_progress' ? 'In Progress' : policy.status === 'completed' ? 'Completed' : 'Planned'}
                    </span>
                  </div>
                  <p className="text-sm text-[#6e6e73] mb-4">{policy.description}</p>
                  <div className="flex justify-between text-xs text-[#86868b] mb-1.5">
                    <span>Progress</span>
                    <span>{policy.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        policy.status === 'completed' ? 'bg-[#34c759]' :
                        policy.status === 'in_progress' ? 'bg-[#0071e3]' : 'bg-[#d2d2d7]'
                      }`}
                      style={{ width: `${policy.progress}%` }}
                    />
                  </div>
                  {policy.metrics && (
                    <div className="flex gap-4 mt-4 text-xs text-[#86868b]">
                      {Object.entries(policy.metrics).slice(0, 3).map(([key, val]) => (
                        <span key={key}>
                          <span className="font-medium text-[#1d1d1f]">{typeof val === 'number' ? val.toLocaleString() : val}</span> {key}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </Layout>
  )
}
