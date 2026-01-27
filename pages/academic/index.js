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
      <div className="bg-gradient-to-b from-[#0071e3] to-[#0077ed] text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Academic Affairs</h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Course registration, advising, research opportunities, and academic success resources.
            Supporting your academic journey at Carolina.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#f5f5f7] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-medium whitespace-nowrap rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0071e3] text-white'
                    : 'bg-white text-[#1d1d1f] hover:bg-[#e8e8ed]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {submitted && (
          <div className="mb-8 bg-[#34c759]/10 rounded-2xl p-5">
            <p className="text-[#1d1d1f] font-medium">Thank you for your feedback! We will review and address your concern.</p>
            <button onClick={() => setSubmitted(false)} className="text-[#0071e3] text-sm mt-2 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Research Opportunities Tab */}
        {activeTab === 'research' && (
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-8">Undergraduate Research Opportunities</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-5 mb-10">
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#0071e3]">234</p>
                <p className="text-sm text-[#6e6e73] mt-1">Open Positions</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#34c759]">567</p>
                <p className="text-sm text-[#6e6e73] mt-1">Applications</p>
              </div>
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#af52de]">89</p>
                <p className="text-sm text-[#6e6e73] mt-1">Placements</p>
              </div>
              <div className="bg-[#ff9500]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#ff9500]">45+</p>
                <p className="text-sm text-[#6e6e73] mt-1">Departments</p>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-8">
              <Input
                placeholder="Search by position, department, or professor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Positions */}
            <div className="space-y-4">
              {filteredPositions.map(pos => (
                <div key={pos.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-[#1d1d1f]">{pos.title}</h3>
                      <p className="text-sm text-[#6e6e73] mt-1">{pos.department} | {pos.professor}</p>
                      <div className="flex gap-3 mt-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          pos.type === 'paid'
                            ? 'bg-[#34c759]/10 text-[#34c759]'
                            : 'bg-[#0071e3]/10 text-[#0071e3]'
                        }`}>
                          {pos.type === 'paid' ? 'Paid' : 'Credit'}
                        </span>
                        <span className="text-sm text-[#86868b]">{pos.hours}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#86868b]">Deadline: {pos.deadline}</p>
                      <button className="mt-3 px-5 py-2 bg-[#f5f5f7] text-[#1d1d1f] rounded-full text-sm font-medium hover:bg-[#e8e8ed] transition-colors">
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button className="px-6 py-3 bg-[#0071e3] text-white rounded-full font-medium hover:bg-[#0077ed] transition-colors">
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
                <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">Course Registration Reform</h2>
                <p className="text-[#6e6e73] mt-2">Share your registration experiences and help us advocate for improvements</p>
              </div>
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="px-6 py-3 bg-[#0071e3] text-white rounded-full font-medium hover:bg-[#0077ed] transition-colors"
              >
                Submit Feedback
              </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-5 mb-10">
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#0071e3]">1,890</p>
                <p className="text-sm text-[#6e6e73] mt-1">Feedback Submissions</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#34c759]">156</p>
                <p className="text-sm text-[#6e6e73] mt-1">Issues Identified</p>
              </div>
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#af52de]">45</p>
                <p className="text-sm text-[#6e6e73] mt-1">Resolved</p>
              </div>
            </div>

            {/* Common Issues */}
            <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-5">Common Issues We're Addressing</h3>
            <div className="space-y-4 mb-10">
              {[
                { issue: 'Waitlist Transparency', votes: 456, status: 'In Progress' },
                { issue: 'Registration Time Fairness', votes: 389, status: 'Researching' },
                { issue: 'Course Capacity Limits', votes: 312, status: 'Meeting Scheduled' },
                { issue: 'System Crashes During Registration', votes: 287, status: 'Escalated to ITS' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#1d1d1f]">{item.issue}</h4>
                    <p className="text-sm text-[#86868b] mt-1">{item.votes} students affected</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#0071e3]/10 text-[#0071e3]">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Feedback Form Modal */}
            {showFeedbackForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-5">Submit Registration Feedback</h3>
                  <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); setShowFeedbackForm(false); }} className="space-y-5">
                    <Input label="Name (optional)" name="name" value={feedbackForm.name} onChange={e => setFeedbackForm({...feedbackForm, name: e.target.value})} />
                    <Input label="Email (optional)" type="email" name="email" value={feedbackForm.email} onChange={e => setFeedbackForm({...feedbackForm, email: e.target.value})} />
                    <Select label="Issue Type" name="type" value={feedbackForm.type} onChange={e => setFeedbackForm({...feedbackForm, type: e.target.value})} required
                      options={[
                        { value: 'waitlist', label: 'Waitlist Issues' },
                        { value: 'timing', label: 'Registration Timing' },
                        { value: 'capacity', label: 'Course Capacity' },
                        { value: 'technical', label: 'Technical Problems' },
                        { value: 'other', label: 'Other' },
                      ]}
                    />
                    <Textarea label="Describe the Issue" name="details" value={feedbackForm.details} onChange={e => setFeedbackForm({...feedbackForm, details: e.target.value})} required rows={4} />
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="px-6 py-3 bg-[#0071e3] text-white rounded-full font-medium hover:bg-[#0077ed] transition-colors">
                        Submit Feedback
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFeedbackForm(false)}
                        className="px-6 py-3 bg-[#f5f5f7] text-[#1d1d1f] rounded-full font-medium hover:bg-[#e8e8ed] transition-colors"
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
            <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-8">Academic Advising Resources</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-[#1d1d1f] text-lg mb-3">Find Your Advisor</h3>
                <p className="text-sm text-[#6e6e73] mb-5">Look up your assigned academic advisor by department</p>
                <Select
                  options={[
                    { value: 'cas', label: 'College of Arts & Sciences' },
                    { value: 'business', label: 'Kenan-Flagler Business School' },
                    { value: 'journalism', label: 'Hussman School of Journalism' },
                    { value: 'nursing', label: 'School of Nursing' },
                  ]}
                />
                <button className="mt-5 px-5 py-2.5 bg-[#0071e3] text-white rounded-full text-sm font-medium hover:bg-[#0077ed] transition-colors">
                  Search
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-[#1d1d1f] text-lg mb-3">Rate Your Experience</h3>
                <p className="text-sm text-[#6e6e73] mb-5">Help us improve advising by sharing feedback</p>
                <p className="text-sm text-[#6e6e73]">Average Rating: <span className="font-semibold text-[#1d1d1f]">3.8/5.0</span></p>
                <p className="text-sm text-[#86868b]">Based on 456 reviews</p>
                <button className="mt-5 px-5 py-2.5 bg-[#f5f5f7] text-[#1d1d1f] rounded-full text-sm font-medium hover:bg-[#e8e8ed] transition-colors">
                  Leave Review
                </button>
              </div>
            </div>

            {/* Tips */}
            <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-5">Advising Tips</h3>
            <div className="bg-[#0071e3]/10 rounded-2xl p-6">
              <ul className="space-y-3 text-[#1d1d1f]">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#0071e3] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Schedule appointments early, especially before registration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#0071e3] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Bring a list of specific questions and concerns</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#0071e3] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Review degree requirements before your meeting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#0071e3] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Follow up via email to confirm discussed plans</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Syllabus Tab */}
        {activeTab === 'syllabus' && (
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-8">Syllabus Transparency Initiative</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-5 mb-10">
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#0071e3]">890</p>
                <p className="text-sm text-[#6e6e73] mt-1">Syllabi Available</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#34c759]">2,340</p>
                <p className="text-sm text-[#6e6e73] mt-1">Student Reviews</p>
              </div>
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#af52de]">456</p>
                <p className="text-sm text-[#6e6e73] mt-1">Courses Covered</p>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
              <h3 className="font-semibold text-[#1d1d1f] text-lg mb-4">Search Course Syllabi</h3>
              <div className="flex gap-4">
                <Input placeholder="Course code (e.g., COMP 110)" className="flex-1" />
                <button className="px-6 py-3 bg-[#0071e3] text-white rounded-full font-medium hover:bg-[#0077ed] transition-colors">
                  Search
                </button>
              </div>
              <p className="text-sm text-[#86868b] mt-3">Search for past syllabi to help plan your schedule</p>
            </div>

            {/* Note */}
            <div className="bg-[#ff9500]/10 rounded-2xl p-5">
              <p className="text-[#1d1d1f] text-sm">
                <span className="font-semibold">Note:</span> We're working with faculty to make syllabi available before registration.
                Currently, this database includes syllabi from previous semesters.
              </p>
            </div>
          </div>
        )}

        {/* Transfer Tab */}
        {activeTab === 'transfer' && (
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-8">Credit Transfer Portal</h2>

            <div className="bg-white rounded-2xl p-6 shadow-sm mb-10">
              <h3 className="font-semibold text-[#1d1d1f] text-lg mb-5">Check Transfer Equivalencies</h3>
              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <Select label="Transfer Institution" options={[
                  { value: 'ncsu', label: 'NC State University' },
                  { value: 'duke', label: 'Duke University' },
                  { value: 'wcu', label: 'Western Carolina University' },
                  { value: 'uncc', label: 'UNC Charlotte' },
                  { value: 'other', label: 'Other Institution' },
                ]} />
                <Input label="Course Code" placeholder="e.g., ENG 101" />
              </div>
              <button className="px-6 py-3 bg-[#0071e3] text-white rounded-full font-medium hover:bg-[#0077ed] transition-colors">
                Check Equivalency
              </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-5">
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#0071e3]">1,234</p>
                <p className="text-sm text-[#6e6e73] mt-1">Equivalencies Listed</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#34c759]">234</p>
                <p className="text-sm text-[#6e6e73] mt-1">Requests Submitted</p>
              </div>
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#af52de]">81%</p>
                <p className="text-sm text-[#6e6e73] mt-1">Approval Rate</p>
              </div>
            </div>
          </div>
        )}

        {/* All Policies Tab */}
        {activeTab === 'policies' && (
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-8">Academic Affairs Policies</h2>
            <div className="space-y-4">
              {deptPolicies.map(policy => (
                <div key={policy.id} className="bg-white rounded-2xl p-5 shadow-sm">
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
                    <div
                      className="h-full bg-[#0071e3] rounded-full transition-all"
                      style={{ width: `${policy.progress}%` }}
                    />
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
