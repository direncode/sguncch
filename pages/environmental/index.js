import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { departmentContacts, departmentFAQs, departmentAnnouncements, serviceGuides } from '../../lib/data'
import { EditModeToggle } from '../../components/InlineEditor'

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

  const handleFeedbackSubmit = (e) => {
    e.preventDefault()
    setFeedbackSubmitted(true)
    setFeedbackForm({ topic: '', message: '', email: '' })
  }

  const handleAdoptSubmit = (e) => {
    e.preventDefault()
    setFormSubmitted(true)
    setShowAdoptModal(false)
    setAdoptForm({ orgName: '', contact: '', email: '', space: '' })
  }

  const handleDonateSubmit = (e) => {
    e.preventDefault()
    setFormSubmitted(true)
    setShowDonateModal(false)
    setDonateForm({ name: '', email: '', items: '', pickupDate: '' })
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
              <p className="text-[#3fb950] text-xs font-mono uppercase tracking-widest mb-1">SUSTAINABILITY DIVISION</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#f0f6fc]">Environmental Affairs</h1>
            </div>
          </div>
          <p className="text-[#8b949e] text-lg max-w-2xl mt-4">
            Sustainability, climate action, and green initiatives. Building a more sustainable Carolina through
            food waste reduction, campus cleanups, and environmental education.
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
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="bg-[#0a0e14] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {formSubmitted && (
            <div className="mb-8 bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-5">
              <p className="text-[#f0f6fc] font-medium">Your submission has been received! We'll be in touch soon.</p>
              <button onClick={() => setFormSubmitted(false)} className="text-[#3fb950] text-sm mt-2 font-medium hover:underline">Dismiss</button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Environmental Overview</h2>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">{deptPolicies.length}</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Initiatives</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#58a6ff]">
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
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">All Environmental Policies</h3>
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
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4">Sustain Carolina Week</h2>
              <PolicyProgress policy={getPolicy('sustain-carolina-week')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#3fb950] text-lg mb-3">About the Week</h3>
                <p className="text-[#8b949e] mb-4">
                  Sustain Carolina Week is a campus-wide celebration uniting student organizations, academic departments,
                  and community partners. The week features zero-waste challenges, sustainable fashion pop-ups, faculty
                  panels, and outdoor service projects like litter cleanups.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-center">
                    <p className="text-2xl font-semibold font-mono text-[#3fb950]">March 3-7</p>
                    <p className="text-sm text-[#6e7681]">2026 Dates</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-center">
                    <p className="text-2xl font-semibold font-mono text-[#58a6ff]">0</p>
                    <p className="text-sm text-[#6e7681]">Events Planned</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-center">
                    <p className="text-2xl font-semibold font-mono text-[#a371f7]">0</p>
                    <p className="text-sm text-[#6e7681]">Partners</p>
                  </div>
                </div>
              </div>

              {/* Event Categories */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Planned Events</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {[
                  { name: 'Zero-Waste Challenges', icon: '♻️', description: 'Campus-wide competitions to reduce waste and track impact' },
                  { name: 'Sustainable Fashion Pop-Up', icon: '👗', description: 'Clothing swap and thrift market in the Pit' },
                  { name: 'Faculty Sustainability Panels', icon: '🎤', description: 'Discussions on climate research and campus initiatives' },
                  { name: 'Litter Cleanup Day', icon: '🧹', description: 'Service project cleaning up campus and surrounding areas' },
                ].map((event, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#3fb950]/20 border border-[#3fb950]/40 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">{event.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#f0f6fc]">{event.name}</h4>
                        <p className="text-sm text-[#8b949e] mt-1">{event.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Get Involved */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4">Get Involved</h3>
                <p className="text-[#8b949e] mb-4">
                  Want to host an event or partner with Sustain Carolina Week? Let us know!
                </p>
                <button className="px-6 py-3 bg-[#238636] text-white rounded font-medium hover:bg-[#2ea043] transition-colors">
                  Partner With Us
                </button>
              </div>
            </div>
          )}

          {/* Too Good To Go Tab */}
          {activeTab === 'too-good-to-go' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4">Too Good To Go Program</h2>
              <PolicyProgress policy={getPolicy('too-good-to-go')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#3fb950] text-lg mb-3">About the Program</h3>
                <p className="text-[#8b949e] mb-4">
                  We're partnering with Carolina Dining Services to redistribute surplus dining hall meals through a
                  low-cost or free student access platform. This reduces food waste while addressing food insecurity—a
                  key intersection of sustainability and equity.
                </p>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Meals Redistributed</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#58a6ff]">0 lbs</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Waste Reduced</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Students Served</p>
                </div>
              </div>

              {/* How It Works */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">{tgtgGuide.title}</h3>
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                {tgtgGuide.steps.map((step) => (
                  <div key={step.step} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 relative">
                    <div className="absolute -top-3 left-4 bg-[#238636] text-white text-xs font-bold px-2 py-1 rounded">
                      Step {step.step}
                    </div>
                    <h4 className="font-semibold text-[#f0f6fc] mt-2 mb-2">{step.title}</h4>
                    <p className="text-sm text-[#8b949e]">{step.description}</p>
                  </div>
                ))}
              </div>

              {/* Locations */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Participating Locations</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Lenoir Dining Hall', status: 'Pilot', time: 'End of dinner service' },
                  { name: 'Chase Dining Hall', status: 'Pilot', time: 'End of dinner service' },
                ].map((loc, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-[#f0f6fc]">{loc.name}</h4>
                      <p className="text-sm text-[#6e7681]">{loc.time}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-[#3fb950]/10 border border-[#3fb950] text-[#3fb950] rounded text-xs font-mono uppercase">
                      {loc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adopt-a-Space Tab */}
          {activeTab === 'adopt-a-space' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4">Adopt-a-Space Program</h2>
              <PolicyProgress policy={getPolicy('adopt-a-space')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#3fb950] text-lg mb-3">About the Program</h3>
                <p className="text-[#8b949e] mb-4">
                  Empower student organizations, residence halls, and RAs to adopt designated campus spaces and maintain
                  them through regular cleanup events. Monthly Campus Cleanup Days offer service hours and team-building
                  opportunities while keeping our campus beautiful.
                </p>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Spaces Adopted</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#58a6ff]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Cleanup Events</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Volunteers</p>
                </div>
              </div>

              {/* How It Works */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">{adoptGuide.title}</h3>
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                {adoptGuide.steps.map((step) => (
                  <div key={step.step} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 relative">
                    <div className="absolute -top-3 left-4 bg-[#238636] text-white text-xs font-bold px-2 py-1 rounded">
                      Step {step.step}
                    </div>
                    <h4 className="font-semibold text-[#f0f6fc] mt-2 mb-2">{step.title}</h4>
                    <p className="text-sm text-[#8b949e]">{step.description}</p>
                  </div>
                ))}
              </div>

              {/* Available Spaces */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Available Spaces</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                {[
                  { name: 'Polk Place Quad', status: 'Available' },
                  { name: 'McCorkle Place', status: 'Available' },
                  { name: 'The Pit Area', status: 'Available' },
                  { name: 'South Campus Walkways', status: 'Available' },
                  { name: 'Stadium Drive', status: 'Available' },
                  { name: 'Kenan Woods Trail', status: 'Available' },
                ].map((space, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-center justify-between">
                    <span className="text-[#f0f6fc] font-medium">{space.name}</span>
                    <span className="px-2 py-1 bg-[#3fb950]/10 border border-[#3fb950] text-[#3fb950] rounded text-xs font-mono">
                      {space.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Register */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4">Register Your Organization</h3>
                <p className="text-[#8b949e] mb-4">
                  Adopt a space and commit to regular cleanup events. Earn service hours and leaderboard recognition!
                </p>
                <button
                  onClick={() => setShowAdoptModal(true)}
                  className="px-6 py-3 bg-[#238636] text-white rounded font-medium hover:bg-[#2ea043] transition-colors"
                >
                  Adopt a Space
                </button>
              </div>
            </div>
          )}

          {/* Composting Tab */}
          {activeTab === 'composting' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4">Composting Expansion</h2>
              <PolicyProgress policy={getPolicy('composting-expansion')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#3fb950] text-lg mb-3">About the Initiative</h3>
                <p className="text-[#8b949e] mb-4">
                  We're expanding composting infrastructure across campus, particularly in dining halls. In collaboration
                  with Carolina Dining and Facilities, we're installing more compost bins and plate-clearing systems with
                  educational signage and student ambassadors to help reduce waste sent to landfills.
                </p>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Stations</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#58a6ff]">0 lbs</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Waste Diverted</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Ambassadors</p>
                </div>
              </div>

              {/* What Can Be Composted */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">What Can Be Composted</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6">
                  <h4 className="font-semibold text-[#3fb950] mb-4">Yes - Compost These</h4>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">✓</span> Food scraps & leftovers</li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">✓</span> Coffee grounds & filters</li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">✓</span> Paper napkins & towels</li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">✓</span> Cardboard (uncoated)</li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">✓</span> Fruit & vegetable peels</li>
                  </ul>
                </div>

                <div className="bg-[#161b22] border border-[#f85149]/30 rounded-lg p-6">
                  <h4 className="font-semibold text-[#f85149] mb-4">No - Don't Compost These</h4>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li className="flex items-center gap-2"><span className="text-[#f85149]">✗</span> Plastic containers or utensils</li>
                    <li className="flex items-center gap-2"><span className="text-[#f85149]">✗</span> Styrofoam</li>
                    <li className="flex items-center gap-2"><span className="text-[#f85149]">✗</span> Metal or glass</li>
                    <li className="flex items-center gap-2"><span className="text-[#f85149]">✗</span> Coated paper products</li>
                    <li className="flex items-center gap-2"><span className="text-[#f85149]">✗</span> Meat bones (large)</li>
                  </ul>
                </div>
              </div>

              {/* Become an Ambassador */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4">Become a Composting Ambassador</h3>
                <p className="text-[#8b949e] mb-4">
                  Help educate fellow students about proper composting. Ambassadors staff stations during peak hours
                  and earn service hours.
                </p>
                <button className="px-6 py-3 bg-[#238636] text-white rounded font-medium hover:bg-[#2ea043] transition-colors">
                  Sign Up
                </button>
              </div>
            </div>
          )}

          {/* Move-Out Shop Tab */}
          {activeTab === 'moveout-shop' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4">Move-Out Donation Shop</h2>
              <PolicyProgress policy={getPolicy('moveout-shop')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#3fb950]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#3fb950] text-lg mb-3">About the Shop</h3>
                <p className="text-[#8b949e] mb-4">
                  The Move-Out Donation Shop is a Carolina Thrift-style initiative operated semiannually to collect,
                  sort, and resell or donate discarded items. We reduce landfill waste, promote reuse, and support
                  affordability for students needing inexpensive supplies at the start of each semester.
                </p>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Items Collected</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#58a6ff]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Items Sold</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Items Donated</p>
                </div>
              </div>

              {/* Accepted Items */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">What We Accept</h3>
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                {[
                  { name: 'Furniture', icon: '🪑', examples: 'Chairs, desks, lamps, shelves' },
                  { name: 'Electronics', icon: '💻', examples: 'Chargers, cables, small appliances' },
                  { name: 'School Supplies', icon: '📚', examples: 'Notebooks, binders, organizers' },
                  { name: 'Dorm Items', icon: '🛏️', examples: 'Bedding, storage, decor' },
                ].map((cat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                    <span className="text-3xl">{cat.icon}</span>
                    <p className="text-[#f0f6fc] font-medium mt-2">{cat.name}</p>
                    <p className="text-xs text-[#6e7681] mt-1">{cat.examples}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4">Donate Items</h3>
                  <p className="text-[#8b949e] mb-4">
                    Moving out? Schedule a pickup or drop off items at designated locations during finals week.
                  </p>
                  <button
                    onClick={() => setShowDonateModal(true)}
                    className="px-6 py-3 bg-[#238636] text-white rounded font-medium hover:bg-[#2ea043] transition-colors"
                  >
                    Schedule Donation
                  </button>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4">Shop the Store</h3>
                  <p className="text-[#8b949e] mb-4">
                    Find affordable supplies at the start of each semester. All proceeds support sustainability programs.
                  </p>
                  <button className="px-6 py-3 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded font-medium hover:bg-[#30363d] transition-colors">
                    View Schedule
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
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-6">Contact Us</h2>
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
                    <h3 className="font-semibold text-[#f0f6fc] mb-4">Send Feedback</h3>
                    {feedbackSubmitted ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-[#3fb950]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">✓</span>
                        </div>
                        <p className="text-[#3fb950] font-medium">Thanks for your feedback!</p>
                        <button onClick={() => setFeedbackSubmitted(false)} className="text-[#238636] text-sm mt-2 hover:underline">Send another</button>
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
                        <button type="submit" className="w-full bg-[#238636] text-white px-4 py-2.5 rounded font-semibold hover:bg-[#2ea043] transition-colors">
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
                <h3 className="text-lg font-bold text-[#f0f6fc] tracking-tight mb-4">Recent Updates</h3>
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
            <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5">Adopt a Campus Space</h3>
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
                <button type="submit" className="px-6 py-3 bg-[#238636] text-white rounded font-medium hover:bg-[#2ea043] transition-colors">
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdoptModal(false)}
                  className="px-6 py-3 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded font-medium hover:bg-[#30363d] transition-colors"
                >
                  Cancel
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
            <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5">Schedule a Donation</h3>
            <form onSubmit={handleDonateSubmit} className="space-y-5">
              <Input label="Your Name" name="name" value={donateForm.name} onChange={e => setDonateForm({...donateForm, name: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <Input label="Email" type="email" name="email" value={donateForm.email} onChange={e => setDonateForm({...donateForm, email: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <Textarea label="Items to Donate" name="items" value={donateForm.items} onChange={e => setDonateForm({...donateForm, items: e.target.value})} required rows={3} placeholder="List the items you'd like to donate..." className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <Input label="Preferred Pickup Date" type="date" name="pickupDate" value={donateForm.pickupDate} onChange={e => setDonateForm({...donateForm, pickupDate: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-3 bg-[#238636] text-white rounded font-medium hover:bg-[#2ea043] transition-colors">
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setShowDonateModal(false)}
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
