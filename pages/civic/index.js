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
      <div className="bg-gradient-to-b from-[#af52de] to-[#a347d1] text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-white/80 text-sm font-medium mb-3">Civic Engagement</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Your Voice Matters</h1>
          <p className="text-white/90 text-lg max-w-2xl">
            Voting, service, and community participation. Make it count in elections and in our community.
          </p>
        </div>
      </div>

      {/* Election Alert Banner */}
      <div className="bg-[#af52de]/10 border-b border-[#af52de]/20 py-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[#1d1d1f] font-medium">NC Primary Election: March 3, 2026</p>
          <span className="bg-[#af52de] text-white px-4 py-1.5 rounded-full text-sm font-medium">
            Registration Deadline: Feb 7
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#d2d2d7] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto">
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
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#af52de] text-white'
                    : 'text-[#6e6e73] hover:bg-[#f5f5f7]'
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
              {submitted === 'voter' && 'Thank you! Check your email for next steps to complete your voter registration.'}
              {submitted === 'fellows' && 'Your Civic Fellows application has been submitted! We will review and contact you within 2 weeks.'}
            </p>
            <button onClick={() => setSubmitted(null)} className="text-[#34c759] text-sm font-medium mt-2 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Voter Registration Tab */}
        {activeTab === 'voter' && (
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-8">Voter Registration</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-10">
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#af52de] tracking-tight">4,560</p>
                <p className="text-sm text-[#6e6e73] mt-1">Students Registered</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3] tracking-tight">23</p>
                <p className="text-sm text-[#6e6e73] mt-1">Registration Events</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759] tracking-tight">89</p>
                <p className="text-sm text-[#6e6e73] mt-1">Volunteers</p>
              </div>
              <div className="bg-[#ff9500]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#ff9500] tracking-tight">78%</p>
                <p className="text-sm text-[#6e6e73] mt-1">Campus Turnout Goal</p>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-5 mb-10">
              <div className="bg-gradient-to-br from-[#af52de] to-[#9b3dc9] text-white rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-2">Register to Vote</h3>
                <p className="text-white/80 mb-5">Takes only 5 minutes. Register or update your registration.</p>
                <button
                  onClick={() => setShowRegistrationForm(true)}
                  className="bg-white text-[#af52de] px-5 py-2.5 rounded-full font-medium hover:bg-white/90 transition-colors"
                >
                  Start Registration
                </button>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#d2d2d7]/50">
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Check Your Status</h3>
                <p className="text-[#6e6e73] mb-5">Verify your voter registration and find your polling place.</p>
                <a href="https://vt.ncsbe.gov/RegLkup/" target="_blank" rel="noopener noreferrer">
                  <button className="bg-[#f5f5f7] text-[#1d1d1f] px-5 py-2.5 rounded-full font-medium hover:bg-[#e8e8ed] transition-colors">
                    Check Status
                  </button>
                </a>
              </div>
            </div>

            {/* Polling Locations */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Campus Polling Locations</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {[
                { name: 'Student Union', address: 'Frank Porter Graham Student Union', precinct: 'Chapel Hill 2' },
                { name: 'Rams Head Recreation', address: '101 Student Recreation Center Way', precinct: 'Chapel Hill 3' },
              ].map((loc, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2d2d7]/50">
                  <h4 className="font-semibold text-[#1d1d1f]">{loc.name}</h4>
                  <p className="text-sm text-[#6e6e73] mt-1">{loc.address}</p>
                  <p className="text-sm text-[#af52de] font-medium mt-2">Precinct: {loc.precinct}</p>
                </div>
              ))}
            </div>

            {/* Important Dates */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Important Dates</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-[#d2d2d7]/50">
                  {[
                    { date: 'Feb 7, 2026', event: 'Voter Registration Deadline' },
                    { date: 'Feb 13-29, 2026', event: 'Early Voting Period' },
                    { date: 'Mar 3, 2026', event: 'Primary Election Day' },
                    { date: 'Oct 9, 2026', event: 'General Election Registration Deadline' },
                    { date: 'Nov 3, 2026', event: 'General Election Day' },
                  ].map((item, i) => (
                    <tr key={i} className="hover:bg-[#f5f5f7]/50">
                      <td className="px-5 py-4 font-medium text-[#1d1d1f]">{item.date}</td>
                      <td className="px-5 py-4 text-[#6e6e73]">{item.event}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Registration Form Modal */}
            {showRegistrationForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Voter Registration Assistance</h3>
                  <p className="text-sm text-[#6e6e73] mb-6">We'll help you complete your NC voter registration form.</p>
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
                      <button type="submit" className="bg-[#af52de] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#9b3dc9] transition-colors">
                        Submit
                      </button>
                      <button type="button" onClick={() => setShowRegistrationForm(false)} className="bg-[#f5f5f7] text-[#1d1d1f] px-5 py-2.5 rounded-full font-medium hover:bg-[#e8e8ed] transition-colors">
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
                <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Civic Fellows Program</h2>
                <p className="text-[#6e6e73] mt-1">Fellowship connecting students with local government internships</p>
              </div>
              <button
                onClick={() => setShowFellowsForm(true)}
                className="bg-[#af52de] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#9b3dc9] transition-colors"
              >
                Apply Now
              </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#af52de] tracking-tight">24</p>
                <p className="text-sm text-[#6e6e73] mt-1">Current Fellows</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3] tracking-tight">18</p>
                <p className="text-sm text-[#6e6e73] mt-1">Active Placements</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759] tracking-tight">12</p>
                <p className="text-sm text-[#6e6e73] mt-1">Government Partners</p>
              </div>
            </div>

            {/* Partner Organizations */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Placement Partners</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                'Chapel Hill Town Council',
                'Carrboro Town Hall',
                'Orange County Government',
                'NC General Assembly',
                'Governor\'s Office',
                'Secretary of State',
              ].map((org, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2d2d7]/50 text-center">
                  <p className="font-medium text-[#1d1d1f]">{org}</p>
                </div>
              ))}
            </div>

            {/* Fellows Form Modal */}
            {showFellowsForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-6">Civic Fellows Application</h3>
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
                      <button type="submit" className="bg-[#af52de] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#9b3dc9] transition-colors">
                        Submit Application
                      </button>
                      <button type="button" onClick={() => setShowFellowsForm(false)} className="bg-[#f5f5f7] text-[#1d1d1f] px-5 py-2.5 rounded-full font-medium hover:bg-[#e8e8ed] transition-colors">
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
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-8">Election Day Transit</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#af52de] tracking-tight">5</p>
                <p className="text-sm text-[#6e6e73] mt-1">Transit Routes</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3] tracking-tight">1,200</p>
                <p className="text-sm text-[#6e6e73] mt-1">Rides Last Election</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759] tracking-tight">8</p>
                <p className="text-sm text-[#6e6e73] mt-1">Polling Locations Served</p>
              </div>
            </div>

            {/* Routes */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Free Shuttle Routes (Election Day)</h3>
            <div className="space-y-4 mb-10">
              {[
                { name: 'Route A: South Campus Loop', stops: 'Rams Head - Student Union - Polling Location', frequency: 'Every 15 min' },
                { name: 'Route B: North Campus Loop', stops: 'Friday Center - Morrison - Polling Location', frequency: 'Every 15 min' },
                { name: 'Route C: Off-Campus', stops: 'Granville - The Warehouse - Polling Location', frequency: 'Every 20 min' },
              ].map((route, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2d2d7]/50">
                  <h4 className="font-semibold text-[#1d1d1f]">{route.name}</h4>
                  <p className="text-sm text-[#6e6e73] mt-1">{route.stops}</p>
                  <p className="text-sm text-[#af52de] font-medium mt-2">{route.frequency}</p>
                </div>
              ))}
            </div>

            {/* Reminder Signup */}
            <div className="bg-[#af52de]/10 rounded-2xl p-6">
              <h3 className="font-semibold text-[#1d1d1f] mb-2">Get Election Day Reminders</h3>
              <p className="text-sm text-[#6e6e73] mb-4">Sign up for text reminders about shuttle times and polling locations.</p>
              <div className="flex gap-3">
                <Input placeholder="Phone number" className="flex-1" />
                <button className="bg-[#af52de] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#9b3dc9] transition-colors whitespace-nowrap">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Tab */}
        {activeTab === 'service' && (
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-8">Carolina Day of Service</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#d2d2d7]/50 mb-8">
              <p className="text-[#6e6e73]">Our annual Day of Service brings together hundreds of Tar Heels to give back to the Chapel Hill-Carrboro community.</p>
              <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">March 28, 2026</p>
                  <p className="text-[#86868b] text-sm mt-1">Save the Date</p>
                </div>
                <button className="bg-[#af52de] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#9b3dc9] transition-colors">
                  Register to Volunteer
                </button>
              </div>
            </div>

            {/* Service Areas */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Service Areas</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { area: 'Environmental', desc: 'Park cleanups and tree planting', color: '#34c759' },
                { area: 'Education', desc: 'Tutoring and mentoring programs', color: '#0071e3' },
                { area: 'Community', desc: 'Food banks and shelters', color: '#ff9500' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2d2d7]/50">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${item.color}15` }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                  <h4 className="font-semibold text-[#1d1d1f]">{item.area}</h4>
                  <p className="text-sm text-[#6e6e73] mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Democracy Week Tab */}
        {activeTab === 'democracy' && (
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-2">Democracy Week</h2>
            <p className="text-[#6e6e73] mb-8">A week of civic education, voter engagement, and democratic participation.</p>

            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {[
                { title: 'Voter Registration Drive', date: 'Oct 15, 2026', time: '10am-4pm', location: 'The Pit' },
                { title: 'Candidate Forum', date: 'Oct 16, 2026', time: '6pm', location: 'Memorial Hall' },
                { title: 'Democracy & Dialogue Workshop', date: 'Oct 17, 2026', time: '3pm', location: 'Student Union' },
                { title: 'Mock Election', date: 'Oct 18, 2026', time: 'All Day', location: 'Online' },
              ].map((event, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2d2d7]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-[#1d1d1f]">{event.title}</h4>
                    <p className="text-sm text-[#6e6e73] mt-1">{event.date} at {event.time} | {event.location}</p>
                  </div>
                  <button className="bg-[#f5f5f7] text-[#1d1d1f] px-5 py-2.5 rounded-full font-medium hover:bg-[#e8e8ed] transition-colors">
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
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-8">Civic Engagement Policies</h2>
            <div className="space-y-4">
              {deptPolicies.map(policy => (
                <div key={policy.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2d2d7]/50">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-[#1d1d1f]">{policy.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      policy.status === 'in_progress'
                        ? 'bg-[#0071e3]/10 text-[#0071e3]'
                        : 'bg-[#f5f5f7] text-[#86868b]'
                    }`}>
                      {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                    </span>
                  </div>
                  <p className="text-sm text-[#6e6e73] mb-4">{policy.description}</p>
                  <div className="h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                    <div className="h-full bg-[#af52de] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
                  </div>
                  <p className="text-xs text-[#86868b] mt-2">{policy.progress}% complete</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </Layout>
  )
}
