import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { departmentContacts, departmentFAQs, departmentAnnouncements, serviceGuides } from '../../lib/data'
import { Editable, EditModeToggle } from '../../components/InlineEditor'

export default function AcademicPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showMentorModal, setShowMentorModal] = useState(false)
  const [showCenterModal, setShowCenterModal] = useState(false)
  const [mentorForm, setMentorForm] = useState({ name: '', email: '', subject: '', description: '' })
  const [centerForm, setCenterForm] = useState({ date: '', time: '', center: '', groupSize: '' })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const { policies } = useApp()

  const deptPolicies = policies.filter(p => p.department === 'academic')
  const getPolicy = (id) => deptPolicies.find(p => p.id === id)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'peer-mentorship', label: 'Peer Mentorship' },
    { id: 'midterm-checkins', label: 'Midterm Check-Ins' },
    { id: 'stem-centers', label: 'STEM Centers' },
    { id: 'deans-list', label: "Dean's List" },
    { id: 'strengths', label: 'Strengths Assessment' },
    { id: 'faq', label: 'FAQ & Contact' },
  ]

  const contact = departmentContacts.academic
  const faqs = departmentFAQs.academic
  const announcements = departmentAnnouncements.academic
  const mentorGuide = serviceGuides['peer-mentor']
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [feedbackForm, setFeedbackForm] = useState({ topic: '', message: '', email: '' })
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleFeedbackSubmit = (e) => {
    e.preventDefault()
    setFeedbackSubmitted(true)
    setFeedbackForm({ topic: '', message: '', email: '' })
  }

  const handleMentorSubmit = (e) => {
    e.preventDefault()
    setFormSubmitted(true)
    setShowMentorModal(false)
    setMentorForm({ name: '', email: '', subject: '', description: '' })
  }

  const handleCenterSubmit = (e) => {
    e.preventDefault()
    setFormSubmitted(true)
    setShowCenterModal(false)
    setCenterForm({ date: '', time: '', center: '', groupSize: '' })
  }

  const PolicyProgress = ({ policy }) => (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#f0f6fc] mb-1">{policy?.title}</h3>
          <p className="text-sm text-[#8b949e]">{policy?.description?.slice(0, 150)}...</p>
        </div>
        <span className={`px-2.5 py-1 rounded text-xs font-mono border flex-shrink-0 ml-4 ${
          policy?.status === 'in_progress'
            ? 'border-[#388bfd] text-[#388bfd] bg-[#388bfd]/10'
            : policy?.status === 'completed'
            ? 'border-[#3fb950] text-[#3fb950] bg-[#3fb950]/10'
            : 'border-[#6e7681] text-[#6e7681] bg-[#6e7681]/10'
        }`}>
          {policy?.status === 'in_progress' ? 'IN PROGRESS' : policy?.status === 'completed' ? 'COMPLETED' : 'PLANNED'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-[#21262d] rounded overflow-hidden">
          <div
            className="h-full bg-[#388bfd] rounded transition-all"
            style={{ width: `${policy?.progress || 0}%` }}
          />
        </div>
        <span className="text-[#8b949e] font-mono text-sm">{policy?.progress || 0}%</span>
      </div>
    </div>
  )

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
            <Editable k="academic.hero.label">Academic Affairs</Editable>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#f0f6fc] mb-4">
            <Editable k="academic.hero.title">Academic Affairs</Editable>
          </h1>
          <p className="text-lg text-[#8b949e] max-w-2xl">
            <Editable k="academic.hero.description" multiline>Peer mentorship, midterm check-ins, STEM study centers, and academic success resources. Supporting your academic journey at Carolina.</Editable>
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
          {formSubmitted && (
            <div className="mb-8 bg-[#161b22] border border-[#238636] rounded-lg p-5">
              <p className="text-[#f0f6fc] font-medium">Your request has been submitted! We'll be in touch soon.</p>
              <button onClick={() => setFormSubmitted(false)} className="text-[#388bfd] text-sm mt-2 hover:underline">Dismiss</button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-8">Academic Affairs Overview</h2>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#388bfd]">{deptPolicies.length}</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Active Initiatives</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">
                    {deptPolicies.filter(p => p.status === 'in_progress').length}
                  </p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">In Progress</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">
                    {Math.round(deptPolicies.reduce((sum, p) => sum + (p.progress || 0), 0) / deptPolicies.length) || 0}%
                  </p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Avg Progress</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#d29922]">5</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Policy Areas</p>
                </div>
              </div>

              {/* All Policies */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">All Academic Policies</h3>
              <div className="space-y-4">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#f0f6fc]">{policy.title}</h4>
                        <p className="text-sm text-[#8b949e] mt-1">{policy.description}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-xs font-medium border ml-4 ${
                        policy.status === 'in_progress'
                          ? 'border-[#388bfd] text-[#388bfd] bg-[#388bfd]/10'
                          : 'border-[#30363d] text-[#6e7681] bg-[#21262d]'
                      }`}>
                        {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#388bfd] rounded-full transition-all"
                        style={{ width: `${policy.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#6e7681] mt-2 font-mono">{policy.progress}% complete</p>
                  </div>
                ))}
              </div>

              {/* Announcements */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mt-10 mb-5 uppercase tracking-wide">Recent Updates</h3>
              <div className="space-y-3">
                {announcements.map(ann => (
                  <div key={ann.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-start gap-4">
                    <div className={`px-2 py-1 rounded text-xs font-mono ${
                      ann.type === 'event' ? 'bg-[#388bfd]/10 text-[#388bfd] border border-[#388bfd]' :
                      ann.type === 'deadline' ? 'bg-[#f85149]/10 text-[#f85149] border border-[#f85149]' :
                      'bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]'
                    }`}>
                      {ann.type.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-[#f0f6fc]">{ann.title}</h4>
                        <span className="text-xs text-[#6e7681] font-mono">{ann.date}</span>
                      </div>
                      <p className="text-sm text-[#8b949e]">{ann.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Peer Mentorship Tab */}
          {activeTab === 'peer-mentorship' && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-4">Peer Mentorship Network</h2>
              <PolicyProgress policy={getPolicy('peer-mentorship')} />

              {/* Features */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#388bfd]/20 border border-[#388bfd]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-2">Find a Mentor</h3>
                  <p className="text-sm text-[#8b949e] mb-4">Connect with trained peer mentors across all subjects. Get personalized guidance and support for your academic journey.</p>
                  <button
                    onClick={() => setShowMentorModal(true)}
                    className="px-5 py-2.5 bg-[#388bfd] text-white rounded text-sm font-medium hover:bg-[#58a6ff] transition-colors"
                  >
                    Request a Mentor
                  </button>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#3fb950]/20 border border-[#3fb950]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-2">Become a Mentor</h3>
                  <p className="text-sm text-[#8b949e] mb-4">Share your expertise and help fellow students succeed. Gain leadership experience and make a difference.</p>
                  <button className="px-5 py-2.5 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded text-sm font-medium hover:bg-[#30363d] transition-colors">
                    Apply to Mentor
                  </button>
                </div>
              </div>

              {/* Subject Areas */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Subject Areas</h3>
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                {['STEM', 'Humanities', 'Social Sciences', 'Business', 'Health Sciences', 'Arts', 'Languages', 'Pre-Professional'].map(subject => (
                  <div key={subject} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center hover:border-[#388bfd] transition-colors cursor-pointer">
                    <p className="text-[#f0f6fc] font-medium">{subject}</p>
                    <p className="text-xs text-[#6e7681] mt-1">View mentors</p>
                  </div>
                ))}
              </div>

              {/* How It Works */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">{mentorGuide.title}</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {mentorGuide.steps.map((step) => (
                  <div key={step.step} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 relative">
                    <div className="absolute -top-3 left-4 bg-[#388bfd] text-white text-xs font-bold px-2 py-1 rounded">
                      Step {step.step}
                    </div>
                    <h4 className="font-semibold text-[#f0f6fc] mt-2 mb-2">{step.title}</h4>
                    <p className="text-sm text-[#8b949e]">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Midterm Check-Ins Tab */}
          {activeTab === 'midterm-checkins' && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-4">Midterm Progress Check-Ins</h2>
              <PolicyProgress policy={getPolicy('midterm-checkins')} />

              {/* Key Info */}
              <div className="bg-[#161b22] border border-[#388bfd]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#388bfd] text-lg mb-3">What Are Midterm Check-Ins?</h3>
                <p className="text-[#8b949e] mb-4">
                  Midterm Progress Check-ins help you understand your academic standing before final grades are issued.
                  Receive timely feedback so you can address challenges early and make informed decisions about your courses.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                    <p className="text-2xl font-semibold font-mono text-[#388bfd]">Week 8</p>
                    <p className="text-sm text-[#6e7681]">Check-in Period</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                    <p className="text-2xl font-semibold font-mono text-[#3fb950]">48hrs</p>
                    <p className="text-sm text-[#6e7681]">Report Delivery</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                    <p className="text-2xl font-semibold font-mono text-[#a371f7]">100%</p>
                    <p className="text-sm text-[#6e7681]">Coverage Goal</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Features</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h4 className="font-semibold text-[#f0f6fc] mb-3">Progress Portal</h4>
                  <p className="text-sm text-[#8b949e] mb-4">View your midterm progress reports, grade projections, and instructor feedback in one central location.</p>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li className="flex items-center gap-2"><span className="text-[#388bfd]">→</span> Course-by-course breakdown</li>
                    <li className="flex items-center gap-2"><span className="text-[#388bfd]">→</span> Grade trend analysis</li>
                    <li className="flex items-center gap-2"><span className="text-[#388bfd]">→</span> Instructor comments</li>
                  </ul>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h4 className="font-semibold text-[#f0f6fc] mb-3">Early Intervention</h4>
                  <p className="text-sm text-[#8b949e] mb-4">If your progress indicates concerns, you'll receive personalized resource recommendations and advisor alerts.</p>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">→</span> Automatic advisor notification</li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">→</span> Tutoring recommendations</li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">→</span> Study strategy resources</li>
                  </ul>
                </div>
              </div>

              {/* Timeline */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Timeline</h3>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <div className="space-y-4">
                  {[
                    { week: 'Week 6-7', event: 'Instructors submit progress indicators', status: 'upcoming' },
                    { week: 'Week 8', event: 'Progress reports delivered to students', status: 'upcoming' },
                    { week: 'Week 8-9', event: 'Advisor meetings for at-risk students', status: 'upcoming' },
                    { week: 'Week 10', event: 'Last day to withdraw without penalty', status: 'upcoming' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-24 flex-shrink-0">
                        <span className="text-sm font-mono text-[#388bfd]">{item.week}</span>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-[#388bfd] flex-shrink-0" />
                      <p className="text-[#f0f6fc]">{item.event}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEM Centers Tab */}
          {activeTab === 'stem-centers' && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-4">STEM Collaboration Centers</h2>
              <PolicyProgress policy={getPolicy('stem-centers')} />

              {/* Key Features */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#388bfd]">24/7</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Access Hours</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">Tutors</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Until Midnight</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">Free</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">For All Students</p>
                </div>
              </div>

              {/* Centers */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Planned Locations</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {[
                  { name: 'Chemistry Study Center', building: 'Kenan Labs', subjects: ['CHEM 101/102', 'CHEM 241/261', 'Organic Chemistry'] },
                  { name: 'Physics Study Center', building: 'Phillips Hall', subjects: ['PHYS 114/115', 'PHYS 116/117', 'Mechanics & E&M'] },
                  { name: 'Math Study Center', building: 'Chapman Hall', subjects: ['MATH 231/232', 'MATH 233', 'Linear Algebra'] },
                  { name: 'Biology Study Center', building: 'Coker Hall', subjects: ['BIOL 101/102', 'BIOL 201/202', 'Genetics'] },
                ].map((center, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h4 className="font-semibold text-[#f0f6fc] text-lg">{center.name}</h4>
                    <p className="text-sm text-[#8b949e] mt-1">{center.building}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {center.subjects.map((subj, j) => (
                        <span key={j} className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#8b949e]">
                          {subj}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowCenterModal(true)}
                      className="mt-4 px-4 py-2 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded text-sm font-medium hover:bg-[#30363d] transition-colors"
                    >
                      Reserve Space
                    </button>
                  </div>
                ))}
              </div>

              {/* Services */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Available Services</h3>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-[#f0f6fc] mb-3">Peer Tutoring</h4>
                    <ul className="space-y-2 text-sm text-[#8b949e]">
                      <li>• Drop-in tutoring hours</li>
                      <li>• One-on-one appointments</li>
                      <li>• Exam review sessions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#f0f6fc] mb-3">Study Spaces</h4>
                    <ul className="space-y-2 text-sm text-[#8b949e]">
                      <li>• Group study rooms</li>
                      <li>• Quiet individual desks</li>
                      <li>• Whiteboards & supplies</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#f0f6fc] mb-3">Resources</h4>
                    <ul className="space-y-2 text-sm text-[#8b949e]">
                      <li>• Practice problems</li>
                      <li>• Past exam files</li>
                      <li>• Online resources</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dean's List Tab */}
          {activeTab === 'deans-list' && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-4">Dean's List Enhancement</h2>
              <PolicyProgress policy={getPolicy('deans-list')} />

              {/* Current vs Proposed */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#f85149]/30 rounded-lg p-6">
                  <h3 className="font-semibold text-[#f85149] text-lg mb-4">Current Process</h3>
                  <ul className="space-y-3 text-sm text-[#8b949e]">
                    <li className="flex items-start gap-3">
                      <span className="text-[#f85149]">✗</span>
                      <span>Notifications sent 4-6 weeks after grades post</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#f85149]">✗</span>
                      <span>No official digital certificate</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#f85149]">✗</span>
                      <span>Limited recognition options</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#f85149]">✗</span>
                      <span>Hard to share achievement professionally</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6">
                  <h3 className="font-semibold text-[#3fb950] text-lg mb-4">Proposed Improvements</h3>
                  <ul className="space-y-3 text-sm text-[#8b949e]">
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">✓</span>
                      <span>Notifications within 2 weeks of grades</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">✓</span>
                      <span>Official digital certificates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">✓</span>
                      <span>LinkedIn badge integration</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">✓</span>
                      <span>Recognition portal & ceremony</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Requirements */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Dean's List Requirements</h3>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-10">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-semibold font-mono text-[#388bfd]">3.5+</p>
                    <p className="text-sm text-[#6e7681] mt-2">Semester GPA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-semibold font-mono text-[#3fb950]">12+</p>
                    <p className="text-sm text-[#6e7681] mt-2">Credit Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-semibold font-mono text-[#a371f7]">No</p>
                    <p className="text-sm text-[#6e7681] mt-2">Incompletes</p>
                  </div>
                </div>
              </div>

              {/* Digital Features */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Planned Digital Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {(getPolicy('deans-list')?.digitalFeatures || []).map((feature, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#388bfd]/20 border border-[#388bfd]/40 rounded-lg flex items-center justify-center">
                      <span className="text-[#388bfd]">◆</span>
                    </div>
                    <span className="text-[#f0f6fc] capitalize">{feature.replace(/-/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths Assessment Tab */}
          {activeTab === 'strengths' && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-4">First-Year Strengths Integration</h2>
              <PolicyProgress policy={getPolicy('strengths-integration')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#388bfd]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#388bfd] text-lg mb-3">What is the Gallup Strengths Assessment?</h3>
                <p className="text-[#8b949e] mb-4">
                  The CliftonStrengths assessment (formerly StrengthsFinder) identifies your top talent themes
                  to help you understand how you naturally think, feel, and behave. Over 1,000 colleges including
                  UT Knoxville, Purdue, and Virginia Tech use this model to help students discover their potential.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['UT Knoxville', 'Purdue', 'Virginia Tech', '1,000+ Colleges'].map((school, i) => (
                    <span key={i} className="px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#8b949e]">
                      {school}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Benefits for Students</h3>
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#388bfd]/20 border border-[#388bfd]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h4 className="font-semibold text-[#f0f6fc] mb-2">Self-Discovery</h4>
                  <p className="text-sm text-[#8b949e]">Identify your natural talents and understand how they can be developed into strengths.</p>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#3fb950]/20 border border-[#3fb950]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🧭</span>
                  </div>
                  <h4 className="font-semibold text-[#f0f6fc] mb-2">Career Pathways</h4>
                  <p className="text-sm text-[#8b949e]">Get personalized recommendations for majors and careers that align with your strengths.</p>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#a371f7]/20 border border-[#a371f7]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h4 className="font-semibold text-[#f0f6fc] mb-2">Team Building</h4>
                  <p className="text-sm text-[#8b949e]">Understand how to work effectively with others by recognizing complementary strengths.</p>
                </div>
              </div>

              {/* Top Themes */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">34 CliftonStrengths Themes</h3>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold text-[#388bfd] text-sm uppercase tracking-wide mb-3">Executing</h4>
                    <ul className="space-y-1 text-sm text-[#8b949e]">
                      <li>Achiever</li>
                      <li>Arranger</li>
                      <li>Belief</li>
                      <li>Consistency</li>
                      <li>Deliberative</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3fb950] text-sm uppercase tracking-wide mb-3">Influencing</h4>
                    <ul className="space-y-1 text-sm text-[#8b949e]">
                      <li>Activator</li>
                      <li>Command</li>
                      <li>Communication</li>
                      <li>Competition</li>
                      <li>Maximizer</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#a371f7] text-sm uppercase tracking-wide mb-3">Relationship</h4>
                    <ul className="space-y-1 text-sm text-[#8b949e]">
                      <li>Adaptability</li>
                      <li>Connectedness</li>
                      <li>Developer</li>
                      <li>Empathy</li>
                      <li>Includer</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#d29922] text-sm uppercase tracking-wide mb-3">Strategic</h4>
                    <ul className="space-y-1 text-sm text-[#8b949e]">
                      <li>Analytical</li>
                      <li>Context</li>
                      <li>Futuristic</li>
                      <li>Ideation</li>
                      <li>Strategic</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ & Contact Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div>
                  <h2 className="text-2xl font-semibold text-[#f0f6fc] tracking-tight mb-6">Contact Us</h2>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#388bfd]/20 border border-[#388bfd]/40 rounded-full flex items-center justify-center">
                        <span className="text-xl">👤</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">{contact.lead.name}</p>
                        <p className="text-sm text-[#8b949e]">{contact.lead.title}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">📍</span>
                        <span className="text-[#f0f6fc]">{contact.office}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">🕐</span>
                        <span className="text-[#f0f6fc]">{contact.hours}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">📧</span>
                        <a href={`mailto:${contact.lead.email}`} className="text-[#388bfd] hover:underline">{contact.lead.email}</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">📱</span>
                        <span className="text-[#f0f6fc]">{contact.socialMedia}</span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Form */}
                  <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h3 className="font-semibold text-[#f0f6fc] mb-4">Send Feedback</h3>
                    {feedbackSubmitted ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-[#388bfd]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">✓</span>
                        </div>
                        <p className="text-[#388bfd] font-medium">Thanks for your feedback!</p>
                        <button onClick={() => setFeedbackSubmitted(false)} className="text-[#58a6ff] text-sm mt-2 hover:underline">Send another</button>
                      </div>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                        <Select label="Topic" name="topic" value={feedbackForm.topic} onChange={e => setFeedbackForm({...feedbackForm, topic: e.target.value})} required
                          options={[
                            { value: 'mentorship', label: 'Peer Mentorship' },
                            { value: 'midterms', label: 'Midterm Check-Ins' },
                            { value: 'stem-centers', label: 'STEM Centers' },
                            { value: 'deans-list', label: "Dean's List" },
                            { value: 'strengths', label: 'Strengths Assessment' },
                            { value: 'other', label: 'Other' },
                          ]}
                        />
                        <Textarea label="Message" name="message" value={feedbackForm.message} onChange={e => setFeedbackForm({...feedbackForm, message: e.target.value})} required rows={3} />
                        <Input label="Email (optional)" type="email" name="email" value={feedbackForm.email} onChange={e => setFeedbackForm({...feedbackForm, email: e.target.value})} />
                        <button type="submit" className="w-full bg-[#388bfd] text-white px-4 py-2.5 rounded font-semibold hover:bg-[#58a6ff] transition-colors">
                          Submit Feedback
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h2 className="text-2xl font-semibold text-[#f0f6fc] tracking-tight mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                          className="w-full text-left p-4 flex items-center justify-between hover:bg-[#21262d] transition-colors"
                        >
                          <span className="font-medium text-[#f0f6fc] pr-4">{faq.q}</span>
                          <span className="text-[#8b949e] flex-shrink-0">{expandedFaq === i ? '−' : '+'}</span>
                        </button>
                        {expandedFaq === i && (
                          <div className="px-4 pb-4 text-[#8b949e] text-sm border-t border-[#30363d] pt-3">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Announcements */}
              <div>
                <h3 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-4">Recent Updates</h3>
                <div className="space-y-3">
                  {announcements.map(ann => (
                    <div key={ann.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-start gap-4">
                      <div className={`px-2 py-1 rounded text-xs font-mono ${
                        ann.type === 'event' ? 'bg-[#388bfd]/10 text-[#388bfd] border border-[#388bfd]' :
                        ann.type === 'deadline' ? 'bg-[#f85149]/10 text-[#f85149] border border-[#f85149]' :
                        'bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]'
                      }`}>
                        {ann.type.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-[#f0f6fc]">{ann.title}</h4>
                          <span className="text-xs text-[#6e7681] font-mono">{ann.date}</span>
                        </div>
                        <p className="text-sm text-[#8b949e]">{ann.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mentor Request Modal */}
      {showMentorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5">Request a Peer Mentor</h3>
            <form onSubmit={handleMentorSubmit} className="space-y-5">
              <Input label="Your Name" name="name" value={mentorForm.name} onChange={e => setMentorForm({...mentorForm, name: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <Input label="Email" type="email" name="email" value={mentorForm.email} onChange={e => setMentorForm({...mentorForm, email: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <Select label="Subject Area" name="subject" value={mentorForm.subject} onChange={e => setMentorForm({...mentorForm, subject: e.target.value})} required
                options={[
                  { value: 'stem', label: 'STEM' },
                  { value: 'humanities', label: 'Humanities' },
                  { value: 'social-sciences', label: 'Social Sciences' },
                  { value: 'business', label: 'Business' },
                  { value: 'health', label: 'Health Sciences' },
                  { value: 'arts', label: 'Arts' },
                  { value: 'other', label: 'Other' },
                ]}
                className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
              />
              <Textarea label="What do you need help with?" name="description" value={mentorForm.description} onChange={e => setMentorForm({...mentorForm, description: e.target.value})} required rows={3} className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-3 bg-[#388bfd] text-white rounded font-medium hover:bg-[#58a6ff] transition-colors">
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowMentorModal(false)}
                  className="px-6 py-3 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded font-medium hover:bg-[#30363d] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Center Reservation Modal */}
      {showCenterModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5">Reserve Study Space</h3>
            <form onSubmit={handleCenterSubmit} className="space-y-5">
              <Select label="Study Center" name="center" value={centerForm.center} onChange={e => setCenterForm({...centerForm, center: e.target.value})} required
                options={[
                  { value: 'chemistry', label: 'Chemistry Study Center - Kenan Labs' },
                  { value: 'physics', label: 'Physics Study Center - Phillips Hall' },
                  { value: 'math', label: 'Math Study Center - Chapman Hall' },
                  { value: 'biology', label: 'Biology Study Center - Coker Hall' },
                ]}
                className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
              />
              <Input label="Date" type="date" name="date" value={centerForm.date} onChange={e => setCenterForm({...centerForm, date: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <Select label="Time Slot" name="time" value={centerForm.time} onChange={e => setCenterForm({...centerForm, time: e.target.value})} required
                options={[
                  { value: '9am', label: '9:00 AM - 11:00 AM' },
                  { value: '11am', label: '11:00 AM - 1:00 PM' },
                  { value: '1pm', label: '1:00 PM - 3:00 PM' },
                  { value: '3pm', label: '3:00 PM - 5:00 PM' },
                  { value: '5pm', label: '5:00 PM - 7:00 PM' },
                  { value: '7pm', label: '7:00 PM - 9:00 PM' },
                  { value: '9pm', label: '9:00 PM - 11:00 PM' },
                ]}
                className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
              />
              <Select label="Group Size" name="groupSize" value={centerForm.groupSize} onChange={e => setCenterForm({...centerForm, groupSize: e.target.value})} required
                options={[
                  { value: '1', label: 'Individual' },
                  { value: '2-3', label: '2-3 people' },
                  { value: '4-6', label: '4-6 people' },
                  { value: '7+', label: '7+ people' },
                ]}
                className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
              />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-3 bg-[#388bfd] text-white rounded font-medium hover:bg-[#58a6ff] transition-colors">
                  Reserve Space
                </button>
                <button
                  type="button"
                  onClick={() => setShowCenterModal(false)}
                  className="px-6 py-3 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded font-medium hover:bg-[#30363d] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <EditModeToggle />
    </Layout>
  )
}
