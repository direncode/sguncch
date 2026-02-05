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
  templates,
  externalLinks,
  campusLocations,
} from '../../lib/integrations'

export default function BasicNeedsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showShuttleReservation, setShowShuttleReservation] = useState(false)
  const [showSwipeShare, setShowSwipeShare] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shuttleFormData, setShuttleFormData] = useState({ name: '', email: '', day: '', time: '' })
  const [swipeFormData, setSwipeFormData] = useState({ action: '', name: '', email: '', swipes: '', message: '' })
  const { policies } = useApp()

  const deptPolicies = policies.filter(p => p.department === 'basic-needs')

  // Tabs matching the 5 policies
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'farmers-markets', label: 'Farmers Markets' },
    { id: 'food-security', label: 'Food Security Hub' },
    { id: 'plus-swipe', label: 'Plus Swipe' },
    { id: 'grocery-shuttle', label: 'Grocery Shuttle' },
    { id: 'offcampus-living', label: 'Off-Campus Living' },
    { id: 'faq', label: 'FAQ & Contact' },
  ]

  const contact = departmentContacts['basic-needs']
  const faqs = departmentFAQs['basic-needs']
  const announcements = departmentAnnouncements['basic-needs']
  const shuttleGuide = serviceGuides['grocery-shuttle']
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [feedbackForm, setFeedbackForm] = useState({ topic: '', message: '', email: '' })
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await submitForm('basicneeds-feedback', {
        ...feedbackForm,
        department: 'basic-needs',
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
      const result = await submitForm(`basicneeds-${type}`, {
        ...formData,
        formType: type,
        department: 'basic-needs',
        timestamp: new Date().toISOString(),
      })
      if (result.success) {
        setSubmitted(type)
        setShowShuttleReservation(false)
        setShowSwipeShare(false)
        if (type === 'shuttle') setShuttleFormData({ name: '', email: '', day: '', time: '' })
        if (type === 'swipe') setSwipeFormData({ action: '', name: '', email: '', swipes: '', message: '' })
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Download templates
  const downloadRoommateAgreement = () => {
    const content = templates.roomateAgreementTemplate()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'roommate-agreement-template.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadBudgetTemplate = () => {
    const content = templates.budgetTemplate()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'budget-template.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getPolicy = (id) => deptPolicies.find(p => p.id === id)

  const PolicyProgress = ({ policy }) => (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 mb-8">
      <div className="flex items-start justify-between mb-4">
        <span className={`px-2.5 py-1 rounded text-xs font-mono border ${
          policy?.status === 'completed' ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]' :
          policy?.status === 'in_progress' ? 'bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]' :
          'bg-[#21262d] text-[#6e7681] border-[#30363d]'
        }`}>
          {policy?.status === 'in_progress' ? <Editable k="basicneeds.status.inprogress">IN PROGRESS</Editable> : policy?.status === 'completed' ? <Editable k="basicneeds.status.completed">COMPLETED</Editable> : <Editable k="basicneeds.status.planned">PLANNED</Editable>}
        </span>
        <span className="text-[#8b949e] font-mono text-sm">{policy?.progress || 0}% <Editable k="basicneeds.status.complete">Complete</Editable></span>
      </div>
      <div className="h-2 bg-[#21262d] rounded overflow-hidden">
        <div className="h-full bg-[#d29922] rounded transition-all" style={{ width: `${policy?.progress || 0}%` }} />
      </div>
    </div>
  )

  return (
    <Layout>
      <Head>
        <title>Basic Needs | Project Bold</title>
      </Head>

      {/* Hero */}
      <div className="relative bg-[#0a0e14] border-b border-[#30363d] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#d29922 1px, transparent 1px), linear-gradient(90deg, #d29922 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d29922]/10 blur-3xl rounded-full" />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <p className="text-[#d29922] text-xs font-medium tracking-widest uppercase mb-4">
            <Editable k="basicneeds.hero.label">Basic Needs</Editable>
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0f6fc] tracking-tight mb-4">
            <Editable k="basicneeds.hero.title">Supporting Every Tar Heel</Editable>
          </h1>
          <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed">
            <Editable k="basicneeds.hero.description" multiline>Food security, grocery access, affordable dining, and housing education. No student should struggle to meet basic needs.</Editable>
          </p>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="bg-[#b62324] border-b border-[#da3633]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <p className="font-semibold text-white uppercase text-sm tracking-wide"><Editable k="basicneeds.emergency.prompt">Need immediate help?</Editable></p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="tel:919-966-4042" className="bg-white text-[#b62324] px-4 py-2 rounded font-mono font-bold hover:bg-[#f0f6fc] transition-colors">
              <Editable k="basicneeds.emergency.deanphone">Dean of Students: 919-966-4042</Editable>
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0d1117] sticky top-16 z-40 border-b border-[#30363d]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 text-xs font-medium tracking-wider uppercase whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#d29922] text-[#d29922]'
                    : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="bg-[#0d1117] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {submitted && (
            <div className="mb-8 bg-[#161b22] border border-[#d29922] rounded-lg p-5">
              <p className="text-[#f0f6fc] font-medium">
                {submitted === 'shuttle' && <Editable k="basicneeds.submitted.shuttle" multiline>Your shuttle reservation has been confirmed! Check your email for details.</Editable>}
                {submitted === 'swipe' && <Editable k="basicneeds.submitted.swipe" multiline>Thank you! Your meal swipe share has been registered.</Editable>}
              </p>
              <button onClick={() => setSubmitted(null)} className="text-[#d29922] text-sm font-medium mt-3 hover:underline">
                <Editable k="basicneeds.submitted.dismiss">Dismiss</Editable>
              </button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8"><Editable k="basicneeds.overview.title">Basic Needs Initiatives</Editable></h2>

              <div className="grid md:grid-cols-2 gap-5 mb-12">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#d29922] transition-colors cursor-pointer"
                    onClick={() => setActiveTab(
                      policy.id === 'farmers-markets' ? 'farmers-markets' :
                      policy.id === 'food-security-hub' ? 'food-security' :
                      policy.id === 'plus-swipe-expansion' ? 'plus-swipe' :
                      policy.id === 'grocery-shuttle' ? 'grocery-shuttle' :
                      policy.id === 'offcampus-education' ? 'offcampus-living' : 'overview'
                    )}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-[#f0f6fc] pr-4">{policy.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-mono border flex-shrink-0 ${
                        policy.status === 'completed' ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]' :
                        policy.status === 'in_progress' ? 'bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]' :
                        'bg-[#21262d] text-[#6e7681] border-[#30363d]'
                      }`}>
                        {policy.progress}%
                      </span>
                    </div>
                    <p className="text-sm text-[#8b949e] mb-4 line-clamp-2">{policy.description}</p>
                    <div className="h-1.5 bg-[#21262d] rounded overflow-hidden">
                      <div className="h-full bg-[#d29922] rounded" style={{ width: `${policy.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold" style={{ color: '#d29922' }}><Editable k="basicneeds.overview.stat1.value">847</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest"><Editable k="basicneeds.overview.stat1.label">Pantry Visits This Month</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold" style={{ color: '#3fb950' }}><Editable k="basicneeds.overview.stat2.value">156</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest"><Editable k="basicneeds.overview.stat2.label">Shuttle Rides Given</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold" style={{ color: '#58a6ff' }}><Editable k="basicneeds.overview.stat3.value">324</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest"><Editable k="basicneeds.overview.stat3.label">Swipes Shared</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold" style={{ color: '#a371f7' }}><Editable k="basicneeds.overview.stat4.value">89</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest"><Editable k="basicneeds.overview.stat4.label">Workshop Attendees</Editable></p>
                </div>
              </div>
            </div>
          )}

          {/* Farmers Markets Tab - Policy 1 */}
          {activeTab === 'farmers-markets' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2"><Editable k="basicneeds.markets.title">On-Campus Farmers Markets</Editable></h2>
              <p className="text-[#8b949e] mb-6"><Editable k="basicneeds.markets.subtitle">Fresh Local Produce and Chase Farm Stands</Editable></p>

              <PolicyProgress policy={getPolicy('farmers-markets')} />

              {/* Market Schedule */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5"><Editable k="basicneeds.markets.scheduleheading">Market Schedule</Editable></h3>
              <div className="grid md:grid-cols-2 gap-5 mb-10">
                <div className="bg-[#161b22] border border-[#d29922] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl"></span>
                    <div>
                      <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.markets.pit.name">The Pit Market</Editable></h4>
                      <p className="text-sm text-[#8b949e]"><Editable k="basicneeds.markets.pit.subtitle">Main campus location</Editable></p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-[#f0f6fc]"><span className="text-[#6e7681]"><Editable k="basicneeds.markets.label.when">When:</Editable></span> <Editable k="basicneeds.markets.pit.when">Wednesdays 11am-2pm</Editable></p>
                    <p className="text-[#f0f6fc]"><span className="text-[#6e7681]"><Editable k="basicneeds.markets.label.where">Where:</Editable></span> <Editable k="basicneeds.markets.pit.where">The Pit (Polk Place)</Editable></p>
                    <p className="text-[#f0f6fc]"><span className="text-[#6e7681]"><Editable k="basicneeds.markets.label.accepts">Accepts:</Editable></span> <Editable k="basicneeds.markets.pit.accepts">Cash, Card, Plus Swipe</Editable></p>
                  </div>
                </div>

                <div className="bg-[#161b22] border border-[#3fb950] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl"></span>
                    <div>
                      <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.markets.south.name">South Campus Stand</Editable></h4>
                      <p className="text-sm text-[#8b949e]"><Editable k="basicneeds.markets.south.subtitle">Chase Farm partnership</Editable></p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-[#f0f6fc]"><span className="text-[#6e7681]"><Editable k="basicneeds.markets.label.when2">When:</Editable></span> <Editable k="basicneeds.markets.south.when">Fridays 3pm-6pm</Editable></p>
                    <p className="text-[#f0f6fc]"><span className="text-[#6e7681]"><Editable k="basicneeds.markets.label.where2">Where:</Editable></span> <Editable k="basicneeds.markets.south.where">Ram Village Community Center</Editable></p>
                    <p className="text-[#f0f6fc]"><span className="text-[#6e7681]"><Editable k="basicneeds.markets.label.accepts2">Accepts:</Editable></span> <Editable k="basicneeds.markets.south.accepts">Cash, Card, Plus Swipe</Editable></p>
                  </div>
                </div>
              </div>

              {/* What's Available */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5"><Editable k="basicneeds.markets.findheading">What You'll Find</Editable></h3>
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                  <span className="text-2xl"></span>
                  <p className="text-sm text-[#f0f6fc] mt-2"><Editable k="basicneeds.markets.product1">Fresh Vegetables</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                  <span className="text-2xl"></span>
                  <p className="text-sm text-[#f0f6fc] mt-2"><Editable k="basicneeds.markets.product2">Seasonal Fruits</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                  <span className="text-2xl"></span>
                  <p className="text-sm text-[#f0f6fc] mt-2"><Editable k="basicneeds.markets.product3">Farm Fresh Eggs</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                  <span className="text-2xl"></span>
                  <p className="text-sm text-[#f0f6fc] mt-2"><Editable k="basicneeds.markets.product4">Local Honey</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                  <span className="text-2xl"></span>
                  <p className="text-sm text-[#f0f6fc] mt-2"><Editable k="basicneeds.markets.product5">Artisan Breads</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                  <span className="text-2xl"></span>
                  <p className="text-sm text-[#f0f6fc] mt-2"><Editable k="basicneeds.markets.product6">Local Cheeses</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                  <span className="text-2xl"></span>
                  <p className="text-sm text-[#f0f6fc] mt-2"><Editable k="basicneeds.markets.product7">Fresh Herbs</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                  <span className="text-2xl"></span>
                  <p className="text-sm text-[#f0f6fc] mt-2"><Editable k="basicneeds.markets.product8">Prepared Foods</Editable></p>
                </div>
              </div>

              {/* Partner Farms */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-4"><Editable k="basicneeds.markets.partnersheading">Partner Farms & Vendors</Editable></h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                    <span className="text-[#3fb950]">-</span> <Editable k="basicneeds.markets.farm1">Carrboro Farmers Market</Editable>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                    <span className="text-[#3fb950]">-</span> <Editable k="basicneeds.markets.farm2">Chase Farm</Editable>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                    <span className="text-[#3fb950]">-</span> <Editable k="basicneeds.markets.farm3">Maple View Farm</Editable>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                    <span className="text-[#3fb950]">-</span> <Editable k="basicneeds.markets.farm4">Cates Farm</Editable>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                    <span className="text-[#3fb950]">-</span> <Editable k="basicneeds.markets.farm5">Celebrity Dairy</Editable>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                    <span className="text-[#3fb950]">-</span> <Editable k="basicneeds.markets.farm6">Sunrise Farm</Editable>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Food Security Hub Tab - Policy 2 */}
          {activeTab === 'food-security' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2"><Editable k="basicneeds.hub.title">Centralized Food Security Hub</Editable></h2>
              <p className="text-[#8b949e] mb-6"><Editable k="basicneeds.hub.subtitle">Meal Swipe Sharing, Pantries, and Community Fridges</Editable></p>

              <PolicyProgress policy={getPolicy('food-security-hub')} />

              <div className="grid lg:grid-cols-2 gap-8 mb-10">
                {/* Meal Swipe Sharing */}
                <div className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4"><Editable k="basicneeds.hub.swipesharing.title">Meal Swipe Sharing</Editable></h3>
                  <p className="text-sm text-[#8b949e] mb-6"><Editable k="basicneeds.hub.swipesharing.description" multiline>Share your extra meal swipes with students in need, or request swipes when you need them.</Editable></p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-[#21262d] rounded-lg">
                      <p className="text-2xl font-mono font-bold text-[#58a6ff]"><Editable k="basicneeds.hub.swipesharing.sharedcount">324</Editable></p>
                      <p className="text-xs text-[#6e7681] uppercase"><Editable k="basicneeds.hub.swipesharing.sharedlabel">Swipes Shared</Editable></p>
                    </div>
                    <div className="text-center p-4 bg-[#21262d] rounded-lg">
                      <p className="text-2xl font-mono font-bold text-[#3fb950]"><Editable k="basicneeds.hub.swipesharing.helpedcount">156</Editable></p>
                      <p className="text-xs text-[#6e7681] uppercase"><Editable k="basicneeds.hub.swipesharing.helpedlabel">Students Helped</Editable></p>
                    </div>
                  </div>

                  <button onClick={() => setShowSwipeShare(true)}
                    className="w-full bg-[#58a6ff] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#79b8ff] transition-colors">
                    <Editable k="basicneeds.hub.swipesharing.button">Share or Request Swipes</Editable>
                  </button>
                </div>

                {/* Pantry Locations */}
                <div>
                  <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5"><Editable k="basicneeds.hub.pantries.heading">Food Pantries</Editable></h3>
                  <div className="space-y-3">
                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                      <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.hub.pantry1.name">Carolina Cupboard - Union</Editable></h4>
                      <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.hub.pantry1.address">Student Union Lower Level</Editable></p>
                      <p className="text-xs text-[#6e7681] font-mono mt-1"><Editable k="basicneeds.hub.pantry1.hours">M-F 10am-4pm</Editable></p>
                    </div>
                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                      <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.hub.pantry2.name">Carolina Cupboard - South</Editable></h4>
                      <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.hub.pantry2.address">Ram Village Community Center</Editable></p>
                      <p className="text-xs text-[#6e7681] font-mono mt-1"><Editable k="basicneeds.hub.pantry2.hours">T/Th 2pm-6pm</Editable></p>
                    </div>
                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                      <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.hub.pantry3.name">Carolina Cupboard - North</Editable></h4>
                      <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.hub.pantry3.address">Hinton James Ground Floor</Editable></p>
                      <p className="text-xs text-[#6e7681] font-mono mt-1"><Editable k="basicneeds.hub.pantry3.hours">M/W 3pm-7pm</Editable></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community Fridges */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5"><Editable k="basicneeds.hub.fridges.heading">Community Fridges</Editable></h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#3fb950]"></span>
                    <h4 className="font-semibold text-[#f0f6fc] text-sm"><Editable k="basicneeds.hub.fridge1.location">Student Union</Editable></h4>
                  </div>
                  <p className="text-xs text-[#8b949e]"><Editable k="basicneeds.hub.fridge1.building">Near Room 1301</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#3fb950]"></span>
                    <h4 className="font-semibold text-[#f0f6fc] text-sm"><Editable k="basicneeds.hub.fridge2.location">Davis Library</Editable></h4>
                  </div>
                  <p className="text-xs text-[#8b949e]"><Editable k="basicneeds.hub.fridge2.building">Ground Floor</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#3fb950]"></span>
                    <h4 className="font-semibold text-[#f0f6fc] text-sm"><Editable k="basicneeds.hub.fridge3.location">Sitterson Hall</Editable></h4>
                  </div>
                  <p className="text-xs text-[#8b949e]"><Editable k="basicneeds.hub.fridge3.building">Main Lobby</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#3fb950]"></span>
                    <h4 className="font-semibold text-[#f0f6fc] text-sm"><Editable k="basicneeds.hub.fridge4.location">Kenan-Flagler</Editable></h4>
                  </div>
                  <p className="text-xs text-[#8b949e]"><Editable k="basicneeds.hub.fridge4.building">Student Lounge</Editable></p>
                </div>
              </div>

              {/* Swipe Share Modal */}
              {showSwipeShare && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6">
                    <h3 className="text-xl font-bold text-[#f0f6fc] mb-6"><Editable k="basicneeds.hub.modal.title">Meal Swipe Exchange</Editable></h3>
                    <form onSubmit={handleFormSubmit('swipe', swipeFormData)} className="space-y-4">
                      <Select label="I want to..." required value={swipeFormData.action} onChange={e => setSwipeFormData({...swipeFormData, action: e.target.value})}
                        options={[
                          { value: 'share', label: 'Share my extra swipes' },
                          { value: 'request', label: 'Request meal swipes' },
                        ]}
                      />
                      <Input label="Your Name" required value={swipeFormData.name} onChange={e => setSwipeFormData({...swipeFormData, name: e.target.value})} />
                      <Input label="Email" type="email" required value={swipeFormData.email} onChange={e => setSwipeFormData({...swipeFormData, email: e.target.value})} />
                      <Input label="Number of Swipes" type="number" required value={swipeFormData.swipes} onChange={e => setSwipeFormData({...swipeFormData, swipes: e.target.value})} />
                      <Textarea label="Message (optional)" rows={2} value={swipeFormData.message} onChange={e => setSwipeFormData({...swipeFormData, message: e.target.value})} />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#58a6ff] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#79b8ff] disabled:opacity-50 disabled:cursor-not-allowed">
                          {isSubmitting ? 'Submitting...' : <Editable k="basicneeds.hub.modal.submit">Submit</Editable>}
                        </button>
                        <button type="button" onClick={() => setShowSwipeShare(false)} className="px-6 py-3 rounded text-[#8b949e] border border-[#30363d] hover:bg-[#21262d]">
                          <Editable k="basicneeds.hub.modal.cancel">Cancel</Editable>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Plus Swipe Tab - Policy 3 */}
          {activeTab === 'plus-swipe' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2"><Editable k="basicneeds.plusswipe.title">Expand Plus Swipe Options</Editable></h2>
              <p className="text-[#8b949e] mb-6"><Editable k="basicneeds.plusswipe.subtitle">Healthier Off-Campus Dining Locations</Editable></p>

              <PolicyProgress policy={getPolicy('plus-swipe-expansion')} />

              {/* Current Vendors */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5"><Editable k="basicneeds.plusswipe.currentheading">Current Plus Swipe Vendors</Editable></h3>
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.plusswipe.vendor1.name">Alpine Bagel</Editable></h4>
                  <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.plusswipe.vendor1.type">Breakfast/Lunch</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1"><Editable k="basicneeds.plusswipe.vendor1.location">Student Union</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.plusswipe.vendor2.name">Starbucks</Editable></h4>
                  <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.plusswipe.vendor2.type">Coffee/Snacks</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1"><Editable k="basicneeds.plusswipe.vendor2.location">Multiple locations</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.plusswipe.vendor3.name">Chick-fil-A</Editable></h4>
                  <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.plusswipe.vendor3.type">Fast Food</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1"><Editable k="basicneeds.plusswipe.vendor3.location">Student Union</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.plusswipe.vendor4.name">Panda Express</Editable></h4>
                  <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.plusswipe.vendor4.type">Fast Food</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1"><Editable k="basicneeds.plusswipe.vendor4.location">Student Union</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.plusswipe.vendor5.name">Wendy's</Editable></h4>
                  <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.plusswipe.vendor5.type">Fast Food</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1"><Editable k="basicneeds.plusswipe.vendor5.location">Lenoir</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.plusswipe.vendor6.name">Subway</Editable></h4>
                  <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.plusswipe.vendor6.type">Sandwiches</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1"><Editable k="basicneeds.plusswipe.vendor6.location">Student Union</Editable></p>
                </div>
              </div>

              {/* Proposed Additions */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5"><Editable k="basicneeds.plusswipe.proposedheading">Proposed Healthier Options</Editable></h3>
              <div className="bg-[#161b22] border border-[#d29922] rounded-lg p-6 mb-10">
                <p className="text-sm text-[#8b949e] mb-6"><Editable k="basicneeds.plusswipe.proposeddesc" multiline>We're advocating to add these healthier off-campus options to Plus Swipe:</Editable></p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-[#d29922]">&gt;</span>
                    <div>
                      <p className="font-medium text-[#f0f6fc]"><Editable k="basicneeds.plusswipe.proposed1.name">Vimala's Curryblossom</Editable></p>
                      <p className="text-xs text-[#8b949e]"><Editable k="basicneeds.plusswipe.proposed1.reason">Local, healthy Indian cuisine</Editable></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#d29922]">&gt;</span>
                    <div>
                      <p className="font-medium text-[#f0f6fc]"><Editable k="basicneeds.plusswipe.proposed2.name">Roots Natural Kitchen</Editable></p>
                      <p className="text-xs text-[#8b949e]"><Editable k="basicneeds.plusswipe.proposed2.reason">Build-your-own grain bowls</Editable></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#d29922]">&gt;</span>
                    <div>
                      <p className="font-medium text-[#f0f6fc]"><Editable k="basicneeds.plusswipe.proposed3.name">Med Deli</Editable></p>
                      <p className="text-xs text-[#8b949e]"><Editable k="basicneeds.plusswipe.proposed3.reason">Mediterranean, vegetarian-friendly</Editable></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#d29922]">&gt;</span>
                    <div>
                      <p className="font-medium text-[#f0f6fc]"><Editable k="basicneeds.plusswipe.proposed4.name">Cosmic Cantina</Editable></p>
                      <p className="text-xs text-[#8b949e]"><Editable k="basicneeds.plusswipe.proposed4.reason">Late-night healthy options</Editable></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#d29922]">&gt;</span>
                    <div>
                      <p className="font-medium text-[#f0f6fc]"><Editable k="basicneeds.plusswipe.proposed5.name">Guasaca</Editable></p>
                      <p className="text-xs text-[#8b949e]"><Editable k="basicneeds.plusswipe.proposed5.reason">Fresh Venezuelan bowls</Editable></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#d29922]">&gt;</span>
                    <div>
                      <p className="font-medium text-[#f0f6fc]"><Editable k="basicneeds.plusswipe.proposed6.name">Harvest 18</Editable></p>
                      <p className="text-xs text-[#8b949e]"><Editable k="basicneeds.plusswipe.proposed6.reason">Farm-to-table salads</Editable></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support the Initiative */}
              <div className="bg-[#161b22] border border-[#3fb950] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-4"><Editable k="basicneeds.plusswipe.support.title">Support This Initiative</Editable></h3>
                <p className="text-sm text-[#8b949e] mb-4"><Editable k="basicneeds.plusswipe.support.description" multiline>Help us expand Plus Swipe to healthier options by sharing your feedback with Carolina Dining.</Editable></p>
                <button className="bg-[#3fb950] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#46c356] transition-colors">
                  <Editable k="basicneeds.plusswipe.support.button">Submit Feedback to Dining</Editable>
                </button>
              </div>
            </div>
          )}

          {/* Grocery Shuttle Tab - Policy 4 */}
          {activeTab === 'grocery-shuttle' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2"><Editable k="basicneeds.shuttle.title">Student Grocery Shuttle</Editable></h2>
              <p className="text-[#8b949e] mb-6"><Editable k="basicneeds.shuttle.subtitle">Free Transportation to Affordable Grocery Stores</Editable></p>

              <PolicyProgress policy={getPolicy('grocery-shuttle')} />

              <div className="grid lg:grid-cols-2 gap-8 mb-10">
                {/* Schedule */}
                <div>
                  <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5"><Editable k="basicneeds.shuttle.scheduleheading">Shuttle Schedule</Editable></h3>
                  <div className="space-y-4">
                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.shuttle.schedule1.day">Saturday</Editable></h4>
                          <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.shuttle.schedule1.route">Trader Joe's & Harris Teeter</Editable></p>
                          <p className="text-xs text-[#6e7681] font-mono mt-1"><Editable k="basicneeds.shuttle.schedule1.time">10am - 4pm</Editable></p>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-mono bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]">
                          <Editable k="basicneeds.shuttle.status.running">RUNNING</Editable>
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.shuttle.schedule2.day">Sunday</Editable></h4>
                          <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.shuttle.schedule2.route">Walmart & Aldi</Editable></p>
                          <p className="text-xs text-[#6e7681] font-mono mt-1"><Editable k="basicneeds.shuttle.schedule2.time">12pm - 5pm</Editable></p>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-mono bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]">
                          <Editable k="basicneeds.shuttle.status.running2">RUNNING</Editable>
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.shuttle.schedule3.day">Wednesday</Editable></h4>
                          <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.shuttle.schedule3.route">Harris Teeter & Whole Foods</Editable></p>
                          <p className="text-xs text-[#6e7681] font-mono mt-1"><Editable k="basicneeds.shuttle.schedule3.time">4pm - 8pm</Editable></p>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-mono bg-[#d29922]/10 text-[#d29922] border border-[#d29922]">
                          <Editable k="basicneeds.shuttle.status.coming">COMING SOON</Editable>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reserve Spot */}
                <div className="bg-[#161b22] border border-[#d29922] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4"><Editable k="basicneeds.shuttle.reserve.title">Reserve Your Spot</Editable></h3>
                  <p className="text-sm text-[#8b949e] mb-6"><Editable k="basicneeds.shuttle.reserve.description" multiline>Reservations recommended but walk-ons welcome if space allows. Shuttle departs from the Student Union.</Editable></p>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                      <span className="text-[#3fb950]">-</span> <Editable k="basicneeds.shuttle.feature1">Free for all UNC students</Editable>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                      <span className="text-[#3fb950]">-</span> <Editable k="basicneeds.shuttle.feature2">Bring your One Card</Editable>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                      <span className="text-[#3fb950]">-</span> <Editable k="basicneeds.shuttle.feature3">1-2 hours shopping time</Editable>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                      <span className="text-[#3fb950]">-</span> <Editable k="basicneeds.shuttle.feature4">Help with groceries available</Editable>
                    </div>
                  </div>

                  <button onClick={() => setShowShuttleReservation(true)}
                    className="w-full bg-[#d29922] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#e5ac30] transition-colors">
                    <Editable k="basicneeds.shuttle.reserve.button">Reserve a Spot</Editable>
                  </button>
                </div>
              </div>

              {/* How-To Guide */}
              {shuttleGuide && (
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-5">{shuttleGuide.title}</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    {shuttleGuide.steps.map(step => (
                      <div key={step.step} className="relative">
                        <div className="absolute -top-2 left-3 bg-[#d29922] text-[#0d1117] text-xs font-bold px-2 py-0.5 rounded">
                          Step {step.step}
                        </div>
                        <div className="bg-[#21262d] rounded-lg p-4 pt-5">
                          <h4 className="font-medium text-[#f0f6fc] text-sm mb-1">{step.title}</h4>
                          <p className="text-xs text-[#8b949e]">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shuttle Reservation Modal */}
              {showShuttleReservation && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6">
                    <h3 className="text-xl font-bold text-[#f0f6fc] mb-6"><Editable k="basicneeds.shuttle.modal.title">Reserve Shuttle Spot</Editable></h3>
                    <form onSubmit={handleFormSubmit('shuttle', shuttleFormData)} className="space-y-4">
                      <Input label="Your Name" required value={shuttleFormData.name} onChange={e => setShuttleFormData({...shuttleFormData, name: e.target.value})} />
                      <Input label="Email" type="email" required value={shuttleFormData.email} onChange={e => setShuttleFormData({...shuttleFormData, email: e.target.value})} />
                      <Select label="Select Day" required value={shuttleFormData.day} onChange={e => setShuttleFormData({...shuttleFormData, day: e.target.value})}
                        options={[
                          { value: 'saturday', label: 'Saturday (Trader Joe\'s & Harris Teeter)' },
                          { value: 'sunday', label: 'Sunday (Walmart & Aldi)' },
                        ]}
                      />
                      <Select label="Departure Time" required value={shuttleFormData.time} onChange={e => setShuttleFormData({...shuttleFormData, time: e.target.value})}
                        options={[
                          { value: '10am', label: '10:00 AM' },
                          { value: '12pm', label: '12:00 PM' },
                          { value: '2pm', label: '2:00 PM' },
                        ]}
                      />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#d29922] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#e5ac30] disabled:opacity-50 disabled:cursor-not-allowed">
                          {isSubmitting ? 'Reserving...' : <Editable k="basicneeds.shuttle.modal.confirm">Confirm Reservation</Editable>}
                        </button>
                        <button type="button" onClick={() => setShowShuttleReservation(false)} className="px-6 py-3 rounded text-[#8b949e] border border-[#30363d] hover:bg-[#21262d]">
                          <Editable k="basicneeds.shuttle.modal.cancel">Cancel</Editable>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Off-Campus Living Tab - Policy 5 */}
          {activeTab === 'offcampus-living' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2"><Editable k="basicneeds.offcampus.title">Off-Campus Living Education</Editable></h2>
              <p className="text-[#8b949e] mb-6"><Editable k="basicneeds.offcampus.subtitle">Leases, Budgeting, and Housing Resources</Editable></p>

              <PolicyProgress policy={getPolicy('offcampus-education')} />

              {/* Upcoming Workshops */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5"><Editable k="basicneeds.offcampus.workshopsheading">Upcoming Workshops</Editable></h3>
              <div className="grid md:grid-cols-2 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.offcampus.workshop1.title">Understanding Your Lease</Editable></h4>
                    <span className="px-2 py-0.5 rounded text-xs bg-[#d29922]/10 text-[#d29922] border border-[#d29922]">
                      <Editable k="basicneeds.offcampus.workshop1.spots">25 spots</Editable>
                    </span>
                  </div>
                  <p className="text-sm text-[#8b949e]"><Editable k="basicneeds.offcampus.workshop1.datetime">Feb 15, 2026 at 5pm</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1"><Editable k="basicneeds.offcampus.workshop1.location">Union 3201</Editable></p>
                  <div className="flex items-center gap-4 mt-4">
                    <a href={calendarEvents.leaseWorkshop} target="_blank" rel="noopener noreferrer" className="text-[#58a6ff] text-sm font-medium hover:underline">Add to Calendar</a>
                  </div>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.offcampus.workshop2.title">Budgeting for Off-Campus Life</Editable></h4>
                    <span className="px-2 py-0.5 rounded text-xs bg-[#d29922]/10 text-[#d29922] border border-[#d29922]">
                      <Editable k="basicneeds.offcampus.workshop2.spots">30 spots</Editable>
                    </span>
                  </div>
                  <p className="text-sm text-[#8b949e]"><Editable k="basicneeds.offcampus.workshop2.datetime">Feb 22, 2026 at 4pm</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1"><Editable k="basicneeds.offcampus.workshop2.location">Union 3205</Editable></p>
                  <div className="flex items-center gap-4 mt-4">
                    <a href={calendarEvents.budgetingWorkshop} target="_blank" rel="noopener noreferrer" className="text-[#58a6ff] text-sm font-medium hover:underline">Add to Calendar</a>
                  </div>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.offcampus.workshop3.title">Finding Roommates & Housing</Editable></h4>
                    <span className="px-2 py-0.5 rounded text-xs bg-[#d29922]/10 text-[#d29922] border border-[#d29922]">
                      <Editable k="basicneeds.offcampus.workshop3.spots">25 spots</Editable>
                    </span>
                  </div>
                  <p className="text-sm text-[#8b949e]"><Editable k="basicneeds.offcampus.workshop3.datetime">Mar 1, 2026 at 5pm</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1"><Editable k="basicneeds.offcampus.workshop3.location">Union 3201</Editable></p>
                  <button className="mt-4 text-[#58a6ff] text-sm font-medium hover:underline"><Editable k="basicneeds.offcampus.registerlink3">Register</Editable></button>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.offcampus.workshop4.title">Utilities & Bills 101</Editable></h4>
                    <span className="px-2 py-0.5 rounded text-xs bg-[#d29922]/10 text-[#d29922] border border-[#d29922]">
                      <Editable k="basicneeds.offcampus.workshop4.spots">30 spots</Editable>
                    </span>
                  </div>
                  <p className="text-sm text-[#8b949e]"><Editable k="basicneeds.offcampus.workshop4.datetime">Mar 8, 2026 at 4pm</Editable></p>
                  <p className="text-xs text-[#6e7681] mt-1"><Editable k="basicneeds.offcampus.workshop4.location">Union 3205</Editable></p>
                  <button className="mt-4 text-[#58a6ff] text-sm font-medium hover:underline"><Editable k="basicneeds.offcampus.registerlink4">Register</Editable></button>
                </div>
              </div>

              {/* Resources */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Peer Financial Coaches */}
                <div className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4"><Editable k="basicneeds.offcampus.coach.title">Meet with a Peer Financial Coach</Editable></h3>
                  <p className="text-sm text-[#8b949e] mb-4"><Editable k="basicneeds.offcampus.coach.description" multiline>Our coaches are now trained in housing-related budgeting and can help you plan for off-campus expenses.</Editable></p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-[#8b949e]">
                      <span className="text-[#58a6ff]">-</span> <Editable k="basicneeds.offcampus.coach.feature1">One-on-one appointments</Editable>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#8b949e]">
                      <span className="text-[#58a6ff]">-</span> <Editable k="basicneeds.offcampus.coach.feature2">Help with lease review</Editable>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#8b949e]">
                      <span className="text-[#58a6ff]">-</span> <Editable k="basicneeds.offcampus.coach.feature3">Budget planning</Editable>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#8b949e]">
                      <span className="text-[#58a6ff]">-</span> <Editable k="basicneeds.offcampus.coach.feature4">Financial aid questions</Editable>
                    </li>
                  </ul>
                  <button className="bg-[#58a6ff] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#79b8ff] transition-colors">
                    <Editable k="basicneeds.offcampus.coach.button">Schedule Appointment</Editable>
                  </button>
                </div>

                {/* Quick Resources */}
                <div>
                  <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5"><Editable k="basicneeds.offcampus.resources.heading">Quick Resources</Editable></h3>
                  <div className="space-y-3">
                    <a href={externalLinks.offCampusHousing} target="_blank" rel="noopener noreferrer" className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#d29922] transition-colors cursor-pointer block">
                      <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.offcampus.resource1.title">Lease Checklist</Editable></h4>
                      <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.offcampus.resource1.desc">What to look for before signing</Editable></p>
                    </a>
                    <button onClick={downloadBudgetTemplate} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#d29922] transition-colors cursor-pointer text-left w-full">
                      <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.offcampus.resource2.title">Budget Template</Editable></h4>
                      <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.offcampus.resource2.desc">Download budget planning template</Editable></p>
                    </button>
                    <a href={externalLinks.offCampusHousing} target="_blank" rel="noopener noreferrer" className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#d29922] transition-colors cursor-pointer block">
                      <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.offcampus.resource3.title">Housing Search Guide</Editable></h4>
                      <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.offcampus.resource3.desc">Tips for finding apartments</Editable></p>
                    </a>
                    <button onClick={downloadRoommateAgreement} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#d29922] transition-colors cursor-pointer text-left w-full">
                      <h4 className="font-semibold text-[#f0f6fc]"><Editable k="basicneeds.offcampus.resource4.title">Roommate Agreement</Editable></h4>
                      <p className="text-sm text-[#8b949e] mt-1"><Editable k="basicneeds.offcampus.resource4.desc">Download roommate agreement template</Editable></p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ & Contact Tab */}
          {activeTab === 'faq' && (
            <div>
              <div className="grid lg:grid-cols-2 gap-8 mb-12">
                {/* Contact Info */}
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-6"><Editable k="basicneeds.faq.contacttitle">Contact Us</Editable></h2>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#d29922]/10 border border-[#d29922]/30 rounded-full flex items-center justify-center">
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
                        <a href={`mailto:${contact.lead.email}`} className="text-[#58a6ff] hover:underline">{contact.lead.email}</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]"></span>
                        <span className="text-[#f0f6fc]">{contact.socialMedia}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Feedback Form */}
                  <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h3 className="font-semibold text-[#f0f6fc] mb-4"><Editable k="basicneeds.faq.feedbacktitle">Send Feedback</Editable></h3>
                    {feedbackSubmitted ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-[#d29922]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl"></span>
                        </div>
                        <p className="text-[#d29922] font-medium"><Editable k="basicneeds.faq.feedbackthanks">Thanks for your feedback!</Editable></p>
                        <button onClick={() => setFeedbackSubmitted(false)} className="text-[#58a6ff] text-sm mt-2 hover:underline"><Editable k="basicneeds.faq.sendanother">Send another</Editable></button>
                      </div>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-4">
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
                        <button type="submit" disabled={isSubmitting} className="w-full bg-[#d29922] text-[#0d1117] px-4 py-2.5 rounded font-semibold hover:bg-[#e5ac30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          {isSubmitting ? 'Submitting...' : <Editable k="basicneeds.faq.submitfeedback">Submit Feedback</Editable>}
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-6"><Editable k="basicneeds.faq.faqtitle">Frequently Asked Questions</Editable></h2>
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
                <h3 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-5"><Editable k="basicneeds.faq.updatestitle">Recent Updates</Editable></h3>
                <div className="space-y-3">
                  {announcements.map(ann => (
                    <div key={ann.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-start gap-4">
                      <div className={`px-2 py-1 rounded text-xs font-mono ${
                        ann.type === 'event' ? 'bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]' :
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
      <EditModeToggle />
    </Layout>
  )
}
