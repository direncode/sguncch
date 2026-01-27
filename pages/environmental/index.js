import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button } from '../../components/FormInput'
import { useApp } from '../../lib/store'

export default function EnvironmentalPage() {
  const [activeTab, setActiveTab] = useState('carbon')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showCommitteeForm, setShowCommitteeForm] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const { policies } = useApp()

  const deptPolicies = policies.filter(p => p.department === 'environmental')

  return (
    <Layout>
      <Head>
        <title>Environmental | Project Bold</title>
      </Head>

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#34c759] to-[#30d158] text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🌱</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Environmental Affairs</h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl">
            Sustainability, climate action, and green initiatives. Building a more
            sustainable Carolina for future generations.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#f5f5f7] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'carbon', label: 'Carbon Neutrality' },
              { id: 'dining', label: 'Sustainable Dining' },
              { id: 'greenfund', label: 'Green Fund' },
              { id: 'bikeshare', label: 'Bike Share' },
              { id: 'committee', label: 'Climate Committee' },
              { id: 'policies', label: 'All Policies' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#34c759] text-white'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {submitted && (
          <div className="mb-8 bg-[#34c759]/10 rounded-2xl p-5">
            <p className="text-[#1d1d1f] font-medium">
              {submitted === 'project' && 'Your Green Fund application has been submitted! We will review and contact you within 2 weeks.'}
              {submitted === 'committee' && 'Thank you for your interest in the Climate Action Committee! We will reach out about next steps.'}
            </p>
            <button onClick={() => setSubmitted(null)} className="text-[#34c759] text-sm mt-2 font-medium hover:underline">Dismiss</button>
          </div>
        )}

        {/* Carbon Neutrality Tab */}
        {activeTab === 'carbon' && (
          <div>
            <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-8">Carbon Neutrality Push</h2>

            {/* Progress */}
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
              <h3 className="font-semibold text-[#1d1d1f] mb-4">UNC Carbon Reduction Progress</h3>
              <div className="flex items-center gap-6 mb-4">
                <div className="text-5xl font-semibold text-[#34c759] tracking-tight">12%</div>
                <div className="flex-1">
                  <p className="text-sm text-[#86868b] mb-2">Reduction from 2007 baseline</p>
                  <div className="h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                    <div className="h-full bg-[#34c759] rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#6e6e73]">Goal: Carbon neutrality by 2040</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#34c759] tracking-tight">890</p>
                <p className="text-sm text-[#6e6e73] mt-1">Petition Signatures</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#0071e3] tracking-tight">45</p>
                <p className="text-sm text-[#6e6e73] mt-1">Actions Taken</p>
              </div>
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#af52de] tracking-tight">5</p>
                <p className="text-sm text-[#6e6e73] mt-1">Admin Meetings</p>
              </div>
            </div>

            {/* Take Action */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">Take Action</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#34c759] to-[#30d158] text-white rounded-2xl p-6">
                <h4 className="font-semibold text-lg mb-2">Sign the Petition</h4>
                <p className="text-white/80 mb-4">Demand accelerated carbon neutrality timeline from university leadership.</p>
                <button className="bg-white text-[#34c759] px-5 py-2.5 rounded-full font-medium hover:bg-white/90 transition-colors">
                  Sign Now
                </button>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h4 className="font-semibold text-lg text-[#1d1d1f] mb-2">Contact Administration</h4>
                <p className="text-[#6e6e73] mb-4">Send a pre-written email to the Chancellor's office.</p>
                <button className="bg-[#f5f5f7] text-[#1d1d1f] px-5 py-2.5 rounded-full font-medium hover:bg-[#e8e8ed] transition-colors">
                  Send Email
                </button>
              </div>
            </div>

            {/* Impact Calculator */}
            <div className="mt-8 bg-[#34c759]/10 rounded-2xl p-6">
              <h3 className="font-semibold text-[#1d1d1f] mb-2">Calculate Your Impact</h3>
              <p className="text-sm text-[#6e6e73] mb-4">See how your daily choices affect carbon emissions.</p>
              <button className="bg-[#34c759] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#30d158] transition-colors">
                Open Calculator
              </button>
            </div>
          </div>
        )}

        {/* Sustainable Dining Tab */}
        {activeTab === 'dining' && (
          <div>
            <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-8">Sustainable Dining Initiative</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#34c759] tracking-tight">45,000</p>
                <p className="text-sm text-[#6e6e73] mt-1">Plastics Reduced</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#0071e3] tracking-tight">12</p>
                <p className="text-sm text-[#6e6e73] mt-1">Dining Locations</p>
              </div>
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#af52de] tracking-tight">4.1/5</p>
                <p className="text-sm text-[#6e6e73] mt-1">Satisfaction</p>
              </div>
            </div>

            {/* Initiatives */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">Current Initiatives</h3>
            <div className="space-y-3 mb-8">
              {[
                { name: 'Reusable Container Program', status: 'Active', locations: 'All dining halls', progress: 75 },
                { name: 'Compostable Utensils', status: 'Active', locations: 'Lenoir, Chase', progress: 60 },
                { name: 'Trayless Dining', status: 'Pilot', locations: 'Lenoir', progress: 40 },
                { name: 'Local Food Sourcing', status: 'Expanding', locations: 'Ram\'s Head', progress: 55 },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-[#1d1d1f]">{item.name}</h4>
                      <p className="text-sm text-[#86868b]">{item.locations}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-[#34c759]/10 text-[#34c759] rounded-full text-xs font-medium">{item.status}</span>
                  </div>
                  <div className="h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                    <div className="h-full bg-[#34c759] rounded-full" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback */}
            <div className="bg-[#34c759]/10 rounded-2xl p-6">
              <h3 className="font-semibold text-[#1d1d1f] mb-2">Share Your Feedback</h3>
              <p className="text-sm text-[#6e6e73] mb-4">Help us improve sustainable dining options.</p>
              <button className="bg-[#34c759] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#30d158] transition-colors">
                Give Feedback
              </button>
            </div>
          </div>
        )}

        {/* Green Fund Tab */}
        {activeTab === 'greenfund' && (
          <div>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Green Fund</h2>
                <p className="text-[#6e6e73] mt-1">Student-funded grants for sustainability projects</p>
              </div>
              <button
                onClick={() => setShowProjectForm(true)}
                className="bg-[#34c759] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#30d158] transition-colors"
              >
                Apply for Funding
              </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#34c759] tracking-tight">$156K</p>
                <p className="text-sm text-[#6e6e73] mt-1">Total Funded</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#0071e3] tracking-tight">23</p>
                <p className="text-sm text-[#6e6e73] mt-1">Projects Funded</p>
              </div>
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#af52de] tracking-tight">45</p>
                <p className="text-sm text-[#6e6e73] mt-1">Applications</p>
              </div>
            </div>

            {/* Funded Projects */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">Recently Funded Projects</h3>
            <div className="space-y-3 mb-8">
              {[
                { name: 'Solar Panel Installation - Davis Library', amount: 25000, org: 'Facilities Services' },
                { name: 'Campus Composting Bins', amount: 8500, org: 'Sustainability Office' },
                { name: 'Native Plant Garden', amount: 5000, org: 'Environmental Sciences Club' },
                { name: 'E-Bike Fleet Expansion', amount: 15000, org: 'Transportation' },
              ].map((project, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#1d1d1f]">{project.name}</h4>
                    <p className="text-sm text-[#86868b]">{project.org}</p>
                  </div>
                  <span className="text-[#34c759] font-semibold text-lg">${project.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Project Form Modal */}
            {showProjectForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-6">Green Fund Application</h3>
                  <form onSubmit={(e) => { e.preventDefault(); setSubmitted('project'); setShowProjectForm(false); }} className="space-y-4">
                    <Input label="Project Title" required />
                    <Input label="Your Name" required />
                    <Input label="Email" type="email" required />
                    <Input label="Organization/Department" required />
                    <Input label="Funding Requested ($)" type="number" required />
                    <Textarea label="Project Description" required rows={4} />
                    <Textarea label="Environmental Impact" required rows={3} />
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="flex-1 bg-[#34c759] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#30d158] transition-colors">
                        Submit Application
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowProjectForm(false)}
                        className="flex-1 bg-[#f5f5f7] text-[#1d1d1f] px-5 py-2.5 rounded-full font-medium hover:bg-[#e8e8ed] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bike Share Tab */}
        {activeTab === 'bikeshare' && (
          <div>
            <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-8">Bike Share Program</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#34c759] tracking-tight">89</p>
                <p className="text-sm text-[#6e6e73] mt-1">Bikes Available</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#0071e3] tracking-tight">12</p>
                <p className="text-sm text-[#6e6e73] mt-1">Stations</p>
              </div>
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#af52de] tracking-tight">4,500</p>
                <p className="text-sm text-[#6e6e73] mt-1">Rides This Month</p>
              </div>
            </div>

            {/* Station Map */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
              <h3 className="font-semibold text-[#1d1d1f] mb-4">Station Locations</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { name: 'Student Union', bikes: 12, available: 8 },
                  { name: 'Davis Library', bikes: 10, available: 6 },
                  { name: 'Rams Head', bikes: 8, available: 5 },
                  { name: 'Friday Center', bikes: 6, available: 3 },
                  { name: 'Morrison', bikes: 8, available: 7 },
                  { name: 'Carmichael', bikes: 10, available: 4 },
                ].map((station, i) => (
                  <div key={i} className="p-4 bg-[#f5f5f7] rounded-xl">
                    <p className="font-medium text-[#1d1d1f]">{station.name}</p>
                    <p className="text-sm text-[#34c759] font-medium">{station.available}/{station.bikes} available</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Use */}
            <div className="bg-[#34c759]/10 rounded-2xl p-6">
              <h3 className="font-semibold text-[#1d1d1f] mb-4">How to Use</h3>
              <ol className="space-y-2 text-[#6e6e73]">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#34c759] text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
                  <span>Download the UNC Bike Share app</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#34c759] text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
                  <span>Create an account with your UNC email</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#34c759] text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
                  <span>Find an available bike at any station</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#34c759] text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">4</span>
                  <span>Scan the QR code to unlock</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#34c759] text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">5</span>
                  <span>Return to any station when done</span>
                </li>
              </ol>
              <button className="mt-6 bg-[#34c759] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#30d158] transition-colors">
                Download App
              </button>
            </div>
          </div>
        )}

        {/* Climate Committee Tab */}
        {activeTab === 'committee' && (
          <div>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Climate Action Committee</h2>
                <p className="text-[#6e6e73] mt-1">Student committee advising on campus climate policy</p>
              </div>
              <button
                onClick={() => setShowCommitteeForm(true)}
                className="bg-[#34c759] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#30d158] transition-colors"
              >
                Join Committee
              </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#34c759] tracking-tight">15</p>
                <p className="text-sm text-[#6e6e73] mt-1">Members</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#0071e3] tracking-tight">12</p>
                <p className="text-sm text-[#6e6e73] mt-1">Meetings</p>
              </div>
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#af52de] tracking-tight">8</p>
                <p className="text-sm text-[#6e6e73] mt-1">Initiatives</p>
              </div>
            </div>

            {/* Current Initiatives */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">Current Initiatives</h3>
            <div className="space-y-3 mb-8">
              {[
                'Advocating for 100% renewable energy by 2035',
                'Expanding campus EV charging infrastructure',
                'Implementing green building standards for new construction',
                'Creating sustainability curriculum requirements',
              ].map((initiative, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#34c759]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#34c759]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[#1d1d1f]">{initiative}</span>
                </div>
              ))}
            </div>

            {/* Meeting Schedule */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1d1d1f] mb-4">Next Meeting</h3>
              <p className="text-xl font-semibold text-[#34c759]">February 5, 2026 at 5:00 PM</p>
              <p className="text-[#6e6e73] mt-1">Student Union Room 3407</p>
              <p className="text-sm text-[#86868b] mt-3">Meetings are open to all students</p>
            </div>

            {/* Committee Form Modal */}
            {showCommitteeForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-6">Join Climate Action Committee</h3>
                  <form onSubmit={(e) => { e.preventDefault(); setSubmitted('committee'); setShowCommitteeForm(false); }} className="space-y-4">
                    <Input label="Full Name" required />
                    <Input label="Email" type="email" required />
                    <Input label="PID" required />
                    <Select label="Year" required options={[
                      { value: 'freshman', label: 'First Year' },
                      { value: 'sophomore', label: 'Sophomore' },
                      { value: 'junior', label: 'Junior' },
                      { value: 'senior', label: 'Senior' },
                      { value: 'grad', label: 'Graduate' },
                    ]} />
                    <Input label="Major" required />
                    <Textarea label="Why do you want to join?" required rows={3} />
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="flex-1 bg-[#34c759] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#30d158] transition-colors">
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCommitteeForm(false)}
                        className="flex-1 bg-[#f5f5f7] text-[#1d1d1f] px-5 py-2.5 rounded-full font-medium hover:bg-[#e8e8ed] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Policies Tab */}
        {activeTab === 'policies' && (
          <div>
            <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-8">Environmental Policies</h2>
            <div className="space-y-3">
              {deptPolicies.map(policy => (
                <div key={policy.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-[#1d1d1f]">{policy.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      policy.status === 'in_progress' ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'bg-[#f5f5f7] text-[#86868b]'
                    }`}>
                      {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                    </span>
                  </div>
                  <p className="text-sm text-[#6e6e73] mb-4">{policy.description}</p>
                  <div className="h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                    <div className="h-full bg-[#34c759] rounded-full" style={{ width: `${policy.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </Layout>
  )
}
