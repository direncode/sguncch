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

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#13294B] to-[#1e3a5f] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Project Bold</h1>
          <p className="text-xl text-[#4B9CD3] mb-6">First, Best, For All</p>
          <p className="text-gray-300 max-w-2xl">
            A unified digital platform tracking all 40 policies across 8 departments.
            Building a Carolina where every student has the resources to thrive.
          </p>

          {/* Overall Progress */}
          <div className="mt-8 bg-white/10 rounded-lg p-6 max-w-md">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Overall Progress</span>
              <span className="text-2xl font-bold">{overallProgress}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4B9CD3] rounded-full transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#4B9CD3] text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{policies.length}</p>
              <p className="text-sm opacity-90">Total Policies</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{statusCounts.in_progress}</p>
              <p className="text-sm opacity-90">In Progress</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{statusCounts.planned}</p>
              <p className="text-sm opacity-90">Planned</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{statusCounts.completed}</p>
              <p className="text-sm opacity-90">Completed</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{departments.length}</p>
              <p className="text-sm opacity-90">Departments</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Values */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#13294B] mb-4">Our Values</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Courage', desc: 'Lead fearlessly' },
              { name: 'Community', desc: 'Progress together' },
              { name: 'Accountability', desc: 'Follow through' },
              { name: 'Equity', desc: 'Every Tar Heel thrives' },
              { name: 'Innovation', desc: 'Think creatively' },
            ].map(value => (
              <div key={value.name} className="bg-white rounded-lg p-4 shadow-sm text-center">
                <p className="font-bold text-[#13294B]">{value.name}</p>
                <p className="text-xs text-gray-500 mt-1">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Access - Featured Services */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#13294B] mb-4">Quick Access</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/wellness" className="bg-green-50 border-2 border-green-200 rounded-lg p-4 hover:border-green-400 transition">
              <span className="text-2xl">🆘</span>
              <p className="font-bold text-green-800 mt-2">Wellness Resources</p>
              <p className="text-sm text-green-600">CAPS, Crisis Support, Health</p>
            </Link>
            <Link href="/basic-needs" className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 hover:border-orange-400 transition">
              <span className="text-2xl">🍎</span>
              <p className="font-bold text-orange-800 mt-2">Basic Needs</p>
              <p className="text-sm text-orange-600">Food, Housing, Technology</p>
            </Link>
            <Link href="/civic" className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 hover:border-purple-400 transition">
              <span className="text-2xl">🗳️</span>
              <p className="font-bold text-purple-800 mt-2">Voter Registration</p>
              <p className="text-sm text-purple-600">Register, Check Status</p>
            </Link>
            <Link href="/communications" className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition">
              <span className="text-2xl">📊</span>
              <p className="font-bold text-blue-800 mt-2">Transparency</p>
              <p className="text-sm text-blue-600">Budget, Progress, Reports</p>
            </Link>
          </div>
        </section>

        {/* Departments */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#13294B] mb-4">Departments</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {departments.map(dept => {
              const deptPolicies = policies.filter(p => p.department === dept.id)
              const avgProgress = Math.round(deptPolicies.reduce((sum, p) => sum + p.progress, 0) / deptPolicies.length)

              return (
                <Link
                  key={dept.id}
                  href={deptLinks[dept.id]}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-100"
                >
                  <span className="text-3xl">{dept.icon}</span>
                  <p className="font-bold text-[#13294B] mt-2">{dept.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{dept.description}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{deptPolicies.length} policies</span>
                      <span>{avgProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4B9CD3] rounded-full"
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
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#13294B] mb-4">Budget Overview</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#13294B]">${budgetData.total.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Budget</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#4B9CD3]">${budgetData.allocated.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Allocated</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">${budgetData.spent.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Spent</p>
              </div>
            </div>
            <div className="space-y-3">
              {budgetData.categories.map(cat => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{cat.name}</span>
                    <span className="text-gray-500">${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4B9CD3] rounded-full"
                      style={{ width: `${(cat.spent / cat.allocated) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Link href="/communications" className="block text-center text-[#4B9CD3] text-sm mt-4 hover:underline">
              View Full Transparency Dashboard →
            </Link>
          </div>
        </section>

        {/* All Policies */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#13294B]">
              {selectedDept ? `${departments.find(d => d.id === selectedDept)?.name} Policies` : 'All Policies'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDept(null)}
                className={`px-3 py-1 rounded text-sm ${!selectedDept ? 'bg-[#13294B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              {departments.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDept(d.id)}
                  className={`px-3 py-1 rounded text-sm hidden md:block ${selectedDept === d.id ? 'bg-[#13294B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
                <div key={policy.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xs text-gray-500">{dept?.icon} {dept?.name}</span>
                      <h3 className="font-bold text-[#13294B]">{policy.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      policy.status === 'completed' ? 'bg-green-100 text-green-800' :
                      policy.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {policy.status === 'in_progress' ? 'In Progress' : policy.status === 'completed' ? 'Completed' : 'Planned'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{policy.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4B9CD3] rounded-full"
                      style={{ width: `${policy.progress}%` }}
                    />
                  </div>
                  {policy.metrics && (
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                      {Object.entries(policy.metrics).slice(0, 3).map(([key, val]) => (
                        <span key={key}>
                          <span className="font-medium text-gray-700">{typeof val === 'number' ? val.toLocaleString() : val}</span> {key}
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
