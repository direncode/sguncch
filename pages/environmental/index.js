import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { departmentContacts, departmentFAQs, departmentAnnouncements, serviceGuides } from '../../lib/data'

export default function EnvironmentalPage() {
  const [activeTab, setActiveTab] = useState('carbon')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showCommitteeForm, setShowCommitteeForm] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const { policies } = useApp()

  const deptPolicies = policies.filter(p => p.department === 'environmental')

  const contact = departmentContacts.environmental
  const faqs = departmentFAQs.environmental
  const announcements = departmentAnnouncements.environmental
  const greenFundGuide = serviceGuides['green-fund']
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [feedbackForm, setFeedbackForm] = useState({ topic: '', message: '', email: '' })
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleFeedbackSubmit = (e) => {
    e.preventDefault()
    setFeedbackSubmitted(true)
    setFeedbackForm({ topic: '', message: '', email: '' })
  }

  return (
    <Layout>
      <Head>
        <title>Environmental | Project Bold</title>
      </Head>

      {/* Hero with grid background */}
      <div className="relative bg-gradient-to-b from-[#0a0e14] to-[#0d1117] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#3fb950 1px, transparent 1px), linear-gradient(90deg, #3fb950 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-[#3fb950]/20 border border-[#3fb950]/30 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-[#3fb950]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-[#3fb950] text-xs font-mono uppercase tracking-widest mb-1">SUSTAINABILITY DIVISION</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#f0f6fc]">Environmental Affairs</h1>
            </div>
          </div>
          <p className="text-[#8b949e] text-lg max-w-2xl mt-4">
            Sustainability, climate action, and green initiatives. Building a more
            sustainable Carolina for future generations.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0d1117] border-b border-[#30363d] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {[
              { id: 'carbon', label: 'Carbon Neutrality' },
              { id: 'dining', label: 'Sustainable Dining' },
              { id: 'greenfund', label: 'Green Fund' },
              { id: 'bikeshare', label: 'Bike Share' },
              { id: 'committee', label: 'Climate Committee' },
              { id: 'faq', label: 'FAQ & Contact' },
              { id: 'policies', label: 'All Policies' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 text-xs font-medium uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-[#3fb950] border-[#3fb950]'
                    : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="bg-[#0a0e14] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {submitted && (
            <div className="mb-8 bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-5">
              <p className="text-[#f0f6fc] font-medium">
                {submitted === 'project' && 'Your Green Fund application has been submitted! We will review and contact you within 2 weeks.'}
                {submitted === 'committee' && 'Thank you for your interest in the Climate Action Committee! We will reach out about next steps.'}
              </p>
              <button onClick={() => setSubmitted(null)} className="text-[#3fb950] text-sm mt-2 font-medium hover:underline">Dismiss</button>
            </div>
          )}

          {/* Carbon Neutrality Tab */}
          {activeTab === 'carbon' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Carbon Neutrality Push</h2>

              {/* Progress */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#f0f6fc] uppercase text-xs tracking-widest">UNC Carbon Reduction Progress</h3>
                  <span className="text-[#6e7681] text-xs font-mono">TARGET: 2040</span>
                </div>
                <div className="flex items-center gap-6 mb-4">
                  <div className="text-5xl font-mono font-bold text-[#3fb950] tracking-tight">12%</div>
                  <div className="flex-1">
                    <p className="text-sm text-[#8b949e] mb-2">Reduction from 2007 baseline</p>
                    <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#238636] to-[#3fb950] rounded-full" style={{ width: '12%' }} />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#6e7681]">Goal: Carbon neutrality by 2040</p>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#3fb950] tracking-tight">890</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Petition Signatures</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#58a6ff] tracking-tight">45</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Actions Taken</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#a371f7] tracking-tight">5</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Admin Meetings</p>
                </div>
              </div>

              {/* Take Action */}
              <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-widest mb-4">Take Action</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#161b22] border border-[#3fb950] rounded-lg p-6">
                  <h4 className="font-semibold text-lg text-[#f0f6fc] mb-2">Sign the Petition</h4>
                  <p className="text-[#8b949e] mb-4">Demand accelerated carbon neutrality timeline from university leadership.</p>
                  <button className="bg-[#238636] text-white px-5 py-2.5 rounded font-medium hover:bg-[#2ea043] transition-colors">
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

              {/* Impact Calculator */}
              <div className="mt-8 bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-2">Calculate Your Impact</h3>
                <p className="text-sm text-[#8b949e] mb-4">See how your daily choices affect carbon emissions.</p>
                <button className="bg-[#238636] text-white px-5 py-2.5 rounded font-medium hover:bg-[#2ea043] transition-colors">
                  Open Calculator
                </button>
              </div>
            </div>
          )}

          {/* Sustainable Dining Tab */}
          {activeTab === 'dining' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Sustainable Dining Initiative</h2>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#3fb950] tracking-tight">45,000</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Plastics Reduced</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#58a6ff] tracking-tight">12</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Dining Locations</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#a371f7] tracking-tight">4.1/5</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Satisfaction</p>
                </div>
              </div>

              {/* Initiatives */}
              <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-widest mb-4">Current Initiatives</h3>
              <div className="space-y-3 mb-8">
                {[
                  { name: 'Reusable Container Program', status: 'Active', locations: 'All dining halls', progress: 75 },
                  { name: 'Compostable Utensils', status: 'Active', locations: 'Lenoir, Chase', progress: 60 },
                  { name: 'Trayless Dining', status: 'Pilot', locations: 'Lenoir', progress: 40 },
                  { name: 'Local Food Sourcing', status: 'Expanding', locations: 'Ram\'s Head', progress: 55 },
                ].map((item, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-[#f0f6fc]">{item.name}</h4>
                        <p className="text-sm text-[#6e7681]">{item.locations}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-transparent border border-[#3fb950] text-[#3fb950] rounded text-xs font-mono uppercase">{item.status}</span>
                    </div>
                    <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#238636] to-[#3fb950] rounded-full" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedback */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-2">Share Your Feedback</h3>
                <p className="text-sm text-[#8b949e] mb-4">Help us improve sustainable dining options.</p>
                <button className="bg-[#238636] text-white px-5 py-2.5 rounded font-medium hover:bg-[#2ea043] transition-colors">
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
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Green Fund</h2>
                  <p className="text-[#8b949e] mt-1">Student-funded grants for sustainability projects</p>
                </div>
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="bg-[#238636] text-white px-5 py-2.5 rounded font-medium hover:bg-[#2ea043] transition-colors"
                >
                  Apply for Funding
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#3fb950] tracking-tight">$156K</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Total Funded</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#58a6ff] tracking-tight">23</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Projects Funded</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#a371f7] tracking-tight">45</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Applications</p>
                </div>
              </div>

              {/* Funded Projects */}
              <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-widest mb-4">Recently Funded Projects</h3>
              <div className="space-y-3 mb-8">
                {[
                  { name: 'Solar Panel Installation - Davis Library', amount: 25000, org: 'Facilities Services' },
                  { name: 'Campus Composting Bins', amount: 8500, org: 'Sustainability Office' },
                  { name: 'Native Plant Garden', amount: 5000, org: 'Environmental Sciences Club' },
                  { name: 'E-Bike Fleet Expansion', amount: 15000, org: 'Transportation' },
                ].map((project, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-[#f0f6fc]">{project.name}</h4>
                      <p className="text-sm text-[#6e7681]">{project.org}</p>
                    </div>
                    <span className="text-[#3fb950] font-mono font-bold text-lg">${project.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Project Form Modal */}
              {showProjectForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-[#f0f6fc] mb-6">Green Fund Application</h3>
                    <form onSubmit={(e) => { e.preventDefault(); setSubmitted('project'); setShowProjectForm(false); }} className="space-y-4">
                      <Input label="Project Title" required />
                      <Input label="Your Name" required />
                      <Input label="Email" type="email" required />
                      <Input label="Organization/Department" required />
                      <Input label="Funding Requested ($)" type="number" required />
                      <Textarea label="Project Description" required rows={4} />
                      <Textarea label="Environmental Impact" required rows={3} />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 bg-[#238636] text-white px-5 py-2.5 rounded font-medium hover:bg-[#2ea043] transition-colors">
                          Submit Application
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowProjectForm(false)}
                          className="flex-1 bg-[#21262d] text-[#f0f6fc] px-5 py-2.5 rounded font-medium hover:bg-[#30363d] border border-[#30363d] transition-colors"
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
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Bike Share Program</h2>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#3fb950] tracking-tight">89</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Bikes Available</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#58a6ff] tracking-tight">12</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Stations</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#a371f7] tracking-tight">4,500</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Rides This Month</p>
                </div>
              </div>

              {/* Station Map */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-[#f0f6fc] mb-4 uppercase text-xs tracking-widest">Station Locations</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { name: 'Student Union', bikes: 12, available: 8 },
                    { name: 'Davis Library', bikes: 10, available: 6 },
                    { name: 'Rams Head', bikes: 8, available: 5 },
                    { name: 'Friday Center', bikes: 6, available: 3 },
                    { name: 'Morrison', bikes: 8, available: 7 },
                    { name: 'Carmichael', bikes: 10, available: 4 },
                  ].map((station, i) => (
                    <div key={i} className="p-4 bg-[#21262d] border border-[#30363d] rounded-lg">
                      <p className="font-medium text-[#f0f6fc]">{station.name}</p>
                      <p className="text-sm font-mono text-[#3fb950]">{station.available}/{station.bikes} <span className="text-[#6e7681]">available</span></p>
                    </div>
                  ))}
                </div>
              </div>

              {/* How to Use */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-4 uppercase text-xs tracking-widest">How to Use</h3>
                <ol className="space-y-3 text-[#8b949e]">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#238636] text-white rounded flex items-center justify-center text-xs font-mono flex-shrink-0">1</span>
                    <span>Download the UNC Bike Share app</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#238636] text-white rounded flex items-center justify-center text-xs font-mono flex-shrink-0">2</span>
                    <span>Create an account with your UNC email</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#238636] text-white rounded flex items-center justify-center text-xs font-mono flex-shrink-0">3</span>
                    <span>Find an available bike at any station</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#238636] text-white rounded flex items-center justify-center text-xs font-mono flex-shrink-0">4</span>
                    <span>Scan the QR code to unlock</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#238636] text-white rounded flex items-center justify-center text-xs font-mono flex-shrink-0">5</span>
                    <span>Return to any station when done</span>
                  </li>
                </ol>
                <button className="mt-6 bg-[#238636] text-white px-5 py-2.5 rounded font-medium hover:bg-[#2ea043] transition-colors">
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
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Climate Action Committee</h2>
                  <p className="text-[#8b949e] mt-1">Student committee advising on campus climate policy</p>
                </div>
                <button
                  onClick={() => setShowCommitteeForm(true)}
                  className="bg-[#238636] text-white px-5 py-2.5 rounded font-medium hover:bg-[#2ea043] transition-colors"
                >
                  Join Committee
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#3fb950] tracking-tight">15</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Members</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#58a6ff] tracking-tight">12</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Meetings</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <p className="text-4xl font-mono font-bold text-[#a371f7] tracking-tight">8</p>
                  <p className="text-xs text-[#8b949e] mt-1 uppercase tracking-widest">Initiatives</p>
                </div>
              </div>

              {/* Current Initiatives */}
              <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-widest mb-4">Current Initiatives</h3>
              <div className="space-y-3 mb-8">
                {[
                  'Advocating for 100% renewable energy by 2035',
                  'Expanding campus EV charging infrastructure',
                  'Implementing green building standards for new construction',
                  'Creating sustainability curriculum requirements',
                ].map((initiative, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#238636]/20 border border-[#3fb950]/30 rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#3fb950]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[#f0f6fc]">{initiative}</span>
                  </div>
                ))}
              </div>

              {/* Meeting Schedule */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-4 uppercase text-xs tracking-widest">Next Meeting</h3>
                <p className="text-xl font-mono font-bold text-[#3fb950]">February 5, 2026 at 5:00 PM</p>
                <p className="text-[#8b949e] mt-1">Student Union Room 3407</p>
                <p className="text-sm text-[#6e7681] mt-3">Meetings are open to all students</p>
              </div>

              {/* Committee Form Modal */}
              {showCommitteeForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-[#f0f6fc] mb-6">Join Climate Action Committee</h3>
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
                        <button type="submit" className="flex-1 bg-[#238636] text-white px-5 py-2.5 rounded font-medium hover:bg-[#2ea043] transition-colors">
                          Apply
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCommitteeForm(false)}
                          className="flex-1 bg-[#21262d] text-[#f0f6fc] px-5 py-2.5 rounded font-medium hover:bg-[#30363d] border border-[#30363d] transition-colors"
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

          {/* FAQ & Contact Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-6">Contact Us</h2>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#3fb950]/20 border border-[#3fb950]/40 rounded-full flex items-center justify-center">
                        <span className="text-xl">👤</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">{contact.lead.name}</p>
                        <p className="text-sm text-[#8b949e]">{contact.lead.title}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">📍</span>
                        <span className="text-[#f0f6fc]">{contact.office}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">🕐</span>
                        <span className="text-[#f0f6fc]">{contact.hours}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">📧</span>
                        <a href={`mailto:${contact.lead.email}`} className="text-[#3fb950] hover:underline">{contact.lead.email}</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">📱</span>
                        <span className="text-[#f0f6fc]">{contact.socialMedia}</span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Form */}
                  <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h3 className="font-semibold text-[#f0f6fc] mb-4">Send Feedback</h3>
                    {feedbackSubmitted ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-[#3fb950]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">✓</span>
                        </div>
                        <p className="text-[#3fb950] font-medium">Thanks for your feedback!</p>
                        <button onClick={() => setFeedbackSubmitted(false)} className="text-[#238636] text-sm mt-2 hover:underline">Send another</button>
                      </div>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                        <Select label="Topic" name="topic" value={feedbackForm.topic} onChange={e => setFeedbackForm({...feedbackForm, topic: e.target.value})} required
                          options={[
                            { value: 'sustainability', label: 'Sustainability' },
                            { value: 'greenfund', label: 'Green Fund' },
                            { value: 'bikeshare', label: 'Bike Share' },
                            { value: 'other', label: 'Other' },
                          ]}
                        />
                        <Textarea label="Message" name="message" value={feedbackForm.message} onChange={e => setFeedbackForm({...feedbackForm, message: e.target.value})} required rows={3} />
                        <Input label="Email (optional)" type="email" name="email" value={feedbackForm.email} onChange={e => setFeedbackForm({...feedbackForm, email: e.target.value})} />
                        <button type="submit" className="w-full bg-[#238636] text-white px-4 py-2.5 rounded font-semibold hover:bg-[#2ea043] transition-colors">
                          Submit Feedback
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                          className="w-full text-left p-4 flex items-center justify-between hover:bg-[#21262d] transition-colors"
                        >
                          <span className="font-medium text-[#f0f6fc] pr-4">{faq.q}</span>
                          <span className="text-[#8b949e] flex-shrink-0">{expandedFaq === i ? '−' : '+'}</span>
                        </button>
                        {expandedFaq === i && (
                          <div className="px-4 pb-4 text-[#8b949e] text-sm border-t border-[#30363d] pt-3">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* How-To Guide */}
              <div>
                <h3 className="text-lg font-bold text-[#f0f6fc] tracking-tight mb-4">{greenFundGuide.title}</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {greenFundGuide.steps.map((step) => (
                    <div key={step.step} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 relative">
                      <div className="absolute -top-3 left-4 bg-[#238636] text-white text-xs font-bold px-2 py-1 rounded">
                        Step {step.step}
                      </div>
                      <h4 className="font-semibold text-[#f0f6fc] mt-2 mb-2">{step.title}</h4>
                      <p className="text-sm text-[#8b949e]">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Announcements */}
              <div>
                <h3 className="text-lg font-bold text-[#f0f6fc] tracking-tight mb-4">Recent Updates</h3>
                <div className="space-y-3">
                  {announcements.map(ann => (
                    <div key={ann.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-start gap-4">
                      <div className={`px-2 py-1 rounded text-xs font-mono ${
                        ann.type === 'deadline' ? 'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]' :
                        'bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]'
                      }`}>
                        {ann.type.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-[#f0f6fc]">{ann.title}</h4>
                          <span className="text-xs text-[#6e7681] font-mono">{ann.date}</span>
                        </div>
                        <p className="text-sm text-[#8b949e]">{ann.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* All Policies Tab */}
          {activeTab === 'policies' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Environmental Policies</h2>
              <div className="space-y-3">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-[#f0f6fc]">{policy.title}</h3>
                      <span className={`px-2.5 py-1 rounded text-xs font-mono uppercase border ${
                        policy.status === 'in_progress'
                          ? 'border-[#58a6ff] text-[#58a6ff]'
                          : 'border-[#6e7681] text-[#6e7681]'
                      }`}>
                        {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                      </span>
                    </div>
                    <p className="text-sm text-[#8b949e] mb-4">{policy.description}</p>
                    <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#238636] to-[#3fb950] rounded-full" style={{ width: `${policy.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  )
}
