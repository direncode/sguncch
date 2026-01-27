import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { departmentContacts, departmentFAQs, departmentAnnouncements, serviceGuides } from '../../lib/data'
import { Editable, EditModeToggle } from '../../components/InlineEditor'
import {
  submitForm,
  calendarEvents,
  externalLinks,
} from '../../lib/integrations'

export default function EnvironmentalPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showAdoptModal, setShowAdoptModal] = useState(false)
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [adoptForm, setAdoptForm] = useState({ orgName: '', contact: '', email: '', space: '' })
  const [donateForm, setDonateForm] = useState({ name: '', email: '', items: '', pickupDate: '' })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const { policies } = useApp()

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
  const [feedbackForm, setFeedbackForm] = useState({ topic: '', message: '', email: '' })
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAdoptSubmitting, setIsAdoptSubmitting] = useState(false)
  const [isDonateSubmitting, setIsDonateSubmitting] = useState(false)

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await submitForm('environmental-feedback', {
        ...feedbackForm,
        department: 'environmental',
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

  const handleAdoptSubmit = async (e) => {
    e.preventDefault()
    setIsAdoptSubmitting(true)
    try {
      await submitForm('adopt-a-space', {
        ...adoptForm,
        department: 'environmental',
        timestamp: new Date().toISOString(),
      })
      setFormSubmitted(true)
      setShowAdoptModal(false)
      setAdoptForm({ orgName: '', contact: '', email: '', space: '' })
    } catch (error) {
      console.error('Adopt submission error:', error)
    } finally {
      setIsAdoptSubmitting(false)
    }
  }

  const handleDonateSubmit = async (e) => {
    e.preventDefault()
    setIsDonateSubmitting(true)
    try {
      await submitForm('donation-schedule', {
        ...donateForm,
        department: 'environmental',
        timestamp: new Date().toISOString(),
      })
      setFormSubmitted(true)
      setShowDonateModal(false)
      setDonateForm({ name: '', email: '', items: '', pickupDate: '' })
    } catch (error) {
      console.error('Donation submission error:', error)
    } finally {
      setIsDonateSubmitting(false)
    }
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
            ? 'border-[#3fb950] text-[#3fb950] bg-[#3fb950]/10'
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
            className="h-full bg-gradient-to-r from-[#238636] to-[#3fb950] rounded transition-all"
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
        <title>Environmental | Project Bold</title>
      </Head>

      {/* Hero */}
      <div className="relative bg-gradient-to-b from-[#0a0e14] to-[#0d1117] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#3fb950 1px, transparent 1px), linear-gradient(90deg, #3fb950 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-[#3fb950]/20 border border-[#3fb950]/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌱</span>
            </div>
            <div>
              <p className="text-[#3fb950] text-xs font-mono uppercase tracking-widest mb-1">
                <Editable k="environmental.hero.label">SUSTAINABILITY DIVISION</Editable>
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#f0f6fc]">
                <Editable k="environmental.hero.title">Environmental Affairs</Editable>
              </h1>
            </div>
          </div>
          <p className="text-[#8b949e] text-lg max-w-2xl mt-4">
            <Editable k="environmental.hero.description" multiline>Sustainability, climate action, and green initiatives. Building a more sustainable Carolina through food waste reduction, campus cleanups, and environmental education.</Editable>
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
                className={`px-4 py-4 text-xs font-medium uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-[#3fb950] border-[#3fb950]'
                    : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
              >
                <Editable k={`environmental.tabs.${tab.id}`}>{tab.label}</Editable>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="bg-[#0a0e14] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {formSubmitted && (
            <div className="mb-8 bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-5">
              <p className="text-[#f0f6fc] font-medium"><Editable k="environmental.form.submittedMessage">Your submission has been received! We'll be in touch soon.</Editable></p>
              <button onClick={() => setFormSubmitted(false)} className="text-[#3fb950] text-sm mt-2 font-medium hover:underline"><Editable k="environmental.form.dismissButton">Dismiss</Editable></button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8"><Editable k="environmental.overview.title">Environmental Overview</Editable></h2>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">{deptPolicies.length}</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.overview.stats.initiatives">Initiatives</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#58a6ff]">
                    {deptPolicies.filter(p => p.status === 'in_progress').length}
                  </p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.overview.stats.inProgress">In Progress</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">
                    {Math.round(deptPolicies.reduce((sum, p) => sum + (p.progress || 0), 0) / deptPolicies.length) || 0}%
                  </p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.overview.stats.avgProgress">Avg Progress</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#d29922]">5</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.overview.stats.policyAreas">Policy Areas</Editable></p>
                </div>
              </div>

              {/* All Policies */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="environmental.overview.policiesTitle">All Environmental Policies</Editable></h3>
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
                          ? 'border-[#3fb950] text-[#3fb950] bg-[#3fb950]/10'
                          : 'border-[#30363d] text-[#6e7681] bg-[#21262d]'
                      }`}>
                        {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#238636] to-[#3fb950] rounded-full transition-all"
                        style={{ width: `${policy.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#6e7681] mt-2 font-mono">{policy.progress}% <Editable k="environmental.overview.complete">complete</Editable></p>
                  </div>
                ))}
              </div>

              {/* Announcements */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mt-10 mb-5 uppercase tracking-wide"><Editable k="environmental.overview.recentUpdates">Recent Updates</Editable></h3>
              <div className="space-y-3">
                {announcements.map(ann => (
                  <div key={ann.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-start gap-4">
                    <div className={`px-2 py-1 rounded text-xs font-mono ${
                      ann.type === 'event' ? 'bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]' :
                      ann.type === 'deadline' ? 'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]' :
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

          {/* Sustain Carolina Week Tab */}
          {activeTab === 'sustain-week' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4"><Editable k="environmental.sustainWeek.title">Sustain Carolina Week</Editable></h2>
              <PolicyProgress policy={getPolicy('sustain-carolina-week')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#3fb950] text-lg mb-3"><Editable k="environmental.sustainWeek.aboutTitle">About the Week</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="environmental.sustainWeek.aboutDescription" multiline>Sustain Carolina Week is a campus-wide celebration uniting student organizations, academic departments,
                  and community partners. The week features zero-waste challenges, sustainable fashion pop-ups, faculty
                  panels, and outdoor service projects like litter cleanups.</Editable>
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-center">
                    <p className="text-2xl font-semibold font-mono text-[#3fb950]"><Editable k="environmental.sustainWeek.dates">March 3-7</Editable></p>
                    <p className="text-sm text-[#6e7681]"><Editable k="environmental.sustainWeek.datesLabel">2026 Dates</Editable></p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-center">
                    <p className="text-2xl font-semibold font-mono text-[#58a6ff]">0</p>
                    <p className="text-sm text-[#6e7681]"><Editable k="environmental.sustainWeek.eventsPlanned">Events Planned</Editable></p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-center">
                    <p className="text-2xl font-semibold font-mono text-[#a371f7]">0</p>
                    <p className="text-sm text-[#6e7681]"><Editable k="environmental.sustainWeek.partners">Partners</Editable></p>
                  </div>
                </div>
              </div>

              {/* Event Categories */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="environmental.sustainWeek.plannedEventsTitle">Planned Events</Editable></h3>
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#3fb950]/20 border border-[#3fb950]/40 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">♻️</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#f0f6fc]"><Editable k="environmental.sustainWeek.event1.name">Zero-Waste Challenges</Editable></h4>
                      <p className="text-sm text-[#8b949e] mt-1"><Editable k="environmental.sustainWeek.event1.description">Campus-wide competitions to reduce waste and track impact</Editable></p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#3fb950]/20 border border-[#3fb950]/40 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">👗</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#f0f6fc]"><Editable k="environmental.sustainWeek.event2.name">Sustainable Fashion Pop-Up</Editable></h4>
                      <p className="text-sm text-[#8b949e] mt-1"><Editable k="environmental.sustainWeek.event2.description">Clothing swap and thrift market in the Pit</Editable></p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#3fb950]/20 border border-[#3fb950]/40 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎤</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#f0f6fc]"><Editable k="environmental.sustainWeek.event3.name">Faculty Sustainability Panels</Editable></h4>
                      <p className="text-sm text-[#8b949e] mt-1"><Editable k="environmental.sustainWeek.event3.description">Discussions on climate research and campus initiatives</Editable></p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#3fb950]/20 border border-[#3fb950]/40 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🧹</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#f0f6fc]"><Editable k="environmental.sustainWeek.event4.name">Litter Cleanup Day</Editable></h4>
                      <p className="text-sm text-[#8b949e] mt-1"><Editable k="environmental.sustainWeek.event4.description">Service project cleaning up campus and surrounding areas</Editable></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Get Involved */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4"><Editable k="environmental.sustainWeek.getInvolvedTitle">Get Involved</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="environmental.sustainWeek.getInvolvedDescription">Want to host an event or partner with Sustain Carolina Week? Let us know!</Editable>
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="px-6 py-3 bg-[#238636] text-white rounded font-medium hover:bg-[#2ea043] transition-colors">
                    <Editable k="environmental.sustainWeek.partnerButton">Partner With Us</Editable>
                  </button>
                  <a
                    href={calendarEvents.sustainCarolinaWeek}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded font-medium hover:bg-[#30363d] transition-colors inline-flex items-center gap-2"
                  >
                    <span>📅</span>
                    <Editable k="environmental.sustainWeek.addToCalendar">Add to Calendar</Editable>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Too Good To Go Tab */}
          {activeTab === 'too-good-to-go' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4"><Editable k="environmental.tgtg.title">Too Good To Go Program</Editable></h2>
              <PolicyProgress policy={getPolicy('too-good-to-go')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#3fb950] text-lg mb-3"><Editable k="environmental.tgtg.aboutTitle">About the Program</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="environmental.tgtg.aboutDescription" multiline>We're partnering with Carolina Dining Services to redistribute surplus dining hall meals through a
                  low-cost or free student access platform. This reduces food waste while addressing food insecurity—a
                  key intersection of sustainability and equity.</Editable>
                </p>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.tgtg.stats.mealsRedistributed">Meals Redistributed</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#58a6ff]">0 lbs</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.tgtg.stats.wasteReduced">Waste Reduced</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.tgtg.stats.studentsServed">Students Served</Editable></p>
                </div>
              </div>

              {/* How It Works */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="environmental.tgtg.howItWorksTitle">{tgtgGuide.title}</Editable></h3>
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                {tgtgGuide.steps.map((step) => (
                  <div key={step.step} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 relative">
                    <div className="absolute -top-3 left-4 bg-[#238636] text-white text-xs font-bold px-2 py-1 rounded">
                      <Editable k={`environmental.tgtg.step${step.step}.label`}>Step {step.step}</Editable>
                    </div>
                    <h4 className="font-semibold text-[#f0f6fc] mt-2 mb-2">{step.title}</h4>
                    <p className="text-sm text-[#8b949e]">{step.description}</p>
                  </div>
                ))}
              </div>

              {/* Locations */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="environmental.tgtg.locationsTitle">Participating Locations</Editable></h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#f0f6fc]"><Editable k="environmental.tgtg.location1.name">Lenoir Dining Hall</Editable></h4>
                    <p className="text-sm text-[#6e7681]"><Editable k="environmental.tgtg.location1.time">End of dinner service</Editable></p>
                  </div>
                  <span className="px-2.5 py-1 bg-[#3fb950]/10 border border-[#3fb950] text-[#3fb950] rounded text-xs font-mono uppercase">
                    <Editable k="environmental.tgtg.location1.status">Pilot</Editable>
                  </span>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#f0f6fc]"><Editable k="environmental.tgtg.location2.name">Chase Dining Hall</Editable></h4>
                    <p className="text-sm text-[#6e7681]"><Editable k="environmental.tgtg.location2.time">End of dinner service</Editable></p>
                  </div>
                  <span className="px-2.5 py-1 bg-[#3fb950]/10 border border-[#3fb950] text-[#3fb950] rounded text-xs font-mono uppercase">
                    <Editable k="environmental.tgtg.location2.status">Pilot</Editable>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Adopt-a-Space Tab */}
          {activeTab === 'adopt-a-space' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4"><Editable k="environmental.adoptSpace.title">Adopt-a-Space Program</Editable></h2>
              <PolicyProgress policy={getPolicy('adopt-a-space')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#3fb950] text-lg mb-3"><Editable k="environmental.adoptSpace.aboutTitle">About the Program</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="environmental.adoptSpace.aboutDescription" multiline>Empower student organizations, residence halls, and RAs to adopt designated campus spaces and maintain
                  them through regular cleanup events. Monthly Campus Cleanup Days offer service hours and team-building
                  opportunities while keeping our campus beautiful.</Editable>
                </p>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.adoptSpace.stats.spacesAdopted">Spaces Adopted</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#58a6ff]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.adoptSpace.stats.cleanupEvents">Cleanup Events</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.adoptSpace.stats.volunteers">Volunteers</Editable></p>
                </div>
              </div>

              {/* How It Works */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="environmental.adoptSpace.howItWorksTitle">{adoptGuide.title}</Editable></h3>
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                {adoptGuide.steps.map((step) => (
                  <div key={step.step} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 relative">
                    <div className="absolute -top-3 left-4 bg-[#238636] text-white text-xs font-bold px-2 py-1 rounded">
                      <Editable k={`environmental.adoptSpace.step${step.step}.label`}>Step {step.step}</Editable>
                    </div>
                    <h4 className="font-semibold text-[#f0f6fc] mt-2 mb-2">{step.title}</h4>
                    <p className="text-sm text-[#8b949e]">{step.description}</p>
                  </div>
                ))}
              </div>

              {/* Available Spaces */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="environmental.adoptSpace.availableSpacesTitle">Available Spaces</Editable></h3>
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center justify-between">
                  <span className="text-[#f0f6fc] font-medium"><Editable k="environmental.adoptSpace.space1.name">Polk Place Quad</Editable></span>
                  <span className="px-2 py-1 bg-[#3fb950]/10 border border-[#3fb950] text-[#3fb950] rounded text-xs font-mono">
                    <Editable k="environmental.adoptSpace.space1.status">Available</Editable>
                  </span>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center justify-between">
                  <span className="text-[#f0f6fc] font-medium"><Editable k="environmental.adoptSpace.space2.name">McCorkle Place</Editable></span>
                  <span className="px-2 py-1 bg-[#3fb950]/10 border border-[#3fb950] text-[#3fb950] rounded text-xs font-mono">
                    <Editable k="environmental.adoptSpace.space2.status">Available</Editable>
                  </span>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center justify-between">
                  <span className="text-[#f0f6fc] font-medium"><Editable k="environmental.adoptSpace.space3.name">The Pit Area</Editable></span>
                  <span className="px-2 py-1 bg-[#3fb950]/10 border border-[#3fb950] text-[#3fb950] rounded text-xs font-mono">
                    <Editable k="environmental.adoptSpace.space3.status">Available</Editable>
                  </span>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center justify-between">
                  <span className="text-[#f0f6fc] font-medium"><Editable k="environmental.adoptSpace.space4.name">South Campus Walkways</Editable></span>
                  <span className="px-2 py-1 bg-[#3fb950]/10 border border-[#3fb950] text-[#3fb950] rounded text-xs font-mono">
                    <Editable k="environmental.adoptSpace.space4.status">Available</Editable>
                  </span>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center justify-between">
                  <span className="text-[#f0f6fc] font-medium"><Editable k="environmental.adoptSpace.space5.name">Stadium Drive</Editable></span>
                  <span className="px-2 py-1 bg-[#3fb950]/10 border border-[#3fb950] text-[#3fb950] rounded text-xs font-mono">
                    <Editable k="environmental.adoptSpace.space5.status">Available</Editable>
                  </span>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center justify-between">
                  <span className="text-[#f0f6fc] font-medium"><Editable k="environmental.adoptSpace.space6.name">Kenan Woods Trail</Editable></span>
                  <span className="px-2 py-1 bg-[#3fb950]/10 border border-[#3fb950] text-[#3fb950] rounded text-xs font-mono">
                    <Editable k="environmental.adoptSpace.space6.status">Available</Editable>
                  </span>
                </div>
              </div>

              {/* Register */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4"><Editable k="environmental.adoptSpace.registerTitle">Register Your Organization</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="environmental.adoptSpace.registerDescription">Adopt a space and commit to regular cleanup events. Earn service hours and leaderboard recognition!</Editable>
                </p>
                <button
                  onClick={() => setShowAdoptModal(true)}
                  className="px-6 py-3 bg-[#238636] text-white rounded font-medium hover:bg-[#2ea043] transition-colors"
                >
                  <Editable k="environmental.adoptSpace.adoptButton">Adopt a Space</Editable>
                </button>
              </div>
            </div>
          )}

          {/* Composting Tab */}
          {activeTab === 'composting' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4"><Editable k="environmental.composting.title">Composting Expansion</Editable></h2>
              <PolicyProgress policy={getPolicy('composting-expansion')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#3fb950] text-lg mb-3"><Editable k="environmental.composting.aboutTitle">About the Initiative</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="environmental.composting.aboutDescription" multiline>We're expanding composting infrastructure across campus, particularly in dining halls. In collaboration
                  with Carolina Dining and Facilities, we're installing more compost bins and plate-clearing systems with
                  educational signage and student ambassadors to help reduce waste sent to landfills.</Editable>
                </p>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.composting.stats.stations">Stations</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#58a6ff]">0 lbs</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.composting.stats.wasteDiverted">Waste Diverted</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.composting.stats.ambassadors">Ambassadors</Editable></p>
                </div>
              </div>

              {/* What Can Be Composted */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="environmental.composting.whatCanBeComposted">What Can Be Composted</Editable></h3>
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6">
                  <h4 className="font-semibold text-[#3fb950] mb-4"><Editable k="environmental.composting.yesTitle">Yes - Compost These</Editable></h4>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">✓</span> <Editable k="environmental.composting.yes1">Food scraps & leftovers</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">✓</span> <Editable k="environmental.composting.yes2">Coffee grounds & filters</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">✓</span> <Editable k="environmental.composting.yes3">Paper napkins & towels</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">✓</span> <Editable k="environmental.composting.yes4">Cardboard (uncoated)</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">✓</span> <Editable k="environmental.composting.yes5">Fruit & vegetable peels</Editable></li>
                  </ul>
                </div>

                <div className="bg-[#161b22] border border-[#f85149]/30 rounded-lg p-6">
                  <h4 className="font-semibold text-[#f85149] mb-4"><Editable k="environmental.composting.noTitle">No - Don't Compost These</Editable></h4>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li className="flex items-center gap-2"><span className="text-[#f85149]">✗</span> <Editable k="environmental.composting.no1">Plastic containers or utensils</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#f85149]">✗</span> <Editable k="environmental.composting.no2">Styrofoam</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#f85149]">✗</span> <Editable k="environmental.composting.no3">Metal or glass</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#f85149]">✗</span> <Editable k="environmental.composting.no4">Coated paper products</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#f85149]">✗</span> <Editable k="environmental.composting.no5">Meat bones (large)</Editable></li>
                  </ul>
                </div>
              </div>

              {/* Become an Ambassador */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4"><Editable k="environmental.composting.ambassadorTitle">Become a Composting Ambassador</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="environmental.composting.ambassadorDescription">Help educate fellow students about proper composting. Ambassadors staff stations during peak hours
                  and earn service hours.</Editable>
                </p>
                <button className="px-6 py-3 bg-[#238636] text-white rounded font-medium hover:bg-[#2ea043] transition-colors">
                  <Editable k="environmental.composting.signUpButton">Sign Up</Editable>
                </button>
              </div>
            </div>
          )}

          {/* Move-Out Shop Tab */}
          {activeTab === 'moveout-shop' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4"><Editable k="environmental.moveout.title">Move-Out Donation Shop</Editable></h2>
              <PolicyProgress policy={getPolicy('moveout-shop')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#3fb950] text-lg mb-3"><Editable k="environmental.moveout.aboutTitle">About the Shop</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="environmental.moveout.aboutDescription" multiline>The Move-Out Donation Shop is a Carolina Thrift-style initiative operated semiannually to collect,
                  sort, and resell or donate discarded items. We reduce landfill waste, promote reuse, and support
                  affordability for students needing inexpensive supplies at the start of each semester.</Editable>
                </p>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.moveout.stats.itemsCollected">Items Collected</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#58a6ff]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.moveout.stats.itemsSold">Items Sold</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="environmental.moveout.stats.itemsDonated">Items Donated</Editable></p>
                </div>
              </div>

              {/* Accepted Items */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="environmental.moveout.acceptedItemsTitle">What We Accept</Editable></h3>
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                  <span className="text-3xl">🪑</span>
                  <p className="text-[#f0f6fc] font-medium mt-2"><Editable k="environmental.moveout.item1.name">Furniture</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1"><Editable k="environmental.moveout.item1.examples">Chairs, desks, lamps, shelves</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                  <span className="text-3xl">💻</span>
                  <p className="text-[#f0f6fc] font-medium mt-2"><Editable k="environmental.moveout.item2.name">Electronics</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1"><Editable k="environmental.moveout.item2.examples">Chargers, cables, small appliances</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                  <span className="text-3xl">📚</span>
                  <p className="text-[#f0f6fc] font-medium mt-2"><Editable k="environmental.moveout.item3.name">School Supplies</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1"><Editable k="environmental.moveout.item3.examples">Notebooks, binders, organizers</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                  <span className="text-3xl">🛏️</span>
                  <p className="text-[#f0f6fc] font-medium mt-2"><Editable k="environmental.moveout.item4.name">Dorm Items</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1"><Editable k="environmental.moveout.item4.examples">Bedding, storage, decor</Editable></p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4"><Editable k="environmental.moveout.donateTitle">Donate Items</Editable></h3>
                  <p className="text-[#8b949e] mb-4">
                    <Editable k="environmental.moveout.donateDescription">Moving out? Schedule a pickup or drop off items at designated locations during finals week.</Editable>
                  </p>
                  <button
                    onClick={() => setShowDonateModal(true)}
                    className="px-6 py-3 bg-[#238636] text-white rounded font-medium hover:bg-[#2ea043] transition-colors"
                  >
                    <Editable k="environmental.moveout.scheduleDonationButton">Schedule Donation</Editable>
                  </button>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4"><Editable k="environmental.moveout.shopTitle">Shop the Store</Editable></h3>
                  <p className="text-[#8b949e] mb-4">
                    <Editable k="environmental.moveout.shopDescription">Find affordable supplies at the start of each semester. All proceeds support sustainability programs.</Editable>
                  </p>
                  <button className="px-6 py-3 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded font-medium hover:bg-[#30363d] transition-colors">
                    <Editable k="environmental.moveout.viewScheduleButton">View Schedule</Editable>
                  </button>
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
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-6"><Editable k="environmental.faq.contactTitle">Contact Us</Editable></h2>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#3fb950]/20 border border-[#3fb950]/40 rounded-full flex items-center justify-center">
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
                        <a href={`mailto:${contact.lead.email}`} className="text-[#3fb950] hover:underline">{contact.lead.email}</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">📱</span>
                        <span className="text-[#f0f6fc]">{contact.socialMedia}</span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Form */}
                  <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h3 className="font-semibold text-[#f0f6fc] mb-4"><Editable k="environmental.faq.feedbackTitle">Send Feedback</Editable></h3>
                    {feedbackSubmitted ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-[#3fb950]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">✓</span>
                        </div>
                        <p className="text-[#3fb950] font-medium"><Editable k="environmental.faq.feedbackThanks">Thanks for your feedback!</Editable></p>
                        <button onClick={() => setFeedbackSubmitted(false)} className="text-[#238636] text-sm mt-2 hover:underline"><Editable k="environmental.faq.sendAnother">Send another</Editable></button>
                      </div>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                        <Select label="Topic" name="topic" value={feedbackForm.topic} onChange={e => setFeedbackForm({...feedbackForm, topic: e.target.value})} required
                          options={[
                            { value: 'sustain-week', label: 'Sustain Carolina Week' },
                            { value: 'too-good-to-go', label: 'Too Good To Go' },
                            { value: 'adopt-a-space', label: 'Adopt-a-Space' },
                            { value: 'composting', label: 'Composting' },
                            { value: 'moveout-shop', label: 'Move-Out Shop' },
                            { value: 'other', label: 'Other' },
                          ]}
                        />
                        <Textarea label="Message" name="message" value={feedbackForm.message} onChange={e => setFeedbackForm({...feedbackForm, message: e.target.value})} required rows={3} />
                        <Input label="Email (optional)" type="email" name="email" value={feedbackForm.email} onChange={e => setFeedbackForm({...feedbackForm, email: e.target.value})} />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#238636] text-white px-4 py-2.5 rounded font-semibold hover:bg-[#2ea043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Submitting...' : <Editable k="environmental.faq.submitFeedbackButton">Submit Feedback</Editable>}
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-6"><Editable k="environmental.faq.faqTitle">Frequently Asked Questions</Editable></h2>
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
                <h3 className="text-lg font-bold text-[#f0f6fc] tracking-tight mb-4"><Editable k="environmental.faq.recentUpdatesTitle">Recent Updates</Editable></h3>
                <div className="space-y-3">
                  {announcements.map(ann => (
                    <div key={ann.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-start gap-4">
                      <div className={`px-2 py-1 rounded text-xs font-mono ${
                        ann.type === 'event' ? 'bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]' :
                        ann.type === 'deadline' ? 'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]' :
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

      {/* Adopt-a-Space Modal */}
      {showAdoptModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5"><Editable k="environmental.adoptModal.title">Adopt a Campus Space</Editable></h3>
            <form onSubmit={handleAdoptSubmit} className="space-y-5">
              <Input label="Organization Name" name="orgName" value={adoptForm.orgName} onChange={e => setAdoptForm({...adoptForm, orgName: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <Input label="Contact Person" name="contact" value={adoptForm.contact} onChange={e => setAdoptForm({...adoptForm, contact: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <Input label="Email" type="email" name="email" value={adoptForm.email} onChange={e => setAdoptForm({...adoptForm, email: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <Select label="Preferred Space" name="space" value={adoptForm.space} onChange={e => setAdoptForm({...adoptForm, space: e.target.value})} required
                options={[
                  { value: 'polk', label: 'Polk Place Quad' },
                  { value: 'mccorkle', label: 'McCorkle Place' },
                  { value: 'pit', label: 'The Pit Area' },
                  { value: 'south', label: 'South Campus Walkways' },
                  { value: 'stadium', label: 'Stadium Drive' },
                  { value: 'kenan', label: 'Kenan Woods Trail' },
                ]}
                className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isAdoptSubmitting}
                  className="px-6 py-3 bg-[#238636] text-white rounded font-medium hover:bg-[#2ea043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdoptSubmitting ? 'Submitting...' : <Editable k="environmental.adoptModal.registerButton">Register</Editable>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdoptModal(false)}
                  disabled={isAdoptSubmitting}
                  className="px-6 py-3 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded font-medium hover:bg-[#30363d] transition-colors disabled:opacity-50"
                >
                  <Editable k="environmental.adoptModal.cancelButton">Cancel</Editable>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Donate Items Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5"><Editable k="environmental.donateModal.title">Schedule a Donation</Editable></h3>
            <form onSubmit={handleDonateSubmit} className="space-y-5">
              <Input label="Your Name" name="name" value={donateForm.name} onChange={e => setDonateForm({...donateForm, name: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <Input label="Email" type="email" name="email" value={donateForm.email} onChange={e => setDonateForm({...donateForm, email: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <Textarea label="Items to Donate" name="items" value={donateForm.items} onChange={e => setDonateForm({...donateForm, items: e.target.value})} required rows={3} placeholder="List the items you'd like to donate..." className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <Input label="Preferred Pickup Date" type="date" name="pickupDate" value={donateForm.pickupDate} onChange={e => setDonateForm({...donateForm, pickupDate: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isDonateSubmitting}
                  className="px-6 py-3 bg-[#238636] text-white rounded font-medium hover:bg-[#2ea043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDonateSubmitting ? 'Submitting...' : <Editable k="environmental.donateModal.scheduleButton">Schedule</Editable>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDonateModal(false)}
                  disabled={isDonateSubmitting}
                  className="px-6 py-3 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded font-medium hover:bg-[#30363d] transition-colors disabled:opacity-50"
                >
                  <Editable k="environmental.donateModal.cancelButton">Cancel</Editable>
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
