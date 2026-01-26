import { useState, useEffect } from 'react'
import Head from 'next/head'

const departments = [
  { id: 'wellness', name: 'Student Wellness', icon: '🏥', color: 'bg-green-500' },
  { id: 'basic-needs', name: 'Basic Needs', icon: '🍎', color: 'bg-orange-500' },
  { id: 'academic', name: 'Academic Affairs', icon: '📚', color: 'bg-blue-500' },
  { id: 'civic', name: 'Civic Engagement', icon: '🗳️', color: 'bg-purple-500' },
  { id: 'communications', name: 'Communications', icon: '📢', color: 'bg-yellow-500' },
  { id: 'dei', name: 'DEI', icon: '🤝', color: 'bg-pink-500' },
  { id: 'environmental', name: 'Environmental', icon: '🌱', color: 'bg-emerald-500' },
  { id: 'state-external', name: 'State & External', icon: '🏛️', color: 'bg-indigo-500' },
]

const allPolicies = [
  // Student Wellness (5 policies)
  { id: 1, department: 'wellness', title: 'Student Wellness Button', description: 'One-click Canvas LTI button connecting students to CAPS, Counseling, and wellness resources', status: 'in_progress', priority: 'high' },
  { id: 2, department: 'wellness', title: 'Mental Health First Aid', description: 'Training program for student leaders and RAs on mental health crisis response', status: 'planned', priority: 'high' },
  { id: 3, department: 'wellness', title: 'Wellness Ambassadors', description: 'Peer support network promoting mental health awareness across campus', status: 'planned', priority: 'medium' },
  { id: 4, department: 'wellness', title: 'CAPS Expansion', description: 'Advocate for expanded CAPS hours and additional counselors', status: 'planned', priority: 'high' },
  { id: 5, department: 'wellness', title: 'Crisis Text Line', description: 'Partner with Crisis Text Line for 24/7 text-based support', status: 'planned', priority: 'medium' },

  // Basic Needs (5 policies)
  { id: 6, department: 'basic-needs', title: 'Carolina Cupboard Expansion', description: 'Expand food pantry hours and locations across campus', status: 'in_progress', priority: 'high' },
  { id: 7, department: 'basic-needs', title: 'Emergency Housing Fund', description: 'Create emergency fund for students facing housing insecurity', status: 'planned', priority: 'high' },
  { id: 8, department: 'basic-needs', title: 'Textbook Affordability', description: 'Expand OER adoption and textbook lending library', status: 'planned', priority: 'medium' },
  { id: 9, department: 'basic-needs', title: 'Technology Loaner Program', description: 'Provide laptops and hotspots to students in need', status: 'in_progress', priority: 'high' },
  { id: 10, department: 'basic-needs', title: 'Financial Literacy', description: 'Workshops on budgeting, credit, and financial aid', status: 'planned', priority: 'medium' },

  // Academic Affairs (5 policies)
  { id: 11, department: 'academic', title: 'Course Registration Reform', description: 'Advocate for improved registration system and waitlist transparency', status: 'planned', priority: 'high' },
  { id: 12, department: 'academic', title: 'Academic Advising Enhancement', description: 'Push for more accessible and consistent advising across departments', status: 'planned', priority: 'medium' },
  { id: 13, department: 'academic', title: 'Research Opportunities', description: 'Create database of undergraduate research positions', status: 'planned', priority: 'medium' },
  { id: 14, department: 'academic', title: 'Syllabus Transparency', description: 'Require syllabi to be available before registration', status: 'planned', priority: 'low' },
  { id: 15, department: 'academic', title: 'Credit Transfer Portal', description: 'Streamline transfer credit evaluation process', status: 'planned', priority: 'medium' },

  // Civic Engagement (5 policies)
  { id: 16, department: 'civic', title: 'Voter Registration Drives', description: 'Coordinate campus-wide voter registration before elections', status: 'in_progress', priority: 'high' },
  { id: 17, department: 'civic', title: 'Civic Fellows Program', description: 'Fellowship connecting students with local government internships', status: 'planned', priority: 'medium' },
  { id: 18, department: 'civic', title: 'Town-Gown Relations', description: 'Strengthen partnership with Chapel Hill and Carrboro', status: 'planned', priority: 'medium' },
  { id: 19, department: 'civic', title: 'Election Day Transit', description: 'Free transit to polling locations on election days', status: 'planned', priority: 'high' },
  { id: 20, department: 'civic', title: 'Democracy Week', description: 'Annual week of civic education and engagement events', status: 'planned', priority: 'low' },

  // Communications (5 policies)
  { id: 21, department: 'communications', title: 'SG Weekly Newsletter', description: 'Regular updates on Student Government activities and wins', status: 'in_progress', priority: 'high' },
  { id: 22, department: 'communications', title: 'Town Hall Series', description: 'Monthly open forums for student feedback', status: 'planned', priority: 'medium' },
  { id: 23, department: 'communications', title: 'Social Media Revamp', description: 'Modernize SG social media presence and engagement', status: 'in_progress', priority: 'medium' },
  { id: 24, department: 'communications', title: 'Transparency Dashboard', description: 'Public dashboard showing SG budget and policy progress', status: 'planned', priority: 'high' },
  { id: 25, department: 'communications', title: 'Campus Pulse Surveys', description: 'Regular surveys to gauge student opinion on key issues', status: 'planned', priority: 'medium' },

  // DEI (5 policies)
  { id: 26, department: 'dei', title: 'Cultural Center Support', description: 'Advocate for increased funding for cultural centers', status: 'planned', priority: 'high' },
  { id: 27, department: 'dei', title: 'Inclusive Excellence Awards', description: 'Recognize students and orgs advancing DEI on campus', status: 'planned', priority: 'low' },
  { id: 28, department: 'dei', title: 'First-Gen Support Network', description: 'Mentorship and resources for first-generation students', status: 'in_progress', priority: 'high' },
  { id: 29, department: 'dei', title: 'Accessibility Audit', description: 'Review campus accessibility and advocate for improvements', status: 'planned', priority: 'medium' },
  { id: 30, department: 'dei', title: 'Bias Response Training', description: 'Training for student leaders on responding to bias incidents', status: 'planned', priority: 'medium' },

  // Environmental (5 policies)
  { id: 31, department: 'environmental', title: 'Carbon Neutrality Push', description: 'Advocate for accelerated carbon neutrality timeline', status: 'planned', priority: 'high' },
  { id: 32, department: 'environmental', title: 'Sustainable Dining', description: 'Reduce single-use plastics in dining halls', status: 'in_progress', priority: 'medium' },
  { id: 33, department: 'environmental', title: 'Green Fund Expansion', description: 'Increase student green fund for sustainability projects', status: 'planned', priority: 'medium' },
  { id: 34, department: 'environmental', title: 'Bike Share Program', description: 'Expand campus bike share availability', status: 'planned', priority: 'low' },
  { id: 35, department: 'environmental', title: 'Climate Action Committee', description: 'Student committee advising on campus climate policy', status: 'planned', priority: 'high' },

  // State & External (5 policies)
  { id: 36, department: 'state-external', title: 'Tuition Advocacy', description: 'Lobby General Assembly against tuition increases', status: 'in_progress', priority: 'high' },
  { id: 37, department: 'state-external', title: 'UNC System Coalition', description: 'Coordinate with other UNC system student governments', status: 'planned', priority: 'medium' },
  { id: 38, department: 'state-external', title: 'Legislative Lobby Day', description: 'Annual trip to Raleigh to advocate for higher ed funding', status: 'planned', priority: 'high' },
  { id: 39, department: 'state-external', title: 'Board of Trustees Liaison', description: 'Strengthen student voice in BOT meetings', status: 'planned', priority: 'medium' },
  { id: 40, department: 'state-external', title: 'Federal Advocacy', description: 'Engage with federal representatives on student issues', status: 'planned', priority: 'low' },
]

