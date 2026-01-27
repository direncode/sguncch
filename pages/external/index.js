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
      <div className="bg-gradient-to-b from-[#ff3b30] to-[#ff453a] text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-white/80 text-sm font-medium mb-2">Student Government</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3">State & External Affairs</h1>
          <p className="text-white/90 text-lg max-w-2xl">
            Advocacy, legislation, and external partnerships. Making your voice heard
            in Raleigh and beyond.
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-[#ff3b30]/10 border-b border-[#ff3b30]/20 py-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[#1d1d1f] font-medium">Tuition Increase Proposed: Take action now!</p>
          <button
            onClick={() => setActiveTab('tuition')}
            className="bg-[#ff3b30] hover:bg-[#ff453a] text-white text-sm font-medium px-5 py-2 rounded-full transition-all"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-md border-b border-[#d2d2d7] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-2 py-3 overflow-x-auto">
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
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#ff3b30] text-white'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
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
              {submitted === 'lobby' && 'You\'re registered for Legislative Lobby Day! Check your email for details.'}
              {submitted === 'petition' && 'Thank you for signing! Your voice matters.'}
              {submitted === 'email' && 'Your message has been sent to your representatives!'}
            </p>
            <button onClick={() => setSubmitted(null)} className="text-[#34c759] text-sm mt-2 font-medium hover:underline">Dismiss</button>
          </div>
        )}

        {/* Tuition Advocacy Tab */}
        {activeTab === 'tuition' && (
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-8">Tuition Advocacy</h2>

            {/* Current Status */}
            <div className="bg-[#ff3b30]/10 rounded-2xl p-6 mb-10">
              <h3 className="font-semibold text-[#1d1d1f] mb-2">Current Threat</h3>
              <p className="text-[#6e6e73] mb-5">
                The UNC Board of Governors is considering a 3% tuition increase for 2026-2027.
                This would add approximately $250 to annual in-state tuition.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSubmitted('petition')}
                  className="bg-[#ff3b30] hover:bg-[#ff453a] text-white font-medium px-5 py-2.5 rounded-full transition-all"
                >
                  Sign Petition
                </button>
                <button
                  onClick={() => setSubmitted('email')}
                  className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] font-medium px-5 py-2.5 rounded-full transition-all"
                >
                  Email Your Rep
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-10">
              <div className="bg-[#ff3b30]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#ff3b30] tracking-tight">6,700</p>
                <p className="text-sm text-[#86868b] mt-1">Signatures</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3] tracking-tight">2,340</p>
                <p className="text-sm text-[#86868b] mt-1">Emails Sent</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759] tracking-tight">8</p>
                <p className="text-sm text-[#86868b] mt-1">Legislator Meetings</p>
              </div>
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#af52de] tracking-tight">3</p>
                <p className="text-sm text-[#86868b] mt-1">BOG Testimonies</p>
              </div>
            </div>

            {/* Tuition History */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Recent Tuition History</h3>
            <div className="bg-white rounded-2xl overflow-hidden border border-[#d2d2d7] mb-10">
              <table className="w-full">
                <thead className="bg-[#f5f5f7]">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-medium text-[#6e6e73]">Year</th>
                    <th className="px-5 py-4 text-left text-sm font-medium text-[#6e6e73]">In-State</th>
                    <th className="px-5 py-4 text-left text-sm font-medium text-[#6e6e73]">Out-of-State</th>
                    <th className="px-5 py-4 text-left text-sm font-medium text-[#6e6e73]">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d2d2d7]">
                  {[
                    { year: '2025-26', inState: '$7,486', outState: '$36,891', change: '+2.8%' },
                    { year: '2024-25', inState: '$7,283', outState: '$35,889', change: '+3.0%' },
                    { year: '2023-24', inState: '$7,071', outState: '$34,844', change: '+2.5%' },
                    { year: '2022-23', inState: '$6,899', outState: '$33,992', change: '+3.2%' },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4 font-medium text-[#1d1d1f]">{row.year}</td>
                      <td className="px-5 py-4 text-[#6e6e73]">{row.inState}</td>
                      <td className="px-5 py-4 text-[#6e6e73]">{row.outState}</td>
                      <td className="px-5 py-4 text-[#ff3b30] font-medium">{row.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Contact Reps */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Contact Your Representatives</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'Sen. Graig Meyer', district: 'District 23', party: 'D', phone: '919-715-8363' },
                { name: 'Rep. Verla Insko', district: 'District 56', party: 'D', phone: '919-733-7208' },
              ].map((rep, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-[#d2d2d7] flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1d1d1f]">{rep.name}</p>
                    <p className="text-sm text-[#86868b]">{rep.district}</p>
                  </div>
                  <a href={`tel:${rep.phone}`} className="text-[#ff3b30] font-medium hover:underline">{rep.phone}</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UNC Coalition Tab */}
        {activeTab === 'coalition' && (
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-8">UNC System Coalition</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <div className="bg-[#ff3b30]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#ff3b30] tracking-tight">16</p>
                <p className="text-sm text-[#86868b] mt-1">Partner Schools</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3] tracking-tight">12</p>
                <p className="text-sm text-[#86868b] mt-1">Joint Initiatives</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759] tracking-tight">24</p>
                <p className="text-sm text-[#86868b] mt-1">Coalition Meetings</p>
              </div>
            </div>

            {/* Partner Schools */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">UNC System Partners</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {[
                'NC State', 'UNC Charlotte', 'UNC Wilmington', 'UNC Greensboro',
                'East Carolina', 'Appalachian State', 'UNC Asheville', 'NC A&T',
                'NC Central', 'UNC Pembroke', 'Winston-Salem State', 'Fayetteville State',
              ].map((school, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-[#d2d2d7] text-center">
                  <p className="text-sm font-medium text-[#1d1d1f]">{school}</p>
                </div>
              ))}
            </div>

            {/* Joint Initiatives */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Joint Initiatives</h3>
            <div className="space-y-3">
              {[
                { name: 'System-Wide Tuition Freeze Campaign', status: 'Active', schools: 12 },
                { name: 'Mental Health Resource Sharing', status: 'Planning', schools: 8 },
                { name: 'Textbook Cost Reduction', status: 'Active', schools: 16 },
                { name: 'Legislative Advocacy Coordination', status: 'Ongoing', schools: 16 },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-[#d2d2d7] flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1d1d1f]">{item.name}</p>
                    <p className="text-sm text-[#86868b] mt-1">{item.schools} schools participating</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.status === 'Active' ? 'bg-[#34c759]/10 text-[#34c759]' :
                    item.status === 'Planning' ? 'bg-[#ff9500]/10 text-[#ff9500]' :
                    'bg-[#0071e3]/10 text-[#0071e3]'
                  }`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lobby Day Tab */}
        {activeTab === 'lobby' && (
          <div>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Legislative Lobby Day</h2>
                <p className="text-[#6e6e73] mt-1">Annual trip to Raleigh to advocate for higher education</p>
              </div>
              <button
                onClick={() => setShowLobbyForm(true)}
                className="bg-[#ff3b30] hover:bg-[#ff453a] text-white font-medium px-5 py-2.5 rounded-full transition-all"
              >
                Register
              </button>
            </div>

            {/* Event Info */}
            <div className="bg-gradient-to-b from-[#ff3b30] to-[#ff453a] text-white rounded-2xl p-6 mb-10">
              <h3 className="text-xl font-semibold tracking-tight mb-2">Heels on the Hill 2026</h3>
              <p className="text-white/80 mb-6">Join us in Raleigh to meet with legislators and advocate for UNC!</p>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-2xl font-semibold tracking-tight">March 18</p>
                  <p className="text-white/60 text-sm mt-1">Date</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-2xl font-semibold tracking-tight">7:00 AM</p>
                  <p className="text-white/60 text-sm mt-1">Bus Departure</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-2xl font-semibold tracking-tight">FREE</p>
                  <p className="text-white/60 text-sm mt-1">Transportation & Lunch</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <div className="bg-[#ff3b30]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#ff3b30] tracking-tight">89</p>
                <p className="text-sm text-[#86868b] mt-1">Participants</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3] tracking-tight">34</p>
                <p className="text-sm text-[#86868b] mt-1">Legislator Meetings</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759] tracking-tight">45</p>
                <p className="text-sm text-[#86868b] mt-1">Legislators Met</p>
              </div>
            </div>

            {/* Schedule */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Event Schedule</h3>
            <div className="bg-white rounded-2xl overflow-hidden border border-[#d2d2d7] mb-10">
              <table className="w-full">
                <tbody className="divide-y divide-[#d2d2d7]">
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
                      <td className="px-5 py-4 font-medium text-[#ff3b30] w-32">{item.time}</td>
                      <td className="px-5 py-4 text-[#6e6e73]">{item.event}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Registration Form Modal */}
            {showLobbyForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-5">Register for Lobby Day</h3>
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
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="bg-[#ff3b30] hover:bg-[#ff453a] text-white font-medium px-5 py-2.5 rounded-full transition-all"
                      >
                        Register
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowLobbyForm(false)}
                        className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] font-medium px-5 py-2.5 rounded-full transition-all"
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

        {/* BOT Tab */}
        {activeTab === 'bot' && (
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-8">Board of Trustees Liaison</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <div className="bg-[#ff3b30]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#ff3b30] tracking-tight">8</p>
                <p className="text-sm text-[#86868b] mt-1">BOT Meetings</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3] tracking-tight">23</p>
                <p className="text-sm text-[#86868b] mt-1">Agenda Items Tracked</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759] tracking-tight">156</p>
                <p className="text-sm text-[#86868b] mt-1">Student Comments</p>
              </div>
            </div>

            {/* Upcoming Meeting */}
            <div className="bg-white rounded-2xl p-6 border border-[#d2d2d7] mb-10">
              <h3 className="font-semibold text-[#1d1d1f] mb-4">Next BOT Meeting</h3>
              <p className="text-xl font-semibold text-[#ff3b30] tracking-tight">January 30, 2026 at 9:00 AM</p>
              <p className="text-[#86868b] mt-1">Carolina Inn, Chancellor's Ballroom</p>
              <div className="mt-5">
                <h4 className="font-medium text-[#1d1d1f] mb-3">Key Agenda Items:</h4>
                <ul className="space-y-2 text-[#6e6e73]">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#ff3b30] rounded-full"></span>
                    Tuition proposal discussion
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#ff3b30] rounded-full"></span>
                    Campus safety update
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#ff3b30] rounded-full"></span>
                    Construction projects review
                  </li>
                </ul>
              </div>
              <button className="mt-5 bg-[#ff3b30] hover:bg-[#ff453a] text-white font-medium px-5 py-2.5 rounded-full transition-all">
                Submit Public Comment
              </button>
            </div>

            {/* Recent Updates */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Recent BOT Updates</h3>
            <div className="space-y-3">
              {[
                { date: 'Jan 15, 2026', title: 'Budget Committee approved housing fee increase', impact: 'High' },
                { date: 'Dec 10, 2025', title: 'New sustainability requirements for buildings', impact: 'Medium' },
                { date: 'Nov 20, 2025', title: 'Student mental health funding approved', impact: 'High' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-[#d2d2d7]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#1d1d1f]">{item.title}</p>
                      <p className="text-sm text-[#86868b] mt-1">{item.date}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.impact === 'High' ? 'bg-[#ff3b30]/10 text-[#ff3b30]' : 'bg-[#ff9500]/10 text-[#ff9500]'
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
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-8">Federal Advocacy</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <div className="bg-[#ff3b30]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#ff3b30] tracking-tight">12</p>
                <p className="text-sm text-[#86868b] mt-1">Action Alerts</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3] tracking-tight">890</p>
                <p className="text-sm text-[#86868b] mt-1">Messages Sent</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759] tracking-tight">8</p>
                <p className="text-sm text-[#86868b] mt-1">Issues Tracked</p>
              </div>
            </div>

            {/* Current Issues */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Current Federal Issues</h3>
            <div className="space-y-3 mb-10">
              {[
                { issue: 'Pell Grant Increase', status: 'Active', urgency: 'High' },
                { issue: 'Student Loan Interest Rates', status: 'Monitoring', urgency: 'Medium' },
                { issue: 'Research Funding (NIH/NSF)', status: 'Active', urgency: 'High' },
                { issue: 'DACA Student Support', status: 'Active', urgency: 'High' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-[#d2d2d7] flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1d1d1f]">{item.issue}</p>
                    <p className="text-sm text-[#86868b] mt-1">{item.status}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.urgency === 'High' ? 'bg-[#ff3b30]/10 text-[#ff3b30]' : 'bg-[#ff9500]/10 text-[#ff9500]'
                    }`}>
                      {item.urgency}
                    </span>
                    <button className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-sm font-medium px-4 py-2 rounded-full transition-all">
                      Take Action
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Representatives */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">NC Congressional Delegation</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'Rep. Valerie Foushee', district: 'NC-4', party: 'D' },
                { name: 'Sen. Ted Budd', chamber: 'Senate', party: 'R' },
                { name: 'Sen. Thom Tillis', chamber: 'Senate', party: 'R' },
              ].map((rep, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-[#d2d2d7] flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1d1d1f]">{rep.name}</p>
                    <p className="text-sm text-[#86868b] mt-1">{rep.district || rep.chamber}</p>
                  </div>
                  <button className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-sm font-medium px-4 py-2 rounded-full transition-all">
                    Contact
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Policies Tab */}
        {activeTab === 'policies' && (
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-8">State & External Affairs Policies</h2>
            <div className="space-y-4">
              {deptPolicies.map(policy => (
                <div key={policy.id} className="bg-white rounded-2xl p-5 border border-[#d2d2d7]">
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
                    <div className="h-full bg-[#ff3b30] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
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
