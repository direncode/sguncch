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

      {/* Hero with Grid Background */}
      <div className="relative bg-gradient-to-b from-[#0a0e14] via-[#0d1117] to-[#161b22] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#f85149 1px, transparent 1px), linear-gradient(90deg, #f85149 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-6">
          <p className="text-[#f85149] text-xs font-medium tracking-widest uppercase mb-3">Student Government</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0f6fc] tracking-tight mb-4">State & External Affairs</h1>
          <p className="text-[#8b949e] text-lg max-w-2xl">
            Advocacy, legislation, and external partnerships. Making your voice heard
            in Raleigh and beyond.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f85149] to-transparent" />
      </div>

      {/* Alert Banner */}
      <div className="bg-[#f85149]/10 border-b border-[#f85149]/30 py-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[#f85149] rounded-full animate-pulse" />
            <p className="text-[#f0f6fc] font-medium">Tuition Increase Proposed: Take action now!</p>
          </div>
          <button
            onClick={() => setActiveTab('tuition')}
            className="bg-[#f85149] hover:bg-[#f85149]/80 text-white text-xs font-medium tracking-widest uppercase px-5 py-2.5 rounded transition-all border border-[#f85149]"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0d1117] border-b border-[#30363d] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
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
                className={`px-5 py-4 text-xs font-medium tracking-widest uppercase whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-[#f85149] border-[#f85149]'
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
            <div className="mb-8 bg-[#161b22] border border-[#238636] rounded-lg p-5">
              <p className="text-[#f0f6fc] font-medium">
                {submitted === 'lobby' && 'You\'re registered for Legislative Lobby Day! Check your email for details.'}
                {submitted === 'petition' && 'Thank you for signing! Your voice matters.'}
                {submitted === 'email' && 'Your message has been sent to your representatives!'}
              </p>
              <button onClick={() => setSubmitted(null)} className="text-[#238636] text-sm mt-2 font-medium hover:underline">Dismiss</button>
            </div>
          )}

          {/* Tuition Advocacy Tab */}
          {activeTab === 'tuition' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Tuition Advocacy</h2>

              {/* Current Status */}
              <div className="bg-[#161b22] border border-[#f85149] rounded-lg p-6 mb-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 bg-[#f85149] rounded-full" />
                  <h3 className="font-semibold text-[#f85149] uppercase tracking-widest text-xs">Current Threat</h3>
                </div>
                <p className="text-[#8b949e] mb-5">
                  The UNC Board of Governors is considering a 3% tuition increase for 2026-2027.
                  This would add approximately $250 to annual in-state tuition.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSubmitted('petition')}
                    className="bg-[#f85149] hover:bg-[#f85149]/80 text-white font-medium text-xs tracking-widest uppercase px-5 py-2.5 rounded transition-all"
                  >
                    Sign Petition
                  </button>
                  <button
                    onClick={() => setSubmitted('email')}
                    className="bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] font-medium text-xs tracking-widest uppercase px-5 py-2.5 rounded border border-[#30363d] transition-all"
                  >
                    Email Your Rep
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#f85149] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#f85149] tracking-tight">6,700</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Signatures</p>
                </div>
                <div className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#58a6ff] tracking-tight">2,340</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Emails Sent</p>
                </div>
                <div className="bg-[#161b22] border border-[#238636] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#238636] tracking-tight">8</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Legislator Meetings</p>
                </div>
                <div className="bg-[#161b22] border border-[#a371f7] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#a371f7] tracking-tight">3</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">BOG Testimonies</p>
                </div>
              </div>

              {/* Tuition History */}
              <h3 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-4 uppercase tracking-widest text-sm">Recent Tuition History</h3>
              <div className="bg-[#161b22] rounded-lg overflow-hidden border border-[#30363d] mb-10">
                <table className="w-full">
                  <thead className="bg-[#21262d]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-medium text-[#8b949e] uppercase tracking-widest">Year</th>
                      <th className="px-5 py-4 text-left text-xs font-medium text-[#8b949e] uppercase tracking-widest">In-State</th>
                      <th className="px-5 py-4 text-left text-xs font-medium text-[#8b949e] uppercase tracking-widest">Out-of-State</th>
                      <th className="px-5 py-4 text-left text-xs font-medium text-[#8b949e] uppercase tracking-widest">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]">
                    {[
                      { year: '2025-26', inState: '$7,486', outState: '$36,891', change: '+2.8%' },
                      { year: '2024-25', inState: '$7,283', outState: '$35,889', change: '+3.0%' },
                      { year: '2023-24', inState: '$7,071', outState: '$34,844', change: '+2.5%' },
                      { year: '2022-23', inState: '$6,899', outState: '$33,992', change: '+3.2%' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-[#21262d] transition-colors">
                        <td className="px-5 py-4 font-medium text-[#f0f6fc] font-mono">{row.year}</td>
                        <td className="px-5 py-4 text-[#8b949e] font-mono">{row.inState}</td>
                        <td className="px-5 py-4 text-[#8b949e] font-mono">{row.outState}</td>
                        <td className="px-5 py-4 text-[#f85149] font-medium font-mono">{row.change}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Contact Reps */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-tight mb-4 uppercase tracking-widest">Contact Your Representatives</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Sen. Graig Meyer', district: 'District 23', party: 'D', phone: '919-715-8363' },
                  { name: 'Rep. Verla Insko', district: 'District 56', party: 'D', phone: '919-733-7208' },
                ].map((rep, i) => (
                  <div key={i} className="bg-[#161b22] rounded-lg p-5 border border-[#30363d] flex items-center justify-between hover:border-[#f85149] transition-colors">
                    <div>
                      <p className="font-semibold text-[#f0f6fc]">{rep.name}</p>
                      <p className="text-sm text-[#6e7681]">{rep.district}</p>
                    </div>
                    <a href={`tel:${rep.phone}`} className="text-[#f85149] font-mono font-medium hover:underline">{rep.phone}</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UNC Coalition Tab */}
          {activeTab === 'coalition' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">UNC System Coalition</h2>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#f85149] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#f85149] tracking-tight">16</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Partner Schools</p>
                </div>
                <div className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#58a6ff] tracking-tight">12</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Joint Initiatives</p>
                </div>
                <div className="bg-[#161b22] border border-[#238636] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#238636] tracking-tight">24</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Coalition Meetings</p>
                </div>
              </div>

              {/* Partner Schools */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-tight mb-4 uppercase tracking-widest">UNC System Partners</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                {[
                  'NC State', 'UNC Charlotte', 'UNC Wilmington', 'UNC Greensboro',
                  'East Carolina', 'Appalachian State', 'UNC Asheville', 'NC A&T',
                  'NC Central', 'UNC Pembroke', 'Winston-Salem State', 'Fayetteville State',
                ].map((school, i) => (
                  <div key={i} className="bg-[#161b22] rounded-lg p-4 border border-[#30363d] text-center hover:border-[#f85149] transition-colors">
                    <p className="text-sm font-medium text-[#f0f6fc]">{school}</p>
                  </div>
                ))}
              </div>

              {/* Joint Initiatives */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-tight mb-4 uppercase tracking-widest">Joint Initiatives</h3>
              <div className="space-y-3">
                {[
                  { name: 'System-Wide Tuition Freeze Campaign', status: 'Active', schools: 12 },
                  { name: 'Mental Health Resource Sharing', status: 'Planning', schools: 8 },
                  { name: 'Textbook Cost Reduction', status: 'Active', schools: 16 },
                  { name: 'Legislative Advocacy Coordination', status: 'Ongoing', schools: 16 },
                ].map((item, i) => (
                  <div key={i} className="bg-[#161b22] rounded-lg p-5 border border-[#30363d] flex items-center justify-between hover:border-[#f85149] transition-colors">
                    <div>
                      <p className="font-semibold text-[#f0f6fc]">{item.name}</p>
                      <p className="text-sm text-[#6e7681] mt-1"><span className="font-mono">{item.schools}</span> schools participating</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-medium border ${
                      item.status === 'Active' ? 'bg-[#238636]/10 text-[#238636] border-[#238636]' :
                      item.status === 'Planning' ? 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]' :
                      'bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]'
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
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Legislative Lobby Day</h2>
                  <p className="text-[#8b949e] mt-1">Annual trip to Raleigh to advocate for higher education</p>
                </div>
                <button
                  onClick={() => setShowLobbyForm(true)}
                  className="bg-[#f85149] hover:bg-[#f85149]/80 text-white font-medium text-xs tracking-widest uppercase px-5 py-2.5 rounded transition-all"
                >
                  Register
                </button>
              </div>

              {/* Event Info */}
              <div className="relative bg-gradient-to-b from-[#161b22] to-[#0d1117] rounded-lg p-6 mb-10 border border-[#f85149] overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(#f85149 1px, transparent 1px), linear-gradient(90deg, #f85149 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                  }} />
                </div>
                <div className="relative">
                  <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-2">Heels on the Hill 2026</h3>
                  <p className="text-[#8b949e] mb-6">Join us in Raleigh to meet with legislators and advocate for UNC!</p>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="bg-[#21262d] border border-[#30363d] rounded-lg p-4">
                      <p className="text-2xl font-mono font-bold text-[#f85149] tracking-tight">March 18</p>
                      <p className="text-[#6e7681] text-xs mt-1 uppercase tracking-widest">Date</p>
                    </div>
                    <div className="bg-[#21262d] border border-[#30363d] rounded-lg p-4">
                      <p className="text-2xl font-mono font-bold text-[#f85149] tracking-tight">7:00 AM</p>
                      <p className="text-[#6e7681] text-xs mt-1 uppercase tracking-widest">Bus Departure</p>
                    </div>
                    <div className="bg-[#21262d] border border-[#30363d] rounded-lg p-4">
                      <p className="text-2xl font-mono font-bold text-[#f85149] tracking-tight">FREE</p>
                      <p className="text-[#6e7681] text-xs mt-1 uppercase tracking-widest">Transportation & Lunch</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#f85149] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#f85149] tracking-tight">89</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Participants</p>
                </div>
                <div className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#58a6ff] tracking-tight">34</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Legislator Meetings</p>
                </div>
                <div className="bg-[#161b22] border border-[#238636] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#238636] tracking-tight">45</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Legislators Met</p>
                </div>
              </div>

              {/* Schedule */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-tight mb-4 uppercase tracking-widest">Event Schedule</h3>
              <div className="bg-[#161b22] rounded-lg overflow-hidden border border-[#30363d] mb-10">
                <table className="w-full">
                  <tbody className="divide-y divide-[#30363d]">
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
                      <tr key={i} className="hover:bg-[#21262d] transition-colors">
                        <td className="px-5 py-4 font-mono font-medium text-[#f85149] w-32">{item.time}</td>
                        <td className="px-5 py-4 text-[#8b949e]">{item.event}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Registration Form Modal */}
              {showLobbyForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-5">Register for Lobby Day</h3>
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
                          className="bg-[#f85149] hover:bg-[#f85149]/80 text-white font-medium text-xs tracking-widest uppercase px-5 py-2.5 rounded transition-all"
                        >
                          Register
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowLobbyForm(false)}
                          className="bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] font-medium text-xs tracking-widest uppercase px-5 py-2.5 rounded border border-[#30363d] transition-all"
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
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Board of Trustees Liaison</h2>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#f85149] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#f85149] tracking-tight">8</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">BOT Meetings</p>
                </div>
                <div className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#58a6ff] tracking-tight">23</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Agenda Items Tracked</p>
                </div>
                <div className="bg-[#161b22] border border-[#238636] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#238636] tracking-tight">156</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Student Comments</p>
                </div>
              </div>

              {/* Upcoming Meeting */}
              <div className="bg-[#161b22] rounded-lg p-6 border border-[#30363d] mb-10">
                <h3 className="font-semibold text-[#8b949e] mb-4 uppercase tracking-widest text-xs">Next BOT Meeting</h3>
                <p className="text-xl font-mono font-bold text-[#f85149] tracking-tight">January 30, 2026 at 9:00 AM</p>
                <p className="text-[#6e7681] mt-1">Carolina Inn, Chancellor's Ballroom</p>
                <div className="mt-5">
                  <h4 className="font-medium text-[#f0f6fc] mb-3 uppercase tracking-widest text-xs">Key Agenda Items:</h4>
                  <ul className="space-y-2 text-[#8b949e]">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#f85149] rounded-full"></span>
                      Tuition proposal discussion
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#f85149] rounded-full"></span>
                      Campus safety update
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#f85149] rounded-full"></span>
                      Construction projects review
                    </li>
                  </ul>
                </div>
                <button className="mt-5 bg-[#f85149] hover:bg-[#f85149]/80 text-white font-medium text-xs tracking-widest uppercase px-5 py-2.5 rounded transition-all">
                  Submit Public Comment
                </button>
              </div>

              {/* Recent Updates */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-tight mb-4 uppercase tracking-widest">Recent BOT Updates</h3>
              <div className="space-y-3">
                {[
                  { date: 'Jan 15, 2026', title: 'Budget Committee approved housing fee increase', impact: 'High' },
                  { date: 'Dec 10, 2025', title: 'New sustainability requirements for buildings', impact: 'Medium' },
                  { date: 'Nov 20, 2025', title: 'Student mental health funding approved', impact: 'High' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#161b22] rounded-lg p-5 border border-[#30363d] hover:border-[#f85149] transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">{item.title}</p>
                        <p className="text-sm text-[#6e7681] mt-1 font-mono">{item.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-medium border ${
                        item.impact === 'High' ? 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]' : 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]'
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
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Federal Advocacy</h2>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#f85149] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#f85149] tracking-tight">12</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Action Alerts</p>
                </div>
                <div className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#58a6ff] tracking-tight">890</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Messages Sent</p>
                </div>
                <div className="bg-[#161b22] border border-[#238636] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#238636] tracking-tight">8</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Issues Tracked</p>
                </div>
              </div>

              {/* Current Issues */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-tight mb-4 uppercase tracking-widest">Current Federal Issues</h3>
              <div className="space-y-3 mb-10">
                {[
                  { issue: 'Pell Grant Increase', status: 'Active', urgency: 'High' },
                  { issue: 'Student Loan Interest Rates', status: 'Monitoring', urgency: 'Medium' },
                  { issue: 'Research Funding (NIH/NSF)', status: 'Active', urgency: 'High' },
                  { issue: 'DACA Student Support', status: 'Active', urgency: 'High' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#161b22] rounded-lg p-5 border border-[#30363d] flex items-center justify-between hover:border-[#f85149] transition-colors">
                    <div>
                      <p className="font-semibold text-[#f0f6fc]">{item.issue}</p>
                      <p className="text-sm text-[#6e7681] mt-1">{item.status}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded text-xs font-medium border ${
                        item.urgency === 'High' ? 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]' : 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]'
                      }`}>
                        {item.urgency}
                      </span>
                      <button className="bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] text-xs font-medium tracking-widest uppercase px-4 py-2 rounded border border-[#30363d] transition-all">
                        Take Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Representatives */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-tight mb-4 uppercase tracking-widest">NC Congressional Delegation</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Rep. Valerie Foushee', district: 'NC-4', party: 'D' },
                  { name: 'Sen. Ted Budd', chamber: 'Senate', party: 'R' },
                  { name: 'Sen. Thom Tillis', chamber: 'Senate', party: 'R' },
                ].map((rep, i) => (
                  <div key={i} className="bg-[#161b22] rounded-lg p-5 border border-[#30363d] flex items-center justify-between hover:border-[#f85149] transition-colors">
                    <div>
                      <p className="font-semibold text-[#f0f6fc]">{rep.name}</p>
                      <p className="text-sm text-[#6e7681] mt-1">{rep.district || rep.chamber}</p>
                    </div>
                    <button className="bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] text-xs font-medium tracking-widest uppercase px-4 py-2 rounded border border-[#30363d] transition-all">
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
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">State & External Affairs Policies</h2>
              <div className="space-y-4">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] rounded-lg p-5 border border-[#30363d] hover:border-[#f85149] transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-[#f0f6fc]">{policy.title}</h3>
                      <span className={`px-3 py-1 rounded text-xs font-medium border ${
                        policy.status === 'in_progress' ? 'bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]' : 'bg-[#21262d] text-[#6e7681] border-[#30363d]'
                      }`}>
                        {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                      </span>
                    </div>
                    <p className="text-sm text-[#8b949e] mb-4">{policy.description}</p>
                    <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                      <div className="h-full bg-[#f85149] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
                    </div>
                    <p className="text-xs text-[#6e7681] mt-2 font-mono">{policy.progress}% complete</p>
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
