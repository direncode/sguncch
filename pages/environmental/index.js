import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { useApp } from '../../lib/store'
import { departmentContacts, departmentFAQs, departmentAnnouncements, serviceGuides } from '../../lib/data'
import { Editable, EditModeToggle } from '../../components/InlineEditor'
import {
  calendarEvents,
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

export default function EnvironmentalPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showAdoptModal, setShowAdoptModal] = useState(false)
  const [showDonateModal, setShowDonateModal] = useState(false)
  const { policies, getSiteContent } = useApp()

  const deptPolicies = policies.filter(p => p.department === 'environmental')
  const getPolicy = (id) => deptPolicies.find(p => p.id === id)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sustain-week', label: 'Sustain Carolina' },
    { id: 'too-good-to-go', label: 'Too Good To Go' },
    { id: 'adopt-a-space', label: 'Adopt-a-Space' },
    { id: 'composting', label: 'Composting' },
    { id: 'moveout-shop', label: 'Move-Out Shop' },
    { id: 'faq', label: 'FAQ & Contact' },
  ]

  const contact = departmentContacts.environmental
  const faqs = departmentFAQs.environmental
  const announcements = departmentAnnouncements.environmental
  const adoptGuide = serviceGuides['adopt-space']
  const tgtgGuide = serviceGuides['too-good-to-go']
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
        <title>Environmental | Project Bold</title>
      </Head>

      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center relative overflow-hidden border-b border-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <Reveal>
            <span className="caption mb-6 block">
              <Editable k="environmental.hero.label">Environmental Affairs</Editable>
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="hero-title mb-6">
              <Editable k="environmental.hero.title">Sustainability</Editable>
              <br />
              <Editable k="environmental.hero.title2">For Carolina</Editable>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="hero-subtitle max-w-2xl mb-10">
              <Editable k="environmental.hero.description" multiline>Sustainability, climate action, and green initiatives. Building a more sustainable Carolina through food waste reduction, campus cleanups, and environmental education.</Editable>
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
                <Editable k={`environmental.tabs.${tab.id}`}>{tab.label}</Editable>
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
                <h2 className="section-title mb-8"><Editable k="environmental.overview.title">Environmental Overview</Editable></h2>
              </Reveal>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-12">
                <Reveal delay={50}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">{deptPolicies.length}</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.overview.stats.initiatives">Initiatives</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">
                      {deptPolicies.filter(p => p.status === 'in_progress').length}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.overview.stats.inProgress">In Progress</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">
                      {Math.round(deptPolicies.reduce((sum, p) => sum + (p.progress || 0), 0) / deptPolicies.length) || 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.overview.stats.avgProgress">Avg Progress</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">5</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.overview.stats.policyAreas">Policy Areas</Editable></p>
                  </div>
                </Reveal>
              </div>

              {/* All Policies */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-6 uppercase tracking-wide"><Editable k="environmental.overview.policiesTitle">All Environmental Policies</Editable></h3>
              </Reveal>
              <div className="space-y-4 mb-12">
                {deptPolicies.map((policy, index) => (
                  <Reveal key={policy.id} delay={index * 50}>
                    <div className="card p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{policy.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{policy.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded text-xs font-mono ml-4 ${
                          policy.status === 'in_progress'
                            ? 'bg-white/10 text-white'
                            : 'bg-white/5 text-gray-500'
                        }`}>
                          {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                        </span>
                      </div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all"
                          style={{ width: `${policy.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-3 font-mono">{policy.progress}% <Editable k="environmental.overview.complete">complete</Editable></p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Announcements */}
              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-6 uppercase tracking-wide"><Editable k="environmental.overview.recentUpdates">Recent Updates</Editable></h3>
              </Reveal>
              <div className="space-y-3">
                {announcements.map((ann, index) => (
                  <Reveal key={ann.id} delay={index * 50}>
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

          {/* Sustain Carolina Week Tab */}
          {activeTab === 'sustain-week' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="environmental.sustainWeek.title">Sustain Carolina Week</Editable></h2>
                <p className="body-large text-gray-400 mb-8">Campus-wide sustainability celebration and action</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('sustain-carolina-week')} />

              {/* About */}
              <Reveal>
                <div className="card-highlight p-8 mb-12">
                  <span className="caption mb-4 block"><Editable k="environmental.sustainWeek.aboutTitle">About the Week</Editable></span>
                  <p className="text-gray-400 mb-6">
                    <Editable k="environmental.sustainWeek.aboutDescription" multiline>Sustain Carolina Week is a campus-wide celebration uniting student organizations, academic departments,
                    and community partners. The week features zero-waste challenges, sustainable fashion pop-ups, faculty
                    panels, and outdoor service projects like litter cleanups.</Editable>
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="card p-5 text-center">
                      <p className="text-2xl font-mono font-bold text-white"><Editable k="environmental.sustainWeek.dates">March 3-7</Editable></p>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider"><Editable k="environmental.sustainWeek.datesLabel">2026 Dates</Editable></p>
                    </div>
                    <div className="card p-5 text-center">
                      <p className="text-2xl font-mono font-bold text-white">0</p>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider"><Editable k="environmental.sustainWeek.eventsPlanned">Events Planned</Editable></p>
                    </div>
                    <div className="card p-5 text-center">
                      <p className="text-2xl font-mono font-bold text-white">0</p>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider"><Editable k="environmental.sustainWeek.partners">Partners</Editable></p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Event Categories */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="environmental.sustainWeek.plannedEventsTitle">Planned Events</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <Reveal delay={50}>
                  <div className="card p-6">
                    <h4 className="font-semibold text-white"><Editable k="environmental.sustainWeek.event1.name">Zero-Waste Challenges</Editable></h4>
                    <p className="text-sm text-gray-400 mt-1"><Editable k="environmental.sustainWeek.event1.description">Campus-wide competitions to reduce waste and track impact</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="card p-6">
                    <h4 className="font-semibold text-white"><Editable k="environmental.sustainWeek.event2.name">Sustainable Fashion Pop-Up</Editable></h4>
                    <p className="text-sm text-gray-400 mt-1"><Editable k="environmental.sustainWeek.event2.description">Clothing swap and thrift market in the Pit</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="card p-6">
                    <h4 className="font-semibold text-white"><Editable k="environmental.sustainWeek.event3.name">Faculty Sustainability Panels</Editable></h4>
                    <p className="text-sm text-gray-400 mt-1"><Editable k="environmental.sustainWeek.event3.description">Discussions on climate research and campus initiatives</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <div className="card p-6">
                    <h4 className="font-semibold text-white"><Editable k="environmental.sustainWeek.event4.name">Litter Cleanup Day</Editable></h4>
                    <p className="text-sm text-gray-400 mt-1"><Editable k="environmental.sustainWeek.event4.description">Service project cleaning up campus and surrounding areas</Editable></p>
                  </div>
                </Reveal>
              </div>

              {/* Get Involved */}
              <Reveal>
                <div className="card p-8">
                  <h3 className="font-semibold text-white text-lg mb-4"><Editable k="environmental.sustainWeek.getInvolvedTitle">Get Involved</Editable></h3>
                  <p className="text-gray-400 mb-6">
                    <Editable k="environmental.sustainWeek.getInvolvedDescription">Want to host an event or partner with Sustain Carolina Week? Let us know!</Editable>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="btn-primary">
                      <Editable k="environmental.sustainWeek.partnerButton">Partner With Us</Editable>
                    </button>
                    <a
                      href={calendarEvents.sustainCarolinaWeek}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      <Editable k="environmental.sustainWeek.addToCalendar">Add to Calendar</Editable>
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          {/* Too Good To Go Tab */}
          {activeTab === 'too-good-to-go' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="environmental.tgtg.title">Too Good To Go Program</Editable></h2>
                <p className="body-large text-gray-400 mb-8">Reducing food waste while supporting food security</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('too-good-to-go')} />

              {/* About */}
              <Reveal>
                <div className="card-highlight p-8 mb-12">
                  <span className="caption mb-4 block"><Editable k="environmental.tgtg.aboutTitle">About the Program</Editable></span>
                  <p className="text-gray-400">
                    <Editable k="environmental.tgtg.aboutDescription" multiline>We're partnering with Carolina Dining Services to redistribute surplus dining hall meals through a
                    low-cost or free student access platform. This reduces food waste while addressing food insecurity—a
                    key intersection of sustainability and equity.</Editable>
                  </p>
                </div>
              </Reveal>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-12">
                <Reveal delay={50}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.tgtg.stats.mealsRedistributed">Meals Redistributed</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0 lbs</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.tgtg.stats.wasteReduced">Waste Reduced</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.tgtg.stats.studentsServed">Students Served</Editable></p>
                  </div>
                </Reveal>
              </div>

              {/* How It Works */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="environmental.tgtg.howItWorksTitle">{tgtgGuide.title}</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-4 gap-4 mb-12">
                {tgtgGuide.steps.map((step, index) => (
                  <Reveal key={step.step} delay={index * 50}>
                    <div className="card p-5 relative pt-8">
                      <div className="absolute -top-3 left-4 bg-white text-black text-xs font-bold px-2 py-1 rounded">
                        <Editable k={`environmental.tgtg.step${step.step}.label`}>Step {step.step}</Editable>
                      </div>
                      <h4 className="font-semibold text-white mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-400">{step.description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Locations */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="environmental.tgtg.locationsTitle">Participating Locations</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-4">
                <Reveal delay={50}>
                  <div className="card p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white"><Editable k="environmental.tgtg.location1.name">Lenoir Dining Hall</Editable></h4>
                      <p className="text-sm text-gray-500"><Editable k="environmental.tgtg.location1.time">End of dinner service</Editable></p>
                    </div>
                    <span className="px-3 py-1 bg-white/10 text-white rounded text-xs font-mono uppercase">
                      <Editable k="environmental.tgtg.location1.status">Pilot</Editable>
                    </span>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="card p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white"><Editable k="environmental.tgtg.location2.name">Chase Dining Hall</Editable></h4>
                      <p className="text-sm text-gray-500"><Editable k="environmental.tgtg.location2.time">End of dinner service</Editable></p>
                    </div>
                    <span className="px-3 py-1 bg-white/10 text-white rounded text-xs font-mono uppercase">
                      <Editable k="environmental.tgtg.location2.status">Pilot</Editable>
                    </span>
                  </div>
                </Reveal>
              </div>
            </div>
          )}

          {/* Adopt-a-Space Tab */}
          {activeTab === 'adopt-a-space' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="environmental.adoptSpace.title">Adopt-a-Space Program</Editable></h2>
                <p className="body-large text-gray-400 mb-8">Campus beautification through community ownership</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('adopt-a-space')} />

              {/* About */}
              <Reveal>
                <div className="card-highlight p-8 mb-12">
                  <span className="caption mb-4 block"><Editable k="environmental.adoptSpace.aboutTitle">About the Program</Editable></span>
                  <p className="text-gray-400">
                    <Editable k="environmental.adoptSpace.aboutDescription" multiline>Empower student organizations, residence halls, and RAs to adopt designated campus spaces and maintain
                    them through regular cleanup events. Monthly Campus Cleanup Days offer service hours and team-building
                    opportunities while keeping our campus beautiful.</Editable>
                  </p>
                </div>
              </Reveal>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-12">
                <Reveal delay={50}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.adoptSpace.stats.spacesAdopted">Spaces Adopted</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.adoptSpace.stats.cleanupEvents">Cleanup Events</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.adoptSpace.stats.volunteers">Volunteers</Editable></p>
                  </div>
                </Reveal>
              </div>

              {/* How It Works */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="environmental.adoptSpace.howItWorksTitle">{adoptGuide.title}</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-4 gap-4 mb-12">
                {adoptGuide.steps.map((step, index) => (
                  <Reveal key={step.step} delay={index * 50}>
                    <div className="card p-5 relative pt-8">
                      <div className="absolute -top-3 left-4 bg-white text-black text-xs font-bold px-2 py-1 rounded">
                        <Editable k={`environmental.adoptSpace.step${step.step}.label`}>Step {step.step}</Editable>
                      </div>
                      <h4 className="font-semibold text-white mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-400">{step.description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Available Spaces */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="environmental.adoptSpace.availableSpacesTitle">Available Spaces</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-3 gap-4 mb-12">
                {[
                  { key: 'space1', name: 'Polk Place Quad' },
                  { key: 'space2', name: 'McCorkle Place' },
                  { key: 'space3', name: 'The Pit Area' },
                  { key: 'space4', name: 'South Campus Walkways' },
                  { key: 'space5', name: 'Stadium Drive' },
                  { key: 'space6', name: 'Kenan Woods Trail' },
                ].map((space, index) => (
                  <Reveal key={space.key} delay={index * 50}>
                    <div className="card p-4 flex items-center justify-between">
                      <span className="text-white font-medium"><Editable k={`environmental.adoptSpace.${space.key}.name`}>{space.name}</Editable></span>
                      <span className="px-2 py-1 bg-white/10 text-white rounded text-xs font-mono">
                        <Editable k={`environmental.adoptSpace.${space.key}.status`}>Available</Editable>
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Register */}
              <Reveal>
                <div className="card p-8">
                  <h3 className="font-semibold text-white text-lg mb-4"><Editable k="environmental.adoptSpace.registerTitle">Register Your Organization</Editable></h3>
                  <p className="text-gray-400 mb-6">
                    <Editable k="environmental.adoptSpace.registerDescription">Adopt a space and commit to regular cleanup events. Earn service hours and leaderboard recognition!</Editable>
                  </p>
                  <button
                    onClick={() => setShowAdoptModal(!showAdoptModal)}
                    className="btn-primary"
                  >
                    {showAdoptModal ? 'Close' : 'Adopt a Space'}
                  </button>
                  {showAdoptModal && (
                    <div className="mt-6 pt-6 border-t border-gray-800">
                      <a href={getSiteContent('env.adopt.url', 'https://software.sites.unc.edu/qualtrics/')} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center block">
                        Open Adopt-a-Space Form in Qualtrics
                      </a>
                      <p className="text-[10px] text-gray-600 font-mono mt-2 text-center break-all">
                        <Editable k="env.adopt.url">https://software.sites.unc.edu/qualtrics/</Editable>
                      </p>
                    </div>
                  )}
                </div>
              </Reveal>
            </div>
          )}

          {/* Composting Tab */}
          {activeTab === 'composting' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="environmental.composting.title">Composting Expansion</Editable></h2>
                <p className="body-large text-gray-400 mb-8">Reducing landfill waste through campus-wide composting</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('composting-expansion')} />

              {/* About */}
              <Reveal>
                <div className="card-highlight p-8 mb-12">
                  <span className="caption mb-4 block"><Editable k="environmental.composting.aboutTitle">About the Initiative</Editable></span>
                  <p className="text-gray-400">
                    <Editable k="environmental.composting.aboutDescription" multiline>We're expanding composting infrastructure across campus, particularly in dining halls. In collaboration
                    with Carolina Dining and Facilities, we're installing more compost bins and plate-clearing systems with
                    educational signage and student ambassadors to help reduce waste sent to landfills.</Editable>
                  </p>
                </div>
              </Reveal>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-12">
                <Reveal delay={50}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.composting.stats.stations">Stations</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0 lbs</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.composting.stats.wasteDiverted">Waste Diverted</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.composting.stats.ambassadors">Ambassadors</Editable></p>
                  </div>
                </Reveal>
              </div>

              {/* What Can Be Composted */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="environmental.composting.whatCanBeComposted">What Can Be Composted</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <Reveal delay={50}>
                  <div className="card-highlight p-6">
                    <h4 className="font-semibold text-white mb-4"><Editable k="environmental.composting.yesTitle">Yes - Compost These</Editable></h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-center gap-2"><span className="text-white">-</span> <Editable k="environmental.composting.yes1">Food scraps & leftovers</Editable></li>
                      <li className="flex items-center gap-2"><span className="text-white">-</span> <Editable k="environmental.composting.yes2">Coffee grounds & filters</Editable></li>
                      <li className="flex items-center gap-2"><span className="text-white">-</span> <Editable k="environmental.composting.yes3">Paper napkins & towels</Editable></li>
                      <li className="flex items-center gap-2"><span className="text-white">-</span> <Editable k="environmental.composting.yes4">Cardboard (uncoated)</Editable></li>
                      <li className="flex items-center gap-2"><span className="text-white">-</span> <Editable k="environmental.composting.yes5">Fruit & vegetable peels</Editable></li>
                    </ul>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="card p-6 border-red-900/30">
                    <h4 className="font-semibold text-red-400 mb-4"><Editable k="environmental.composting.noTitle">No - Don't Compost These</Editable></h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-center gap-2"><span className="text-red-400">No</span> <Editable k="environmental.composting.no1">Plastic containers or utensils</Editable></li>
                      <li className="flex items-center gap-2"><span className="text-red-400">No</span> <Editable k="environmental.composting.no2">Styrofoam</Editable></li>
                      <li className="flex items-center gap-2"><span className="text-red-400">No</span> <Editable k="environmental.composting.no3">Metal or glass</Editable></li>
                      <li className="flex items-center gap-2"><span className="text-red-400">No</span> <Editable k="environmental.composting.no4">Coated paper products</Editable></li>
                      <li className="flex items-center gap-2"><span className="text-red-400">No</span> <Editable k="environmental.composting.no5">Meat bones (large)</Editable></li>
                    </ul>
                  </div>
                </Reveal>
              </div>

              {/* Become an Ambassador */}
              <Reveal>
                <div className="card p-8">
                  <h3 className="font-semibold text-white text-lg mb-4"><Editable k="environmental.composting.ambassadorTitle">Become a Composting Ambassador</Editable></h3>
                  <p className="text-gray-400 mb-6">
                    <Editable k="environmental.composting.ambassadorDescription">Help educate fellow students about proper composting. Ambassadors staff stations during peak hours
                    and earn service hours.</Editable>
                  </p>
                  <button className="btn-primary">
                    <Editable k="environmental.composting.signUpButton">Sign Up</Editable>
                  </button>
                </div>
              </Reveal>
            </div>
          )}

          {/* Move-Out Shop Tab */}
          {activeTab === 'moveout-shop' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="environmental.moveout.title">Move-Out Donation Shop</Editable></h2>
                <p className="body-large text-gray-400 mb-8">Reducing waste and supporting affordability</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('moveout-shop')} />

              {/* About */}
              <Reveal>
                <div className="card-highlight p-8 mb-12">
                  <span className="caption mb-4 block"><Editable k="environmental.moveout.aboutTitle">About the Shop</Editable></span>
                  <p className="text-gray-400">
                    <Editable k="environmental.moveout.aboutDescription" multiline>The Move-Out Donation Shop is a Carolina Thrift-style initiative operated semiannually to collect,
                    sort, and resell or donate discarded items. We reduce landfill waste, promote reuse, and support
                    affordability for students needing inexpensive supplies at the start of each semester.</Editable>
                  </p>
                </div>
              </Reveal>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-12">
                <Reveal delay={50}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.moveout.stats.itemsCollected">Items Collected</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.moveout.stats.itemsSold">Items Sold</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="card p-6 text-center">
                    <p className="text-4xl font-mono font-bold text-white">0</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider"><Editable k="environmental.moveout.stats.itemsDonated">Items Donated</Editable></p>
                  </div>
                </Reveal>
              </div>

              {/* Accepted Items */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="environmental.moveout.acceptedItemsTitle">What We Accept</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-4 gap-4 mb-12">
                {[
                  { key: 'item1', name: 'Furniture', examples: 'Chairs, desks, lamps, shelves' },
                  { key: 'item2', name: 'Electronics', examples: 'Chargers, cables, small appliances' },
                  { key: 'item3', name: 'School Supplies', examples: 'Notebooks, binders, organizers' },
                  { key: 'item4', name: 'Dorm Items', examples: 'Bedding, storage, decor' },
                ].map((item, index) => (
                  <Reveal key={item.key} delay={index * 50}>
                    <div className="card p-5 text-center">
                      <p className="text-white font-medium"><Editable k={`environmental.moveout.${item.key}.name`}>{item.name}</Editable></p>
                      <p className="text-xs text-gray-500 mt-1"><Editable k={`environmental.moveout.${item.key}.examples`}>{item.examples}</Editable></p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Actions */}
              <div className="grid md:grid-cols-2 gap-6">
                <Reveal>
                  <div className="card-highlight p-8">
                    <h3 className="font-semibold text-white text-lg mb-4"><Editable k="environmental.moveout.donateTitle">Donate Items</Editable></h3>
                    <p className="text-gray-400 mb-6">
                      <Editable k="environmental.moveout.donateDescription">Moving out? Schedule a pickup or drop off items at designated locations during finals week.</Editable>
                    </p>
                    <button
                      onClick={() => setShowDonateModal(!showDonateModal)}
                      className="btn-primary"
                    >
                      {showDonateModal ? 'Close' : 'Schedule Donation'}
                    </button>
                    {showDonateModal && (
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <a href={getSiteContent('env.donate.url', 'https://software.sites.unc.edu/qualtrics/')} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center block">
                          Open Donation Form in Qualtrics
                        </a>
                        <p className="text-[10px] text-gray-600 font-mono mt-2 text-center break-all">
                          <Editable k="env.donate.url">https://software.sites.unc.edu/qualtrics/</Editable>
                        </p>
                      </div>
                    )}
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="card p-8">
                    <h3 className="font-semibold text-white text-lg mb-4"><Editable k="environmental.moveout.shopTitle">Shop the Store</Editable></h3>
                    <p className="text-gray-400 mb-6">
                      <Editable k="environmental.moveout.shopDescription">Find affordable supplies at the start of each semester. All proceeds support sustainability programs.</Editable>
                    </p>
                    <button className="btn-secondary">
                      <Editable k="environmental.moveout.viewScheduleButton">View Schedule</Editable>
                    </button>
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
                    <h2 className="section-title mb-8"><Editable k="environmental.faq.contactTitle">Contact Us</Editable></h2>
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
                      <h3 className="font-semibold text-white text-lg mb-6"><Editable k="environmental.faq.feedbackTitle">Send Feedback</Editable></h3>
                      <div className="mt-2">
                        <a href={getSiteContent('env.feedback.url', 'https://software.sites.unc.edu/qualtrics/')} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full text-center block">
                          Open Feedback Form in Qualtrics
                        </a>
                        <p className="text-[10px] text-gray-600 font-mono mt-2 text-center break-all">
                          <Editable k="env.feedback.url">https://software.sites.unc.edu/qualtrics/</Editable>
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </div>

                {/* FAQ Section */}
                <div>
                  <Reveal>
                    <h2 className="section-title mb-8"><Editable k="environmental.faq.faqTitle">Frequently Asked Questions</Editable></h2>
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
                <h3 className="text-xl font-semibold text-white mb-6"><Editable k="environmental.faq.recentUpdatesTitle">Recent Updates</Editable></h3>
              </Reveal>
              <div className="space-y-3">
                {announcements.map((ann, index) => (
                  <Reveal key={ann.id} delay={index * 50}>
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
