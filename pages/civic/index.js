import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button, Checkbox } from '../../components/FormInput'
import { useApp } from '../../lib/store'

export default function CivicPage() {
  const [activeTab, setActiveTab] = useState('voter')
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [showFellowsForm, setShowFellowsForm] = useState(false)
  const [registrationForm, setRegistrationForm] = useState({ name: '', email: '', dob: '', address: '', county: '' })
  const [submitted, setSubmitted] = useState(null)
  const { policies } = useApp()

  const deptPolicies = policies.filter(p => p.department === 'civic')

  return (
    <Layout>
      <Head>
        <title>Civic Engagement | Project Bold</title>
      </Head>

      {/* Hero */}
      <div className="relative bg-[#0a0e14] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(163,113,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(163,113,247,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#a371f7]/10 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#a371f7]/10 border border-[#a371f7]/30 rounded text-xs font-mono text-[#a371f7] uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 bg-[#a371f7] rounded-full animate-pulse" />
            Civic Engagement
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#f0f6fc] mb-4">Your Voice Matters</h1>
          <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed">
            Voting, service, and community participation. Make it count in elections and in our community.
          </p>
        </div>
      </div>

      {/* Election Alert Banner */}
      <div className="bg-[#0d1117] border-b border-[#30363d] py-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[#f0f6fc] font-medium">NC Primary Election: March 3, 2026</p>
          <span className="bg-[#a371f7]/10 text-[#a371f7] border border-[#a371f7]/30 px-4 py-1.5 rounded text-sm font-mono">
            Registration Deadline: Feb 7
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0d1117] border-b border-[#30363d] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {[
              { id: 'voter', label: 'Voter Registration' },
              { id: 'fellows', label: 'Civic Fellows' },
              { id: 'transit', label: 'Election Transit' },
              { id: 'service', label: 'Day of Service' },
              { id: 'democracy', label: 'Democracy Week' },
              { id: 'policies', label: 'All Policies' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 text-xs font-medium uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'text-[#a371f7] border-[#a371f7]'
                    : 'text-[#6e7681] border-transparent hover:text-[#8b949e] hover:border-[#30363d]'
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
            <div className="mb-8 bg-[#161b22] border border-[#238636] rounded-lg p-5">
              <p className="text-[#f0f6fc] font-medium">
                {submitted === 'voter' && 'Thank you! Check your email for next steps to complete your voter registration.'}
                {submitted === 'fellows' && 'Your Civic Fellows application has been submitted! We will review and contact you within 2 weeks.'}
              </p>
              <button onClick={() => setSubmitted(null)} className="text-[#238636] text-sm font-medium mt-2 hover:underline">Dismiss</button>
            </div>
          )}

          {/* Voter Registration Tab */}
          {activeTab === 'voter' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Voter Registration</h2>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#a371f7] tracking-tight">4,560</p>
                  <p className="text-sm text-[#6e7681] mt-1">Students Registered</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#58a6ff] tracking-tight">23</p>
                  <p className="text-sm text-[#6e7681] mt-1">Registration Events</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#238636] tracking-tight">89</p>
                  <p className="text-sm text-[#6e7681] mt-1">Volunteers</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#d29922] tracking-tight">78%</p>
                  <p className="text-sm text-[#6e7681] mt-1">Campus Turnout Goal</p>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid md:grid-cols-2 gap-5 mb-10">
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
              <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-4">Campus Polling Locations</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-10">
                {[
                  { name: 'Student Union', address: 'Frank Porter Graham Student Union', precinct: 'Chapel Hill 2' },
                  { name: 'Rams Head Recreation', address: '101 Student Recreation Center Way', precinct: 'Chapel Hill 3' },
                ].map((loc, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <h4 className="font-semibold text-[#f0f6fc]">{loc.name}</h4>
                    <p className="text-sm text-[#8b949e] mt-1">{loc.address}</p>
                    <p className="text-sm text-[#a371f7] font-mono mt-2">Precinct: {loc.precinct}</p>
                  </div>
                ))}
              </div>

              {/* Important Dates */}
              <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-4">Important Dates</h3>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-[#30363d]">
                    {[
                      { date: 'Feb 7, 2026', event: 'Voter Registration Deadline' },
                      { date: 'Feb 13-29, 2026', event: 'Early Voting Period' },
                      { date: 'Mar 3, 2026', event: 'Primary Election Day' },
                      { date: 'Oct 9, 2026', event: 'General Election Registration Deadline' },
                      { date: 'Nov 3, 2026', event: 'General Election Day' },
                    ].map((item, i) => (
                      <tr key={i} className="hover:bg-[#21262d]">
                        <td className="px-5 py-4 font-mono text-[#f0f6fc]">{item.date}</td>
                        <td className="px-5 py-4 text-[#8b949e]">{item.event}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Registration Form Modal */}
              {showRegistrationForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-[#f0f6fc] mb-2">Voter Registration Assistance</h3>
                    <p className="text-sm text-[#8b949e] mb-6">We'll help you complete your NC voter registration form.</p>
                    <form onSubmit={(e) => { e.preventDefault(); setSubmitted('voter'); setShowRegistrationForm(false); }} className="space-y-4">
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
                        <button type="submit" className="bg-[#a371f7] text-white px-5 py-2.5 rounded font-medium hover:bg-[#8b5cf6] transition-colors">
                          Submit
                        </button>
                        <button type="button" onClick={() => setShowRegistrationForm(false)} className="bg-[#21262d] text-[#f0f6fc] border border-[#30363d] px-5 py-2.5 rounded font-medium hover:bg-[#30363d] transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Civic Fellows Tab */}
          {activeTab === 'fellows' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Civic Fellows Program</h2>
                  <p className="text-[#8b949e] mt-1">Fellowship connecting students with local government internships</p>
                </div>
                <button
                  onClick={() => setShowFellowsForm(true)}
                  className="bg-[#a371f7] text-white px-5 py-2.5 rounded font-medium hover:bg-[#8b5cf6] transition-colors"
                >
                  Apply Now
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#a371f7] tracking-tight">24</p>
                  <p className="text-sm text-[#6e7681] mt-1">Current Fellows</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#58a6ff] tracking-tight">18</p>
                  <p className="text-sm text-[#6e7681] mt-1">Active Placements</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#238636] tracking-tight">12</p>
                  <p className="text-sm text-[#6e7681] mt-1">Government Partners</p>
                </div>
              </div>

              {/* Partner Organizations */}
              <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-4">Placement Partners</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                  'Chapel Hill Town Council',
                  'Carrboro Town Hall',
                  'Orange County Government',
                  'NC General Assembly',
                  'Governor\'s Office',
                  'Secretary of State',
                ].map((org, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center hover:border-[#a371f7]/50 transition-colors">
                    <p className="font-medium text-[#f0f6fc]">{org}</p>
                  </div>
                ))}
              </div>

              {/* Fellows Form Modal */}
              {showFellowsForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-[#f0f6fc] mb-6">Civic Fellows Application</h3>
                    <form onSubmit={(e) => { e.preventDefault(); setSubmitted('fellows'); setShowFellowsForm(false); }} className="space-y-4">
                      <Input label="Full Name" required />
                      <Input label="Email" type="email" required />
                      <Input label="PID" required />
                      <Select label="Year" required options={[
                        { value: 'sophomore', label: 'Sophomore' },
                        { value: 'junior', label: 'Junior' },
                        { value: 'senior', label: 'Senior' },
                      ]} />
                      <Input label="Major" required />
                      <Textarea label="Why are you interested in civic engagement?" required rows={3} />
                      <Textarea label="Relevant experience" rows={3} />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="bg-[#a371f7] text-white px-5 py-2.5 rounded font-medium hover:bg-[#8b5cf6] transition-colors">
                          Submit Application
                        </button>
                        <button type="button" onClick={() => setShowFellowsForm(false)} className="bg-[#21262d] text-[#f0f6fc] border border-[#30363d] px-5 py-2.5 rounded font-medium hover:bg-[#30363d] transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Election Transit Tab */}
          {activeTab === 'transit' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Election Day Transit</h2>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#a371f7] tracking-tight">5</p>
                  <p className="text-sm text-[#6e7681] mt-1">Transit Routes</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#58a6ff] tracking-tight">1,200</p>
                  <p className="text-sm text-[#6e7681] mt-1">Rides Last Election</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#238636] tracking-tight">8</p>
                  <p className="text-sm text-[#6e7681] mt-1">Polling Locations Served</p>
                </div>
              </div>

              {/* Routes */}
              <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-4">Free Shuttle Routes (Election Day)</h3>
              <div className="space-y-4 mb-10">
                {[
                  { name: 'Route A: South Campus Loop', stops: 'Rams Head - Student Union - Polling Location', frequency: 'Every 15 min' },
                  { name: 'Route B: North Campus Loop', stops: 'Friday Center - Morrison - Polling Location', frequency: 'Every 15 min' },
                  { name: 'Route C: Off-Campus', stops: 'Granville - The Warehouse - Polling Location', frequency: 'Every 20 min' },
                ].map((route, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <h4 className="font-semibold text-[#f0f6fc]">{route.name}</h4>
                    <p className="text-sm text-[#8b949e] mt-1">{route.stops}</p>
                    <p className="text-sm font-mono text-[#a371f7] mt-2">{route.frequency}</p>
                  </div>
                ))}
              </div>

              {/* Reminder Signup */}
              <div className="bg-[#161b22] border border-[#a371f7]/30 rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-2">Get Election Day Reminders</h3>
                <p className="text-sm text-[#8b949e] mb-4">Sign up for text reminders about shuttle times and polling locations.</p>
                <div className="flex gap-3">
                  <Input placeholder="Phone number" className="flex-1" />
                  <button className="bg-[#a371f7] text-white px-5 py-2.5 rounded font-medium hover:bg-[#8b5cf6] transition-colors whitespace-nowrap">
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Service Tab */}
          {activeTab === 'service' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Carolina Day of Service</h2>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-8">
                <p className="text-[#8b949e]">Our annual Day of Service brings together hundreds of Tar Heels to give back to the Chapel Hill-Carrboro community.</p>
                <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-2xl font-mono font-bold text-[#f0f6fc] tracking-tight">March 28, 2026</p>
                    <p className="text-[#6e7681] text-sm mt-1">Save the Date</p>
                  </div>
                  <button className="bg-[#a371f7] text-white px-5 py-2.5 rounded font-medium hover:bg-[#8b5cf6] transition-colors">
                    Register to Volunteer
                  </button>
                </div>
              </div>

              {/* Service Areas */}
              <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-4">Service Areas</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { area: 'Environmental', desc: 'Park cleanups and tree planting', color: '#238636' },
                  { area: 'Education', desc: 'Tutoring and mentoring programs', color: '#58a6ff' },
                  { area: 'Community', desc: 'Food banks and shelters', color: '#d29922' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#a371f7]/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 border" style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}50` }}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    </div>
                    <h4 className="font-semibold text-[#f0f6fc]">{item.area}</h4>
                    <p className="text-sm text-[#8b949e] mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Democracy Week Tab */}
          {activeTab === 'democracy' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Democracy Week</h2>
              <p className="text-[#8b949e] mb-8">A week of civic education, voter engagement, and democratic participation.</p>

              <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {[
                  { title: 'Voter Registration Drive', date: 'Oct 15, 2026', time: '10am-4pm', location: 'The Pit' },
                  { title: 'Candidate Forum', date: 'Oct 16, 2026', time: '6pm', location: 'Memorial Hall' },
                  { title: 'Democracy & Dialogue Workshop', date: 'Oct 17, 2026', time: '3pm', location: 'Student Union' },
                  { title: 'Mock Election', date: 'Oct 18, 2026', time: 'All Day', location: 'Online' },
                ].map((event, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#a371f7]/50 transition-colors">
                    <div>
                      <h4 className="font-semibold text-[#f0f6fc]">{event.title}</h4>
                      <p className="text-sm text-[#8b949e] mt-1">
                        <span className="font-mono text-[#a371f7]">{event.date}</span> at {event.time} | {event.location}
                      </p>
                    </div>
                    <button className="bg-[#21262d] text-[#f0f6fc] border border-[#30363d] px-5 py-2.5 rounded font-medium hover:bg-[#30363d] hover:border-[#8b949e] transition-colors">
                      RSVP
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Policies Tab */}
          {activeTab === 'policies' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Civic Engagement Policies</h2>
              <div className="space-y-4">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-[#f0f6fc]">{policy.title}</h3>
                      <span className={`px-2.5 py-1 rounded text-xs font-mono border ${
                        policy.status === 'in_progress'
                          ? 'bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]/30'
                          : 'bg-[#21262d] text-[#6e7681] border-[#30363d]'
                      }`}>
                        {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                      </span>
                    </div>
                    <p className="text-sm text-[#8b949e] mb-4">{policy.description}</p>
                    <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                      <div className="h-full bg-[#a371f7] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
                    </div>
                    <p className="text-xs font-mono text-[#6e7681] mt-2">{policy.progress}% complete</p>
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
