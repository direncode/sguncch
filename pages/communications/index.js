import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { useApp } from '../../lib/store'
import { departmentContacts, departmentFAQs, departmentAnnouncements, getLatestUpdate, getPhaseLabel, getPhaseSummary, POLICY_PHASES } from '../../lib/data'
import PhaseIndicator from '../../components/PhaseIndicator'
import { Editable, EditModeToggle } from '../../components/InlineEditor'
import {
  submitForm,
  createShareLinks,
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

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [activeFormPanel, setActiveFormPanel] = useState(null)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const { policies, budgetData } = useApp()

  const deptPolicies = policies.filter(p => p.department === 'communications')
  const getPolicy = (id) => deptPolicies.find(p => p.id === id)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'who-is-carolina', label: 'Who is Carolina' },
    { id: 'vc-advisory', label: 'VC Advisory' },
    { id: 'podcast', label: 'SG Podcast' },
    { id: 'talent', label: 'Talent Spotlight' },
    { id: 'accountability', label: 'Accountability' },
    { id: 'faq', label: 'FAQ & Contact' },
  ]

  const contact = departmentContacts.communications
  const faqs = departmentFAQs.communications
  const announcements = departmentAnnouncements.communications
  const [expandedFaq, setExpandedFaq] = useState(null)

  const handleSubscribe = async () => {
    if (!email) return
    setIsSubscribing(true)
    try {
      await submitForm('communications-podcast-subscribe', {
        email,
        department: 'communications',
        timestamp: new Date().toISOString(),
      })
      setSubscribed(true)
      setEmail('')
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setIsSubscribing(false)
    }
  }

  const PolicyProgress = ({ policy }) => {
    const latestUpdate = getLatestUpdate(policy)
    return (
      <div className="card p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <span className={`px-3 py-1 rounded text-xs font-mono tracking-wider ${
            policy?.status === 'completed' ? 'bg-white/10 text-white' :
            policy?.status === 'in_progress' ? 'bg-white/5 text-gray-300' :
            'bg-white/5 text-gray-500'
          }`}>
            {policy?.status === 'in_progress' ? 'IN PROGRESS' : policy?.status === 'completed' ? 'COMPLETED' : 'PLANNED'}
          </span>
          <PhaseIndicator currentPhase={policy?.phase || 1} compact />
        </div>
        {policy?.impactSummary && (
          <p className="text-gray-300 text-sm mb-3">{policy.impactSummary}</p>
        )}
        {latestUpdate && (
          <div className="text-xs text-gray-500 mt-2">
            <span className="text-gray-400">{latestUpdate.title}</span>
            {latestUpdate.date && <span className="ml-2">{latestUpdate.date}</span>}
          </div>
        )}
      </div>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Communications | Project Bold</title>
      </Head>

      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center relative overflow-hidden border-b border-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <Reveal>
            <span className="caption mb-6 block">
              <Editable k="communications.hero.label">Transparency & Outreach</Editable>
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="hero-title mb-6">
              <Editable k="communications.hero.title">Communications</Editable>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="hero-subtitle max-w-2xl mb-10">
              <Editable k="communications.hero.description" multiline>Storytelling, transparency, and amplifying the student voice through innovative outreach campaigns.</Editable>
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
                <h2 className="section-title mb-8"><Editable k="communications.overview.title">Communications Overview</Editable></h2>
              </Reveal>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-16">
                <Reveal delay={50}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">{deptPolicies.length}</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.overview.stats.initiatives">Initiatives</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">
                      {deptPolicies.filter(p => p.status === 'in_progress').length}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.overview.stats.inProgress">In Progress</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">
                      {deptPolicies.filter(p => p.status === 'completed').length}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.overview.stats.avgProgress">Completed</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">{deptPolicies.filter(p => p.phase >= 4).length}</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.overview.stats.platformProgress">In Pilot+</Editable></p>
                  </div>
                </Reveal>
              </div>

              {/* Transparency Dashboard */}
              <Reveal>
                <div className="card p-8 mb-16">
                  <span className="caption mb-6 block"><Editable k="communications.overview.budget.title">Budget Transparency</Editable></span>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="card p-6 text-center">
                      <p className="text-3xl font-bold font-mono text-white">${budgetData.total.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.overview.budget.total">Total Budget</Editable></p>
                    </div>
                    <div className="card-highlight p-6 text-center">
                      <p className="text-3xl font-bold font-mono text-white">${budgetData.allocated.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.overview.budget.allocated">Allocated</Editable></p>
                    </div>
                    <div className="card p-6 text-center">
                      <p className="text-3xl font-bold font-mono text-white">${budgetData.spent.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.overview.budget.spent">Spent</Editable></p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* All Initiatives */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="communications.overview.initiatives.title">All Initiatives</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-6 mb-16">
                {deptPolicies.map((policy, index) => (
                  <Reveal key={policy.id} delay={index * 50}>
                    <div className="card p-6 group">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold text-white group-hover:text-gray-300 transition-colors pr-4">{policy.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-mono ${
                          policy.status === 'in_progress'
                            ? 'bg-white/10 text-white'
                            : 'bg-white/5 text-gray-500'
                        }`}>
                          {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                        </span>
                      </div>
                      {policy?.impactSummary && (
                        <p className="text-gray-300 text-sm mb-3">{policy.impactSummary}</p>
                      )}
                      {!policy?.impactSummary && (
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{policy.description}</p>
                      )}
                      <PhaseIndicator currentPhase={policy?.phase || 1} compact />
                      {(() => { const update = getLatestUpdate(policy); return update ? (
                        <div className="text-xs text-gray-500 mt-2">
                          <span className="text-gray-400">{update.title}</span>
                          {update.date && <span className="ml-2">{update.date}</span>}
                        </div>
                      ) : null; })()}
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Announcements */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="communications.overview.updates.title">Recent Updates</Editable></span>
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

          {/* Who is Carolina Tab */}
          {activeTab === 'who-is-carolina' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="communications.whoIsCarolina.title">"Who is Carolina" Campaign</Editable></h2>
                <p className="body-large text-gray-400 mb-8">Highlighting the diverse experiences and identities of the Tar Heel community</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('who-is-carolina')} />

              {/* About */}
              <Reveal>
                <div className="card-highlight p-8 mb-16">
                  <span className="caption mb-4 block"><Editable k="communications.whoIsCarolina.about.title">About the Campaign</Editable></span>
                  <p className="text-gray-400 mb-8">
                    <Editable k="communications.whoIsCarolina.about.description" multiline>"Who is Carolina" highlights the diverse experiences and identities of the Tar Heel community through
                    short-form, interview-style videos. Students filmed in everyday environments share their stories,
                    humanizing the Carolina experience and building community connection.</Editable>
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="card p-5 text-center">
                      <p className="text-3xl font-mono font-bold text-white">0</p>
                      <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.whoIsCarolina.stats.stories">Stories Shared</Editable></p>
                    </div>
                    <div className="card p-5 text-center">
                      <p className="text-3xl font-mono font-bold text-white">0</p>
                      <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.whoIsCarolina.stats.views">Video Views</Editable></p>
                    </div>
                    <div className="card p-5 text-center">
                      <p className="text-3xl font-mono font-bold text-white">0</p>
                      <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.whoIsCarolina.stats.nominations">Nominations</Editable></p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Actions */}
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                <Reveal>
                  <div className="card-highlight p-8">
                    <h3 className="text-xl font-semibold text-white mb-3"><Editable k="communications.whoIsCarolina.shareStory.title">Share Your Story</Editable></h3>
                    <p className="text-gray-400 mb-6"><Editable k="communications.whoIsCarolina.shareStory.description">Be featured in our campaign! Share what makes your Carolina experience unique.</Editable></p>
                    <button
                      onClick={() => setActiveFormPanel(activeFormPanel === 'story' ? null : 'story')}
                      className="btn-primary"
                    >
                      <Editable k="communications.whoIsCarolina.shareStory.button">Submit Your Story</Editable>
                    </button>
                    {activeFormPanel === 'story' && (
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Complete via UNC Qualtrics</p>
                        <iframe
                          src="https://unc.qualtrics.com/jfe/form/SV_COMMS_STORY"
                          className="w-full rounded-lg border border-gray-800 bg-black"
                          style={{ height: '500px' }}
                          title="Story Submission"
                        />
                      </div>
                    )}
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="card p-8">
                    <h3 className="text-xl font-semibold text-white mb-3"><Editable k="communications.whoIsCarolina.nominate.title">Nominate Someone</Editable></h3>
                    <p className="text-gray-400 mb-6"><Editable k="communications.whoIsCarolina.nominate.description">Know someone with an inspiring story? Nominate them to be featured!</Editable></p>
                    <button
                      onClick={() => setActiveFormPanel(activeFormPanel === 'nomination' ? null : 'nomination')}
                      className="btn-secondary"
                    >
                      <Editable k="communications.whoIsCarolina.nominate.button">Nominate a Student</Editable>
                    </button>
                    {activeFormPanel === 'nomination' && (
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Complete via UNC Qualtrics</p>
                        <iframe
                          src="https://unc.qualtrics.com/jfe/form/SV_COMMS_NOMINATION"
                          className="w-full rounded-lg border border-gray-800 bg-black"
                          style={{ height: '500px' }}
                          title="Nomination"
                        />
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>

              {/* What We're Looking For */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="communications.whoIsCarolina.lookingFor.title">What We're Looking For</Editable></span>
              </Reveal>
              <Reveal delay={100}>
                <div className="card p-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div>
                      <h4 className="font-semibold text-white mb-4"><Editable k="communications.whoIsCarolina.lookingFor.diverseVoices.title">Diverse Voices</Editable></h4>
                      <ul className="space-y-3 text-sm text-gray-400">
                        <li className="flex items-center gap-3"><span className="text-white">-</span><Editable k="communications.whoIsCarolina.lookingFor.diverseVoices.item1">First-generation students</Editable></li>
                        <li className="flex items-center gap-3"><span className="text-white">-</span><Editable k="communications.whoIsCarolina.lookingFor.diverseVoices.item2">Transfer students</Editable></li>
                        <li className="flex items-center gap-3"><span className="text-white">-</span><Editable k="communications.whoIsCarolina.lookingFor.diverseVoices.item3">International students</Editable></li>
                        <li className="flex items-center gap-3"><span className="text-white">-</span><Editable k="communications.whoIsCarolina.lookingFor.diverseVoices.item4">Student athletes</Editable></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-4"><Editable k="communications.whoIsCarolina.lookingFor.uniqueJourneys.title">Unique Journeys</Editable></h4>
                      <ul className="space-y-3 text-sm text-gray-400">
                        <li className="flex items-center gap-3"><span className="text-white">-</span><Editable k="communications.whoIsCarolina.lookingFor.uniqueJourneys.item1">Overcoming challenges</Editable></li>
                        <li className="flex items-center gap-3"><span className="text-white">-</span><Editable k="communications.whoIsCarolina.lookingFor.uniqueJourneys.item2">Finding community</Editable></li>
                        <li className="flex items-center gap-3"><span className="text-white">-</span><Editable k="communications.whoIsCarolina.lookingFor.uniqueJourneys.item3">Discovering passions</Editable></li>
                        <li className="flex items-center gap-3"><span className="text-white">-</span><Editable k="communications.whoIsCarolina.lookingFor.uniqueJourneys.item4">Making an impact</Editable></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-4"><Editable k="communications.whoIsCarolina.lookingFor.carolinaPride.title">Carolina Pride</Editable></h4>
                      <ul className="space-y-3 text-sm text-gray-400">
                        <li className="flex items-center gap-3"><span className="text-white">-</span><Editable k="communications.whoIsCarolina.lookingFor.carolinaPride.item1">What Carolina means to you</Editable></li>
                        <li className="flex items-center gap-3"><span className="text-white">-</span><Editable k="communications.whoIsCarolina.lookingFor.carolinaPride.item2">Favorite traditions</Editable></li>
                        <li className="flex items-center gap-3"><span className="text-white">-</span><Editable k="communications.whoIsCarolina.lookingFor.carolinaPride.item3">Defining moments</Editable></li>
                        <li className="flex items-center gap-3"><span className="text-white">-</span><Editable k="communications.whoIsCarolina.lookingFor.carolinaPride.item4">Future aspirations</Editable></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          {/* VC Advisory Tab */}
          {activeTab === 'vc-advisory' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="communications.vcAdvisory.title">VC Communications Advisory Committee</Editable></h2>
                <p className="body-large text-gray-400 mb-8">Creating a formal channel for student input on UNC's messaging</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('vc-advisory')} />

              {/* About */}
              <Reveal>
                <div className="card-highlight p-8 mb-16">
                  <span className="caption mb-4 block"><Editable k="communications.vcAdvisory.about.title">About the Committee</Editable></span>
                  <p className="text-gray-400">
                    <Editable k="communications.vcAdvisory.about.description" multiline>The Student Advisory Committee to the Vice Chancellor for Communications creates a formal channel
                    for student input on UNC's messaging and branding. This ensures institutional messaging reflects
                    student experiences, priorities, and the authentic Carolina spirit.</Editable>
                  </p>
                </div>
              </Reveal>

              {/* Committee Info */}
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                <Reveal>
                  <div className="card p-8">
                    <h3 className="text-xl font-semibold text-white mb-6"><Editable k="communications.vcAdvisory.responsibilities.title">Committee Responsibilities</Editable></h3>
                    <ul className="space-y-4 text-gray-400">
                      <li className="flex items-start gap-3">
                        <span className="text-white">-</span>
                        <span><Editable k="communications.vcAdvisory.responsibilities.item1">Review and provide feedback on university communications</Editable></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-white">-</span>
                        <span><Editable k="communications.vcAdvisory.responsibilities.item2">Advise on student-facing messaging and branding</Editable></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-white">-</span>
                        <span><Editable k="communications.vcAdvisory.responsibilities.item3">Represent diverse student perspectives</Editable></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-white">-</span>
                        <span><Editable k="communications.vcAdvisory.responsibilities.item4">Meet monthly with VC Communications office</Editable></span>
                      </li>
                    </ul>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="card p-8">
                    <h3 className="text-xl font-semibold text-white mb-6"><Editable k="communications.vcAdvisory.requirements.title">Member Requirements</Editable></h3>
                    <ul className="space-y-4 text-gray-400">
                      <li className="flex items-start gap-3">
                        <span className="text-white">-</span>
                        <span><Editable k="communications.vcAdvisory.requirements.item1">Current undergraduate or graduate student</Editable></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-white">-</span>
                        <span><Editable k="communications.vcAdvisory.requirements.item2">Interest in communications, marketing, or media</Editable></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-white">-</span>
                        <span><Editable k="communications.vcAdvisory.requirements.item3">Commitment to monthly meetings</Editable></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-white">-</span>
                        <span><Editable k="communications.vcAdvisory.requirements.item4">Passion for student advocacy</Editable></span>
                      </li>
                    </ul>
                  </div>
                </Reveal>
              </div>

              {/* Application */}
              <Reveal>
                <div className="card-highlight p-8">
                  <h3 className="text-xl font-semibold text-white mb-4"><Editable k="communications.vcAdvisory.apply.title">Apply for the Committee</Editable></h3>
                  <p className="text-gray-400 mb-6">
                    <Editable k="communications.vcAdvisory.apply.description">Applications for the Spring 2026 cohort are now open. Join us in shaping how Carolina communicates!</Editable>
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="btn-primary">
                      <Editable k="communications.vcAdvisory.apply.button">Apply Now</Editable>
                    </button>
                    <span className="text-sm text-gray-500"><Editable k="communications.vcAdvisory.apply.deadline">Deadline: Feb 15, 2026</Editable></span>
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          {/* Podcast Tab */}
          {activeTab === 'podcast' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="communications.podcast.title">SG Podcast</Editable></h2>
                <p className="body-large text-gray-400 mb-8">Spotlighting student leaders and campus organizations</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('sg-podcast')} />

              {/* About */}
              <Reveal>
                <div className="card-highlight p-8 mb-16">
                  <span className="caption mb-4 block"><Editable k="communications.podcast.about.title">About the Podcast</Editable></span>
                  <p className="text-gray-400 mb-6">
                    <Editable k="communications.podcast.about.description" multiline>The Student Government Podcast spotlights student leaders, athletes, administrators, and campus
                    organizations by sharing their personal trajectories at UNC. We demystify how students can get
                    involved and highlight opportunities students may not know exist.</Editable>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['Spotify', 'Apple Podcasts', 'YouTube', 'Website'].map((platform, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white/5 border border-gray-800 rounded text-xs text-gray-400">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-16">
                <Reveal delay={50}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.podcast.stats.episodes">Episodes</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.podcast.stats.listeners">Listeners</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.podcast.stats.guests">Guests</Editable></p>
                  </div>
                </Reveal>
              </div>

              {/* Actions */}
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                <Reveal>
                  <div className="card-highlight p-8">
                    <h3 className="text-xl font-semibold text-white mb-3"><Editable k="communications.podcast.beGuest.title">Be a Guest</Editable></h3>
                    <p className="text-gray-400 mb-6"><Editable k="communications.podcast.beGuest.description">Share your Carolina story and inspire other students. We're always looking for interesting guests!</Editable></p>
                    <button
                      onClick={() => setActiveFormPanel(activeFormPanel === 'podcast-guest' ? null : 'podcast-guest')}
                      className="btn-primary"
                    >
                      <Editable k="communications.podcast.beGuest.button">Apply to Be a Guest</Editable>
                    </button>
                    {activeFormPanel === 'podcast-guest' && (
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Complete via UNC Qualtrics</p>
                        <iframe
                          src="https://unc.qualtrics.com/jfe/form/SV_COMMS_PODCAST"
                          className="w-full rounded-lg border border-gray-800 bg-black"
                          style={{ height: '500px' }}
                          title="Podcast Guest Application"
                        />
                      </div>
                    )}
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="card p-8">
                    <h3 className="text-xl font-semibold text-white mb-3"><Editable k="communications.podcast.nominateGuest.title">Nominate a Guest</Editable></h3>
                    <p className="text-gray-400 mb-6"><Editable k="communications.podcast.nominateGuest.description">Know someone with an amazing story? Let us know who you'd like to hear from!</Editable></p>
                    <button
                      onClick={() => setActiveFormPanel(activeFormPanel === 'podcast-nomination' ? null : 'podcast-nomination')}
                      className="btn-secondary"
                    >
                      <Editable k="communications.podcast.nominateGuest.button">Nominate Someone</Editable>
                    </button>
                    {activeFormPanel === 'podcast-nomination' && (
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Complete via UNC Qualtrics</p>
                        <iframe
                          src="https://unc.qualtrics.com/jfe/form/SV_COMMS_NOMINATION"
                          className="w-full rounded-lg border border-gray-800 bg-black"
                          style={{ height: '500px' }}
                          title="Podcast Guest Nomination"
                        />
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>

              {/* Subscribe */}
              <Reveal>
                <div className="card p-8">
                  <h3 className="text-xl font-semibold text-white mb-4"><Editable k="communications.podcast.subscribe.title">Subscribe to the Podcast</Editable></h3>
                  <p className="text-gray-400 mb-6"><Editable k="communications.podcast.subscribe.description">Get notified when new episodes drop. Available on all major platforms.</Editable></p>
                  {!subscribed ? (
                    <div className="flex gap-3">
                      <input
                        type="email"
                        placeholder="your.email@unc.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubscribing}
                        className="flex-1 px-4 py-3 bg-black border border-gray-800 rounded text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
                      />
                      <button
                        onClick={handleSubscribe}
                        disabled={isSubscribing || !email}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubscribing ? 'Subscribing...' : <Editable k="communications.podcast.subscribe.button">Subscribe</Editable>}
                      </button>
                    </div>
                  ) : (
                    <p className="text-green-400 font-medium"><Editable k="communications.podcast.subscribe.success">You're subscribed! We'll notify you of new episodes.</Editable></p>
                  )}
                </div>
              </Reveal>
            </div>
          )}

          {/* Talent Spotlight Tab */}
          {activeTab === 'talent' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="communications.talent.title">Student Talent Spotlight</Editable></h2>
                <p className="body-large text-gray-400 mb-8">Celebrating student creativity across the arts</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('talent-spotlight')} />

              {/* About */}
              <Reveal>
                <div className="card-highlight p-8 mb-16">
                  <span className="caption mb-4 block"><Editable k="communications.talent.about.title">About the Spotlight</Editable></span>
                  <p className="text-gray-400">
                    <Editable k="communications.talent.about.description" multiline>We celebrate student creativity in Arts, Dance, Theater, and Comedy through social media reels
                    featuring event previews, behind-the-scenes moments, and post-event highlights. Help student
                    artists reach broader audiences!</Editable>
                  </p>
                </div>
              </Reveal>

              {/* Categories */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="communications.talent.categories.title">Featured Categories</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-4 gap-4 mb-16">
                {[
                  { name: 'Visual Arts', count: 0 },
                  { name: 'Dance', count: 0 },
                  { name: 'Theater', count: 0 },
                  { name: 'Comedy', count: 0 },
                  { name: 'Music', count: 0 },
                  { name: 'Film', count: 0 },
                  { name: 'Writing', count: 0 },
                  { name: 'Other', count: 0 },
                ].map((cat, i) => (
                  <Reveal key={i} delay={i * 50}>
                    <div className="card p-5 text-center cursor-pointer group">
                      <p className="text-white font-medium group-hover:text-gray-300 transition-colors">{cat.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{cat.count} spotlights</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Submit */}
              <Reveal>
                <div className="card-highlight p-8">
                  <h3 className="text-xl font-semibold text-white mb-4"><Editable k="communications.talent.submit.title">Submit Your Work</Editable></h3>
                  <p className="text-gray-400 mb-6">
                    <Editable k="communications.talent.submit.description">Have an upcoming performance, exhibition, or creative project? Let us help promote it!</Editable>
                  </p>
                  <button
                    onClick={() => setActiveFormPanel(activeFormPanel === 'talent' ? null : 'talent')}
                    className="btn-primary"
                  >
                    <Editable k="communications.talent.submit.button">Submit for Spotlight</Editable>
                  </button>
                  {activeFormPanel === 'talent' && (
                    <div className="mt-6 pt-6 border-t border-gray-800">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Complete via UNC Qualtrics</p>
                      <iframe
                        src="https://unc.qualtrics.com/jfe/form/SV_COMMS_TALENT"
                        className="w-full rounded-lg border border-gray-800 bg-black"
                        style={{ height: '500px' }}
                        title="Talent Spotlight Submission"
                      />
                    </div>
                  )}
                </div>
              </Reveal>
            </div>
          )}

          {/* Accountability Tab */}
          {activeTab === 'accountability' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="communications.accountability.title">Assessment & Accountability</Editable></h2>
                <p className="body-large text-gray-400 mb-8">Measurable outcomes for every project with clear benchmarks</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('accountability-campaign')} />

              {/* About */}
              <Reveal>
                <div className="card-highlight p-8 mb-16">
                  <span className="caption mb-4 block"><Editable k="communications.accountability.commitment.title">Our Commitment</Editable></span>
                  <p className="text-gray-400">
                    <Editable k="communications.accountability.commitment.description" multiline>We establish measurable outcomes for every project with clear benchmarks, timelines, and success
                    indicators students can track. We publish regular progress updates and adjust when results fall
                    short. Accountability is not optional.</Editable>
                  </p>
                </div>
              </Reveal>

              {/* Overall Phase Distribution */}
              <Reveal>
                <div className="card p-8 mb-16">
                  <span className="caption mb-6 block"><Editable k="communications.accountability.progress.title">Platform-Wide Phase Distribution</Editable></span>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
                    {(() => {
                      const phaseSummary = getPhaseSummary(policies);
                      return POLICY_PHASES.map(phase => (
                        <div key={phase.number} className="card p-4 text-center">
                          <p className="text-2xl font-bold font-mono text-white">{phaseSummary[phase.number]?.count || 0}</p>
                          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{phase.shortLabel}</p>
                        </div>
                      ));
                    })()}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="card p-5 text-center">
                      <p className="text-3xl font-bold font-mono text-white">{policies.filter(p => p.status === 'completed').length}</p>
                      <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.accountability.progress.completed">Completed</Editable></p>
                    </div>
                    <div className="card-highlight p-5 text-center">
                      <p className="text-3xl font-bold font-mono text-white">{policies.filter(p => p.status === 'in_progress').length}</p>
                      <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.accountability.progress.inProgress">In Progress</Editable></p>
                    </div>
                    <div className="card p-5 text-center">
                      <p className="text-3xl font-bold font-mono text-gray-400">{policies.filter(p => p.status === 'planned').length}</p>
                      <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="communications.accountability.progress.planned">Planned</Editable></p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Transparency Features */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="communications.accountability.features.title">Transparency Features</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-8">
                <Reveal delay={50}>
                  <div className="card p-8">
                    <h4 className="text-lg font-semibold text-white mb-4"><Editable k="communications.accountability.features.dashboard.title">Public Dashboard</Editable></h4>
                    <p className="text-gray-400 mb-6"><Editable k="communications.accountability.features.dashboard.description">Track real-time progress on all initiatives with clear metrics and timelines.</Editable></p>
                    <ul className="space-y-3 text-gray-400">
                      <li className="flex items-center gap-3"><span className="text-white">-</span> <Editable k="communications.accountability.features.dashboard.item1">Phase tracking</Editable></li>
                      <li className="flex items-center gap-3"><span className="text-white">-</span> <Editable k="communications.accountability.features.dashboard.item2">Status updates</Editable></li>
                      <li className="flex items-center gap-3"><span className="text-white">-</span> <Editable k="communications.accountability.features.dashboard.item3">Milestone tracking</Editable></li>
                    </ul>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="card p-8">
                    <h4 className="text-lg font-semibold text-white mb-4"><Editable k="communications.accountability.features.reports.title">Regular Reports</Editable></h4>
                    <p className="text-gray-400 mb-6"><Editable k="communications.accountability.features.reports.description">Published updates ensure students stay informed on what we're accomplishing.</Editable></p>
                    <ul className="space-y-3 text-gray-400">
                      <li className="flex items-center gap-3"><span className="text-white">-</span> <Editable k="communications.accountability.features.reports.item1">Monthly newsletters</Editable></li>
                      <li className="flex items-center gap-3"><span className="text-white">-</span> <Editable k="communications.accountability.features.reports.item2">Semester reviews</Editable></li>
                      <li className="flex items-center gap-3"><span className="text-white">-</span> <Editable k="communications.accountability.features.reports.item3">Annual reports</Editable></li>
                    </ul>
                  </div>
                </Reveal>
              </div>
            </div>
          )}

          {/* FAQ & Contact Tab */}
          {activeTab === 'faq' && (
            <div>
              <div className="grid lg:grid-cols-2 gap-12 mb-16">
                {/* Contact Info */}
                <div>
                  <Reveal>
                    <h2 className="section-title mb-8"><Editable k="communications.faq.contact.title">Contact Us</Editable></h2>
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
                      <h3 className="font-semibold text-white text-lg mb-6"><Editable k="communications.faq.feedback.title">Send Feedback</Editable></h3>
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Complete via UNC Qualtrics</p>
                        <iframe
                          src="https://unc.qualtrics.com/jfe/form/SV_COMMS_FEEDBACK"
                          className="w-full rounded-lg border border-gray-800 bg-black"
                          style={{ height: '500px' }}
                          title="Feedback"
                        />
                      </div>
                    </div>
                  </Reveal>
                </div>

                {/* FAQ Section */}
                <div>
                  <Reveal>
                    <h2 className="section-title mb-8"><Editable k="communications.faq.questions.title">Frequently Asked Questions</Editable></h2>
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
                <span className="caption mb-6 block"><Editable k="communications.faq.updates.title">Recent Updates</Editable></span>
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
