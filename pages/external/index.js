import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button, Checkbox } from '../../components/FormInput'
import { useApp } from '../../lib/store'

export default function ExternalPage() {
  const [activeTab, setActiveTab] = useState('tuition')
  const [showLobbyForm, setShowLobbyForm] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const { policies } = useApp()

  const deptPolicies = policies.filter(p => p.department === 'external')

  return (
    <Layout>
      <Head>
        <title>State & External Affairs | Project Bold</title>
      </Head>

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🏛️</span>
            <h1 className="text-3xl md:text-4xl font-bold">State & External Affairs</h1>
          </div>
          <p className="text-indigo-100 max-w-2xl">
            Advocacy, legislation, and external partnerships. Making your voice heard
            in Raleigh and beyond.
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-red-100 border-b border-red-200 py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-red-800 font-medium">⚠️ Tuition Increase Proposed: Take action now!</p>
          <Button onClick={() => setActiveTab('tuition')} className="bg-red-600 hover:bg-red-700 text-white text-sm">
            Learn More
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'tuition', label: 'Tuition Advocacy' },
              { id: 'coalition', label: 'UNC Coalition' },
              { id: 'lobby', label: 'Lobby Day' },
              { id: 'bot', label: 'BOT Liaison' },
              { id: 'federal', label: 'Federal Advocacy' },
              { id: 'policies', label: 'All Policies' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
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
              {submitted === 'lobby' && 'You\'re registered for Legislative Lobby Day! Check your email for details.'}
              {submitted === 'petition' && 'Thank you for signing! Your voice matters.'}
              {submitted === 'email' && 'Your message has been sent to your representatives!'}
            </p>
            <button onClick={() => setSubmitted(null)} className="text-green-600 text-sm mt-2 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Tuition Advocacy Tab */}
        {activeTab === 'tuition' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Tuition Advocacy</h2>

            {/* Current Status */}
            <div className="bg-red-50 rounded-lg p-6 border border-red-200 mb-8">
              <h3 className="font-bold text-red-800 mb-2">Current Threat</h3>
              <p className="text-red-700 mb-4">
                The UNC Board of Governors is considering a 3% tuition increase for 2026-2027.
                This would add approximately $250 to annual in-state tuition.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setSubmitted('petition')}>Sign Petition</Button>
                <Button variant="secondary" onClick={() => setSubmitted('email')}>Email Your Rep</Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-indigo-600">6,700</p>
                <p className="text-sm text-gray-600">Signatures</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">2,340</p>
                <p className="text-sm text-gray-600">Emails Sent</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">8</p>
                <p className="text-sm text-gray-600">Legislator Meetings</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">3</p>
                <p className="text-sm text-gray-600">BOG Testimonies</p>
              </div>
            </div>

            {/* Tuition History */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Recent Tuition History</h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Year</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">In-State</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Out-of-State</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { year: '2025-26', inState: '$7,486', outState: '$36,891', change: '+2.8%' },
                    { year: '2024-25', inState: '$7,283', outState: '$35,889', change: '+3.0%' },
                    { year: '2023-24', inState: '$7,071', outState: '$34,844', change: '+2.5%' },
                    { year: '2022-23', inState: '$6,899', outState: '$33,992', change: '+3.2%' },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-medium text-[#13294B]">{row.year}</td>
                      <td className="px-4 py-3">{row.inState}</td>
                      <td className="px-4 py-3">{row.outState}</td>
                      <td className="px-4 py-3 text-red-600">{row.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Contact Reps */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Contact Your Representatives</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'Sen. Graig Meyer', district: 'District 23', party: 'D', phone: '919-715-8363' },
                { name: 'Rep. Verla Insko', district: 'District 56', party: 'D', phone: '919-733-7208' },
              ].map((rep, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#13294B]">{rep.name}</p>
                    <p className="text-sm text-gray-500">{rep.district}</p>
                  </div>
                  <a href={`tel:${rep.phone}`} className="text-indigo-600 hover:underline">{rep.phone}</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UNC Coalition Tab */}
        {activeTab === 'coalition' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">UNC System Coalition</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-indigo-600">16</p>
                <p className="text-sm text-gray-600">Partner Schools</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-600">Joint Initiatives</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">24</p>
                <p className="text-sm text-gray-600">Coalition Meetings</p>
              </div>
            </div>

            {/* Partner Schools */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">UNC System Partners</h3>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                'NC State', 'UNC Charlotte', 'UNC Wilmington', 'UNC Greensboro',
                'East Carolina', 'Appalachian State', 'UNC Asheville', 'NC A&T',
                'NC Central', 'UNC Pembroke', 'Winston-Salem State', 'Fayetteville State',
              ].map((school, i) => (
                <div key={i} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 text-center">
                  <p className="text-sm font-medium text-[#13294B]">{school}</p>
                </div>
              ))}
            </div>

            {/* Joint Initiatives */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Joint Initiatives</h3>
            <div className="space-y-4">
              {[
                { name: 'System-Wide Tuition Freeze Campaign', status: 'Active', schools: 12 },
                { name: 'Mental Health Resource Sharing', status: 'Planning', schools: 8 },
                { name: 'Textbook Cost Reduction', status: 'Active', schools: 16 },
                { name: 'Legislative Advocacy Coordination', status: 'Ongoing', schools: 16 },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#13294B]">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.schools} schools participating</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.status === 'Active' ? 'bg-green-100 text-green-700' :
                    item.status === 'Planning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lobby Day Tab */}
        {activeTab === 'lobby' && (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#13294B]">Legislative Lobby Day</h2>
                <p className="text-gray-600 mt-1">Annual trip to Raleigh to advocate for higher education</p>
              </div>
              <Button onClick={() => setShowLobbyForm(true)}>Register</Button>
            </div>

            {/* Event Info */}
            <div className="bg-indigo-600 text-white rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-2">Heels on the Hill 2026</h3>
              <p className="text-indigo-100 mb-4">Join us in Raleigh to meet with legislators and advocate for UNC!</p>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">March 18</p>
                  <p className="text-indigo-200">Date</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">7:00 AM</p>
                  <p className="text-indigo-200">Bus Departure</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">FREE</p>
                  <p className="text-indigo-200">Transportation & Lunch</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-indigo-600">89</p>
                <p className="text-sm text-gray-600">Participants</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">34</p>
                <p className="text-sm text-gray-600">Legislator Meetings</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">45</p>
                <p className="text-sm text-gray-600">Legislators Met</p>
              </div>
            </div>

            {/* Schedule */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Event Schedule</h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <table className="w-full">
                <tbody className="divide-y">
                  {[
                    { time: '7:00 AM', event: 'Bus departs from Student Union' },
                    { time: '9:00 AM', event: 'Arrive at NC Legislative Building' },
                    { time: '9:30 AM', event: 'Advocacy training & talking points' },
                    { time: '10:30 AM', event: 'Legislative meetings begin' },
                    { time: '12:30 PM', event: 'Lunch (provided)' },
                    { time: '1:30 PM', event: 'Afternoon meetings' },
                    { time: '4:00 PM', event: 'Debrief & head back' },
                    { time: '6:00 PM', event: 'Arrive back at UNC' },
                  ].map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-medium text-indigo-600 w-32">{item.time}</td>
                      <td className="px-4 py-3 text-gray-700">{item.event}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Registration Form Modal */}
            {showLobbyForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Register for Lobby Day</h3>
                  <form onSubmit={(e) => { e.preventDefault(); setSubmitted('lobby'); setShowLobbyForm(false); }} className="space-y-4">
                    <Input label="Full Name" required />
                    <Input label="Email" type="email" required />
                    <Input label="PID" required />
                    <Input label="Phone" type="tel" required />
                    <Select label="Year" required options={[
                      { value: 'freshman', label: 'First Year' },
                      { value: 'sophomore', label: 'Sophomore' },
                      { value: 'junior', label: 'Junior' },
                      { value: 'senior', label: 'Senior' },
                      { value: 'grad', label: 'Graduate' },
                    ]} />
                    <Checkbox label="I can attend the full day (7 AM - 6 PM)" />
                    <Checkbox label="I have dietary restrictions (specify below)" />
                    <Input label="Dietary restrictions (if any)" />
                    <div className="flex gap-3">
                      <Button type="submit">Register</Button>
                      <Button variant="secondary" onClick={() => setShowLobbyForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOT Tab */}
        {activeTab === 'bot' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Board of Trustees Liaison</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-indigo-600">8</p>
                <p className="text-sm text-gray-600">BOT Meetings</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">23</p>
                <p className="text-sm text-gray-600">Agenda Items Tracked</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">156</p>
                <p className="text-sm text-gray-600">Student Comments</p>
              </div>
            </div>

            {/* Upcoming Meeting */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h3 className="font-bold text-[#13294B] mb-4">Next BOT Meeting</h3>
              <p className="text-xl font-medium text-indigo-600">January 30, 2026 at 9:00 AM</p>
              <p className="text-gray-500">Carolina Inn, Chancellor's Ballroom</p>
              <div className="mt-4">
                <h4 className="font-medium text-[#13294B] mb-2">Key Agenda Items:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Tuition proposal discussion</li>
                  <li>• Campus safety update</li>
                  <li>• Construction projects review</li>
                </ul>
              </div>
              <Button className="mt-4">Submit Public Comment</Button>
            </div>

            {/* Recent Updates */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Recent BOT Updates</h3>
            <div className="space-y-4">
              {[
                { date: 'Jan 15, 2026', title: 'Budget Committee approved housing fee increase', impact: 'High' },
                { date: 'Dec 10, 2025', title: 'New sustainability requirements for buildings', impact: 'Medium' },
                { date: 'Nov 20, 2025', title: 'Student mental health funding approved', impact: 'High' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-[#13294B]">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.impact} Impact
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Federal Advocacy Tab */}
        {activeTab === 'federal' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Federal Advocacy</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-indigo-600">12</p>
                <p className="text-sm text-gray-600">Action Alerts</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">890</p>
                <p className="text-sm text-gray-600">Messages Sent</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">8</p>
                <p className="text-sm text-gray-600">Issues Tracked</p>
              </div>
            </div>

            {/* Current Issues */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Current Federal Issues</h3>
            <div className="space-y-4 mb-8">
              {[
                { issue: 'Pell Grant Increase', status: 'Active', urgency: 'High' },
                { issue: 'Student Loan Interest Rates', status: 'Monitoring', urgency: 'Medium' },
                { issue: 'Research Funding (NIH/NSF)', status: 'Active', urgency: 'High' },
                { issue: 'DACA Student Support', status: 'Active', urgency: 'High' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#13294B]">{item.issue}</p>
                    <p className="text-sm text-gray-500">{item.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.urgency === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.urgency}
                    </span>
                    <Button variant="secondary">Take Action</Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Representatives */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">NC Congressional Delegation</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'Rep. Valerie Foushee', district: 'NC-4', party: 'D' },
                { name: 'Sen. Ted Budd', chamber: 'Senate', party: 'R' },
                { name: 'Sen. Thom Tillis', chamber: 'Senate', party: 'R' },
              ].map((rep, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#13294B]">{rep.name}</p>
                    <p className="text-sm text-gray-500">{rep.district || rep.chamber}</p>
                  </div>
                  <Button variant="secondary">Contact</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Policies Tab */}
        {activeTab === 'policies' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">State & External Affairs Policies</h2>
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
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${policy.progress}%` }} />
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
