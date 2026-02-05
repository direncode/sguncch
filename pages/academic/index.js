import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { departmentContacts, departmentFAQs, departmentAnnouncements, serviceGuides } from '../../lib/data'
import { Editable, EditModeToggle } from '../../components/InlineEditor'
import {
  submitForm,
  emailTemplates,
  externalLinks,
} from '../../lib/integrations'

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await submitForm('academic-feedback', {
        ...feedbackForm,
        department: 'academic',
        timestamp: new Date().toISOString(),
      })
      setFeedbackSubmitted(true)
      setFeedbackForm({ topic: '', message: '', email: '' })
    } catch (error) {
      console.error('Feedback submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
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
              <p className="text-[#f0f6fc] font-medium"><Editable k="academic.formSubmitted.message">Your request has been submitted! We'll be in touch soon.</Editable></p>
              <button onClick={() => setFormSubmitted(false)} className="text-[#388bfd] text-sm mt-2 hover:underline"><Editable k="academic.formSubmitted.dismiss">Dismiss</Editable></button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-8"><Editable k="academic.overview.title">Academic Affairs Overview</Editable></h2>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#388bfd]">{deptPolicies.length}</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="academic.overview.stats.initiatives">Active Initiatives</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">
                    {deptPolicies.filter(p => p.status === 'in_progress').length}
                  </p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="academic.overview.stats.inProgress">In Progress</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">
                    {Math.round(deptPolicies.reduce((sum, p) => sum + (p.progress || 0), 0) / deptPolicies.length) || 0}%
                  </p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="academic.overview.stats.avgProgress">Avg Progress</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#d29922]">5</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="academic.overview.stats.policyAreas">Policy Areas</Editable></p>
                </div>
              </div>

              {/* All Policies */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="academic.overview.policiesTitle">All Academic Policies</Editable></h3>
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
                    <p className="text-xs text-[#6e7681] mt-2 font-mono">{policy.progress}% <Editable k="academic.overview.complete">complete</Editable></p>
                  </div>
                ))}
              </div>

              {/* Announcements */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mt-10 mb-5 uppercase tracking-wide"><Editable k="academic.overview.updatesTitle">Recent Updates</Editable></h3>
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
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-4"><Editable k="academic.mentorship.title">Peer Mentorship Network</Editable></h2>
              <PolicyProgress policy={getPolicy('peer-mentorship')} />

              {/* Features */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#388bfd]/20 border border-[#388bfd]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl"></span>
                  </div>
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-2"><Editable k="academic.mentorship.findMentor.title">Find a Mentor</Editable></h3>
                  <p className="text-sm text-[#8b949e] mb-4"><Editable k="academic.mentorship.findMentor.description" multiline>Connect with trained peer mentors across all subjects. Get personalized guidance and support for your academic journey.</Editable></p>
                  <a
                    href={emailTemplates.mentorRequest}
                    className="inline-block px-5 py-2.5 bg-[#388bfd] text-white rounded text-sm font-medium hover:bg-[#58a6ff] transition-colors"
                  >
                    <Editable k="academic.mentorship.findMentor.button">Request a Mentor</Editable>
                  </a>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#3fb950]/20 border border-[#3fb950]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl"></span>
                  </div>
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-2"><Editable k="academic.mentorship.becomeMentor.title">Become a Mentor</Editable></h3>
                  <p className="text-sm text-[#8b949e] mb-4"><Editable k="academic.mentorship.becomeMentor.description" multiline>Share your expertise and help fellow students succeed. Gain leadership experience and make a difference.</Editable></p>
                  <button className="px-5 py-2.5 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded text-sm font-medium hover:bg-[#30363d] transition-colors">
                    <Editable k="academic.mentorship.becomeMentor.button">Apply to Mentor</Editable>
                  </button>
                </div>
              </div>

              {/* Subject Areas */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="academic.mentorship.subjectAreasTitle">Subject Areas</Editable></h3>
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                {['STEM', 'Humanities', 'Social Sciences', 'Business', 'Health Sciences', 'Arts', 'Languages', 'Pre-Professional'].map(subject => (
                  <div key={subject} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center hover:border-[#388bfd] transition-colors cursor-pointer">
                    <p className="text-[#f0f6fc] font-medium">{subject}</p>
                    <p className="text-xs text-[#6e7681] mt-1"><Editable k="academic.mentorship.viewMentors">View mentors</Editable></p>
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
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-4"><Editable k="academic.checkins.title">Midterm Progress Check-Ins</Editable></h2>
              <PolicyProgress policy={getPolicy('midterm-checkins')} />

              {/* Key Info */}
              <div className="bg-[#161b22] border border-[#388bfd]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#388bfd] text-lg mb-3"><Editable k="academic.checkins.whatAre.title">What Are Midterm Check-Ins?</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="academic.checkins.whatAre.description" multiline>Midterm Progress Check-ins help you understand your academic standing before final grades are issued.
                  Receive timely feedback so you can address challenges early and make informed decisions about your courses.</Editable>
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                    <p className="text-2xl font-semibold font-mono text-[#388bfd]"><Editable k="academic.checkins.stats.week">Week 8</Editable></p>
                    <p className="text-sm text-[#6e7681]"><Editable k="academic.checkins.stats.weekLabel">Check-in Period</Editable></p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                    <p className="text-2xl font-semibold font-mono text-[#3fb950]"><Editable k="academic.checkins.stats.hours">48hrs</Editable></p>
                    <p className="text-sm text-[#6e7681]"><Editable k="academic.checkins.stats.hoursLabel">Report Delivery</Editable></p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                    <p className="text-2xl font-semibold font-mono text-[#a371f7]"><Editable k="academic.checkins.stats.coverage">100%</Editable></p>
                    <p className="text-sm text-[#6e7681]"><Editable k="academic.checkins.stats.coverageLabel">Coverage Goal</Editable></p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="academic.checkins.featuresTitle">Features</Editable></h3>
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h4 className="font-semibold text-[#f0f6fc] mb-3"><Editable k="academic.checkins.portal.title">Progress Portal</Editable></h4>
                  <p className="text-sm text-[#8b949e] mb-4"><Editable k="academic.checkins.portal.description" multiline>View your midterm progress reports, grade projections, and instructor feedback in one central location.</Editable></p>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li className="flex items-center gap-2"><span className="text-[#388bfd]">&gt;</span> <Editable k="academic.checkins.portal.item1">Course-by-course breakdown</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#388bfd]">&gt;</span> <Editable k="academic.checkins.portal.item2">Grade trend analysis</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#388bfd]">&gt;</span> <Editable k="academic.checkins.portal.item3">Instructor comments</Editable></li>
                  </ul>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h4 className="font-semibold text-[#f0f6fc] mb-3"><Editable k="academic.checkins.intervention.title">Early Intervention</Editable></h4>
                  <p className="text-sm text-[#8b949e] mb-4"><Editable k="academic.checkins.intervention.description" multiline>If your progress indicates concerns, you'll receive personalized resource recommendations and advisor alerts.</Editable></p>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">&gt;</span> <Editable k="academic.checkins.intervention.item1">Automatic advisor notification</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">&gt;</span> <Editable k="academic.checkins.intervention.item2">Tutoring recommendations</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">&gt;</span> <Editable k="academic.checkins.intervention.item3">Study strategy resources</Editable></li>
                  </ul>
                </div>
              </div>

              {/* Timeline */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="academic.checkins.timelineTitle">Timeline</Editable></h3>
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
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-4"><Editable k="academic.stemCenters.title">STEM Collaboration Centers</Editable></h2>
              <PolicyProgress policy={getPolicy('stem-centers')} />

              {/* Key Features */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#388bfd]"><Editable k="academic.stemCenters.stats.hours">24/7</Editable></p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="academic.stemCenters.stats.hoursLabel">Access Hours</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]"><Editable k="academic.stemCenters.stats.tutors">Tutors</Editable></p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="academic.stemCenters.stats.tutorsLabel">Until Midnight</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]"><Editable k="academic.stemCenters.stats.free">Free</Editable></p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="academic.stemCenters.stats.freeLabel">For All Students</Editable></p>
                </div>
              </div>

              {/* Centers */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="academic.stemCenters.locationsTitle">Planned Locations</Editable></h3>
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
                      <Editable k="academic.stemCenters.reserveButton">Reserve Space</Editable>
                    </button>
                  </div>
                ))}
              </div>

              {/* Services */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="academic.stemCenters.servicesTitle">Available Services</Editable></h3>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-[#f0f6fc] mb-3"><Editable k="academic.stemCenters.services.tutoring.title">Peer Tutoring</Editable></h4>
                    <ul className="space-y-2 text-sm text-[#8b949e]">
                      <li><Editable k="academic.stemCenters.services.tutoring.item1">- Drop-in tutoring hours</Editable></li>
                      <li><Editable k="academic.stemCenters.services.tutoring.item2">- One-on-one appointments</Editable></li>
                      <li><Editable k="academic.stemCenters.services.tutoring.item3">- Exam review sessions</Editable></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#f0f6fc] mb-3"><Editable k="academic.stemCenters.services.spaces.title">Study Spaces</Editable></h4>
                    <ul className="space-y-2 text-sm text-[#8b949e]">
                      <li><Editable k="academic.stemCenters.services.spaces.item1">- Group study rooms</Editable></li>
                      <li><Editable k="academic.stemCenters.services.spaces.item2">- Quiet individual desks</Editable></li>
                      <li><Editable k="academic.stemCenters.services.spaces.item3">- Whiteboards & supplies</Editable></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#f0f6fc] mb-3"><Editable k="academic.stemCenters.services.resources.title">Resources</Editable></h4>
                    <ul className="space-y-2 text-sm text-[#8b949e]">
                      <li><Editable k="academic.stemCenters.services.resources.item1">- Practice problems</Editable></li>
                      <li><Editable k="academic.stemCenters.services.resources.item2">- Past exam files</Editable></li>
                      <li><Editable k="academic.stemCenters.services.resources.item3">- Online resources</Editable></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dean's List Tab */}
          {activeTab === 'deans-list' && (
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-4"><Editable k="academic.deansList.title">Dean's List Enhancement</Editable></h2>
              <PolicyProgress policy={getPolicy('deans-list')} />

              {/* Current vs Proposed */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#f85149]/30 rounded-lg p-6">
                  <h3 className="font-semibold text-[#f85149] text-lg mb-4"><Editable k="academic.deansList.current.title">Current Process</Editable></h3>
                  <ul className="space-y-3 text-sm text-[#8b949e]">
                    <li className="flex items-start gap-3">
                      <span className="text-[#f85149]">No</span>
                      <span><Editable k="academic.deansList.current.item1">Notifications sent 4-6 weeks after grades post</Editable></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#f85149]">No</span>
                      <span><Editable k="academic.deansList.current.item2">No official digital certificate</Editable></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#f85149]">No</span>
                      <span><Editable k="academic.deansList.current.item3">Limited recognition options</Editable></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#f85149]">No</span>
                      <span><Editable k="academic.deansList.current.item4">Hard to share achievement professionally</Editable></span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6">
                  <h3 className="font-semibold text-[#3fb950] text-lg mb-4"><Editable k="academic.deansList.proposed.title">Proposed Improvements</Editable></h3>
                  <ul className="space-y-3 text-sm text-[#8b949e]">
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">Yes</span>
                      <span><Editable k="academic.deansList.proposed.item1">Notifications within 2 weeks of grades</Editable></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">Yes</span>
                      <span><Editable k="academic.deansList.proposed.item2">Official digital certificates</Editable></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">Yes</span>
                      <span><Editable k="academic.deansList.proposed.item3">LinkedIn badge integration</Editable></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">Yes</span>
                      <span><Editable k="academic.deansList.proposed.item4">Recognition portal & ceremony</Editable></span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Requirements */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="academic.deansList.requirementsTitle">Dean's List Requirements</Editable></h3>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-10">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-semibold font-mono text-[#388bfd]"><Editable k="academic.deansList.requirements.gpa">3.5+</Editable></p>
                    <p className="text-sm text-[#6e7681] mt-2"><Editable k="academic.deansList.requirements.gpaLabel">Semester GPA</Editable></p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-semibold font-mono text-[#3fb950]"><Editable k="academic.deansList.requirements.credits">12+</Editable></p>
                    <p className="text-sm text-[#6e7681] mt-2"><Editable k="academic.deansList.requirements.creditsLabel">Credit Hours</Editable></p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-semibold font-mono text-[#a371f7]"><Editable k="academic.deansList.requirements.incompletes">No</Editable></p>
                    <p className="text-sm text-[#6e7681] mt-2"><Editable k="academic.deansList.requirements.incompletesLabel">Incompletes</Editable></p>
                  </div>
                </div>
              </div>

              {/* Digital Features */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="academic.deansList.digitalFeaturesTitle">Planned Digital Features</Editable></h3>
              <div className="grid md:grid-cols-2 gap-4">
                {(getPolicy('deans-list')?.digitalFeatures || []).map((feature, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#388bfd]/20 border border-[#388bfd]/40 rounded-lg flex items-center justify-center">
                      <span className="text-[#388bfd]"></span>
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
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0f6fc] mb-4"><Editable k="academic.strengths.title">First-Year Strengths Integration</Editable></h2>
              <PolicyProgress policy={getPolicy('strengths-integration')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#388bfd]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#388bfd] text-lg mb-3"><Editable k="academic.strengths.whatIs.title">What is the Gallup Strengths Assessment?</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="academic.strengths.whatIs.description" multiline>The CliftonStrengths assessment (formerly StrengthsFinder) identifies your top talent themes
                  to help you understand how you naturally think, feel, and behave. Over 1,000 colleges including
                  UT Knoxville, Purdue, and Virginia Tech use this model to help students discover their potential.</Editable>
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
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="academic.strengths.benefitsTitle">Benefits for Students</Editable></h3>
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#388bfd]/20 border border-[#388bfd]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl"></span>
                  </div>
                  <h4 className="font-semibold text-[#f0f6fc] mb-2"><Editable k="academic.strengths.benefits.discovery.title">Self-Discovery</Editable></h4>
                  <p className="text-sm text-[#8b949e]"><Editable k="academic.strengths.benefits.discovery.description" multiline>Identify your natural talents and understand how they can be developed into strengths.</Editable></p>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#3fb950]/20 border border-[#3fb950]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl"></span>
                  </div>
                  <h4 className="font-semibold text-[#f0f6fc] mb-2"><Editable k="academic.strengths.benefits.career.title">Career Pathways</Editable></h4>
                  <p className="text-sm text-[#8b949e]"><Editable k="academic.strengths.benefits.career.description" multiline>Get personalized recommendations for majors and careers that align with your strengths.</Editable></p>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#a371f7]/20 border border-[#a371f7]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl"></span>
                  </div>
                  <h4 className="font-semibold text-[#f0f6fc] mb-2"><Editable k="academic.strengths.benefits.team.title">Team Building</Editable></h4>
                  <p className="text-sm text-[#8b949e]"><Editable k="academic.strengths.benefits.team.description" multiline>Understand how to work effectively with others by recognizing complementary strengths.</Editable></p>
                </div>
              </div>

              {/* Top Themes */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="academic.strengths.themesTitle">34 CliftonStrengths Themes</Editable></h3>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold text-[#388bfd] text-sm uppercase tracking-wide mb-3"><Editable k="academic.strengths.themes.executing.title">Executing</Editable></h4>
                    <ul className="space-y-1 text-sm text-[#8b949e]">
                      <li><Editable k="academic.strengths.themes.executing.item1">Achiever</Editable></li>
                      <li><Editable k="academic.strengths.themes.executing.item2">Arranger</Editable></li>
                      <li><Editable k="academic.strengths.themes.executing.item3">Belief</Editable></li>
                      <li><Editable k="academic.strengths.themes.executing.item4">Consistency</Editable></li>
                      <li><Editable k="academic.strengths.themes.executing.item5">Deliberative</Editable></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#3fb950] text-sm uppercase tracking-wide mb-3"><Editable k="academic.strengths.themes.influencing.title">Influencing</Editable></h4>
                    <ul className="space-y-1 text-sm text-[#8b949e]">
                      <li><Editable k="academic.strengths.themes.influencing.item1">Activator</Editable></li>
                      <li><Editable k="academic.strengths.themes.influencing.item2">Command</Editable></li>
                      <li><Editable k="academic.strengths.themes.influencing.item3">Communication</Editable></li>
                      <li><Editable k="academic.strengths.themes.influencing.item4">Competition</Editable></li>
                      <li><Editable k="academic.strengths.themes.influencing.item5">Maximizer</Editable></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#a371f7] text-sm uppercase tracking-wide mb-3"><Editable k="academic.strengths.themes.relationship.title">Relationship</Editable></h4>
                    <ul className="space-y-1 text-sm text-[#8b949e]">
                      <li><Editable k="academic.strengths.themes.relationship.item1">Adaptability</Editable></li>
                      <li><Editable k="academic.strengths.themes.relationship.item2">Connectedness</Editable></li>
                      <li><Editable k="academic.strengths.themes.relationship.item3">Developer</Editable></li>
                      <li><Editable k="academic.strengths.themes.relationship.item4">Empathy</Editable></li>
                      <li><Editable k="academic.strengths.themes.relationship.item5">Includer</Editable></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#d29922] text-sm uppercase tracking-wide mb-3"><Editable k="academic.strengths.themes.strategic.title">Strategic</Editable></h4>
                    <ul className="space-y-1 text-sm text-[#8b949e]">
                      <li><Editable k="academic.strengths.themes.strategic.item1">Analytical</Editable></li>
                      <li><Editable k="academic.strengths.themes.strategic.item2">Context</Editable></li>
                      <li><Editable k="academic.strengths.themes.strategic.item3">Futuristic</Editable></li>
                      <li><Editable k="academic.strengths.themes.strategic.item4">Ideation</Editable></li>
                      <li><Editable k="academic.strengths.themes.strategic.item5">Strategic</Editable></li>
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
                  <h2 className="text-2xl font-semibold text-[#f0f6fc] tracking-tight mb-6"><Editable k="academic.faq.contactTitle">Contact Us</Editable></h2>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#388bfd]/20 border border-[#388bfd]/40 rounded-full flex items-center justify-center">
                        <span className="text-xl"></span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">{contact.lead.name}</p>
                        <p className="text-sm text-[#8b949e]">{contact.lead.title}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]"></span>
                        <span className="text-[#f0f6fc]">{contact.office}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]"></span>
                        <span className="text-[#f0f6fc]">{contact.hours}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]"></span>
                        <a href={`mailto:${contact.lead.email}`} className="text-[#388bfd] hover:underline">{contact.lead.email}</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]"></span>
                        <span className="text-[#f0f6fc]">{contact.socialMedia}</span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Form */}
                  <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h3 className="font-semibold text-[#f0f6fc] mb-4"><Editable k="academic.faq.feedback.title">Send Feedback</Editable></h3>
                    {feedbackSubmitted ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-[#388bfd]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl"></span>
                        </div>
                        <p className="text-[#388bfd] font-medium"><Editable k="academic.faq.feedback.thanks">Thanks for your feedback!</Editable></p>
                        <button onClick={() => setFeedbackSubmitted(false)} className="text-[#58a6ff] text-sm mt-2 hover:underline"><Editable k="academic.faq.feedback.sendAnother">Send another</Editable></button>
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
                        <button type="submit" disabled={isSubmitting} className="w-full bg-[#a371f7] text-[#0d1117] px-4 py-2.5 rounded font-semibold hover:bg-[#b381f8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h2 className="text-2xl font-semibold text-[#f0f6fc] tracking-tight mb-6"><Editable k="academic.faq.faqTitle">Frequently Asked Questions</Editable></h2>
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
                <h3 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-4"><Editable k="academic.faq.updatesTitle">Recent Updates</Editable></h3>
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
            <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5"><Editable k="academic.modal.mentor.title">Request a Peer Mentor</Editable></h3>
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
                  <Editable k="academic.modal.mentor.submit">Submit Request</Editable>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMentorModal(false)}
                  className="px-6 py-3 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded font-medium hover:bg-[#30363d] transition-colors"
                >
                  <Editable k="academic.modal.mentor.cancel">Cancel</Editable>
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
            <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5"><Editable k="academic.modal.center.title">Reserve Study Space</Editable></h3>
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
                  <Editable k="academic.modal.center.submit">Reserve Space</Editable>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCenterModal(false)}
                  className="px-6 py-3 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded font-medium hover:bg-[#30363d] transition-colors"
                >
                  <Editable k="academic.modal.center.cancel">Cancel</Editable>
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
