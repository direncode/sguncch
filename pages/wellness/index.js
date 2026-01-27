import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { wellnessResources, departmentContacts, departmentFAQs, departmentAnnouncements, serviceGuides } from '../../lib/data'

export default function WellnessPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showRideForm, setShowRideForm] = useState(false)
  const [showSafetyPlanForm, setShowSafetyPlanForm] = useState(false)
  const [showVolunteerForm, setShowVolunteerForm] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const { policies } = useApp()

  const deptPolicies = policies.filter(p => p.department === 'wellness')

  // Tab structure matching the 6 policies
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'caps-access', label: 'CAPS Access' },
    { id: 'safety-rides', label: 'Safety & Rides' },
    { id: 'planb-narcan', label: 'Plan B & Narcan' },
    { id: 'event-safety', label: 'Event Safety' },
    { id: 'wellness-button', label: 'Wellness Button' },
    { id: 'health-integration', label: 'Health Integration' },
    { id: 'faq', label: 'FAQ & Contact' },
  ]

  const contact = departmentContacts.wellness
  const faqs = departmentFAQs.wellness
  const announcements = departmentAnnouncements.wellness
  const capsGuide = serviceGuides['caps-dropin']
  const rideGuide = serviceGuides['safe-ride']
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [feedbackForm, setFeedbackForm] = useState({ topic: '', message: '', email: '' })
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleFeedbackSubmit = (e) => {
    e.preventDefault()
    setFeedbackSubmitted(true)
    setFeedbackForm({ topic: '', message: '', email: '' })
  }

  const handleFormSubmit = (type) => (e) => {
    e.preventDefault()
    setSubmitted(type)
    setShowRideForm(false)
    setShowSafetyPlanForm(false)
    setShowVolunteerForm(false)
  }

  // Get specific policy by ID
  const getPolicy = (id) => deptPolicies.find(p => p.id === id)

  // Policy progress component
  const PolicyProgress = ({ policy }) => (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`px-2.5 py-1 rounded text-xs font-mono border ${
            policy?.status === 'completed' ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]' :
            policy?.status === 'in_progress' ? 'bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]' :
            'bg-[#21262d] text-[#6e7681] border-[#30363d]'
          }`}>
            {policy?.status === 'in_progress' ? 'IN PROGRESS' : policy?.status === 'completed' ? 'COMPLETED' : 'PLANNED'}
          </span>
        </div>
        <span className="text-[#8b949e] font-mono text-sm">{policy?.progress || 0}% Complete</span>
      </div>
      <div className="h-2 bg-[#21262d] rounded overflow-hidden">
        <div className="h-full bg-[#3fb950] rounded transition-all" style={{ width: `${policy?.progress || 0}%` }} />
      </div>
    </div>
  )

  return (
    <Layout>
      <Head>
        <title>Student Wellness | Project Bold</title>
      </Head>

      {/* Hero */}
      <div className="relative bg-[#0a0e14] border-b border-[#30363d] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#3fb950 1px, transparent 1px), linear-gradient(90deg, #3fb950 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3fb950]/10 blur-3xl rounded-full" />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <p className="text-[#3fb950] text-xs font-medium tracking-widest uppercase mb-4">Student Wellness</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0f6fc] tracking-tight mb-4">
            Your Health Matters
          </h1>
          <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed">
            Mental health, safety, and holistic student wellbeing. Access CAPS, crisis support,
            wellness resources, and safety programs.
          </p>
        </div>
      </div>

      {/* Crisis Banner */}
      <div className="bg-[#b62324] border-b border-[#da3633]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <p className="font-semibold text-white uppercase text-sm tracking-wide">In Crisis? Get immediate help:</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="tel:988" className="bg-white text-[#b62324] px-4 py-2 rounded font-mono font-bold hover:bg-[#f0f6fc] transition-colors">
              CALL 988
            </a>
            <a href="sms:741741" className="bg-white/10 border border-white/30 text-white px-4 py-2 rounded font-mono hover:bg-white/20 transition-colors">
              TEXT 741741
            </a>
            <a href="tel:919-966-3658" className="bg-white/10 border border-white/30 text-white px-4 py-2 rounded font-mono hover:bg-white/20 transition-colors">
              CAPS: 919-966-3658
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0d1117] sticky top-16 z-40 border-b border-[#30363d]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 text-xs font-medium tracking-wider uppercase whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#3fb950] text-[#3fb950]'
                    : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="bg-[#0d1117] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {submitted && (
            <div className="mb-8 bg-[#161b22] border border-[#3fb950] rounded-lg p-5">
              <p className="text-[#f0f6fc] font-medium">
                {submitted === 'ride' && 'Your ride request has been submitted! You will receive a confirmation shortly.'}
                {submitted === 'safetyplan' && 'Your event safety plan has been submitted for review. We will contact you within 2 business days.'}
                {submitted === 'volunteer' && 'Thank you for volunteering! We will reach out with training information.'}
              </p>
              <button onClick={() => setSubmitted(null)} className="text-[#3fb950] text-sm font-medium mt-3 hover:underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Wellness Initiatives Overview</h2>

              {/* Policy Cards */}
              <div className="grid md:grid-cols-2 gap-5 mb-12">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#3fb950] transition-colors cursor-pointer"
                    onClick={() => setActiveTab(policy.id === 'caps-expansion' ? 'caps-access' :
                      policy.id === 'safety-taskforce' ? 'safety-rides' :
                      policy.id === 'planb-narcan' ? 'planb-narcan' :
                      policy.id === 'event-safety' ? 'event-safety' :
                      policy.id === 'wellness-button' ? 'wellness-button' :
                      policy.id === 'health-integration' ? 'health-integration' : 'overview')}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-[#f0f6fc] pr-4">{policy.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-mono border flex-shrink-0 ${
                        policy.status === 'completed' ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]' :
                        policy.status === 'in_progress' ? 'bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]' :
                        'bg-[#21262d] text-[#6e7681] border-[#30363d]'
                      }`}>
                        {policy.progress}%
                      </span>
                    </div>
                    <p className="text-sm text-[#8b949e] mb-4 line-clamp-2">{policy.description}</p>
                    <div className="h-1.5 bg-[#21262d] rounded overflow-hidden">
                      <div className="h-full bg-[#3fb950] rounded" style={{ width: `${policy.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Resources */}
              <h3 className="text-lg font-semibold text-[#f0f6fc] mb-5">Quick Resources</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {wellnessResources.slice(0, 3).map(resource => (
                  <a key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer"
                    className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#3fb950] transition-colors">
                    <h4 className="font-semibold text-[#f0f6fc] mb-1">{resource.name}</h4>
                    <p className="text-sm text-[#8b949e] mb-2">{resource.hours}</p>
                    <p className="text-[#3fb950] font-mono text-sm">{resource.phone}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* CAPS Access Tab - Policy 1 */}
          {activeTab === 'caps-access' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Expand CAPS Access</h2>
              <p className="text-[#8b949e] mb-6">Drop-In Hours and More Locations Across Campus</p>

              <PolicyProgress policy={getPolicy('caps-expansion')} />

              <div className="grid lg:grid-cols-2 gap-8 mb-10">
                {/* Drop-In Locations */}
                <div>
                  <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Drop-In Locations</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'CAPS Main Office', location: 'Campus Health Building', hours: 'Mon-Wed 2-4pm', status: 'active' },
                      { name: 'Student Union', location: 'Room 3205', hours: 'Tue-Thu 1-3pm', status: 'active' },
                      { name: 'South Campus Hub', location: 'Ram Village Community Center', hours: 'Wed-Fri 3-5pm', status: 'coming' },
                    ].map((loc, i) => (
                      <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-[#f0f6fc]">{loc.name}</h4>
                            <p className="text-sm text-[#8b949e] mt-1">{loc.location}</p>
                            <p className="text-sm text-[#6e7681] font-mono mt-1">{loc.hours}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-mono ${
                            loc.status === 'active' ? 'bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]' :
                            'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]'
                          }`}>
                            {loc.status === 'active' ? 'ACTIVE' : 'COMING SOON'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Virtual Counseling */}
                <div>
                  <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Virtual Counseling</h3>
                  <div className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-6">
                    <div className="w-12 h-12 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-[#58a6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-[#f0f6fc] mb-2">Telehealth Sessions Available</h4>
                    <p className="text-sm text-[#8b949e] mb-4">Access counseling from anywhere with our expanded virtual options. Schedule through ConnectCarolina.</p>
                    <a href="https://caps.unc.edu" target="_blank" rel="noopener noreferrer"
                      className="inline-block bg-[#58a6ff] text-[#0d1117] px-5 py-2.5 rounded font-semibold hover:bg-[#79b8ff] transition-colors text-sm">
                      Schedule Appointment
                    </a>
                  </div>

                  {/* How-To Guide */}
                  {capsGuide && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-[#f0f6fc] mb-4">{capsGuide.title}</h4>
                      <div className="space-y-3">
                        {capsGuide.steps.map(step => (
                          <div key={step.step} className="flex gap-3">
                            <div className="w-6 h-6 bg-[#3fb950] text-[#0d1117] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {step.step}
                            </div>
                            <div>
                              <p className="font-medium text-[#f0f6fc] text-sm">{step.title}</p>
                              <p className="text-xs text-[#8b949e]">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Safety Task Force & Rides Tab - Policy 2 */}
          {activeTab === 'safety-rides' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Off-Campus Safety Task Force</h2>
              <p className="text-[#8b949e] mb-6">Late-Night Ride Programs and SafeWalk Expansion</p>

              <PolicyProgress policy={getPolicy('safety-taskforce')} />

              <div className="grid lg:grid-cols-2 gap-8 mb-10">
                {/* Request a Ride */}
                <div className="bg-[#161b22] border border-[#3fb950] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Request a Late-Night Ride</h3>
                  <p className="text-sm text-[#8b949e] mb-6">Safe, peer-driven transportation home from off-campus locations. Available Thu-Sat 10pm-3am.</p>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-mono font-bold text-[#3fb950]">247</p>
                      <p className="text-xs text-[#6e7681] uppercase">Rides Given</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-mono font-bold text-[#58a6ff]">32</p>
                      <p className="text-xs text-[#6e7681] uppercase">Volunteers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-mono font-bold text-[#a371f7]">4.9</p>
                      <p className="text-xs text-[#6e7681] uppercase">Avg Rating</p>
                    </div>
                  </div>

                  <button onClick={() => setShowRideForm(true)}
                    className="w-full bg-[#3fb950] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#46c356] transition-colors">
                    Request a Ride
                  </button>
                </div>

                {/* Volunteer */}
                <div className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Become a Safe Ride Volunteer</h3>
                  <p className="text-sm text-[#8b949e] mb-6">Help keep fellow Tar Heels safe. Volunteer drivers receive training, gas reimbursement, and service hours.</p>

                  <ul className="space-y-2 mb-6">
                    {['Background check & training provided', 'Flexible scheduling', 'Gas reimbursement included', 'Earn service hours'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-[#8b949e]">
                        <span className="text-[#3fb950]">✓</span> {item}
                      </li>
                    ))}
                  </ul>

                  <button onClick={() => setShowVolunteerForm(true)}
                    className="w-full bg-[#58a6ff] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#79b8ff] transition-colors">
                    Apply to Volunteer
                  </button>
                </div>
              </div>

              {/* How-To Guide */}
              {rideGuide && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-5">{rideGuide.title}</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    {rideGuide.steps.map(step => (
                      <div key={step.step} className="relative">
                        <div className="absolute -top-2 left-3 bg-[#3fb950] text-[#0d1117] text-xs font-bold px-2 py-0.5 rounded">
                          Step {step.step}
                        </div>
                        <div className="bg-[#21262d] rounded-lg p-4 pt-5">
                          <h4 className="font-medium text-[#f0f6fc] text-sm mb-1">{step.title}</h4>
                          <p className="text-xs text-[#8b949e]">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ride Request Modal */}
              {showRideForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6">
                    <h3 className="text-xl font-bold text-[#f0f6fc] mb-6">Request a Ride</h3>
                    <form onSubmit={handleFormSubmit('ride')} className="space-y-4">
                      <Input label="Your Name" required />
                      <Input label="Phone Number" type="tel" required />
                      <Input label="Pickup Address" required placeholder="e.g., 123 Franklin St" />
                      <Input label="Destination" required placeholder="e.g., Granville Towers" />
                      <Select label="Number of Passengers" required
                        options={[
                          { value: '1', label: '1 person' },
                          { value: '2', label: '2 people' },
                          { value: '3', label: '3 people' },
                          { value: '4', label: '4 people' },
                        ]}
                      />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 bg-[#3fb950] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#46c356]">
                          Request Ride
                        </button>
                        <button type="button" onClick={() => setShowRideForm(false)} className="px-6 py-3 rounded text-[#8b949e] border border-[#30363d] hover:bg-[#21262d]">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Volunteer Modal */}
              {showVolunteerForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6">
                    <h3 className="text-xl font-bold text-[#f0f6fc] mb-6">Volunteer Application</h3>
                    <form onSubmit={handleFormSubmit('volunteer')} className="space-y-4">
                      <Input label="Full Name" required />
                      <Input label="Email" type="email" required />
                      <Input label="PID" required />
                      <Select label="Do you have a car?" required
                        options={[
                          { value: 'yes', label: 'Yes' },
                          { value: 'no', label: 'No (can still volunteer as navigator)' },
                        ]}
                      />
                      <Textarea label="Why do you want to volunteer?" rows={3} />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 bg-[#58a6ff] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#79b8ff]">
                          Submit Application
                        </button>
                        <button type="button" onClick={() => setShowVolunteerForm(false)} className="px-6 py-3 rounded text-[#8b949e] border border-[#30363d] hover:bg-[#21262d]">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Plan B & Narcan Tab - Policy 3 */}
          {activeTab === 'planb-narcan' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Plan B & Narcan Distribution</h2>
              <p className="text-[#8b949e] mb-6">Increased Access to Life-Saving Resources Across Campus</p>

              <PolicyProgress policy={getPolicy('planb-narcan')} />

              {/* Location Map */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Distribution Locations</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                {[
                  { name: 'Campus Health', address: 'James A. Taylor Building', planb: true, narcan: true, hours: 'M-F 8am-5pm' },
                  { name: 'Student Union', address: 'Room 1301 (Info Desk)', planb: true, narcan: true, hours: 'Daily 8am-10pm' },
                  { name: 'Hinton James', address: 'Front Desk', planb: false, narcan: true, hours: '24/7' },
                  { name: 'Granville Towers', address: 'RA Office', planb: false, narcan: true, hours: '24/7' },
                  { name: 'Morrison Residence', address: 'Community Office', planb: false, narcan: true, hours: 'M-F 9am-5pm' },
                  { name: 'Rams Head', address: 'Recreation Desk', planb: true, narcan: true, hours: 'Daily 6am-11pm' },
                ].map((loc, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                    <h4 className="font-semibold text-[#f0f6fc] mb-1">{loc.name}</h4>
                    <p className="text-sm text-[#8b949e] mb-2">{loc.address}</p>
                    <p className="text-xs text-[#6e7681] font-mono mb-3">{loc.hours}</p>
                    <div className="flex gap-2">
                      {loc.planb && <span className="px-2 py-0.5 rounded text-xs bg-[#a371f7]/10 text-[#a371f7] border border-[#a371f7]">Plan B</span>}
                      {loc.narcan && <span className="px-2 py-0.5 rounded text-xs bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]">Narcan</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Education Section */}
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-[#161b22] border border-[#a371f7] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">About Plan B</h3>
                  <p className="text-sm text-[#8b949e] mb-4">Plan B (levonorgestrel) is emergency contraception that can prevent pregnancy when taken within 72 hours of unprotected sex. It's most effective when taken as soon as possible.</p>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li>• Available free to all UNC students</li>
                    <li>• No appointment or ID needed at most locations</li>
                    <li>• Confidential - no questions asked</li>
                  </ul>
                </div>

                <div className="bg-[#161b22] border border-[#3fb950] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">About Narcan (Naloxone)</h3>
                  <p className="text-sm text-[#8b949e] mb-4">Narcan is a life-saving medication that can reverse an opioid overdose. It's safe, easy to use, and can be the difference between life and death.</p>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li>• Free training available monthly</li>
                    <li>• Nasal spray - no needles required</li>
                    <li>• Good Samaritan law protects you</li>
                  </ul>
                  <button className="mt-4 bg-[#3fb950] text-[#0d1117] px-5 py-2.5 rounded font-semibold hover:bg-[#46c356] transition-colors text-sm">
                    Sign Up for Training
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Event Safety Tab - Policy 4 */}
          {activeTab === 'event-safety' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Off-Campus Event Safety Planning</h2>
              <p className="text-[#8b949e] mb-6">Safety Plans for Registered Student Organization Events</p>

              <PolicyProgress policy={getPolicy('event-safety')} />

              <div className="grid lg:grid-cols-2 gap-8 mb-10">
                {/* Submit Safety Plan */}
                <div>
                  <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Submit a Safety Plan</h3>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <p className="text-sm text-[#8b949e] mb-6">Registered student organizations hosting off-campus events with 50+ attendees must submit a safety plan at least 7 days in advance.</p>

                    <div className="space-y-4 mb-6">
                      {['Transportation plan', 'Crowd management strategy', 'Emergency contact list', 'Sober monitor assignments'].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-[#3fb950]/10 border border-[#3fb950]/30 flex items-center justify-center">
                            <span className="text-[#3fb950] text-xs">✓</span>
                          </div>
                          <span className="text-sm text-[#f0f6fc]">{item}</span>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => setShowSafetyPlanForm(true)}
                      className="w-full bg-[#3fb950] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#46c356] transition-colors">
                      Start Safety Plan
                    </button>
                  </div>
                </div>

                {/* Resources & Workshops */}
                <div>
                  <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Workshops & Resources</h3>

                  <div className="space-y-4">
                    <div className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded text-xs bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]">WORKSHOP</span>
                        <span className="text-xs text-[#6e7681] font-mono">Feb 10, 2026</span>
                      </div>
                      <h4 className="font-semibold text-[#f0f6fc]">Event Safety 101</h4>
                      <p className="text-sm text-[#8b949e] mt-1">Learn the basics of creating effective safety plans. 5pm, Union 3201</p>
                    </div>

                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                      <h4 className="font-semibold text-[#f0f6fc] mb-2">Safety Plan Template</h4>
                      <p className="text-sm text-[#8b949e] mb-3">Download our template to get started on your event safety plan.</p>
                      <button className="text-[#58a6ff] text-sm font-medium hover:underline">Download Template (PDF)</button>
                    </div>

                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                      <h4 className="font-semibold text-[#f0f6fc] mb-2">Best Practices Guide</h4>
                      <p className="text-sm text-[#8b949e] mb-3">Comprehensive guide to hosting safe off-campus events.</p>
                      <button className="text-[#58a6ff] text-sm font-medium hover:underline">View Guide</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Plan Modal */}
              {showSafetyPlanForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-[#f0f6fc] mb-6">Submit Event Safety Plan</h3>
                    <form onSubmit={handleFormSubmit('safetyplan')} className="space-y-4">
                      <Input label="Organization Name" required />
                      <Input label="Event Name" required />
                      <Input label="Event Date" type="date" required />
                      <Input label="Event Location" required />
                      <Input label="Expected Attendance" type="number" required />
                      <Textarea label="Transportation Plan" required rows={2} placeholder="How will attendees get to/from the event?" />
                      <Textarea label="Emergency Contacts" required rows={2} placeholder="List 2-3 sober contacts with phone numbers" />
                      <Textarea label="Additional Safety Measures" rows={2} />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 bg-[#3fb950] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#46c356]">
                          Submit Plan
                        </button>
                        <button type="button" onClick={() => setShowSafetyPlanForm(false)} className="px-6 py-3 rounded text-[#8b949e] border border-[#30363d] hover:bg-[#21262d]">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wellness Button Tab - Policy 5 */}
          {activeTab === 'wellness-button' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Student Wellness Button in Canvas</h2>
              <p className="text-[#8b949e] mb-6">One-Click Access to Mental Health, Medical, and Safety Resources</p>

              <PolicyProgress policy={getPolicy('wellness-button')} />

              {/* Preview */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 mb-10">
                <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-6">Canvas Integration Preview</h3>

                <div className="bg-[#21262d] rounded-lg p-6 max-w-2xl">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#30363d]">
                    <div className="w-10 h-10 bg-[#3fb950] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">♥</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#f0f6fc]">Student Wellness</p>
                      <p className="text-xs text-[#8b949e]">Click for instant access to resources</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: '🧠', label: 'CAPS', color: '#3fb950' },
                      { icon: '🏥', label: 'Health', color: '#58a6ff' },
                      { icon: '💊', label: 'Plan B/Narcan', color: '#a371f7' },
                      { icon: '🚗', label: 'Safe Ride', color: '#d29922' },
                    ].map((item, i) => (
                      <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-center hover:border-[#3fb950] transition-colors cursor-pointer">
                        <span className="text-2xl">{item.icon}</span>
                        <p className="text-xs font-medium text-[#f0f6fc] mt-2">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* What It Links To */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Quick Access Resources</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'CAPS Appointments', desc: 'Schedule counseling sessions directly', link: 'https://caps.unc.edu' },
                  { title: 'Campus Health Portal', desc: 'Medical appointments and records', link: 'https://campushealth.unc.edu' },
                  { title: 'Plan B & Narcan Locations', desc: 'Find distribution points near you', link: '#' },
                  { title: 'Safe Ride Request', desc: 'Request late-night transportation', link: '#' },
                  { title: 'Crisis Resources', desc: '24/7 hotlines and text support', link: '#' },
                  { title: 'Wellness Programs', desc: 'Workshops and peer support', link: '#' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#3fb950] transition-colors">
                    <h4 className="font-semibold text-[#f0f6fc]">{item.title}</h4>
                    <p className="text-sm text-[#8b949e] mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Integration Tab - Policy 6 */}
          {activeTab === 'health-integration' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Campus Health ConnectCarolina Integration</h2>
              <p className="text-[#8b949e] mb-6">Unified Scheduling for Medical and Mental Health Appointments</p>

              <PolicyProgress policy={getPolicy('health-integration')} />

              {/* Benefits */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Integration Benefits</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                  { icon: '📅', title: 'Unified Scheduling', desc: 'One platform for all health appointments' },
                  { icon: '📋', title: 'Coordinated Care', desc: 'Providers see your full health picture' },
                  { icon: '🔔', title: 'Smart Reminders', desc: 'Automated appointment notifications' },
                  { icon: '📱', title: 'Mobile Access', desc: 'Schedule from anywhere, anytime' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <span className="text-2xl">{item.icon}</span>
                    <h4 className="font-semibold text-[#f0f6fc] mt-3">{item.title}</h4>
                    <p className="text-sm text-[#8b949e] mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Current Status */}
              <div className="bg-[#161b22] border border-[#d29922] rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2.5 py-1 rounded text-xs font-mono bg-[#d29922]/10 text-[#d29922] border border-[#d29922]">IN DEVELOPMENT</span>
                </div>
                <h3 className="text-lg font-semibold text-[#f0f6fc] mb-2">Advocacy in Progress</h3>
                <p className="text-sm text-[#8b949e] mb-4">We're working with Campus Health and ITS to integrate health services into ConnectCarolina. Current timeline: Fall 2026 pilot.</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-[#3fb950]" />
                    <span className="text-sm text-[#f0f6fc]">Requirements gathering - Complete</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-[#3fb950]" />
                    <span className="text-sm text-[#f0f6fc]">Stakeholder meetings - Complete</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-[#d29922]" />
                    <span className="text-sm text-[#f0f6fc]">Technical planning - In Progress</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-[#30363d]" />
                    <span className="text-sm text-[#8b949e]">Development - Pending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-[#30363d]" />
                    <span className="text-sm text-[#8b949e]">Pilot launch - Fall 2026</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ & Contact Tab */}
          {activeTab === 'faq' && (
            <div>
              <div className="grid lg:grid-cols-2 gap-8 mb-12">
                {/* Contact Info */}
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-6">Contact Us</h2>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-full flex items-center justify-center">
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
                        <a href={`mailto:${contact.lead.email}`} className="text-[#58a6ff] hover:underline">{contact.lead.email}</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">📱</span>
                        <span className="text-[#f0f6fc]">{contact.socialMedia}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Feedback Form */}
                  <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h3 className="font-semibold text-[#f0f6fc] mb-4">Send Feedback</h3>
                    {feedbackSubmitted ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-[#3fb950]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">✓</span>
                        </div>
                        <p className="text-[#3fb950] font-medium">Thanks for your feedback!</p>
                        <button onClick={() => setFeedbackSubmitted(false)} className="text-[#58a6ff] text-sm mt-2 hover:underline">Send another</button>
                      </div>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                        <Select label="Topic" value={feedbackForm.topic} onChange={e => setFeedbackForm({...feedbackForm, topic: e.target.value})} required
                          options={[
                            { value: 'suggestion', label: 'Suggestion' },
                            { value: 'question', label: 'Question' },
                            { value: 'concern', label: 'Concern' },
                            { value: 'compliment', label: 'Compliment' },
                          ]}
                        />
                        <Textarea label="Message" value={feedbackForm.message} onChange={e => setFeedbackForm({...feedbackForm, message: e.target.value})} required rows={3} />
                        <Input label="Email (optional)" type="email" value={feedbackForm.email} onChange={e => setFeedbackForm({...feedbackForm, email: e.target.value})} />
                        <button type="submit" className="w-full bg-[#3fb950] text-[#0d1117] px-4 py-2.5 rounded font-semibold hover:bg-[#46c356] transition-colors">
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

              {/* Announcements */}
              <div>
                <h3 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-5">Recent Updates</h3>
                <div className="space-y-3">
                  {announcements.map(ann => (
                    <div key={ann.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-start gap-4">
                      <div className={`px-2 py-1 rounded text-xs font-mono ${
                        ann.type === 'event' ? 'bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]' :
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
        </div>
      </main>
    </Layout>
  )
}
