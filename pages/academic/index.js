import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { useApp } from '../../lib/store'
import { departmentContacts, departmentFAQs, departmentAnnouncements, serviceGuides } from '../../lib/data'
import { Editable, EditModeToggle } from '../../components/InlineEditor'
import {
  emailTemplates,
  externalLinks,
} from '../../lib/integrations'

// Scroll reveal hook
function useScrollReveal() {
  const [revealed, setRevealed] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return [ref, revealed]
}

// Reveal component
function Reveal({ children, delay = 0, className = '' }) {
  const [ref, revealed] = useScrollReveal()

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${className}`}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(40px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

export default function AcademicPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showMentorModal, setShowMentorModal] = useState(false)
  const [showCenterModal, setShowCenterModal] = useState(false)
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

  const PolicyProgress = ({ policy }) => (
    <div className="card p-6 mb-8">
      <div className="flex items-start justify-between mb-4">
        <span className={`px-3 py-1 rounded text-xs font-mono tracking-wider ${
          policy?.status === 'completed' ? 'bg-white/10 text-white' :
          policy?.status === 'in_progress' ? 'bg-white/5 text-gray-300' :
          'bg-white/5 text-gray-500'
        }`}>
          {policy?.status === 'in_progress' ? 'IN PROGRESS' : policy?.status === 'completed' ? 'COMPLETED' : 'PLANNED'}
        </span>
        <span className="text-gray-400 font-mono text-sm">{policy?.progress || 0}% Complete</span>
      </div>
      <div className="h-1 bg-gray-800 rounded overflow-hidden">
        <div className="h-full bg-white rounded transition-all" style={{ width: `${policy?.progress || 0}%` }} />
      </div>
    </div>
  )

  return (
    <Layout>
      <Head>
        <title>Academic Affairs | Project Bold</title>
      </Head>

      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center relative overflow-hidden border-b border-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <Reveal>
            <span className="caption mb-6 block">
              <Editable k="academic.hero.label">Academic Affairs</Editable>
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="hero-title mb-6">
              <Editable k="academic.hero.title">Academic Affairs</Editable>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="hero-subtitle max-w-2xl mb-10">
              <Editable k="academic.hero.description" multiline>Peer mentorship, midterm check-ins, STEM study centers, and academic success resources. Supporting your academic journey at Carolina.</Editable>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-20 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-xs font-medium tracking-widest uppercase whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-500 hover:text-white hover:border-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="section-padding">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-8"><Editable k="academic.overview.title">Academic Affairs Overview</Editable></h2>
              </Reveal>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <Reveal delay={50}>
                  <div className="card p-5 text-center">
                    <p className="text-4xl font-semibold font-mono text-white">{deptPolicies.length}</p>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide"><Editable k="academic.overview.stats.initiatives">Active Initiatives</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="card p-5 text-center">
                    <p className="text-4xl font-semibold font-mono text-white">
                      {deptPolicies.filter(p => p.status === 'in_progress').length}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide"><Editable k="academic.overview.stats.inProgress">In Progress</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="card p-5 text-center">
                    <p className="text-4xl font-semibold font-mono text-white">
                      {Math.round(deptPolicies.reduce((sum, p) => sum + (p.progress || 0), 0) / deptPolicies.length) || 0}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide"><Editable k="academic.overview.stats.avgProgress">Avg Progress</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <div className="card p-5 text-center">
                    <p className="text-4xl font-semibold font-mono text-white">5</p>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide"><Editable k="academic.overview.stats.policyAreas">Policy Areas</Editable></p>
                  </div>
                </Reveal>
              </div>

              {/* All Policies */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-5 uppercase tracking-wide"><Editable k="academic.overview.policiesTitle">All Academic Policies</Editable></h3>
              </Reveal>
              <div className="space-y-4">
                {deptPolicies.map((policy, index) => (
                  <Reveal key={policy.id} delay={index * 50}>
                    <div className="card p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{policy.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{policy.description}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-xs font-medium ml-4 ${
                          policy.status === 'in_progress'
                            ? 'bg-white/10 text-white'
                            : 'bg-white/5 text-gray-500'
                        }`}>
                          {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all"
                          style={{ width: `${policy.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 font-mono">{policy.progress}% <Editable k="academic.overview.complete">complete</Editable></p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Announcements */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mt-10 mb-5 uppercase tracking-wide"><Editable k="academic.overview.updatesTitle">Recent Updates</Editable></h3>
              </Reveal>
              <div className="space-y-3">
                {announcements.map((ann, i) => (
                  <Reveal key={ann.id} delay={i * 50}>
                    <div className="card p-4 flex items-start gap-4">
                      <span className={`px-2 py-1 rounded text-xs font-mono ${
                        ann.type === 'event' ? 'bg-white/10 text-white' :
                        ann.type === 'deadline' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {ann.type.toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-white">{ann.title}</h4>
                          <span className="text-xs text-gray-600 font-mono">{ann.date}</span>
                        </div>
                        <p className="text-sm text-gray-400">{ann.content}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* Peer Mentorship Tab */}
          {activeTab === 'peer-mentorship' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="academic.mentorship.title">Peer Mentorship Network</Editable></h2>
              </Reveal>
              <PolicyProgress policy={getPolicy('peer-mentorship')} />

              {/* Features */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <Reveal>
                  <div className="card-highlight p-6">
                    <h3 className="font-semibold text-white text-lg mb-2"><Editable k="academic.mentorship.findMentor.title">Find a Mentor</Editable></h3>
                    <p className="text-sm text-gray-400 mb-4"><Editable k="academic.mentorship.findMentor.description" multiline>Connect with trained peer mentors across all subjects. Get personalized guidance and support for your academic journey.</Editable></p>
                    <button
                      onClick={() => setShowMentorModal(!showMentorModal)}
                      className="btn-primary inline-block"
                    >
                      <Editable k="academic.mentorship.findMentor.button">Request a Mentor</Editable>
                    </button>
                    {showMentorModal && (
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Complete via Qualtrics</p>
                        <iframe
                          src="https://software.sites.unc.edu/qualtrics/"
                          className="w-full rounded-lg border border-gray-800 bg-black"
                          style={{ height: '500px' }}
                          title="Request a Mentor"
                        />
                      </div>
                    )}
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="card p-6">
                    <h3 className="font-semibold text-white text-lg mb-2"><Editable k="academic.mentorship.becomeMentor.title">Become a Mentor</Editable></h3>
                    <p className="text-sm text-gray-400 mb-4"><Editable k="academic.mentorship.becomeMentor.description" multiline>Share your expertise and help fellow students succeed. Gain leadership experience and make a difference.</Editable></p>
                    <button className="btn-secondary">
                      <Editable k="academic.mentorship.becomeMentor.button">Apply to Mentor</Editable>
                    </button>
                  </div>
                </Reveal>
              </div>

              {/* Subject Areas */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-5 uppercase tracking-wide"><Editable k="academic.mentorship.subjectAreasTitle">Subject Areas</Editable></h3>
              </Reveal>
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                {['STEM', 'Humanities', 'Social Sciences', 'Business', 'Health Sciences', 'Arts', 'Languages', 'Pre-Professional'].map((subject, i) => (
                  <Reveal key={subject} delay={i * 50}>
                    <div className="card p-4 text-center hover:bg-white/[0.02] transition-colors cursor-pointer">
                      <p className="text-white font-medium">{subject}</p>
                      <p className="text-xs text-gray-500 mt-1"><Editable k="academic.mentorship.viewMentors">View mentors</Editable></p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* How It Works */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-5 uppercase tracking-wide">{mentorGuide.title}</h3>
              </Reveal>
              <div className="grid md:grid-cols-4 gap-4">
                {mentorGuide.steps.map((step, i) => (
                  <Reveal key={step.step} delay={i * 50}>
                    <div className="card p-5 relative">
                      <div className="absolute -top-3 left-4 bg-white text-black text-xs font-bold px-2 py-1 rounded">
                        Step {step.step}
                      </div>
                      <h4 className="font-semibold text-white mt-2 mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-400">{step.description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* Midterm Check-Ins Tab */}
          {activeTab === 'midterm-checkins' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="academic.checkins.title">Midterm Progress Check-Ins</Editable></h2>
              </Reveal>
              <PolicyProgress policy={getPolicy('midterm-checkins')} />

              {/* Key Info */}
              <Reveal>
                <div className="card-highlight p-6 mb-10">
                  <h3 className="font-semibold text-white text-lg mb-3"><Editable k="academic.checkins.whatAre.title">What Are Midterm Check-Ins?</Editable></h3>
                  <p className="text-gray-400 mb-4">
                    <Editable k="academic.checkins.whatAre.description" multiline>Midterm Progress Check-ins help you understand your academic standing before final grades are issued.
                    Receive timely feedback so you can address challenges early and make informed decisions about your courses.</Editable>
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="card p-4">
                      <p className="text-2xl font-semibold font-mono text-white"><Editable k="academic.checkins.stats.week">Week 8</Editable></p>
                      <p className="text-sm text-gray-500"><Editable k="academic.checkins.stats.weekLabel">Check-in Period</Editable></p>
                    </div>
                    <div className="card p-4">
                      <p className="text-2xl font-semibold font-mono text-white"><Editable k="academic.checkins.stats.hours">48hrs</Editable></p>
                      <p className="text-sm text-gray-500"><Editable k="academic.checkins.stats.hoursLabel">Report Delivery</Editable></p>
                    </div>
                    <div className="card p-4">
                      <p className="text-2xl font-semibold font-mono text-white"><Editable k="academic.checkins.stats.coverage">100%</Editable></p>
                      <p className="text-sm text-gray-500"><Editable k="academic.checkins.stats.coverageLabel">Coverage Goal</Editable></p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Features */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-5 uppercase tracking-wide"><Editable k="academic.checkins.featuresTitle">Features</Editable></h3>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <Reveal>
                  <div className="card p-6">
                    <h4 className="font-semibold text-white mb-3"><Editable k="academic.checkins.portal.title">Progress Portal</Editable></h4>
                    <p className="text-sm text-gray-400 mb-4"><Editable k="academic.checkins.portal.description" multiline>View your midterm progress reports, grade projections, and instructor feedback in one central location.</Editable></p>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-center gap-2"><span className="text-white">—</span> <Editable k="academic.checkins.portal.item1">Course-by-course breakdown</Editable></li>
                      <li className="flex items-center gap-2"><span className="text-white">—</span> <Editable k="academic.checkins.portal.item2">Grade trend analysis</Editable></li>
                      <li className="flex items-center gap-2"><span className="text-white">—</span> <Editable k="academic.checkins.portal.item3">Instructor comments</Editable></li>
                    </ul>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="card p-6">
                    <h4 className="font-semibold text-white mb-3"><Editable k="academic.checkins.intervention.title">Early Intervention</Editable></h4>
                    <p className="text-sm text-gray-400 mb-4"><Editable k="academic.checkins.intervention.description" multiline>If your progress indicates concerns, you'll receive personalized resource recommendations and advisor alerts.</Editable></p>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-center gap-2"><span className="text-white">—</span> <Editable k="academic.checkins.intervention.item1">Automatic advisor notification</Editable></li>
                      <li className="flex items-center gap-2"><span className="text-white">—</span> <Editable k="academic.checkins.intervention.item2">Tutoring recommendations</Editable></li>
                      <li className="flex items-center gap-2"><span className="text-white">—</span> <Editable k="academic.checkins.intervention.item3">Study strategy resources</Editable></li>
                    </ul>
                  </div>
                </Reveal>
              </div>

              {/* Timeline */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-5 uppercase tracking-wide"><Editable k="academic.checkins.timelineTitle">Timeline</Editable></h3>
              </Reveal>
              <Reveal delay={100}>
                <div className="card p-6">
                  <div className="space-y-4">
                    {[
                      { week: 'Week 6-7', event: 'Instructors submit progress indicators', status: 'upcoming' },
                      { week: 'Week 8', event: 'Progress reports delivered to students', status: 'upcoming' },
                      { week: 'Week 8-9', event: 'Advisor meetings for at-risk students', status: 'upcoming' },
                      { week: 'Week 10', event: 'Last day to withdraw without penalty', status: 'upcoming' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-sm font-mono text-white">{item.week}</span>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-white flex-shrink-0" />
                        <p className="text-white">{item.event}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          {/* STEM Centers Tab */}
          {activeTab === 'stem-centers' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="academic.stemCenters.title">STEM Collaboration Centers</Editable></h2>
              </Reveal>
              <PolicyProgress policy={getPolicy('stem-centers')} />

              {/* Key Features */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <Reveal>
                  <div className="card p-5 text-center">
                    <p className="text-4xl font-semibold font-mono text-white"><Editable k="academic.stemCenters.stats.hours">24/7</Editable></p>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide"><Editable k="academic.stemCenters.stats.hoursLabel">Access Hours</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={50}>
                  <div className="card p-5 text-center">
                    <p className="text-4xl font-semibold font-mono text-white"><Editable k="academic.stemCenters.stats.tutors">Tutors</Editable></p>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide"><Editable k="academic.stemCenters.stats.tutorsLabel">Until Midnight</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="card p-5 text-center">
                    <p className="text-4xl font-semibold font-mono text-white"><Editable k="academic.stemCenters.stats.free">Free</Editable></p>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide"><Editable k="academic.stemCenters.stats.freeLabel">For All Students</Editable></p>
                  </div>
                </Reveal>
              </div>

              {/* Centers */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-5 uppercase tracking-wide"><Editable k="academic.stemCenters.locationsTitle">Planned Locations</Editable></h3>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {[
                  { name: 'Chemistry Study Center', building: 'Kenan Labs', subjects: ['CHEM 101/102', 'CHEM 241/261', 'Organic Chemistry'] },
                  { name: 'Physics Study Center', building: 'Phillips Hall', subjects: ['PHYS 114/115', 'PHYS 116/117', 'Mechanics & E&M'] },
                  { name: 'Math Study Center', building: 'Chapman Hall', subjects: ['MATH 231/232', 'MATH 233', 'Linear Algebra'] },
                  { name: 'Biology Study Center', building: 'Coker Hall', subjects: ['BIOL 101/102', 'BIOL 201/202', 'Genetics'] },
                ].map((center, i) => (
                  <Reveal key={i} delay={i * 50}>
                    <div className="card p-6">
                      <h4 className="font-semibold text-white text-lg">{center.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">{center.building}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {center.subjects.map((subj, j) => (
                          <span key={j} className="px-2 py-1 bg-white/5 border border-gray-800 rounded text-xs text-gray-400">
                            {subj}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowCenterModal(!showCenterModal)}
                        className="btn-secondary mt-4"
                      >
                        <Editable k="academic.stemCenters.reserveButton">Reserve Space</Editable>
                      </button>
                      {showCenterModal && (
                        <div className="mt-6 pt-6 border-t border-gray-800">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Complete via Qualtrics</p>
                          <iframe
                            src="https://software.sites.unc.edu/qualtrics/"
                            className="w-full rounded-lg border border-gray-800 bg-black"
                            style={{ height: '500px' }}
                            title="Reserve Study Center Space"
                          />
                        </div>
                      )}
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Services */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-5 uppercase tracking-wide"><Editable k="academic.stemCenters.servicesTitle">Available Services</Editable></h3>
              </Reveal>
              <Reveal delay={100}>
                <div className="card p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-white mb-3"><Editable k="academic.stemCenters.services.tutoring.title">Peer Tutoring</Editable></h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li><Editable k="academic.stemCenters.services.tutoring.item1">- Drop-in tutoring hours</Editable></li>
                        <li><Editable k="academic.stemCenters.services.tutoring.item2">- One-on-one appointments</Editable></li>
                        <li><Editable k="academic.stemCenters.services.tutoring.item3">- Exam review sessions</Editable></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-3"><Editable k="academic.stemCenters.services.spaces.title">Study Spaces</Editable></h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li><Editable k="academic.stemCenters.services.spaces.item1">- Group study rooms</Editable></li>
                        <li><Editable k="academic.stemCenters.services.spaces.item2">- Quiet individual desks</Editable></li>
                        <li><Editable k="academic.stemCenters.services.spaces.item3">- Whiteboards & supplies</Editable></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-3"><Editable k="academic.stemCenters.services.resources.title">Resources</Editable></h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li><Editable k="academic.stemCenters.services.resources.item1">- Practice problems</Editable></li>
                        <li><Editable k="academic.stemCenters.services.resources.item2">- Past exam files</Editable></li>
                        <li><Editable k="academic.stemCenters.services.resources.item3">- Online resources</Editable></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          {/* Dean's List Tab */}
          {activeTab === 'deans-list' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="academic.deansList.title">Dean's List Enhancement</Editable></h2>
              </Reveal>
              <PolicyProgress policy={getPolicy('deans-list')} />

              {/* Current vs Proposed */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <Reveal>
                  <div className="card p-6 border-l-2 border-l-yellow-500/50">
                    <h3 className="font-semibold text-yellow-400 text-lg mb-4"><Editable k="academic.deansList.current.title">Current Process</Editable></h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                      <li className="flex items-start gap-3">
                        <span className="text-yellow-400">—</span>
                        <span><Editable k="academic.deansList.current.item1">Notifications sent 4-6 weeks after grades post</Editable></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-yellow-400">—</span>
                        <span><Editable k="academic.deansList.current.item2">No official digital certificate</Editable></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-yellow-400">—</span>
                        <span><Editable k="academic.deansList.current.item3">Limited recognition options</Editable></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-yellow-400">—</span>
                        <span><Editable k="academic.deansList.current.item4">Hard to share achievement professionally</Editable></span>
                      </li>
                    </ul>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="card-highlight p-6 border-l-2 border-l-green-500/50">
                    <h3 className="font-semibold text-green-400 text-lg mb-4"><Editable k="academic.deansList.proposed.title">Proposed Improvements</Editable></h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                      <li className="flex items-start gap-3">
                        <span className="text-green-400">—</span>
                        <span><Editable k="academic.deansList.proposed.item1">Notifications within 2 weeks of grades</Editable></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400">—</span>
                        <span><Editable k="academic.deansList.proposed.item2">Official digital certificates</Editable></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400">—</span>
                        <span><Editable k="academic.deansList.proposed.item3">LinkedIn badge integration</Editable></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400">—</span>
                        <span><Editable k="academic.deansList.proposed.item4">Recognition portal & ceremony</Editable></span>
                      </li>
                    </ul>
                  </div>
                </Reveal>
              </div>

              {/* Requirements */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-5 uppercase tracking-wide"><Editable k="academic.deansList.requirementsTitle">Dean's List Requirements</Editable></h3>
              </Reveal>
              <Reveal delay={100}>
                <div className="card p-6 mb-10">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-4xl font-semibold font-mono text-white"><Editable k="academic.deansList.requirements.gpa">3.5+</Editable></p>
                      <p className="text-sm text-gray-500 mt-2"><Editable k="academic.deansList.requirements.gpaLabel">Semester GPA</Editable></p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-semibold font-mono text-white"><Editable k="academic.deansList.requirements.credits">12+</Editable></p>
                      <p className="text-sm text-gray-500 mt-2"><Editable k="academic.deansList.requirements.creditsLabel">Credit Hours</Editable></p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-semibold font-mono text-white"><Editable k="academic.deansList.requirements.incompletes">No</Editable></p>
                      <p className="text-sm text-gray-500 mt-2"><Editable k="academic.deansList.requirements.incompletesLabel">Incompletes</Editable></p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Digital Features */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-5 uppercase tracking-wide"><Editable k="academic.deansList.digitalFeaturesTitle">Planned Digital Features</Editable></h3>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-4">
                {(getPolicy('deans-list')?.digitalFeatures || []).map((feature, i) => (
                  <Reveal key={i} delay={i * 50}>
                    <div className="card p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                        <span className="text-white">✓</span>
                      </div>
                      <span className="text-white capitalize">{feature.replace(/-/g, ' ')}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* Strengths Assessment Tab */}
          {activeTab === 'strengths' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="academic.strengths.title">First-Year Strengths Integration</Editable></h2>
              </Reveal>
              <PolicyProgress policy={getPolicy('strengths-integration')} />

              {/* About */}
              <Reveal>
                <div className="card-highlight p-6 mb-10">
                  <h3 className="font-semibold text-white text-lg mb-3"><Editable k="academic.strengths.whatIs.title">What is the Gallup Strengths Assessment?</Editable></h3>
                  <p className="text-gray-400 mb-4">
                    <Editable k="academic.strengths.whatIs.description" multiline>The CliftonStrengths assessment (formerly StrengthsFinder) identifies your top talent themes
                    to help you understand how you naturally think, feel, and behave. Over 1,000 colleges including
                    UT Knoxville, Purdue, and Virginia Tech use this model to help students discover their potential.</Editable>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['UT Knoxville', 'Purdue', 'Virginia Tech', '1,000+ Colleges'].map((school, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white/5 border border-gray-800 rounded text-xs text-gray-400">
                        {school}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Benefits */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-5 uppercase tracking-wide"><Editable k="academic.strengths.benefitsTitle">Benefits for Students</Editable></h3>
              </Reveal>
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <Reveal>
                  <div className="card p-6">
                    <h4 className="font-semibold text-white mb-2"><Editable k="academic.strengths.benefits.discovery.title">Self-Discovery</Editable></h4>
                    <p className="text-sm text-gray-400"><Editable k="academic.strengths.benefits.discovery.description" multiline>Identify your natural talents and understand how they can be developed into strengths.</Editable></p>
                  </div>
                </Reveal>

                <Reveal delay={50}>
                  <div className="card p-6">
                    <h4 className="font-semibold text-white mb-2"><Editable k="academic.strengths.benefits.career.title">Career Pathways</Editable></h4>
                    <p className="text-sm text-gray-400"><Editable k="academic.strengths.benefits.career.description" multiline>Get personalized recommendations for majors and careers that align with your strengths.</Editable></p>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="card p-6">
                    <h4 className="font-semibold text-white mb-2"><Editable k="academic.strengths.benefits.team.title">Team Building</Editable></h4>
                    <p className="text-sm text-gray-400"><Editable k="academic.strengths.benefits.team.description" multiline>Understand how to work effectively with others by recognizing complementary strengths.</Editable></p>
                  </div>
                </Reveal>
              </div>

              {/* Top Themes */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-5 uppercase tracking-wide"><Editable k="academic.strengths.themesTitle">34 CliftonStrengths Themes</Editable></h3>
              </Reveal>
              <Reveal delay={100}>
                <div className="card p-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-semibold text-white text-sm uppercase tracking-wide mb-3"><Editable k="academic.strengths.themes.executing.title">Executing</Editable></h4>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li><Editable k="academic.strengths.themes.executing.item1">Achiever</Editable></li>
                        <li><Editable k="academic.strengths.themes.executing.item2">Arranger</Editable></li>
                        <li><Editable k="academic.strengths.themes.executing.item3">Belief</Editable></li>
                        <li><Editable k="academic.strengths.themes.executing.item4">Consistency</Editable></li>
                        <li><Editable k="academic.strengths.themes.executing.item5">Deliberative</Editable></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm uppercase tracking-wide mb-3"><Editable k="academic.strengths.themes.influencing.title">Influencing</Editable></h4>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li><Editable k="academic.strengths.themes.influencing.item1">Activator</Editable></li>
                        <li><Editable k="academic.strengths.themes.influencing.item2">Command</Editable></li>
                        <li><Editable k="academic.strengths.themes.influencing.item3">Communication</Editable></li>
                        <li><Editable k="academic.strengths.themes.influencing.item4">Competition</Editable></li>
                        <li><Editable k="academic.strengths.themes.influencing.item5">Maximizer</Editable></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm uppercase tracking-wide mb-3"><Editable k="academic.strengths.themes.relationship.title">Relationship</Editable></h4>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li><Editable k="academic.strengths.themes.relationship.item1">Adaptability</Editable></li>
                        <li><Editable k="academic.strengths.themes.relationship.item2">Connectedness</Editable></li>
                        <li><Editable k="academic.strengths.themes.relationship.item3">Developer</Editable></li>
                        <li><Editable k="academic.strengths.themes.relationship.item4">Empathy</Editable></li>
                        <li><Editable k="academic.strengths.themes.relationship.item5">Includer</Editable></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm uppercase tracking-wide mb-3"><Editable k="academic.strengths.themes.strategic.title">Strategic</Editable></h4>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li><Editable k="academic.strengths.themes.strategic.item1">Analytical</Editable></li>
                        <li><Editable k="academic.strengths.themes.strategic.item2">Context</Editable></li>
                        <li><Editable k="academic.strengths.themes.strategic.item3">Futuristic</Editable></li>
                        <li><Editable k="academic.strengths.themes.strategic.item4">Ideation</Editable></li>
                        <li><Editable k="academic.strengths.themes.strategic.item5">Strategic</Editable></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          {/* FAQ & Contact Tab */}
          {activeTab === 'faq' && (
            <div>
              <div className="grid lg:grid-cols-2 gap-12 mb-16">
                {/* Contact Info */}
                <div>
                  <Reveal>
                    <h2 className="section-title mb-8"><Editable k="academic.faq.contactTitle">Contact Us</Editable></h2>
                  </Reveal>
                  <Reveal delay={100}>
                    <div className="card p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {contact.lead.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white text-lg">{contact.lead.name}</p>
                          <p className="text-gray-500">{contact.lead.title}</p>
                        </div>
                      </div>
                      <div className="space-y-4 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 w-4">@</span>
                          <span className="text-white">{contact.office}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 w-4">T</span>
                          <span className="text-white">{contact.hours}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 w-4">E</span>
                          <a href={`mailto:${contact.lead.email}`} className="text-white hover:text-gray-300 transition-colors">{contact.lead.email}</a>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 w-4">S</span>
                          <span className="text-white">{contact.socialMedia}</span>
                        </div>
                      </div>
                    </div>
                  </Reveal>

                  {/* Feedback Form */}
                  <Reveal delay={200}>
                    <div className="card p-8 mt-6">
                      <h3 className="font-semibold text-white text-lg mb-6"><Editable k="academic.faq.feedback.title">Send Feedback</Editable></h3>
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Complete via Qualtrics</p>
                        <iframe
                          src="https://software.sites.unc.edu/qualtrics/"
                          className="w-full rounded-lg border border-gray-800 bg-black"
                          style={{ height: '500px' }}
                          title="Academic Affairs Feedback"
                        />
                      </div>
                    </div>
                  </Reveal>
                </div>

                {/* FAQ Section */}
                <div>
                  <Reveal>
                    <h2 className="section-title mb-8"><Editable k="academic.faq.faqTitle">Frequently Asked Questions</Editable></h2>
                  </Reveal>
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <Reveal key={i} delay={i * 50}>
                        <div className="card overflow-hidden">
                          <button
                            onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                            className="w-full text-left p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                          >
                            <span className="font-medium text-white pr-4">{faq.q}</span>
                            <span className="text-gray-500 flex-shrink-0 text-xl">{expandedFaq === i ? '−' : '+'}</span>
                          </button>
                          {expandedFaq === i && (
                            <div className="px-5 pb-5 text-gray-400 text-sm border-t border-gray-800 pt-4">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </div>

              {/* Announcements */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-6"><Editable k="academic.faq.updatesTitle">Recent Updates</Editable></h3>
              </Reveal>
              <div className="space-y-3">
                {announcements.map((ann, i) => (
                  <Reveal key={ann.id} delay={i * 50}>
                    <div className="card p-5 flex items-start gap-4">
                      <span className={`px-2 py-1 rounded text-xs font-mono ${
                        ann.type === 'event' ? 'bg-white/10 text-white' :
                        ann.type === 'deadline' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {ann.type.toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-white">{ann.title}</h4>
                          <span className="text-xs text-gray-600 font-mono">{ann.date}</span>
                        </div>
                        <p className="text-sm text-gray-400">{ann.content}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <EditModeToggle />
    </Layout>
  )
}
