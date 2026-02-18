import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { useApp } from '../../lib/store'
import { departmentContacts, departmentFAQs, departmentAnnouncements, serviceGuides } from '../../lib/data'
import { Editable, EditModeToggle } from '../../components/InlineEditor'
import {
  calendarEvents,
  templates,
  externalLinks,
  campusLocations,
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

export default function BasicNeedsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showShuttleReservation, setShowShuttleReservation] = useState(false)
  const [showSwipeShare, setShowSwipeShare] = useState(false)
  const { policies, getSiteContent } = useApp()

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
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

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
    <div className="card p-6 mb-8">
      <div className="flex items-start justify-between mb-4">
        <span className={`px-3 py-1 rounded text-xs font-mono tracking-wider ${
          policy?.status === 'completed' ? 'bg-white/10 text-white' :
          policy?.status === 'in_progress' ? 'bg-white/5 text-gray-300' :
          'bg-white/5 text-gray-500'
        }`}>
          {policy?.status === 'in_progress' ? <Editable k="basicneeds.status.inprogress">IN PROGRESS</Editable> : policy?.status === 'completed' ? <Editable k="basicneeds.status.completed">COMPLETED</Editable> : <Editable k="basicneeds.status.planned">PLANNED</Editable>}
        </span>
        <span className="text-gray-400 font-mono text-sm">{policy?.progress || 0}% <Editable k="basicneeds.status.complete">Complete</Editable></span>
      </div>
      <div className="h-1 bg-gray-800 rounded overflow-hidden">
        <div className="h-full bg-white rounded transition-all" style={{ width: `${policy?.progress || 0}%` }} />
      </div>
    </div>
  )

  return (
    <Layout>
      <Head>
        <title>Basic Needs | Project Bold</title>
      </Head>

      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center relative overflow-hidden border-b border-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <Reveal>
            <span className="caption mb-6 block">
              <Editable k="basicneeds.hero.label">Basic Needs</Editable>
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="hero-title mb-6">
              <Editable k="basicneeds.hero.title">Supporting Every Tar Heel</Editable>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="hero-subtitle max-w-2xl mb-10">
              <Editable k="basicneeds.hero.description" multiline>Food security, grocery access, affordable dining, and housing education. No student should struggle to meet basic needs.</Editable>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Emergency Banner */}
      <div className="bg-red-900/30 border-b border-red-800/50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <p className="font-medium text-white text-sm tracking-wide"><Editable k="basicneeds.emergency.prompt">Need immediate help?</Editable></p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="tel:919-966-4042" className="btn-primary text-sm py-2 px-4">
              <Editable k="basicneeds.emergency.deanphone">Dean of Students: 919-966-4042</Editable>
            </a>
          </div>
        </div>
      </div>

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
                <h2 className="section-title mb-8"><Editable k="basicneeds.overview.title">Basic Needs Initiatives</Editable></h2>
              </Reveal>

              <div className="grid md:grid-cols-2 gap-6 mb-16">
                {deptPolicies.map((policy, index) => (
                  <Reveal key={policy.id} delay={index * 50}>
                    <div className="card p-6 cursor-pointer group"
                      onClick={() => setActiveTab(
                        policy.id === 'farmers-markets' ? 'farmers-markets' :
                        policy.id === 'food-security-hub' ? 'food-security' :
                        policy.id === 'plus-swipe-expansion' ? 'plus-swipe' :
                        policy.id === 'grocery-shuttle' ? 'grocery-shuttle' :
                        policy.id === 'offcampus-education' ? 'offcampus-living' : 'overview'
                      )}>
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

              {/* Quick Stats */}
              <Reveal>
                <span className="caption mb-6 block">Impact Metrics</span>
              </Reveal>
              <div className="grid md:grid-cols-4 gap-6">
                <Reveal delay={50}>
                  <div className="card p-6 text-center">
                    <p className="text-3xl font-mono font-bold text-white"><Editable k="basicneeds.overview.stat1.value">847</Editable></p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest"><Editable k="basicneeds.overview.stat1.label">Pantry Visits This Month</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="card p-6 text-center">
                    <p className="text-3xl font-mono font-bold text-white"><Editable k="basicneeds.overview.stat2.value">156</Editable></p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest"><Editable k="basicneeds.overview.stat2.label">Shuttle Rides Given</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={150}>
                  <div className="card p-6 text-center">
                    <p className="text-3xl font-mono font-bold text-white"><Editable k="basicneeds.overview.stat3.value">324</Editable></p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest"><Editable k="basicneeds.overview.stat3.label">Swipes Shared</Editable></p>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <div className="card p-6 text-center">
                    <p className="text-3xl font-mono font-bold text-white"><Editable k="basicneeds.overview.stat4.value">89</Editable></p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest"><Editable k="basicneeds.overview.stat4.label">Workshop Attendees</Editable></p>
                  </div>
                </Reveal>
              </div>
            </div>
          )}

          {/* Farmers Markets Tab - Policy 1 */}
          {activeTab === 'farmers-markets' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="basicneeds.markets.title">On-Campus Farmers Markets</Editable></h2>
                <p className="body-large text-gray-400 mb-8"><Editable k="basicneeds.markets.subtitle">Fresh Local Produce and Chase Farm Stands</Editable></p>
              </Reveal>

              <PolicyProgress policy={getPolicy('farmers-markets')} />

              {/* Market Schedule */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="basicneeds.markets.scheduleheading">Market Schedule</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-6 mb-16">
                <Reveal delay={50}>
                  <div className="card-highlight p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div>
                        <h4 className="font-semibold text-white"><Editable k="basicneeds.markets.pit.name">The Pit Market</Editable></h4>
                        <p className="text-sm text-gray-400"><Editable k="basicneeds.markets.pit.subtitle">Main campus location</Editable></p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-white"><span className="text-gray-500"><Editable k="basicneeds.markets.label.when">When:</Editable></span> <Editable k="basicneeds.markets.pit.when">Wednesdays 11am-2pm</Editable></p>
                      <p className="text-white"><span className="text-gray-500"><Editable k="basicneeds.markets.label.where">Where:</Editable></span> <Editable k="basicneeds.markets.pit.where">The Pit (Polk Place)</Editable></p>
                      <p className="text-white"><span className="text-gray-500"><Editable k="basicneeds.markets.label.accepts">Accepts:</Editable></span> <Editable k="basicneeds.markets.pit.accepts">Cash, Card, Plus Swipe</Editable></p>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div>
                        <h4 className="font-semibold text-white"><Editable k="basicneeds.markets.south.name">South Campus Stand</Editable></h4>
                        <p className="text-sm text-gray-400"><Editable k="basicneeds.markets.south.subtitle">Chase Farm partnership</Editable></p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-white"><span className="text-gray-500"><Editable k="basicneeds.markets.label.when2">When:</Editable></span> <Editable k="basicneeds.markets.south.when">Fridays 3pm-6pm</Editable></p>
                      <p className="text-white"><span className="text-gray-500"><Editable k="basicneeds.markets.label.where2">Where:</Editable></span> <Editable k="basicneeds.markets.south.where">Ram Village Community Center</Editable></p>
                      <p className="text-white"><span className="text-gray-500"><Editable k="basicneeds.markets.label.accepts2">Accepts:</Editable></span> <Editable k="basicneeds.markets.south.accepts">Cash, Card, Plus Swipe</Editable></p>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* What's Available */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="basicneeds.markets.findheading">What You'll Find</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-4 gap-4 mb-16">
                {[
                  { key: 'product1', label: 'Fresh Vegetables' },
                  { key: 'product2', label: 'Seasonal Fruits' },
                  { key: 'product3', label: 'Farm Fresh Eggs' },
                  { key: 'product4', label: 'Local Honey' },
                  { key: 'product5', label: 'Artisan Breads' },
                  { key: 'product6', label: 'Local Cheeses' },
                  { key: 'product7', label: 'Fresh Herbs' },
                  { key: 'product8', label: 'Prepared Foods' },
                ].map((item, i) => (
                  <Reveal key={item.key} delay={i * 30}>
                    <div className="card p-4 text-center">
                      <p className="text-sm text-white"><Editable k={`basicneeds.markets.${item.key}`}>{item.label}</Editable></p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Partner Farms */}
              <Reveal>
                <div className="card p-8">
                  <h3 className="font-semibold text-white mb-6"><Editable k="basicneeds.markets.partnersheading">Partner Farms & Vendors</Editable></h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {['Carrboro Farmers Market', 'Chase Farm', 'Maple View Farm', 'Cates Farm', 'Celebrity Dairy', 'Sunrise Farm'].map((farm, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="text-white">-</span> <Editable k={`basicneeds.markets.farm${i + 1}`}>{farm}</Editable>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          {/* Food Security Hub Tab - Policy 2 */}
          {activeTab === 'food-security' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="basicneeds.hub.title">Centralized Food Security Hub</Editable></h2>
                <p className="body-large text-gray-400 mb-8"><Editable k="basicneeds.hub.subtitle">Meal Swipe Sharing, Pantries, and Community Fridges</Editable></p>
              </Reveal>

              <PolicyProgress policy={getPolicy('food-security-hub')} />

              <div className="grid lg:grid-cols-2 gap-12 mb-16">
                {/* Meal Swipe Sharing */}
                <Reveal>
                  <div className="card-highlight p-8">
                    <h3 className="text-xl font-semibold text-white mb-4"><Editable k="basicneeds.hub.swipesharing.title">Meal Swipe Sharing</Editable></h3>
                    <p className="text-sm text-gray-400 mb-8"><Editable k="basicneeds.hub.swipesharing.description" multiline>Share your extra meal swipes with students in need, or request swipes when you need them.</Editable></p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <p className="text-2xl font-mono font-bold text-white"><Editable k="basicneeds.hub.swipesharing.sharedcount">324</Editable></p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider"><Editable k="basicneeds.hub.swipesharing.sharedlabel">Swipes Shared</Editable></p>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <p className="text-2xl font-mono font-bold text-white"><Editable k="basicneeds.hub.swipesharing.helpedcount">156</Editable></p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider"><Editable k="basicneeds.hub.swipesharing.helpedlabel">Students Helped</Editable></p>
                      </div>
                    </div>

                    <button onClick={() => setShowSwipeShare(!showSwipeShare)} className="btn-primary w-full">
                      {showSwipeShare ? 'Close' : 'Share or Request Swipes'}
                    </button>
                    {showSwipeShare && (
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <a href={getSiteContent('basicneeds.swipe.url', 'https://software.sites.unc.edu/qualtrics/')} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center block">
                          Open Meal Swipe Form in Qualtrics
                        </a>
                        <p className="text-[10px] text-gray-600 font-mono mt-2 text-center break-all">
                          <Editable k="basicneeds.swipe.url">https://software.sites.unc.edu/qualtrics/</Editable>
                        </p>
                      </div>
                    )}
                  </div>
                </Reveal>

                {/* Pantry Locations */}
                <div>
                  <Reveal>
                    <span className="caption mb-6 block"><Editable k="basicneeds.hub.pantries.heading">Food Pantries</Editable></span>
                  </Reveal>
                  <div className="space-y-4">
                    {[
                      { name: 'Carolina Cupboard - Union', address: 'Student Union Lower Level', hours: 'M-F 10am-4pm' },
                      { name: 'Carolina Cupboard - South', address: 'Ram Village Community Center', hours: 'T/Th 2pm-6pm' },
                      { name: 'Carolina Cupboard - North', address: 'Hinton James Ground Floor', hours: 'M/W 3pm-7pm' },
                    ].map((pantry, i) => (
                      <Reveal key={i} delay={i * 50}>
                        <div className="card p-5">
                          <h4 className="font-semibold text-white"><Editable k={`basicneeds.hub.pantry${i + 1}.name`}>{pantry.name}</Editable></h4>
                          <p className="text-sm text-gray-400 mt-1"><Editable k={`basicneeds.hub.pantry${i + 1}.address`}>{pantry.address}</Editable></p>
                          <p className="text-xs text-gray-500 font-mono mt-1"><Editable k={`basicneeds.hub.pantry${i + 1}.hours`}>{pantry.hours}</Editable></p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </div>

              {/* Community Fridges */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="basicneeds.hub.fridges.heading">Community Fridges</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { location: 'Student Union', building: 'Near Room 1301' },
                  { location: 'Davis Library', building: 'Ground Floor' },
                  { location: 'Sitterson Hall', building: 'Main Lobby' },
                  { location: 'Kenan-Flagler', building: 'Student Lounge' },
                ].map((fridge, i) => (
                  <Reveal key={i} delay={i * 50}>
                    <div className="card p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white">-</span>
                        <h4 className="font-semibold text-white text-sm"><Editable k={`basicneeds.hub.fridge${i + 1}.location`}>{fridge.location}</Editable></h4>
                      </div>
                      <p className="text-xs text-gray-500"><Editable k={`basicneeds.hub.fridge${i + 1}.building`}>{fridge.building}</Editable></p>
                    </div>
                  </Reveal>
                ))}
              </div>

            </div>
          )}

          {/* Plus Swipe Tab - Policy 3 */}
          {activeTab === 'plus-swipe' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="basicneeds.plusswipe.title">Expand Plus Swipe Options</Editable></h2>
                <p className="body-large text-gray-400 mb-8"><Editable k="basicneeds.plusswipe.subtitle">Healthier Off-Campus Dining Locations</Editable></p>
              </Reveal>

              <PolicyProgress policy={getPolicy('plus-swipe-expansion')} />

              {/* Current Vendors */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="basicneeds.plusswipe.currentheading">Current Plus Swipe Vendors</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-3 gap-4 mb-16">
                {[
                  { name: 'Alpine Bagel', type: 'Breakfast/Lunch', location: 'Student Union' },
                  { name: 'Starbucks', type: 'Coffee/Snacks', location: 'Multiple locations' },
                  { name: 'Chick-fil-A', type: 'Fast Food', location: 'Student Union' },
                  { name: 'Panda Express', type: 'Fast Food', location: 'Student Union' },
                  { name: "Wendy's", type: 'Fast Food', location: 'Lenoir' },
                  { name: 'Subway', type: 'Sandwiches', location: 'Student Union' },
                ].map((vendor, i) => (
                  <Reveal key={i} delay={i * 30}>
                    <div className="card p-5">
                      <h4 className="font-semibold text-white"><Editable k={`basicneeds.plusswipe.vendor${i + 1}.name`}>{vendor.name}</Editable></h4>
                      <p className="text-sm text-gray-400 mt-1"><Editable k={`basicneeds.plusswipe.vendor${i + 1}.type`}>{vendor.type}</Editable></p>
                      <p className="text-xs text-gray-500 mt-1"><Editable k={`basicneeds.plusswipe.vendor${i + 1}.location`}>{vendor.location}</Editable></p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Proposed Additions */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="basicneeds.plusswipe.proposedheading">Proposed Healthier Options</Editable></span>
              </Reveal>
              <Reveal delay={100}>
                <div className="card-highlight p-8 mb-16">
                  <p className="text-sm text-gray-400 mb-8"><Editable k="basicneeds.plusswipe.proposeddesc" multiline>We're advocating to add these healthier off-campus options to Plus Swipe:</Editable></p>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { name: "Vimala's Curryblossom", reason: 'Local, healthy Indian cuisine' },
                      { name: 'Roots Natural Kitchen', reason: 'Build-your-own grain bowls' },
                      { name: 'Med Deli', reason: 'Mediterranean, vegetarian-friendly' },
                      { name: 'Cosmic Cantina', reason: 'Late-night healthy options' },
                      { name: 'Guasaca', reason: 'Fresh Venezuelan bowls' },
                      { name: 'Harvest 18', reason: 'Farm-to-table salads' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-white">-</span>
                        <div>
                          <p className="font-medium text-white"><Editable k={`basicneeds.plusswipe.proposed${i + 1}.name`}>{item.name}</Editable></p>
                          <p className="text-xs text-gray-500"><Editable k={`basicneeds.plusswipe.proposed${i + 1}.reason`}>{item.reason}</Editable></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Support the Initiative */}
              <Reveal>
                <div className="card p-8">
                  <h3 className="font-semibold text-white mb-4"><Editable k="basicneeds.plusswipe.support.title">Support This Initiative</Editable></h3>
                  <p className="text-sm text-gray-400 mb-6"><Editable k="basicneeds.plusswipe.support.description" multiline>Help us expand Plus Swipe to healthier options by sharing your feedback with Carolina Dining.</Editable></p>
                  <button className="btn-primary">
                    <Editable k="basicneeds.plusswipe.support.button">Submit Feedback to Dining</Editable>
                  </button>
                </div>
              </Reveal>
            </div>
          )}

          {/* Grocery Shuttle Tab - Policy 4 */}
          {activeTab === 'grocery-shuttle' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="basicneeds.shuttle.title">Student Grocery Shuttle</Editable></h2>
                <p className="body-large text-gray-400 mb-8"><Editable k="basicneeds.shuttle.subtitle">Free Transportation to Affordable Grocery Stores</Editable></p>
              </Reveal>

              <PolicyProgress policy={getPolicy('grocery-shuttle')} />

              <div className="grid lg:grid-cols-2 gap-12 mb-16">
                {/* Schedule */}
                <div>
                  <Reveal>
                    <span className="caption mb-6 block"><Editable k="basicneeds.shuttle.scheduleheading">Shuttle Schedule</Editable></span>
                  </Reveal>
                  <div className="space-y-4">
                    {[
                      { day: 'Saturday', route: "Trader Joe's & Harris Teeter", time: '10am - 4pm', status: 'running' },
                      { day: 'Sunday', route: 'Walmart & Aldi', time: '12pm - 5pm', status: 'running' },
                      { day: 'Wednesday', route: 'Harris Teeter & Whole Foods', time: '4pm - 8pm', status: 'coming' },
                    ].map((schedule, i) => (
                      <Reveal key={i} delay={i * 50}>
                        <div className="card p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-white"><Editable k={`basicneeds.shuttle.schedule${i + 1}.day`}>{schedule.day}</Editable></h4>
                              <p className="text-sm text-gray-400 mt-1"><Editable k={`basicneeds.shuttle.schedule${i + 1}.route`}>{schedule.route}</Editable></p>
                              <p className="text-xs text-gray-500 font-mono mt-1"><Editable k={`basicneeds.shuttle.schedule${i + 1}.time`}>{schedule.time}</Editable></p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-mono ${
                              schedule.status === 'running' ? 'bg-white/10 text-white' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {schedule.status === 'running' ? <Editable k="basicneeds.shuttle.status.running">RUNNING</Editable> : <Editable k="basicneeds.shuttle.status.coming">COMING SOON</Editable>}
                            </span>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>

                {/* Reserve Spot */}
                <Reveal>
                  <div className="card-highlight p-8">
                    <h3 className="text-xl font-semibold text-white mb-4"><Editable k="basicneeds.shuttle.reserve.title">Reserve Your Spot</Editable></h3>
                    <p className="text-sm text-gray-400 mb-8"><Editable k="basicneeds.shuttle.reserve.description" multiline>Reservations recommended but walk-ons welcome if space allows. Shuttle departs from the Student Union.</Editable></p>

                    <div className="space-y-3 mb-8">
                      {['Free for all UNC students', 'Bring your One Card', '1-2 hours shopping time', 'Help with groceries available'].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="text-white">-</span> <Editable k={`basicneeds.shuttle.feature${i + 1}`}>{feature}</Editable>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => setShowShuttleReservation(!showShuttleReservation)} className="btn-primary w-full">
                      {showShuttleReservation ? 'Close' : 'Reserve a Spot'}
                    </button>
                    {showShuttleReservation && (
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <a href={getSiteContent('basicneeds.shuttle.url', 'https://software.sites.unc.edu/qualtrics/')} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center block">
                          Open Shuttle Reservation Form in Qualtrics
                        </a>
                        <p className="text-[10px] text-gray-600 font-mono mt-2 text-center break-all">
                          <Editable k="basicneeds.shuttle.url">https://software.sites.unc.edu/qualtrics/</Editable>
                        </p>
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>

              {/* How-To Guide */}
              {shuttleGuide && (
                <Reveal>
                  <div className="card p-8">
                    <h3 className="text-xl font-semibold text-white mb-8">{shuttleGuide.title}</h3>
                    <div className="grid md:grid-cols-4 gap-6">
                      {shuttleGuide.steps.map(step => (
                        <div key={step.step} className="relative">
                          <div className="absolute -top-3 left-4 bg-white text-black text-xs font-bold px-2 py-1 rounded">
                            Step {step.step}
                          </div>
                          <div className="bg-white/5 rounded-lg p-5 pt-6">
                            <h4 className="font-medium text-white text-sm mb-2">{step.title}</h4>
                            <p className="text-xs text-gray-500">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

            </div>
          )}

          {/* Off-Campus Living Tab - Policy 5 */}
          {activeTab === 'offcampus-living' && (
            <div>
              <Reveal>
                <h2 className="section-title mb-2"><Editable k="basicneeds.offcampus.title">Off-Campus Living Education</Editable></h2>
                <p className="body-large text-gray-400 mb-8"><Editable k="basicneeds.offcampus.subtitle">Leases, Budgeting, and Housing Resources</Editable></p>
              </Reveal>

              <PolicyProgress policy={getPolicy('offcampus-education')} />

              {/* Upcoming Workshops */}
              <Reveal>
                <span className="caption mb-6 block"><Editable k="basicneeds.offcampus.workshopsheading">Upcoming Workshops</Editable></span>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-4 mb-16">
                {[
                  { title: 'Understanding Your Lease', datetime: 'Feb 15, 2026 at 5pm', location: 'Union 3201', spots: '25 spots', calendar: calendarEvents.leaseWorkshop },
                  { title: 'Budgeting for Off-Campus Life', datetime: 'Feb 22, 2026 at 4pm', location: 'Union 3205', spots: '30 spots', calendar: calendarEvents.budgetingWorkshop },
                  { title: 'Finding Roommates & Housing', datetime: 'Mar 1, 2026 at 5pm', location: 'Union 3201', spots: '25 spots' },
                  { title: 'Utilities & Bills 101', datetime: 'Mar 8, 2026 at 4pm', location: 'Union 3205', spots: '30 spots' },
                ].map((workshop, i) => (
                  <Reveal key={i} delay={i * 50}>
                    <div className="card p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-white"><Editable k={`basicneeds.offcampus.workshop${i + 1}.title`}>{workshop.title}</Editable></h4>
                        <span className="px-2 py-1 rounded text-xs bg-white/10 text-white">
                          <Editable k={`basicneeds.offcampus.workshop${i + 1}.spots`}>{workshop.spots}</Editable>
                        </span>
                      </div>
                      <p className="text-sm text-gray-400"><Editable k={`basicneeds.offcampus.workshop${i + 1}.datetime`}>{workshop.datetime}</Editable></p>
                      <p className="text-xs text-gray-500 mt-1"><Editable k={`basicneeds.offcampus.workshop${i + 1}.location`}>{workshop.location}</Editable></p>
                      <div className="flex items-center gap-4 mt-4">
                        {workshop.calendar ? (
                          <a href={workshop.calendar} target="_blank" rel="noopener noreferrer" className="text-white text-sm font-medium hover:text-gray-300 transition-colors">Add to Calendar</a>
                        ) : (
                          <button className="text-white text-sm font-medium hover:text-gray-300 transition-colors"><Editable k={`basicneeds.offcampus.registerlink${i + 1}`}>Register</Editable></button>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Resources */}
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Peer Financial Coaches */}
                <Reveal>
                  <div className="card-highlight p-8">
                    <h3 className="text-xl font-semibold text-white mb-4"><Editable k="basicneeds.offcampus.coach.title">Meet with a Peer Financial Coach</Editable></h3>
                    <p className="text-sm text-gray-400 mb-6"><Editable k="basicneeds.offcampus.coach.description" multiline>Our coaches are now trained in housing-related budgeting and can help you plan for off-campus expenses.</Editable></p>
                    <ul className="space-y-3 mb-8">
                      {['One-on-one appointments', 'Help with lease review', 'Budget planning', 'Financial aid questions'].map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="text-white">-</span> <Editable k={`basicneeds.offcampus.coach.feature${i + 1}`}>{feature}</Editable>
                        </li>
                      ))}
                    </ul>
                    <button className="btn-primary">
                      <Editable k="basicneeds.offcampus.coach.button">Schedule Appointment</Editable>
                    </button>
                  </div>
                </Reveal>

                {/* Quick Resources */}
                <div>
                  <Reveal>
                    <span className="caption mb-6 block"><Editable k="basicneeds.offcampus.resources.heading">Quick Resources</Editable></span>
                  </Reveal>
                  <div className="space-y-4">
                    <Reveal delay={50}>
                      <a href={externalLinks.offCampusHousing} target="_blank" rel="noopener noreferrer" className="card p-5 block group">
                        <h4 className="font-semibold text-white group-hover:text-gray-300 transition-colors"><Editable k="basicneeds.offcampus.resource1.title">Lease Checklist</Editable></h4>
                        <p className="text-sm text-gray-500 mt-1"><Editable k="basicneeds.offcampus.resource1.desc">What to look for before signing</Editable></p>
                      </a>
                    </Reveal>
                    <Reveal delay={100}>
                      <button onClick={downloadBudgetTemplate} className="card p-5 text-left w-full group">
                        <h4 className="font-semibold text-white group-hover:text-gray-300 transition-colors"><Editable k="basicneeds.offcampus.resource2.title">Budget Template</Editable></h4>
                        <p className="text-sm text-gray-500 mt-1"><Editable k="basicneeds.offcampus.resource2.desc">Download budget planning template</Editable></p>
                      </button>
                    </Reveal>
                    <Reveal delay={150}>
                      <a href={externalLinks.offCampusHousing} target="_blank" rel="noopener noreferrer" className="card p-5 block group">
                        <h4 className="font-semibold text-white group-hover:text-gray-300 transition-colors"><Editable k="basicneeds.offcampus.resource3.title">Housing Search Guide</Editable></h4>
                        <p className="text-sm text-gray-500 mt-1"><Editable k="basicneeds.offcampus.resource3.desc">Tips for finding apartments</Editable></p>
                      </a>
                    </Reveal>
                    <Reveal delay={200}>
                      <button onClick={downloadRoommateAgreement} className="card p-5 text-left w-full group">
                        <h4 className="font-semibold text-white group-hover:text-gray-300 transition-colors"><Editable k="basicneeds.offcampus.resource4.title">Roommate Agreement</Editable></h4>
                        <p className="text-sm text-gray-500 mt-1"><Editable k="basicneeds.offcampus.resource4.desc">Download roommate agreement template</Editable></p>
                      </button>
                    </Reveal>
                  </div>
                </div>
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
                    <h2 className="section-title mb-8"><Editable k="basicneeds.faq.contacttitle">Contact Us</Editable></h2>
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

                  {/* Quick Feedback Form */}
                  <Reveal delay={200}>
                    <div className="card p-8 mt-6">
                      <h3 className="font-semibold text-white text-lg mb-6"><Editable k="basicneeds.faq.feedbacktitle">Send Feedback</Editable></h3>
                      <button onClick={() => setShowFeedbackForm(!showFeedbackForm)} className="btn-primary w-full">
                        {showFeedbackForm ? 'Close' : <Editable k="basicneeds.faq.submitfeedback">Submit Feedback</Editable>}
                      </button>
                      {showFeedbackForm && (
                        <div className="mt-6 pt-6 border-t border-gray-800">
                          <a href={getSiteContent('basicneeds.feedback.url', 'https://software.sites.unc.edu/qualtrics/')} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full text-center block">
                            Open Feedback Form in Qualtrics
                          </a>
                          <p className="text-[10px] text-gray-600 font-mono mt-2 text-center break-all">
                            <Editable k="basicneeds.feedback.url">https://software.sites.unc.edu/qualtrics/</Editable>
                          </p>
                        </div>
                      )}
                    </div>
                  </Reveal>
                </div>

                {/* FAQ Section */}
                <div>
                  <Reveal>
                    <h2 className="section-title mb-8"><Editable k="basicneeds.faq.faqtitle">Frequently Asked Questions</Editable></h2>
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
                <h3 className="text-xl font-semibold text-white mb-6"><Editable k="basicneeds.faq.updatestitle">Recent Updates</Editable></h3>
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
