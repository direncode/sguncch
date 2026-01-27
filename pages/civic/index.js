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
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🗳️</span>
            <h1 className="text-3xl md:text-4xl font-bold">Civic Engagement</h1>
          </div>
          <p className="text-purple-100 max-w-2xl">
            Voting, service, and community participation. Your voice matters—make it count
            in elections and in our community.
          </p>
        </div>
      </div>

      {/* Election Alert Banner */}
      <div className="bg-purple-100 border-b border-purple-200 py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-purple-800 font-medium">🗳️ NC Primary Election: March 3, 2026</p>
          <div className="flex gap-3 text-sm">
            <span className="bg-purple-600 text-white px-3 py-1 rounded">Registration Deadline: Feb 7</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
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
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {submitted && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              {submitted === 'voter' && 'Thank you! Check your email for next steps to complete your voter registration.'}
              {submitted === 'fellows' && 'Your Civic Fellows application has been submitted! We will review and contact you within 2 weeks.'}
            </p>
            <button onClick={() => setSubmitted(null)} className="text-green-600 text-sm mt-2 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Voter Registration Tab */}
        {activeTab === 'voter' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Voter Registration</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">4,560</p>
                <p className="text-sm text-gray-600">Students Registered</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">23</p>
                <p className="text-sm text-gray-600">Registration Events</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">89</p>
                <p className="text-sm text-gray-600">Volunteers</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">78%</p>
                <p className="text-sm text-gray-600">Campus Turnout Goal</p>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-purple-600 text-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2">Register to Vote</h3>
                <p className="text-purple-100 mb-4">Takes only 5 minutes. Register or update your registration.</p>
                <Button onClick={() => setShowRegistrationForm(true)} className="bg-white text-purple-600 hover:bg-purple-50">
                  Start Registration
                </Button>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-[#13294B] mb-2">Check Your Status</h3>
                <p className="text-gray-600 mb-4">Verify your voter registration and find your polling place.</p>
                <a href="https://vt.ncsbe.gov/RegLkup/" target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary">Check Status</Button>
                </a>
              </div>
            </div>

            {/* Polling Locations */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Campus Polling Locations</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { name: 'Student Union', address: 'Frank Porter Graham Student Union', precinct: 'Chapel Hill 2' },
                { name: 'Rams Head Recreation', address: '101 Student Recreation Center Way', precinct: 'Chapel Hill 3' },
              ].map((loc, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <h4 className="font-bold text-[#13294B]">{loc.name}</h4>
                  <p className="text-sm text-gray-600">{loc.address}</p>
                  <p className="text-sm text-purple-600 mt-1">Precinct: {loc.precinct}</p>
                </div>
              ))}
            </div>

            {/* Important Dates */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Important Dates</h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y">
                  {[
                    { date: 'Feb 7, 2026', event: 'Voter Registration Deadline' },
                    { date: 'Feb 13-29, 2026', event: 'Early Voting Period' },
                    { date: 'Mar 3, 2026', event: 'Primary Election Day' },
                    { date: 'Oct 9, 2026', event: 'General Election Registration Deadline' },
                    { date: 'Nov 3, 2026', event: 'General Election Day' },
                  ].map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-medium text-[#13294B]">{item.date}</td>
                      <td className="px-4 py-3 text-gray-600">{item.event}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Registration Form Modal */}
            {showRegistrationForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Voter Registration Assistance</h3>
                  <p className="text-sm text-gray-600 mb-4">We'll help you complete your NC voter registration form.</p>
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
                    <div className="flex gap-3">
                      <Button type="submit">Submit</Button>
                      <Button variant="secondary" onClick={() => setShowRegistrationForm(false)}>Cancel</Button>
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
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#13294B]">Civic Fellows Program</h2>
                <p className="text-gray-600 mt-1">Fellowship connecting students with local government internships</p>
              </div>
              <Button onClick={() => setShowFellowsForm(true)}>Apply Now</Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">24</p>
                <p className="text-sm text-gray-600">Current Fellows</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">18</p>
                <p className="text-sm text-gray-600">Active Placements</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">12</p>
                <p className="text-sm text-gray-600">Government Partners</p>
              </div>
            </div>

            {/* Partner Organizations */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Placement Partners</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                'Chapel Hill Town Council',
                'Carrboro Town Hall',
                'Orange County Government',
                'NC General Assembly',
                'Governor\'s Office',
                'Secretary of State',
              ].map((org, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
                  <p className="font-medium text-[#13294B]">{org}</p>
                </div>
              ))}
            </div>

            {/* Fellows Form Modal */}
            {showFellowsForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Civic Fellows Application</h3>
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
                    <div className="flex gap-3">
                      <Button type="submit">Submit Application</Button>
                      <Button variant="secondary" onClick={() => setShowFellowsForm(false)}>Cancel</Button>
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
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Election Day Transit</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">5</p>
                <p className="text-sm text-gray-600">Transit Routes</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">1,200</p>
                <p className="text-sm text-gray-600">Rides Last Election</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">8</p>
                <p className="text-sm text-gray-600">Polling Locations Served</p>
              </div>
            </div>

            {/* Routes */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Free Shuttle Routes (Election Day)</h3>
            <div className="space-y-4 mb-8">
              {[
                { name: 'Route A: South Campus Loop', stops: 'Rams Head → Student Union → Polling Location', frequency: 'Every 15 min' },
                { name: 'Route B: North Campus Loop', stops: 'Friday Center → Morrison → Polling Location', frequency: 'Every 15 min' },
                { name: 'Route C: Off-Campus', stops: 'Granville → The Warehouse → Polling Location', frequency: 'Every 20 min' },
              ].map((route, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <h4 className="font-bold text-[#13294B]">{route.name}</h4>
                  <p className="text-sm text-gray-600">{route.stops}</p>
                  <p className="text-sm text-purple-600 mt-1">{route.frequency}</p>
                </div>
              ))}
            </div>

            {/* Reminder Signup */}
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h3 className="font-bold text-purple-800 mb-2">Get Election Day Reminders</h3>
              <p className="text-sm text-purple-700 mb-4">Sign up for text reminders about shuttle times and polling locations.</p>
              <div className="flex gap-3">
                <Input placeholder="Phone number" className="flex-1" />
                <Button>Sign Up</Button>
              </div>
            </div>
          </div>
        )}

        {/* Service Tab */}
        {activeTab === 'service' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Carolina Day of Service</h2>
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <p className="text-gray-600">Our annual Day of Service brings together hundreds of Tar Heels to give back to the Chapel Hill-Carrboro community.</p>
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-[#13294B]">March 28, 2026</p>
                  <p className="text-gray-500">Save the Date</p>
                </div>
                <div>
                  <Button>Register to Volunteer</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Democracy Week Tab */}
        {activeTab === 'democracy' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Democracy Week</h2>
            <p className="text-gray-600 mb-6">A week of civic education, voter engagement, and democratic participation.</p>

            <h3 className="text-xl font-bold text-[#13294B] mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {[
                { title: 'Voter Registration Drive', date: 'Oct 15, 2026', time: '10am-4pm', location: 'The Pit' },
                { title: 'Candidate Forum', date: 'Oct 16, 2026', time: '6pm', location: 'Memorial Hall' },
                { title: 'Democracy & Dialogue Workshop', date: 'Oct 17, 2026', time: '3pm', location: 'Student Union' },
                { title: 'Mock Election', date: 'Oct 18, 2026', time: 'All Day', location: 'Online' },
              ].map((event, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#13294B]">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.date} at {event.time} | {event.location}</p>
                  </div>
                  <Button variant="secondary">RSVP</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Policies Tab */}
        {activeTab === 'policies' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Civic Engagement Policies</h2>
            <div className="space-y-4">
              {deptPolicies.map(policy => (
                <div key={policy.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-[#13294B]">{policy.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      policy.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${policy.progress}%` }} />
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
