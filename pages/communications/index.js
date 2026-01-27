import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { getOverallProgress, getStatusCounts, departmentContacts, departmentFAQs, departmentAnnouncements } from '../../lib/data'
import { Editable, EditModeToggle } from '../../components/InlineEditor'

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitForm, setSubmitForm] = useState({ name: '', email: '', type: '', description: '' })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const { policies, budgetData } = useApp()

  const deptPolicies = policies.filter(p => p.department === 'communications')
  const overallProgress = getOverallProgress(policies)
  const statusCounts = getStatusCounts(policies)
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
  const [feedbackForm, setFeedbackForm] = useState({ topic: '', message: '', feedbackEmail: '' })
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleFeedbackSubmit = (e) => {
    e.preventDefault()
    setFeedbackSubmitted(true)
    setFeedbackForm({ topic: '', message: '', feedbackEmail: '' })
  }

  const handleSubmitForm = (e) => {
    e.preventDefault()
    setFormSubmitted(true)
    setShowSubmitModal(false)
    setSubmitForm({ name: '', email: '', type: '', description: '' })
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
            ? 'border-[#00d4ff] text-[#00d4ff] bg-[#00d4ff]/10'
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
            className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] rounded transition-all"
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
        <title>Communications | Project Bold</title>
      </Head>

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#0a0e14] via-[#0d1117] to-[#161b22] text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00d4ff]/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6">
          <p className="text-[#00d4ff] text-xs font-medium tracking-[0.2em] uppercase mb-4">
            Transparency & Outreach
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0f6fc] tracking-tight mb-4">
            Communications
          </h1>
          <p className="text-lg text-[#8b949e] max-w-2xl leading-relaxed">
            Storytelling, transparency, and amplifying the student voice through innovative outreach campaigns.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-[#0d1117] border-b border-[#30363d] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-xs font-medium tracking-[0.15em] uppercase whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'text-[#00d4ff] border-[#00d4ff]'
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
        <div className="max-w-6xl mx-auto px-6 py-12">
          {formSubmitted && (
            <div className="mb-8 bg-[#161b22] border border-[#238636] rounded-lg p-5">
              <p className="text-[#f0f6fc] font-medium">Your submission has been received! We'll be in touch soon.</p>
              <button onClick={() => setFormSubmitted(false)} className="text-[#00d4ff] text-sm mt-2 hover:underline">Dismiss</button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">Communications Overview</h2>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#00d4ff]">{deptPolicies.length}</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Initiatives</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">
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
                  <p className="text-4xl font-semibold font-mono text-[#d29922]">{overallProgress}%</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Platform Progress</p>
                </div>
              </div>

              {/* Transparency Dashboard */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-sm font-medium text-[#f0f6fc] uppercase tracking-wider mb-5">Budget Transparency</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#f0f6fc]">${budgetData.total.toLocaleString()}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Total Budget</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#00d4ff]/50 rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#00d4ff]">${budgetData.allocated.toLocaleString()}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Allocated</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#238636] rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#3fb950]">${budgetData.spent.toLocaleString()}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Spent</p>
                  </div>
                </div>
              </div>

              {/* All Initiatives */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">All Initiatives</h3>
              <div className="space-y-4">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#00d4ff]/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#f0f6fc]">{policy.title}</h4>
                        <p className="text-sm text-[#8b949e] mt-1">{policy.description}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-xs font-medium border ml-4 ${
                        policy.status === 'in_progress'
                          ? 'border-[#00d4ff] text-[#00d4ff] bg-[#00d4ff]/10'
                          : 'border-[#30363d] text-[#6e7681] bg-[#21262d]'
                      }`}>
                        {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] rounded-full transition-all"
                          style={{ width: `${policy.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono text-[#00d4ff]">{policy.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Announcements */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mt-10 mb-5 uppercase tracking-wide">Recent Updates</h3>
              <div className="space-y-3">
                {announcements.map(ann => (
                  <div key={ann.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-start gap-4">
                    <div className={`px-2 py-1 rounded text-xs font-mono ${
                      ann.type === 'event' ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]' :
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

          {/* Who is Carolina Tab */}
          {activeTab === 'who-is-carolina' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4">"Who is Carolina" Campaign</h2>
              <PolicyProgress policy={getPolicy('who-is-carolina')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#00d4ff] text-lg mb-3">About the Campaign</h3>
                <p className="text-[#8b949e] mb-4">
                  "Who is Carolina" highlights the diverse experiences and identities of the Tar Heel community through
                  short-form, interview-style videos. Students filmed in everyday environments share their stories,
                  humanizing the Carolina experience and building community connection.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-center">
                    <p className="text-2xl font-semibold font-mono text-[#00d4ff]">0</p>
                    <p className="text-sm text-[#6e7681]">Stories Shared</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-center">
                    <p className="text-2xl font-semibold font-mono text-[#3fb950]">0</p>
                    <p className="text-sm text-[#6e7681]">Video Views</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-center">
                    <p className="text-2xl font-semibold font-mono text-[#a371f7]">0</p>
                    <p className="text-sm text-[#6e7681]">Nominations</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#00d4ff]/20 border border-[#00d4ff]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-2">Share Your Story</h3>
                  <p className="text-sm text-[#8b949e] mb-4">Be featured in our campaign! Share what makes your Carolina experience unique.</p>
                  <button
                    onClick={() => { setSubmitForm({...submitForm, type: 'story'}); setShowSubmitModal(true) }}
                    className="px-5 py-2.5 bg-[#00d4ff] text-[#0a0e14] rounded text-sm font-bold hover:bg-[#00a8cc] transition-colors"
                  >
                    Submit Your Story
                  </button>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#a371f7]/20 border border-[#a371f7]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-2">Nominate Someone</h3>
                  <p className="text-sm text-[#8b949e] mb-4">Know someone with an inspiring story? Nominate them to be featured!</p>
                  <button
                    onClick={() => { setSubmitForm({...submitForm, type: 'nomination'}); setShowSubmitModal(true) }}
                    className="px-5 py-2.5 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded text-sm font-medium hover:bg-[#30363d] transition-colors"
                  >
                    Nominate a Student
                  </button>
                </div>
              </div>

              {/* What We're Looking For */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">What We're Looking For</h3>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-[#f0f6fc] mb-3">Diverse Voices</h4>
                    <ul className="space-y-2 text-sm text-[#8b949e]">
                      <li>• First-generation students</li>
                      <li>• Transfer students</li>
                      <li>• International students</li>
                      <li>• Student athletes</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#f0f6fc] mb-3">Unique Journeys</h4>
                    <ul className="space-y-2 text-sm text-[#8b949e]">
                      <li>• Overcoming challenges</li>
                      <li>• Finding community</li>
                      <li>• Discovering passions</li>
                      <li>• Making an impact</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#f0f6fc] mb-3">Carolina Pride</h4>
                    <ul className="space-y-2 text-sm text-[#8b949e]">
                      <li>• What Carolina means to you</li>
                      <li>• Favorite traditions</li>
                      <li>• Defining moments</li>
                      <li>• Future aspirations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VC Advisory Tab */}
          {activeTab === 'vc-advisory' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4">VC Communications Advisory Committee</h2>
              <PolicyProgress policy={getPolicy('vc-advisory')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#00d4ff] text-lg mb-3">About the Committee</h3>
                <p className="text-[#8b949e] mb-4">
                  The Student Advisory Committee to the Vice Chancellor for Communications creates a formal channel
                  for student input on UNC's messaging and branding. This ensures institutional messaging reflects
                  student experiences, priorities, and the authentic Carolina spirit.
                </p>
              </div>

              {/* Committee Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4">Committee Responsibilities</h3>
                  <ul className="space-y-3 text-sm text-[#8b949e]">
                    <li className="flex items-start gap-3">
                      <span className="text-[#00d4ff]">→</span>
                      <span>Review and provide feedback on university communications</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#00d4ff]">→</span>
                      <span>Advise on student-facing messaging and branding</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#00d4ff]">→</span>
                      <span>Represent diverse student perspectives</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#00d4ff]">→</span>
                      <span>Meet monthly with VC Communications office</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4">Member Requirements</h3>
                  <ul className="space-y-3 text-sm text-[#8b949e]">
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">✓</span>
                      <span>Current undergraduate or graduate student</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">✓</span>
                      <span>Interest in communications, marketing, or media</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">✓</span>
                      <span>Commitment to monthly meetings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">✓</span>
                      <span>Passion for student advocacy</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Application */}
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4">Apply for the Committee</h3>
                <p className="text-[#8b949e] mb-4">
                  Applications for the Spring 2026 cohort are now open. Join us in shaping how Carolina communicates!
                </p>
                <div className="flex items-center gap-4">
                  <button className="px-6 py-3 bg-[#00d4ff] text-[#0a0e14] rounded font-bold hover:bg-[#00a8cc] transition-colors">
                    Apply Now
                  </button>
                  <span className="text-sm text-[#6e7681]">Deadline: Feb 15, 2026</span>
                </div>
              </div>
            </div>
          )}

          {/* Podcast Tab */}
          {activeTab === 'podcast' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4">SG Podcast</h2>
              <PolicyProgress policy={getPolicy('sg-podcast')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#00d4ff] text-lg mb-3">About the Podcast</h3>
                <p className="text-[#8b949e] mb-4">
                  The Student Government Podcast spotlights student leaders, athletes, administrators, and campus
                  organizations by sharing their personal trajectories at UNC. We demystify how students can get
                  involved and highlight opportunities students may not know exist.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Spotify', 'Apple Podcasts', 'YouTube', 'Website'].map((platform, i) => (
                    <span key={i} className="px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#8b949e]">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#00d4ff]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Episodes</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Listeners</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide">Guests</p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#00d4ff]/20 border border-[#00d4ff]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎙️</span>
                  </div>
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-2">Be a Guest</h3>
                  <p className="text-sm text-[#8b949e] mb-4">Share your Carolina story and inspire other students. We're always looking for interesting guests!</p>
                  <button
                    onClick={() => { setSubmitForm({...submitForm, type: 'podcast-guest'}); setShowSubmitModal(true) }}
                    className="px-5 py-2.5 bg-[#00d4ff] text-[#0a0e14] rounded text-sm font-bold hover:bg-[#00a8cc] transition-colors"
                  >
                    Apply to Be a Guest
                  </button>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#a371f7]/20 border border-[#a371f7]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-2">Nominate a Guest</h3>
                  <p className="text-sm text-[#8b949e] mb-4">Know someone with an amazing story? Let us know who you'd like to hear from!</p>
                  <button
                    onClick={() => { setSubmitForm({...submitForm, type: 'podcast-nomination'}); setShowSubmitModal(true) }}
                    className="px-5 py-2.5 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded text-sm font-medium hover:bg-[#30363d] transition-colors"
                  >
                    Nominate Someone
                  </button>
                </div>
              </div>

              {/* Subscribe */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4">Subscribe to the Podcast</h3>
                <p className="text-[#8b949e] mb-4">Get notified when new episodes drop. Available on all major platforms.</p>
                {!subscribed ? (
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="your.email@unc.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                    />
                    <button
                      onClick={() => setSubscribed(true)}
                      className="px-6 py-3 bg-[#00d4ff] text-[#0a0e14] font-bold rounded hover:bg-[#00a8cc] transition-colors"
                    >
                      Subscribe
                    </button>
                  </div>
                ) : (
                  <p className="text-[#3fb950] font-medium">You're subscribed! We'll notify you of new episodes.</p>
                )}
              </div>
            </div>
          )}

          {/* Talent Spotlight Tab */}
          {activeTab === 'talent' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4">Student Talent Spotlight</h2>
              <PolicyProgress policy={getPolicy('talent-spotlight')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#00d4ff] text-lg mb-3">About the Spotlight</h3>
                <p className="text-[#8b949e] mb-4">
                  We celebrate student creativity in Arts, Dance, Theater, and Comedy through social media reels
                  featuring event previews, behind-the-scenes moments, and post-event highlights. Help student
                  artists reach broader audiences!
                </p>
              </div>

              {/* Categories */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Featured Categories</h3>
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                {[
                  { name: 'Visual Arts', icon: '🎨', count: 0 },
                  { name: 'Dance', icon: '💃', count: 0 },
                  { name: 'Theater', icon: '🎭', count: 0 },
                  { name: 'Comedy', icon: '😄', count: 0 },
                  { name: 'Music', icon: '🎵', count: 0 },
                  { name: 'Film', icon: '🎬', count: 0 },
                  { name: 'Writing', icon: '✍️', count: 0 },
                  { name: 'Other', icon: '✨', count: 0 },
                ].map((cat, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center hover:border-[#00d4ff] transition-colors cursor-pointer">
                    <span className="text-3xl">{cat.icon}</span>
                    <p className="text-[#f0f6fc] font-medium mt-2">{cat.name}</p>
                    <p className="text-xs text-[#6e7681]">{cat.count} spotlights</p>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4">Submit Your Work</h3>
                <p className="text-[#8b949e] mb-4">
                  Have an upcoming performance, exhibition, or creative project? Let us help promote it!
                </p>
                <button
                  onClick={() => { setSubmitForm({...submitForm, type: 'talent'}); setShowSubmitModal(true) }}
                  className="px-6 py-3 bg-[#00d4ff] text-[#0a0e14] font-bold rounded hover:bg-[#00a8cc] transition-colors"
                >
                  Submit for Spotlight
                </button>
              </div>
            </div>
          )}

          {/* Accountability Tab */}
          {activeTab === 'accountability' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4">Assessment & Accountability</h2>
              <PolicyProgress policy={getPolicy('accountability-campaign')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#00d4ff] text-lg mb-3">Our Commitment</h3>
                <p className="text-[#8b949e] mb-4">
                  We establish measurable outcomes for every project with clear benchmarks, timelines, and success
                  indicators students can track. We publish regular progress updates and adjust when results fall
                  short. Accountability is not optional.
                </p>
              </div>

              {/* Overall Progress */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-10">
                <h3 className="text-sm font-medium text-[#f0f6fc] uppercase tracking-wider mb-5">Platform-Wide Progress</h3>
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-5xl font-bold font-mono text-[#00d4ff]">{overallProgress}%</div>
                  <div className="flex-1">
                    <div className="h-3 bg-[#21262d] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] rounded-full transition-all"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0d1117] border border-[#238636] rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold font-mono text-[#3fb950]">{statusCounts.completed}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase">Completed</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#00d4ff]/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold font-mono text-[#00d4ff]">{statusCounts.in_progress}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase">In Progress</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#6e7681] rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold font-mono text-[#8b949e]">{statusCounts.planned}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase">Planned</p>
                  </div>
                </div>
              </div>

              {/* Transparency Features */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide">Transparency Features</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h4 className="font-semibold text-[#f0f6fc] mb-3">Public Dashboard</h4>
                  <p className="text-sm text-[#8b949e] mb-4">Track real-time progress on all initiatives with clear metrics and timelines.</p>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li className="flex items-center gap-2"><span className="text-[#00d4ff]">→</span> Progress percentages</li>
                    <li className="flex items-center gap-2"><span className="text-[#00d4ff]">→</span> Status updates</li>
                    <li className="flex items-center gap-2"><span className="text-[#00d4ff]">→</span> Milestone tracking</li>
                  </ul>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h4 className="font-semibold text-[#f0f6fc] mb-3">Regular Reports</h4>
                  <p className="text-sm text-[#8b949e] mb-4">Published updates ensure students stay informed on what we're accomplishing.</p>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">→</span> Monthly newsletters</li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">→</span> Semester reviews</li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">→</span> Annual reports</li>
                  </ul>
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
                      <div className="w-12 h-12 bg-[#00d4ff]/20 border border-[#00d4ff]/40 rounded-full flex items-center justify-center">
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
                        <a href={`mailto:${contact.lead.email}`} className="text-[#00d4ff] hover:underline">{contact.lead.email}</a>
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
                        <div className="w-12 h-12 bg-[#00d4ff]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">✓</span>
                        </div>
                        <p className="text-[#00d4ff] font-medium">Thanks for your feedback!</p>
                        <button onClick={() => setFeedbackSubmitted(false)} className="text-[#00a8cc] text-sm mt-2 hover:underline">Send another</button>
                      </div>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                        <Select label="Topic" name="topic" value={feedbackForm.topic} onChange={e => setFeedbackForm({...feedbackForm, topic: e.target.value})} required
                          options={[
                            { value: 'who-is-carolina', label: 'Who is Carolina' },
                            { value: 'podcast', label: 'SG Podcast' },
                            { value: 'talent', label: 'Talent Spotlight' },
                            { value: 'transparency', label: 'Transparency' },
                            { value: 'other', label: 'Other' },
                          ]}
                        />
                        <Textarea label="Message" name="message" value={feedbackForm.message} onChange={e => setFeedbackForm({...feedbackForm, message: e.target.value})} required rows={3} />
                        <Input label="Email (optional)" type="email" name="feedbackEmail" value={feedbackForm.feedbackEmail} onChange={e => setFeedbackForm({...feedbackForm, feedbackEmail: e.target.value})} />
                        <button type="submit" className="w-full bg-[#00d4ff] text-[#0a0e14] px-4 py-2.5 rounded font-bold hover:bg-[#00a8cc] transition-colors">
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
                        ann.type === 'event' ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]' :
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

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5">
              {submitForm.type === 'story' && 'Share Your Story'}
              {submitForm.type === 'nomination' && 'Nominate a Student'}
              {submitForm.type === 'podcast-guest' && 'Apply to Be a Guest'}
              {submitForm.type === 'podcast-nomination' && 'Nominate a Guest'}
              {submitForm.type === 'talent' && 'Submit for Spotlight'}
            </h3>
            <form onSubmit={handleSubmitForm} className="space-y-5">
              <Input label="Your Name" name="name" value={submitForm.name} onChange={e => setSubmitForm({...submitForm, name: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <Input label="Email" type="email" name="email" value={submitForm.email} onChange={e => setSubmitForm({...submitForm, email: e.target.value})} required className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]" />
              <Textarea
                label={submitForm.type.includes('nomination') ? 'Tell us about who you\'re nominating' : 'Tell us about yourself/your work'}
                name="description"
                value={submitForm.description}
                onChange={e => setSubmitForm({...submitForm, description: e.target.value})}
                required
                rows={4}
                className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
              />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-3 bg-[#00d4ff] text-[#0a0e14] rounded font-bold hover:bg-[#00a8cc] transition-colors">
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
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
