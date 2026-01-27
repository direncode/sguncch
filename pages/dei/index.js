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
      <div className="bg-gradient-to-br from-pink-500 to-pink-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🤝</span>
            <h1 className="text-3xl md:text-4xl font-bold">Diversity, Equity & Inclusion</h1>
          </div>
          <p className="text-pink-100 max-w-2xl">
            Building a Carolina where everyone belongs. Cultural centers, first-gen support,
            accessibility advocacy, and inclusive excellence.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
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
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600'
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
              {submitted === 'mentor' && 'Thank you for joining the First-Gen Support Network! We will match you with a mentor/mentee soon.'}
              {submitted === 'nomination' && 'Your nomination has been submitted. Thank you for recognizing excellence in DEI!'}
              {submitted === 'report' && 'Your accessibility report has been submitted. We will follow up on this issue.'}
            </p>
            <button onClick={() => setSubmitted(null)} className="text-green-600 text-sm mt-2 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Cultural Centers Tab */}
        {activeTab === 'centers' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Cultural Centers</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-pink-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-pink-600">8</p>
                <p className="text-sm text-gray-600">Cultural Centers</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">67</p>
                <p className="text-sm text-gray-600">Events This Semester</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">$125K</p>
                <p className="text-sm text-gray-600">Funding Advocated</p>
              </div>
            </div>

            {/* Centers Directory */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {culturalCenters.map(center => (
                <div key={center.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#13294B]">{center.name}</h3>
                  <p className="text-sm text-gray-600">{center.location}</p>
                  <p className="text-sm text-gray-500">{center.phone}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-pink-600">{center.events} upcoming events</span>
                    <Button variant="secondary">View Events</Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Advocacy */}
            <div className="bg-pink-50 rounded-lg p-6 border border-pink-200">
              <h3 className="font-bold text-pink-800 mb-2">Support Cultural Center Funding</h3>
              <p className="text-sm text-pink-700 mb-4">Join our campaign to increase funding for cultural centers on campus.</p>
              <Button>Sign the Petition</Button>
            </div>
          </div>
        )}

        {/* First-Gen Tab */}
        {activeTab === 'firstgen' && (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#13294B]">First-Gen Support Network</h2>
                <p className="text-gray-600 mt-1">Mentorship and resources for first-generation college students</p>
              </div>
              <Button onClick={() => setShowMentorForm(true)}>Join Network</Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-pink-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-pink-600">67</p>
                <p className="text-sm text-gray-600">Mentors</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">234</p>
                <p className="text-sm text-gray-600">Mentees</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">156</p>
                <p className="text-sm text-gray-600">Active Matches</p>
              </div>
            </div>

            {/* Resources */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">First-Gen Resources</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { title: 'FGLI Student Success', desc: 'Office supporting first-gen and low-income students', link: '#' },
                { title: 'Navigate College Guide', desc: 'Tips for succeeding as a first-gen student', link: '#' },
                { title: 'Financial Aid Resources', desc: 'Scholarships and aid for first-gen students', link: '#' },
                { title: 'Career Development', desc: 'Networking and career resources', link: '#' },
              ].map((resource, i) => (
                <a key={i} href={resource.link} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <h4 className="font-bold text-[#13294B]">{resource.title}</h4>
                  <p className="text-sm text-gray-600">{resource.desc}</p>
                </a>
              ))}
            </div>

            {/* Mentor Form Modal */}
            {showMentorForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Join First-Gen Network</h3>
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
                    <div className="flex gap-3">
                      <Button type="submit">Join Network</Button>
                      <Button variant="secondary" onClick={() => setShowMentorForm(false)}>Cancel</Button>
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
                <h2 className="text-2xl font-bold text-[#13294B]">Accessibility Audit</h2>
                <p className="text-gray-600 mt-1">Reviewing and improving campus accessibility</p>
              </div>
              <Button onClick={() => setShowReportForm(true)}>Report Issue</Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-pink-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-pink-600">156</p>
                <p className="text-sm text-gray-600">Issues Reported</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">45</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">89</p>
                <p className="text-sm text-gray-600">Buildings Audited</p>
              </div>
            </div>

            {/* Issue Categories */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Common Issues</h3>
            <div className="space-y-4 mb-8">
              {[
                { issue: 'Elevator Outages', count: 34, status: 'Escalated to Facilities' },
                { issue: 'Ramp Access', count: 28, status: 'Under Review' },
                { issue: 'Automatic Door Issues', count: 25, status: 'Partial Resolution' },
                { issue: 'Signage/Wayfinding', count: 18, status: 'In Progress' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#13294B]">{item.issue}</h4>
                    <p className="text-sm text-gray-500">{item.count} reports</p>
                  </div>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded text-sm">{item.status}</span>
                </div>
              ))}
            </div>

            {/* Report Form Modal */}
            {showReportForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Report Accessibility Issue</h3>
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
                    <div className="flex gap-3">
                      <Button type="submit">Submit Report</Button>
                      <Button variant="secondary" onClick={() => setShowReportForm(false)}>Cancel</Button>
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
                <h2 className="text-2xl font-bold text-[#13294B]">Inclusive Excellence Awards</h2>
                <p className="text-gray-600 mt-1">Recognizing students and organizations advancing DEI</p>
              </div>
              <Button onClick={() => setShowNominationForm(true)}>Nominate</Button>
            </div>

            {/* Categories */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Award Categories</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { name: 'Outstanding Student Leader', desc: 'Individual advancing DEI initiatives' },
                { name: 'Organization of the Year', desc: 'Student org promoting inclusivity' },
                { name: 'Ally Award', desc: 'Supporting underrepresented communities' },
                { name: 'Innovation Award', desc: 'Creative approaches to DEI challenges' },
                { name: 'Community Impact', desc: 'Significant campus-wide impact' },
              ].map((award, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <h4 className="font-bold text-[#13294B]">{award.name}</h4>
                  <p className="text-sm text-gray-600">{award.desc}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="bg-pink-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-pink-600">89 nominations received | Deadline: April 1, 2026</p>
            </div>

            {/* Nomination Form Modal */}
            {showNominationForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Submit Nomination</h3>
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
                    <div className="flex gap-3">
                      <Button type="submit">Submit Nomination</Button>
                      <Button variant="secondary" onClick={() => setShowNominationForm(false)}>Cancel</Button>
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
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Bias Response Training</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-pink-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-pink-600">89</p>
                <p className="text-sm text-gray-600">Students Trained</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">6</p>
                <p className="text-sm text-gray-600">Sessions Held</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">92%</p>
                <p className="text-sm text-gray-600">Completion Rate</p>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Upcoming Training Sessions</h3>
            <div className="space-y-4 mb-8">
              {[
                { date: 'Feb 10, 2026', time: '4:00 PM', location: 'Student Union 3205' },
                { date: 'Feb 24, 2026', time: '4:00 PM', location: 'Davis Library 247' },
                { date: 'Mar 10, 2026', time: '4:00 PM', location: 'Virtual (Zoom)' },
              ].map((session, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#13294B]">{session.date}</p>
                    <p className="text-sm text-gray-600">{session.time} | {session.location}</p>
                  </div>
                  <Button variant="secondary">Register</Button>
                </div>
              ))}
            </div>

            {/* What You'll Learn */}
            <div className="bg-pink-50 rounded-lg p-6 border border-pink-200">
              <h3 className="font-bold text-pink-800 mb-4">What You'll Learn</h3>
              <ul className="space-y-2 text-pink-700">
                <li>• Recognizing implicit bias and microaggressions</li>
                <li>• Responding to bias incidents effectively</li>
                <li>• Supporting affected individuals</li>
                <li>• Campus reporting resources and processes</li>
              </ul>
            </div>
          </div>
        )}

        {/* All Policies Tab */}
        {activeTab === 'policies' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">DEI Policies</h2>
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
                    <div className="h-full bg-pink-500 rounded-full" style={{ width: `${policy.progress}%` }} />
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
