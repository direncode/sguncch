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

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#ff9500] to-[#ff7b00] text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-white/80 text-sm font-medium mb-2">Building Inclusive Excellence</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Diversity, Equity & Inclusion
          </h1>
          <p className="text-white/90 text-lg max-w-2xl">
            Building a Carolina where everyone belongs. Cultural centers, first-gen support,
            accessibility advocacy, and inclusive excellence.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#f5f5f7] border-b border-[#d2d2d7] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto">
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
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-full transition ${
                  activeTab === tab.id
                    ? 'bg-[#ff9500] text-white'
                    : 'text-[#1d1d1f] hover:bg-black/5'
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
          <div className="mb-6 bg-[#34c759]/10 rounded-2xl p-5">
            <p className="text-[#1d1d1f] font-medium">
              {submitted === 'mentor' && 'Thank you for joining the First-Gen Support Network! We will match you with a mentor/mentee soon.'}
              {submitted === 'nomination' && 'Your nomination has been submitted. Thank you for recognizing excellence in DEI!'}
              {submitted === 'report' && 'Your accessibility report has been submitted. We will follow up on this issue.'}
            </p>
            <button onClick={() => setSubmitted(null)} className="text-[#34c759] text-sm mt-2 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Cultural Centers Tab */}
        {activeTab === 'centers' && (
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-6">Cultural Centers</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#ff9500]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#ff9500]">8</p>
                <p className="text-sm text-[#6e6e73]">Cultural Centers</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3]">67</p>
                <p className="text-sm text-[#6e6e73]">Events This Semester</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759]">$125K</p>
                <p className="text-sm text-[#6e6e73]">Funding Advocated</p>
              </div>
            </div>

            {/* Centers Directory */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {culturalCenters.map(center => (
                <div key={center.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2d2d7]/50">
                  <h3 className="font-semibold text-[#1d1d1f]">{center.name}</h3>
                  <p className="text-sm text-[#6e6e73]">{center.location}</p>
                  <p className="text-sm text-[#86868b]">{center.phone}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-[#ff9500] font-medium">{center.events} upcoming events</span>
                    <button className="px-4 py-2 text-sm font-medium text-[#ff9500] bg-[#ff9500]/10 rounded-full hover:bg-[#ff9500]/20 transition">
                      View Events
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Advocacy */}
            <div className="bg-[#ff9500]/10 rounded-2xl p-6">
              <h3 className="font-semibold text-[#1d1d1f] mb-2">Support Cultural Center Funding</h3>
              <p className="text-sm text-[#6e6e73] mb-4">Join our campaign to increase funding for cultural centers on campus.</p>
              <button className="px-5 py-2.5 bg-[#ff9500] text-white text-sm font-medium rounded-full hover:bg-[#e88600] transition">
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
                <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">First-Gen Support Network</h2>
                <p className="text-[#6e6e73] mt-1">Mentorship and resources for first-generation college students</p>
              </div>
              <button
                onClick={() => setShowMentorForm(true)}
                className="px-5 py-2.5 bg-[#ff9500] text-white text-sm font-medium rounded-full hover:bg-[#e88600] transition"
              >
                Join Network
              </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#ff9500]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#ff9500]">67</p>
                <p className="text-sm text-[#6e6e73]">Mentors</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3]">234</p>
                <p className="text-sm text-[#6e6e73]">Mentees</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759]">156</p>
                <p className="text-sm text-[#6e6e73]">Active Matches</p>
              </div>
            </div>

            {/* Resources */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">First-Gen Resources</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { title: 'FGLI Student Success', desc: 'Office supporting first-gen and low-income students', link: '#' },
                { title: 'Navigate College Guide', desc: 'Tips for succeeding as a first-gen student', link: '#' },
                { title: 'Financial Aid Resources', desc: 'Scholarships and aid for first-gen students', link: '#' },
                { title: 'Career Development', desc: 'Networking and career resources', link: '#' },
              ].map((resource, i) => (
                <a key={i} href={resource.link} className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2d2d7]/50 hover:shadow-md transition group">
                  <h4 className="font-semibold text-[#1d1d1f] group-hover:text-[#ff9500] transition">{resource.title}</h4>
                  <p className="text-sm text-[#6e6e73]">{resource.desc}</p>
                </a>
              ))}
            </div>

            {/* Mentor Form Modal */}
            {showMentorForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Join First-Gen Network</h3>
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
                      <button type="submit" className="px-5 py-2.5 bg-[#ff9500] text-white text-sm font-medium rounded-full hover:bg-[#e88600] transition">
                        Join Network
                      </button>
                      <button type="button" onClick={() => setShowMentorForm(false)} className="px-5 py-2.5 text-[#1d1d1f] text-sm font-medium bg-[#f5f5f7] rounded-full hover:bg-[#e8e8ed] transition">
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
                <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Accessibility Audit</h2>
                <p className="text-[#6e6e73] mt-1">Reviewing and improving campus accessibility</p>
              </div>
              <button
                onClick={() => setShowReportForm(true)}
                className="px-5 py-2.5 bg-[#ff9500] text-white text-sm font-medium rounded-full hover:bg-[#e88600] transition"
              >
                Report Issue
              </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#ff9500]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#ff9500]">156</p>
                <p className="text-sm text-[#6e6e73]">Issues Reported</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759]">45</p>
                <p className="text-sm text-[#6e6e73]">Resolved</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3]">89</p>
                <p className="text-sm text-[#6e6e73]">Buildings Audited</p>
              </div>
            </div>

            {/* Issue Categories */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Common Issues</h3>
            <div className="space-y-3 mb-8">
              {[
                { issue: 'Elevator Outages', count: 34, status: 'Escalated to Facilities' },
                { issue: 'Ramp Access', count: 28, status: 'Under Review' },
                { issue: 'Automatic Door Issues', count: 25, status: 'Partial Resolution' },
                { issue: 'Signage/Wayfinding', count: 18, status: 'In Progress' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2d2d7]/50 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#1d1d1f]">{item.issue}</h4>
                    <p className="text-sm text-[#86868b]">{item.count} reports</p>
                  </div>
                  <span className="px-2.5 py-1 bg-[#ff9500]/10 text-[#ff9500] rounded-full text-xs font-medium">{item.status}</span>
                </div>
              ))}
            </div>

            {/* Report Form Modal */}
            {showReportForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Report Accessibility Issue</h3>
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
                      <button type="submit" className="px-5 py-2.5 bg-[#ff9500] text-white text-sm font-medium rounded-full hover:bg-[#e88600] transition">
                        Submit Report
                      </button>
                      <button type="button" onClick={() => setShowReportForm(false)} className="px-5 py-2.5 text-[#1d1d1f] text-sm font-medium bg-[#f5f5f7] rounded-full hover:bg-[#e8e8ed] transition">
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
                <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">Inclusive Excellence Awards</h2>
                <p className="text-[#6e6e73] mt-1">Recognizing students and organizations advancing DEI</p>
              </div>
              <button
                onClick={() => setShowNominationForm(true)}
                className="px-5 py-2.5 bg-[#ff9500] text-white text-sm font-medium rounded-full hover:bg-[#e88600] transition"
              >
                Nominate
              </button>
            </div>

            {/* Categories */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Award Categories</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { name: 'Outstanding Student Leader', desc: 'Individual advancing DEI initiatives' },
                { name: 'Organization of the Year', desc: 'Student org promoting inclusivity' },
                { name: 'Ally Award', desc: 'Supporting underrepresented communities' },
                { name: 'Innovation Award', desc: 'Creative approaches to DEI challenges' },
                { name: 'Community Impact', desc: 'Significant campus-wide impact' },
              ].map((award, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2d2d7]/50">
                  <h4 className="font-semibold text-[#1d1d1f]">{award.name}</h4>
                  <p className="text-sm text-[#6e6e73]">{award.desc}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="bg-[#ff9500]/10 rounded-2xl p-5 text-center">
              <p className="text-lg font-semibold text-[#1d1d1f]">
                <span className="text-[#ff9500]">89</span> nominations received
                <span className="text-[#86868b] mx-2">|</span>
                Deadline: <span className="text-[#ff9500]">April 1, 2026</span>
              </p>
            </div>

            {/* Nomination Form Modal */}
            {showNominationForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Submit Nomination</h3>
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
                      <button type="submit" className="px-5 py-2.5 bg-[#ff9500] text-white text-sm font-medium rounded-full hover:bg-[#e88600] transition">
                        Submit Nomination
                      </button>
                      <button type="button" onClick={() => setShowNominationForm(false)} className="px-5 py-2.5 text-[#1d1d1f] text-sm font-medium bg-[#f5f5f7] rounded-full hover:bg-[#e8e8ed] transition">
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
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-6">Bias Response Training</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#ff9500]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#ff9500]">89</p>
                <p className="text-sm text-[#6e6e73]">Students Trained</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3]">6</p>
                <p className="text-sm text-[#6e6e73]">Sessions Held</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759]">92%</p>
                <p className="text-sm text-[#6e6e73]">Completion Rate</p>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Upcoming Training Sessions</h3>
            <div className="space-y-3 mb-8">
              {[
                { date: 'Feb 10, 2026', time: '4:00 PM', location: 'Student Union 3205' },
                { date: 'Feb 24, 2026', time: '4:00 PM', location: 'Davis Library 247' },
                { date: 'Mar 10, 2026', time: '4:00 PM', location: 'Virtual (Zoom)' },
              ].map((session, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#d2d2d7]/50 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1d1d1f]">{session.date}</p>
                    <p className="text-sm text-[#6e6e73]">{session.time} | {session.location}</p>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-[#ff9500] bg-[#ff9500]/10 rounded-full hover:bg-[#ff9500]/20 transition">
                    Register
                  </button>
                </div>
              ))}
            </div>

            {/* What You'll Learn */}
            <div className="bg-[#ff9500]/10 rounded-2xl p-6">
              <h3 className="font-semibold text-[#1d1d1f] mb-4">What You'll Learn</h3>
              <ul className="space-y-3 text-[#6e6e73]">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#ff9500] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Recognizing implicit bias and microaggressions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#ff9500] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Responding to bias incidents effectively</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#ff9500] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Supporting affected individuals</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#ff9500] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Campus reporting resources and processes</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* All Policies Tab */}
        {activeTab === 'policies' && (
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-6">DEI Policies</h2>
            <div className="space-y-3">
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
                    <div className="h-full bg-[#ff9500] rounded-full transition-all" style={{ width: `${policy.progress}%` }} />
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
