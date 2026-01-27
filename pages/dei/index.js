import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { culturalCenters } from '../../lib/data'

export default function DEIPage() {
  const [activeTab, setActiveTab] = useState('centers')
  const [showMentorForm, setShowMentorForm] = useState(false)
  const [showNominationForm, setShowNominationForm] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const { policies } = useApp()

  const deptPolicies = policies.filter(p => p.department === 'dei')

  return (
    <Layout>
      <Head>
        <title>DEI | Project Bold</title>
      </Head>

      {/* Hero - Dark gradient with grid background */}
      <div className="relative bg-gradient-to-b from-[#0a0e14] via-[#0d1117] to-[#161b22] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#db6d28 1px, transparent 1px), linear-gradient(90deg, #db6d28 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-6">
          <p className="text-[#db6d28] text-xs font-medium tracking-widest uppercase mb-3">Building Inclusive Excellence</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#f0f6fc] mb-4">
            Diversity, Equity & Inclusion
          </h1>
          <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed">
            Building a Carolina where everyone belongs. Cultural centers, first-gen support,
            accessibility advocacy, and inclusive excellence.
          </p>
        </div>
      </div>

      {/* Tabs - Uppercase with border-bottom active state */}
      <div className="bg-[#0d1117] border-b border-[#30363d] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {[
              { id: 'centers', label: 'Cultural Centers' },
              { id: 'firstgen', label: 'First-Gen Network' },
              { id: 'accessibility', label: 'Accessibility' },
              { id: 'awards', label: 'Excellence Awards' },
              { id: 'training', label: 'Bias Training' },
              { id: 'policies', label: 'All Policies' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-xs font-medium whitespace-nowrap tracking-widest uppercase transition border-b-2 ${
                  activeTab === tab.id
                    ? 'text-[#db6d28] border-[#db6d28]'
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
            <div className="mb-6 bg-[#161b22] border border-[#238636] rounded-lg p-5">
              <p className="text-[#f0f6fc] font-medium">
                {submitted === 'mentor' && 'Thank you for joining the First-Gen Support Network! We will match you with a mentor/mentee soon.'}
                {submitted === 'nomination' && 'Your nomination has been submitted. Thank you for recognizing excellence in DEI!'}
                {submitted === 'report' && 'Your accessibility report has been submitted. We will follow up on this issue.'}
              </p>
              <button onClick={() => setSubmitted(null)} className="text-[#238636] text-sm mt-2 hover:underline">Dismiss</button>
            </div>
          )}

          {/* Cultural Centers Tab */}
          {activeTab === 'centers' && (
            <div>
              <h2 className="text-2xl font-semibold text-[#f0f6fc] tracking-tight mb-6">Cultural Centers</h2>

              {/* Stats - Monospace numbers */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#db6d28]">8</p>
                  <p className="text-xs text-[#6e7681] tracking-widest uppercase mt-1">Cultural Centers</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#58a6ff]">67</p>
                  <p className="text-xs text-[#6e7681] tracking-widest uppercase mt-1">Events This Semester</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#238636]">$125K</p>
                  <p className="text-xs text-[#6e7681] tracking-widest uppercase mt-1">Funding Advocated</p>
                </div>
              </div>

              {/* Centers Directory */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {culturalCenters.map(center => (
                  <div key={center.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#db6d28]/50 transition">
                    <h3 className="font-semibold text-[#f0f6fc]">{center.name}</h3>
                    <p className="text-sm text-[#8b949e]">{center.location}</p>
                    <p className="text-sm text-[#6e7681]">{center.phone}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#30363d]">
                      <span className="text-sm text-[#db6d28] font-mono">{center.events} upcoming events</span>
                      <button className="px-4 py-2 text-xs font-medium tracking-widest uppercase text-[#db6d28] border border-[#db6d28] rounded hover:bg-[#db6d28]/10 transition">
                        View Events
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Advocacy */}
              <div className="bg-[#161b22] border border-[#db6d28]/30 rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-2">Support Cultural Center Funding</h3>
                <p className="text-sm text-[#8b949e] mb-4">Join our campaign to increase funding for cultural centers on campus.</p>
                <button className="px-5 py-2.5 bg-[#db6d28] text-white text-xs font-medium tracking-widest uppercase rounded hover:bg-[#c45d22] transition">
                  Sign the Petition
                </button>
              </div>
            </div>
          )}

          {/* First-Gen Tab */}
          {activeTab === 'firstgen' && (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[#f0f6fc] tracking-tight">First-Gen Support Network</h2>
                  <p className="text-[#8b949e] mt-1">Mentorship and resources for first-generation college students</p>
                </div>
                <button
                  onClick={() => setShowMentorForm(true)}
                  className="px-5 py-2.5 bg-[#db6d28] text-white text-xs font-medium tracking-widest uppercase rounded hover:bg-[#c45d22] transition"
                >
                  Join Network
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#db6d28]">67</p>
                  <p className="text-xs text-[#6e7681] tracking-widest uppercase mt-1">Mentors</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#58a6ff]">234</p>
                  <p className="text-xs text-[#6e7681] tracking-widest uppercase mt-1">Mentees</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#238636]">156</p>
                  <p className="text-xs text-[#6e7681] tracking-widest uppercase mt-1">Active Matches</p>
                </div>
              </div>

              {/* Resources */}
              <h3 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-4">First-Gen Resources</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[
                  { title: 'FGLI Student Success', desc: 'Office supporting first-gen and low-income students', link: '#' },
                  { title: 'Navigate College Guide', desc: 'Tips for succeeding as a first-gen student', link: '#' },
                  { title: 'Financial Aid Resources', desc: 'Scholarships and aid for first-gen students', link: '#' },
                  { title: 'Career Development', desc: 'Networking and career resources', link: '#' },
                ].map((resource, i) => (
                  <a key={i} href={resource.link} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#db6d28]/50 transition group">
                    <h4 className="font-semibold text-[#f0f6fc] group-hover:text-[#db6d28] transition">{resource.title}</h4>
                    <p className="text-sm text-[#8b949e]">{resource.desc}</p>
                  </a>
                ))}
              </div>

              {/* Mentor Form Modal */}
              {showMentorForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-semibold text-[#f0f6fc] tracking-tight mb-4">Join First-Gen Network</h3>
                    <form onSubmit={(e) => { e.preventDefault(); setSubmitted('mentor'); setShowMentorForm(false); }} className="space-y-4">
                      <Input label="Full Name" required />
                      <Input label="Email" type="email" required />
                      <Input label="PID" required />
                      <Select label="I want to be a..." required options={[
                        { value: 'mentor', label: 'Mentor (upperclassman)' },
                        { value: 'mentee', label: 'Mentee (seeking guidance)' },
                        { value: 'both', label: 'Both' },
                      ]} />
                      <Select label="Year" required options={[
                        { value: 'freshman', label: 'First Year' },
                        { value: 'sophomore', label: 'Sophomore' },
                        { value: 'junior', label: 'Junior' },
                        { value: 'senior', label: 'Senior' },
                      ]} />
                      <Input label="Major" required />
                      <Textarea label="What do you hope to gain from this network?" rows={3} />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="px-5 py-2.5 bg-[#db6d28] text-white text-xs font-medium tracking-widest uppercase rounded hover:bg-[#c45d22] transition">
                          Join Network
                        </button>
                        <button type="button" onClick={() => setShowMentorForm(false)} className="px-5 py-2.5 text-[#8b949e] text-xs font-medium tracking-widest uppercase border border-[#30363d] rounded hover:bg-[#21262d] transition">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Accessibility Tab */}
          {activeTab === 'accessibility' && (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[#f0f6fc] tracking-tight">Accessibility Audit</h2>
                  <p className="text-[#8b949e] mt-1">Reviewing and improving campus accessibility</p>
                </div>
                <button
                  onClick={() => setShowReportForm(true)}
                  className="px-5 py-2.5 bg-[#db6d28] text-white text-xs font-medium tracking-widest uppercase rounded hover:bg-[#c45d22] transition"
                >
                  Report Issue
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#db6d28]">156</p>
                  <p className="text-xs text-[#6e7681] tracking-widest uppercase mt-1">Issues Reported</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#238636]">45</p>
                  <p className="text-xs text-[#6e7681] tracking-widest uppercase mt-1">Resolved</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#58a6ff]">89</p>
                  <p className="text-xs text-[#6e7681] tracking-widest uppercase mt-1">Buildings Audited</p>
                </div>
              </div>

              {/* Issue Categories */}
              <h3 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-4">Common Issues</h3>
              <div className="space-y-3 mb-8">
                {[
                  { issue: 'Elevator Outages', count: 34, status: 'Escalated to Facilities' },
                  { issue: 'Ramp Access', count: 28, status: 'Under Review' },
                  { issue: 'Automatic Door Issues', count: 25, status: 'Partial Resolution' },
                  { issue: 'Signage/Wayfinding', count: 18, status: 'In Progress' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center justify-between hover:border-[#db6d28]/50 transition">
                    <div>
                      <h4 className="font-semibold text-[#f0f6fc]">{item.issue}</h4>
                      <p className="text-sm text-[#6e7681] font-mono">{item.count} reports</p>
                    </div>
                    <span className="px-3 py-1 bg-transparent border border-[#db6d28] text-[#db6d28] rounded text-xs font-medium tracking-wide">{item.status}</span>
                  </div>
                ))}
              </div>

              {/* Report Form Modal */}
              {showReportForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-semibold text-[#f0f6fc] tracking-tight mb-4">Report Accessibility Issue</h3>
                    <form onSubmit={(e) => { e.preventDefault(); setSubmitted('report'); setShowReportForm(false); }} className="space-y-4">
                      <Input label="Building/Location" required />
                      <Select label="Issue Type" required options={[
                        { value: 'elevator', label: 'Elevator' },
                        { value: 'ramp', label: 'Ramp/Entrance' },
                        { value: 'door', label: 'Automatic Door' },
                        { value: 'restroom', label: 'Restroom' },
                        { value: 'signage', label: 'Signage' },
                        { value: 'other', label: 'Other' },
                      ]} />
                      <Textarea label="Describe the issue" required rows={4} />
                      <Input label="Your email (optional)" type="email" />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="px-5 py-2.5 bg-[#db6d28] text-white text-xs font-medium tracking-widest uppercase rounded hover:bg-[#c45d22] transition">
                          Submit Report
                        </button>
                        <button type="button" onClick={() => setShowReportForm(false)} className="px-5 py-2.5 text-[#8b949e] text-xs font-medium tracking-widest uppercase border border-[#30363d] rounded hover:bg-[#21262d] transition">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Awards Tab */}
          {activeTab === 'awards' && (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[#f0f6fc] tracking-tight">Inclusive Excellence Awards</h2>
                  <p className="text-[#8b949e] mt-1">Recognizing students and organizations advancing DEI</p>
                </div>
                <button
                  onClick={() => setShowNominationForm(true)}
                  className="px-5 py-2.5 bg-[#db6d28] text-white text-xs font-medium tracking-widest uppercase rounded hover:bg-[#c45d22] transition"
                >
                  Nominate
                </button>
              </div>

              {/* Categories */}
              <h3 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-4">Award Categories</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[
                  { name: 'Outstanding Student Leader', desc: 'Individual advancing DEI initiatives' },
                  { name: 'Organization of the Year', desc: 'Student org promoting inclusivity' },
                  { name: 'Ally Award', desc: 'Supporting underrepresented communities' },
                  { name: 'Innovation Award', desc: 'Creative approaches to DEI challenges' },
                  { name: 'Community Impact', desc: 'Significant campus-wide impact' },
                ].map((award, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#db6d28]/50 transition">
                    <h4 className="font-semibold text-[#f0f6fc]">{award.name}</h4>
                    <p className="text-sm text-[#8b949e]">{award.desc}</p>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="bg-[#161b22] border border-[#db6d28]/30 rounded-lg p-5 text-center">
                <p className="text-lg font-medium text-[#f0f6fc]">
                  <span className="font-mono text-[#db6d28]">89</span> nominations received
                  <span className="text-[#30363d] mx-3">|</span>
                  Deadline: <span className="font-mono text-[#db6d28]">April 1, 2026</span>
                </p>
              </div>

              {/* Nomination Form Modal */}
              {showNominationForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-semibold text-[#f0f6fc] tracking-tight mb-4">Submit Nomination</h3>
                    <form onSubmit={(e) => { e.preventDefault(); setSubmitted('nomination'); setShowNominationForm(false); }} className="space-y-4">
                      <Input label="Your Name" required />
                      <Input label="Your Email" type="email" required />
                      <Select label="Award Category" required options={[
                        { value: 'student', label: 'Outstanding Student Leader' },
                        { value: 'org', label: 'Organization of the Year' },
                        { value: 'ally', label: 'Ally Award' },
                        { value: 'innovation', label: 'Innovation Award' },
                        { value: 'community', label: 'Community Impact' },
                      ]} />
                      <Input label="Nominee Name/Organization" required />
                      <Textarea label="Why should they receive this award?" required rows={4} />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="px-5 py-2.5 bg-[#db6d28] text-white text-xs font-medium tracking-widest uppercase rounded hover:bg-[#c45d22] transition">
                          Submit Nomination
                        </button>
                        <button type="button" onClick={() => setShowNominationForm(false)} className="px-5 py-2.5 text-[#8b949e] text-xs font-medium tracking-widest uppercase border border-[#30363d] rounded hover:bg-[#21262d] transition">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Training Tab */}
          {activeTab === 'training' && (
            <div>
              <h2 className="text-2xl font-semibold text-[#f0f6fc] tracking-tight mb-6">Bias Response Training</h2>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#db6d28]">89</p>
                  <p className="text-xs text-[#6e7681] tracking-widest uppercase mt-1">Students Trained</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#58a6ff]">6</p>
                  <p className="text-xs text-[#6e7681] tracking-widest uppercase mt-1">Sessions Held</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-semibold text-[#238636]">92%</p>
                  <p className="text-xs text-[#6e7681] tracking-widest uppercase mt-1">Completion Rate</p>
                </div>
              </div>

              {/* Upcoming Sessions */}
              <h3 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-4">Upcoming Training Sessions</h3>
              <div className="space-y-3 mb-8">
                {[
                  { date: 'Feb 10, 2026', time: '4:00 PM', location: 'Student Union 3205' },
                  { date: 'Feb 24, 2026', time: '4:00 PM', location: 'Davis Library 247' },
                  { date: 'Mar 10, 2026', time: '4:00 PM', location: 'Virtual (Zoom)' },
                ].map((session, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center justify-between hover:border-[#db6d28]/50 transition">
                    <div>
                      <p className="font-semibold text-[#f0f6fc] font-mono">{session.date}</p>
                      <p className="text-sm text-[#6e7681]">{session.time} | {session.location}</p>
                    </div>
                    <button className="px-4 py-2 text-xs font-medium tracking-widest uppercase text-[#db6d28] border border-[#db6d28] rounded hover:bg-[#db6d28]/10 transition">
                      Register
                    </button>
                  </div>
                ))}
              </div>

              {/* What You'll Learn */}
              <div className="bg-[#161b22] border border-[#db6d28]/30 rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-4">What You'll Learn</h3>
                <ul className="space-y-3 text-[#8b949e]">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#db6d28] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Recognizing implicit bias and microaggressions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#db6d28] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Responding to bias incidents effectively</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#db6d28] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Supporting affected individuals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#db6d28] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Campus reporting resources and processes</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* All Policies Tab */}
          {activeTab === 'policies' && (
            <div>
              <h2 className="text-2xl font-semibold text-[#f0f6fc] tracking-tight mb-6">DEI Policies</h2>
              <div className="space-y-3">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#db6d28]/50 transition">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-[#f0f6fc]">{policy.title}</h3>
                      <span className={`px-3 py-1 rounded text-xs font-medium border ${
                        policy.status === 'in_progress'
                          ? 'border-[#58a6ff] text-[#58a6ff]'
                          : 'border-[#6e7681] text-[#6e7681]'
                      }`}>
                        {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                      </span>
                    </div>
                    <p className="text-sm text-[#8b949e] mb-4">{policy.description}</p>
                    <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                      <div className="h-full bg-[#db6d28] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
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
