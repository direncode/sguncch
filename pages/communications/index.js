import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { getOverallProgress, getStatusCounts, departmentContacts, departmentFAQs, departmentAnnouncements } from '../../lib/data'

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState('transparency')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const { policies, budgetData, operationalData } = useApp()

  const townHallEvents = operationalData?.events?.townHalls || []
  const deptPolicies = policies.filter(p => p.department === 'communications')
  const overallProgress = getOverallProgress(policies)
  const statusCounts = getStatusCounts(policies)

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

  return (
    <Layout>
      <Head>
        <title>Communications | Project Bold</title>
      </Head>

      {/* Hero - Dark gradient with grid background */}
      <section className="relative bg-gradient-to-b from-[#0a0e14] via-[#0d1117] to-[#161b22] text-white py-24 overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00d4ff]/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6">
          <p className="text-[#00d4ff] text-xs font-medium tracking-[0.2em] uppercase mb-4">
            Transparency & Outreach
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0f6fc] tracking-tight mb-4">
            Communications
          </h1>
          <p className="text-lg text-[#8b949e] max-w-2xl leading-relaxed">
            Stay informed about Student Government initiatives. Outreach, transparency,
            and amplifying the student voice.
          </p>
        </div>
      </section>

      {/* Tabs - Uppercase tracking-widest with border-bottom active state */}
      <div className="bg-[#0d1117] border-b border-[#30363d] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'transparency', label: 'Transparency Dashboard' },
              { id: 'newsletter', label: 'Newsletter' },
              { id: 'townhalls', label: 'Town Halls' },
              { id: 'surveys', label: 'Campus Pulse' },
              { id: 'faq', label: 'FAQ & Contact' },
              { id: 'policies', label: 'All Policies' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-xs font-medium tracking-[0.15em] uppercase whitespace-nowrap border-b-2 transition-all ${
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
          {/* Transparency Dashboard Tab */}
          {activeTab === 'transparency' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">
                  Transparency Dashboard
                </h2>
                <p className="text-[#8b949e]">
                  Real-time progress on all Student Government initiatives
                </p>
              </div>

              {/* Overall Progress */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-sm font-medium text-[#f0f6fc] uppercase tracking-wider mb-5">Overall Policy Progress</h3>
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-5xl font-bold font-mono text-[#00d4ff] tracking-tight">{overallProgress}%</div>
                  <div className="flex-1">
                    <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] rounded-full transition-all duration-500"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0d1117] border border-[#238636] rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#3fb950] tracking-tight">{statusCounts.completed}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Completed</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#00d4ff]/50 rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#00d4ff] tracking-tight">{statusCounts.in_progress}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">In Progress</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#6e7681] rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#8b949e] tracking-tight">{statusCounts.planned}</p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Planned</p>
                  </div>
                </div>
              </div>

              {/* Budget Transparency */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-sm font-medium text-[#f0f6fc] uppercase tracking-wider mb-5">Budget Transparency</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#f0f6fc] tracking-tight">
                      ${budgetData.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Total Budget</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#00d4ff]/50 rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#00d4ff] tracking-tight">
                      ${budgetData.allocated.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Allocated</p>
                  </div>
                  <div className="bg-[#0d1117] border border-[#238636] rounded-lg p-5 text-center">
                    <p className="text-3xl font-bold font-mono text-[#3fb950] tracking-tight">
                      ${budgetData.spent.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Spent</p>
                  </div>
                </div>

                {/* Budget Categories */}
                <h4 className="text-xs font-medium text-[#f0f6fc] uppercase tracking-wider mb-4">By Category</h4>
                <div className="space-y-5">
                  {budgetData.categories.map((cat, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[#f0f6fc] font-medium">{cat.name}</span>
                        <span className="text-[#6e7681] font-mono">
                          ${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()}
                          <span className="ml-2 text-[#00d4ff]">
                            ({Math.round((cat.spent / cat.allocated) * 100)}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] rounded-full transition-all duration-500"
                          style={{ width: `${(cat.spent / cat.allocated) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meeting Minutes */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-sm font-medium text-[#f0f6fc] uppercase tracking-wider mb-5">Recent Meeting Minutes</h3>
                <div className="space-y-3">
                  {[
                    { date: 'Jan 21, 2026', title: 'Senate Meeting #15', type: 'Senate' },
                    { date: 'Jan 14, 2026', title: 'Senate Meeting #14', type: 'Senate' },
                    { date: 'Jan 12, 2026', title: 'Executive Committee', type: 'Executive' },
                    { date: 'Jan 7, 2026', title: 'Finance Committee', type: 'Committee' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#0d1117] border border-[#30363d] rounded-lg hover:border-[#00d4ff]/50 transition-colors">
                      <div>
                        <p className="font-medium text-[#f0f6fc]">{item.title}</p>
                        <p className="text-sm text-[#6e7681] font-mono">{item.date}</p>
                      </div>
                      <button className="px-4 py-2 text-xs font-medium text-[#00d4ff] uppercase tracking-wider hover:bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded transition-colors">
                        View
                      </button>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-5 px-5 py-3 text-xs font-medium text-[#00d4ff] uppercase tracking-wider bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 border border-[#00d4ff]/30 rounded transition-colors">
                  View All Minutes
                </button>
              </div>

              {/* Voting Records */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="text-sm font-medium text-[#f0f6fc] uppercase tracking-wider mb-5">Recent Votes</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Resolution 2026-08: Mental Health Funding', result: 'Passed', votes: '42-3-1' },
                    { title: 'Resolution 2026-07: Textbook Affordability', result: 'Passed', votes: '44-1-1' },
                    { title: 'Bill 2026-04: Student Org Funding Increase', result: 'Passed', votes: '40-5-1' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#0d1117] border border-[#30363d] rounded-lg hover:border-[#00d4ff]/50 transition-colors">
                      <div>
                        <p className="font-medium text-[#f0f6fc]">{item.title}</p>
                        <p className="text-sm text-[#6e7681] font-mono">Vote: {item.votes}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-medium uppercase tracking-wider border ${
                        item.result === 'Passed'
                          ? 'bg-[#238636]/20 text-[#3fb950] border-[#238636]'
                          : 'bg-[#da3633]/20 text-[#f85149] border-[#da3633]'
                      }`}>
                        {item.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Newsletter Tab */}
          {activeTab === 'newsletter' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">
                  SG Weekly Newsletter
                </h2>
                <p className="text-[#8b949e]">
                  Your weekly digest of Student Government activities
                </p>
              </div>

              {/* Subscribe */}
              {!subscribed ? (
                <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-[#f0f6fc] mb-2">Subscribe to SG Weekly</h3>
                  <p className="text-[#8b949e] mb-5">
                    Get weekly updates on Student Government activities delivered to your inbox.
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="your.email@unc.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
                    />
                    <button
                      onClick={() => setSubscribed(true)}
                      className="px-6 py-3 bg-[#00d4ff] text-[#0a0e14] font-bold text-sm uppercase tracking-wider rounded hover:bg-[#00a8cc] transition-colors"
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#161b22] border border-[#238636] rounded-lg p-5">
                  <p className="text-[#3fb950] font-medium">
                    You're subscribed! Check your inbox for a confirmation email.
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-[#00d4ff]/50 rounded-lg p-5 text-center">
                  <p className="text-3xl font-bold font-mono text-[#00d4ff] tracking-tight">8,900</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Subscribers</p>
                </div>
                <div className="bg-[#161b22] border border-[#a371f7]/50 rounded-lg p-5 text-center">
                  <p className="text-3xl font-bold font-mono text-[#a371f7] tracking-tight">34%</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Open Rate</p>
                </div>
                <div className="bg-[#161b22] border border-[#238636] rounded-lg p-5 text-center">
                  <p className="text-3xl font-bold font-mono text-[#3fb950] tracking-tight">24</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Editions</p>
                </div>
              </div>

              {/* Archive */}
              <div>
                <h3 className="text-sm font-medium text-[#f0f6fc] uppercase tracking-wider mb-4">
                  Newsletter Archive
                </h3>
                <div className="space-y-3">
                  {[
                    { date: 'Jan 24, 2026', title: 'Spring Semester Kickoff', highlights: 'New initiatives, town hall schedule' },
                    { date: 'Jan 17, 2026', title: 'Welcome Back Issue', highlights: 'Budget update, registration reform progress' },
                    { date: 'Dec 13, 2025', title: 'Fall Semester Wrap-Up', highlights: 'Accomplishments, goals for spring' },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center justify-between hover:border-[#00d4ff]/50 transition-colors">
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">{item.title}</p>
                        <p className="text-sm text-[#6e7681] mt-1 font-mono">{item.date} | <span className="text-[#8b949e]">{item.highlights}</span></p>
                      </div>
                      <button className="px-4 py-2 text-xs font-medium text-[#00d4ff] uppercase tracking-wider hover:bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded transition-colors">
                        Read
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Town Halls Tab */}
          {activeTab === 'townhalls' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">
                  Town Hall Series
                </h2>
                <p className="text-[#8b949e]">
                  Direct conversations between students and leadership
                </p>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-[#00d4ff]/50 rounded-lg p-5 text-center">
                  <p className="text-3xl font-bold font-mono text-[#00d4ff] tracking-tight">8</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Town Halls Held</p>
                </div>
                <div className="bg-[#161b22] border border-[#d29922]/50 rounded-lg p-5 text-center">
                  <p className="text-3xl font-bold font-mono text-[#d29922] tracking-tight">456</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Total Attendance</p>
                </div>
                <div className="bg-[#161b22] border border-[#238636] rounded-lg p-5 text-center">
                  <p className="text-3xl font-bold font-mono text-[#3fb950] tracking-tight">234</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Questions Answered</p>
                </div>
              </div>

              {/* Upcoming */}
              <div>
                <h3 className="text-sm font-medium text-[#f0f6fc] uppercase tracking-wider mb-4">
                  Upcoming Town Halls
                </h3>
                <div className="space-y-4">
                  {townHallEvents.map(event => (
                    <div key={event.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#00d4ff]/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-[#f0f6fc]">{event.title}</h4>
                          <p className="text-sm text-[#6e7681] mt-1 font-mono">{event.date} at {event.time}</p>
                          <p className="text-sm text-[#8b949e]">{event.location}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {event.topics.map((topic, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 rounded text-xs font-medium"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button className="px-5 py-2.5 bg-[#00d4ff] text-[#0a0e14] text-xs font-bold uppercase tracking-wider rounded hover:bg-[#00a8cc] transition-colors">
                          RSVP
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Question */}
              <div className="bg-[#161b22] border border-[#00d4ff]/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-[#f0f6fc] mb-2">Submit a Question</h3>
                <p className="text-[#8b949e] mb-5">
                  Can't attend? Submit your question ahead of time and we'll address it.
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Your question..."
                    className="flex-1 px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
                  />
                  <button className="px-6 py-3 bg-[#00d4ff] text-[#0a0e14] font-bold text-sm uppercase tracking-wider rounded hover:bg-[#00a8cc] transition-colors">
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Campus Pulse Tab */}
          {activeTab === 'surveys' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">
                  Campus Pulse Surveys
                </h2>
                <p className="text-[#8b949e]">
                  Your voice shapes our priorities
                </p>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-[#00d4ff]/50 rounded-lg p-5 text-center">
                  <p className="text-3xl font-bold font-mono text-[#00d4ff] tracking-tight">12</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Surveys Conducted</p>
                </div>
                <div className="bg-[#161b22] border border-[#a371f7]/50 rounded-lg p-5 text-center">
                  <p className="text-3xl font-bold font-mono text-[#a371f7] tracking-tight">3,400</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Total Responses</p>
                </div>
                <div className="bg-[#161b22] border border-[#238636] rounded-lg p-5 text-center">
                  <p className="text-3xl font-bold font-mono text-[#3fb950] tracking-tight">45</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-wider">Insights Generated</p>
                </div>
              </div>

              {/* Active Survey */}
              <div className="relative bg-gradient-to-r from-[#0d1117] to-[#161b22] border border-[#00d4ff]/50 rounded-lg p-8 overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d4ff]/10 rounded-full blur-3xl" />
                <div className="relative">
                  <h3 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">
                    Current Survey: Spring Priorities
                  </h3>
                  <p className="text-[#8b949e] mb-6">
                    Help us understand what matters most to you this semester.
                  </p>
                  <button className="px-6 py-3 bg-[#00d4ff] text-[#0a0e14] font-bold text-sm uppercase tracking-wider rounded hover:bg-[#00a8cc] transition-colors">
                    Take Survey (5 min)
                  </button>
                </div>
              </div>

              {/* Past Results */}
              <div>
                <h3 className="text-sm font-medium text-[#f0f6fc] uppercase tracking-wider mb-4">
                  Recent Survey Results
                </h3>
                <div className="space-y-4">
                  {[
                    { title: 'Mental Health Services', date: 'Dec 2025', responses: 890, topFinding: '67% want extended CAPS hours' },
                    { title: 'Dining Hall Satisfaction', date: 'Nov 2025', responses: 1200, topFinding: '54% want more vegetarian options' },
                    { title: 'Campus Safety', date: 'Oct 2025', responses: 750, topFinding: '72% feel safe on campus at night' },
                  ].map((survey, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#00d4ff]/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-[#f0f6fc]">{survey.title}</h4>
                          <p className="text-sm text-[#6e7681] mt-1 font-mono">
                            {survey.date} | {survey.responses} responses
                          </p>
                          <p className="text-sm text-[#00d4ff] font-medium mt-2">
                            Key Finding: {survey.topFinding}
                          </p>
                        </div>
                        <button className="px-4 py-2 text-xs font-medium text-[#00d4ff] uppercase tracking-wider hover:bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded transition-colors">
                          View Results
                        </button>
                      </div>
                    </div>
                  ))}
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
                            { value: 'newsletter', label: 'Newsletter' },
                            { value: 'townhall', label: 'Town Halls' },
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
                        ann.type === 'survey' ? 'bg-[#a371f7]/10 text-[#a371f7] border border-[#a371f7]' :
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

          {/* All Policies Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">
                  Communications Policies
                </h2>
                <p className="text-[#8b949e]">
                  Track our department-specific initiatives and progress
                </p>
              </div>

              <div className="space-y-4">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#00d4ff]/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-[#f0f6fc]">{policy.title}</h3>
                      <span className={`px-3 py-1 rounded text-xs font-medium uppercase tracking-wider border ${
                        policy.status === 'completed'
                          ? 'bg-[#238636]/20 text-[#3fb950] border-[#238636]'
                          : policy.status === 'in_progress'
                            ? 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/50'
                            : 'bg-[#6e7681]/20 text-[#8b949e] border-[#6e7681]'
                      }`}>
                        {policy.status === 'completed'
                          ? 'Completed'
                          : policy.status === 'in_progress'
                            ? 'In Progress'
                            : 'Planned'}
                      </span>
                    </div>
                    <p className="text-sm text-[#8b949e] mb-4">{policy.description}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] rounded-full transition-all duration-500"
                          style={{ width: `${policy.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold font-mono text-[#00d4ff]">{policy.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  )
}
