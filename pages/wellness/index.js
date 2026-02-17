import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { wellnessResources, departmentContacts, departmentFAQs, departmentAnnouncements, serviceGuides } from '../../lib/data'
import {
  submitForm,
  phoneNumbers,
  calendarEvents,
  templates,
  externalLinks,
  emailTemplates,
} from '../../lib/integrations'
import {
  Editable,
  EditableNum,
  EditableText,
  EditableNumber,
  EditableToggle,
  EditableBulletList,
  EditableLocationCard,
  AddItemButton,
  AdminEditBanner,
  EditModeToggle,
} from '../../components/InlineEditor'

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

export default function WellnessPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showRideForm, setShowRideForm] = useState(false)
  const [showSafetyPlanForm, setShowSafetyPlanForm] = useState(false)
  const [showVolunteerForm, setShowVolunteerForm] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rideFormData, setRideFormData] = useState({ name: '', phone: '', pickup: '', destination: '', passengers: '1' })
  const [volunteerFormData, setVolunteerFormData] = useState({ name: '', email: '', pid: '', hasCar: '', reason: '' })
  const [safetyFormData, setSafetyFormData] = useState({ org: '', event: '', date: '', location: '', attendance: '', transport: '', contacts: '', additional: '' })
  const {
    policies,
    isAdmin,
    pageContent,
    updatePageContent,
    updatePageContentItem,
    addPageContentItem,
    deletePageContentItem,
  } = useApp()

  const content = pageContent?.wellness || {}
  const deptPolicies = policies.filter(p => p.department === 'wellness')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'caps-access', label: 'CAPS Access' },
    { id: 'safety-rides', label: 'Safety & Rides' },
    { id: 'planb-narcan', label: 'Plan B & Narcan' },
    { id: 'event-safety', label: 'Event Safety' },
    { id: 'wellness-button', label: 'Wellness Button' },
    { id: 'health-integration', label: 'Health Integration' },
    { id: 'faq', label: 'FAQ & Contact' },
  ]

  const contact = departmentContacts.wellness
  const faqs = departmentFAQs.wellness
  const announcements = departmentAnnouncements.wellness
  const capsGuide = serviceGuides['caps-dropin']
  const rideGuide = serviceGuides['safe-ride']
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [feedbackForm, setFeedbackForm] = useState({ topic: '', message: '', email: '' })
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await submitForm('wellness-feedback', {
        ...feedbackForm,
        department: 'wellness',
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

  const handleFormSubmit = (type, formData) => async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await submitForm(`wellness-${type}`, {
        ...formData,
        formType: type,
        department: 'wellness',
        timestamp: new Date().toISOString(),
      })
      if (result.success) {
        setSubmitted(type)
        setShowRideForm(false)
        setShowSafetyPlanForm(false)
        setShowVolunteerForm(false)
        if (type === 'ride') setRideFormData({ name: '', phone: '', pickup: '', destination: '', passengers: '1' })
        if (type === 'volunteer') setVolunteerFormData({ name: '', email: '', pid: '', hasCar: '', reason: '' })
        if (type === 'safetyplan') setSafetyFormData({ org: '', event: '', date: '', location: '', attendance: '', transport: '', contacts: '', additional: '' })
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadSafetyTemplate = () => {
    const templateContent = templates.safetyPlanTemplate()
    const blob = new Blob([templateContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'event-safety-plan-template.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getPolicy = (id) => deptPolicies.find(p => p.id === id)

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
        <title>Student Wellness | Project Bold</title>
      </Head>

      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center relative overflow-hidden border-b border-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <Reveal>
            <span className="caption mb-6 block">Student Wellness</span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="hero-title mb-6">
              Your Health
              <br />
              Matters
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="hero-subtitle max-w-2xl mb-10">
              Mental health, safety, and holistic student wellbeing. Access CAPS, crisis support, wellness resources, and safety programs.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Crisis Banner */}
      <div className="bg-red-900/30 border-b border-red-800/50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <p className="font-medium text-white text-sm tracking-wide">
              In Crisis? Get immediate help:
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href={`tel:${content.crisisHotlines?.national || '988'}`} className="btn-primary text-sm py-2 px-4">
              CALL {content.crisisHotlines?.national || '988'}
            </a>
            <a href={`sms:${content.crisisHotlines?.textLine || '741741'}`} className="btn-secondary text-sm py-2 px-4">
              TEXT {content.crisisHotlines?.textLine || '741741'}
            </a>
            <a href={`tel:${content.crisisHotlines?.caps || '919-966-3658'}`} className="btn-secondary text-sm py-2 px-4">
              CAPS: {content.crisisHotlines?.caps || '919-966-3658'}
            </a>
          </div>
        </div>
      </div>

      <AdminEditBanner />

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
          {submitted && (
            <Reveal>
              <div className="card-highlight p-6 mb-8">
                <p className="text-white font-medium">
                  {submitted === 'ride' && 'Your ride request has been submitted! You will receive a confirmation shortly.'}
                  {submitted === 'safetyplan' && 'Your event safety plan has been submitted for review. We will contact you within 2 business days.'}
                  {submitted === 'volunteer' && 'Thank you for volunteering! We will reach out with training information.'}
                </p>
                <button onClick={() => setSubmitted(null)} className="text-gray-400 text-sm font-medium mt-3 hover:text-white transition-colors">
                  Dismiss
                </button>
              </div>
            </Reveal>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-8">Wellness Initiatives Overview</h2>
              </Reveal>

              <div className="grid md:grid-cols-2 gap-6 mb-16">
                {deptPolicies.map((policy, index) => (
                  <Reveal key={policy.id} delay={index * 50}>
                    <div
                      className="card p-6 cursor-pointer group"
                      onClick={() => setActiveTab(policy.id === 'caps-expansion' ? 'caps-access' :
                        policy.id === 'safety-taskforce' ? 'safety-rides' :
                        policy.id === 'planb-narcan' ? 'planb-narcan' :
                        policy.id === 'event-safety' ? 'event-safety' :
                        policy.id === 'wellness-button' ? 'wellness-button' :
                        policy.id === 'health-integration' ? 'health-integration' : 'overview')}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white group-hover:text-gray-300 transition-colors pr-4">{policy.title}</h3>
                        <span className="px-2 py-1 rounded text-xs font-mono text-gray-400 bg-white/5">
                          {policy.progress}%
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-6 line-clamp-2">{policy.description}</p>
                      <div className="h-1 bg-gray-800 rounded overflow-hidden">
                        <div className="h-full bg-white rounded transition-all" style={{ width: `${policy.progress}%` }} />
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-6">Quick Resources</h3>
              </Reveal>
              <div className="grid md:grid-cols-3 gap-6">
                {wellnessResources.slice(0, 3).map((resource, index) => (
                  <Reveal key={resource.id} delay={index * 50}>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="card p-6 group">
                      <h4 className="font-semibold text-white group-hover:text-gray-300 transition-colors mb-2">{resource.name}</h4>
                      <p className="text-sm text-gray-500 mb-3">{resource.hours}</p>
                      <p className="text-white font-mono text-sm">{resource.phone}</p>
                    </a>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* CAPS Access Tab */}
          {activeTab === 'caps-access' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2">Expand CAPS Access</h2>
                <p className="body-large text-gray-400 mb-8">Drop-In Hours and More Locations Across Campus</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('caps-expansion')} />

              <div className="grid lg:grid-cols-2 gap-12 mb-16">
                <div>
                  <Reveal>
                    <span className="caption mb-6 block">Drop-In Locations</span>
                  </Reveal>
                  <div className="space-y-4">
                    {(content.capsLocations || []).map((loc, index) => (
                      <Reveal key={loc.id} delay={index * 50}>
                        <EditableLocationCard
                          location={loc}
                          onUpdate={(updated) => updatePageContentItem('wellness', 'capsLocations', loc.id, updated)}
                          onDelete={() => deletePageContentItem('wellness', 'capsLocations', loc.id)}
                          showPlanB={false}
                          showNarcan={false}
                        />
                      </Reveal>
                    ))}
                    <AddItemButton
                      onClick={() => addPageContentItem('wellness', 'capsLocations', {
                        name: 'New Location',
                        location: 'Building Name',
                        hours: 'Hours TBD',
                        status: 'coming',
                      })}
                      label="Add Location"
                    />
                  </div>
                </div>

                <div>
                  <Reveal>
                    <span className="caption mb-6 block">Virtual Counseling</span>
                  </Reveal>
                  <Reveal delay={100}>
                    <div className="card-highlight p-8">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-6">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold text-white mb-3">Telehealth Sessions Available</h4>
                      <p className="text-gray-400 mb-6">Access counseling from anywhere with our expanded virtual options. Schedule through ConnectCarolina.</p>
                      <a href="https://caps.unc.edu" target="_blank" rel="noopener noreferrer" className="btn-primary">
                        Schedule Appointment
                      </a>
                    </div>
                  </Reveal>

                  {capsGuide && (
                    <Reveal delay={200}>
                      <div className="mt-8">
                        <h4 className="text-lg font-semibold text-white mb-6">{capsGuide.title}</h4>
                        <div className="space-y-4">
                          {capsGuide.steps.map(step => (
                            <div key={step.step} className="flex gap-4">
                              <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {step.step}
                              </div>
                              <div>
                                <p className="font-medium text-white">{step.title}</p>
                                <p className="text-sm text-gray-500">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Reveal>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Safety & Rides Tab */}
          {activeTab === 'safety-rides' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2">Off-Campus Safety Task Force</h2>
                <p className="body-large text-gray-400 mb-8">Late-Night Ride Programs and SafeWalk Expansion</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('safety-taskforce')} />

              <div className="grid lg:grid-cols-2 gap-8 mb-16">
                <Reveal>
                  <div className="card-highlight p-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Request a Late-Night Ride</h3>
                    <p className="text-gray-400 mb-8">Safe, peer-driven transportation home from off-campus locations. Available Thu-Sat 10pm-3am.</p>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="text-center">
                        <p className="text-3xl font-mono font-bold text-white">
                          <EditableNumber
                            value={content.rideStats?.ridesGiven || 247}
                            onChange={(val) => updatePageContent('wellness', 'rideStats', { ...content.rideStats, ridesGiven: val })}
                          />
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Rides Given</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-mono font-bold text-white">
                          <EditableNumber
                            value={content.rideStats?.volunteers || 32}
                            onChange={(val) => updatePageContent('wellness', 'rideStats', { ...content.rideStats, volunteers: val })}
                          />
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Volunteers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-mono font-bold text-white">
                          <EditableNumber
                            value={content.rideStats?.avgRating || 4.9}
                            onChange={(val) => updatePageContent('wellness', 'rideStats', { ...content.rideStats, avgRating: val })}
                          />
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Rating</p>
                      </div>
                    </div>

                    <button onClick={() => setShowRideForm(!showRideForm)} className="btn-primary w-full">
                      {showRideForm ? 'Close' : 'Request a Ride'}
                    </button>
                    {showRideForm && (
                      <form onSubmit={handleFormSubmit('ride', rideFormData)} className="mt-6 pt-6 border-t border-gray-800 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="Your Name" required value={rideFormData.name} onChange={e => setRideFormData({...rideFormData, name: e.target.value})} />
                          <Input label="Phone" type="tel" required value={rideFormData.phone} onChange={e => setRideFormData({...rideFormData, phone: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="Pickup" required placeholder="e.g., 123 Franklin St" value={rideFormData.pickup} onChange={e => setRideFormData({...rideFormData, pickup: e.target.value})} />
                          <Input label="Destination" required placeholder="e.g., Granville Towers" value={rideFormData.destination} onChange={e => setRideFormData({...rideFormData, destination: e.target.value})} />
                        </div>
                        <Select label="Passengers" required value={rideFormData.passengers} onChange={e => setRideFormData({...rideFormData, passengers: e.target.value})}
                          options={[{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }]}
                        />
                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                          {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                      </form>
                    )}
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="card p-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Become a Safe Ride Volunteer</h3>
                    <p className="text-gray-400 mb-8">Help keep fellow Tar Heels safe. Volunteer drivers receive training, gas reimbursement, and service hours.</p>

                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center gap-3 text-gray-400">
                        <span className="text-white">—</span> Background check & training provided
                      </li>
                      <li className="flex items-center gap-3 text-gray-400">
                        <span className="text-white">—</span> Flexible scheduling
                      </li>
                      <li className="flex items-center gap-3 text-gray-400">
                        <span className="text-white">—</span> Gas reimbursement included
                      </li>
                      <li className="flex items-center gap-3 text-gray-400">
                        <span className="text-white">—</span> Earn service hours
                      </li>
                    </ul>

                    <button onClick={() => setShowVolunteerForm(!showVolunteerForm)} className="btn-secondary w-full">
                      {showVolunteerForm ? 'Close' : 'Apply to Volunteer'}
                    </button>
                    {showVolunteerForm && (
                      <form onSubmit={handleFormSubmit('volunteer', volunteerFormData)} className="mt-6 pt-6 border-t border-gray-800 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="Full Name" required value={volunteerFormData.name} onChange={e => setVolunteerFormData({...volunteerFormData, name: e.target.value})} />
                          <Input label="Email" type="email" required value={volunteerFormData.email} onChange={e => setVolunteerFormData({...volunteerFormData, email: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="PID" required value={volunteerFormData.pid} onChange={e => setVolunteerFormData({...volunteerFormData, pid: e.target.value})} />
                          <Select label="Have a car?" required value={volunteerFormData.hasCar} onChange={e => setVolunteerFormData({...volunteerFormData, hasCar: e.target.value})}
                            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No (navigator)' }]}
                          />
                        </div>
                        <Textarea label="Why volunteer?" rows={2} value={volunteerFormData.reason} onChange={e => setVolunteerFormData({...volunteerFormData, reason: e.target.value})} />
                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                          {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                      </form>
                    )}
                  </div>
                </Reveal>
              </div>

              {rideGuide && (
                <Reveal>
                  <div className="card p-8">
                    <h3 className="text-xl font-semibold text-white mb-8">{rideGuide.title}</h3>
                    <div className="grid md:grid-cols-4 gap-6">
                      {rideGuide.steps.map(step => (
                        <div key={step.step} className="relative">
                          <div className="absolute -top-3 left-4 bg-white text-black text-xs font-bold px-2 py-1 rounded">
                            Step {step.step}
                          </div>
                          <div className="bg-white/5 rounded-lg p-5 pt-6">
                            <h4 className="font-medium text-white mb-2">{step.title}</h4>
                            <p className="text-sm text-gray-500">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              {/* Success notification */}
              {submitted && (
                <div className="card p-4 bg-green-500/5 border-green-500/20">
                  <p className="text-green-400 text-sm">Submitted successfully. We&apos;ll be in touch shortly.</p>
                </div>
              )}
            </div>
          )}

          {/* Plan B & Narcan Tab */}
          {activeTab === 'planb-narcan' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2">Plan B & Narcan Distribution</h2>
                <p className="body-large text-gray-400 mb-8">Increased Access to Life-Saving Resources Across Campus</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('planb-narcan')} />

              <Reveal>
                <span className="caption mb-6 block">Distribution Locations</span>
              </Reveal>
              <div className="grid md:grid-cols-3 gap-6 mb-16">
                {(content.distributionLocations || []).map((loc, index) => (
                  <Reveal key={loc.id} delay={index * 50}>
                    <EditableLocationCard
                      location={loc}
                      onUpdate={(updated) => updatePageContentItem('wellness', 'distributionLocations', loc.id, updated)}
                      onDelete={() => deletePageContentItem('wellness', 'distributionLocations', loc.id)}
                      showPlanB={true}
                      showNarcan={true}
                    />
                  </Reveal>
                ))}
                <AddItemButton
                  onClick={() => addPageContentItem('wellness', 'distributionLocations', {
                    name: 'New Location',
                    address: 'Building/Room',
                    hours: 'Hours TBD',
                    planb: false,
                    narcan: true,
                  })}
                  label="Add Location"
                  className="h-full min-h-[120px] flex items-center justify-center"
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <Reveal>
                  <div className="card-highlight p-8">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      <EditableText
                        value={content.aboutPlanB?.title || 'About Plan B'}
                        onChange={(val) => updatePageContent('wellness', 'aboutPlanB', { ...content.aboutPlanB, title: val })}
                      />
                    </h3>
                    <p className="text-gray-400 mb-6">
                      <EditableText
                        value={content.aboutPlanB?.description || "Plan B (levonorgestrel) is emergency contraception that can prevent pregnancy when taken within 72 hours of unprotected sex. It's most effective when taken as soon as possible."}
                        onChange={(val) => updatePageContent('wellness', 'aboutPlanB', { ...content.aboutPlanB, description: val })}
                        multiline
                      />
                    </p>
                    <EditableBulletList
                      items={content.aboutPlanB?.bullets || [
                        'Available free to all UNC students',
                        'No appointment or ID needed at most locations',
                        'Confidential - no questions asked',
                      ]}
                      onChange={(items) => updatePageContent('wellness', 'aboutPlanB', { ...content.aboutPlanB, bullets: items })}
                    />
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="card p-8">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      <EditableText
                        value={content.aboutNarcan?.title || 'About Narcan (Naloxone)'}
                        onChange={(val) => updatePageContent('wellness', 'aboutNarcan', { ...content.aboutNarcan, title: val })}
                      />
                    </h3>
                    <p className="text-gray-400 mb-6">
                      <EditableText
                        value={content.aboutNarcan?.description || "Narcan is a life-saving medication that can reverse an opioid overdose. It's safe, easy to use, and can be the difference between life and death."}
                        onChange={(val) => updatePageContent('wellness', 'aboutNarcan', { ...content.aboutNarcan, description: val })}
                        multiline
                      />
                    </p>
                    <EditableBulletList
                      items={content.aboutNarcan?.bullets || [
                        'Free training available monthly',
                        'Nasal spray - no needles required',
                        'Good Samaritan law protects you',
                      ]}
                      onChange={(items) => updatePageContent('wellness', 'aboutNarcan', { ...content.aboutNarcan, bullets: items })}
                    />
                    <a href={emailTemplates.volunteerInquiry.replace('Safe Ride Volunteer', 'Narcan Training')}
                      className="btn-primary mt-6 inline-block">
                      Sign Up for Training
                    </a>
                  </div>
                </Reveal>
              </div>
            </div>
          )}

          {/* Event Safety Tab */}
          {activeTab === 'event-safety' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2">Off-Campus Event Safety Planning</h2>
                <p className="body-large text-gray-400 mb-8">Safety Plans for Registered Student Organization Events</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('event-safety')} />

              <div className="grid lg:grid-cols-2 gap-12 mb-16">
                <div>
                  <Reveal>
                    <span className="caption mb-6 block">Submit a Safety Plan</span>
                  </Reveal>
                  <Reveal delay={100}>
                    <div className="card p-8">
                      <p className="text-gray-400 mb-8">
                        Registered student organizations hosting off-campus events with 50+ attendees must submit a safety plan at least 7 days in advance.
                      </p>

                      <div className="space-y-4 mb-8">
                        {['Transportation plan', 'Crowd management strategy', 'Emergency contact list', 'Sober monitor assignments'].map((req, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-white">—</span>
                            <span className="text-gray-300">{req}</span>
                          </div>
                        ))}
                      </div>

                      <button onClick={() => setShowSafetyPlanForm(!showSafetyPlanForm)} className="btn-primary w-full">
                        {showSafetyPlanForm ? 'Close' : 'Start Safety Plan'}
                      </button>
                      {showSafetyPlanForm && (
                        <form onSubmit={handleFormSubmit('safetyplan', safetyFormData)} className="mt-6 pt-6 border-t border-gray-800 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Input label="Organization" required value={safetyFormData.org} onChange={e => setSafetyFormData({...safetyFormData, org: e.target.value})} />
                            <Input label="Event Name" required value={safetyFormData.event} onChange={e => setSafetyFormData({...safetyFormData, event: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <Input label="Date" type="date" required value={safetyFormData.date} onChange={e => setSafetyFormData({...safetyFormData, date: e.target.value})} />
                            <Input label="Location" required value={safetyFormData.location} onChange={e => setSafetyFormData({...safetyFormData, location: e.target.value})} />
                            <Input label="Attendance" type="number" required value={safetyFormData.attendance} onChange={e => setSafetyFormData({...safetyFormData, attendance: e.target.value})} />
                          </div>
                          <Textarea label="Transportation plan" rows={2} value={safetyFormData.transport} onChange={e => setSafetyFormData({...safetyFormData, transport: e.target.value})} />
                          <Textarea label="Emergency contacts" rows={2} value={safetyFormData.contacts} onChange={e => setSafetyFormData({...safetyFormData, contacts: e.target.value})} />
                          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                            {isSubmitting ? 'Submitting...' : 'Submit Safety Plan'}
                          </button>
                        </form>
                      )}
                    </div>
                  </Reveal>
                </div>

                <div>
                  <Reveal>
                    <span className="caption mb-6 block">Workshops & Resources</span>
                  </Reveal>

                  <div className="space-y-4">
                    <Reveal delay={100}>
                      <div className="card-highlight p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-2 py-1 rounded text-xs bg-white/10 text-white">WORKSHOP</span>
                          <span className="text-xs text-gray-500 font-mono">Feb 10, 2026</span>
                        </div>
                        <h4 className="font-semibold text-white">Event Safety 101</h4>
                        <p className="text-sm text-gray-400 mt-2">Learn the basics of creating effective safety plans. 5pm, Union 3201</p>
                        <a href={calendarEvents.eventSafetyWorkshop} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-4 text-white text-sm font-medium hover:text-gray-300 transition-colors">
                          Add to Calendar
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </a>
                      </div>
                    </Reveal>

                    <Reveal delay={150}>
                      <div className="card p-6">
                        <h4 className="font-semibold text-white mb-2">Safety Plan Template</h4>
                        <p className="text-sm text-gray-400 mb-4">Download our template to get started on your event safety plan.</p>
                        <button onClick={downloadSafetyTemplate} className="text-white text-sm font-medium hover:text-gray-300 transition-colors">
                          Download Template (TXT) →
                        </button>
                      </div>
                    </Reveal>

                    <Reveal delay={200}>
                      <div className="card p-6">
                        <h4 className="font-semibold text-white mb-2">Best Practices Guide</h4>
                        <p className="text-sm text-gray-400 mb-4">Comprehensive guide to hosting safe off-campus events.</p>
                        <button className="text-white text-sm font-medium hover:text-gray-300 transition-colors">
                          View Guide →
                        </button>
                      </div>
                    </Reveal>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Wellness Button Tab */}
          {activeTab === 'wellness-button' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2">Student Wellness Button in Canvas</h2>
                <p className="body-large text-gray-400 mb-8">One-Click Access to Mental Health, Medical, and Safety Resources</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('wellness-button')} />

              <Reveal>
                <div className="card p-10 mb-16">
                  <span className="caption mb-8 block">Canvas Integration Preview</span>

                  <div className="bg-white/5 rounded-lg p-8 max-w-2xl">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-800">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-black font-bold text-xl">W</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Student Wellness</p>
                        <p className="text-sm text-gray-500">Click for instant access to resources</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { icon: 'C', label: 'CAPS' },
                        { icon: 'H', label: 'Health' },
                        { icon: 'P', label: 'Plan B/Narcan' },
                        { icon: 'R', label: 'Safe Ride' },
                      ].map((item, i) => (
                        <div key={i} className="card p-4 text-center cursor-pointer">
                          <span className="text-2xl font-bold text-white">{item.icon}</span>
                          <p className="text-xs font-medium text-gray-400 mt-3">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal>
                <span className="caption mb-6 block">Quick Access Resources</span>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'CAPS Appointments', desc: 'Schedule counseling sessions directly' },
                  { title: 'Campus Health Portal', desc: 'Medical appointments and records' },
                  { title: 'Plan B & Narcan Locations', desc: 'Find distribution points near you' },
                  { title: 'Safe Ride Request', desc: 'Request late-night transportation' },
                  { title: 'Crisis Resources', desc: '24/7 hotlines and text support' },
                  { title: 'Wellness Programs', desc: 'Workshops and peer support' },
                ].map((item, i) => (
                  <Reveal key={i} delay={i * 50}>
                    <div className="card p-5">
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* Health Integration Tab */}
          {activeTab === 'health-integration' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2">Campus Health ConnectCarolina Integration</h2>
                <p className="body-large text-gray-400 mb-8">Unified Scheduling for Medical and Mental Health Appointments</p>
              </Reveal>

              <PolicyProgress policy={getPolicy('health-integration')} />

              <Reveal>
                <span className="caption mb-6 block">Integration Benefits</span>
              </Reveal>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {[
                  { icon: 'S', title: 'Unified Scheduling', desc: 'One platform for all health appointments' },
                  { icon: 'C', title: 'Coordinated Care', desc: 'Providers see your full health picture' },
                  { icon: 'R', title: 'Smart Reminders', desc: 'Automated appointment notifications' },
                  { icon: 'M', title: 'Mobile Access', desc: 'Schedule from anywhere, anytime' },
                ].map((item, i) => (
                  <Reveal key={i} delay={i * 50}>
                    <div className="card p-6">
                      <span className="text-3xl font-bold text-white">{item.icon}</span>
                      <h4 className="font-semibold text-white mt-4">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-2">{item.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal>
                <div className="card-highlight p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 rounded text-xs font-mono bg-yellow-500/20 text-yellow-400">
                      IN DEVELOPMENT
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Advocacy in Progress</h3>
                  <p className="text-gray-400 mb-8">
                    We&apos;re working with Campus Health and ITS to integrate health services into ConnectCarolina. Current timeline: Fall 2026 pilot.
                  </p>
                  <div className="space-y-4">
                    {[
                      { status: 'complete', text: 'Requirements gathering - Complete' },
                      { status: 'complete', text: 'Stakeholder meetings - Complete' },
                      { status: 'progress', text: 'Technical planning - In Progress' },
                      { status: 'pending', text: 'Development - Pending' },
                      { status: 'pending', text: 'Pilot launch - Fall 2026' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          step.status === 'complete' ? 'bg-white' :
                          step.status === 'progress' ? 'bg-yellow-400' :
                          'bg-gray-700'
                        }`} />
                        <span className={step.status === 'pending' ? 'text-gray-500' : 'text-white'}>{step.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          {/* FAQ & Contact Tab */}
          {activeTab === 'faq' && (
            <div>
              <div className="grid lg:grid-cols-2 gap-12 mb-16">
                <div>
                  <Reveal>
                    <h2 className="section-title mb-8">Contact Us</h2>
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

                  <Reveal delay={200}>
                    <div className="card p-8 mt-6">
                      <h3 className="font-semibold text-white text-lg mb-6">Send Feedback</h3>
                      {feedbackSubmitted ? (
                        <div className="text-center py-6">
                          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl text-white">✓</span>
                          </div>
                          <p className="text-white font-medium">Thanks for your feedback!</p>
                          <button onClick={() => setFeedbackSubmitted(false)} className="text-gray-400 text-sm mt-3 hover:text-white transition-colors">Send another</button>
                        </div>
                      ) : (
                        <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                          <Select label="Topic" value={feedbackForm.topic} onChange={e => setFeedbackForm({...feedbackForm, topic: e.target.value})} required
                            options={[
                              { value: 'suggestion', label: 'Suggestion' },
                              { value: 'question', label: 'Question' },
                              { value: 'concern', label: 'Concern' },
                              { value: 'compliment', label: 'Compliment' },
                            ]}
                          />
                          <Textarea label="Message" value={feedbackForm.message} onChange={e => setFeedbackForm({...feedbackForm, message: e.target.value})} required rows={3} />
                          <Input label="Email (optional)" type="email" value={feedbackForm.email} onChange={e => setFeedbackForm({...feedbackForm, email: e.target.value})} />
                          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                          </button>
                        </form>
                      )}
                    </div>
                  </Reveal>
                </div>

                <div>
                  <Reveal>
                    <h2 className="section-title mb-8">Frequently Asked Questions</h2>
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

              <Reveal>
                <h3 className="text-xl font-semibold text-white mb-6">Recent Updates</h3>
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
