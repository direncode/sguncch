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
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📢</span>
            <h1 className="text-3xl md:text-4xl font-bold">Communications</h1>
          </div>
          <p className="text-yellow-100 max-w-2xl">
            Outreach, transparency, and student voice. Stay informed about what Student Government
            is doing for you.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
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
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Transparency Dashboard Tab */}
        {activeTab === 'transparency' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Transparency Dashboard</h2>

            {/* Overall Progress */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h3 className="font-bold text-[#13294B] mb-4">Overall Policy Progress</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl font-bold text-[#4B9CD3]">{overallProgress}%</div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4B9CD3] rounded-full" style={{ width: `${overallProgress}%` }} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-blue-600">{statusCounts.in_progress}</p>
                  <p className="text-xs text-gray-600">In Progress</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-gray-600">{statusCounts.planned}</p>
                  <p className="text-xs text-gray-600">Planned</p>
                </div>
              </div>
            </div>

            {/* Budget Transparency */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h3 className="font-bold text-[#13294B] mb-4">Budget Transparency</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-[#13294B]">${budgetData.total.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Budget</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-[#4B9CD3]">${budgetData.allocated.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Allocated</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">${budgetData.spent.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Spent</p>
                </div>
              </div>

              {/* Budget Categories */}
              <h4 className="font-medium text-[#13294B] mb-3">By Category</h4>
              <div className="space-y-4">
                {budgetData.categories.map((cat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{cat.name}</span>
                      <span className="text-gray-500">
                        ${cat.spent.toLocaleString()} / ${cat.allocated.toLocaleString()}
                        ({Math.round((cat.spent / cat.allocated) * 100)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full transition-all"
                        style={{ width: `${(cat.spent / cat.allocated) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meeting Minutes */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h3 className="font-bold text-[#13294B] mb-4">Recent Meeting Minutes</h3>
              <div className="space-y-3">
                {[
                  { date: 'Jan 21, 2026', title: 'Senate Meeting #15', type: 'Senate' },
                  { date: 'Jan 14, 2026', title: 'Senate Meeting #14', type: 'Senate' },
                  { date: 'Jan 12, 2026', title: 'Executive Committee', type: 'Executive' },
                  { date: 'Jan 7, 2026', title: 'Finance Committee', type: 'Committee' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#13294B]">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                    <Button variant="secondary">View</Button>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="w-full mt-4">View All Minutes</Button>
            </div>

            {/* Voting Records */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-[#13294B] mb-4">Recent Votes</h3>
              <div className="space-y-3">
                {[
                  { title: 'Resolution 2026-08: Mental Health Funding', result: 'Passed', votes: '42-3-1' },
                  { title: 'Resolution 2026-07: Textbook Affordability', result: 'Passed', votes: '44-1-1' },
                  { title: 'Bill 2026-04: Student Org Funding Increase', result: 'Passed', votes: '40-5-1' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#13294B]">{item.title}</p>
                      <p className="text-sm text-gray-500">Vote: {item.votes}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm ${
                      item.result === 'Passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">SG Weekly Newsletter</h2>

            {/* Subscribe */}
            {!subscribed ? (
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200 mb-8">
                <h3 className="font-bold text-yellow-800 mb-2">Subscribe to SG Weekly</h3>
                <p className="text-sm text-yellow-700 mb-4">Get weekly updates on Student Government activities delivered to your inbox.</p>
                <div className="flex gap-3">
                  <Input
                    placeholder="your.email@unc.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={() => setSubscribed(true)}>Subscribe</Button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-8">
                <p className="text-green-800">You're subscribed! Check your inbox for a confirmation email.</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">8,900</p>
                <p className="text-sm text-gray-600">Subscribers</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">34%</p>
                <p className="text-sm text-gray-600">Open Rate</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">24</p>
                <p className="text-sm text-gray-600">Editions</p>
              </div>
            </div>

            {/* Archive */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Newsletter Archive</h3>
            <div className="space-y-3">
              {[
                { date: 'Jan 24, 2026', title: 'Spring Semester Kickoff', highlights: 'New initiatives, town hall schedule' },
                { date: 'Jan 17, 2026', title: 'Welcome Back Issue', highlights: 'Budget update, registration reform progress' },
                { date: 'Dec 13, 2025', title: 'Fall Semester Wrap-Up', highlights: 'Accomplishments, goals for spring' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#13294B]">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.date} | {item.highlights}</p>
                  </div>
                  <Button variant="secondary">Read</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Town Halls Tab */}
        {activeTab === 'townhalls' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Town Hall Series</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">8</p>
                <p className="text-sm text-gray-600">Town Halls Held</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">456</p>
                <p className="text-sm text-gray-600">Total Attendance</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">234</p>
                <p className="text-sm text-gray-600">Questions Answered</p>
              </div>
            </div>

            {/* Upcoming */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Upcoming Town Halls</h3>
            <div className="space-y-4 mb-8">
              {townHallEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-[#13294B]">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                      <p className="text-sm text-gray-500">{event.location}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {event.topics.map((topic, i) => (
                          <span key={i} className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded text-xs">{topic}</span>
                        ))}
                      </div>
                    </div>
                    <Button>RSVP</Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Question */}
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="font-bold text-yellow-800 mb-2">Submit a Question</h3>
              <p className="text-sm text-yellow-700 mb-4">Can't attend? Submit your question ahead of time.</p>
              <div className="flex gap-3">
                <Input placeholder="Your question..." className="flex-1" />
                <Button>Submit</Button>
              </div>
            </div>
          </div>
        )}

        {/* Campus Pulse Tab */}
        {activeTab === 'surveys' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Campus Pulse Surveys</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">12</p>
                <p className="text-sm text-gray-600">Surveys Conducted</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">3,400</p>
                <p className="text-sm text-gray-600">Total Responses</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">45</p>
                <p className="text-sm text-gray-600">Insights Generated</p>
              </div>
            </div>

            {/* Active Survey */}
            <div className="bg-yellow-600 text-white rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-2">Current Survey: Spring Priorities</h3>
              <p className="text-yellow-100 mb-4">Help us understand what matters most to you this semester.</p>
              <Button className="bg-white text-yellow-600 hover:bg-yellow-50">Take Survey (5 min)</Button>
            </div>

            {/* Past Results */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Recent Survey Results</h3>
            <div className="space-y-4">
              {[
                { title: 'Mental Health Services', date: 'Dec 2025', responses: 890, topFinding: '67% want extended CAPS hours' },
                { title: 'Dining Hall Satisfaction', date: 'Nov 2025', responses: 1200, topFinding: '54% want more vegetarian options' },
                { title: 'Campus Safety', date: 'Oct 2025', responses: 750, topFinding: '72% feel safe on campus at night' },
              ].map((survey, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-[#13294B]">{survey.title}</h4>
                      <p className="text-sm text-gray-500">{survey.date} | {survey.responses} responses</p>
                      <p className="text-sm text-yellow-600 mt-1">Key Finding: {survey.topFinding}</p>
                    </div>
                    <Button variant="secondary">View Results</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Policies Tab */}
        {activeTab === 'policies' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Communications Policies</h2>
            <div className="space-y-4">
              {deptPolicies.map(policy => (
                <div key={policy.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-[#13294B]">{policy.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      policy.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {policy.status === 'in_progress' ? 'In Progress' : 'Planned'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${policy.progress}%` }} />
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
