import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { departmentContacts, departmentFAQs, departmentAnnouncements, serviceGuides } from '../../lib/data'
import { EditModeToggle } from '../../components/InlineEditor'

export default function BasicNeedsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showShuttleReservation, setShowShuttleReservation] = useState(false)
  const [showSwipeShare, setShowSwipeShare] = useState(false)
  const [submitted, setSubmitted] = useState(null)
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

  const handleFeedbackSubmit = (e) => {
    e.preventDefault()
    setFeedbackSubmitted(true)
    setFeedbackForm({ topic: '', message: '', email: '' })
  }

  const handleFormSubmit = (type) => (e) => {
    e.preventDefault()
    setSubmitted(type)
    setShowShuttleReservation(false)
    setShowSwipeShare(false)
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
          {policy?.status === 'in_progress' ? 'IN PROGRESS' : policy?.status === 'completed' ? 'COMPLETED' : 'PLANNED'}
        </span>
        <span className="text-[#8b949e] font-mono text-sm">{policy?.progress || 0}% Complete</span>
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
          <p className="text-[#d29922] text-xs font-medium tracking-widest uppercase mb-4">Basic Needs</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0f6fc] tracking-tight mb-4">
            Supporting Every Tar Heel
          </h1>
          <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed">
            Food security, grocery access, affordable dining, and housing education.
            No student should struggle to meet basic needs.
          </p>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="bg-[#b62324] border-b border-[#da3633]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <p className="font-semibold text-white uppercase text-sm tracking-wide">Need immediate help?</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="tel:919-966-4042" className="bg-white text-[#b62324] px-4 py-2 rounded font-mono font-bold hover:bg-[#f0f6fc] transition-colors">
              Dean of Students: 919-966-4042
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
                {submitted === 'shuttle' && 'Your shuttle reservation has been confirmed! Check your email for details.'}
                {submitted === 'swipe' && 'Thank you! Your meal swipe share has been registered.'}
              </p>
              <button onClick={() => setSubmitted(null)} className="text-[#d29922] text-sm font-medium mt-3 hover:underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Basic Needs Initiatives</h2>

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
                {[
                  { label: 'Pantry Visits This Month', value: '847', color: '#d29922' },
                  { label: 'Shuttle Rides Given', value: '156', color: '#3fb950' },
                  { label: 'Swipes Shared', value: '324', color: '#58a6ff' },
                  { label: 'Workshop Attendees', value: '89', color: '#a371f7' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Farmers Markets Tab - Policy 1 */}
          {activeTab === 'farmers-markets' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">On-Campus Farmers Markets</h2>
              <p className="text-[#8b949e] mb-6">Fresh Local Produce and Chase Farm Stands</p>

              <PolicyProgress policy={getPolicy('farmers-markets')} />

              {/* Market Schedule */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Market Schedule</h3>
              <div className="grid md:grid-cols-2 gap-5 mb-10">
                <div className="bg-[#161b22] border border-[#d29922] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🥕</span>
                    <div>
                      <h4 className="font-semibold text-[#f0f6fc]">The Pit Market</h4>
                      <p className="text-sm text-[#8b949e]">Main campus location</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-[#f0f6fc]"><span className="text-[#6e7681]">When:</span> Wednesdays 11am-2pm</p>
                    <p className="text-[#f0f6fc]"><span className="text-[#6e7681]">Where:</span> The Pit (Polk Place)</p>
                    <p className="text-[#f0f6fc]"><span className="text-[#6e7681]">Accepts:</span> Cash, Card, Plus Swipe</p>
                  </div>
                </div>

                <div className="bg-[#161b22] border border-[#3fb950] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🌽</span>
                    <div>
                      <h4 className="font-semibold text-[#f0f6fc]">South Campus Stand</h4>
                      <p className="text-sm text-[#8b949e]">Chase Farm partnership</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-[#f0f6fc]"><span className="text-[#6e7681]">When:</span> Fridays 3pm-6pm</p>
                    <p className="text-[#f0f6fc]"><span className="text-[#6e7681]">Where:</span> Ram Village Community Center</p>
                    <p className="text-[#f0f6fc]"><span className="text-[#6e7681]">Accepts:</span> Cash, Card, Plus Swipe</p>
                  </div>
                </div>
              </div>

              {/* What's Available */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">What You'll Find</h3>
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                {[
                  { emoji: '🍅', name: 'Fresh Vegetables' },
                  { emoji: '🍎', name: 'Seasonal Fruits' },
                  { emoji: '🥚', name: 'Farm Fresh Eggs' },
                  { emoji: '🍯', name: 'Local Honey' },
                  { emoji: '🥖', name: 'Artisan Breads' },
                  { emoji: '🧀', name: 'Local Cheeses' },
                  { emoji: '🌿', name: 'Fresh Herbs' },
                  { emoji: '🥗', name: 'Prepared Foods' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                    <span className="text-2xl">{item.emoji}</span>
                    <p className="text-sm text-[#f0f6fc] mt-2">{item.name}</p>
                  </div>
                ))}
              </div>

              {/* Partner Farms */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-4">Partner Farms & Vendors</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {['Carrboro Farmers Market', 'Chase Farm', 'Maple View Farm', 'Cates Farm', 'Celebrity Dairy', 'Sunrise Farm'].map((farm, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-[#8b949e]">
                      <span className="text-[#3fb950]">✓</span> {farm}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Food Security Hub Tab - Policy 2 */}
          {activeTab === 'food-security' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Centralized Food Security Hub</h2>
              <p className="text-[#8b949e] mb-6">Meal Swipe Sharing, Pantries, and Community Fridges</p>

              <PolicyProgress policy={getPolicy('food-security-hub')} />

              <div className="grid lg:grid-cols-2 gap-8 mb-10">
                {/* Meal Swipe Sharing */}
                <div className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Meal Swipe Sharing</h3>
                  <p className="text-sm text-[#8b949e] mb-6">Share your extra meal swipes with students in need, or request swipes when you need them.</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-[#21262d] rounded-lg">
                      <p className="text-2xl font-mono font-bold text-[#58a6ff]">324</p>
                      <p className="text-xs text-[#6e7681] uppercase">Swipes Shared</p>
                    </div>
                    <div className="text-center p-4 bg-[#21262d] rounded-lg">
                      <p className="text-2xl font-mono font-bold text-[#3fb950]">156</p>
                      <p className="text-xs text-[#6e7681] uppercase">Students Helped</p>
                    </div>
                  </div>

                  <button onClick={() => setShowSwipeShare(true)}
                    className="w-full bg-[#58a6ff] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#79b8ff] transition-colors">
                    Share or Request Swipes
                  </button>
                </div>

                {/* Pantry Locations */}
                <div>
                  <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Food Pantries</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Carolina Cupboard - Union', hours: 'M-F 10am-4pm', address: 'Student Union Lower Level' },
                      { name: 'Carolina Cupboard - South', hours: 'T/Th 2pm-6pm', address: 'Ram Village Community Center' },
                      { name: 'Carolina Cupboard - North', hours: 'M/W 3pm-7pm', address: 'Hinton James Ground Floor' },
                    ].map((pantry, i) => (
                      <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                        <h4 className="font-semibold text-[#f0f6fc]">{pantry.name}</h4>
                        <p className="text-sm text-[#8b949e] mt-1">{pantry.address}</p>
                        <p className="text-xs text-[#6e7681] font-mono mt-1">{pantry.hours}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Community Fridges */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Community Fridges</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { location: 'Student Union', building: 'Near Room 1301' },
                  { location: 'Davis Library', building: 'Ground Floor' },
                  { location: 'Sitterson Hall', building: 'Main Lobby' },
                  { location: 'Kenan-Flagler', building: 'Student Lounge' },
                ].map((fridge, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#3fb950]">🧊</span>
                      <h4 className="font-semibold text-[#f0f6fc] text-sm">{fridge.location}</h4>
                    </div>
                    <p className="text-xs text-[#8b949e]">{fridge.building}</p>
                  </div>
                ))}
              </div>

              {/* Swipe Share Modal */}
              {showSwipeShare && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6">
                    <h3 className="text-xl font-bold text-[#f0f6fc] mb-6">Meal Swipe Exchange</h3>
                    <form onSubmit={handleFormSubmit('swipe')} className="space-y-4">
                      <Select label="I want to..." required
                        options={[
                          { value: 'share', label: 'Share my extra swipes' },
                          { value: 'request', label: 'Request meal swipes' },
                        ]}
                      />
                      <Input label="Your Name" required />
                      <Input label="Email" type="email" required />
                      <Input label="Number of Swipes" type="number" required />
                      <Textarea label="Message (optional)" rows={2} />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 bg-[#58a6ff] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#79b8ff]">
                          Submit
                        </button>
                        <button type="button" onClick={() => setShowSwipeShare(false)} className="px-6 py-3 rounded text-[#8b949e] border border-[#30363d] hover:bg-[#21262d]">
                          Cancel
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
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Expand Plus Swipe Options</h2>
              <p className="text-[#8b949e] mb-6">Healthier Off-Campus Dining Locations</p>

              <PolicyProgress policy={getPolicy('plus-swipe-expansion')} />

              {/* Current Vendors */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Current Plus Swipe Vendors</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                {[
                  { name: 'Alpine Bagel', type: 'Breakfast/Lunch', location: 'Student Union' },
                  { name: 'Starbucks', type: 'Coffee/Snacks', location: 'Multiple locations' },
                  { name: 'Chick-fil-A', type: 'Fast Food', location: 'Student Union' },
                  { name: 'Panda Express', type: 'Fast Food', location: 'Student Union' },
                  { name: 'Wendy\'s', type: 'Fast Food', location: 'Lenoir' },
                  { name: 'Subway', type: 'Sandwiches', location: 'Student Union' },
                ].map((vendor, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                    <h4 className="font-semibold text-[#f0f6fc]">{vendor.name}</h4>
                    <p className="text-sm text-[#8b949e] mt-1">{vendor.type}</p>
                    <p className="text-xs text-[#6e7681] mt-1">{vendor.location}</p>
                  </div>
                ))}
              </div>

              {/* Proposed Additions */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Proposed Healthier Options</h3>
              <div className="bg-[#161b22] border border-[#d29922] rounded-lg p-6 mb-10">
                <p className="text-sm text-[#8b949e] mb-6">We're advocating to add these healthier off-campus options to Plus Swipe:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: 'Vimala\'s Curryblossom', reason: 'Local, healthy Indian cuisine' },
                    { name: 'Roots Natural Kitchen', reason: 'Build-your-own grain bowls' },
                    { name: 'Med Deli', reason: 'Mediterranean, vegetarian-friendly' },
                    { name: 'Cosmic Cantina', reason: 'Late-night healthy options' },
                    { name: 'Guasaca', reason: 'Fresh Venezuelan bowls' },
                    { name: 'Harvest 18', reason: 'Farm-to-table salads' },
                  ].map((vendor, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-[#d29922]">→</span>
                      <div>
                        <p className="font-medium text-[#f0f6fc]">{vendor.name}</p>
                        <p className="text-xs text-[#8b949e]">{vendor.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support the Initiative */}
              <div className="bg-[#161b22] border border-[#3fb950] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-4">Support This Initiative</h3>
                <p className="text-sm text-[#8b949e] mb-4">Help us expand Plus Swipe to healthier options by sharing your feedback with Carolina Dining.</p>
                <button className="bg-[#3fb950] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#46c356] transition-colors">
                  Submit Feedback to Dining
                </button>
              </div>
            </div>
          )}

          {/* Grocery Shuttle Tab - Policy 4 */}
          {activeTab === 'grocery-shuttle' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Student Grocery Shuttle</h2>
              <p className="text-[#8b949e] mb-6">Free Transportation to Affordable Grocery Stores</p>

              <PolicyProgress policy={getPolicy('grocery-shuttle')} />

              <div className="grid lg:grid-cols-2 gap-8 mb-10">
                {/* Schedule */}
                <div>
                  <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Shuttle Schedule</h3>
                  <div className="space-y-4">
                    {[
                      { day: 'Saturday', time: '10am - 4pm', route: 'Trader Joe\'s & Harris Teeter', status: 'active' },
                      { day: 'Sunday', time: '12pm - 5pm', route: 'Walmart & Aldi', status: 'active' },
                      { day: 'Wednesday', time: '4pm - 8pm', route: 'Harris Teeter & Whole Foods', status: 'coming' },
                    ].map((schedule, i) => (
                      <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-[#f0f6fc]">{schedule.day}</h4>
                            <p className="text-sm text-[#8b949e] mt-1">{schedule.route}</p>
                            <p className="text-xs text-[#6e7681] font-mono mt-1">{schedule.time}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-mono ${
                            schedule.status === 'active' ? 'bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]' :
                            'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]'
                          }`}>
                            {schedule.status === 'active' ? 'RUNNING' : 'COMING SOON'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reserve Spot */}
                <div className="bg-[#161b22] border border-[#d29922] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Reserve Your Spot</h3>
                  <p className="text-sm text-[#8b949e] mb-6">Reservations recommended but walk-ons welcome if space allows. Shuttle departs from the Student Union.</p>

                  <div className="space-y-4 mb-6">
                    {['Free for all UNC students', 'Bring your One Card', '1-2 hours shopping time', 'Help with groceries available'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-[#8b949e]">
                        <span className="text-[#3fb950]">✓</span> {item}
                      </div>
                    ))}
                  </div>

                  <button onClick={() => setShowShuttleReservation(true)}
                    className="w-full bg-[#d29922] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#e5ac30] transition-colors">
                    Reserve a Spot
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
                    <h3 className="text-xl font-bold text-[#f0f6fc] mb-6">Reserve Shuttle Spot</h3>
                    <form onSubmit={handleFormSubmit('shuttle')} className="space-y-4">
                      <Input label="Your Name" required />
                      <Input label="Email" type="email" required />
                      <Select label="Select Day" required
                        options={[
                          { value: 'saturday', label: 'Saturday (Trader Joe\'s & Harris Teeter)' },
                          { value: 'sunday', label: 'Sunday (Walmart & Aldi)' },
                        ]}
                      />
                      <Select label="Departure Time" required
                        options={[
                          { value: '10am', label: '10:00 AM' },
                          { value: '12pm', label: '12:00 PM' },
                          { value: '2pm', label: '2:00 PM' },
                        ]}
                      />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 bg-[#d29922] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#e5ac30]">
                          Confirm Reservation
                        </button>
                        <button type="button" onClick={() => setShowShuttleReservation(false)} className="px-6 py-3 rounded text-[#8b949e] border border-[#30363d] hover:bg-[#21262d]">
                          Cancel
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
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Off-Campus Living Education</h2>
              <p className="text-[#8b949e] mb-6">Leases, Budgeting, and Housing Resources</p>

              <PolicyProgress policy={getPolicy('offcampus-education')} />

              {/* Upcoming Workshops */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Upcoming Workshops</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-10">
                {[
                  { title: 'Understanding Your Lease', date: 'Feb 15, 2026', time: '5pm', location: 'Union 3201', spots: 25 },
                  { title: 'Budgeting for Off-Campus Life', date: 'Feb 22, 2026', time: '4pm', location: 'Union 3205', spots: 30 },
                  { title: 'Finding Roommates & Housing', date: 'Mar 1, 2026', time: '5pm', location: 'Union 3201', spots: 25 },
                  { title: 'Utilities & Bills 101', date: 'Mar 8, 2026', time: '4pm', location: 'Union 3205', spots: 30 },
                ].map((workshop, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-[#f0f6fc]">{workshop.title}</h4>
                      <span className="px-2 py-0.5 rounded text-xs bg-[#d29922]/10 text-[#d29922] border border-[#d29922]">
                        {workshop.spots} spots
                      </span>
                    </div>
                    <p className="text-sm text-[#8b949e]">{workshop.date} at {workshop.time}</p>
                    <p className="text-xs text-[#6e7681] mt-1">{workshop.location}</p>
                    <button className="mt-4 text-[#58a6ff] text-sm font-medium hover:underline">Register →</button>
                  </div>
                ))}
              </div>

              {/* Resources */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Peer Financial Coaches */}
                <div className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Meet with a Peer Financial Coach</h3>
                  <p className="text-sm text-[#8b949e] mb-4">Our coaches are now trained in housing-related budgeting and can help you plan for off-campus expenses.</p>
                  <ul className="space-y-2 mb-6">
                    {['One-on-one appointments', 'Help with lease review', 'Budget planning', 'Financial aid questions'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-[#8b949e]">
                        <span className="text-[#58a6ff]">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                  <button className="bg-[#58a6ff] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#79b8ff] transition-colors">
                    Schedule Appointment
                  </button>
                </div>

                {/* Quick Resources */}
                <div>
                  <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Quick Resources</h3>
                  <div className="space-y-3">
                    {[
                      { title: 'Lease Checklist', desc: 'What to look for before signing' },
                      { title: 'Budget Template', desc: 'Excel template for monthly expenses' },
                      { title: 'Housing Search Guide', desc: 'Tips for finding apartments' },
                      { title: 'Roommate Agreement', desc: 'Template for living arrangements' },
                    ].map((resource, i) => (
                      <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#d29922] transition-colors cursor-pointer">
                        <h4 className="font-semibold text-[#f0f6fc]">{resource.title}</h4>
                        <p className="text-sm text-[#8b949e] mt-1">{resource.desc}</p>
                      </div>
                    ))}
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
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-6">Contact Us</h2>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#d29922]/10 border border-[#d29922]/30 rounded-full flex items-center justify-center">
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
                        <a href={`mailto:${contact.lead.email}`} className="text-[#58a6ff] hover:underline">{contact.lead.email}</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">📱</span>
                        <span className="text-[#f0f6fc]">{contact.socialMedia}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Feedback Form */}
                  <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h3 className="font-semibold text-[#f0f6fc] mb-4">Send Feedback</h3>
                    {feedbackSubmitted ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-[#d29922]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">✓</span>
                        </div>
                        <p className="text-[#d29922] font-medium">Thanks for your feedback!</p>
                        <button onClick={() => setFeedbackSubmitted(false)} className="text-[#58a6ff] text-sm mt-2 hover:underline">Send another</button>
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
                        <button type="submit" className="w-full bg-[#d29922] text-[#0d1117] px-4 py-2.5 rounded font-semibold hover:bg-[#e5ac30] transition-colors">
                          Submit Feedback
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-6">Frequently Asked Questions</h2>
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
                <h3 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-5">Recent Updates</h3>
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
