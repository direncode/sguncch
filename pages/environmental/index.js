import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button } from '../../components/FormInput'
import { useApp } from '../../lib/store'

export default function EnvironmentalPage() {
  const [activeTab, setActiveTab] = useState('carbon')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showCommitteeForm, setShowCommitteeForm] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const { policies } = useApp()

  const deptPolicies = policies.filter(p => p.department === 'environmental')

  return (
    <Layout>
      <Head>
        <title>Environmental | Project Bold</title>
      </Head>

      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🌱</span>
            <h1 className="text-3xl md:text-4xl font-bold">Environmental Affairs</h1>
          </div>
          <p className="text-emerald-100 max-w-2xl">
            Sustainability, climate action, and green initiatives. Building a more
            sustainable Carolina for future generations.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'carbon', label: 'Carbon Neutrality' },
              { id: 'dining', label: 'Sustainable Dining' },
              { id: 'greenfund', label: 'Green Fund' },
              { id: 'bikeshare', label: 'Bike Share' },
              { id: 'committee', label: 'Climate Committee' },
              { id: 'policies', label: 'All Policies' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
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
        {submitted && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              {submitted === 'project' && 'Your Green Fund application has been submitted! We will review and contact you within 2 weeks.'}
              {submitted === 'committee' && 'Thank you for your interest in the Climate Action Committee! We will reach out about next steps.'}
            </p>
            <button onClick={() => setSubmitted(null)} className="text-green-600 text-sm mt-2 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Carbon Neutrality Tab */}
        {activeTab === 'carbon' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Carbon Neutrality Push</h2>

            {/* Progress */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h3 className="font-bold text-[#13294B] mb-4">UNC Carbon Reduction Progress</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl font-bold text-emerald-600">12%</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Reduction from 2007 baseline</p>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Goal: Carbon neutrality by 2040</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600">890</p>
                <p className="text-sm text-gray-600">Petition Signatures</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">45</p>
                <p className="text-sm text-gray-600">Actions Taken</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">5</p>
                <p className="text-sm text-gray-600">Admin Meetings</p>
              </div>
            </div>

            {/* Take Action */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Take Action</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-emerald-600 text-white rounded-lg p-6">
                <h4 className="font-bold text-lg mb-2">Sign the Petition</h4>
                <p className="text-emerald-100 mb-4">Demand accelerated carbon neutrality timeline from university leadership.</p>
                <Button className="bg-white text-emerald-600 hover:bg-emerald-50">Sign Now</Button>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h4 className="font-bold text-lg text-[#13294B] mb-2">Contact Administration</h4>
                <p className="text-gray-600 mb-4">Send a pre-written email to the Chancellor's office.</p>
                <Button variant="secondary">Send Email</Button>
              </div>
            </div>

            {/* Impact Calculator */}
            <div className="mt-8 bg-emerald-50 rounded-lg p-6 border border-emerald-200">
              <h3 className="font-bold text-emerald-800 mb-4">Calculate Your Impact</h3>
              <p className="text-sm text-emerald-700 mb-4">See how your daily choices affect carbon emissions.</p>
              <Button>Open Calculator</Button>
            </div>
          </div>
        )}

        {/* Sustainable Dining Tab */}
        {activeTab === 'dining' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Sustainable Dining Initiative</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600">45,000</p>
                <p className="text-sm text-gray-600">Plastics Reduced</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-600">Dining Locations</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">4.1/5</p>
                <p className="text-sm text-gray-600">Satisfaction</p>
              </div>
            </div>

            {/* Initiatives */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Current Initiatives</h3>
            <div className="space-y-4 mb-8">
              {[
                { name: 'Reusable Container Program', status: 'Active', locations: 'All dining halls', progress: 75 },
                { name: 'Compostable Utensils', status: 'Active', locations: 'Lenoir, Chase', progress: 60 },
                { name: 'Trayless Dining', status: 'Pilot', locations: 'Lenoir', progress: 40 },
                { name: 'Local Food Sourcing', status: 'Expanding', locations: 'Ram\'s Head', progress: 55 },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-[#13294B]">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.locations}</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">{item.status}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback */}
            <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
              <h3 className="font-bold text-emerald-800 mb-2">Share Your Feedback</h3>
              <p className="text-sm text-emerald-700 mb-4">Help us improve sustainable dining options.</p>
              <Button>Give Feedback</Button>
            </div>
          </div>
        )}

        {/* Green Fund Tab */}
        {activeTab === 'greenfund' && (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#13294B]">Green Fund</h2>
                <p className="text-gray-600 mt-1">Student-funded grants for sustainability projects</p>
              </div>
              <Button onClick={() => setShowProjectForm(true)}>Apply for Funding</Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600">$156K</p>
                <p className="text-sm text-gray-600">Total Funded</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">23</p>
                <p className="text-sm text-gray-600">Projects Funded</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">45</p>
                <p className="text-sm text-gray-600">Applications</p>
              </div>
            </div>

            {/* Funded Projects */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Recently Funded Projects</h3>
            <div className="space-y-4 mb-8">
              {[
                { name: 'Solar Panel Installation - Davis Library', amount: 25000, org: 'Facilities Services' },
                { name: 'Campus Composting Bins', amount: 8500, org: 'Sustainability Office' },
                { name: 'Native Plant Garden', amount: 5000, org: 'Environmental Sciences Club' },
                { name: 'E-Bike Fleet Expansion', amount: 15000, org: 'Transportation' },
              ].map((project, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#13294B]">{project.name}</h4>
                    <p className="text-sm text-gray-500">{project.org}</p>
                  </div>
                  <span className="text-emerald-600 font-bold">${project.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Project Form Modal */}
            {showProjectForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Green Fund Application</h3>
                  <form onSubmit={(e) => { e.preventDefault(); setSubmitted('project'); setShowProjectForm(false); }} className="space-y-4">
                    <Input label="Project Title" required />
                    <Input label="Your Name" required />
                    <Input label="Email" type="email" required />
                    <Input label="Organization/Department" required />
                    <Input label="Funding Requested ($)" type="number" required />
                    <Textarea label="Project Description" required rows={4} />
                    <Textarea label="Environmental Impact" required rows={3} />
                    <div className="flex gap-3">
                      <Button type="submit">Submit Application</Button>
                      <Button variant="secondary" onClick={() => setShowProjectForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bike Share Tab */}
        {activeTab === 'bikeshare' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Bike Share Program</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600">89</p>
                <p className="text-sm text-gray-600">Bikes Available</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-600">Stations</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">4,500</p>
                <p className="text-sm text-gray-600">Rides This Month</p>
              </div>
            </div>

            {/* Station Map */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h3 className="font-bold text-[#13294B] mb-4">Station Locations</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { name: 'Student Union', bikes: 12, available: 8 },
                  { name: 'Davis Library', bikes: 10, available: 6 },
                  { name: 'Rams Head', bikes: 8, available: 5 },
                  { name: 'Friday Center', bikes: 6, available: 3 },
                  { name: 'Morrison', bikes: 8, available: 7 },
                  { name: 'Carmichael', bikes: 10, available: 4 },
                ].map((station, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-[#13294B]">{station.name}</p>
                    <p className="text-sm text-emerald-600">{station.available}/{station.bikes} available</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Use */}
            <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
              <h3 className="font-bold text-emerald-800 mb-4">How to Use</h3>
              <ol className="space-y-2 text-emerald-700">
                <li>1. Download the UNC Bike Share app</li>
                <li>2. Create an account with your UNC email</li>
                <li>3. Find an available bike at any station</li>
                <li>4. Scan the QR code to unlock</li>
                <li>5. Return to any station when done</li>
              </ol>
              <Button className="mt-4">Download App</Button>
            </div>
          </div>
        )}

        {/* Climate Committee Tab */}
        {activeTab === 'committee' && (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#13294B]">Climate Action Committee</h2>
                <p className="text-gray-600 mt-1">Student committee advising on campus climate policy</p>
              </div>
              <Button onClick={() => setShowCommitteeForm(true)}>Join Committee</Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600">15</p>
                <p className="text-sm text-gray-600">Members</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-600">Meetings</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">8</p>
                <p className="text-sm text-gray-600">Initiatives</p>
              </div>
            </div>

            {/* Current Initiatives */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Current Initiatives</h3>
            <div className="space-y-4 mb-8">
              {[
                'Advocating for 100% renewable energy by 2035',
                'Expanding campus EV charging infrastructure',
                'Implementing green building standards for new construction',
                'Creating sustainability curriculum requirements',
              ].map((initiative, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                  <span className="text-emerald-500 text-xl">✓</span>
                  <span className="text-[#13294B]">{initiative}</span>
                </div>
              ))}
            </div>

            {/* Meeting Schedule */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-[#13294B] mb-4">Next Meeting</h3>
              <p className="text-lg font-medium text-emerald-600">February 5, 2026 at 5:00 PM</p>
              <p className="text-gray-500">Student Union Room 3407</p>
              <p className="text-sm text-gray-400 mt-2">Meetings are open to all students</p>
            </div>

            {/* Committee Form Modal */}
            {showCommitteeForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Join Climate Action Committee</h3>
                  <form onSubmit={(e) => { e.preventDefault(); setSubmitted('committee'); setShowCommitteeForm(false); }} className="space-y-4">
                    <Input label="Full Name" required />
                    <Input label="Email" type="email" required />
                    <Input label="PID" required />
                    <Select label="Year" required options={[
                      { value: 'freshman', label: 'First Year' },
                      { value: 'sophomore', label: 'Sophomore' },
                      { value: 'junior', label: 'Junior' },
                      { value: 'senior', label: 'Senior' },
                      { value: 'grad', label: 'Graduate' },
                    ]} />
                    <Input label="Major" required />
                    <Textarea label="Why do you want to join?" required rows={3} />
                    <div className="flex gap-3">
                      <Button type="submit">Apply</Button>
                      <Button variant="secondary" onClick={() => setShowCommitteeForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Policies Tab */}
        {activeTab === 'policies' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Environmental Policies</h2>
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
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${policy.progress}%` }} />
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
