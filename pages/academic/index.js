import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button } from '../../components/FormInput'
import { useApp } from '../../lib/store'

export default function AcademicPage() {
  const [activeTab, setActiveTab] = useState('research')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', type: '', issue: '', details: '' })
  const [submitted, setSubmitted] = useState(false)
  const { policies, operationalData } = useApp()

  const researchPositions = operationalData?.research?.positions || []
  const deptPolicies = policies.filter(p => p.department === 'academic')
  const filteredPositions = researchPositions.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tabs = [
    { id: 'research', label: 'Research Opportunities' },
    { id: 'registration', label: 'Registration Feedback' },
    { id: 'advising', label: 'Advising Resources' },
    { id: 'syllabus', label: 'Syllabus Database' },
    { id: 'transfer', label: 'Transfer Credits' },
    { id: 'policies', label: 'All Policies' },
  ]

  return (
    <Layout>
      <Head>
        <title>Academic Affairs | Project Bold</title>
      </Head>

      {/* Hero */}
      <div className="relative bg-gradient-to-b from-[#0a0e14] via-[#0d1117] to-[#161b22] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#388bfd 1px, transparent 1px), linear-gradient(90deg, #388bfd 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#388bfd]/10 border border-[#388bfd]/30 rounded text-xs font-mono text-[#388bfd] mb-6 uppercase tracking-widest">
            Academic Affairs
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#f0f6fc] mb-4">Academic Affairs</h1>
          <p className="text-lg text-[#8b949e] max-w-2xl">
            Course registration, advising, research opportunities, and academic success resources.
            Supporting your academic journey at Carolina.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0d1117] border-b border-[#30363d] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-xs font-medium whitespace-nowrap uppercase tracking-widest transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#388bfd] text-[#388bfd]'
                    : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="bg-[#0a0e14] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {submitted && (
            <div className="mb-8 bg-[#161b22] border border-[#238636] rounded-lg p-5">
              <p className="text-[#f0f6fc] font-medium">Thank you for your feedback! We will review and address your concern.</p>
              <button onClick={() => setSubmitted(false)} className="text-[#388bfd] text-sm mt-2 hover:underline">Dismiss</button>
            </div>
          )}

          {/* Research Opportunities Tab */}
          {activeTab === 'research' && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-8">Undergraduate Research Opportunities</h2>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#388bfd]">234</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Open Positions</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">567</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Applications</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">89</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Placements</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#d29922]">45+</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Departments</p>
                </div>
              </div>

              {/* Search */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 mb-8">
                <Input
                  placeholder="Search by position, department, or professor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc] placeholder-[#6e7681]"
                />
              </div>

              {/* Positions */}
              <div className="space-y-4">
                {filteredPositions.map(pos => (
                  <div key={pos.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[#f0f6fc]">{pos.title}</h3>
                        <p className="text-sm text-[#8b949e] mt-1">{pos.department} | {pos.professor}</p>
                        <div className="flex gap-3 mt-3">
                          <span className={`px-2.5 py-1 rounded text-xs font-medium border ${
                            pos.type === 'paid'
                              ? 'border-[#238636] text-[#3fb950] bg-[#238636]/10'
                              : 'border-[#388bfd] text-[#388bfd] bg-[#388bfd]/10'
                          }`}>
                            {pos.type === 'paid' ? 'Paid' : 'Credit'}
                          </span>
                          <span className="text-sm text-[#6e7681] font-mono">{pos.hours}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#6e7681]">Deadline: <span className="font-mono">{pos.deadline}</span></p>
                        <button className="mt-3 px-5 py-2 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded text-sm font-medium hover:bg-[#30363d] transition-colors">
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button className="px-6 py-3 bg-[#388bfd] text-white rounded font-medium hover:bg-[#58a6ff] transition-colors">
                  View All Positions
                </button>
              </div>
            </div>
          )}

          {/* Registration Feedback Tab */}
          {activeTab === 'registration' && (
            <div>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc]">Course Registration Reform</h2>
                  <p className="text-[#8b949e] mt-2">Share your registration experiences and help us advocate for improvements</p>
                </div>
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="px-6 py-3 bg-[#388bfd] text-white rounded font-medium hover:bg-[#58a6ff] transition-colors"
                >
                  Submit Feedback
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#388bfd]">1,890</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Feedback Submissions</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">156</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Issues Identified</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">45</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Resolved</p>
                </div>
              </div>

              {/* Common Issues */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Common Issues We're Addressing</h3>
              <div className="space-y-4 mb-10">
                {[
                  { issue: 'Waitlist Transparency', votes: 456, status: 'In Progress' },
                  { issue: 'Registration Time Fairness', votes: 389, status: 'Researching' },
                  { issue: 'Course Capacity Limits', votes: 312, status: 'Meeting Scheduled' },
                  { issue: 'System Crashes During Registration', votes: 287, status: 'Escalated to ITS' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-[#f0f6fc]">{item.issue}</h4>
                      <p className="text-sm text-[#6e7681] mt-1"><span className="font-mono">{item.votes}</span> students affected</p>
                    </div>
                    <span className="px-2.5 py-1 rounded text-xs font-medium border border-[#388bfd] text-[#388bfd] bg-[#388bfd]/10">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Feedback Form Modal */}
              {showFeedbackForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5">Submit Registration Feedback</h3>
                    <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); setShowFeedbackForm(false); }} className="space-y-5">
                      <Input label="Name (optional)" name="name" value={feedbackForm.name} onChange={e => setFeedbackForm({...feedbackForm, name: e.target.value})} className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
                      <Input label="Email (optional)" type="email" name="email" value={feedbackForm.email} onChange={e => setFeedbackForm({...feedbackForm, email: e.target.value})} className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
                      <Select label="Issue Type" name="type" value={feedbackForm.type} onChange={e => setFeedbackForm({...feedbackForm, type: e.target.value})} required
                        options={[
                          { value: 'waitlist', label: 'Waitlist Issues' },
                          { value: 'timing', label: 'Registration Timing' },
                          { value: 'capacity', label: 'Course Capacity' },
                          { value: 'technical', label: 'Technical Problems' },
                          { value: 'other', label: 'Other' },
                        ]}
                        className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
                      />
                      <Textarea label="Describe the Issue" name="details" value={feedbackForm.details} onChange={e => setFeedbackForm({...feedbackForm, details: e.target.value})} required rows={4} className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="px-6 py-3 bg-[#388bfd] text-white rounded font-medium hover:bg-[#58a6ff] transition-colors">
                          Submit Feedback
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowFeedbackForm(false)}
                          className="px-6 py-3 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded font-medium hover:bg-[#30363d] transition-colors"
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

          {/* Advising Tab */}
          {activeTab === 'advising' && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-8">Academic Advising Resources</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-3">Find Your Advisor</h3>
                  <p className="text-sm text-[#8b949e] mb-5">Look up your assigned academic advisor by department</p>
                  <Select
                    options={[
                      { value: 'cas', label: 'College of Arts & Sciences' },
                      { value: 'business', label: 'Kenan-Flagler Business School' },
                      { value: 'journalism', label: 'Hussman School of Journalism' },
                      { value: 'nursing', label: 'School of Nursing' },
                    ]}
                    className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
                  />
                  <button className="mt-5 px-5 py-2.5 bg-[#388bfd] text-white rounded text-sm font-medium hover:bg-[#58a6ff] transition-colors">
                    Search
                  </button>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-3">Rate Your Experience</h3>
                  <p className="text-sm text-[#8b949e] mb-5">Help us improve advising by sharing feedback</p>
                  <p className="text-sm text-[#8b949e]">Average Rating: <span className="font-semibold font-mono text-[#f0f6fc]">3.8/5.0</span></p>
                  <p className="text-sm text-[#6e7681]">Based on <span className="font-mono">456</span> reviews</p>
                  <button className="mt-5 px-5 py-2.5 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded text-sm font-medium hover:bg-[#30363d] transition-colors">
                    Leave Review
                  </button>
                </div>
              </div>

              {/* Tips */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Advising Tips</h3>
              <div className="bg-[#161b22] border border-[#388bfd]/30 rounded-lg p-6">
                <ul className="space-y-3 text-[#8b949e]">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#388bfd] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Schedule appointments early, especially before registration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#388bfd] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Bring a list of specific questions and concerns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#388bfd] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Review degree requirements before your meeting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[#388bfd] rounded-full mt-2 flex-shrink-0"></span>
                    <span>Follow up via email to confirm discussed plans</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Syllabus Tab */}
          {activeTab === 'syllabus' && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-8">Syllabus Transparency Initiative</h2>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#388bfd]">890</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Syllabi Available</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">2,340</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Student Reviews</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">456</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Courses Covered</p>
                </div>
              </div>

              {/* Search */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4">Search Course Syllabi</h3>
                <div className="flex gap-4">
                  <Input placeholder="Course code (e.g., COMP 110)" className="flex-1 bg-[#0d1117] border-[#30363d] text-[#f0f6fc] placeholder-[#6e7681]" />
                  <button className="px-6 py-3 bg-[#388bfd] text-white rounded font-medium hover:bg-[#58a6ff] transition-colors">
                    Search
                  </button>
                </div>
                <p className="text-sm text-[#6e7681] mt-3">Search for past syllabi to help plan your schedule</p>
              </div>

              {/* Note */}
              <div className="bg-[#161b22] border border-[#d29922]/30 rounded-lg p-5">
                <p className="text-[#8b949e] text-sm">
                  <span className="font-semibold text-[#d29922]">Note:</span> We're working with faculty to make syllabi available before registration.
                  Currently, this database includes syllabi from previous semesters.
                </p>
              </div>
            </div>
          )}

          {/* Transfer Tab */}
          {activeTab === 'transfer' && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-8">Credit Transfer Portal</h2>

              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#f0f6fc] text-lg mb-5">Check Transfer Equivalencies</h3>
                <div className="grid md:grid-cols-2 gap-5 mb-5">
                  <Select label="Transfer Institution" options={[
                    { value: 'ncsu', label: 'NC State University' },
                    { value: 'duke', label: 'Duke University' },
                    { value: 'wcu', label: 'Western Carolina University' },
                    { value: 'uncc', label: 'UNC Charlotte' },
                    { value: 'other', label: 'Other Institution' },
                  ]} className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
                  <Input label="Course Code" placeholder="e.g., ENG 101" className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc] placeholder-[#6e7681]" />
                </div>
                <button className="px-6 py-3 bg-[#388bfd] text-white rounded font-medium hover:bg-[#58a6ff] transition-colors">
                  Check Equivalency
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#388bfd]">1,234</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Equivalencies Listed</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">234</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Requests Submitted</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">81%</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Approval Rate</p>
                </div>
              </div>
            </div>
          )}

          {/* All Policies Tab */}
          {activeTab === 'policies' && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-8">Academic Affairs Policies</h2>
              <div className="space-y-4">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-[#f0f6fc]">{policy.title}</h3>
                      <span className={`px-2.5 py-1 rounded text-xs font-medium border ${
                        policy.status === 'in_progress'
                          ? 'border-[#388bfd] text-[#388bfd] bg-[#388bfd]/10'
                          : 'border-[#30363d] text-[#6e7681] bg-[#21262d]'
                      }`}>
                        {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                      </span>
                    </div>
                    <p className="text-sm text-[#8b949e] mb-4">{policy.description}</p>
                    <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#388bfd] rounded-full transition-all"
                        style={{ width: `${policy.progress}%` }}
                      />
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
