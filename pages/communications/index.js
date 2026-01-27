import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Button } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { getOverallProgress, getStatusCounts } from '../../lib/data'

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState('transparency')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const { policies, budgetData, operationalData } = useApp()

  const townHallEvents = operationalData?.events?.townHalls || []
  const deptPolicies = policies.filter(p => p.department === 'communications')
  const overallProgress = getOverallProgress(policies)
  const statusCounts = getStatusCounts(policies)

  return (
    <Layout>
      <Head>
        <title>Communications | Project Bold</title>
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0071e3] to-[#0077ed] text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-blue-100 text-sm font-medium tracking-wide uppercase mb-3">
            Transparency & Outreach
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Communications
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl leading-relaxed">
            Stay informed about Student Government initiatives. Outreach, transparency,
            and amplifying the student voice.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-[#f5f5f7] border-b border-[#d2d2d7] sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'transparency', label: 'Transparency Dashboard' },
              { id: 'newsletter', label: 'Newsletter' },
              { id: 'townhalls', label: 'Town Halls' },
              { id: 'surveys', label: 'Campus Pulse' },
              { id: 'policies', label: 'All Policies' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 text-sm font-medium whitespace-nowrap rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0071e3] text-white'
                    : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Transparency Dashboard Tab */}
        {activeTab === 'transparency' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
                Transparency Dashboard
              </h2>
              <p className="text-[#6e6e73]">
                Real-time progress on all Student Government initiatives
              </p>
            </div>

            {/* Overall Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-5">Overall Policy Progress</h3>
              <div className="flex items-center gap-6 mb-6">
                <div className="text-5xl font-semibold text-[#0071e3] tracking-tight">{overallProgress}%</div>
                <div className="flex-1">
                  <div className="h-3 bg-[#f5f5f7] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0071e3] rounded-full transition-all duration-500"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                  <p className="text-3xl font-semibold text-[#34c759] tracking-tight">{statusCounts.completed}</p>
                  <p className="text-sm text-[#6e6e73] mt-1">Completed</p>
                </div>
                <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                  <p className="text-3xl font-semibold text-[#0071e3] tracking-tight">{statusCounts.in_progress}</p>
                  <p className="text-sm text-[#6e6e73] mt-1">In Progress</p>
                </div>
                <div className="bg-[#86868b]/10 rounded-2xl p-5 text-center">
                  <p className="text-3xl font-semibold text-[#86868b] tracking-tight">{statusCounts.planned}</p>
                  <p className="text-sm text-[#6e6e73] mt-1">Planned</p>
                </div>
              </div>
            </div>

            {/* Budget Transparency */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-5">Budget Transparency</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#f5f5f7] rounded-2xl p-5 text-center">
                  <p className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
                    ${budgetData.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#6e6e73] mt-1">Total Budget</p>
                </div>
                <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                  <p className="text-3xl font-semibold text-[#0071e3] tracking-tight">
                    ${budgetData.allocated.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#6e6e73] mt-1">Allocated</p>
                </div>
                <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                  <p className="text-3xl font-semibold text-[#34c759] tracking-tight">
                    ${budgetData.spent.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#6e6e73] mt-1">Spent</p>
                </div>
              </div>

              {/* Budget Categories */}
              <h4 className="text-base font-semibold text-[#1d1d1f] mb-4">By Category</h4>
              <div className="space-y-5">
                {budgetData.categories.map((cat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#1d1d1f] font-medium">{cat.name}</span>
                      <span className="text-[#86868b]">
                        ${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()}
                        <span className="ml-2 text-[#0071e3]">
                          ({Math.round((cat.spent / cat.allocated) * 100)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0071e3] rounded-full transition-all duration-500"
                        style={{ width: `${(cat.spent / cat.allocated) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meeting Minutes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-5">Recent Meeting Minutes</h3>
              <div className="space-y-3">
                {[
                  { date: 'Jan 21, 2026', title: 'Senate Meeting #15', type: 'Senate' },
                  { date: 'Jan 14, 2026', title: 'Senate Meeting #14', type: 'Senate' },
                  { date: 'Jan 12, 2026', title: 'Executive Committee', type: 'Executive' },
                  { date: 'Jan 7, 2026', title: 'Finance Committee', type: 'Committee' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#f5f5f7] rounded-xl">
                    <div>
                      <p className="font-medium text-[#1d1d1f]">{item.title}</p>
                      <p className="text-sm text-[#86868b]">{item.date}</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-[#0071e3] hover:bg-[#0071e3]/10 rounded-full transition-colors">
                      View
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-5 px-5 py-3 text-sm font-medium text-[#0071e3] bg-[#0071e3]/10 hover:bg-[#0071e3]/20 rounded-full transition-colors">
                View All Minutes
              </button>
            </div>

            {/* Voting Records */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-5">Recent Votes</h3>
              <div className="space-y-3">
                {[
                  { title: 'Resolution 2026-08: Mental Health Funding', result: 'Passed', votes: '42-3-1' },
                  { title: 'Resolution 2026-07: Textbook Affordability', result: 'Passed', votes: '44-1-1' },
                  { title: 'Bill 2026-04: Student Org Funding Increase', result: 'Passed', votes: '40-5-1' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#f5f5f7] rounded-xl">
                    <div>
                      <p className="font-medium text-[#1d1d1f]">{item.title}</p>
                      <p className="text-sm text-[#86868b]">Vote: {item.votes}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.result === 'Passed'
                        ? 'bg-[#34c759]/10 text-[#34c759]'
                        : 'bg-[#ff3b30]/10 text-[#ff3b30]'
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
              <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
                SG Weekly Newsletter
              </h2>
              <p className="text-[#6e6e73]">
                Your weekly digest of Student Government activities
              </p>
            </div>

            {/* Subscribe */}
            {!subscribed ? (
              <div className="bg-[#0071e3]/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">Subscribe to SG Weekly</h3>
                <p className="text-[#6e6e73] mb-5">
                  Get weekly updates on Student Government activities delivered to your inbox.
                </p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="your.email@unc.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent"
                  />
                  <button
                    onClick={() => setSubscribed(true)}
                    className="px-6 py-3 bg-[#0071e3] text-white font-medium rounded-full hover:bg-[#0077ed] transition-colors"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#34c759]/10 rounded-2xl p-5">
                <p className="text-[#34c759] font-medium">
                  You're subscribed! Check your inbox for a confirmation email.
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3] tracking-tight">8,900</p>
                <p className="text-sm text-[#6e6e73] mt-1">Subscribers</p>
              </div>
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#af52de] tracking-tight">34%</p>
                <p className="text-sm text-[#6e6e73] mt-1">Open Rate</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759] tracking-tight">24</p>
                <p className="text-sm text-[#6e6e73] mt-1">Editions</p>
              </div>
            </div>

            {/* Archive */}
            <div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">
                Newsletter Archive
              </h3>
              <div className="space-y-3">
                {[
                  { date: 'Jan 24, 2026', title: 'Spring Semester Kickoff', highlights: 'New initiatives, town hall schedule' },
                  { date: 'Jan 17, 2026', title: 'Welcome Back Issue', highlights: 'Budget update, registration reform progress' },
                  { date: 'Dec 13, 2025', title: 'Fall Semester Wrap-Up', highlights: 'Accomplishments, goals for spring' },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1d1d1f]">{item.title}</p>
                      <p className="text-sm text-[#86868b] mt-1">{item.date} | {item.highlights}</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-[#0071e3] hover:bg-[#0071e3]/10 rounded-full transition-colors">
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
              <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
                Town Hall Series
              </h2>
              <p className="text-[#6e6e73]">
                Direct conversations between students and leadership
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3] tracking-tight">8</p>
                <p className="text-sm text-[#6e6e73] mt-1">Town Halls Held</p>
              </div>
              <div className="bg-[#ff9500]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#ff9500] tracking-tight">456</p>
                <p className="text-sm text-[#6e6e73] mt-1">Total Attendance</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759] tracking-tight">234</p>
                <p className="text-sm text-[#6e6e73] mt-1">Questions Answered</p>
              </div>
            </div>

            {/* Upcoming */}
            <div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">
                Upcoming Town Halls
              </h3>
              <div className="space-y-4">
                {townHallEvents.map(event => (
                  <div key={event.id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-[#1d1d1f]">{event.title}</h4>
                        <p className="text-sm text-[#6e6e73] mt-1">{event.date} at {event.time}</p>
                        <p className="text-sm text-[#86868b]">{event.location}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {event.topics.map((topic, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-[#0071e3]/10 text-[#0071e3] rounded-full text-xs font-medium"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button className="px-5 py-2.5 bg-[#0071e3] text-white text-sm font-medium rounded-full hover:bg-[#0077ed] transition-colors">
                        RSVP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Question */}
            <div className="bg-[#0071e3]/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">Submit a Question</h3>
              <p className="text-[#6e6e73] mb-5">
                Can't attend? Submit your question ahead of time and we'll address it.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Your question..."
                  className="flex-1 px-4 py-3 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent"
                />
                <button className="px-6 py-3 bg-[#0071e3] text-white font-medium rounded-full hover:bg-[#0077ed] transition-colors">
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
              <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
                Campus Pulse Surveys
              </h2>
              <p className="text-[#6e6e73]">
                Your voice shapes our priorities
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#0071e3] tracking-tight">12</p>
                <p className="text-sm text-[#6e6e73] mt-1">Surveys Conducted</p>
              </div>
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#af52de] tracking-tight">3,400</p>
                <p className="text-sm text-[#6e6e73] mt-1">Total Responses</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-3xl font-semibold text-[#34c759] tracking-tight">45</p>
                <p className="text-sm text-[#6e6e73] mt-1">Insights Generated</p>
              </div>
            </div>

            {/* Active Survey */}
            <div className="bg-gradient-to-r from-[#0071e3] to-[#0077ed] text-white rounded-2xl p-8">
              <h3 className="text-2xl font-semibold tracking-tight mb-2">
                Current Survey: Spring Priorities
              </h3>
              <p className="text-blue-100 mb-6">
                Help us understand what matters most to you this semester.
              </p>
              <button className="px-6 py-3 bg-white text-[#0071e3] font-medium rounded-full hover:bg-blue-50 transition-colors">
                Take Survey (5 min)
              </button>
            </div>

            {/* Past Results */}
            <div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-4">
                Recent Survey Results
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'Mental Health Services', date: 'Dec 2025', responses: 890, topFinding: '67% want extended CAPS hours' },
                  { title: 'Dining Hall Satisfaction', date: 'Nov 2025', responses: 1200, topFinding: '54% want more vegetarian options' },
                  { title: 'Campus Safety', date: 'Oct 2025', responses: 750, topFinding: '72% feel safe on campus at night' },
                ].map((survey, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-[#1d1d1f]">{survey.title}</h4>
                        <p className="text-sm text-[#86868b] mt-1">
                          {survey.date} | {survey.responses} responses
                        </p>
                        <p className="text-sm text-[#0071e3] font-medium mt-2">
                          Key Finding: {survey.topFinding}
                        </p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-[#0071e3] hover:bg-[#0071e3]/10 rounded-full transition-colors">
                        View Results
                      </button>
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
              <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
                Communications Policies
              </h2>
              <p className="text-[#6e6e73]">
                Track our department-specific initiatives and progress
              </p>
            </div>

            <div className="space-y-4">
              {deptPolicies.map(policy => (
                <div key={policy.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-[#1d1d1f]">{policy.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      policy.status === 'completed'
                        ? 'bg-[#34c759]/10 text-[#34c759]'
                        : policy.status === 'in_progress'
                          ? 'bg-[#0071e3]/10 text-[#0071e3]'
                          : 'bg-[#86868b]/10 text-[#86868b]'
                    }`}>
                      {policy.status === 'completed'
                        ? 'Completed'
                        : policy.status === 'in_progress'
                          ? 'In Progress'
                          : 'Planned'}
                    </span>
                  </div>
                  <p className="text-sm text-[#6e6e73] mb-4">{policy.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0071e3] rounded-full transition-all duration-500"
                        style={{ width: `${policy.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-[#0071e3]">{policy.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </Layout>
  )
}