export default function Home() {
  const [selectedDept, setSelectedDept] = useState(null)
  const [policies, setPolicies] = useState(allPolicies)

  const filteredPolicies = selectedDept
    ? policies.filter(p => p.department === selectedDept)
    : policies

  const stats = {
    total: policies.length,
    inProgress: policies.filter(p => p.status === 'in_progress').length,
    planned: policies.filter(p => p.status === 'planned').length,
    completed: policies.filter(p => p.status === 'completed').length,
  }

  return (
    <>
      <Head>
        <title>Project Bold | UNC Student Government</title>
        <meta name="description" content="First, Best, For All - UNC Student Government Policy Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-[#13294B] text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Project Bold</h1>
                <p className="text-[#4B9CD3] mt-1">First, Best, For All</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">UNC Student Government</p>
                <p className="text-sm opacity-80">2026-2027</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Banner */}
        <div className="bg-[#4B9CD3] text-white py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-sm opacity-90">Total Policies</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.inProgress}</p>
                <p className="text-sm opacity-90">In Progress</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.planned}</p>
                <p className="text-sm opacity-90">Planned</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.completed}</p>
                <p className="text-sm opacity-90">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Values */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#13294B] mb-4">Our Values</h2>
            <div className="flex flex-wrap gap-2">
              {['Courage', 'Community', 'Accountability', 'Equity', 'Innovation'].map(value => (
                <span key={value} className="px-4 py-2 bg-white rounded-full shadow text-[#13294B] font-medium">
                  {value}
                </span>
              ))}
            </div>
          </section>

          {/* Departments */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#13294B] mb-4">Departments</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {departments.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(selectedDept === dept.id ? null : dept.id)}
                  className={`p-4 rounded-lg text-left transition-all ${
                    selectedDept === dept.id
                      ? 'bg-[#13294B] text-white shadow-lg scale-105'
                      : 'bg-white shadow hover:shadow-md'
                  }`}
                >
                  <span className="text-2xl">{dept.icon}</span>
                  <p className="mt-2 font-medium text-sm">{dept.name}</p>
                  <p className="text-xs opacity-70">
                    {allPolicies.filter(p => p.department === dept.id).length} policies
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Policies */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#13294B]">
                {selectedDept
                  ? `${departments.find(d => d.id === selectedDept)?.name} Policies`
                  : 'All Policies'}
              </h2>
              {selectedDept && (
                <button
                  onClick={() => setSelectedDept(null)}
                  className="text-sm text-[#4B9CD3] hover:underline"
                >
                  View All
                </button>
              )}
            </div>
            <div className="grid gap-4">
              {filteredPolicies.map(policy => (
                <div key={policy.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {departments.find(d => d.id === policy.department)?.icon}
                        </span>
                        <h3 className="font-semibold text-[#13294B]">{policy.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{policy.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        policy.status === 'completed' ? 'bg-green-100 text-green-800' :
                        policy.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {policy.status === 'in_progress' ? 'In Progress' :
                         policy.status === 'completed' ? 'Completed' : 'Planned'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        policy.priority === 'high' ? 'bg-red-50 text-red-700' :
                        policy.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {policy.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-[#13294B] text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-[#4B9CD3] font-semibold mb-2">Project Bold</p>
            <p className="text-sm opacity-80">First, Best, For All</p>
            <p className="text-sm opacity-60 mt-4">UNC Student Government 2026-2027</p>
          </div>
        </footer>
      </div>
    </>
  )
}
