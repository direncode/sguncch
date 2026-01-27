import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { getOverallProgress, getStatusCounts, departmentContacts, departmentFAQs, departmentAnnouncements } from '../../lib/data'
import { Editable, EditModeToggle } from '../../components/InlineEditor'
import {
  submitForm,
  createShareLinks,
  externalLinks,
} from '../../lib/integrations'

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [modalFormData, setModalFormData] = useState({ name: '', email: '', type: '', description: '' })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalSubmitting, setIsModalSubmitting] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
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

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await submitForm('communications-feedback', {
        ...feedbackForm,
        department: 'communications',
        timestamp: new Date().toISOString(),
      })
      setFeedbackSubmitted(true)
      setFeedbackForm({ topic: '', message: '', feedbackEmail: '' })
    } catch (error) {
      console.error('Feedback submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModalSubmit = async (e) => {
    e.preventDefault()
    setIsModalSubmitting(true)
    try {
      await submitForm(`communications-${modalFormData.type}`, {
        ...modalFormData,
        department: 'communications',
        timestamp: new Date().toISOString(),
      })
      setFormSubmitted(true)
      setShowSubmitModal(false)
      setModalFormData({ name: '', email: '', type: '', description: '' })
    } catch (error) {
      console.error('Modal form submission error:', error)
    } finally {
      setIsModalSubmitting(false)
    }
  }

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
            <Editable k="communications.hero.label">Transparency & Outreach</Editable>
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0f6fc] tracking-tight mb-4">
            <Editable k="communications.hero.title">Communications</Editable>
          </h1>
          <p className="text-lg text-[#8b949e] max-w-2xl leading-relaxed">
            <Editable k="communications.hero.description" multiline>Storytelling, transparency, and amplifying the student voice through innovative outreach campaigns.</Editable>
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
              <p className="text-[#f0f6fc] font-medium"><Editable k="communications.formSuccess.message">Your submission has been received! We'll be in touch soon.</Editable></p>
              <button onClick={() => setFormSubmitted(false)} className="text-[#00d4ff] text-sm mt-2 hover:underline"><Editable k="communications.formSuccess.dismiss">Dismiss</Editable></button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2"><Editable k="communications.overview.title">Communications Overview</Editable></h2>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#00d4ff]">{deptPolicies.length}</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="communications.overview.stats.initiatives">Initiatives</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">
                    {deptPolicies.filter(p => p.status === 'in_progress').length}
                  </p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="communications.overview.stats.inProgress">In Progress</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">
                    {Math.round(deptPolicies.reduce((sum, p) => sum + (p.progress || 0), 0) / deptPolicies.length) || 0}%
                  </p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="communications.overview.stats.avgProgress">Avg Progress</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#d29922]">{overallProgress}%</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="communications.overview.stats.platformProgress">Platform Progress</Editable></p>
                </div>
              </div>

              {/* Transparency Dashboard */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-sm font-medium text-[#f0f6fc] uppercase tracking-wider mb-5"><Editable k="communications.overview.budget.title">Budget Transparency</Editable></h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#f0f6fc]">${budgetData.total.toLocaleString()}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider"><Editable k="communications.overview.budget.total">Total Budget</Editable></p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#00d4ff]/50 rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#00d4ff]">${budgetData.allocated.toLocaleString()}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider"><Editable k="communications.overview.budget.allocated">Allocated</Editable></p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#238636] rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#3fb950]">${budgetData.spent.toLocaleString()}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider"><Editable k="communications.overview.budget.spent">Spent</Editable></p>
                  </div>
                </div>
              </div>

              {/* All Initiatives */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="communications.overview.initiatives.title">All Initiatives</Editable></h3>
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
              <h3 className="text-xl font-semibold text-[#f0f6fc] mt-10 mb-5 uppercase tracking-wide"><Editable k="communications.overview.updates.title">Recent Updates</Editable></h3>
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
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4"><Editable k="communications.whoIsCarolina.title">"Who is Carolina" Campaign</Editable></h2>
              <PolicyProgress policy={getPolicy('who-is-carolina')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#00d4ff] text-lg mb-3"><Editable k="communications.whoIsCarolina.about.title">About the Campaign</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="communications.whoIsCarolina.about.description" multiline>"Who is Carolina" highlights the diverse experiences and identities of the Tar Heel community through
                  short-form, interview-style videos. Students filmed in everyday environments share their stories,
                  humanizing the Carolina experience and building community connection.</Editable>
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-center">
                    <p className="text-2xl font-semibold font-mono text-[#00d4ff]">0</p>
                    <p className="text-sm text-[#6e7681]"><Editable k="communications.whoIsCarolina.stats.stories">Stories Shared</Editable></p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-center">
                    <p className="text-2xl font-semibold font-mono text-[#3fb950]">0</p>
                    <p className="text-sm text-[#6e7681]"><Editable k="communications.whoIsCarolina.stats.views">Video Views</Editable></p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-center">
                    <p className="text-2xl font-semibold font-mono text-[#a371f7]">0</p>
                    <p className="text-sm text-[#6e7681]"><Editable k="communications.whoIsCarolina.stats.nominations">Nominations</Editable></p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#00d4ff]/20 border border-[#00d4ff]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl"></span>
                  </div>
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-2"><Editable k="communications.whoIsCarolina.shareStory.title">Share Your Story</Editable></h3>
                  <p className="text-sm text-[#8b949e] mb-4"><Editable k="communications.whoIsCarolina.shareStory.description">Be featured in our campaign! Share what makes your Carolina experience unique.</Editable></p>
                  <button
                    onClick={() => { setModalFormData({...modalFormData, type: 'story'}); setShowSubmitModal(true) }}
                    className="px-5 py-2.5 bg-[#00d4ff] text-[#0a0e14] rounded text-sm font-bold hover:bg-[#00a8cc] transition-colors"
                  >
                    <Editable k="communications.whoIsCarolina.shareStory.button">Submit Your Story</Editable>
                  </button>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#a371f7]/20 border border-[#a371f7]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl"></span>
                  </div>
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-2"><Editable k="communications.whoIsCarolina.nominate.title">Nominate Someone</Editable></h3>
                  <p className="text-sm text-[#8b949e] mb-4"><Editable k="communications.whoIsCarolina.nominate.description">Know someone with an inspiring story? Nominate them to be featured!</Editable></p>
                  <button
                    onClick={() => { setModalFormData({...modalFormData, type: 'nomination'}); setShowSubmitModal(true) }}
                    className="px-5 py-2.5 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded text-sm font-medium hover:bg-[#30363d] transition-colors"
                  >
                    <Editable k="communications.whoIsCarolina.nominate.button">Nominate a Student</Editable>
                  </button>
                </div>
              </div>

              {/* What We're Looking For */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="communications.whoIsCarolina.lookingFor.title">What We're Looking For</Editable></h3>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-[#f0f6fc] mb-3"><Editable k="communications.whoIsCarolina.lookingFor.diverseVoices.title">Diverse Voices</Editable></h4>
                    <ul className="space-y-2 text-sm text-[#8b949e]">
                      <li><Editable k="communications.whoIsCarolina.lookingFor.diverseVoices.item1">- First-generation students</Editable></li>
                      <li><Editable k="communications.whoIsCarolina.lookingFor.diverseVoices.item2">- Transfer students</Editable></li>
                      <li><Editable k="communications.whoIsCarolina.lookingFor.diverseVoices.item3">- International students</Editable></li>
                      <li><Editable k="communications.whoIsCarolina.lookingFor.diverseVoices.item4">- Student athletes</Editable></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#f0f6fc] mb-3"><Editable k="communications.whoIsCarolina.lookingFor.uniqueJourneys.title">Unique Journeys</Editable></h4>
                    <ul className="space-y-2 text-sm text-[#8b949e]">
                      <li><Editable k="communications.whoIsCarolina.lookingFor.uniqueJourneys.item1">- Overcoming challenges</Editable></li>
                      <li><Editable k="communications.whoIsCarolina.lookingFor.uniqueJourneys.item2">- Finding community</Editable></li>
                      <li><Editable k="communications.whoIsCarolina.lookingFor.uniqueJourneys.item3">- Discovering passions</Editable></li>
                      <li><Editable k="communications.whoIsCarolina.lookingFor.uniqueJourneys.item4">- Making an impact</Editable></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#f0f6fc] mb-3"><Editable k="communications.whoIsCarolina.lookingFor.carolinaPride.title">Carolina Pride</Editable></h4>
                    <ul className="space-y-2 text-sm text-[#8b949e]">
                      <li><Editable k="communications.whoIsCarolina.lookingFor.carolinaPride.item1">- What Carolina means to you</Editable></li>
                      <li><Editable k="communications.whoIsCarolina.lookingFor.carolinaPride.item2">- Favorite traditions</Editable></li>
                      <li><Editable k="communications.whoIsCarolina.lookingFor.carolinaPride.item3">- Defining moments</Editable></li>
                      <li><Editable k="communications.whoIsCarolina.lookingFor.carolinaPride.item4">- Future aspirations</Editable></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VC Advisory Tab */}
          {activeTab === 'vc-advisory' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4"><Editable k="communications.vcAdvisory.title">VC Communications Advisory Committee</Editable></h2>
              <PolicyProgress policy={getPolicy('vc-advisory')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#00d4ff] text-lg mb-3"><Editable k="communications.vcAdvisory.about.title">About the Committee</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="communications.vcAdvisory.about.description" multiline>The Student Advisory Committee to the Vice Chancellor for Communications creates a formal channel
                  for student input on UNC's messaging and branding. This ensures institutional messaging reflects
                  student experiences, priorities, and the authentic Carolina spirit.</Editable>
                </p>
              </div>

              {/* Committee Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4"><Editable k="communications.vcAdvisory.responsibilities.title">Committee Responsibilities</Editable></h3>
                  <ul className="space-y-3 text-sm text-[#8b949e]">
                    <li className="flex items-start gap-3">
                      <span className="text-[#00d4ff]">&gt;</span>
                      <span><Editable k="communications.vcAdvisory.responsibilities.item1">Review and provide feedback on university communications</Editable></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#00d4ff]">&gt;</span>
                      <span><Editable k="communications.vcAdvisory.responsibilities.item2">Advise on student-facing messaging and branding</Editable></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#00d4ff]">&gt;</span>
                      <span><Editable k="communications.vcAdvisory.responsibilities.item3">Represent diverse student perspectives</Editable></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#00d4ff]">&gt;</span>
                      <span><Editable k="communications.vcAdvisory.responsibilities.item4">Meet monthly with VC Communications office</Editable></span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4"><Editable k="communications.vcAdvisory.requirements.title">Member Requirements</Editable></h3>
                  <ul className="space-y-3 text-sm text-[#8b949e]">
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">-</span>
                      <span><Editable k="communications.vcAdvisory.requirements.item1">Current undergraduate or graduate student</Editable></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">-</span>
                      <span><Editable k="communications.vcAdvisory.requirements.item2">Interest in communications, marketing, or media</Editable></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">-</span>
                      <span><Editable k="communications.vcAdvisory.requirements.item3">Commitment to monthly meetings</Editable></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#3fb950]">-</span>
                      <span><Editable k="communications.vcAdvisory.requirements.item4">Passion for student advocacy</Editable></span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Application */}
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4"><Editable k="communications.vcAdvisory.apply.title">Apply for the Committee</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="communications.vcAdvisory.apply.description">Applications for the Spring 2026 cohort are now open. Join us in shaping how Carolina communicates!</Editable>
                </p>
                <div className="flex items-center gap-4">
                  <button className="px-6 py-3 bg-[#00d4ff] text-[#0a0e14] rounded font-bold hover:bg-[#00a8cc] transition-colors">
                    <Editable k="communications.vcAdvisory.apply.button">Apply Now</Editable>
                  </button>
                  <span className="text-sm text-[#6e7681]"><Editable k="communications.vcAdvisory.apply.deadline">Deadline: Feb 15, 2026</Editable></span>
                </div>
              </div>
            </div>
          )}

          {/* Podcast Tab */}
          {activeTab === 'podcast' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4"><Editable k="communications.podcast.title">SG Podcast</Editable></h2>
              <PolicyProgress policy={getPolicy('sg-podcast')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#00d4ff] text-lg mb-3"><Editable k="communications.podcast.about.title">About the Podcast</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="communications.podcast.about.description" multiline>The Student Government Podcast spotlights student leaders, athletes, administrators, and campus
                  organizations by sharing their personal trajectories at UNC. We demystify how students can get
                  involved and highlight opportunities students may not know exist.</Editable>
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
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="communications.podcast.stats.episodes">Episodes</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#3fb950]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="communications.podcast.stats.listeners">Listeners</Editable></p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-semibold font-mono text-[#a371f7]">0</p>
                  <p className="text-sm text-[#6e7681] mt-1 uppercase tracking-wide"><Editable k="communications.podcast.stats.guests">Guests</Editable></p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#00d4ff]/20 border border-[#00d4ff]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl"></span>
                  </div>
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-2"><Editable k="communications.podcast.beGuest.title">Be a Guest</Editable></h3>
                  <p className="text-sm text-[#8b949e] mb-4"><Editable k="communications.podcast.beGuest.description">Share your Carolina story and inspire other students. We're always looking for interesting guests!</Editable></p>
                  <button
                    onClick={() => { setModalFormData({...modalFormData, type: 'podcast-guest'}); setShowSubmitModal(true) }}
                    className="px-5 py-2.5 bg-[#00d4ff] text-[#0a0e14] rounded text-sm font-bold hover:bg-[#00a8cc] transition-colors"
                  >
                    <Editable k="communications.podcast.beGuest.button">Apply to Be a Guest</Editable>
                  </button>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#a371f7]/20 border border-[#a371f7]/40 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl"></span>
                  </div>
                  <h3 className="font-semibold text-[#f0f6fc] text-lg mb-2"><Editable k="communications.podcast.nominateGuest.title">Nominate a Guest</Editable></h3>
                  <p className="text-sm text-[#8b949e] mb-4"><Editable k="communications.podcast.nominateGuest.description">Know someone with an amazing story? Let us know who you'd like to hear from!</Editable></p>
                  <button
                    onClick={() => { setModalFormData({...modalFormData, type: 'podcast-nomination'}); setShowSubmitModal(true) }}
                    className="px-5 py-2.5 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded text-sm font-medium hover:bg-[#30363d] transition-colors"
                  >
                    <Editable k="communications.podcast.nominateGuest.button">Nominate Someone</Editable>
                  </button>
                </div>
              </div>

              {/* Subscribe */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4"><Editable k="communications.podcast.subscribe.title">Subscribe to the Podcast</Editable></h3>
                <p className="text-[#8b949e] mb-4"><Editable k="communications.podcast.subscribe.description">Get notified when new episodes drop. Available on all major platforms.</Editable></p>
                {!subscribed ? (
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="your.email@unc.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubscribing}
                      className="flex-1 px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:ring-2 focus:ring-[#00d4ff] disabled:opacity-50"
                    />
                    <button
                      onClick={handleSubscribe}
                      disabled={isSubscribing || !email}
                      className="px-6 py-3 bg-[#00d4ff] text-[#0a0e14] font-bold rounded hover:bg-[#00a8cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubscribing ? 'Subscribing...' : <Editable k="communications.podcast.subscribe.button">Subscribe</Editable>}
                    </button>
                  </div>
                ) : (
                  <p className="text-[#3fb950] font-medium"><Editable k="communications.podcast.subscribe.success">You're subscribed! We'll notify you of new episodes.</Editable></p>
                )}
              </div>
            </div>
          )}

          {/* Talent Spotlight Tab */}
          {activeTab === 'talent' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4"><Editable k="communications.talent.title">Student Talent Spotlight</Editable></h2>
              <PolicyProgress policy={getPolicy('talent-spotlight')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#00d4ff] text-lg mb-3"><Editable k="communications.talent.about.title">About the Spotlight</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="communications.talent.about.description" multiline>We celebrate student creativity in Arts, Dance, Theater, and Comedy through social media reels
                  featuring event previews, behind-the-scenes moments, and post-event highlights. Help student
                  artists reach broader audiences!</Editable>
                </p>
              </div>

              {/* Categories */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="communications.talent.categories.title">Featured Categories</Editable></h3>
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                {[
                  { name: 'Visual Arts', icon: '', count: 0 },
                  { name: 'Dance', icon: '', count: 0 },
                  { name: 'Theater', icon: '', count: 0 },
                  { name: 'Comedy', icon: '', count: 0 },
                  { name: 'Music', icon: '', count: 0 },
                  { name: 'Film', icon: '', count: 0 },
                  { name: 'Writing', icon: '', count: 0 },
                  { name: 'Other', icon: '', count: 0 },
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
                <h3 className="font-semibold text-[#f0f6fc] text-lg mb-4"><Editable k="communications.talent.submit.title">Submit Your Work</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="communications.talent.submit.description">Have an upcoming performance, exhibition, or creative project? Let us help promote it!</Editable>
                </p>
                <button
                  onClick={() => { setModalFormData({...modalFormData, type: 'talent'}); setShowSubmitModal(true) }}
                  className="px-6 py-3 bg-[#00d4ff] text-[#0a0e14] font-bold rounded hover:bg-[#00a8cc] transition-colors"
                >
                  <Editable k="communications.talent.submit.button">Submit for Spotlight</Editable>
                </button>
              </div>
            </div>
          )}

          {/* Accountability Tab */}
          {activeTab === 'accountability' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-4"><Editable k="communications.accountability.title">Assessment & Accountability</Editable></h2>
              <PolicyProgress policy={getPolicy('accountability-campaign')} />

              {/* About */}
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#00d4ff] text-lg mb-3"><Editable k="communications.accountability.commitment.title">Our Commitment</Editable></h3>
                <p className="text-[#8b949e] mb-4">
                  <Editable k="communications.accountability.commitment.description" multiline>We establish measurable outcomes for every project with clear benchmarks, timelines, and success
                  indicators students can track. We publish regular progress updates and adjust when results fall
                  short. Accountability is not optional.</Editable>
                </p>
              </div>

              {/* Overall Progress */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-10">
                <h3 className="text-sm font-medium text-[#f0f6fc] uppercase tracking-wider mb-5"><Editable k="communications.accountability.progress.title">Platform-Wide Progress</Editable></h3>
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
                    <p className="text-xs text-[#6e7681] mt-1 uppercase"><Editable k="communications.accountability.progress.completed">Completed</Editable></p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#00d4ff]/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold font-mono text-[#00d4ff]">{statusCounts.in_progress}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase"><Editable k="communications.accountability.progress.inProgress">In Progress</Editable></p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#6e7681] rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold font-mono text-[#8b949e]">{statusCounts.planned}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase"><Editable k="communications.accountability.progress.planned">Planned</Editable></p>
                  </div>
                </div>
              </div>

              {/* Transparency Features */}
              <h3 className="text-xl font-semibold text-[#f0f6fc] mb-5 uppercase tracking-wide"><Editable k="communications.accountability.features.title">Transparency Features</Editable></h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h4 className="font-semibold text-[#f0f6fc] mb-3"><Editable k="communications.accountability.features.dashboard.title">Public Dashboard</Editable></h4>
                  <p className="text-sm text-[#8b949e] mb-4"><Editable k="communications.accountability.features.dashboard.description">Track real-time progress on all initiatives with clear metrics and timelines.</Editable></p>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li className="flex items-center gap-2"><span className="text-[#00d4ff]">&gt;</span> <Editable k="communications.accountability.features.dashboard.item1">Progress percentages</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#00d4ff]">&gt;</span> <Editable k="communications.accountability.features.dashboard.item2">Status updates</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#00d4ff]">&gt;</span> <Editable k="communications.accountability.features.dashboard.item3">Milestone tracking</Editable></li>
                  </ul>
                </div>

                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                  <h4 className="font-semibold text-[#f0f6fc] mb-3"><Editable k="communications.accountability.features.reports.title">Regular Reports</Editable></h4>
                  <p className="text-sm text-[#8b949e] mb-4"><Editable k="communications.accountability.features.reports.description">Published updates ensure students stay informed on what we're accomplishing.</Editable></p>
                  <ul className="space-y-2 text-sm text-[#8b949e]">
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">&gt;</span> <Editable k="communications.accountability.features.reports.item1">Monthly newsletters</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">&gt;</span> <Editable k="communications.accountability.features.reports.item2">Semester reviews</Editable></li>
                    <li className="flex items-center gap-2"><span className="text-[#3fb950]">&gt;</span> <Editable k="communications.accountability.features.reports.item3">Annual reports</Editable></li>
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
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-6"><Editable k="communications.faq.contact.title">Contact Us</Editable></h2>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#00d4ff]/20 border border-[#00d4ff]/40 rounded-full flex items-center justify-center">
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
                        <a href={`mailto:${contact.lead.email}`} className="text-[#00d4ff] hover:underline">{contact.lead.email}</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]"></span>
                        <span className="text-[#f0f6fc]">{contact.socialMedia}</span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Form */}
                  <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h3 className="font-semibold text-[#f0f6fc] mb-4"><Editable k="communications.faq.feedback.title">Send Feedback</Editable></h3>
                    {feedbackSubmitted ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-[#00d4ff]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl"></span>
                        </div>
                        <p className="text-[#00d4ff] font-medium"><Editable k="communications.faq.feedback.success">Thanks for your feedback!</Editable></p>
                        <button onClick={() => setFeedbackSubmitted(false)} className="text-[#00a8cc] text-sm mt-2 hover:underline"><Editable k="communications.faq.feedback.sendAnother">Send another</Editable></button>
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
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#00d4ff] text-[#0a0e14] px-4 py-2.5 rounded font-bold hover:bg-[#00a8cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Submitting...' : <Editable k="communications.faq.feedback.button">Submit Feedback</Editable>}
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-6"><Editable k="communications.faq.questions.title">Frequently Asked Questions</Editable></h2>
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
                <h3 className="text-lg font-bold text-[#f0f6fc] tracking-tight mb-4"><Editable k="communications.faq.updates.title">Recent Updates</Editable></h3>
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
              {modalFormData.type === 'story' && <Editable k="communications.modal.story.title">Share Your Story</Editable>}
              {modalFormData.type === 'nomination' && <Editable k="communications.modal.nomination.title">Nominate a Student</Editable>}
              {modalFormData.type === 'podcast-guest' && <Editable k="communications.modal.podcastGuest.title">Apply to Be a Guest</Editable>}
              {modalFormData.type === 'podcast-nomination' && <Editable k="communications.modal.podcastNomination.title">Nominate a Guest</Editable>}
              {modalFormData.type === 'talent' && <Editable k="communications.modal.talent.title">Submit for Spotlight</Editable>}
            </h3>
            <form onSubmit={handleModalSubmit} className="space-y-5">
              <Input
                label="Your Name"
                name="name"
                value={modalFormData.name}
                onChange={e => setModalFormData({...modalFormData, name: e.target.value})}
                required
                disabled={isModalSubmitting}
                className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={modalFormData.email}
                onChange={e => setModalFormData({...modalFormData, email: e.target.value})}
                required
                disabled={isModalSubmitting}
                className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
              />
              <Textarea
                label={modalFormData.type.includes('nomination') ? 'Tell us about who you\'re nominating' : 'Tell us about yourself/your work'}
                name="description"
                value={modalFormData.description}
                onChange={e => setModalFormData({...modalFormData, description: e.target.value})}
                required
                rows={4}
                disabled={isModalSubmitting}
                className="bg-[#0d1117] border-[#30363d] text-[#f0f6fc]"
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isModalSubmitting}
                  className="px-6 py-3 bg-[#00d4ff] text-[#0a0e14] rounded font-bold hover:bg-[#00a8cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isModalSubmitting ? 'Submitting...' : <Editable k="communications.modal.submit">Submit</Editable>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={isModalSubmitting}
                  className="px-6 py-3 bg-[#21262d] border border-[#30363d] text-[#f0f6fc] rounded font-medium hover:bg-[#30363d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Editable k="communications.modal.cancel">Cancel</Editable>
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
