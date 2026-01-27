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

  return (
    <Layout>
      <Head>
        <title>Academic Affairs | Project Bold</title>
      </Head>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📚</span>
            <h1 className="text-3xl md:text-4xl font-bold">Academic Affairs</h1>
          </div>
          <p className="text-blue-100 max-w-2xl">
            Course registration, advising, research opportunities, and academic success resources.
            Supporting your academic journey at Carolina.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'research', label: 'Research Opportunities' },
              { id: 'registration', label: 'Registration Feedback' },
              { id: 'advising', label: 'Advising Resources' },
              { id: 'syllabus', label: 'Syllabus Database' },
              { id: 'transfer', label: 'Transfer Credits' },
              { id: 'policies', label: 'All Policies' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
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
            <p className="text-green-800 font-medium">Thank you for your feedback! We will review and address your concern.</p>
            <button onClick={() => setSubmitted(false)} className="text-green-600 text-sm mt-2 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Research Opportunities Tab */}
        {activeTab === 'research' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Undergraduate Research Opportunities</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">234</p>
                <p className="text-sm text-gray-600">Open Positions</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">567</p>
                <p className="text-sm text-gray-600">Applications</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">89</p>
                <p className="text-sm text-gray-600">Placements</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">45+</p>
                <p className="text-sm text-gray-600">Departments</p>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
              <Input
                placeholder="Search by position, department, or professor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Positions */}
            <div className="space-y-4">
              {filteredPositions.map(pos => (
                <div key={pos.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-[#13294B]">{pos.title}</h3>
                      <p className="text-sm text-gray-600">{pos.department} | {pos.professor}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className={`px-2 py-0.5 rounded ${pos.type === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {pos.type === 'paid' ? 'Paid' : 'Credit'}
                        </span>
                        <span className="text-gray-500">{pos.hours}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Deadline: {pos.deadline}</p>
                      <Button variant="secondary" className="mt-2">Apply</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Button>View All Positions</Button>
            </div>
          </div>
        )}

        {/* Registration Feedback Tab */}
        {activeTab === 'registration' && (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#13294B]">Course Registration Reform</h2>
                <p className="text-gray-600 mt-1">Share your registration experiences and help us advocate for improvements</p>
              </div>
              <Button onClick={() => setShowFeedbackForm(true)}>Submit Feedback</Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">1,890</p>
                <p className="text-sm text-gray-600">Feedback Submissions</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">156</p>
                <p className="text-sm text-gray-600">Issues Identified</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">45</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>

            {/* Common Issues */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Common Issues We're Addressing</h3>
            <div className="space-y-4 mb-8">
              {[
                { issue: 'Waitlist Transparency', votes: 456, status: 'In Progress' },
                { issue: 'Registration Time Fairness', votes: 389, status: 'Researching' },
                { issue: 'Course Capacity Limits', votes: 312, status: 'Meeting Scheduled' },
                { issue: 'System Crashes During Registration', votes: 287, status: 'Escalated to ITS' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#13294B]">{item.issue}</h4>
                    <p className="text-sm text-gray-500">{item.votes} students affected</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">{item.status}</span>
                </div>
              ))}
            </div>

            {/* Feedback Form Modal */}
            {showFeedbackForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Submit Registration Feedback</h3>
                  <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); setShowFeedbackForm(false); }} className="space-y-4">
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
                    <div className="flex gap-3">
                      <Button type="submit">Submit Feedback</Button>
                      <Button variant="secondary" onClick={() => setShowFeedbackForm(false)}>Cancel</Button>
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
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Academic Advising Resources</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#13294B] mb-4">Find Your Advisor</h3>
                <p className="text-sm text-gray-600 mb-4">Look up your assigned academic advisor by department</p>
                <Select
                  options={[
                    { value: 'cas', label: 'College of Arts & Sciences' },
                    { value: 'business', label: 'Kenan-Flagler Business School' },
                    { value: 'journalism', label: 'Hussman School of Journalism' },
                    { value: 'nursing', label: 'School of Nursing' },
                  ]}
                />
                <Button className="mt-4">Search</Button>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#13294B] mb-4">Rate Your Experience</h3>
                <p className="text-sm text-gray-600 mb-4">Help us improve advising by sharing feedback</p>
                <p className="text-sm text-gray-500">Average Rating: <span className="font-bold text-[#13294B]">3.8/5.0</span></p>
                <p className="text-sm text-gray-500">Based on 456 reviews</p>
                <Button variant="secondary" className="mt-4">Leave Review</Button>
              </div>
            </div>

            {/* Tips */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Advising Tips</h3>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <ul className="space-y-2 text-blue-800">
                <li>• Schedule appointments early, especially before registration</li>
                <li>• Bring a list of specific questions and concerns</li>
                <li>• Review degree requirements before your meeting</li>
                <li>• Follow up via email to confirm discussed plans</li>
              </ul>
            </div>
          </div>
        )}

        {/* Syllabus Tab */}
        {activeTab === 'syllabus' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Syllabus Transparency Initiative</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">890</p>
                <p className="text-sm text-gray-600">Syllabi Available</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">2,340</p>
                <p className="text-sm text-gray-600">Student Reviews</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">456</p>
                <p className="text-sm text-gray-600">Courses Covered</p>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h3 className="font-bold text-[#13294B] mb-4">Search Course Syllabi</h3>
              <div className="flex gap-4">
                <Input placeholder="Course code (e.g., COMP 110)" className="flex-1" />
                <Button>Search</Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">Search for past syllabi to help plan your schedule</p>
            </div>

            {/* Note */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> We're working with faculty to make syllabi available before registration.
                Currently, this database includes syllabi from previous semesters.
              </p>
            </div>
          </div>
        )}

        {/* Transfer Tab */}
        {activeTab === 'transfer' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Credit Transfer Portal</h2>

            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h3 className="font-bold text-[#13294B] mb-4">Check Transfer Equivalencies</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Select label="Transfer Institution" options={[
                  { value: 'ncsu', label: 'NC State University' },
                  { value: 'duke', label: 'Duke University' },
                  { value: 'wcu', label: 'Western Carolina University' },
                  { value: 'uncc', label: 'UNC Charlotte' },
                  { value: 'other', label: 'Other Institution' },
                ]} />
                <Input label="Course Code" placeholder="e.g., ENG 101" />
              </div>
              <Button>Check Equivalency</Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">1,234</p>
                <p className="text-sm text-gray-600">Equivalencies Listed</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">234</p>
                <p className="text-sm text-gray-600">Requests Submitted</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">81%</p>
                <p className="text-sm text-gray-600">Approval Rate</p>
              </div>
            </div>
          </div>
        )}

        {/* All Policies Tab */}
        {activeTab === 'policies' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Academic Affairs Policies</h2>
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
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${policy.progress}%` }} />
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
